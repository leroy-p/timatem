import styled from 'styled-components'
import themes from '../data/themes.json'

const levels = [
  { label: 'Très facile', background: '#82e0c4', color: '#102b24' },
  { label: 'Facile', background: '#c3e88d', color: '#20300e' },
  { label: 'Moyen', background: '#f6d776', color: '#382b08' },
  { label: 'Difficile', background: '#ffad70', color: '#411d08' },
  { label: 'Très difficile', background: '#ff8596', color: '#410f1a' },
]

export default function ThemeDifficulty({ theme }: { theme: string }) {
  const difficulty = themes.find((entry) => entry.label === theme)?.difficulty
  const level = difficulty === undefined ? undefined : levels[difficulty - 1]
  if (!level) return null

  return (
    <Badge $background={level.background} $color={level.color} aria-label={`Difficulté : ${level.label}`}>
      {level.label}
    </Badge>
  )
}

const Badge = styled.span<{ $background: string; $color: string }>`
  display: inline-flex;
  align-items: center;
  margin-top: 8px;
  padding: 5px 10px;
  border-radius: 6px;
  background: ${({ $background }) => $background};
  color: ${({ $color }) => $color};
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
`
