import styled from 'styled-components'
import type { Assignment } from '../hooks/use-game'
import { getChampionSuggestions } from '../utils/champion-suggestions'
import Modal from './modal'

interface Props {
  theme: string
  assignment: Assignment
  onClose: () => void
}

export default function ChampionDialog({ theme: label, assignment, onClose }: Props) {
  const { theme, champions } = getChampionSuggestions(label, assignment.role)

  return (
    <Modal title={`${label} — ${assignment.role}`} closeLabel="Fermer la liste des champions" onClose={onClose}>
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
            Aucun champion n’est renseigné pour ce thème à cette position. Tu peux convenir d’un choix avec ton équipe.
          </p>
        ))}
    </Modal>
  )
}

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
