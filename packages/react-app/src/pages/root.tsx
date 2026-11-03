import styled from 'styled-components'
import GameResult from '../components/game-result'
import PlayerForm from '../components/player-form'
import players from '../data/players.json'
import themes from '../data/themes.json'
import { useGame } from '../hooks/use-game'
import Layout from '../layout'

export default function Root() {
  const game = useGame(players, themes)

  return (
    <Layout>
      <Container>
        <h1>Titatem</h1>
        {game.result ? (
          <GameResult {...game.result} onDraw={game.draw} onReset={game.reset} />
        ) : (
          <PlayerForm
            players={players}
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
