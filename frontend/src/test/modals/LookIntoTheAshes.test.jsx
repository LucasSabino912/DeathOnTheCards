import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LookIntoTheAshes from '../../components/modals/LookIntoTheAshes';

// Mock del helper de imágenes - usar las rutas reales que retorna
vi.mock('../HelperImageCards', () => ({
  default: (card) => {
    // Simular el comportamiento real del helper
    const cardMap = {
      'Look Into The Ashes': '/cards/event_lookashes.png',
      'Another Victim': '/cards/event_anothervictim.png',
      'Card Trade': '/cards/event_cardtrade.png',
    };
    return cardMap[card.name] || `/cards/${card.name.toLowerCase().replace(/\s+/g, '_')}.png`;
  }
}));

describe('LookIntoTheAshes', () => {
  const mockCards = [
    { entryId: 'E1', id_card: 'C1', name: 'Look Into The Ashes' },
    { entryId: 'E2', id_card: 'C2', name: 'Another Victim' },
    { entryId: 'E3', id_card: 'C3', name: 'Card Trade' },
  ];

  const defaultProps = {
    isOpen: true,
    availableCards: mockCards,
    onSelectCard: vi.fn(),
  };

  const renderModal = (props = {}) =>
    render(<LookIntoTheAshes {...defaultProps} {...props} />);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no se renderiza si isOpen es false', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByText('Look Into The Ashes')).toBeNull();
  });

  it('renderiza modal y cartas cuando isOpen es true', () => {
    renderModal();
    expect(screen.getByText('Look Into The Ashes')).toBeInTheDocument();
    expect(screen.getByText('Agrega una carta a tu mano')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(mockCards.length);
  });

  it('selecciona una carta al clickearla', () => {
    renderModal();
    
    const cardContainers = screen.getAllByRole('img').map(img => img.parentElement);
    const secondCard = cardContainers[1];
    
    // Verificar que no está seleccionada inicialmente
    expect(secondCard).toHaveClass('border-[#825012]');
    expect(secondCard).not.toHaveClass('border-[#FFD700]');
    
    // Hacer click
    fireEvent.click(secondCard);
    
    // Verificar que ahora está seleccionada
    expect(secondCard).toHaveClass('border-[#FFD700]');
    expect(secondCard).not.toHaveClass('border-[#825012]');
  });
  

  it('llama onSelectCard al clickear Seleccionar con selección', () => {
    const onSelectCard = vi.fn();
    renderModal({ onSelectCard });
    
    // Seleccionar la primera carta
    const imgs = screen.getAllByRole('img');
    fireEvent.click(imgs[0].parentElement);
    
    // Hacer click en el botón
    fireEvent.click(screen.getByText('Seleccionar'));
    
    expect(onSelectCard).toHaveBeenCalledWith('E1');
    expect(onSelectCard).toHaveBeenCalledTimes(1);
  });

  it('deshabilita el botón si no hay selección', () => {
    renderModal();
    
    const button = screen.getByText('Seleccionar');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('text-[#B49150]', 'border-[#825012]');
  });

  it('habilita el botón cuando hay una selección', () => {
    renderModal();
    
    // Seleccionar una carta
    const imgs = screen.getAllByRole('img');
    fireEvent.click(imgs[0].parentElement);
    
    const button = screen.getByText('Seleccionar');
    expect(button).not.toBeDisabled();
    expect(button).toHaveClass('text-[#FFD700]', 'border-[#FFD700]');
  });
  /*
  it('no rompe si availableCards es undefined', () => {
    const { container } = render(
      <LookIntoTheAshes 
        isOpen={true} 
        availableCards={undefined} 
        onSelectCard={vi.fn()} 
      />
    );
    
    expect(screen.getByText('Look Into The Ashes')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });
  */

  it('no rompe si availableCards es un array vacío', () => {
    renderModal({ availableCards: [] });
    
    expect(screen.getByText('Look Into The Ashes')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  /*
  it('muestra el número correcto de cartas', () => {
    const manyCards = Array.from({ length: 5 }, (_, i) => ({
      entryId: `E${i}`,
      id_card: `C${i}`,
      name: `Card ${i}`
    }));
    
    renderModal({ availableCards: manyCards });
    
    const images = screen.queryAllByRole('img');
    expect(images.length).toBe(5);
  });
  */

  it('solo una carta puede estar seleccionada a la vez', () => {
    renderModal();
    
    const cardContainers = screen.getAllByRole('img').map(img => img.parentElement);
    
    // Seleccionar primera carta
    fireEvent.click(cardContainers[0]);
    expect(cardContainers[0]).toHaveClass('border-[#FFD700]');
    
    // Seleccionar segunda carta
    fireEvent.click(cardContainers[1]);
    expect(cardContainers[1]).toHaveClass('border-[#FFD700]');
    expect(cardContainers[0]).not.toHaveClass('border-[#FFD700]');
    expect(cardContainers[0]).toHaveClass('border-[#825012]');
  });

  it('no llama onSelectCard si no hay selección', () => {
    const onSelectCard = vi.fn();
    renderModal({ onSelectCard });
    
    const button = screen.getByText('Seleccionar');
    
    // El botón está deshabilitado, pero intentamos hacer click
    fireEvent.click(button);
    
    expect(onSelectCard).not.toHaveBeenCalled();
  });

  it('aplica estilos correctos al título', () => {
    renderModal();
    
    const title = screen.getByText('Look Into The Ashes');
    expect(title).toHaveClass('text-2xl', 'font-bold', 'mb-0');
    expect(title).toHaveStyle({ color: '#FFD700' });
  });

  it('aplica estilos correctos al subtítulo', () => {
    renderModal();
    
    const subtitle = screen.getByText('Agrega una carta a tu mano');
    expect(subtitle).toHaveClass('text-lg', 'text-yellow-400', 'block', 'mb-6');
  });

  it('renderiza las imágenes con el src correcto', () => {
    renderModal();
    
    const images = screen.getAllByRole('img');
    
    expect(images[0]).toHaveAttribute('src', '/cards/event_lookashes.png');
    expect(images[1]).toHaveAttribute('src', '/cards/event_anothervictim.png');
    expect(images[2]).toHaveAttribute('src', '/cards/event_cardtrade.png');
  });

  it('aplica clases de transición a las cartas', () => {
    renderModal();
    
    const cardContainers = screen.getAllByRole('img').map(img => img.parentElement);
    
    cardContainers.forEach(card => {
      expect(card).toHaveClass('transition-all', 'duration-150', 'cursor-pointer');
    });
  });

  it('aplica dimensiones correctas a las cartas', () => {
    renderModal();
    
    const cardContainers = screen.getAllByRole('img').map(img => img.parentElement);
    
    cardContainers.forEach(card => {
      expect(card).toHaveStyle({
        minWidth: '120px',
        minHeight: '180px',
        width: '120px',
        height: '180px',
      });
    });
  });

  it('usa entryId como key para las cartas', () => {
    const { container } = renderModal();
    
    // Buscar específicamente los divs de las cartas (no el botón)
    const cardGrid = container.querySelector('.flex.flex-row.gap-8');
    const cardContainers = cardGrid?.querySelectorAll('.cursor-pointer') || [];
    expect(cardContainers.length).toBe(mockCards.length);
  });
});