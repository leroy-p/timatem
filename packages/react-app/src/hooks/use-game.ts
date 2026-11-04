import { useCallback, useState } from 'react'
import { type Assignment, type Player, roles } from '../types/game'
import { clearGameUrl, createGameUrl, type GameResultData, readGameUrl } from '../utils/game-url'

export { type Assignment, type Player, type Role, roles } from '../types/game'

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

export function useGame(players: Player[], themes: string[], availableThemes = themes) {
  const [initialResult] = useState(() => readGameUrl(new URL(window.location.href), players, availableThemes))
  const [selected, setSelected] = useState<string[]>(
    () => initialResult?.assignments.map((assignment) => assignment.username) ?? new Array(5).fill(''),
  )
  const [result, setResult] = useState<GameResultData | null>(initialResult)
  const [error, setError] = useState('')
  const [isDrawing, setIsDrawing] = useState(false)
  const finishDraw = useCallback(() => setIsDrawing(false), [])
  const canStart = selected.every(Boolean) && new Set(selected).size === 5

  function selectPlayer(index: number, username: string) {
    setSelected((current) => current.map((value, position) => (position === index ? username : value)))
    setError('')
  }

  function draw() {
    if (!canStart || isDrawing) return
    const possibilities = getAssignments(players.filter((player) => selected.includes(player.username)))
    if (!possibilities.length || !themes.length) {
      setError('Aucun tirage possible avec ces joueurs et les thèmes disponibles.')
      return
    }
    setError('')
    const nextResult = {
      theme: themes[Math.floor(Math.random() * themes.length)],
      assignments: possibilities[Math.floor(Math.random() * possibilities.length)],
    }
    setResult(nextResult)
    setIsDrawing(true)
    if (new URL(window.location.href).searchParams.has('theme')) {
      window.history.replaceState(window.history.state, '', createGameUrl(window.location.href, nextResult))
    }
  }

  function reset() {
    setIsDrawing(false)
    setSelected(new Array(5).fill(''))
    setResult(null)
    setError('')
    clearGameUrl()
  }

  return { selected, result, error, canStart, isDrawing, finishDraw, selectPlayer, draw, reset }
}
