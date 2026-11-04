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
  const [roleOverrides, setRoleOverrides] = useState<Record<string, string[]>>(() => {
    const overrides: Record<string, string[]> = {}
    for (const assignment of initialResult?.assignments ?? []) {
      const player = players.find((entry) => entry.username === assignment.username)
      if (player && !player.roles.includes(assignment.role))
        overrides[player.username] = [...player.roles, assignment.role]
    }
    return overrides
  })
  const effectivePlayers = players.map((player) => ({
    ...player,
    roles: roleOverrides[player.username] ?? player.roles,
  }))
  const [result, setResult] = useState<GameResultData | null>(initialResult)
  const [error, setError] = useState('')
  const [isDrawing, setIsDrawing] = useState(false)
  const finishDraw = useCallback(() => setIsDrawing(false), [])
  const complete = selected.every(Boolean) && new Set(selected).size === 5
  const possibilities = complete
    ? getAssignments(effectivePlayers.filter((player) => selected.includes(player.username)))
    : []
  const covered = new Set(
    effectivePlayers.filter((player) => selected.includes(player.username)).flatMap((player) => player.roles),
  )
  const disabledReason = !complete
    ? 'Choisis 5 joueurs distincts pour commencer.'
    : !roles.every((role) => covered.has(role))
      ? 'Les rôles sélectionnés doivent couvrir top, jungle, mid, bot et support.'
      : !possibilities.length
        ? 'Ces choix ne permettent pas d’attribuer un rôle différent à chaque joueur.'
        : ''
  const canStart = !disabledReason

  function setPlayerRoles(username: string, nextRoles: string[]) {
    const validRoles = roles.filter((role) => nextRoles.includes(role))
    if (!players.some((player) => player.username === username) || !validRoles.length) return
    setRoleOverrides((current) => ({ ...current, [username]: validRoles }))
    setError('')
  }

  function selectPlayer(index: number, username: string) {
    setSelected((current) => current.map((value, position) => (position === index ? username : value)))
    setError('')
  }

  function draw() {
    if (!canStart || isDrawing) return
    if (!possibilities.length || !themes.length) {
      setError('Aucun tirage possible avec ces joueurs et les thèmes disponibles.')
      return
    }
    setError('')
    const previousRoles = new Map(result?.assignments.map(({ username, role }) => [username, role]))
    const changedAssignments = result
      ? possibilities.filter((assignments) =>
          assignments.every(({ username, role }) => previousRoles.get(username) !== role),
        )
      : []
    const candidates = changedAssignments.length ? changedAssignments : possibilities
    const nextResult = {
      theme: themes[Math.floor(Math.random() * themes.length)],
      assignments: candidates[Math.floor(Math.random() * candidates.length)],
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

  return {
    players: effectivePlayers,
    setPlayerRoles,
    disabledReason,
    selected,
    result,
    error,
    canStart,
    isDrawing,
    finishDraw,
    selectPlayer,
    draw,
    reset,
  }
}
