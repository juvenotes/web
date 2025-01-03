import { InferPageProps } from '@adonisjs/inertia/types'
import { Link } from '@inertiajs/react'
import { Button } from '~/components/ui/button'
import type { PapersController } from '../../../app/controllers/manage/papers_controller'

type Props = InferPageProps<typeof PapersController, 'show'>

export default function ShowPaper({ paper }: Props) {
  const mcqQuestions = paper.questions.filter(q => q.type === 'mcq')
  const saqQuestions = paper.questions.filter(q => q.type === 'saq')

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Paper Header with Actions */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{paper.title}</h1>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span>{paper.concept.title}</span>
            <span className="mx-2">&bull;</span>
            <span>{paper.year}</span>
            <span className="mx-2">&bull;</span>
            <span>{paper.exam_type}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/manage/papers/${paper.slug}/questions/new?type=mcq`}>
            <Button variant="outline">Add MCQ</Button>
          </Link>
          <Link href={`/manage/papers/${paper.slug}/questions/new?type=saq`}>
            <Button variant="outline">Add SAQ</Button>
          </Link>
        </div>
      </div>

      {/* MCQ Section */}
      {mcqQuestions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Multiple Choice Questions ({mcqQuestions.length})
          </h2>
          <div className="space-y-6">
            {mcqQuestions.map((question, index) => (
              <div key={question.id} className="group bg-white shadow rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start">
                      <span className="font-medium mr-4">{index + 1}.</span>
                      <div>
                        <p className="text-gray-900 mb-4">{question.question_text}</p>
                        <div className="ml-4 space-y-2">
                          {question.choices?.map((choice) => (
                            <div
                              key={choice.id}
                              className={`p-3 rounded-lg ${
                                choice.is_correct ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                              }`}
                            >
                              <p className="text-gray-900">{choice.choice_text}</p>
                              {choice.is_correct && (
                                <p className="text-sm text-green-600 mt-1">{choice.explanation}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Link href={`/manage/papers/${paper.slug}/questions/${question.slug}/edit`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                    <form 
                      action={`/manage/papers/${paper.slug}/questions/${question.slug}`} 
                      method="DELETE"
                    >
                      <Button 
                        variant="destructive" 
                        size="sm"
                        type="submit"
                        onClick={(e) => {
                          e.preventDefault()
                          if (confirm('Remove this question?')) {
                            e.currentTarget.form?.submit()
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SAQ Section */}
      {saqQuestions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Structured Questions ({saqQuestions.length})
          </h2>
          <div className="space-y-6">
            {saqQuestions.map((question, index) => (
              <div key={question.id} className="group bg-white shadow rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start">
                      <span className="font-medium mr-4">{index + 1}.</span>
                      <div>
                        <p className="text-gray-900 mb-4">{question.question_text}</p>
                        <div className="ml-4 space-y-4">
                          {question.parts?.map((part, partIndex) => (
                            <div key={part.id} className="border-l-2 border-gray-200 pl-4">
                              <p className="text-gray-900 font-medium mb-2">
                                {String.fromCharCode(97 + partIndex)}) {part.part_text}
                              </p>
                              <p className="text-sm text-gray-500">
                                Expected: {part.expected_answer}
                              </p>
                              <p className="text-sm text-gray-500">
                                Marks: {part.marks}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Link href={`/manage/papers/${paper.slug}/questions/${question.slug}/edit`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                    <form 
                      action={`/manage/papers/${paper.slug}/questions/${question.slug}`} 
                      method="DELETE"
                    >
                      <Button 
                        variant="destructive" 
                        size="sm"
                        type="submit"
                        onClick={(e) => {
                          e.preventDefault()
                          if (confirm('Remove this question?')) {
                            e.currentTarget.form?.submit()
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}