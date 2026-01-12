// Discard.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Discard from '../../components/game/Discard.jsx';

vi.mock('../assets/01-card_back.png', () => ({
  default: '/cards/01-card_back.png'
}));

describe('Discard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Renderiza mazo de descarte con carta superior visible y contador', () => {
    const mockCardImage = 'https://example.com/specific-card.png';
    render(<Discard topDiscardedCard={mockCardImage} counterDiscarded={5} />);
    
    const cardImage = screen.getByAltText('Top Discarded Card');
    expect(cardImage).toBeInTheDocument();
    expect(cardImage).toHaveAttribute('src', mockCardImage);
    expect(cardImage).toHaveClass('w-16', 'h-24', 'rounded-lg', 'border-2', 'border-gray-400');
    
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('Muestra placeholder cuando está vacío (topDiscardedCard null)', () => {
    render(<Discard topDiscardedCard={null} counterDiscarded={0} />);
    
    const cardImage = screen.getByAltText('Top Discarded Card');
    expect(cardImage).toBeInTheDocument();
    expect(cardImage).toHaveAttribute('src', '/cards/01-card_back.png');
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('Muestra placeholder cuando está vacío (topDiscardedCard undefined)', () => {
    render(<Discard counterDiscarded={0} />);
    
    const cardImage = screen.getByAltText('Top Discarded Card');
    expect(cardImage).toBeInTheDocument();
    expect(cardImage).toHaveAttribute('src', '/cards/01-card_back.png');
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('Se actualiza correctamente cuando cambia la carta superior', () => {
    const firstCard = 'assets/card1.png';
    const secondCard = 'assets/card2.png';

    const { rerender } = render(
      <Discard topDiscardedCard={firstCard} counterDiscarded={1} />
    );
    
    expect(screen.getByAltText('Top Discarded Card')).toHaveAttribute('src', firstCard);
    expect(screen.getByText('1')).toBeInTheDocument();
    
    rerender(<Discard topDiscardedCard={secondCard} counterDiscarded={2} />);
    
    expect(screen.getByAltText('Top Discarded Card')).toHaveAttribute('src', secondCard);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('Se actualiza correctamente cuando vuelve a estar vacío', () => {
    const mockCard = 'assets/card.png';

    const { rerender } = render(
      <Discard topDiscardedCard={mockCard} counterDiscarded={3} />
    );
    
    expect(screen.getByAltText('Top Discarded Card')).toHaveAttribute('src', mockCard);
    expect(screen.getByText('3')).toBeInTheDocument();
    
    rerender(<Discard topDiscardedCard={null} counterDiscarded={0} />);

    expect(screen.getByAltText('Top Discarded Card')).toHaveAttribute('src', '/cards/01-card_back.png');
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });

  it('Maneja diferentes contadores correctamente', () => {
    render(<Discard topDiscardedCard="test.png" counterDiscarded={99} />);
    expect(screen.getByText('99')).toBeInTheDocument();

    const { rerender } = render(<Discard topDiscardedCard="test.png" counterDiscarded={1} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('Maneja props undefined', () => {
    render(<Discard />);
    
    const cardImage = screen.getByAltText('Top Discarded Card');
    expect(cardImage).toBeInTheDocument();
    expect(cardImage).toHaveAttribute('src', '/cards/01-card_back.png');
  });
});

// TEST DE INTEGRACIÓN - Verifica que el componente recibe datos correctos del contexto
describe('Discard - Integration with GameContext', () => {
  it('Recibe datos del contexto y simula actualización desde WebSocket', () => {
    // Simula props que vendrían del contexto
    const initialProps = { 
      topDiscardedCard: null, 
      counterDiscarded: 0 
    };
    const updatedProps = { 
      topDiscardedCard: 'assets/new-card.png', 
      counterDiscarded: 3 
    }; 
    
    const { rerender } = render(<Discard {...initialProps} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByAltText('Top Discarded Card')).toHaveAttribute('src', '/cards/01-card_back.png');
    
    rerender(<Discard {...updatedProps} />);
    
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByAltText('Top Discarded Card')).toHaveAttribute('src', 'assets/new-card.png');
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});