import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GameResult from '../components/game-result'
import players from '../data/players.json'
import { getAssignments } from '../hooks/use-game'

describe('champion popup', () => {
  const originalShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal')
  const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close')
  beforeEach(() => {
    window.localStorage.setItem('username', 'Niyuzu')
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.open = true
      },
    })
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.open = false
      },
    })
  })
  afterEach(() => {
    cleanup()
    window.localStorage.clear()
    vi.restoreAllMocks()
    for (const [name, descriptor] of [
      ['showModal', originalShowModal],
      ['close', originalClose],
    ] as const) {
      if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, name, descriptor)
      else Reflect.deleteProperty(HTMLDialogElement.prototype, name)
    }
  })

  function show(theme: string, role: 'support' | 'bot' | 'mid' = 'support') {
    render(<GameResult theme={theme} assignments={[{ username: 'Niyuzu', role }]} onDraw={vi.fn()} onReset={vi.fn()} />)
    const trigger = screen.getByRole('button', { name: `Champions pour Niyuzu, ${role}` })
    trigger.focus()
    fireEvent.click(trigger)
    return trigger
  }

  it('shows filtered champions and restores focus on close', () => {
    const trigger = show('Yordle')
    expect(screen.getByRole('dialog', { name: 'Yordle — support' })).toBeInTheDocument()
    expect(screen.getByText('Lulu')).toBeInTheDocument()
    expect(screen.queryByText('Kennen')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Fermer la liste des champions' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('closes on the native Escape cancel event', () => {
    show('Yordle')
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { bubbles: false, cancelable: true }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('explains an undocumented theme', () => {
    show('Thème non documenté')
    expect(screen.getByText(/pas encore de liste/)).toBeInTheDocument()
  })

  it('explains a contextual theme', () => {
    show('Point commun avec le précédent')
    expect(screen.getByText(/ayant un point commun/)).toBeInTheDocument()
  })

  it('explains an empty intersection', () => {
    show('Tank', 'bot')
    expect(screen.getByText(/Aucun champion n’est renseigné/)).toBeInTheDocument()
  })
  const assignments = getAssignments(players.slice(0, 5))[0]

  function renderIdentity() {
    return render(<GameResult theme="Yordle" assignments={assignments} onDraw={vi.fn()} onReset={vi.fn()} />)
  }

  it('highlights a saved player without asking again', () => {
    window.localStorage.setItem('username', assignments[0].username)
    renderIdentity()
    expect(screen.queryByRole('dialog', { name: 'Qui es-tu ?' })).not.toBeInTheDocument()
    expect(screen.getByText(assignments[0].username).closest('li')).toHaveAttribute('aria-current', 'true')
  })

  it('offers the five players and saves the chosen identity', () => {
    window.localStorage.clear()
    const view = renderIdentity()
    expect(screen.getByRole('dialog', { name: 'Qui es-tu ?' })).toBeInTheDocument()
    for (const assignment of assignments)
      expect(screen.getByRole('option', { name: assignment.username })).toBeInTheDocument()
    const username = assignments[0].username
    fireEvent.change(screen.getByRole('combobox', { name: 'Ton joueur' }), { target: { value: username } })
    expect(window.localStorage.getItem('username')).toBe(username)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText(username).closest('li')).toHaveAttribute('aria-current', 'true')
    const rerolled = getAssignments(players.slice(0, 5)).at(-1) ?? assignments
    view.rerender(<GameResult theme="Bleu" assignments={rerolled} onDraw={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getByText(username).closest('li')).toHaveAttribute('aria-current', 'true')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('asks again when the saved username is not in the current team', () => {
    window.localStorage.setItem('username', 'Joueur absent')
    renderIdentity()
    expect(screen.getByRole('dialog', { name: 'Qui es-tu ?' })).toBeInTheDocument()
  })

  it('remains usable when localStorage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Blocked')
    })
    renderIdentity()
    fireEvent.change(screen.getByRole('combobox', { name: 'Ton joueur' }), {
      target: { value: assignments[0].username },
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText(assignments[0].username).closest('li')).toHaveAttribute('aria-current', 'true')
  })
})
