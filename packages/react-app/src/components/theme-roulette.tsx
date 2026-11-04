import { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { Panel } from './game-styles'

const ROW_HEIGHT = 96
const SPIN_ROWS = 64
const DISTANCE = (SPIN_ROWS - 1) * ROW_HEIGHT
export const MIN_SPIN_DURATION = 6000
export const MAX_SPIN_DURATION = 10000
export const RESULT_HOLD_DURATION = 2000

interface Props {
  themes: string[]
  theme: string
  onComplete: () => void
}

export default function ThemeRoulette({ themes, theme, onComplete }: Props) {
  const [duration] = useState(
    () => MIN_SPIN_DURATION + Math.floor(Math.random() * (MAX_SPIN_DURATION - MIN_SPIN_DURATION + 1)),
  )
  const [settled, setSettled] = useState(false)
  const [entries] = useState(() => {
    const pool = themes.length ? themes : [theme]
    const randomTheme = () => pool[Math.floor(Math.random() * pool.length)]
    return [randomTheme(), theme, ...Array.from({ length: SPIN_ROWS }, randomTheme)]
  })

  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const spinDuration = reducedMotion ? 0 : duration
    const stopTimeout = window.setTimeout(() => setSettled(true), spinDuration)
    const revealTimeout = window.setTimeout(onComplete, spinDuration + RESULT_HOLD_DURATION)
    return () => {
      window.clearTimeout(stopTimeout)
      window.clearTimeout(revealTimeout)
    }
  }, [duration, onComplete])

  return (
    <RoulettePanel
      role="status"
      aria-label={settled ? `Thème choisi : ${theme}` : 'Tirage du thème en cours…'}
      aria-busy={!settled}
    >
      <Caption>{settled ? 'Ton thème' : 'Quel sera ton thème ?'}</Caption>
      <Window aria-hidden="true">
        <Selection />
        <Track $duration={duration}>
          {entries.map((entry, index) => (
            <Entry key={`${index}-${entry}`}>{entry}</Entry>
          ))}
        </Track>
        <Pointer $side="left">▸</Pointer>
        <Pointer $side="right">◂</Pointer>
      </Window>
      <Hint>{settled ? 'Les rôles arrivent…' : 'Le destin de ton équipe se joue…'}</Hint>
    </RoulettePanel>
  )
}

const spin = keyframes`
  from { transform: translateY(-${DISTANCE}px); }
  to { transform: translateY(0); }
`
const RoulettePanel = styled(Panel)`
  gap: 20px;
  overflow: hidden;
`
const Caption = styled.p`
  text-align: center;
`
const Window = styled.div`
  position: relative;
  height: ${ROW_HEIGHT * 3}px;
  overflow: hidden;
  border-radius: 12px;
  background: #111117;
  isolation: isolate;
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
`
const Selection = styled.div`
  position: absolute;
  top: ${ROW_HEIGHT}px;
  left: 0;
  right: 0;
  height: ${ROW_HEIGHT}px;
  border: 1px solid #b9b3ff;
  border-radius: 10px;
  background: #35304f;
  box-shadow: 0 0 24px rgb(185 179 255 / 15%);
`
const Track = styled.div<{ $duration: number }>`
  display: flex;
  flex-direction: column;
  position: relative;
  transform: translateY(0);
  animation: ${spin} ${({ $duration }) => $duration}ms cubic-bezier(0.08, 0.82, 0.14, 1) both;
  will-change: transform;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`
const Entry = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 ${ROW_HEIGHT}px;
  padding: 12px 28px;
  text-align: center;
  overflow-wrap: anywhere;
  font-size: clamp(16px, 4vw, 22px);
  font-weight: bold;
  line-height: 1.3;
  color: #b9b3ff;
`
const Pointer = styled.span<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${({ $side }) => $side}: 8px;
  transform: translateY(-50%);
  font-size: 24px;
  color: #82e0c4;
`
const Hint = styled.p`
  text-align: center;
  font-size: 14px;
`
