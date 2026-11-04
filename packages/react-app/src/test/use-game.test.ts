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
    expect(result.current.isDrawing).toBe(true)
    const firstResult = result.current.result
    act(() => result.current.draw())
    expect(result.current.result).toBe(firstResult)
    act(() => result.current.finishDraw())
    expect(result.current.isDrawing).toBe(false)
    act(() => result.current.draw())
    expect(result.current.isDrawing).toBe(true)
    expect(result.current.result?.assignments).toHaveLength(5)
    act(() => result.current.reset())
    expect(result.current.result).toBeNull()
    expect(result.current.isDrawing).toBe(false)
    expect(result.current.selected).toEqual(new Array(5).fill(''))
    expect(result.current.canStart).toBe(false)
  })
})

it('changes every player role on consecutive rerolls when possible, including custom roles', () => {
  const flexible = roles.map((_, index) => ({ username: `Flexible ${index}`, roles: [...roles] }))
  const { result } = renderHook(() => useGame(flexible, themes))
  act(() => flexible.forEach((player, index) => result.current.selectPlayer(index, player.username)))
  act(() => result.current.setPlayerRoles('Flexible 0', ['top', 'mid']))
  act(() => result.current.draw())
  for (let index = 0; index < 10; index++) {
    const previous = result.current.result!.assignments
    act(() => result.current.finishDraw())
    act(() => result.current.draw())
    const next = result.current.result!.assignments
    for (const entry of next) {
      expect(entry.role).not.toBe(previous.find((player) => player.username === entry.username)?.role)
    }
    expect(['top', 'mid']).toContain(next.find((entry) => entry.username === 'Flexible 0')?.role)
  }
})

it('still rerolls when no assignment can change every player role', () => {
  const fixed = roles.map((role, index) => ({ username: `Fixed ${index}`, roles: [role] }))
  const { result } = renderHook(() => useGame(fixed, themes))
  act(() => fixed.forEach((player, index) => result.current.selectPlayer(index, player.username)))
  act(() => result.current.draw())
  const previous = result.current.result
  act(() => result.current.finishDraw())
  act(() => result.current.draw())
  expect(result.current.result).not.toBe(previous)
  expect(result.current.result?.assignments).toEqual(previous?.assignments)
  expect(result.current.error).toBe('')
})
