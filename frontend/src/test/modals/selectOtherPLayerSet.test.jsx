import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SelectOtherPlayerSet from '../../components/modals/SelectOtherPLayerSet'

// Mock de los componentes externos
vi.mock('../ButtonGame.jsx', () => ({
  default: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} data-testid="button-game">
      {children}
    </button>
  )
}))

vi.mock('react-icons/fi', () => ({
  FiArchive: () => <div data-testid="archive-icon">Archive Icon</div>
}))

describe('SelectOtherPlayerSet', () => {
  const mockPlayerId = 1
  const mockOnSelectSet = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderizado básico', () => {
    it('renderiza el componente correctamente', () => {
      render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={[]}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.getByText('Sets del jugador')).toBeInTheDocument()
      expect(screen.getByText('Seleccionar Set')).toBeInTheDocument()
    })

    it('aplica las clases CSS correctas al contenedor principal', () => {
      const { container } = render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={[]}
          onSelectSet={mockOnSelectSet}
        />
      )

      const overlay = container.firstChild
      expect(overlay).toHaveClass('fixed', 'inset-0', 'flex', 'z-50')
    })

    /*
    it('renderiza el sidebar con el botón', () => {
      render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={[]}
          onSelectSet={mockOnSelectSet}
        />
      )

      const button = screen.getByTestId('button-game')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Seleccionar Set')
    })
    */
  })

  describe('Estado vacío', () => {
    it('muestra el mensaje de estado vacío cuando no hay sets', () => {
      render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={[]}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.getByText('No hay sets disponibles')).toBeInTheDocument()
      expect(screen.getByText(/Ningún jugador tiene sets de detective/)).toBeInTheDocument()
      expect(screen.getByTestId('archive-icon')).toBeInTheDocument()
    })

    /*
    it('el botón está deshabilitado cuando no hay sets seleccionados', () => {
      render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={[]}
          onSelectSet={mockOnSelectSet}
        />
      )

      const button = screen.getByTestId('button-game')
      expect(button).toBeDisabled()
    })
    */
  })
  

  describe('Renderizado de sets', () => {
    const mockSets = [
      {
        owner_id: 1,
        position: 0,
        set_type: 'poirot',
        setName: 'Set Poirot',
        cards: [
          { id: 1, name: 'Card 1', img_src: '/cards/card1.png' },
          { id: 2, name: 'Card 2', img_src: '/cards/card2.png' },
          { id: 3, name: 'Card 3', img_src: '/cards/card3.png' }
        ]
      },
      {
        owner_id: 1,
        position: 1,
        set_type: 'marple',
        setName: 'Set Miss Marple',
        cards: [
          { id: 4, name: 'Card 4', img_src: '/cards/card4.png' },
          { id: 5, name: 'Card 5', img_src: '/cards/card5.png' }
        ]
      },
      {
        owner_id: 2,
        position: 0,
        set_type: 'satterthwaite',
        setName: 'Set Satterthwaite',
        cards: [
          { id: 6, name: 'Card 6', img_src: '/cards/card6.png' }
        ]
      }
    ]

    it('renderiza los sets del jugador correcto', () => {
      render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={mockSets}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.getByText('Set Poirot')).toBeInTheDocument()
      expect(screen.getByText('Set Miss Marple')).toBeInTheDocument()
      expect(screen.queryByText('Set Satterthwaite')).not.toBeInTheDocument()
    })

    it('muestra el badge "Jugado" en cada set', () => {
      render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={mockSets}
          onSelectSet={mockOnSelectSet}
        />
      )

      const jugadoBadges = screen.getAllByText('Jugado')
      expect(jugadoBadges).toHaveLength(2) // Solo los sets del jugador 1
    })

    it('muestra el nombre del tipo de set correctamente', () => {
      render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={mockSets}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.getByText('Poirot')).toBeInTheDocument()
      expect(screen.getByText('Miss Marple')).toBeInTheDocument()
    })

    it('usa el nombre por defecto cuando no hay setName', () => {
      const setsWithoutName = [
        { owner_id: 1, position: 5, set_type: 'poirot', cards: [] }
      ]
      
      render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={setsWithoutName}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.getByText('Set 5')).toBeInTheDocument()
    })

    it('usa "Detective" como nombre por defecto para set_type desconocido', () => {
      const setsWithUnknownType = [
        { owner_id: 1, position: 0, set_type: 'unknown', setName: 'Test Set', cards: [] }
      ]
      
      render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={setsWithUnknownType}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.getByText('Detective')).toBeInTheDocument()
    })

    it('renderiza las mini-cartas visuales según el array de cards', () => {
      const sets = [
        {
          owner_id: 1,
          position: 0,
          set_type: 'poirot',
          cards: [
            { id: 1, name: 'Card 1', img_src: '/cards/card1.png' },
            { id: 2, name: 'Card 2', img_src: '/cards/card2.png' },
            { id: 3, name: 'Card 3', img_src: '/cards/card3.png' }
          ]
        }
      ]
      
      const { container } = render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={sets}
          onSelectSet={mockOnSelectSet}
        />
      )

      const miniCardImages = container.querySelectorAll('img[alt]')
      expect(miniCardImages).toHaveLength(3)
    })

    it('renderiza las imágenes de las cartas correctamente', () => {
      const sets = [
        {
          owner_id: 1,
          position: 0,
          cards: [
            { id: 1, name: 'Test Card', img_src: '/cards/test.png' }
          ]
        }
      ]
      
      render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={sets}
          onSelectSet={mockOnSelectSet}
        />
      )

      const cardImage = screen.getByAltText('Test Card')
      expect(cardImage).toBeInTheDocument()
      expect(cardImage).toHaveAttribute('src', '/cards/test.png')
    })

    it('usa imagen por defecto cuando no hay img_src', () => {
      const sets = [
        {
          owner_id: 1,
          position: 0,
          cards: [
            { id: 1, name: 'Card without image' }
          ]
        }
      ]
      
      render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={sets}
          onSelectSet={mockOnSelectSet}
        />
      )

      const cardImage = screen.getByAltText('Card without image')
      expect(cardImage).toHaveAttribute('src', '/cards/01-card_back.png')
    })

    it('usa "Card" como alt text por defecto cuando no hay nombre', () => {
      const sets = [
        {
          owner_id: 1,
          position: 0,
          cards: [
            { id: 1, img_src: '/cards/card1.png' }
          ]
        }
      ]
      
      render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={sets}
          onSelectSet={mockOnSelectSet}
        />
      )

      const cardImage = screen.getByAltText('Card')
      expect(cardImage).toBeInTheDocument()
    })
  })

  describe('Interacciones', () => {
    const mockSets = [
      {
        owner_id: 1,
        position: 0,
        set_type: 'poirot',
        setName: 'Set A',
        cards: []
      },
      {
        owner_id: 1,
        position: 1,
        set_type: 'marple',
        setName: 'Set B',
        cards: []
      }
    ]

    it('selecciona un set al hacer click', () => {
      render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={mockSets}
          onSelectSet={mockOnSelectSet}
        />
      )

      const setCard = screen.getByText('Set A').closest('div[class*="border-4"]')
      fireEvent.click(setCard)

      // El set seleccionado debe tener clases de selección
      expect(setCard).toHaveClass('border-[#FFD700]')
    })
    /*
    it('habilita el botón cuando se selecciona un set', () => {
      render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={mockSets}
          onSelectSet={mockOnSelectSet}
        />
      )

      const button = screen.getByTestId('button-game')
      expect(button).toBeDisabled()

      const setCard = screen.getByText('Set A').closest('div[class*="border-4"]')
      fireEvent.click(setCard)

      expect(button).not.toBeDisabled()
    })
    */

    /*
    it('llama a onSelectSet con los datos correctos cuando se hace click en el botón', () => {
      render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={mockSets}
          onSelectSet={mockOnSelectSet}
        />
      )

      const setCard = screen.getByText('Set A').closest('div[class*="border-4"]')
      fireEvent.click(setCard)

      const button = screen.getByTestId('button-game')
      fireEvent.click(button)

      expect(mockOnSelectSet).toHaveBeenCalledWith({
        owner_id: 1,
        position: 0
      })
    })
    */

    it('cambia la selección al hacer click en otro set', () => {
      render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={mockSets}
          onSelectSet={mockOnSelectSet}
        />
      )

      const setA = screen.getByText('Set A').closest('div[class*="border-4"]')
      const setB = screen.getByText('Set B').closest('div[class*="border-4"]')

      fireEvent.click(setA)
      expect(setA).toHaveClass('border-[#FFD700]')

      fireEvent.click(setB)
      expect(setB).toHaveClass('border-[#FFD700]')
      expect(setA).not.toHaveClass('border-[#FFD700]')
    })

    it('aplica hover effect a los sets', () => {
      render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={mockSets}
          onSelectSet={mockOnSelectSet}
        />
      )

      const setCard = screen.getByText('Set A').closest('div[class*="border-4"]')
      expect(setCard).toHaveClass('hover:scale-105')
    })
  })

  describe('Props por defecto', () => {
    it('usa un array vacío como default para sets', () => {
      render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.getByText('No hay sets disponibles')).toBeInTheDocument()
    })
  })

  describe('Casos edge', () => {
    it('maneja sets con set_type undefined', () => {
      const setsWithoutType = [
        {
          owner_id: 1,
          position: 0,
          setName: 'Test Set',
          cards: []
        }
      ]
      
      render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={setsWithoutType}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.getByText('Test Set')).toBeInTheDocument()
      expect(screen.queryByText('Detective')).not.toBeInTheDocument()
    })

    it('maneja un jugador sin sets cuando otros jugadores tienen sets', () => {
      const playerWithoutSets = 99
      const sets = [
        {
          owner_id: 1,
          position: 0,
          set_type: 'poirot',
          setName: 'Set A',
          cards: []
        },
        {
          owner_id: 2,
          position: 0,
          set_type: 'marple',
          setName: 'Set B',
          cards: []
        }
      ]

      render(
        <SelectOtherPlayerSet
          player={playerWithoutSets}
          sets={sets}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.queryByText('Set A')).not.toBeInTheDocument()
      expect(screen.queryByText('Set B')).not.toBeInTheDocument()
      expect(screen.getByText('No hay sets disponibles')).toBeInTheDocument()
    })

    it('maneja múltiples sets del mismo jugador', () => {
      const manySets = Array.from({ length: 5 }, (_, i) => ({
        owner_id: 1,
        position: i,
        set_type: 'poirot',
        setName: `Set ${i + 1}`,
        cards: []
      }))

      render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={manySets}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.getByText('Set 1')).toBeInTheDocument()
      expect(screen.getByText('Set 5')).toBeInTheDocument()
    })

    it('maneja sets sin cards array', () => {
      const setsWithoutCards = [
        {
          owner_id: 1,
          position: 0,
          set_type: 'poirot',
          setName: 'Set without cards'
        }
      ]
      
      const { container } = render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={setsWithoutCards}
          onSelectSet={mockOnSelectSet}
        />
      )

      // No debería haber imágenes de cartas
      const cardImages = container.querySelectorAll('img[alt]')
      expect(cardImages).toHaveLength(0)
    })

    it('maneja todos los tipos de detectives conocidos', () => {
      const allDetectives = [
        { owner_id: 1, position: 0, set_type: 'poirot', setName: 'Set 1', cards: [] },
        { owner_id: 1, position: 1, set_type: 'marple', setName: 'Set 2', cards: [] },
        { owner_id: 1, position: 2, set_type: 'satterthwaite', setName: 'Set 3', cards: [] },
        { owner_id: 1, position: 3, set_type: 'eileenbrent', setName: 'Set 4', cards: [] },
        { owner_id: 1, position: 4, set_type: 'beresford', setName: 'Set 5', cards: [] },
        { owner_id: 1, position: 5, set_type: 'pyne', setName: 'Set 6', cards: [] }
      ]

      render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={allDetectives}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.getByText('Poirot')).toBeInTheDocument()
      expect(screen.getByText('Miss Marple')).toBeInTheDocument()
      expect(screen.getByText('Satterthwaite')).toBeInTheDocument()
      expect(screen.getByText('Eileen Brent')).toBeInTheDocument()
      expect(screen.getByText('Hermanos Beresford')).toBeInTheDocument()
      expect(screen.getByText('Parker Pyne')).toBeInTheDocument()
    })
  })

  describe('Estructura y estilos', () => {
    it('usa grid layout para los sets', () => {
      const sets = [
        { owner_id: 1, position: 0, setName: 'Set A', cards: [] }
      ]

      const { container } = render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={sets}
          onSelectSet={mockOnSelectSet}
        />
      )

      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2')
    })

    it('aplica estilos de selección correctos', () => {
      const sets = [
        { owner_id: 1, position: 0, setName: 'Set A', cards: [] }
      ]

      render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={sets}
          onSelectSet={mockOnSelectSet}
        />
      )

      const setCard = screen.getByText('Set A').closest('div[class*="border-4"]')
      fireEvent.click(setCard)

      expect(setCard).toHaveClass('ring-2', 'ring-[#FFD700]', 'shadow-[0_0_10px_#FFD700]')
    })

    it('usa la key correcta para cada set', () => {
      const sets = [
        { owner_id: 1, position: 0, setName: 'Set A', cards: [] },
        { owner_id: 1, position: 1, setName: 'Set B', cards: [] }
      ]

      const { container } = render(
        <SelectOtherPlayerSet
          player={mockPlayerId}
          sets={sets}
          onSelectSet={mockOnSelectSet}
        />
      )

      const setCards = container.querySelectorAll('[class*="border-4 rounded-2xl p-4"]')
      expect(setCards.length).toBeGreaterThanOrEqual(2)
    })
  })
})