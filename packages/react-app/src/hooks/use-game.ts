import { useState } from 'react'

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

export function getAssignments(players: Player[]): Assignment[][] {
  if (players.length !== roles.length || new Set(players.map((player) => player.username)).size !== roles.length)
    return []
  const results: Assignment[][] = []
  function visit(index: number, assignments: Assignment[]) {
    if (index === roles.length) {
      results.push(assignments)
      return
    }
    const role = roles[index]
    for (const player of players) {
      if (player.roles.includes(role) && !assignments.some((entry) => entry.username === player.username)) {
        visit(index + 1, [...assignments, { username: player.username, role }])
      }
    }
  }
  visit(0, [])
  return results
}

export function useGame(players: Player[], themes: string[]) {
  const [selected, setSelected] = useState<string[]>(new Array(5).fill(''))
  const [result, setResult] = useState<{ theme: string; assignments: Assignment[] } | null>(null)
  const [error, setError] = useState('')
  const canStart = selected.every(Boolean) && new Set(selected).size === 5

  function selectPlayer(index: number, username: string) {
    setSelected((current) => current.map((value, position) => (position === index ? username : value)))
    setError('')
  }

  function draw() {
    if (!canStart) return
    const possibilities = getAssignments(players.filter((player) => selected.includes(player.username)))
    if (!possibilities.length || !themes.length) {
      setError('Aucun tirage possible avec ces joueurs et les thèmes disponibles.')
      return
    }
    setError('')
    setResult({
      theme: themes[Math.floor(Math.random() * themes.length)],
      assignments: possibilities[Math.floor(Math.random() * possibilities.length)],
    })
  }

  function reset() {
    setSelected(new Array(5).fill(''))
    setResult(null)
    setError('')
  }

  return { selected, result, error, canStart, selectPlayer, draw, reset }
}
