import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ThemeRoulette, { MAX_SPIN_DURATION, MIN_SPIN_DURATION, RESULT_HOLD_DURATION } from '../components/theme-roulette'
import players from '../data/players.json'
import themes from '../data/themes.json'
import { getAssignments } from '../hooks/use-game'
import Root from '../pages/root'
import { createGameUrl } from '../utils/game-url'

const SPIN_DURATION = 8000
const TOTAL_DURATION = SPIN_DURATION + RESULT_HOLD_DURATION

vi.mock('../layout', () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }))

beforeEach(() => {
  vi.useFakeTimers()
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
  window.localStorage.setItem('username', players[0].username)
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false })),
  )
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  window.localStorage.clear()
})

function startGame() {
  render(<Root />)
  screen.getAllByRole('combobox').forEach((select, index) => {
    fireEvent.change(select, { target: { value: players[index].username } })
  })
  fireEvent.click(screen.getByRole('button', { name: /^C'est parti/ }))
}

describe('theme roulette', () => {
  it('hides the roles until the spin completes and repeats on a new draw', () => {
    startGame()
    expect(screen.getByRole('status', { name: 'Tirage du thème en cours…' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Champions pour/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Nouveau tirage' })).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(TOTAL_DURATION - 1))
    expect(screen.queryByRole('button', { name: /^Champions pour/ })).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(1))
    expect(screen.getAllByRole('button', { name: /^Champions pour/ })).toHaveLength(5)
    const theme = screen.getByRole('heading', { level: 2 }).textContent
    expect(themes.map((entry) => entry.label)).toContain(theme)
    fireEvent.click(screen.getByRole('button', { name: 'Nouveau tirage' }))
    expect(screen.getByRole('status', { name: 'Tirage du thème en cours…' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Champions pour/ })).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(TOTAL_DURATION))
    expect(screen.getAllByRole('button', { name: /^Champions pour/ })).toHaveLength(5)
  })

  it('shows shared results immediately', () => {
    const result = { theme: 'Animaux', assignments: getAssignments(players.slice(0, 5))[0] }
    window.history.replaceState({}, '', createGameUrl(window.location.href, result))
    render(<Root />)
    expect(screen.queryByRole('status', { name: 'Tirage du thème en cours…' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Animaux' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^Champions pour/ })).toHaveLength(5)
  })

  it('shortens the reveal when reduced motion is requested', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    )
    startGame()
    act(() => vi.advanceTimersByTime(RESULT_HOLD_DURATION))
    expect(screen.getAllByRole('button', { name: /^Champions pour/ })).toHaveLength(5)
  })

  it('keeps the chosen theme at the final stop and cancels completion on unmount', () => {
    const onComplete = vi.fn()
    const view = render(<ThemeRoulette themes={['Feu', 'Eau']} theme="Animaux" onComplete={onComplete} />)
    expect(screen.getByText('Animaux')).toBeInTheDocument()
    view.unmount()
    act(() => vi.advanceTimersByTime(TOTAL_DURATION))
    expect(onComplete).not.toHaveBeenCalled()
  })
  it.each([
    [0, MIN_SPIN_DURATION],
    [0.5, 8000],
    [0.999999, MAX_SPIN_DURATION],
  ])('holds the selected theme for two seconds after a spin of variable length (%s)', (random, duration) => {
    vi.mocked(Math.random).mockReturnValue(random)
    const onComplete = vi.fn()
    render(<ThemeRoulette themes={['Feu', 'Eau']} theme="Animaux" onComplete={onComplete} />)
    act(() => vi.advanceTimersByTime(duration - 1))
    expect(screen.getByRole('status', { name: 'Tirage du thème en cours…' })).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(1))
    expect(screen.getByRole('status', { name: 'Thème choisi : Animaux' })).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(RESULT_HOLD_DURATION - 1))
    expect(onComplete).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
  it('displays each theme exactly once, including the chosen theme', () => {
    const labels = themes.map((entry) => entry.label)
    render(<ThemeRoulette themes={[...labels, ...labels]} theme="Animaux" onComplete={vi.fn()} />)
    for (const label of labels) expect(screen.getAllByText(label)).toHaveLength(1)
  })

  it('does not repeat the chosen theme when the available list is empty', () => {
    render(<ThemeRoulette themes={[]} theme="Animaux" onComplete={vi.fn()} />)
    expect(screen.getAllByText('Animaux')).toHaveLength(1)
  })
})
