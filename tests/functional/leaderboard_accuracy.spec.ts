import { test } from '@japa/runner'
import User from '#models/user'
import Event from '#models/event'
import EventQuiz from '#models/event_quiz'
import Question from '#models/question'
import McqChoice from '#models/mcq_choice'
import { QuizSessionService } from '#services/quiz_session_service'
import UserProgressService from '#services/user_progress_service'
import StudyTimeService from '#services/study_time_service'
import UserQuizStat from '#models/user_quiz_stat'
import { QuestionType } from '#enums/question_types'
import { DateTime } from 'luxon'

test.group('Leaderboard Accuracy', (group) => {
    let user: User
    let event: Event
    let quiz: EventQuiz
    let q1: Question
    let q2: Question
    let c1: McqChoice
    let c2: McqChoice

    group.setup(async () => {
        // blocked by global setup usually, but we assume DB is ready
    })

    group.each.setup(async () => {
        // Create User
        user = await User.create({
            fullName: 'Test Student',
            email: `student_${Date.now()}@test.com`,
            password: 'password',
        })

        // Create Event
        event = await Event.create({
            userId: user.id,
            title: 'Test Event',
            slug: `test-event-${Date.now()}`,
            description: 'Test Description',
            status: 'published',
            eventType: 'exam',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
        })

        // Create Quiz (Timed Lockdown) - Fixed: timeLimit should be true to match hasTimer
        quiz = await EventQuiz.create({
            userId: user.id,
            eventId: event.id,
            title: 'Test Quiz',
            slug: `test-quiz-${Date.now()}`,
            status: 'published',
            quizMode: 'timed_lockdown',
            durationMinutes: 60,
            hasTimer: true,
            autoSubmit: true,
            lockdownMode: true,
            timeLimit: true, // Fixed: was false, now consistent with hasTimer
        })

        // Create Q1
        q1 = await Question.create({
            pastPaperId: null,
            eventQuizId: quiz.id,
            type: QuestionType.MCQ,
            questionText: 'Question 1',
        })
        c1 = await McqChoice.create({
            questionId: q1.id,
            choiceText: 'Correct Answer 1',
            isCorrect: true,
            explanation: 'Exp 1',
        })

        // Create Q2
        q2 = await Question.create({
            pastPaperId: null,
            eventQuizId: quiz.id,
            type: QuestionType.MCQ,
            questionText: 'Question 2',
        })
        c2 = await McqChoice.create({
            questionId: q2.id,
            choiceText: 'Correct Answer 2',
            isCorrect: true,
            explanation: 'Exp 2',
        })
    })

    test('stats are isolated per session', async ({ assert }) => {
        // Instantiate services directly (no DI container in functional tests)
        const quizSessionService = new QuizSessionService()
        const studyTimeService = new StudyTimeService()
        const userProgressService = new UserProgressService(studyTimeService)

        // --- Session A ---
        const sessionA = await quizSessionService.startSession(user.id, quiz.id, 'STU001', 'Test School')

        // Answer Q1 Correctly
        await userProgressService.recordEventQuizAttempt(
            user.id,
            quiz.id,
            q1.id,
            c1.id,
            true,
            sessionA.id // Passing session ID explicitly as controller would
        )

        // Verify Stats for Session A
        let statsA = await UserQuizStat.query().where('userId', user.id).where('quizId', quiz.id).first()
        assert.equal(statsA?.score, 50)
        // Score based on total quiz questions (1 correct / 2 total = 50%)
        assert.equal(statsA?.questionsCorrect, 1)
        assert.equal(statsA?.questionsAttempted, 1)

        // End Session A (simulate abandon or submit)
        sessionA.status = 'completed'
        await sessionA.save()

        // --- Session B (Restart) ---
        const sessionB = await quizSessionService.startSession(user.id, quiz.id, 'STU001', 'Test School')
        // startSession creates a new session since the previous one was completed

        assert.notEqual(sessionA.id, sessionB.id)

        // Answer Q2 Correctly (Q1 is NOT answered in this session)
        await userProgressService.recordEventQuizAttempt(
            user.id,
            quiz.id,
            q2.id,
            c2.id,
            true,
            sessionB.id
        )

        // Verify Stats for Session B
        // Should ONLY count Q2. Q1 response from Session A should be ignored.
        // Correct = 1. Total = 2. Score = 50.
        // If bug existed (aggregation): Correct = 2. Score = 100.

        // Re-fetch stats fresh from DB instead of using .load()
        const statsB = await UserQuizStat.query().where('userId', user.id).where('quizId', quiz.id).first()

        assert.equal(statsB?.questionsCorrect, 1, 'Should only have 1 correct answer (from current session)')
        assert.equal(statsB?.questionsAttempted, 1, 'Should only track 1 attempt in new session')
        assert.equal(statsB?.score, 50, 'Score should be 50%')
    })
})

