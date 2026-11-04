import { useState } from 'react'
import styled from 'styled-components'
import { type Player, roles } from '../types/game'
import { Button } from './game-styles'
import Modal from './modal'

export default function PlayerRolesDialog({
  player,
  onSave,
  onClose,
}: {
  player: Player
  onSave: (username: string, roles: string[]) => void
  onClose: () => void
}) {
  const [selected, setSelected] = useState(player.roles)
  return (
    <Modal title={`Rôles de ${player.username}`} closeLabel="Fermer les rôles" onClose={onClose}>
      <Choices>
        <legend>Choisis au moins un rôle</legend>
        {roles.map((role) => (
          <Choice key={role}>
            <input
              type="checkbox"
              checked={selected.includes(role)}
              onChange={(event) => {
                setSelected((current) =>
                  event.target.checked ? [...current, role] : current.filter((entry) => entry !== role),
                )
              }}
            />
            {role}
          </Choice>
        ))}
      </Choices>
      <Button
        type="button"
        disabled={!selected.length}
        onClick={() => {
          onSave(player.username, selected)
          onClose()
        }}
      >
        Enregistrer
      </Button>
    </Modal>
  )
}

const Choices = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 0;
  padding: 0;
  margin: 0;
  & legend { margin-bottom: 16px; }
`
const Choice = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  & input { width: 18px; height: 18px; accent-color: #b9b3ff; }
`
