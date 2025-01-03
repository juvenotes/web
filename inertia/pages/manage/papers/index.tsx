import { InferPageProps } from '@adonisjs/inertia/types'
import { Link } from '@inertiajs/react'
import { Button } from '~/components/ui/button'
import type { PapersController } from '../../../app/controllers/manage/papers_controller'

type Props = InferPageProps<typeof ManagePapersController, 'index'>

export default function ManagePapersList({ papersByConcept }: Props) {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Manage Papers</h1>
          <Link href="/manage/papers/create">
            <Button>Add New Paper</Button>
          </Link>
        </div>
        
        <div className="mt-6 space-y-8">
          {Object.entries(papersByConcept).map(([conceptTitle, papers]) => (
            <div key={conceptTitle} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {conceptTitle} ({papers.length})
                </h2>
              </div>
              <ul className="divide-y divide-gray-200">
                {papers.map((paper) => (
                  <li key={paper.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <Link 
                        href={`/manage/papers/${paper.slug}`} 
                        className="flex-1"
                      >
                        <h3 className="text-lg font-medium">{paper.title}</h3>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span>{paper.year}</span>
                          <span className="mx-2">&bull;</span>
                          <span>{paper.examType}</span>
                          <span className="mx-2">&bull;</span>
                          <span>{paper.questions.length} Questions</span>
                        </div>
                      </Link>
                      <div className="flex gap-2">
                        <Link href={`/manage/papers/${paper.slug}/edit`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            if (confirm('Delete this paper?')) {
                              // Delete action
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// export default function PapersList({ papersByConcept }: Props) {
//   return (
//     <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
//       <div className="px-4 py-6 sm:px-0">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-semibold text-gray-900">Past Papers</h1>
//           <Link href="/manage/papers/create">
//             <Button>Add New Paper</Button>
//           </Link>
//         </div>
        
//         <div className="mt-6 space-y-8">
//           {Object.entries(papersByConcept).map(([conceptTitle, conceptPapers]) => (
//             <div key={conceptTitle} className="bg-white shadow overflow-hidden rounded-md">
//               <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
//                 <h2 className="text-lg font-medium text-gray-900">
//                   {conceptTitle} ({conceptPapers.length} papers)
//                 </h2>
//               </div>
//               <ul className="divide-y divide-gray-200">
//                 {conceptPapers.map((paper) => (
//                   <li key={paper.id} className="p-4 hover:bg-gray-50">
//                     <div className="flex items-center justify-between">
//                       <Link 
//                         href={`/manage/papers/${paper.slug}`} 
//                         className="flex-1"
//                       >
//                         <h3 className="text-lg font-medium">{paper.title}</h3>
//                         <div className="mt-1 flex items-center text-sm text-gray-500">
//                           <span>{paper.year}</span>
//                           <span className="mx-2">&bull;</span>
//                           <span>{paper.exam_type}</span>
//                           <span className="mx-2">&bull;</span>
//                           <span>{paper.questions.length} Questions</span>
//                         </div>
//                       </Link>
//                       <div className="flex gap-2">
//                         <Link href={`/manage/papers/${paper.slug}/edit`}>
//                           <Button variant="outline" size="sm">Edit</Button>
//                         </Link>
//                         <Button 
//                           variant="destructive" 
//                           size="sm"
//                           onClick={() => {
//                             if (confirm('Are you sure you want to delete this paper?')) {
//                               // Delete action
//                             }
//                           }}
//                         >
//                           Delete
//                         </Button>
//                       </div>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }