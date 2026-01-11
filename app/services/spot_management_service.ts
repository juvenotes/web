
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import db from '@adonisjs/lucid/services/db'
import Question from '#models/question'
import PastPaper from '#models/past_paper'
import User from '#models/user'
import { QuestionType } from '#enums/question_types'
import { generateSlug } from '#utils/slug_generator'
import QuestionDeletionService from '#services/question_deletion_service'

interface CreateSpotQuestionData {
    questionText: string
    questionImagePath?: string | null
    parts: {
        partText: string
        expectedAnswer: string
        marks: number
        imagePath?: string | null
    }[]
    topicIds?: number[]
    unitIds?: number[]
}

interface UpdateSpotQuestionData extends CreateSpotQuestionData { }

export default class SpotManagementService {
    /**
     * Helper to update paper metadata
     */
    private getMetadataUpdate(currentMetadata: any, user: User) {
        const fullName = user.fullName ?? 'Unknown User'
        return {
            ...currentMetadata,
            lastEditedBy: {
                fullName,
                timestamp: new Date(),
            },
        }
    }

    /**
     * Create a new SPOT question
     */
    async createSpotQuestion(
        paper: PastPaper,
        data: CreateSpotQuestionData,
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
                    past_paper_id: paper.id,
                    type: QuestionType.SPOT,
                    question_text: data.questionText,
                    question_image_path: data.questionImagePath || null,
                    slug: generateSlug(),
                })
                .returning('*')

            question = created

            // Create stations
            for (const stationData of data.parts) {
                await t
                    .insertQuery()
                    .table('spot_stations')
                    .insert({
                        question_id: question.id,
                        part_text: stationData.partText,
                        expected_answer: stationData.expectedAnswer,
                        marks: stationData.marks,
                        image_path: stationData.imagePath || null,
                    })
            }

            // Update paper metadata
            await paper
                .merge({
                    metadata: this.getMetadataUpdate(paper.metadata, user),
                })
                .useTransaction(t)
                .save()

            // Add topics
            if (data.topicIds && data.topicIds.length > 0) {
                await t
                    .insertQuery()
                    .table('question_topics')
                    .multiInsert(
                        data.topicIds.map((topicId) => ({
                            question_id: question.id,
                            topic_id: topicId,
                        }))
                    )
            }

            // Add units
            if (data.unitIds && data.unitIds.length > 0) {
                await t
                    .insertQuery()
                    .table('question_units')
                    .multiInsert(
                        data.unitIds.map((unitId) => ({
                            question_id: question.id,
                            unit_id: unitId,
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
     * Update a SPOT question
     */
    async updateSpotQuestion(
        question: Question,
        data: UpdateSpotQuestionData,
        user: User,
        trx?: TransactionClientContract
    ): Promise<void> {
        // Ensure pastPaper relation is loaded
        if (!question.pastPaper) {
            await question.load('pastPaper')
        }

        const action = async (t: TransactionClientContract) => {
            // Update question properties
            await question
                .merge({
                    questionText: data.questionText,
                    questionImagePath: data.questionImagePath || null,
                })
                .useTransaction(t)
                .save()

            // Delete existing stations (simple replace)
            await t.from('spot_stations').where('question_id', question.id).delete()

            // Create new stations
            for (const stationData of data.parts) {
                await t
                    .insertQuery()
                    .table('spot_stations')
                    .insert({
                        question_id: question.id,
                        part_text: stationData.partText,
                        expected_answer: stationData.expectedAnswer,
                        marks: stationData.marks,
                        image_path: stationData.imagePath || null,
                    })
            }

            // Update paper metadata
            if (question.pastPaper) {
                await question.pastPaper
                    .merge({
                        metadata: this.getMetadataUpdate(question.pastPaper.metadata, user),
                    })
                    .useTransaction(t)
                    .save()
            }

            // Update topics and units
            await t.from('question_topics').where('question_id', question.id).delete()
            await t.from('question_units').where('question_id', question.id).delete()

            if (data.topicIds && data.topicIds.length > 0) {
                await t
                    .insertQuery()
                    .table('question_topics')
                    .multiInsert(
                        data.topicIds.map((topicId) => ({
                            question_id: question.id,
                            topic_id: topicId,
                        }))
                    )
            }

            if (data.unitIds && data.unitIds.length > 0) {
                await t
                    .insertQuery()
                    .table('question_units')
                    .multiInsert(
                        data.unitIds.map((unitId) => ({
                            question_id: question.id,
                            unit_id: unitId,
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
    }


    /**
     * Delete a SPOT question
     */
    async deleteSpotQuestion(question: Question, user: User) {
        // Ensure pastPaper relation is loaded
        if (!question.pastPaper) {
            await question.load('pastPaper')
        }

        await db.transaction(async (trx) => {
            // Update paper metadata
            if (question.pastPaper) {
                await question.pastPaper
                    .merge({
                        metadata: this.getMetadataUpdate(question.pastPaper.metadata, user),
                    })
                    .useTransaction(trx)
                    .save()
            }

            // Use the question service for soft deletion
            await QuestionDeletionService.delete(question.id, trx)
        })
    }
}
