export enum Role {
  USER = 1,
  CURATOR = 2,
  EDITOR = 3,
  ADMIN = 4,
}

export type RoleName = keyof typeof Role
