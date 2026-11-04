export const roles = ['top', 'jungle', 'mid', 'bot', 'support'] as const
export type Role = (typeof roles)[number]
export interface Player {
  username: string
  roles: string[]
}
export interface Assignment {
  username: string
  role: Role
}
