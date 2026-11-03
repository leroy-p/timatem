import styled from 'styled-components'
import type { Player } from '../hooks/use-game'
import { Button, Panel } from './game-styles'

interface Props {
  players: Player[]
  selected: string[]
  canStart: boolean
  onSelect: (index: number, username: string) => void
  onStart: () => void
}

export default function PlayerForm({ players, selected, canStart, onSelect, onStart }: Props) {
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
          Joueur {index + 1}
          <Select value={username} required onChange={(event) => onSelect(index, event.target.value)}>
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
        </Field>
      ))}
      <Button type="submit" disabled={!canStart}>
        C'est parti !
      </Button>
    </Panel>
  )
}

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #686877;
  border-radius: 8px;
  background: #25252f;
  color: white;
  font: inherit;
`
