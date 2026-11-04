import { useId, useState } from 'react'
import styled from 'styled-components'
import type { Player } from '../hooks/use-game'
import { Button, Panel } from './game-styles'
import PlayerRolesDialog from './player-roles-dialog'

interface Props {
  players: Player[]
  selected: string[]
  disabledReason: string
  onSaveRoles: (username: string, roles: string[]) => void
  canStart: boolean
  onSelect: (index: number, username: string) => void
  onStart: () => void
}

export default function PlayerForm({
  players,
  selected,
  canStart,
  onSelect,
  onStart,
  onSaveRoles,
  disabledReason,
}: Props) {
  const [editing, setEditing] = useState<string | null>(null)
  const tooltipId = useId()
  const editingPlayer = players.find((player) => player.username === editing)
  return (
    <Panel
      as="form"
      onSubmit={(event) => {
        event.preventDefault()
        onStart()
      }}
    >
      <h2>Choisis tes 5 joueurs</h2>
      {selected.map((username, index) => (
        <Field key={`player-${index + 1}`}>
          <label htmlFor={`player-select-${index}`}>Joueur {index + 1}</label>
          <SelectRow>
            <Select
              id={`player-select-${index}`}
              value={username}
              required
              onChange={(event) => onSelect(index, event.target.value)}
            >
              <option value="">Choisir un joueur</option>
              {players.map((player) => (
                <option
                  key={player.username}
                  value={player.username}
                  disabled={selected.includes(player.username) && username !== player.username}
                >
                  {player.username}
                </option>
              ))}
            </Select>
            <EditButton
              type="button"
              aria-label={`Modifier les rôles de ${username || `Joueur ${index + 1}`}`}
              disabled={!username}
              onClick={() => setEditing(username)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m16 3 5 5-12 12-6 1 1-6Z M14 5l5 5" />
              </svg>
            </EditButton>
          </SelectRow>
        </Field>
      ))}
      <StartWrapper tabIndex={!canStart ? 0 : undefined} aria-describedby={!canStart ? tooltipId : undefined}>
        <StartButton type="submit" disabled={!canStart} aria-describedby={!canStart ? tooltipId : undefined}>
          C'est parti !
        </StartButton>
        {!canStart && (
          <Tooltip id={tooltipId} role="tooltip">
            {disabledReason}
          </Tooltip>
        )}
      </StartWrapper>
      {editingPlayer && (
        <PlayerRolesDialog
          key={editingPlayer.username}
          player={editingPlayer}
          onSave={onSaveRoles}
          onClose={() => setEditing(null)}
        />
      )}
    </Panel>
  )
}

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Select = styled.select`
  flex: 1;
  min-width: 0;
  width: 100%;
  padding: 12px;
  border: 1px solid #686877;
  border-radius: 8px;
  background: #25252f;
  color: white;
  font: inherit;
`

const SelectRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: 8px;
`
const EditButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 44px;
  padding: 0;
`
const StartButton = styled(Button)`
  width: 100%;
  &:disabled { pointer-events: none; }
`
const StartWrapper = styled.div`
  position: relative;
  &:hover > [role="tooltip"], &:focus-within > [role="tooltip"] { visibility: visible; }
`
const Tooltip = styled.span`
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  z-index: 10;
  width: max-content;
  max-width: min(260px, calc(100vw - 64px));
  padding: 8px 12px;
  border: 1px solid #b9b3ff;
  border-radius: 8px;
  background: #25252f;
  color: #f4f3ff;
  font-size: 13px;
  pointer-events: none;
  visibility: hidden;
`
