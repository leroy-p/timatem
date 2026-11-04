import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import PlayerForm from '../components/player-form'
import { roles, useGame } from '../hooks/use-game'
import { createGameUrl, readGameUrl } from '../utils/game-url'

const players = roles.map((role, index) => ({ username: `Player ${index}`, roles: [role] }))
beforeEach(() => {
  window.history.replaceState({}, '', '/')
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  })
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open')
  })
})
afterEach(() => {
  cleanup()
  window.history.replaceState({}, '', '/')
})

it('blocks missing roles and impossible matchings, then draws using saved overrides', () => {
  const { result } = renderHook(() => useGame(players, ['Air']))
  expect(result.current.disabledReason).toContain('5 joueurs')
  act(() => players.forEach((player, index) => result.current.selectPlayer(index, player.username)))
  expect(result.current.canStart).toBe(true)
  act(() => result.current.setPlayerRoles('Player 0', ['jungle']))
  expect(result.current.canStart).toBe(false)
  expect(result.current.disabledReason).toContain('couvrir')
  act(() => result.current.setPlayerRoles('Player 4', ['top', 'mid', 'bot', 'support']))
  expect(result.current.canStart).toBe(false)
  expect(result.current.disabledReason).toContain('rôle différent')
  act(() => result.current.setPlayerRoles('Player 1', ['top']))
  expect(result.current.canStart).toBe(true)
  act(() => result.current.draw())
  expect(result.current.result?.assignments).toContainEqual({ username: 'Player 0', role: 'jungle' })
  expect(result.current.result?.assignments).toContainEqual({ username: 'Player 1', role: 'top' })
  const draw = result.current.result!
  const url = createGameUrl(window.location.href, draw)
  expect(readGameUrl(new URL(url), players, ['Air'])).toEqual(draw)
  window.history.replaceState({}, '', url)
  const restored = renderHook(() => useGame(players, ['Air']))
  expect(restored.result.current.canStart).toBe(true)
  act(() => restored.result.current.draw())
  expect(restored.result.current.result?.assignments).toHaveLength(5)
})

it('edits draft roles, requires at least one and only applies changes when saved', () => {
  const save = vi.fn()
  render(
    <PlayerForm
      players={players}
      selected={players.map((player) => player.username)}
      canStart={false}
      disabledReason="Rôles incompatibles"
      onSaveRoles={save}
      onSelect={vi.fn()}
      onStart={vi.fn()}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Modifier les rôles de Player 0' }))
  expect(screen.getByRole('checkbox', { name: 'top' })).toBeChecked()
  fireEvent.click(screen.getByRole('checkbox', { name: 'top' }))
  expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeDisabled()
  fireEvent.click(screen.getByRole('checkbox', { name: 'support' }))
  expect(save).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
  expect(save).toHaveBeenCalledWith('Player 0', ['support'])
  expect(screen.queryByRole('button', { name: 'Enregistrer' })).not.toBeInTheDocument()
})
