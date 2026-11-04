import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ShareResult from '../components/share-result'
import players from '../data/players.json'
import { getAssignments, useGame } from '../hooks/use-game'
import { createGameUrl, readGameUrl } from '../utils/game-url'

const themes = ['Îles Obscures', 'Point & click']
const result = { theme: themes[0], assignments: getAssignments(players.slice(0, 5))[0] }
const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')

afterEach(() => {
  cleanup()
  window.history.replaceState({}, '', '/')
  if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard)
  else Reflect.deleteProperty(navigator, 'clipboard')
})

describe('game sharing', () => {
  it('round-trips the exact theme and assignments, preserving the page path', () => {
    const url = new URL(createGameUrl('https://example.com/game?lang=fr#result', result))
    expect(url.pathname).toBe('/game')
    expect(url.hash).toBe('#result')
    expect(url.searchParams.get('lang')).toBe('fr')
    expect(readGameUrl(url, players, themes)).toEqual(result)
  })

  it('rejects unknown themes, missing or duplicate players, invalid roles and duplicate parameters', () => {
    const valid = createGameUrl('https://example.com/', result)
    for (const mutate of [
      (url: URL) => url.searchParams.set('theme', 'Inconnu'),
      (url: URL) => url.searchParams.delete('bot'),
      (url: URL) => url.searchParams.set('top', 'Inconnu'),
      (url: URL) => url.searchParams.set('top', 'Niyuzu'),
      (url: URL) => url.searchParams.set('mid', url.searchParams.get('bot') ?? ''),
      (url: URL) => url.searchParams.append('theme', themes[0]),
      (url: URL) => url.searchParams.append('top', 'Skel'),
    ]) {
      const url = new URL(valid)
      mutate(url)
      expect(readGameUrl(url, players, themes)).toBeNull()
    }
  })

  it('restores a shared draw, rerolls with the same players and clears it on reset', () => {
    window.history.replaceState({}, '', createGameUrl(window.location.href, result))
    const { result: game } = renderHook(() => useGame(players, [themes[1]], themes))
    expect(game.current.result).toEqual(result)
    expect(game.current.canStart).toBe(true)
    act(() => game.current.draw())
    expect(game.current.result?.theme).toBe(themes[1])
    expect(new Set(game.current.result?.assignments.map((entry) => entry.username))).toEqual(
      new Set(result.assignments.map((entry) => entry.username)),
    )
    expect(readGameUrl(new URL(window.location.href), players, themes)).toEqual(game.current.result)
    act(() => game.current.reset())
    expect(game.current.result).toBeNull()
    expect(window.location.search).toBe('')
  })

  it('opens the form when the shared draw is invalid', () => {
    window.history.replaceState({}, '', '?theme=Inconnu&top=Niyuzu')
    const { result: game } = renderHook(() => useGame(players, themes))
    expect(game.current.result).toBeNull()
    expect(game.current.canStart).toBe(false)
  })

  it('copies a URL representing the current result', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    render(<ShareResult result={result} />)
    fireEvent.click(screen.getByRole('button', { name: 'Partager le tirage' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Partager le tirage' })).toBeEnabled())
    expect(screen.queryByText('Lien copié !')).not.toBeInTheDocument()
    expect(readGameUrl(new URL(writeText.mock.calls[0][0]), players, themes)).toEqual(result)
  })

  it('provides a manually copyable URL if clipboard access is denied or unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('Denied')) },
    })
    const view = render(<ShareResult result={result} />)
    fireEvent.click(screen.getByRole('button', { name: 'Partager le tirage' }))
    const field = await screen.findByRole('textbox', { name: 'Lien de partage' })
    expect(readGameUrl(new URL((field as HTMLInputElement).value), players, themes)).toEqual(result)
    view.unmount()
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
    render(<ShareResult result={result} />)
    fireEvent.click(screen.getByRole('button', { name: 'Partager le tirage' }))
    expect(await screen.findByRole('textbox', { name: 'Lien de partage' })).toBeInTheDocument()
  })
  it('shows a temporary tooltip after copying and restarts its delay on another click', async () => {
    vi.useFakeTimers()
    try {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: vi.fn().mockResolvedValue(undefined) },
      })
      render(<ShareResult result={result} />)
      const button = screen.getByRole('button', { name: 'Partager le tirage' })
      await act(async () => {
        fireEvent.click(button)
        await Promise.resolve()
      })
      expect(screen.getByRole('tooltip')).toHaveTextContent('Copié dans le presse-papier')
      act(() => vi.advanceTimersByTime(1500))
      await act(async () => {
        fireEvent.click(button)
        await Promise.resolve()
      })
      act(() => vi.advanceTimersByTime(1500))
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
      act(() => vi.advanceTimersByTime(500))
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    } finally {
      cleanup()
      vi.useRealTimers()
    }
  })
})
