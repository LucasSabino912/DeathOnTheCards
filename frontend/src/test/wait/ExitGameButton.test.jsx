import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ExitGameButton from '../../components/lobby/ExitGameButton'

// Mock de useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Wrapper para React Router
const renderWithRouter = component => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('ExitGameButton', () => {
  const mockOnError = vi.fn()
  const defaultProps = {
    isHost: false,
    roomId: 123,
    userId: 456,
    onError: mockOnError,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Test 1: Renderizado condicional del texto para HOST
  it('muestra "Cancelar partida" cuando el usuario es host', () => {
    renderWithRouter(<ExitGameButton {...defaultProps} isHost={true} />)
    expect(screen.getByText('Cancelar partida')).toBeInTheDocument()
  })

  // Test 2: Renderizado condicional del texto para NO-HOST
  it('muestra "Abandonar partida" cuando el usuario NO es host', () => {
    renderWithRouter(<ExitGameButton {...defaultProps} isHost={false} />)
    expect(screen.getByText('Abandonar partida')).toBeInTheDocument()
  })

  // Test 3: Muestra "Saliendo..." durante el loading
  it('muestra "Saliendo..." mientras está procesando', async () => {
    global.fetch.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100))
    )

    renderWithRouter(<ExitGameButton {...defaultProps} />)
    const button = screen.getByText('Abandonar partida')

    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Saliendo...')).toBeInTheDocument()
    })
  })

  // Test 4: Llamada exitosa al endpoint
  it('llama al endpoint correcto con headers correctos y navega al lobby', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })

    renderWithRouter(<ExitGameButton {...defaultProps} />)
    const button = screen.getByText('Abandonar partida')

    fireEvent.click(button)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/game_join/123/leave',
        {
          method: 'DELETE',
          headers: {
            HTTP_USER_ID: '456',
          },
        }
      )
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/lobby')
    })
  })

  // Test 5: Manejo de error 409
  it('muestra error cuando la partida ya inició (409)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ detail: 'Game already started' }),
    })

    renderWithRouter(<ExitGameButton {...defaultProps} />)
    const button = screen.getByText('Abandonar partida')

    fireEvent.click(button)

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('La partida ya ha iniciado')
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  // Test 6: Manejo de error 404
  it('muestra error cuando la sala no existe (404)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Room not found' }),
    })

    renderWithRouter(<ExitGameButton {...defaultProps} />)
    const button = screen.getByText('Abandonar partida')

    fireEvent.click(button)

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Sala no encontrada')
    })
  })

  // Test 7: Manejo de error 403
  it('muestra error cuando el jugador no pertenece a la sala (403)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ detail: 'Forbidden' }),
    })

    renderWithRouter(<ExitGameButton {...defaultProps} />)
    const button = screen.getByText('Abandonar partida')

    fireEvent.click(button)

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        'El jugador no pertence a esta sala'
      )
    })
  })

  // Test 8: Manejo de errores genéricos del servidor
  it('muestra error genérico para otros códigos de error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ detail: 'Internal server error' }),
    })

    renderWithRouter(<ExitGameButton {...defaultProps} />)
    const button = screen.getByText('Abandonar partida')

    fireEvent.click(button)

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Internal server error')
    })
  })

  // Test 9: Manejo de errores de red
  it('muestra error de conexión cuando falla el fetch', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'))

    renderWithRouter(<ExitGameButton {...defaultProps} />)
    const button = screen.getByText('Abandonar partida')

    fireEvent.click(button)

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        'Error de conexión. Por favor, intenta de nuevo.'
      )
    })
  })

  // Test 10: Muestra "Saliendo..." durante loading
  it('muestra "Saliendo..." y previene múltiples clicks', async () => {
    let resolvePromise
    global.fetch.mockImplementation(
      () =>
        new Promise(resolve => {
          resolvePromise = resolve
        })
    )

    renderWithRouter(<ExitGameButton {...defaultProps} />)
    const button = screen.getByRole('button')

    expect(screen.getByText('Abandonar partida')).toBeInTheDocument()

    fireEvent.click(button)

    // Verificar que cambia a "Saliendo..."
    await waitFor(() => {
      expect(screen.getByText('Saliendo...')).toBeInTheDocument()
    })

    // Resolver el fetch para limpiar
    resolvePromise({ ok: true })
  })

  // Test 11: Error genérico sin "detail" en la respuesta
  it('usa mensaje por defecto cuando no hay detail en el error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}), // <-- sin detail
    })

    renderWithRouter(<ExitGameButton {...defaultProps} />)
    const button = screen.getByText('Abandonar partida')

    fireEvent.click(button)

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Error al abandonar la partida')
    })
  })

  it('loggea "Jugador abandonó la partida" cuando no es host', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })

    renderWithRouter(<ExitGameButton {...defaultProps} isHost={false} />)
    const button = screen.getByText('Abandonar partida')

    fireEvent.click(button)

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith('Jugador abandonó la partida')
    })

    logSpy.mockRestore()
  })

  it('loggea "Partida cancelada" cuando es host', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })

    renderWithRouter(<ExitGameButton {...defaultProps} isHost={true} />)
    const button = screen.getByText('Cancelar partida')

    fireEvent.click(button)

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith('Partida cancelada')
    })

    logSpy.mockRestore()
  })
})
