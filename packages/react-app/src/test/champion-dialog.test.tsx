import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GameResult from '../components/game-result'

describe('champion popup', () => {
  const originalShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal')
  const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close')
  beforeEach(() => {
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
})
