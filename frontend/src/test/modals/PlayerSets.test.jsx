import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PlayerSetsModal from '../../components/modals/PlayerSets'

// Mock completo de HandCards para evitar el error de useGame
vi.mock('../../components/game/HandCards.jsx', () => ({
  default: ({ selectedCards, onSelect }) => (
    <div data-testid="hand-cards">
      <button onClick={() => onSelect && onSelect(1)}>
        Mock Card - {selectedCards?.length || 0} selected
      </button>
    </div>
  ),
}))

// Mock de ButtonGame
vi.mock('../../components/common/ButtonGame.jsx', () => ({
  default: ({ children, onClick, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={`button-${children}`}
    >
      {children}
    </button>
  ),
}))

// Mock de react-icons
vi.mock('react-icons/fi', () => ({
  FiArchive: () => <div data-testid="archive-icon">Archive Icon</div>,
}))

describe('PlayerSetsModal', () => {
  // Mocks de funciones
  const mockOnClose = vi.fn()
  const mockOnCardSelect = vi.fn()
  const mockOnCreateSet = vi.fn()
  const mockOnAddToset = vi.fn() // <-- NUEVO

  // Mocks de datos
  const mockSets = [
    {
      id: 1,
      position: 1, // 'position' es importante para la lógica de selección
      setName: 'Hercule Poirot',
      setType: 'poirot',
      cards: [
        { id: 101, name: 'Poirot 1', img_src: '/cards/poirot.png' },
        { id: 102, name: 'Poirot 2', img_src: '/cards/poirot.png' },
      ],
    },
  ]

  const mockSingleCard = [
    { id: 201, name: 'Miss Marple', img_src: '/cards/marple.png' },
  ]

  // Props por defecto completas
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    sets: [],
    selectedCards: [],
    onCardSelect: mockOnCardSelect,
    onCreateSet: mockOnCreateSet,
    onAddToset: mockOnAddToset, // <-- NUEVO
    hasPlayedSet: false, // <-- NUEVO
    hasPlayedEvent: false, // <-- NUEVO
    isCurrentPlayerInDisgrace: false, // <-- NUEVO
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ========== TESTS DE RENDERIZADO ==========

  describe('Renderizado básico', () => {
    it('no renderiza nada cuando isOpen es false', () => {
      const { container } = render(
        <PlayerSetsModal {...defaultProps} isOpen={false} />
      )
      expect(container.firstChild).toBeNull()
    })

    it('renderiza el modal cuando isOpen es true', () => {
      render(<PlayerSetsModal {...defaultProps} />)
      expect(screen.getByText('Sets del jugador')).toBeInTheDocument()
    })

    it('renderiza HandCards en la parte inferior', () => {
      render(<PlayerSetsModal {...defaultProps} />)
      expect(screen.getByTestId('hand-cards')).toBeInTheDocument()
    })
  })

  // ========== TESTS DE ESTADO VACÍO ==========

  describe('Estado sin sets', () => {
    it('muestra mensaje de estado vacío cuando no hay sets', () => {
      render(<PlayerSetsModal {...defaultProps} sets={[]} />)

      expect(screen.getByTestId('archive-icon')).toBeInTheDocument()
      expect(screen.getByText('No tenes sets')).toBeInTheDocument()
      expect(
        screen.getByText(/Selecciona cartas de detective de tu mano/i)
      ).toBeInTheDocument()
    })
  })

  // ========== TESTS CON SETS ==========

  describe('Renderizado de sets', () => {
    // Se usa un mock local para probar múltiples sets
    const mockMultipleSets = [
      {
        id: 1,
        setName: 'Hercule Poirot',
        setType: 'poirot',
        cards: [
          {
            id: 101,
            name: 'Hercule Poirot',
            img_src: '/cards/poirot.png',
          },
          {
            id: 102,
            name: 'Hercule Poirot',
            img_src: '/cards/poirot.png',
          },
        ],
        hasWildcard: false,
      },
      {
        id: 2,
        setName: 'Miss Marple',
        setType: 'marple',
        cards: [
          {
            id: 201,
            name: 'Miss Marple',
            img_src: '/cards/marple.png',
          },
        ],
        hasWildcard: true,
      },
    ]

    it('renderiza múltiples sets correctamente', () => {
      render(<PlayerSetsModal {...defaultProps} sets={mockMultipleSets} />)

      expect(screen.getByText('Hercule Poirot')).toBeInTheDocument()
      // Miss Marple aparece 2 veces (setName + setType)
      const marpleElements = screen.getAllByText('Miss Marple')
      expect(marpleElements).toHaveLength(2)
    })

    it('renderiza el tipo de set usando getSetTypeName', () => {
      render(<PlayerSetsModal {...defaultProps} sets={mockMultipleSets} />)

      // Nota: hay dos textos "Miss Marple", uno es setName y otro es el tipo
      const poirotType = screen.getByText('Poirot')
      expect(poirotType).toBeInTheDocument()
    })

    it('renderiza el badge "Jugado" para cada set', () => {
      render(<PlayerSetsModal {...defaultProps} sets={mockMultipleSets} />)

      const badges = screen.getAllByText('Jugado')
      expect(badges).toHaveLength(2)
    })

    it('renderiza las imágenes de las cartas correctamente', () => {
      render(<PlayerSetsModal {...defaultProps} sets={mockMultipleSets} />)

      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThan(0)
      expect(images[0]).toHaveAttribute('src', '/cards/poirot.png')
    })

    it('usa imagen por defecto cuando img_src es null', () => {
      const setsWithoutImg = [
        {
          id: 1,
          setName: 'Test Set',
          setType: 'poirot',
          cards: [{ id: 1, name: 'Test', img_src: null }],
        },
      ]

      render(<PlayerSetsModal {...defaultProps} sets={setsWithoutImg} />)

      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('src', '/cards/01-card_back.png')
    })

    it('usa setName como título del set', () => {
      render(<PlayerSetsModal {...defaultProps} sets={mockMultipleSets} />)

      expect(screen.getByText('Hercule Poirot')).toBeInTheDocument()
    })

    it('usa fallback "Set X" cuando no hay setName', () => {
      const setsWithoutName = [
        {
          id: 1,
          setType: 'poirot',
          cards: [{ id: 1, name: 'Test', img_src: '/test.png' }],
        },
      ]

      render(<PlayerSetsModal {...defaultProps} sets={setsWithoutName} />)

      expect(screen.getByText('Set 1')).toBeInTheDocument()
    })

    it('renderiza todas las cartas de un set', () => {
      const setWith3Cards = [
        {
          id: 1,
          setName: 'Test Set',
          setType: 'poirot',
          cards: [
            { id: 1, name: 'Card 1', img_src: '/card1.png' },
            { id: 2, name: 'Card 2', img_src: '/card2.png' },
            { id: 3, name: 'Card 3', img_src: '/card3.png' },
          ],
        },
      ]

      render(<PlayerSetsModal {...defaultProps} sets={setWith3Cards} />)

      const images = screen.getAllByRole('img')
      expect(images).toHaveLength(3)
    })
  })

  // ========== TESTS DE getSetTypeName ==========

  describe('Función getSetTypeName', () => {
    const testCases = [
      { setType: 'poirot', expected: 'Poirot' },
      { setType: 'marple', expected: 'Miss Marple' },
      { setType: 'satterthwaite', expected: 'Satterthwaite' },
      { setType: 'eileenbrent', expected: 'Eileen Brent' },
      { setType: 'beresford', expected: 'Hermanos Beresford' },
      { setType: 'pyne', expected: 'Parker Pyne' },
      { setType: 'unknown', expected: 'Detective' },
    ]

    testCases.forEach(({ setType, expected }) => {
      it(`mapea "${setType}" a "${expected}"`, () => {
        const sets = [
          {
            id: 1,
            setName: 'Test',
            setType: setType,
            cards: [{ id: 1, name: 'Test', img_src: '/test.png' }],
          },
        ]

        render(<PlayerSetsModal {...defaultProps} sets={sets} />)
        expect(screen.getByText(expected)).toBeInTheDocument()
      })
    })
  })

  // ========== TESTS DE INTERACCIÓN ==========

  describe('Botones de acción (Original)', () => {
    it('llama a onClose cuando se clickea "Volver"', () => {
      render(<PlayerSetsModal {...defaultProps} />)

      const volverButton = screen.getByTestId('button-Volver')
      fireEvent.click(volverButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('llama a onCreateSet cuando se clickea "Crear Set"', () => {
      render(<PlayerSetsModal {...defaultProps} selectedCards={[1, 2, 3]} />)

      const crearSetButton = screen.getByTestId('button-Crear Set')
      fireEvent.click(crearSetButton)

      expect(mockOnCreateSet).toHaveBeenCalledTimes(1)
    })

    it('deshabilita "Crear Set" cuando no hay cartas seleccionadas', () => {
      render(<PlayerSetsModal {...defaultProps} selectedCards={[]} />)

      const crearSetButton = screen.getByTestId('button-Crear Set')
      expect(crearSetButton).toBeDisabled()
    })

    it('habilita "Crear Set" cuando hay 2 o más cartas seleccionadas', () => {
      render(<PlayerSetsModal {...defaultProps} selectedCards={[1, 2]} />)

      const crearSetButton = screen.getByTestId('button-Crear Set')
      expect(crearSetButton).not.toBeDisabled()
    })
  })

  // ========== (NUEVO) TESTS DE BOTÓN "CREAR SET" (COMPLETOS) ==========

  describe('Botón "Crear Set" (Condiciones deshabilitado)', () => {
    const twoCards = [
      { id: 301, name: 'Card 1' },
      { id: 302, name: 'Card 2' },
    ]

    it.each([
      {
        name: 'cuando hay menos de 2 cartas',
        props: { selectedCards: [twoCards[0]] },
      },
      {
        name: 'cuando ya se jugó un set',
        props: { hasPlayedSet: true },
      },
      {
        name: 'cuando ya se jugó un evento',
        props: { hasPlayedEvent: true },
      },
      {
        name: 'cuando el jugador está en desgracia',
        props: { isCurrentPlayerInDisgrace: true },
      },
    ])('se deshabilita $name', ({ props }) => {
      render(
        <PlayerSetsModal
          {...defaultProps}
          selectedCards={props.selectedCards || twoCards} // Usa twoCards por defecto
          {...props} // Sobrescribe con la condición deshabilitante
        />
      )

      const createButton = screen.getByTestId('button-Crear Set')
      expect(createButton).toBeDisabled()
    })
  })

  // ========== (NUEVO) TESTS DE INTERACCIÓN - SELECCIONAR SET ==========

  describe('Interacción con sets existentes', () => {
    it('selecciona un set al hacer clic y muestra la info box', () => {
      render(<PlayerSetsModal {...defaultProps} sets={mockSets} />)

      // 1. Verificar que la info box del set no existe
      expect(
        screen.queryByText(/set seleccionado:/i)
      ).not.toBeInTheDocument()

      // 2. Hacer clic en el set (en el contenedor)
      const setElement = screen.getByText('Hercule Poirot')
      fireEvent.click(setElement.closest('div[class*="cursor-pointer"]')) // Clic en el div padre

      // 3. Verificar que la info box aparece con los nombres de las cartas
      const infoBox = screen.getByText(/set seleccionado:/i)
      expect(infoBox).toBeInTheDocument()
      expect(infoBox).toHaveTextContent('Poirot 1')
      expect(infoBox).toHaveTextContent('Poirot 2')
    })

    it('deselecciona un set al hacer clic por segunda vez', () => {
      render(<PlayerSetsModal {...defaultProps} sets={mockSets} />)

      const setElementDiv = screen
        .getByText('Hercule Poirot')
        .closest('div[class*="cursor-pointer"]')

      // 1. Hacer clic una vez para seleccionar
      fireEvent.click(setElementDiv)

      // 2. Verificar que está seleccionado
      expect(screen.getByText(/set seleccionado:/i)).toBeInTheDocument()

      // 3. Hacer clic una segunda vez para deseleccionar
      fireEvent.click(setElementDiv)

      // 4. Verificar que la info box desaparece
      expect(
        screen.queryByText(/set seleccionado:/i)
      ).not.toBeInTheDocument()
    })
  })

  // ========== (NUEVO) TESTS DE BOTÓN "AGREGAR A SET" ==========

  describe('Botón "Agregar a Set"', () => {
    it('llama a onAddToset con los argumentos correctos (camino feliz)', () => {
      render(
        <PlayerSetsModal
          {...defaultProps}
          sets={mockSets}
          selectedCards={mockSingleCard} // <-- 1 sola carta seleccionada
        />
      )

      // 1. Seleccionar el set al que queremos agregar
      fireEvent.click(
        screen
          .getByText('Hercule Poirot')
          .closest('div[class*="cursor-pointer"]')
      )

      // 2. Buscar y hacer clic en el botón "Agregar a Set"
      const addButton = screen.getByTestId('button-Agregar a Set')
      expect(addButton).not.toBeDisabled()
      fireEvent.click(addButton)

      // 3. Verificar que el callback fue llamado correctamente
      expect(mockOnAddToset).toHaveBeenCalledTimes(1)
      expect(mockOnAddToset).toHaveBeenCalledWith(
        mockSets[0], // El set seleccionado
        mockSingleCard[0] // La carta seleccionada
      )
    })

    // Usamos test.each para probar todos los casos "disabled"
    it.each([
      {
        name: 'cuando no hay cartas seleccionadas',
        props: { selectedCards: [] },
      },
      {
        name: 'cuando hay más de 1 carta seleccionada',
        props: { selectedCards: [mockSingleCard[0], mockSingleCard[0]] },
      },
      {
        name: 'cuando no hay un set seleccionado',
        props: { selectedCards: mockSingleCard },
        // En este caso, no simulamos el clic en el set
      },
      {
        name: 'cuando ya se jugó un set',
        props: { selectedCards: mockSingleCard, hasPlayedSet: true },
      },
      {
        name: 'cuando ya se jugó un evento',
        props: { selectedCards: mockSingleCard, hasPlayedEvent: true },
      },
      {
        name: 'cuando el jugador está en desgracia',
        props: {
          selectedCards: mockSingleCard,
          isCurrentPlayerInDisgrace: true,
        },
      },
    ])('se deshabilita $name', ({ name, props }) => {
      render(
        <PlayerSetsModal
          {...defaultProps}
          sets={mockSets}
          {...props} // Sobrescribe las props para este caso
        />
      )

      // Si el caso lo permite, seleccionamos un set para aislar la variable
      if (name !== 'cuando no hay un set seleccionado') {
        fireEvent.click(
          screen
            .getByText('Hercule Poirot')
            .closest('div[class*="cursor-pointer"]')
        )
      }

      const addButton = screen.getByTestId('button-Agregar a Set')
      expect(addButton).toBeDisabled()
    })
  })

  // ========== TESTS DE INFO BOX ==========

  describe('Info box de cartas seleccionadas', () => {
    it('no muestra info box cuando no hay cartas seleccionadas', () => {
      render(<PlayerSetsModal {...defaultProps} selectedCards={[]} />)

      const infoText = screen.queryByText(/carta seleccionada/i)
      expect(infoText).not.toBeInTheDocument()
    })

    it('muestra "1 carta seleccionada" en singular', () => {
      render(<PlayerSetsModal {...defaultProps} selectedCards={[1]} />)

      expect(screen.getByText('1 carta seleccionada')).toBeInTheDocument()
    })

    it('muestra "X cartas seleccionadas" en plural', () => {
      render(<PlayerSetsModal {...defaultProps} selectedCards={[1, 2, 3]} />)

      expect(screen.getByText('3 cartas seleccionadas')).toBeInTheDocument()
    })
  })

  // ========== TESTS DE MANEJO DE ERRORES DE IMÁGENES ==========

  describe('Manejo de errores de imágenes', () => {
    it('usa imagen de respaldo cuando falla la carga', () => {
      const sets = [
        {
          id: 1,
          setName: 'Test',
          setType: 'poirot',
          cards: [{ id: 1, name: 'Test', img_src: '/invalid/path.png' }],
        },
      ]

      render(<PlayerSetsModal {...defaultProps} sets={sets} />)

      const image = screen.getByRole('img')

      // Simular error de carga
      fireEvent.error(image)

      expect(image).toHaveAttribute('src', '/cards/01-card_back.png')
    })
  })

  // ========== TESTS DE ESTRUCTURA ==========

  describe('Estructura del modal', () => {
    it('renderiza el título del modal', () => {
      render(<PlayerSetsModal {...defaultProps} />)

      expect(screen.getByText('Sets del jugador')).toBeInTheDocument()
    })

    it('renderiza el título de la sección de mano', () => {
      render(<PlayerSetsModal {...defaultProps} />)

      expect(
        screen.getByText(
          'Cartas en tu mano - Selecciona cartas de detective para crear un set'
        )
      ).toBeInTheDocument()
    })

    it('pasa las props correctas a HandCards', () => {
      const selectedCards = [1, 2, 3]
      render(
        <PlayerSetsModal {...defaultProps} selectedCards={selectedCards} />
      )

      const handCards = screen.getByTestId('hand-cards')
      expect(handCards).toHaveTextContent('3 selected')
    })
  })

  // ========== TESTS DE EDGE CASES ==========

  describe('Edge cases', () => {
    it('maneja sets sin la propiedad setType', () => {
      const setsWithoutType = [
        {
          id: 1,
          setName: 'Test Set',
          cards: [{ id: 1, name: 'Test', img_src: '/test.png' }],
        },
      ]

      render(<PlayerSetsModal {...defaultProps} sets={setsWithoutType} />)

      // No debería renderizar el párrafo de tipo si no existe setType
      expect(screen.getByText('Test Set')).toBeInTheDocument()
    })

    it('maneja arrays de cards vacíos', () => {
      const setsWithEmptyCards = [
        {
          id: 1,
          setName: 'Empty Set',
          setType: 'poirot',
          cards: [],
        },
      ]

      render(<PlayerSetsModal {...defaultProps} sets={setsWithEmptyCards} />)

      expect(screen.getByText('Empty Set')).toBeInTheDocument()
      // No debería renderizar imágenes
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })
})