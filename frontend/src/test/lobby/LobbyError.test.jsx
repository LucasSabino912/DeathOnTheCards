import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LobbyError from '../../components/lobby/LobbyError'

describe('LobbyError', () => {
  it('renderiza el mensaje de error', () => {
    const mockNavigate = vi.fn()

    render(<LobbyError navigate={mockNavigate} />)

    expect(screen.getByText(/Debes iniciar sesion/i)).toBeInTheDocument()
  })

  it('navega a /lobby cuando se hace clic en el botón', () => {
    const mockNavigate = vi.fn()

    render(<LobbyError navigate={mockNavigate} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})
