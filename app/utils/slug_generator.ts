import crypto from 'node:crypto'

export function generateSlug(length: number = 8): string {
  return crypto
    .randomBytes(length)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, length)
}
