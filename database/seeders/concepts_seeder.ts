import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { generateSlug } from '#utils/slug_generator'
import db from '@adonisjs/lucid/services/db'
import { parse } from 'csv-parse/sync'
import fs from 'node:fs'
import { ensureAdmin } from '#utils/ensure_admin'

export default class ConceptSeeder extends BaseSeeder {
  async run() {
    // Find admin user
    const admin = await ensureAdmin()

    if (!admin) {
      throw new Error('Admin user must exist before seeding concepts')
    }

    // Read and parse CSV
    const csvContent = fs.readFileSync('database/seeders/syllabus.csv', 'utf-8')
    const records = parse(csvContent, {
      columns: false,
      skip_empty_lines: true,
      relax_column_count: true,
    })

    // First pass: build hierarchy map and track max depths per root
    const rootMaxDepths = new Map<string, number>()
    let currentRoot = ''

    for (const row of records) {
      const depth = row.findIndex((cell: string) => cell !== '' && cell !== undefined)
      if (depth === -1) continue

      const title = row[depth]
      if (!title) continue

      // If depth is 0, this is a root node
      if (depth === 0) {
        currentRoot = title
        rootMaxDepths.set(currentRoot, 0)
      }

      // Update max depth for current root
      if (currentRoot && depth > (rootMaxDepths.get(currentRoot) || 0)) {
        rootMaxDepths.set(currentRoot, depth)
      }
    }

    const lastNodeAtLevel: { [key: number]: number } = {}
    let currentMaxDepth = 0

    // Second pass: create nodes
    for (const row of records) {
      const depth = row.findIndex((cell: string) => cell !== '' && cell !== undefined)
      if (depth === -1) continue

      const title = row[depth]
      if (!title) continue

      // Update current max depth when hitting a root node
      if (depth === 0) {
        currentMaxDepth = rootMaxDepths.get(title) || 0
      }

      const parentId = depth > 0 ? lastNodeAtLevel[depth - 1] : null

      console.log(`Inserting: ${title} at depth ${depth} with max depth ${currentMaxDepth}`)

      // Assign content only to leaf nodes within their root's context
      const knowledgeBlock =
        depth === currentMaxDepth ? `# ${title}\n\nDetailed content for ${title} goes here.` : null

      const [{ id }] = await db
        .table('concepts')
        .insert({
          title,
          slug: generateSlug(),
          parent_id: parentId,
          level: depth,
          is_terminal: depth === currentMaxDepth,
          knowledge_block: knowledgeBlock,
          user_id: admin.id, // Add user_id from admin
        })
        .returning(['id'])

      lastNodeAtLevel[depth] = Number(id)
    }
  }
}
