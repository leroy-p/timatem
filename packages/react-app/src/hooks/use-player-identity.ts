import { useState } from 'react'
import type { Assignment } from '../types/game'

export function usePlayerIdentity(assignments: Assignment[]) {
  const [savedUsername, setSavedUsername] = useState(() => {
    try {
      return window.localStorage.getItem('username')
    } catch {
      return null
    }
  })
  const [dismissed, setDismissed] = useState(false)
  const username = assignments.some((assignment) => assignment.username === savedUsername) ? savedUsername : null

  function choose(username: string) {
    if (!assignments.some((assignment) => assignment.username === username)) return
    setSavedUsername(username)
    try {
      window.localStorage.setItem('username', username)
    } catch {
      // Keep the choice for this visit when browser storage is unavailable.
    }
  }

  return { username, isOpen: !username && !dismissed, choose, dismiss: () => setDismissed(true) }
}
