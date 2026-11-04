import { type ReactNode, useEffect, useId, useRef } from 'react'
import styled from 'styled-components'
import { Button } from './game-styles'

interface Props {
  title: ReactNode
  closeLabel: string
  onClose: () => void
  children: ReactNode
}

export default function Modal({ title, closeLabel, onClose, children }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const element = dialog.current
    const trigger = document.activeElement
    element?.showModal()
    return () => {
      element?.close()
      if (trigger instanceof HTMLElement) trigger.focus()
    }
  }, [])

  return (
    <Dialog
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <Content>
        <Heading>
          <h2 id={titleId}>{title}</h2>
          <CloseButton type="button" aria-label={closeLabel} onClick={onClose}>
            ×
          </CloseButton>
        </Heading>
        {children}
      </Content>
    </Dialog>
  )
}

const Dialog = styled.dialog`
  position: fixed;
  inset: 0;
  margin: auto;
  width: min(520px, calc(100% - 32px));
  max-height: calc(100dvh - 48px);
  box-sizing: border-box;
  padding: 0;
  border: 1px solid #686877;
  border-radius: 16px;
  background: #191920;
  color: #f4f3ff;
  font: inherit;
  overflow-y: auto;
  &::backdrop { background: rgb(0 0 0 / 75%); }
`
const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  & p, & h2 { margin: 0; }
`
const Heading = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  & h2 { color: #b9b3ff; }
`
const CloseButton = styled(Button)`
  flex-shrink: 0;
  padding: 4px 12px;
  font-size: 24px;

  &:focus-visible {
    outline: none;
  }
`
