import { useState } from 'react'
import { InferPageProps } from '@adonisjs/inertia/types'
import { Link } from '@inertiajs/react'
import { Button } from '~/components/ui/button'
import type { IndexController } from '../../../app/controllers/papers/index_controller'

type Props = InferPageProps<typeof IndexController, 'index'>

export default function PapersList({ concepts }: Props) {
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedExam, setSelectedExam] = useState<string | null>(null)

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Past Papers</h1>
      
      <div className="space-y-6">
        {concepts.map(concept => (
          <div key={concept.id} className="bg-white shadow rounded-lg overflow-hidden">
            {/* Concept Header */}
            <button
              onClick={() => setSelectedConcept(selectedConcept === concept.id ? null : concept.id)}
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
            >
              <div>
                <h2 className="text-lg font-medium">{concept.title}</h2>
                <div className="mt-1 text-sm text-gray-500">
                  {Object.entries(concept.paperCounts)
                    .filter(([_, count]) => count > 0)
                    .map(([type, count]) => (
                      `${count} ${type.toUpperCase()} ${count === 1 ? 'Paper' : 'Papers'}`
                    )).join(' • ')
                  }
                </div>
              </div>
              <span>{selectedConcept === concept.id ? '−' : '+'}</span>
            </button>

            {/* Expanded Content */}
            {selectedConcept === concept.id && (
              <div className="p-6 border-t border-gray-200 space-y-4">
                {/* Paper Types */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Paper Type</h3>
                  <div className="flex gap-2">
                    {Object.entries(concept.paperCounts)
                      .filter(([_, count]) => count > 0)
                      .map(([type]) => (
                        <Button
                          key={type}
                          variant={selectedType === type ? "default" : "outline"}
                          onClick={() => {
                            setSelectedType(selectedType === type ? null : type)
                            setSelectedExam(null)
                          }}
                        >
                          {type.toUpperCase()}
                        </Button>
                      ))}
                  </div>
                </div>

                {/* Exam Types */}
                {selectedType && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Exam Type</h3>
                    <div className="flex gap-2">
                      {Array.from(new Set(
                        concept.papers
                          .filter(p => p.paperType === selectedType)
                          .map(p => p.examType)
                      )).map(examType => (
                        <Button
                          key={examType}
                          variant={selectedExam === examType ? "default" : "outline"}
                          onClick={() => setSelectedExam(selectedExam === examType ? null : examType)}
                        >
                          {examType.toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Papers List */}
                {selectedType && selectedExam && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Available Papers</h3>
                    <div className="space-y-2">
                      {concept.papers
                        .filter(p => p.paperType === selectedType && p.examType === selectedExam)
                        .sort((a, b) => Number(b.year) - Number(a.year))
                        .map(paper => (
                          <Link
                            key={paper.id}
                            href={`/papers/${paper.slug}`}
                            className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg"
                          >
                            <div className="font-medium">{paper.title}</div>
                            <div className="text-sm text-gray-500">
                              {paper.year} • {paper.questionsCount} Questions
                            </div>
                          </Link>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}