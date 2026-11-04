import { type Assignment, type Player, roles } from '../types/game'

export interface GameResultData {
  theme: string
  assignments: Assignment[]
}

export function readGameUrl(url: URL, players: Player[], themes: string[]): GameResultData | null {
  const params = url.searchParams
  const theme = params.get('theme')
  if (!theme || !themes.includes(theme) || params.getAll('theme').length !== 1) return null
  const assignments: Assignment[] = []
  for (const role of roles) {
    const username = params.get(role)
    if (!username || params.getAll(role).length !== 1) return null
    if (!players.some((player) => player.username === username && player.roles.includes(role))) return null
    assignments.push({ username, role })
  }
  if (new Set(assignments.map((assignment) => assignment.username)).size !== roles.length) return null
  return { theme, assignments }
}

export function createGameUrl(currentUrl: string, result: GameResultData): string {
  const url = new URL(currentUrl)
  url.searchParams.set('theme', result.theme)
  for (const { role, username } of result.assignments) url.searchParams.set(role, username)
  return url.href
}

export function clearGameUrl() {
  const url = new URL(window.location.href)
  url.searchParams.delete('theme')
  for (const role of roles) url.searchParams.delete(role)
  window.history.replaceState(window.history.state, '', url)
}
