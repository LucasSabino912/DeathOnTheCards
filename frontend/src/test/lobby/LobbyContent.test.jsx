// LobbyContent.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// --- Mocks de componentes hijos ---
vi.mock('../../components/lobby/ProfileCard', () => ({
  default: ({ name }) => <div>ProfileCard {name}</div>,
}))

vi.mock('../../components/common/Button', () => ({
  default: ({ children, onClick }) => (
    <button onClick={onClick}>{children}</button>
  ),
}))

import LobbyContent from '../../components/lobby/LobbyContent.jsx'

describe('LobbyContent', () => {
  const mockNavigate = vi.fn()
  const mockLogout = vi.fn()
  const player = {
    name: 'Juan',
    avatar: '/avatar.png',
    birthdate: '2000-01-01',
    host: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza ProfileCard con el nombre del jugador', () => {
    render(<LobbyContent player={player} navigate={mockNavigate} handleLogout={mockLogout} />)
    expect(screen.getByText('ProfileCard Juan')).toBeInTheDocument()
  })

  it('renderiza los botones y llama a las funciones al hacer click', () => {
    render(<LobbyContent player={player} navigate={mockNavigate} handleLogout={mockLogout} />)

    const crearBtn = screen.getByText('Crear partida')
    const unirseBtn = screen.getByText('Unirse a partida')
    const salirBtn = screen.getByText('Salir')

    fireEvent.click(crearBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/newgame')

    fireEvent.click(unirseBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/games')

    fireEvent.click(salirBtn)
    expect(mockLogout).toHaveBeenCalled()
  })
})
