// ButtonGame.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ButtonGame from '../../components/common/ButtonGame.jsx'

describe('ButtonGame', () => {
  it('renderiza el botón con el texto correcto', () => {
    render(<ButtonGame>Click Me</ButtonGame>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('llama a onClick cuando se hace click', () => {
    const handleClick = vi.fn()
    render(<ButtonGame onClick={handleClick}>Click Me</ButtonGame>)

    const button = screen.getByText('Click Me')
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalled()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('aplica la propiedad disabled correctamente', () => {
    const handleClick = vi.fn()
    render(
      <ButtonGame onClick={handleClick} disabled>
        No Click
      </ButtonGame>
    )

    const button = screen.getByText('No Click')
    expect(button).toBeDisabled()

    // No debería llamar onClick si está deshabilitado
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('aplica disabled=false por defecto', () => {
    render(<ButtonGame>Enabled Button</ButtonGame>)
    const button = screen.getByText('Enabled Button')
    expect(button).not.toBeDisabled()
  })

  it('aplica className personalizado junto con las clases por defecto', () => {
    render(<ButtonGame className="custom-class">Styled</ButtonGame>)
    const button = screen.getByText('Styled')
    
    expect(button).toHaveClass('custom-class')
    expect(button).toHaveClass('bg-[#3D0800]')
    expect(button).toHaveClass('text-[#B49150]')
  })

  it('aplica todas las clases de estilo por defecto', () => {
    render(<ButtonGame>Styled Button</ButtonGame>)
    const button = screen.getByText('Styled Button')
    
    // Verifica colores
    expect(button).toHaveClass('bg-[#3D0800]')
    expect(button).toHaveClass('text-[#B49150]')
    expect(button).toHaveClass('border-[#825012]')
    
    // Verifica tamaño
    expect(button).toHaveClass('px-4')
    expect(button).toHaveClass('py-2')
    
    // Verifica estilos generales
    expect(button).toHaveClass('font-semibold')
    expect(button).toHaveClass('rounded-full')
    expect(button).toHaveClass('border-4')
  })

  it('funciona sin prop onClick', () => {
    render(<ButtonGame>No Handler</ButtonGame>)
    const button = screen.getByText('No Handler')
    
    // No debería lanzar error al hacer click sin handler
    expect(() => fireEvent.click(button)).not.toThrow()
  })

  it('renderiza children de tipo elemento React', () => {
    render(
      <ButtonGame>
        <span>Icon</span>
        <span>Text</span>
      </ButtonGame>
    )
    
    expect(screen.getByText('Icon')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
  })

  it('mantiene el foco después de hacer click cuando está habilitado', () => {
    const handleClick = vi.fn()
    render(<ButtonGame onClick={handleClick}>Focus Test</ButtonGame>)
    
    const button = screen.getByText('Focus Test')
    button.focus()
    
    expect(document.activeElement).toBe(button)
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalled()
  })

  it('combina múltiples className sin conflictos', () => {
    render(
      <ButtonGame className="extra-class another-class">
        Multiple Classes
      </ButtonGame>
    )
    const button = screen.getByText('Multiple Classes')
    
    expect(button).toHaveClass('extra-class')
    expect(button).toHaveClass('another-class')
    expect(button).toHaveClass('bg-[#3D0800]')
  })
})