import styled from 'styled-components'
import type { Assignment } from '../types/game'
import Modal from './modal'

interface Props {
  assignments: Assignment[]
  onChoose: (username: string) => void
  onClose: () => void
}

export default function PlayerIdentityDialog({ assignments, onChoose, onClose }: Props) {
  return (
    <Modal title="Qui es-tu ?" closeLabel="Fermer le choix du joueur" onClose={onClose}>
      <p>Choisis ton joueur pour retrouver facilement ta ligne.</p>
      <Select aria-label="Ton joueur" defaultValue="" onChange={(event) => onChoose(event.target.value)}>
        <option value="" disabled>
          Choisir un joueur
        </option>
        {assignments.map(({ username }) => (
          <option key={username} value={username}>
            {username}
          </option>
        ))}
      </Select>
    </Modal>
  )
}

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #686877;
  border-radius: 8px;
  background: #25252f;
  color: white;
  font: inherit;
`
