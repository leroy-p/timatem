import { useState } from 'react'
import styled from 'styled-components'
import { createGameUrl, type GameResultData } from '../utils/game-url'
import { Button } from './game-styles'

export default function ShareResult({ result }: { result: GameResultData }) {
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('')
  const [pending, setPending] = useState(false)

  async function share() {
    const url = createGameUrl(window.location.href, result)
    setPending(true)
    setLink('')
    setMessage('')
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      setMessage('Copie automatique impossible. Tu peux copier le lien ci-dessous.')
      setLink(url)
    } finally {
      setPending(false)
    }
  }

  return (
    <Container>
      <ShareButton
        type="button"
        aria-label="Partager le tirage"
        title="Partager le tirage"
        onClick={share}
        disabled={pending}
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
          focusable="false"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
        </svg>
      </ShareButton>
      <Feedback role="status">{message}</Feedback>
      {link && (
        <LinkInput
          aria-label="Lien de partage"
          value={link}
          readOnly
          onFocus={(event) => event.currentTarget.select()}
        />
      )}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
`
const ShareButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
`
const Feedback = styled.p`
  font-size: 14px;
  &:empty { display: none; }
`
const LinkInput = styled.input`
  width: 100%;
  min-width: 0;
  padding: 8px;
  border: 1px solid #686877;
  border-radius: 8px;
  background: #25252f;
  color: #f4f3ff;
  font: inherit;
  &:focus-visible { outline: 2px solid #b9b3ff; }
`
