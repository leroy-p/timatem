import styled from 'styled-components'
import GameResult from '../components/game-result'
import PlayerForm from '../components/player-form'
import ThemeRoulette from '../components/theme-roulette'
import players from '../data/players.json'
import themes from '../data/themes.json'
import { useGame } from '../hooks/use-game'
import Layout from '../layout'

export default function Root() {
  const game = useGame(
    players,
    themes.map((theme) => theme.label),
  )

  return (
    <Layout>
      <Container>
        <h1>Timatem</h1>
        {game.isDrawing && game.result ? (
          <ThemeRoulette
            themes={themes.map((theme) => theme.label)}
            theme={game.result.theme}
            onComplete={game.finishDraw}
          />
        ) : game.result ? (
          <GameResult {...game.result} onDraw={game.draw} onReset={game.reset} />
        ) : (
          <PlayerForm
            players={game.players}
            onSaveRoles={game.setPlayerRoles}
            disabledReason={game.disabledReason}
            selected={game.selected}
            canStart={game.canStart}
            onSelect={game.selectPlayer}
            onStart={game.draw}
          />
        )}
        {game.error && <p role="alert">{game.error}</p>}
      </Container>
    </Layout>
  )
}

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding: 24px 16px;
  box-sizing: border-box;
  color: #f4f3ff;
`
