// GameEndModal.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import GameEndModal from '../../components/modals/GameEndModal'
import { GameProvider } from '../../context/GameContext'

// Mock de react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock del GameContext
const mockDisconnectFromGame = vi.fn()
vi.mock('../../context/GameContext', async () => {
  const actual = await vi.importActual('../../context/GameContext')
  return {
    ...actual,
    useGame: () => ({
      disconnectFromGame: mockDisconnectFromGame,
      gameState: {},
      gameDispatch: vi.fn(),
    }),
  }
})

// Helper para renderizar con providers
const renderWithProviders = component => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('GameEndModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderizado básico', () => {
    it('debe renderizar el título "Partida Finalizada"', () => {
      renderWithProviders(
        <GameEndModal ganaste={true} winners={[]} finish_reason="deck_empty" />
      )

      expect(screen.getByText('Partida Finalizada')).toBeInTheDocument()
    })

    it('debe renderizar el botón "Volver al Lobby"', () => {
      renderWithProviders(
        <GameEndModal ganaste={true} winners={[]} finish_reason="deck_empty" />
      )

      expect(
        screen.getByRole('button', { name: /volver al lobby/i })
      ).toBeInTheDocument()
    })
  })

  describe('Mensaje de victoria/derrota', () => {
    it('debe mostrar "¡Ganaste!" cuando ganaste es true', () => {
      renderWithProviders(
        <GameEndModal ganaste={true} winners={[]} finish_reason="deck_empty" />
      )

      expect(screen.getByText('¡Ganaste!')).toBeInTheDocument()
    })

    it('debe mostrar "Perdiste" cuando ganaste es false', () => {
      renderWithProviders(
        <GameEndModal ganaste={false} winners={[]} finish_reason="deck_empty" />
      )

      expect(screen.getByText('Perdiste')).toBeInTheDocument()
    })

    it('debe aplicar clase text-green-400 cuando ganaste', () => {
      renderWithProviders(
        <GameEndModal ganaste={true} winners={[]} finish_reason="deck_empty" />
      )

      const mensaje = screen.getByText('¡Ganaste!')
      expect(mensaje).toHaveClass('text-green-400')
    })

    it('debe aplicar clase text-red-400 cuando perdiste', () => {
      renderWithProviders(
        <GameEndModal ganaste={false} winners={[]} finish_reason="deck_empty" />
      )

      const mensaje = screen.getByText('Perdiste')
      expect(mensaje).toHaveClass('text-red-400')
    })
  })

  describe('Razón de finalización', () => {
    it('debe mostrar razón traducida para "deck_empty"', () => {
      renderWithProviders(
        <GameEndModal ganaste={true} winners={[]} finish_reason="deck_empty" />
      )

      expect(
        screen.getByText('El asesino escapó - se terminó el mazo')
      ).toBeInTheDocument()
    })

    it('debe mostrar razón traducida para "murderer_caught"', () => {
      renderWithProviders(
        <GameEndModal
          ganaste={true}
          winners={[]}
          finish_reason="murderer_caught"
        />
      )

      expect(
        screen.getByText('Los detectives atraparon al asesino')
      ).toBeInTheDocument()
    })

    it('debe mostrar razón traducida para "game_completed"', () => {
      renderWithProviders(
        <GameEndModal
          ganaste={true}
          winners={[]}
          finish_reason="game_completed"
        />
      )

      expect(screen.getByText('La partida ha finalizado')).toBeInTheDocument()
    })

    it('debe mostrar la razón original si no está en el mapa', () => {
      renderWithProviders(
        <GameEndModal
          ganaste={true}
          winners={[]}
          finish_reason="unknown_reason"
        />
      )

      expect(screen.getByText('unknown_reason')).toBeInTheDocument()
    })

    it('no debe mostrar razón si finish_reason es null', () => {
      renderWithProviders(
        <GameEndModal ganaste={true} winners={[]} finish_reason={null} />
      )

      expect(
        screen.queryByText(/asesino|detective|finalizado/i)
      ).not.toBeInTheDocument()
    })

    it('debe mostrar razón traducida para "TOTAL_DISGRACE"', () => {
      renderWithProviders(
        <GameEndModal
          ganaste={false}
          winners={[
            { player_id: 1, name: 'Malo', role: 'murderer' },
            { player_id: 2, name: 'Complice', role: 'accomplice' }
          ]}
          finish_reason="TOTAL_DISGRACE"
        />
      )
  
      expect(
        screen.getByText('¡El asesino gana! Todos los detectives cayeron en desgracia social')
      ).toBeInTheDocument()
    })
  })

  describe('Lista de ganadores', () => {
    it('debe mostrar la sección de ganadores cuando hay winners', () => {
      const winners = [{ player_id: 1, name: 'Juan', role: 'murderer' }]

      renderWithProviders(
        <GameEndModal
          ganaste={true}
          winners={winners}
          finish_reason="deck_empty"
        />
      )

      expect(screen.getByText('Ganadores:')).toBeInTheDocument()
    })

    it('no debe mostrar la sección de ganadores si winners está vacío', () => {
      renderWithProviders(
        <GameEndModal ganaste={true} winners={[]} finish_reason="deck_empty" />
      )

      expect(screen.queryByText('Ganadores:')).not.toBeInTheDocument()
    })

    it('debe mostrar el nombre del ganador', () => {
      const winners = [{ player_id: 1, name: 'Juan', role: 'murderer' }]

      renderWithProviders(
        <GameEndModal
          ganaste={true}
          winners={winners}
          finish_reason="deck_empty"
        />
      )

      expect(screen.getByText('Juan')).toBeInTheDocument()
    })

    it('debe mostrar "Jugador {id}" si no hay nombre', () => {
      const winners = [{ player_id: 42, role: 'murderer' }]

      renderWithProviders(
        <GameEndModal
          ganaste={true}
          winners={winners}
          finish_reason="deck_empty"
        />
      )

      expect(screen.getByText('Jugador 42')).toBeInTheDocument()
    })

    it('debe traducir rol "murderer" a "Asesino"', () => {
      const winners = [{ player_id: 1, name: 'Juan', role: 'murderer' }]

      renderWithProviders(
        <GameEndModal
          ganaste={true}
          winners={winners}
          finish_reason="deck_empty"
        />
      )

      expect(screen.getByText('Asesino')).toBeInTheDocument()
    })

    it('debe traducir rol "accomplice" a "Cómplice"', () => {
      const winners = [{ player_id: 1, name: 'Pedro', role: 'accomplice' }]

      renderWithProviders(
        <GameEndModal
          ganaste={true}
          winners={winners}
          finish_reason="deck_empty"
        />
      )

      expect(screen.getByText('Cómplice')).toBeInTheDocument()
    })

    it('debe traducir rol "detective" a "Detective"', () => {
      const winners = [{ player_id: 1, name: 'María', role: 'detective' }]

      renderWithProviders(
        <GameEndModal
          ganaste={true}
          winners={winners}
          finish_reason="murderer_caught"
        />
      )

      expect(screen.getByText('Detective')).toBeInTheDocument()
    })

    it('debe mostrar el rol original si no está en el mapa', () => {
      const winners = [{ player_id: 1, name: 'Luis', role: 'unknown_role' }]

      renderWithProviders(
        <GameEndModal
          ganaste={true}
          winners={winners}
          finish_reason="deck_empty"
        />
      )

      expect(screen.getByText('unknown_role')).toBeInTheDocument()
    })

    it('debe mostrar múltiples ganadores', () => {
      const winners = [
        { player_id: 1, name: 'Juan', role: 'murderer' },
        { player_id: 2, name: 'Pedro', role: 'accomplice' },
      ]

      renderWithProviders(
        <GameEndModal
          ganaste={true}
          winners={winners}
          finish_reason="deck_empty"
        />
      )

      expect(screen.getByText('Juan')).toBeInTheDocument()
      expect(screen.getByText('Pedro')).toBeInTheDocument()
      expect(screen.getByText('Asesino')).toBeInTheDocument()
      expect(screen.getByText('Cómplice')).toBeInTheDocument()
    })
  })

  describe('Funcionalidad del botón', () => {
    it('debe llamar a disconnectFromGame al hacer clic en "Volver al Lobby"', () => {
      renderWithProviders(
        <GameEndModal ganaste={true} winners={[]} finish_reason="deck_empty" />
      )

      const button = screen.getByRole('button', { name: /volver al lobby/i })
      fireEvent.click(button)

      expect(mockDisconnectFromGame).toHaveBeenCalledTimes(1)
    })

    it('debe navegar a /lobby al hacer clic en "Volver al Lobby"', () => {
      renderWithProviders(
        <GameEndModal ganaste={true} winners={[]} finish_reason="deck_empty" />
      )

      const button = screen.getByRole('button', { name: /volver al lobby/i })
      fireEvent.click(button)

      expect(mockNavigate).toHaveBeenCalledWith('/lobby')
    })

    it('debe desconectar antes de navegar', () => {
      const callOrder = []

      mockDisconnectFromGame.mockImplementation(() => {
        callOrder.push('disconnect')
      })

      mockNavigate.mockImplementation(() => {
        callOrder.push('navigate')
      })

      renderWithProviders(
        <GameEndModal ganaste={true} winners={[]} finish_reason="deck_empty" />
      )

      const button = screen.getByRole('button', { name: /volver al lobby/i })
      fireEvent.click(button)

      expect(callOrder).toEqual(['disconnect', 'navigate'])
    })
  })

  describe('Casos edge', () => {
    it('debe manejar winners como null', () => {
      renderWithProviders(
        <GameEndModal
          ganaste={true}
          winners={null}
          finish_reason="deck_empty"
        />
      )

      expect(screen.queryByText('Ganadores:')).not.toBeInTheDocument()
    })

    it('debe manejar winners como undefined', () => {
      renderWithProviders(
        <GameEndModal
          ganaste={true}
          winners={undefined}
          finish_reason="deck_empty"
        />
      )

      expect(screen.queryByText('Ganadores:')).not.toBeInTheDocument()
    })
  })
})
