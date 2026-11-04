import { useState } from 'react'
import styled from 'styled-components'
import type { Assignment } from '../hooks/use-game'
import { usePlayerIdentity } from '../hooks/use-player-identity'
import ChampionDialog from './champion-dialog'
import { Button, Panel } from './game-styles'
import PlayerIdentityDialog from './player-identity-dialog'
import ShareResult from './share-result'
import ThemeDifficulty from './theme-difficulty'

interface Props {
  theme: string
  assignments: Assignment[]
  onDraw: () => void
  onReset: () => void
}

export default function GameResult({ theme, assignments, onDraw, onReset }: Props) {
  const identity = usePlayerIdentity(assignments)
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null)

  return (
    <Panel>
      <div aria-live="polite">
        <ResultHeader>
          <ThemeSummary>
            <p>Thème de la partie</p>
            <ThemeTitle>{theme}</ThemeTitle>
            <ThemeDifficulty theme={theme} />
          </ThemeSummary>
          <ShareResult key={JSON.stringify({ theme, assignments })} result={{ theme, assignments }} />
        </ResultHeader>
        <Players>
          {assignments.map(({ username, role }) => (
            <PlayerRow
              key={role}
              $highlighted={identity.username === username}
              aria-current={identity.username === username ? 'true' : undefined}
            >
              <strong>{username}</strong>
              <RoleDetails>
                <RoleLabel>{role}</RoleLabel>
                <InfoButton
                  type="button"
                  aria-label={`Champions pour ${username}, ${role}`}
                  aria-haspopup="dialog"
                  onClick={() => setActiveAssignment({ username, role })}
                >
                  i
                </InfoButton>
              </RoleDetails>
            </PlayerRow>
          ))}
        </Players>
      </div>
      <Actions>
        <DrawButton
          type="button"
          onClick={() => {
            setActiveAssignment(null)
            onDraw()
          }}
        >
          Nouveau tirage
        </DrawButton>
        <Button
          type="button"
          onClick={() => {
            setActiveAssignment(null)
            onReset()
          }}
        >
          Changer les joueurs
        </Button>
      </Actions>
      {identity.isOpen && (
        <PlayerIdentityDialog assignments={assignments} onChoose={identity.choose} onClose={identity.dismiss} />
      )}
      {!identity.isOpen && activeAssignment && (
        <ChampionDialog theme={theme} assignment={activeAssignment} onClose={() => setActiveAssignment(null)} />
      )}
    </Panel>
  )
}

const DrawButton = styled(Button)`
  border-color: #5ec9ad;
  background: #82e0c4;
  color: #102b24;
`

const ResultHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
`

const ThemeSummary = styled.div`
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
`

const ThemeTitle = styled.h2`
  color: #b9b3ff;
`

const RoleLabel = styled.span`
  color: #82e0c4;
`

const RoleDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const InfoButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid #b9b3ff;
  border-radius: 50%;
  background: transparent;
  color: #b9b3ff;
  font: inherit;
  font-size: 14px;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid white;
    outline-offset: 3px;
  }
`

const Players = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0;
  margin: 24px 0 0;
  list-style: none;
`
const PlayerRow = styled.li<{ $highlighted: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: ${({ $highlighted }) => ($highlighted ? '#35304f' : '#25252f')};
  box-shadow: ${({ $highlighted }) => ($highlighted ? 'inset 0 0 0 2px #b9b3ff' : 'none')};
`
const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  & > button { width: 100%; }
`
