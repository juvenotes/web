import { InferPageProps } from '@adonisjs/inertia/types'
import { Link } from '@inertiajs/react'
import type { IndexController } from '../../../app/controllers/papers/index_controller'

type Props = InferPageProps<typeof IndexController, 'show'>

export default function ShowPaper({ paper }: Props) {
  const mcqQuestions = paper.questions.filter(q => q.type === 'mcq')
  const saqQuestions = paper.questions.filter(q => q.type === 'saq')

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Paper Header */}
      <div className="mb-8">
        <Link 
          href="/papers" 
          className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
        >
          ← Back to Papers
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{paper.title}</h1>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <span>{paper.concept.title}</span>
          <span className="mx-2">&bull;</span>
          <span>{paper.year}</span>
          <span className="mx-2">&bull;</span>
          <span>{paper.examType}</span>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {mcqQuestions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Multiple Choice Questions</h2>
            <div className="space-y-6">
              {mcqQuestions.map((question, index) => (
                <div key={question.id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-start">
                    <span className="font-medium mr-4">{index + 1}.</span>
                    <div>
                      <p className="text-gray-900 mb-4">{question.questionText}</p>
                      <div className="ml-4 space-y-2">
                        {question.choices?.map((choice) => (
                          <div
                            key={choice.id}
                            className={`p-3 rounded-lg ${
                              choice.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                            }`}
                          >
                            <p className="text-gray-900">{choice.text}</p>
                            {choice.isCorrect && (
                              <p className="text-sm text-green-600 mt-1">{choice.explanation}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {saqQuestions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Structured Questions</h2>
            <div className="space-y-6">
              {saqQuestions.map((question, index) => (
                <div key={question.id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-start">
                    <span className="font-medium mr-4">{index + 1}.</span>
                    <div>
                      <p className="text-gray-900 mb-4">{question.questionText}</p>
                      <div className="ml-4 space-y-4">
                        {question.parts?.map((part, partIndex) => (
                          <div key={part.id} className="border-l-2 border-gray-200 pl-4">
                            <p className="text-gray-900 font-medium mb-2">
                              {String.fromCharCode(97 + partIndex)}) {part.text}
                            </p>
                            <p className="text-sm text-gray-500">
                              Expected: {part.expectedAnswer}
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}