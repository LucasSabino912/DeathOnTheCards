import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SelectCardForExchange from '../../components/modals/SelectCardForExchange'

// Mock del helper de imágenes
vi.mock('../../helpers/HelperImageCards', () => ({
  __esModule: true,
  default: (card) => `/cards/${card.name.toLowerCase().replace(/\s+/g, '_')}.png`,
}))

describe('SelectCardForExchange', () => {
  const mockHand = [
    { id: 1, name: 'Card Trade' },
    { id: 2, name: 'Hercule Poirot' },
    { id: 3, name: 'Early Train to Paddington' },
  ]

  const defaultProps = {
    isOpen: true,
    hand: mockHand,
    onConfirm: vi.fn(),
  }

  const renderModal = (props = {}) => render(<SelectCardForExchange {...defaultProps} {...props} />)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('no se renderiza si isOpen es false', () => {
    renderModal({ isOpen: false })
    expect(screen.queryByText('Elegí una carta de tu mano')).toBeNull()
  })

  it('renderiza el título y todas las cartas cuando isOpen es true', () => {
    renderModal()
    expect(screen.getByText('Elegí una carta de tu mano')).toBeInTheDocument()

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(mockHand.length)
  })

  it('muestra mensaje si la mano está vacía', () => {
    renderModal({ hand: [] })
    expect(screen.getByText('No tenés cartas en tu mano')).toBeInTheDocument()
  })

  it('cada carta tiene un src correcto generado por el helper', () => {
    renderModal()
    const images = screen.getAllByRole('img')

    expect(images[0]).toHaveAttribute('src', '/cards/card_trade.png')
    expect(images[1]).toHaveAttribute('src', '/cards/hercule_poirot.png')
    expect(images[2]).toHaveAttribute('src', '/cards/early_train_to_paddington.png')
  })

  it('permite seleccionar una carta al hacer click', () => {
    renderModal()

    const cardDivs = screen.getAllByRole('img').map(img => img.parentElement)
    const firstCard = cardDivs[0]

    // inicialmente no está seleccionada
    expect(firstCard).toHaveClass('border-[#825012]')
    expect(firstCard).not.toHaveClass('border-[#FFD700]')

    fireEvent.click(firstCard)

    // ahora debe estar seleccionada
    expect(firstCard).toHaveClass('border-[#FFD700]')
    expect(firstCard).not.toHaveClass('border-[#825012]')
  })

  it('solo una carta puede estar seleccionada a la vez', () => {
    renderModal()
    const cardDivs = screen.getAllByRole('img').map(img => img.parentElement)

    fireEvent.click(cardDivs[0])
    fireEvent.click(cardDivs[1])

    expect(cardDivs[0]).toHaveClass('border-[#825012]')
    expect(cardDivs[1]).toHaveClass('border-[#FFD700]')
  })

  it('deshabilita el botón si no hay carta seleccionada', () => {
    renderModal()
    const button = screen.getByText('Confirmar selección')

    expect(button).toBeDisabled()
    expect(button).toHaveClass('cursor-not-allowed', 'opacity-50')
  })

  it('habilita el botón cuando hay una carta seleccionada', () => {
    renderModal()
    const cardDivs = screen.getAllByRole('img').map(img => img.parentElement)
    const button = screen.getByText('Confirmar selección')

    fireEvent.click(cardDivs[1])
    expect(button).not.toBeDisabled()
    expect(button).toHaveClass('text-[#FFD700]', 'border-[#FFD700]')
  })

  it('llama a onConfirm con el id correcto al hacer click en Confirmar', () => {
    const onConfirm = vi.fn()
    renderModal({ onConfirm })

    const cardDivs = screen.getAllByRole('img').map(img => img.parentElement)
    const button = screen.getByText('Confirmar selección')

    fireEvent.click(cardDivs[2]) // selecciona carta id=3
    fireEvent.click(button)

    expect(onConfirm).toHaveBeenCalledWith(3)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('no llama onConfirm si no hay carta seleccionada', () => {
    const onConfirm = vi.fn()
    renderModal({ onConfirm })

    const button = screen.getByText('Confirmar selección')
    fireEvent.click(button)

    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('limpia la selección después de confirmar', () => {
    const onConfirm = vi.fn()
    renderModal({ onConfirm })

    const cardDivs = screen.getAllByRole('img').map(img => img.parentElement)
    const button = screen.getByText('Confirmar selección')

    fireEvent.click(cardDivs[0])
    fireEvent.click(button)

    // La carta debería haberse deseleccionado (border vuelve al color original)
    expect(cardDivs[0]).toHaveClass('border-[#825012]')
  })

  it('las cartas tienen las clases de transición y dimensiones correctas', () => {
    renderModal()
    const cardDivs = screen.getAllByRole('img').map(img => img.parentElement)

    cardDivs.forEach(card => {
      expect(card).toHaveClass('cursor-pointer', 'transition-all', 'duration-150')
      expect(card).toHaveStyle({ width: '120px', height: '180px' })
    })
  })

  it('título tiene las clases y estilos esperados', () => {
    renderModal()
    const title = screen.getByText('Elegí una carta de tu mano')

    expect(title).toHaveClass('text-2xl', 'font-bold', 'text-center', 'text-yellow-400')
  })

  it('botón aplica estilo visual correcto cuando está deshabilitado y habilitado', () => {
    renderModal()
    const button = screen.getByText('Confirmar selección')
    const cardDivs = screen.getAllByRole('img').map(img => img.parentElement)

    // deshabilitado
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')

    // habilitado después de selección
    fireEvent.click(cardDivs[0])
    expect(button).not.toHaveClass('opacity-50', 'cursor-not-allowed')
    expect(button).toHaveClass('text-[#FFD700]')
  })
})