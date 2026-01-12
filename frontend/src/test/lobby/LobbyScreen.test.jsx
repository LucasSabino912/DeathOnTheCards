// LobbyScreen.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- Mocks ---
const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('../../context/UserContext.jsx', () => ({
  useUser: vi.fn(),
}))

vi.mock('../../context/GameContext.jsx', () => ({
  useGame: vi.fn(),
}))

vi.mock('../../components/common/Background', () => ({
  default: ({ children }) => <div data-testid="background">{children}</div>,
}))

// LobbyContent mock con botón para handleLogout
vi.mock('../../components/lobby/LobbyContent', () => ({
  default: ({ player, handleLogout }) => (
    <div>
      LobbyContent {player.name}
      <button onClick={handleLogout}>Logout</button>
    </div>
  ),
}))

vi.mock('../../components/lobby/LobbyError', () => ({
  default: () => <div>LobbyError</div>,
}))

import { useUser } from '../../context/UserContext.jsx'
import { useGame } from '../../context/GameContext.jsx'
import LobbyScreen from '../../containers/lobbyScreen/LobbyScreen.jsx'

describe('LobbyScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra LobbyContent si el usuario está logueado', () => {
    const mockDispatch = vi.fn()

    useUser.mockReturnValue({
      userState: { name: 'Juan', avatarPath: '/avatar.png', birthdate: '2000-01-01', isHost: true },
      userDispatch: mockDispatch,
    })

    useGame.mockReturnValue({ gameState: {} })

    render(<LobbyScreen />)

    expect(screen.getByTestId('background')).toBeInTheDocument()
    expect(screen.getByText('LobbyContent Juan')).toBeInTheDocument()
  })

  it('ejecuta handleLogout al hacer click', () => {
    const mockDispatch = vi.fn()

    useUser.mockReturnValue({
      userState: { name: 'Juan', avatarPath: '/avatar.png', birthdate: '2000-01-01', isHost: true },
      userDispatch: mockDispatch,
    })

    useGame.mockReturnValue({ gameState: {} })

    render(<LobbyScreen />)

    const button = screen.getByText('Logout')
    fireEvent.click(button)

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLEAR_USER' })
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('muestra LobbyError si el usuario no está logueado', () => {
    useUser.mockReturnValue({
      userState: { name: '', avatarPath: '', birthdate: '', isHost: false },
      userDispatch: vi.fn(),
    })

    useGame.mockReturnValue({ gameState: {} })

    render(<LobbyScreen />)

    expect(screen.getByText('LobbyError')).toBeInTheDocument()
  })
})
