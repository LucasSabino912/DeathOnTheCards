import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React, { useEffect } from 'react'
import { GameProvider, useGame } from '../../context/GameContext.jsx'
import HideRevealStealSecrets from "../../components/modals/HideRevealStealSecrets.jsx"

vi.mock('socket.io-client', () => ({
  default: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  })),
}))

const StateInjector = ({ gameState }) => {
  const { gameDispatch } = useGame()
  
  useEffect(() => {
    if (gameState) {
      gameDispatch({
        type: 'UPDATE_GAME_STATE_PUBLIC',
        payload: gameState
      })
    }
  }, [gameState, gameDispatch])
  
  return null
}

describe('HideRevealStealSecrets', () => {
  const mockOnConfirm = vi.fn()

  const createGameState = (secrets = [], players = []) => ({
    secretsFromAllPlayers: secrets,
    jugadores: players,
  })

  const createDetective = (setType, targetPlayerId, hasWildcard = false) => ({
    current: { hasWildcard },
    actionInProgress: { setType, targetPlayerId },
  })

  const renderModal = (detective, gameState, isOpen = true) => {
    return render(
      <GameProvider>
        <StateInjector gameState={gameState} />
        <HideRevealStealSecrets
          isOpen={isOpen}
          detective={detective}
          onConfirm={mockOnConfirm}
        />
      </GameProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Partición: Modal cerrado
  it('no renderiza cuando isOpen es false', () => {
    const { container } = renderModal(
      createDetective('Poirot', 10),
      createGameState(),
      false
    )
    expect(container.firstChild).toBeNull()
  })

  // Partición: Detective Poirot con secretos mixtos
  describe('Detective Poirot', () => {
    const secrets = [
      { id: 1, position: 1, player_id: 10, hidden: true },
      { id: 2, position: 2, player_id: 10, hidden: false },
      { id: 3, position: 3, player_id: 11, hidden: true },
    ]
    const players = [{ player_id: 10, name: 'Alice' }]

    it('muestra nombre y efecto correcto con nombre de jugador', () => {
      renderModal(
        createDetective('Poirot', 10),
        createGameState(secrets, players)
      )
      expect(screen.getByText('Hercule Poirot')).toBeInTheDocument()
      expect(screen.getByText(/Elegí un secreto de Alice para revelar/)).toBeInTheDocument()
    })

    it('filtra solo secretos ocultos del jugador objetivo', () => {
      renderModal(
        createDetective('Poirot', 10),
        createGameState(secrets, players)
      )
      const cards = screen.getAllByRole('img')
      expect(cards).toHaveLength(1)
      expect(cards[0]).toHaveAttribute('alt', 'Secreto 1')
    })

    it('permite seleccionar secreto oculto y confirmar', async () => {
      renderModal(
        createDetective('Poirot', 10),
        createGameState(secrets, players)
      )
      
      const card = screen.getByAltText('Secreto 1')
      fireEvent.click(card)
      
      const confirmBtn = screen.getByText('Revelar')
      expect(confirmBtn).toBeEnabled()
      
      fireEvent.click(confirmBtn)
      
      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledWith(
          expect.objectContaining({ position: 1, player_id: 10, hidden: true })
        )
      })
    })
  })

  // Partición: Detective Pyne (lógica inversa)
  describe('Detective Pyne', () => {
    const secrets = [
      { id: 1, position: 1, player_id: 10, hidden: true },
      { id: 2, position: 2, player_id: 10, hidden: false },
    ]
    const players = [{ player_id: 10, name: 'Bob' }]

    it('filtra solo secretos revelados', () => {
      renderModal(
        createDetective('Pyne', 10),
        createGameState(secrets, players)
      )
      const cards = screen.getAllByRole('img')
      expect(cards).toHaveLength(1)
    })

    it('muestra botón con texto "Ocultar"', () => {
      renderModal(
        createDetective('Pyne', 10),
        createGameState(secrets, players)
      )
      expect(screen.getByText('Ocultar')).toBeInTheDocument()
    })
  })

  // Caso borde: Sin secretos disponibles
  it('muestra mensaje cuando no hay secretos', () => {
    renderModal(
      createDetective('Poirot', 10),
      createGameState([], [{ player_id: 10, name: 'Charlie' }])
    )
    expect(screen.getByText('No hay secretos disponibles para seleccionar')).toBeInTheDocument()
  })

  // Caso borde: Todos los secretos filtrados
  it('muestra mensaje cuando ningún secreto cumple el filtro', () => {
    const allRevealed = [
      { id: 1, position: 1, player_id: 10, hidden: false },
      { id: 2, position: 2, player_id: 10, hidden: false },
    ]
    renderModal(
      createDetective('Poirot', 10),
      createGameState(allRevealed, [{ player_id: 10, name: 'Diana' }])
    )
    expect(screen.getByText('No hay secretos disponibles para seleccionar')).toBeInTheDocument()
  })

  // Caso borde: Detective undefined
  it('maneja detective undefined con valores por defecto', () => {
    renderModal(
      undefined,
      createGameState()
    )
    expect(screen.getByText('Detective desconocido')).toBeInTheDocument()
    expect(screen.getByText('Sin efecto')).toBeInTheDocument()
  })

  // Caso borde: setType desconocido
  it('maneja setType no reconocido', () => {
    renderModal(
      createDetective('UnknownDetective', 10),
      createGameState([], [{ player_id: 10, name: 'Eve' }])
    )
    expect(screen.getByText('Detective desconocido')).toBeInTheDocument()
  })

  // Caso borde: Jugador objetivo sin nombre
  it('usa fallback cuando jugador no tiene nombre', () => {
    renderModal(
      createDetective('Marple', 99),
      createGameState([{ id: 1, position: 1, player_id: 99, hidden: true }], [])
    )
    expect(screen.getByText(/el jugador objetivo/)).toBeInTheDocument()
  })

  // Partición: Satterthwaite con wildcard
  it('muestra efecto especial para Satterthwaite con wildcard', () => {
    renderModal(
      createDetective('Satterthwaite', 10, true),
      createGameState([{ id: 1, position: 1, player_id: 10, hidden: true }], [])
    )
    expect(screen.getByText(/Como este set se jugó con Harley Quin/)).toBeInTheDocument()
  })

  // Validación botón deshabilitado
  it('botón deshabilitado sin selección', () => {
    renderModal(
      createDetective('Poirot', 10),
      createGameState([{ id: 1, position: 1, player_id: 10, hidden: true }], [])
    )
    const btn = screen.getByText('Revelar')
    expect(btn).toBeDisabled()
  })

  // Error al confirmar sin selección
  it('muestra error al confirmar sin selección', async () => {
    renderModal(
      createDetective('Poirot', 10),
      createGameState([{ id: 1, position: 1, player_id: 10, hidden: true }], [])
    )
    
    const btn = screen.getByText('Revelar')
    fireEvent.click(btn)
    
    expect(mockOnConfirm).not.toHaveBeenCalled()
  })

  // Otros detectives
  it.each([
    ['Marple', 'Miss Marple'],
    ['EileenBrent', 'Lady Eileen \'Bundle\' Brent'],
    ['TommyBeresford', 'Tommy Beresford'],
    ['TuppenceBeresford', 'Tuppence Beresford'],
    ['Beresford', 'Hermanos Beresford'],
  ])('muestra nombre correcto para detective %s', (setType, expectedName) => {
    renderModal(
      createDetective(setType, 10),
      createGameState([], [{ player_id: 10, name: 'Test' }])
    )
    expect(screen.getByText(expectedName)).toBeInTheDocument()
  })
})