import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import players from '../data/players.json'
import themeData from '../data/themes.json'

const themes = themeData.map((theme) => theme.label)

import { getAssignments, roles, useGame } from '../hooks/use-game'

describe('game draw', () => {
  it('respects every role constraint for every group of five players', () => {
    function checkGroup(start: number, group: typeof players) {
      if (group.length === 5) {
        const possibilities = getAssignments(group)
        expect(possibilities.length).toBeGreaterThan(0)
        for (const assignments of possibilities) {
          expect(assignments.map((entry) => entry.role)).toEqual([...roles])
          expect(new Set(assignments.map((entry) => entry.username)).size).toBe(5)
          for (const entry of assignments) {
            expect(group.find((player) => player.username === entry.username)?.roles).toContain(entry.role)
          }
        }
        return
      }
      for (let index = start; index < players.length; index++) {
        checkGroup(index + 1, [...group, players[index]])
      }
    }
    checkGroup(0, [])
  })

  it('rejects impossible or duplicate groups', () => {
    expect(getAssignments(players.slice(0, 5).map((player) => ({ ...player, roles: ['support'] })))).toEqual([])
    expect(getAssignments(new Array(5).fill(players[0]))).toEqual([])
  })

  it('starts, redraws and resets a game', () => {
    const { result } = renderHook(() => useGame(players, themes))
    expect(result.current.canStart).toBe(false)
    act(() => {
      players.slice(0, 5).forEach((player, index) => result.current.selectPlayer(index, player.username))
    })
    expect(result.current.canStart).toBe(true)
    act(() => result.current.draw())
    expect(themes).toContain(result.current.result?.theme)
    expect(result.current.result?.assignments).toHaveLength(5)
    act(() => result.current.draw())
    expect(result.current.result?.assignments).toHaveLength(5)
    act(() => result.current.reset())
    expect(result.current.result).toBeNull()
    expect(result.current.selected).toEqual(new Array(5).fill(''))
    expect(result.current.canStart).toBe(false)
  })
})
