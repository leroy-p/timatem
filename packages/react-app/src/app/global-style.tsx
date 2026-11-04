import { createGlobalStyle } from 'styled-components'
import roboto from '../assets/fonts/Roboto-Variable.ttf'

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "Roboto";
    src: url("${roboto}") format("truetype");
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Roboto', sans-serif;
    font-size: 16px;
  }

  button, input, select, textarea {
    font-family: inherit;
  }

  h1, h2, h3, h4, h5, h6, p {
    color: ${({ theme }) => theme.palette.primary};
    letter-spacing: normal;
    line-height: normal;
    margin: 0;
  }

  p.error {
    color: ${({ theme }) => theme.palette.error};
  }

  a {
    cursor: pointer;
    text-decoration: none;

    &:hover {
      opacity: 0.7;
    }
  }

  button {
    background-color: transparent;
    border: none;
    color: ${({ theme }) => theme.palette.primary};
    cursor: pointer;
    outline:none;
    padding: 0;

    &:hover {
      opacity: 0.7;
    }
  }

  input {
    border-radius: 0;
  }

  input:focus {
    outline: none;
  }

  textarea:focus {
    outline: none;
  }
`

export default GlobalStyle
