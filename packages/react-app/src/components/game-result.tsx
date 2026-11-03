import styled from 'styled-components'
import type { Assignment } from '../hooks/use-game'
import { Button, Panel } from './game-styles'

interface Props {
  theme: string
  assignments: Assignment[]
  onDraw: () => void
  onReset: () => void
}

export default function GameResult({ theme, assignments, onDraw, onReset }: Props) {
  return (
    <Panel>
      <div aria-live="polite">
        <p>Thème de la partie</p>
        <ThemeTitle>{theme}</ThemeTitle>
        <Players>
          {assignments.map(({ username, role }) => (
            <PlayerRow key={role}>
              <strong>{username}</strong>
              <RoleLabel>{role}</RoleLabel>
            </PlayerRow>
          ))}
        </Players>
      </div>
      <Actions>
        <DrawButton type="button" onClick={onDraw}>
          Nouveau tirage
        </DrawButton>
        <Button type="button" onClick={onReset}>
          Changer les joueurs
        </Button>
      </Actions>
    </Panel>
  )
}

const DrawButton = styled(Button)`
  border-color: #5ec9ad;
  background: #82e0c4;
  color: #102b24;
`

const ThemeTitle = styled.h2`
  color: #b9b3ff;
`

const RoleLabel = styled.span`
  color: #82e0c4;
`

const Players = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0;
  margin: 24px 0 0;
  list-style: none;
`
const PlayerRow = styled.li`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #25252f;
`
const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  & > button { width: 100%; }
`
