// Background.test.jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Background from '../../components/common/Background.jsx'

describe('Background', () => {
  it('renderiza el div con children', () => {
    render(
      <Background>
        <p>Contenido de prueba</p>
      </Background>
    )

    // Verificamos que los children estén en el DOM
    expect(screen.getByText('Contenido de prueba')).toBeInTheDocument()
    
    // Verificamos que el div tenga un background image
    const div = screen.getByText('Contenido de prueba').parentElement
    expect(div).toHaveStyle({
      backgroundImage: "url('images/bg_characters.jpeg')"
    })
  })
})
