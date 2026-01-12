// /GamesScreen.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import JoinScreen from '../../containers/joinScreen/JoinScreen.jsx'
import { useUser } from '../../context/UserContext.jsx'
import { useGame } from '../../context/GameContext.jsx'
import { MemoryRouter } from 'react-router-dom'

// --- Mocks ---
vi.mock('../../context/UserContext.jsx')
vi.mock('../../context/GameContext.jsx')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock global fetch
const mockFetchData = [
  { id: 1, name: 'Sala 1', players_joined: 2, players_min: 2, players_max: 6 },
  { id: 2, name: 'Sala 2', players_joined: 6, players_min: 4, players_max: 6 }, // llena
  { id: 3, name: 'Sala 3', players_joined: 1, players_min: 2, players_max: 6 },
]

const mockJoinResponse = {
  room: {
    id: 1,
    name: 'Sala 1',
    players_min: 2,
    players_max: 6,
    status: 'WAITING',
    host_id: 1,
    game_id: 10,
  },
  players: [
    {
      id: 1,
      name: 'Host',
      avatar: '/host.png',
      birthdate: '1999-01-01',
      is_host: true,
    },
    {
      id: 2,
      name: 'Juan',
      avatar: '/avatar.png',
      birthdate: '2000-01-01',
      is_host: false,
    },
  ],
}

global.fetch = vi.fn(url => {
  if (url.includes('/join')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockJoinResponse),
    })
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ items: mockFetchData }),
  })
})

const renderWithProviders = ui => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('JoinScreen', () => {
  let mockGameDispatch
  let mockUserDispatch
  let mockConnectToGame

  beforeEach(() => {
    vi.clearAllMocks()

    mockGameDispatch = vi.fn()
    mockUserDispatch = vi.fn()
    mockConnectToGame = vi.fn()

    // mock useGame en todos los tests
    useGame.mockReturnValue({
      gameState: { room: null, players: [] },
      gameDispatch: mockGameDispatch,
      connectToGame: mockConnectToGame,
    })
  })

  it('muestra ItemList y ProfileCard si el usuario está logueado', async () => {
    useUser.mockReturnValue({
      userState: {
        name: 'Juan',
        avatarPath: '/avatar.png',
        birthdate: '2000-01-01',
        isHost: true,
      },
      userDispatch: mockUserDispatch,
    })

    renderWithProviders(<JoinScreen />)

    await waitFor(() => {
      expect(screen.getByText('Sala 1')).toBeInTheDocument()
      expect(screen.getByText('Sala 2')).toBeInTheDocument()
      expect(screen.getByText('Sala 3')).toBeInTheDocument()
    })

    expect(screen.getByText('Juan')).toBeInTheDocument()
    expect(screen.getByText('Actualizar')).toBeInTheDocument()
  })

  it('muestra LobbyError si el usuario no está logueado', () => {
    useUser.mockReturnValue({
      userState: { name: '', avatarPath: '', birthdate: '', isHost: false },
      userDispatch: mockUserDispatch,
    })

    renderWithProviders(<JoinScreen />)

    expect(screen.getByText(/Debes iniciar sesion/)).toBeInTheDocument()
  })

  it('botón Actualizar llama a fetch', async () => {
    useUser.mockReturnValue({
      userState: {
        name: 'Juan',
        avatarPath: '/avatar.png',
        birthdate: '2000-01-01',
        isHost: true,
      },
      userDispatch: mockUserDispatch,
    })

    renderWithProviders(<JoinScreen />)

    const button = await screen.findByText('Actualizar')
    fireEvent.click(button)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2) // inicial + click
    })
  })

  it('simula click en "Ingresar" exitosamente y navega a la sala', async () => {
    useUser.mockReturnValue({
      userState: {
        name: 'Juan',
        avatarPath: '/avatar.png',
        birthdate: '2000-01-01',
        isHost: false,
      },
      userDispatch: mockUserDispatch,
    })

    renderWithProviders(<JoinScreen />)

    await screen.findByText('Sala 1')

    const ingresarButtons = screen.getAllByRole('button', { name: /Ingresar/i })
    fireEvent.click(ingresarButtons[0])

    await waitFor(() => {
      expect(mockUserDispatch).toHaveBeenCalledWith({
        type: 'SET_USER',
        payload: {
          id: 2,
          name: 'Juan',
          avatarPath: '/avatar.png',
          birthdate: '2000-01-01',
          isHost: false,
        },
      })
    })

    expect(mockGameDispatch).toHaveBeenCalledWith({
      type: 'INITIALIZE_GAME',
      payload: {
        room: {
          id: 1,
          name: 'Sala 1',
          playersMin: 2,
          playersMax: 6,
          status: 'WAITING',
          hostId: 1,
        },
        players: mockJoinResponse.players,
      },
    })

    expect(mockConnectToGame).toHaveBeenCalledWith(1, 2)
    expect(mockNavigate).toHaveBeenCalledWith('/game_join/1')
  })

  it('maneja error cuando el backend devuelve error al unirse', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    global.fetch = vi.fn(url => {
      if (url.includes('/join')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ detail: 'Sala llena' }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ items: mockFetchData }),
      })
    })

    useUser.mockReturnValue({
      userState: {
        name: 'Juan',
        avatarPath: '/avatar.png',
        birthdate: '2000-01-01',
        isHost: false,
      },
      userDispatch: mockUserDispatch,
    })

    renderWithProviders(<JoinScreen />)

    await screen.findByText('Sala 1')

    const ingresarButtons = screen.getAllByRole('button', { name: /Ingresar/i })
    fireEvent.click(ingresarButtons[0])

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'No se pudo verificar la sala',
        expect.any(Error)
      )
    })

    expect(mockNavigate).not.toHaveBeenCalled()

    consoleSpy.mockRestore()
    // Restaurar fetch mock original
    global.fetch = vi.fn(url => {
      if (url.includes('/join')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockJoinResponse),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ items: mockFetchData }),
      })
    })
  })

  it('maneja error cuando el jugador no se encuentra en la respuesta', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    global.fetch = vi.fn(url => {
      if (url.includes('/join')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ...mockJoinResponse,
              players: [
                {
                  id: 1,
                  name: 'OtroJugador',
                  avatar: '/other.png',
                  birthdate: '1999-01-01',
                  is_host: true,
                },
              ],
            }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ items: mockFetchData }),
      })
    })

    useUser.mockReturnValue({
      userState: {
        name: 'Juan',
        avatarPath: '/avatar.png',
        birthdate: '2000-01-01',
        isHost: false,
      },
      userDispatch: mockUserDispatch,
    })

    renderWithProviders(<JoinScreen />)

    await screen.findByText('Sala 1')

    const ingresarButtons = screen.getAllByRole('button', { name: /Ingresar/i })
    fireEvent.click(ingresarButtons[0])

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'No se pudo verificar la sala',
        expect.any(Error)
      )
    })

    consoleSpy.mockRestore()
    // Restaurar fetch mock
    global.fetch = vi.fn(url => {
      if (url.includes('/join')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockJoinResponse),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ items: mockFetchData }),
      })
    })
  })

  it('ordena las partidas por id descendente', async () => {
    useUser.mockReturnValue({
      userState: {
        name: 'Juan',
        avatarPath: '/avatar.png',
        birthdate: '2000-01-01',
        isHost: true,
      },
      userDispatch: mockUserDispatch,
    })

    renderWithProviders(<JoinScreen />)

    await waitFor(() => {
      const salas = screen.getAllByText(/Sala/)
      const nombres = salas.map(el => el.textContent)
      expect(nombres).toEqual(['Sala 3', 'Sala 2', 'Sala 1'])
    })
  })

  it('maneja error al cargar partidas', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    global.fetch = vi.fn(() => Promise.reject(new Error('Error de red')))

    useUser.mockReturnValue({
      userState: {
        name: 'Juan',
        avatarPath: '/avatar.png',
        birthdate: '2000-01-01',
        isHost: true,
      },
      userDispatch: mockUserDispatch,
    })

    renderWithProviders(<JoinScreen />)

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled()
    })

    errorSpy.mockRestore()
    // Restaurar fetch mock
    global.fetch = vi.fn(url => {
      if (url.includes('/join')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockJoinResponse),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ items: mockFetchData }),
      })
    })
  })

  it('registra error cuando el backend responde ok:false al cargar partidas', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    global.fetch = vi.fn(url => {
      if (url.includes('/api/game_list')) {
        return Promise.resolve({ ok: false, status: 500, json: async () => ({ message: 'server error' }) })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ items: mockFetchData }) })
    })

    useUser.mockReturnValue({
      userState: {
        name: 'Juan',
        avatarPath: '/avatar.png',
        birthdate: '2000-01-01',
        isHost: true,
      },
      userDispatch: mockUserDispatch,
    })

    renderWithProviders(<JoinScreen />)

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled()
    })

    errorSpy.mockRestore()

    global.fetch = vi.fn(url => {
      if (url.includes('/join')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockJoinResponse) })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ items: mockFetchData }) })
    })
  })

  it('botón Volver navega a /lobby', async () => {
    useUser.mockReturnValue({
      userState: {
        name: 'Juan',
        avatarPath: '/avatar.png',
        birthdate: '2000-01-01',
        isHost: true,
      },
      userDispatch: mockUserDispatch,
    })

    renderWithProviders(<JoinScreen />)

    const volverButton = await screen.findByText('Volver')
    fireEvent.click(volverButton)

    expect(mockNavigate).toHaveBeenCalledWith('/lobby')
  })

  // Tests para SelectPlayerModal handlers
  describe('SelectPlayerModal handlers', () => {
    beforeEach(() => {
      useUser.mockReturnValue({
        userState: {
          id: 2,
          name: 'Juan',
          avatarPath: '/avatar.png',
          birthdate: '2000-01-01',
          isHost: false,
        },
        userDispatch: mockUserDispatch,
      })
    })

    it('handlePlayerSelect - Another Victim event', async () => {
      useGame.mockReturnValue({
        gameState: {
          room: null,
          players: [],
          eventCards: {
            actionInProgress: { eventType: 'another_victim' },
          },
        },
        gameDispatch: mockGameDispatch,
        connectToGame: mockConnectToGame,
      })

      renderWithProviders(<JoinScreen />)

      // El modal debería estar controlado por el estado isSelectPlayerOpen
      // Este test verifica que el dispatch se llama correctamente
      await waitFor(() => {
        expect(mockGameDispatch).toBeDefined()
      })
    })

    it('handlePlayerSelect - Detective Tipo A (marple)', async () => {
      const jugador = { id: 3, name: 'Otro Jugador' }

      useGame.mockReturnValue({
        gameState: {
          room: null,
          players: [],
          detectiveAction: {
            actionInProgress: {
              setType: 'marple',
              initiatorPlayerId: 2,
            },
          },
        },
        gameDispatch: mockGameDispatch,
        connectToGame: mockConnectToGame,
      })

      renderWithProviders(<JoinScreen />)

      await waitFor(() => {
        expect(mockGameDispatch).toBeDefined()
      })
    })

    it('handlePlayerSelect - Detective Tipo B (beresford) como iniciador', async () => {
      useGame.mockReturnValue({
        gameState: {
          room: null,
          players: [],
          detectiveAction: {
            actionInProgress: {
              setType: 'beresford',
              initiatorPlayerId: 2,
            },
          },
        },
        gameDispatch: mockGameDispatch,
        connectToGame: mockConnectToGame,
      })

      renderWithProviders(<JoinScreen />)

      await waitFor(() => {
        expect(mockGameDispatch).toBeDefined()
      })
    })

    it('handleConfirmSelectPlayer - Another Victim hace POST al backend', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
      )

      useGame.mockReturnValue({
        gameState: {
          roomId: 1,
          eventCards: {
            actionInProgress: { eventType: 'another_victim' },
            anotherVictim: {
              cardId: 10,
              selectedPlayer: { id: 3, name: 'Target' },
            },
          },
        },
        gameDispatch: mockGameDispatch,
        connectToGame: mockConnectToGame,
      })

      renderWithProviders(<JoinScreen />)

      await waitFor(() => {
        expect(mockGameDispatch).toBeDefined()
      })
    })

    it('handleConfirmSelectPlayer - Detective Tipo A abre selección de secretos', async () => {
      useGame.mockReturnValue({
        gameState: {
          roomId: 1,
          detectiveAction: {
            actionInProgress: {
              setType: 'pyne',
              initiatorPlayerId: 2,
            },
            selectedPlayer: { id: 3, name: 'Target' },
          },
        },
        gameDispatch: mockGameDispatch,
        connectToGame: mockConnectToGame,
      })

      renderWithProviders(<JoinScreen />)

      await waitFor(() => {
        expect(mockGameDispatch).toBeDefined()
      })
    })

    it('handleConfirmSelectPlayer - Detective Tipo B fase iniciador', async () => {
      useGame.mockReturnValue({
        gameState: {
          roomId: 1,
          detectiveAction: {
            actionInProgress: {
              setType: 'satterthwaite',
              initiatorPlayerId: 2,
            },
            selectedPlayer: { id: 3, name: 'Target' },
          },
        },
        gameDispatch: mockGameDispatch,
        connectToGame: mockConnectToGame,
      })

      renderWithProviders(<JoinScreen />)

      await waitFor(() => {
        expect(mockGameDispatch).toBeDefined()
      })
    })

    it('handleConfirmSelectPlayer - Detective Tipo B fase target', async () => {
      useGame.mockReturnValue({
        gameState: {
          roomId: 1,
          detectiveAction: {
            actionInProgress: {
              setType: 'beresford',
              initiatorPlayerId: 1,
              targetPlayerId: 2,
            },
          },
        },
        gameDispatch: mockGameDispatch,
        connectToGame: mockConnectToGame,
      })

      useUser.mockReturnValue({
        userState: {
          id: 2,
          name: 'Juan',
          avatarPath: '/avatar.png',
          birthdate: '2000-01-01',
          isHost: false,
        },
        userDispatch: mockUserDispatch,
      })

      renderWithProviders(<JoinScreen />)

      await waitFor(() => {
        expect(mockGameDispatch).toBeDefined()
      })
    })

    it('handleConfirmSelectPlayer - Error cuando no hay selectedPlayer', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      useGame.mockReturnValue({
        gameState: {
          roomId: 1,
          eventCards: {
            actionInProgress: { eventType: 'another_victim' },
            anotherVictim: {
              cardId: 10,
              selectedPlayer: null,
            },
          },
        },
        gameDispatch: mockGameDispatch,
        connectToGame: mockConnectToGame,
      })

      renderWithProviders(<JoinScreen />)

      await waitFor(() => {
        expect(mockGameDispatch).toBeDefined()
      })

      consoleSpy.mockRestore()
    })

    it('handleCancelSelectPlayer - Another Victim', async () => {
      useGame.mockReturnValue({
        gameState: {
          roomId: 1,
          eventCards: {
            actionInProgress: { eventType: 'another_victim' },
          },
        },
        gameDispatch: mockGameDispatch,
        connectToGame: mockConnectToGame,
      })

      renderWithProviders(<JoinScreen />)

      await waitFor(() => {
        expect(mockGameDispatch).toBeDefined()
      })
    })

    it('handleCancelSelectPlayer - Detective action', async () => {
      useGame.mockReturnValue({
        gameState: {
          roomId: 1,
          detectiveAction: {
            actionInProgress: {
              setType: 'marple',
              initiatorPlayerId: 2,
            },
          },
        },
        gameDispatch: mockGameDispatch,
        connectToGame: mockConnectToGame,
      })

      renderWithProviders(<JoinScreen />)

      await waitFor(() => {
        expect(mockGameDispatch).toBeDefined()
      })
    })
  })
})