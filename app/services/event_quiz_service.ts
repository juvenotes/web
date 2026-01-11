import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import db from '@adonisjs/lucid/services/db'
import EventQuiz from '#models/event_quiz'
import Question from '#models/question'
import { generateSlug } from '#utils/slug_generator'
import { QuestionType } from '#enums/question_types'
import { MCQParser, MCQParserError } from '#services/mcq_parser_service'
import fs from 'node:fs/promises'

export interface CreateQuizData {
    userId: number
    eventId: number
    title: string
    description?: string | null
    status?: 'draft' | 'published'
}

export interface CreateQuestionData {
    userId: number
    quizId: number
    questionText: string
    questionImagePath?: string | null
    choices: {
        choiceText: string
        isCorrect: boolean
        explanation?: string | null
    }[]
}

export interface UpdateQuestionData {
    questionText: string
    questionImagePath?: string | null
    choices: {
        id?: number
        choiceText: string
        isCorrect: boolean
        explanation?: string | null
    }[]
}

export interface ParsedQuestion {
    stem: string
    choices: string[]
    answer: string
    explanation?: string
}

export default class EventQuizService {
    /**
     * Create a new quiz
     */
    async createQuiz(data: CreateQuizData, trx?: TransactionClientContract): Promise<EventQuiz> {
        const quiz = await EventQuiz.create(
            {
                userId: data.userId,
                eventId: data.eventId,
                title: data.title,
                slug: generateSlug(),
                description: data.description || null,
                status: data.status || 'draft',
            },
            { client: trx }
        )
        return quiz
    }

    /**
     * Create a question with choices
     */
    async createQuestion(data: CreateQuestionData, trx?: TransactionClientContract): Promise<number> {
        const client = trx || db

        const [question] = await client
            .insertQuery()
            .table('questions')
            .insert({
                user_id: data.userId,
                event_quiz_id: data.quizId,
                slug: generateSlug(),
                type: QuestionType.MCQ,
                question_text: data.questionText,
                question_image_path: data.questionImagePath || null,
            })
            .returning('*')

        await client
            .insertQuery()
            .table('mcq_choices')
            .insert(
                data.choices.map((choice) => ({
                    question_id: question.id,
                    choice_text: choice.choiceText,
                    is_correct: choice.isCorrect,
                    explanation: choice.explanation,
                }))
            )

        return question.id
    }

    /**
     * Update a question and its choices
     */
    async updateQuestion(
        question: Question,
        data: UpdateQuestionData,
        trx?: TransactionClientContract
    ): Promise<void> {
        const client = trx || db

        // Update question text
        const updatedQuestion = question.merge({
            questionText: data.questionText,
            questionImagePath: data.questionImagePath || null,
        })

        if (trx) {
            updatedQuestion.useTransaction(trx)
        }

        await updatedQuestion.save()

        // Build map of existing choices
        const existingChoices = new Map(question.choices.map((choice) => [choice.id, choice]))
        const updatedChoiceIds = new Set<number>()

        // Update or create choices
        for (const choiceData of data.choices) {
            if (choiceData.id && existingChoices.has(choiceData.id)) {
                // Update existing choice
                await client.from('mcq_choices').where('id', choiceData.id).update({
                    choice_text: choiceData.choiceText,
                    is_correct: choiceData.isCorrect,
                    explanation: choiceData.explanation,
                })
                updatedChoiceIds.add(choiceData.id)
            } else {
                // Create new choice
                const [newChoice] = await client
                    .insertQuery()
                    .table('mcq_choices')
                    .insert({
                        question_id: question.id,
                        choice_text: choiceData.choiceText,
                        is_correct: choiceData.isCorrect,
                        explanation: choiceData.explanation,
                    })
                    .returning('id')
                updatedChoiceIds.add(newChoice.id)
            }
        }

        // Delete removed choices
        const choicesToRemove = [...existingChoices.keys()].filter((id) => !updatedChoiceIds.has(id))
        if (choicesToRemove.length > 0) {
            await client.from('mcq_choices').whereIn('id', choicesToRemove).delete()
        }
    }

    /**
     * Delete a question and its choices
     */
    async deleteQuestion(questionId: number, trx?: TransactionClientContract): Promise<void> {
        const execute = async (t: TransactionClientContract) => {
            await t.from('mcq_choices').where('question_id', questionId).delete()
            await t.from('questions').where('id', questionId).delete()
        }

        if (trx) {
            await execute(trx)
        } else {
            await db.transaction(execute)
        }
    }

    /**
     * Parse questions from file content and create them for a quiz
     */
    async uploadQuestionsFromFile(
        fileContent: string,
        userId: number,
        quizId: number,
        trx?: TransactionClientContract
    ): Promise<number> {
        const client = trx || db
        const parsedQuestions = MCQParser.parse(fileContent)

        for (const parsedQuestion of parsedQuestions) {
            const [question] = await client
                .insertQuery()
                .table('questions')
                .insert({
                    user_id: userId,
                    event_quiz_id: quizId,
                    slug: generateSlug(),
                    type: QuestionType.MCQ,
                    question_text: parsedQuestion.stem,
                })
                .returning('*')

            const correctIndex = parsedQuestion.answer.charCodeAt(0) - 65
            const choices = parsedQuestion.choices.map((choiceText, idx) => ({
                question_id: question.id,
                choice_text: choiceText,
                is_correct: idx === correctIndex,
                explanation: idx === correctIndex ? parsedQuestion.explanation : null,
            }))

            await client.insertQuery().table('mcq_choices').insert(choices)
        }

        return parsedQuestions.length
    }

    /**
     * Create a quiz with questions from a file
     */
    async createQuizWithQuestionsFromFile(
        quizData: CreateQuizData,
        filePath: string
    ): Promise<{ quiz: EventQuiz; questionCount: number }> {
        const content = await fs.readFile(filePath, 'utf-8')

        return await db.transaction(async (trx) => {
            const quiz = await this.createQuiz(quizData, trx)
            const questionCount = await this.uploadQuestionsFromFile(content, quizData.userId, quiz.id, trx)
            return { quiz, questionCount }
        })
    }

    /**
     * Publish a quiz
     */
    async publishQuiz(quizId: number): Promise<void> {
        const quiz = await EventQuiz.findOrFail(quizId)

        if (quiz.status === 'published') {
            throw new Error('Quiz is already published')
        }

        const questionCount = await quiz.related('questions').query().count('* as total').first()
        if (Number(questionCount?.$extras.total || 0) === 0) {
            throw new Error('Cannot publish a quiz with no questions')
        }

        quiz.status = 'published'
        await quiz.save()
    }
}

export { MCQParserError }
