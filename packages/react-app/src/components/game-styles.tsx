import styled from 'styled-components'

export const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 480px;
  padding: 24px;
  box-sizing: border-box;
  border: 1px solid #42424c;
  border-radius: 16px;
  background: #191920;
`

export const Button = styled.button`
  padding: 12px 20px;
  border: 1px solid #a6a0ff;
  border-radius: 8px;
  background: #b9b3ff;
  color: #191529;
  font: inherit;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 3px solid white;
    outline-offset: 3px;
  }
`
