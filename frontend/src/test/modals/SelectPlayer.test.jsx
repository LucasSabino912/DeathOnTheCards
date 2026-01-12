import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../../context/UserContext.jsx', () => ({
  useUser: vi.fn()
}));

vi.mock('../../context/GameContext.jsx', () => ({
  useGame: vi.fn()
}));

vi.mock('../../components/common/Button.jsx', () => ({
  default: ({ onClick, title, disabled, children }) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      data-testid={`button-${title?.toLowerCase()}`}
    >
      {children}
    </button>
  )
}));

// AHORA sí importamos el componente
import SelectPlayerModal from '../../components/modals/SelectPlayer.jsx';
import { useUser } from '../../context/UserContext.jsx';
import { useGame } from '../../context/GameContext.jsx';

// Mock data
const mockUserState = {
  id: '1'
};

const mockGameState = {
  jugadores: [
    { player_id: '1', name: 'Jugador 1', avatar: 'avatar1.png', birthdate: '1990-01-01' },
    { player_id: '2', name: 'Jugador 2', avatar: 'avatar2.png', birthdate: '1991-02-02' },
    { player_id: '3', name: 'Jugador 3', avatar: 'avatar3.png', birthdate: '1992-03-03' }
  ]
};

describe('SelectPlayerModal', () => {
  const mockOnPlayerSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configurar los mocks antes de cada test
    mockUserState.id = '1';
    mockGameState.jugadores = [
      { player_id: '1', name: 'Jugador 1', avatar: 'avatar1.png', birthdate: '1990-01-01' },
      { player_id: '2', name: 'Jugador 2', avatar: 'avatar2.png', birthdate: '1991-02-02' },
      { player_id: '3', name: 'Jugador 3', avatar: 'avatar3.png', birthdate: '1992-03-03' }
    ];

    // Implementar los mocks
    useUser.mockReturnValue({
      userState: mockUserState
    });

    useGame.mockReturnValue({
      gameState: mockGameState
    });
  });

  describe('Renderizado básico', () => {
    it('renderiza el modal correctamente', () => {
      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      expect(screen.getByText('Selecciona un jugador')).toBeInTheDocument();
      expect(screen.getByTestId('button-confirmar')).toBeInTheDocument();
    });

    it('aplica las clases CSS correctas al contenedor principal', () => {
      const { container } = render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const modalLayout = container.firstChild;
      expect(modalLayout).toHaveClass('fixed', 'inset-0', 'flex', 'z-50');
    });

    it('aplica las clases correctas al contenedor del modal', () => {
      const { container } = render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const modalContainer = container.querySelector('.bg-\\[\\#1D0000\\]');
      expect(modalContainer).toHaveClass('border-4', 'border-[#825012]', 'rounded-2xl');
    });
  });

  describe('Lista de jugadores', () => {

    it('muestra los nombres correctos de los jugadores', () => {
      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      expect(screen.getByText('Jugador 2')).toBeInTheDocument();
      expect(screen.getByText('Jugador 3')).toBeInTheDocument();
      expect(screen.queryByText('Jugador 1')).not.toBeInTheDocument();
    });

    it('filtra correctamente al usuario actual', () => {
      mockUserState.id = '2';
      useUser.mockReturnValue({ userState: mockUserState });
      
      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      expect(screen.getByText('Jugador 1')).toBeInTheDocument();
      expect(screen.getByText('Jugador 3')).toBeInTheDocument();
      expect(screen.queryByText('Jugador 2')).not.toBeInTheDocument();
    });

    it('usa grid layout para los jugadores', () => {
      const { container } = render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-2', 'md:grid-cols-3');
    });
  });

  describe('Botón de confirmación', () => {
    it('renderiza el botón de confirmar', () => {
      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const confirmButton = screen.getByTestId('button-confirmar');
      expect(confirmButton).toBeInTheDocument();
      expect(confirmButton).toHaveTextContent('Confirmar');
    });

    it('no llama a onPlayerSelect si no hay jugador seleccionado', () => {
      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const confirmButton = screen.getByTestId('button-confirmar');
      fireEvent.click(confirmButton);

      expect(mockOnPlayerSelect).not.toHaveBeenCalled();
    });
  });

  describe('Casos edge', () => {

    it('maneja player_id como string correctamente', () => {
      mockUserState.id = '1';
      mockGameState.jugadores = [
        { player_id: '1', name: 'User', avatar: 'av.png', birthdate: '1990-01-01' },
        { player_id: '2', name: 'Player 2', avatar: 'av2.png', birthdate: '1990-01-01' }
      ];
      useUser.mockReturnValue({ userState: mockUserState });
      useGame.mockReturnValue({ gameState: mockGameState });

      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      expect(screen.queryByText('User')).not.toBeInTheDocument();
      expect(screen.getByText('Player 2')).toBeInTheDocument();
    });

    it('maneja player_id como número correctamente', () => {
      mockUserState.id = 1;
      mockGameState.jugadores = [
        { player_id: 1, name: 'User', avatar: 'av.png', birthdate: '1990-01-01' },
        { player_id: 2, name: 'Player 2', avatar: 'av2.png', birthdate: '1990-01-01' }
      ];
      useUser.mockReturnValue({ userState: mockUserState });
      useGame.mockReturnValue({ gameState: mockGameState });

      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      expect(screen.queryByText('User')).not.toBeInTheDocument();
      expect(screen.getByText('Player 2')).toBeInTheDocument();
    });

    it('maneja fechas inválidas sin romper', () => {
      mockGameState.jugadores = [
        { player_id: '2', name: 'Player 2', avatar: 'av.png', birthdate: 'invalid-date' }
      ];
      useGame.mockReturnValue({ gameState: mockGameState });

      const { container } = render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);
      
      // El componente debe renderizarse sin errores
      expect(container.querySelector('.grid')).toBeInTheDocument();
    });

    it('maneja jugadores sin avatar correctamente', () => {
      mockGameState.jugadores = [
        { player_id: '2', name: 'Player 2', birthdate: '1990-01-01' }
      ];
      useGame.mockReturnValue({ gameState: mockGameState });

      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      expect(screen.getByText('Player 2')).toBeInTheDocument();
    });
  });

  describe('Estructura y estilos', () => {
    it('aplica el fondo oscuro con opacidad al overlay', () => {
      const { container } = render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const overlay = container.firstChild;
      expect(overlay).toHaveClass('bg-black', 'bg-opacity-60');
    });

    it('centra el contenido del modal', () => {
      const { container } = render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const overlay = container.firstChild;
      expect(overlay).toHaveClass('items-center', 'justify-center');
    });

    it('aplica el ancho máximo correcto al contenedor', () => {
      const { container } = render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const modalContainer = container.querySelector('.max-w-3xl');
      expect(modalContainer).toBeInTheDocument();
    });

    it('usa flexbox con gap correcto', () => {
      const { container } = render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const modalContainer = container.querySelector('.gap-6');
      expect(modalContainer).toBeInTheDocument();
    });

    it('aplica estilos correctos al mensaje de acción', () => {
      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const heading = screen.getByText('Selecciona un jugador');
      expect(heading.parentElement).toHaveClass('text-[#FFE0B2]', 'text-xl', 'font-semibold');
    });

    it('usa key correcta para cada jugador', () => {
      const { container } = render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const playerCards = container.querySelectorAll('[class*="cursor-pointer"]');
      expect(playerCards.length).toBeGreaterThan(0);
    });
  });
});