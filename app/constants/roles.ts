import { Role } from '#enums/roles'

// Define role groups with explicit typing
export const CONTENT_MANAGERS = [Role.EDITOR, Role.ADMIN] as const
export const CONTEXT_PROVIDERS = [Role.CURATOR, Role.EDITOR, Role.ADMIN] as const

// Type utilities for role groups
export type ContentManagerRoles = (typeof CONTENT_MANAGERS)[number]
export type ContextProviderRoles = (typeof CONTEXT_PROVIDERS)[number]
