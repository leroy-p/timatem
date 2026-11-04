import { useEffect, useId, useRef } from 'react'
import styled from 'styled-components'
import type { Assignment } from '../hooks/use-game'
import { getChampionSuggestions } from '../utils/champion-suggestions'
import { Button } from './game-styles'

interface Props {
  theme: string
  assignment: Assignment
  onClose: () => void
}

export default function ChampionDialog({ theme: label, assignment, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const { theme, champions } = getChampionSuggestions(label, assignment.role)

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
          <h2 id={titleId}>
            {label} — {assignment.role}
          </h2>
          <CloseButton type="button" aria-label="Fermer la liste des champions" onClick={onClose}>
            ×
          </CloseButton>
        </Heading>
        <p>{theme?.description ?? 'Ce thème n’a pas encore de liste de champions documentée.'}</p>
        {theme?.status === 'curated' &&
          (champions.length ? (
            <>
              <ChampionList>
                {champions.map((champion) => (
                  <Champion key={champion.id}>{champion.name}</Champion>
                ))}
              </ChampionList>
            </>
          ) : (
            <p>
              Aucun champion n’est renseigné pour ce thème à cette position. Tu peux convenir d’un choix avec ton
              équipe.
            </p>
          ))}
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
`
const ChampionList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  margin: 0;
  list-style: none;
`
const Champion = styled.li`
  padding: 8px 12px;
  border-radius: 8px;
  background: #25252f;
  color: #82e0c4;
`
