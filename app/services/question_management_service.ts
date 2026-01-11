
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import db from '@adonisjs/lucid/services/db'
import Question from '#models/question'
import PastPaper from '#models/past_paper'
import Today from '#models/today'
import Concept from '#models/concept'
import User from '#models/user'
import { generateSlug } from '#utils/slug_generator'
import { QuestionType } from '#enums/question_types'
import { MCQParser } from '#services/mcq_parser_service'
import { ResponseStatus } from '#enums/response_status'

export interface CreateMcqData {
    questionText: string
    questionImagePath?: string | null
    choices: {
        choiceText: string
        isCorrect: boolean
        explanation?: string | null
    }[]
}

export interface CreateSaqData {
    questionText: string
    questionImagePath?: string | null
    parts: {
        partText: string
        expectedAnswer: string
        marks: number
    }[]
}

export interface UpdateMcqData {
    questionText: string
    questionImagePath?: string | null
    choices?: {
        id?: number
        choiceText: string
        isCorrect: boolean
        explanation?: string | null
    }[]
}

export interface UpdateSaqData extends CreateSaqData {
    parts: {
        id?: number
        partText: string
        expectedAnswer: string
        marks: number
    }[]
}

export default class QuestionManagementService {
    /**
     * Helper to update paper metadata on changes
     */
    private getMetadataUpdate(currentMetadata: any, user: User) {
        return {
            ...currentMetadata,
            lastEditedBy: {
                fullName: user.fullName!,
                timestamp: new Date(),
            },
        }
    }

    /**
     * Create an MCQ question for a past paper
     */
    async createMcq(
        paper: PastPaper,
        data: CreateMcqData,
        user: User,
        trx?: TransactionClientContract
    ): Promise<Question> {
        let question: Question

        const action = async (t: TransactionClientContract) => {
            // Update paper metadata
            await paper
                .merge({
                    metadata: this.getMetadataUpdate(paper.metadata, user),
                })
                .useTransaction(t)
                .save()

            // Create question
            const [created] = await t
                .insertQuery()
                .table('questions')
                .insert({
                    user_id: user.id,
                    past_paper_id: paper.id,
                    slug: generateSlug(),
                    type: QuestionType.MCQ,
                    question_text: data.questionText,
                    question_image_path: data.questionImagePath || null,
                })
                .returning('*')

            question = created

            // Create choices
            if (data.choices.length > 0) {
                await t
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
            }
        }

        if (trx) {
            await action(trx)
        } else {
            await db.transaction(async (newTrx) => {
                await action(newTrx)
            })
        }

        return question!
    }

    /**
   * Create an MCQ question for a Today item
   */
    async createMcqForToday(
        today: Today,
        data: CreateMcqData,
        user: User,
        trx?: TransactionClientContract
    ): Promise<Question> {
        let question: Question

        const action = async (t: TransactionClientContract) => {
            // Create question
            const [created] = await t
                .insertQuery()
                .table('questions')
                .insert({
                    user_id: user.id,
                    today_id: today.id,
                    slug: generateSlug(),
                    type: QuestionType.MCQ,
                    question_text: data.questionText,
                    question_image_path: data.questionImagePath || null,
                })
                .returning('*')

            question = created

            // Create choices
            if (data.choices.length > 0) {
                await t
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
            }
        }

        if (trx) {
            await action(trx)
        } else {
            await db.transaction(async (newTrx) => {
                await action(newTrx)
            })
        }

        return question!
    }

    /**
   * Create an MCQ question for a concept
   */
    async createMcqForConcept(
        concept: Concept,
        data: CreateMcqData,
        user: User,
        trx?: TransactionClientContract
    ): Promise<Question> {
        let question: Question

        const action = async (t: TransactionClientContract) => {
            // Create new question (not linked to paper or today directly, but via pivot)
            const [created] = await t
                .insertQuery()
                .table('questions')
                .insert({
                    user_id: user.id,
                    // No past_paper_id or today_id
                    slug: generateSlug(),
                    type: QuestionType.MCQ,
                    question_text: data.questionText,
                    question_image_path: data.questionImagePath || null,
                })
                .returning('*')

            question = created

            // Create choices
            await t
                .insertQuery()
                .table('mcq_choices')
                .insert(
                    data.choices.map((choice) => ({
                        question_id: question.id,
                        choice_text: choice.choiceText,
                        is_correct: choice.isCorrect,
                        explanation: choice.explanation || null,
                    }))
                )

            // Link to concept via pivot table
            await t.insertQuery().table('concept_questions').insert({
                concept_id: concept.id,
                question_id: question.id,
            })
        }

        if (trx) {
            await action(trx)
        } else {
            await db.transaction(async (newTrx) => {
                await action(newTrx)
            })
        }

        return question!
    }

    /**
     * Create an SAQ question for a past paper
     */
    async createSaq(
        paper: PastPaper,
        data: CreateSaqData,
        user: User,
        trx?: TransactionClientContract
    ): Promise<Question> {
        let question: Question

        const action = async (t: TransactionClientContract) => {
            await paper
                .merge({
                    metadata: this.getMetadataUpdate(paper.metadata, user),
                })
                .useTransaction(t)
                .save()

            const [created] = await t
                .insertQuery()
                .table('questions')
                .insert({
                    user_id: user.id,
                    past_paper_id: paper.id,
                    slug: generateSlug(),
                    type: QuestionType.SAQ,
                    question_text: data.questionText,
                    question_image_path: data.questionImagePath || null,
                })
                .returning('*')

            question = created

            if (data.parts.length > 0) {
                await t
                    .insertQuery()
                    .table('saq_parts')
                    .insert(
                        data.parts.map((part) => ({
                            question_id: question.id,
                            part_text: part.partText,
                            expected_answer: part.expectedAnswer,
                            marks: part.marks,
                        }))
                    )
            }
        }

        if (trx) {
            await action(trx)
        } else {
            await db.transaction(async (newTrx) => {
                await action(newTrx)
            })
        }

        return question!
    }

    /**
     * Update an existing MCQ question
     */
    async updateMcq(
        question: Question,
        data: UpdateMcqData,
        user: User,
        trx?: TransactionClientContract
    ): Promise<void> {
        // Ensure pastPaper is loaded for metadata update
        if (!question.pastPaper) {
            await question.load('pastPaper')
        }

        const action = async (t: TransactionClientContract) => {
            // Update paper metadata
            if (question.pastPaper) {
                await question.pastPaper
                    .merge({
                        metadata: this.getMetadataUpdate(question.pastPaper.metadata, user),
                    })
                    .useTransaction(t)
                    .save()
            }

            // Update question text
            await question
                .merge({
                    questionText: data.questionText,
                    questionImagePath: data.questionImagePath || null,
                })
                .useTransaction(t)
                .save()

            // Handle choices update only if provided
            if (data.choices && data.choices.length > 0) {
                const existingChoices = new Map(question.choices.map((choice) => [choice.id, choice]))
                const updatedChoiceIds = new Set<number>()
                const correctnessChanged = new Map<number, boolean>()

                for (const choiceData of data.choices) {
                    if (choiceData.id && existingChoices.has(choiceData.id)) {
                        const existingChoice = existingChoices.get(choiceData.id)!

                        if (existingChoice.isCorrect !== choiceData.isCorrect) {
                            correctnessChanged.set(existingChoice.id, choiceData.isCorrect)
                        }

                        await t
                            .from('mcq_choices')
                            .where('id', existingChoice.id)
                            .update({
                                choice_text: choiceData.choiceText,
                                is_correct: choiceData.isCorrect,
                                explanation: choiceData.explanation ?? null,
                            })
                        updatedChoiceIds.add(existingChoice.id)
                    } else {
                        await t.table('mcq_choices').insert({
                            question_id: question.id,
                            choice_text: choiceData.choiceText,
                            is_correct: choiceData.isCorrect,
                            explanation: choiceData.explanation ?? null,
                        })
                    }
                }

                // Handle deletions
                const choicesToRemove = [...existingChoices.keys()].filter((id) => !updatedChoiceIds.has(id))

                if (choicesToRemove.length > 0) {
                    // Check for usage in user responses
                    const responsesExist = await t
                        .from('user_mcq_responses')
                        .whereIn('choice_id', choicesToRemove)
                        .count('* as count')
                        .first()

                    if (responsesExist && Number(responsesExist.count) > 0) {
                        for (const choiceId of choicesToRemove) {
                            const choice = existingChoices.get(choiceId)!
                            await t.from('user_mcq_responses').where('choice_id', choiceId).update({
                                status: ResponseStatus.OBSOLETE,
                                original_choice_text: choice.choiceText,
                            })
                        }
                    }

                    await t.from('mcq_choices').whereIn('id', choicesToRemove).delete()
                }

                // Update correctness for changed choices
                if (correctnessChanged.size > 0) {
                    for (const [choiceId, newCorrectness] of correctnessChanged.entries()) {
                        await t
                            .from('user_mcq_responses')
                            .where('choice_id', choiceId)
                            .update({ is_correct: newCorrectness })
                    }
                }
            } else if (data.choices && data.choices.length === 0) {
                // Explicit empty array provided: remove all choices? 
                // Or validation ensures > 0. Copilot flag suggests it's ignored if empty.
                // For safety: if choices is explicitly [], do nothing or remove all?
                // Current logic ignored it if empty. Copilot said "won't insert or update".
                // Let's assume validation should prevent empty choices in controller,
                // but if passed here, we should probably respect it or throw.
                // The check `data.choices.length > 0` above fixes the "process it as update but do nothing" issue.
            }
        }

        if (trx) {
            await action(trx)
        } else {
            await db.transaction(async (newTrx) => {
                await action(newTrx)
            })
        }
    }

    /**
     * Update an existing SAQ question
     */
    async updateSaq(
        question: Question,
        data: UpdateSaqData,
        user: User,
        trx?: TransactionClientContract
    ): Promise<void> {
        if (!question.pastPaper) {
            await question.load('pastPaper')
        }

        const action = async (t: TransactionClientContract) => {
            if (question.pastPaper) {
                await question.pastPaper
                    .merge({
                        metadata: this.getMetadataUpdate(question.pastPaper.metadata, user),
                    })
                    .useTransaction(t)
                    .save()
            }

            await question
                .merge({
                    questionText: data.questionText,
                    questionImagePath: data.questionImagePath || null,
                })
                .useTransaction(t)
                .save()

            const existingParts = new Map(question.parts.map((part) => [part.id, part]))
            const updatedPartIds = new Set<number>()

            for (const partData of data.parts) {
                if (partData.id && existingParts.has(partData.id)) {
                    await t.from('saq_parts').where('id', partData.id).update({
                        part_text: partData.partText,
                        expected_answer: partData.expectedAnswer,
                        marks: partData.marks,
                    })
                    updatedPartIds.add(partData.id)
                } else {
                    await t.table('saq_parts').insert({
                        question_id: question.id,
                        part_text: partData.partText,
                        expected_answer: partData.expectedAnswer,
                        marks: partData.marks,
                    })
                }
            }

            const partsToRemove = [...existingParts.keys()].filter((id) => !updatedPartIds.has(id))

            if (partsToRemove.length > 0) {
                const responsesExist = await t
                    .from('user_saq_responses')
                    .whereIn('part_id', partsToRemove)
                    .count('* as count')
                    .first()

                if (responsesExist && Number(responsesExist.count) > 0) {
                    for (const partId of partsToRemove) {
                        const part = existingParts.get(partId)!
                        await t.from('user_saq_responses').where('part_id', partId).update({
                            status: ResponseStatus.OBSOLETE,
                            original_part_text: part.partText,
                        })
                    }
                }
                await t.from('saq_parts').whereIn('id', partsToRemove).delete()
            }
        }

        if (trx) {
            await action(trx)
        } else {
            await db.transaction(async (newTrx) => {
                await action(newTrx)
            })
        }
    }

    /**
     * Bulk upload MCQs from string content
     */
    async uploadMcqs(
        paper: PastPaper,
        content: string,
        user: User,
        trx?: TransactionClientContract
    ): Promise<number> {
        const parsedQuestions = MCQParser.parse(content)

        const action = async (t: TransactionClientContract) => {
            await paper
                .merge({
                    metadata: this.getMetadataUpdate(paper.metadata, user),
                })
                .useTransaction(t)
                .save()

            for (const parsedQuestion of parsedQuestions) {
                const [question] = await t
                    .insertQuery()
                    .table('questions')
                    .insert({
                        user_id: user.id,
                        past_paper_id: paper.id,
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

                await t.insertQuery().table('mcq_choices').insert(choices)
            }
        }

        if (trx) {
            await action(trx)
        } else {
            await db.transaction(async (newTrx) => {
                await action(newTrx)
            })
        }

        return parsedQuestions.length
    }

    /**
     * Copy a question to a target quiz
     */
    async copyQuestionToQuiz(
        originalQuestion: Question,
        targetQuizId: number,
        user: User,
        trx?: TransactionClientContract
    ): Promise<void> {
        // Ensure choices are loaded if it's MCQ
        if (originalQuestion.isMcq && !originalQuestion.choices) {
            await originalQuestion.load('choices')
        }

        const action = async (t: TransactionClientContract) => {
            const [newQuestion] = await t
                .insertQuery()
                .table('questions')
                .insert({
                    user_id: user.id,
                    event_quiz_id: targetQuizId,
                    slug: generateSlug(),
                    type: originalQuestion.type,
                    question_text: originalQuestion.questionText,
                    question_image_path: originalQuestion.questionImagePath,
                    difficulty_level: originalQuestion.difficultyLevel,
                })
                .returning('*')

            if (originalQuestion.isMcq && originalQuestion.choices) {
                const choicesData = originalQuestion.choices.map((choice) => ({
                    question_id: newQuestion.id,
                    choice_text: choice.choiceText,
                    is_correct: choice.isCorrect,
                    explanation: choice.explanation,
                }))
                await t.insertQuery().table('mcq_choices').insert(choicesData)
            }
        }

        if (trx) {
            await action(trx)
        } else {
            await db.transaction(async (newTrx) => {
                await action(newTrx)
            })
        }
    }
}
