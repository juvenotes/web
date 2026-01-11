import { test } from '@japa/runner'
import User from '#models/user'
import Event from '#models/event'
import EventQuiz from '#models/event_quiz'
import Question from '#models/question'
import McqChoice from '#models/mcq_choice'
import { QuizLeaderboardService } from '#services/quiz_leaderboard_service'
import UserProgressService from '#services/user_progress_service'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { QuestionType } from '#enums/question_types'

test.group('Leaderboard Logic Reproduction', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('Standard Mode: Prevent Duplicate/Accumulated Scores on Retake', async ({ assert }) => {
    // 1. Setup Quiz in Standard Mode
    const user = await User.create({
      fullName: 'Test Student',
      email: 'test@example.com',
      password: 'password',
    })
    const event = await Event.create({
      title: 'Test Event',
      slug: 'test-event-repro',
      status: 'published',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 1 }),
    })
    const quiz = await EventQuiz.create({
      eventId: event.id,
      title: 'Standard Quiz',
      slug: 'std-quiz',
      status: 'published',
      quizMode: 'standard',
    })

    // Create Question
    const question = await Question.create({
      eventQuizId: quiz.id,
      questionText: 'Q1',
      type: QuestionType.MCQ,
    })
    const choiceCorrect = await McqChoice.create({
      questionId: question.id,
      choiceText: 'Correct',
      isCorrect: true,
    })

    // 2. User answers Correctly (Attempt 1)
    // Simulate Attempt 1 (Standard Mode = sessionId null)
    await UserProgressService.prototype.recordEventQuizAttempt
      .call(
        {
          calculateEventQuizStats: async () => {},
          shouldUpdateStreak: async () => false,
          studyTimeService: { recordActivity: async () => {} },
        },
        user.id,
        quiz.id,
        question.id,
        choiceCorrect.id,
        true,
        null
      )
      .catch(() => {})

    // Manually trigger stats calculation to verify
    let stats = await QuizLeaderboardService.calculateQuizStatsFromResponses(user.id, quiz.id, null)
    assert.equal(stats.score, 100, 'Score should be 100% after 1 correct answer (1/1)')

    // 3. User attempts DIFFERENT answer (force duplicate)
    await db.table('user_mcq_responses').insert({
      user_id: user.id,
      question_id: question.id,
      choice_id: choiceCorrect.id,
      is_correct: true,
      source: 'event_quiz',
      created_at: new Date(),
      updated_at: new Date(),
    })

    // 4. Calculate Stats again
    stats = await QuizLeaderboardService.calculateQuizStatsFromResponses(user.id, quiz.id, null)

    // IF inaccurate, it might count 2 correct answers for 1 question -> 200%?
    // We assert it should be 100 (capped/deduped)
    assert.equal(stats.score, 100, 'Score should NOT exceed 100% even with duplicates')
  })

  test('Mode Switching: Lockdown (Session) -> Standard (No Session) Accumulation', async ({
    assert,
  }) => {
    const user = await User.create({
      fullName: 'Mode Switcher',
      email: 'mode@example.com',
      password: 'password',
    })
    const event = await Event.create({
      title: 'Mode Event',
      slug: 'mode-event',
      status: 'published',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 1 }),
    })
    const quiz = await EventQuiz.create({
      eventId: event.id,
      title: 'Hybrid Quiz',
      slug: 'hybrid-quiz',
      status: 'published',
      quizMode: 'timed_lockdown',
    })

    // Question
    const question = await Question.create({
      eventQuizId: quiz.id,
      questionText: 'Q1',
      type: QuestionType.MCQ,
    })
    const choiceCorrect = await McqChoice.create({
      questionId: question.id,
      choiceText: 'Correct',
      isCorrect: true,
    })

    // 1. Attempt in Lockdown Mode (Session 1)
    const sessionId = 1
    await db.table('user_mcq_responses').insert({
      user_id: user.id,
      question_id: question.id,
      choice_id: choiceCorrect.id,
      is_correct: true,
      source: 'event_quiz',
      session_id: sessionId,
      created_at: new Date(),
      updated_at: new Date(),
    })

    // 2. Switch Quiz to Standard Mode
    quiz.quizMode = 'standard'
    await quiz.save()

    // 3. Calculate Stats in Standard Mode (sessionId passed as null)
    const stats = await QuizLeaderboardService.calculateQuizStatsFromResponses(
      user.id,
      quiz.id,
      null
    )

    // It SHOULD capture the previous session response if we are in "Standard Mode" (history mode)
    assert.equal(stats.score, 100, 'Should include past session responses in standard mode?')

    // 4. User answers AGAIN in Standard Mode (sessionId null)
    await db.table('user_mcq_responses').insert({
      user_id: user.id,
      question_id: question.id,
      choice_id: choiceCorrect.id,
      is_correct: true,
      source: 'event_quiz',
      session_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    })

    const statsAfter = await QuizLeaderboardService.calculateQuizStatsFromResponses(
      user.id,
      quiz.id,
      null
    )

    // Ensure no inflation
    assert.isAtMost(
      statsAfter.score,
      100,
      'Score should not exceed 100% when mixing session and non-session responses'
    )
  })
})
