// LoginScreen.test.jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LoginScreen from '../../containers/loginScreen/LoginScreen'
import LoginBox from '../../components/login/LoginBox'

// Mock del componente LoginBox
vi.mock('../../components/login/LoginBox', () => ({
  default: vi.fn(() => <div data-testid="login-box">LoginBox Mock</div>)
}))

describe('LoginScreen', () => {
  it('renderiza el componente correctamente', () => {
    render(<LoginScreen />)
    expect(screen.getByTestId('login-box')).toBeInTheDocument()
  })

  it('renderiza el componente LoginBox', () => {
    render(<LoginScreen />)
    expect(LoginBox).toHaveBeenCalled()
  })

  it('renderiza LoginBox exactamente una vez', () => {
    vi.clearAllMocks()
    render(<LoginScreen />)
    expect(LoginBox).toHaveBeenCalledTimes(1)
  })

  it('no pasa props a LoginBox', () => {
    vi.clearAllMocks()
    render(<LoginScreen />)
    expect(LoginBox).toHaveBeenCalledWith({}, undefined)
  })

  it('se monta sin errores', () => {
    expect(() => render(<LoginScreen />)).not.toThrow()
  })

  it('retorna un elemento válido de React', () => {
    const { container } = render(<LoginScreen />)
    expect(container.firstChild).toBeTruthy()
  })
})