import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { useState } from 'react';

global.fetch = vi.fn();

vi.mock('../components/ProfileCard', () => {
  return {
    default: ({ name, host, avatar, birthdate }) => (
      <div data-testid="profile-card">
        <span data-testid="profile-name">{name}</span>
        {host && <span data-testid="profile-host">Host</span>}
        <span data-testid="profile-birthdate">{birthdate}</span>
        <span data-testid="profile-avatar">{avatar}</span>
      </div>
    )
  };
});

global.roomId = 123;

// Logica de las funciones para Testear de forma separada a los componentes 
const useGameScreenLogic = (roomId = 123) => {
  const [selectedCards, setSelectedCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCardSelect = (cardId) => {
    setSelectedCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      } else {
        return [...prev, cardId];
      }
    });
  };

  const getErrorMessage = (status, errorData) => {
    switch (status) {
      case 400:
        return 'Error de validación: cartas inválidas o lista vacía';
      case 403:
        return 'No es tu turno';
      case 404:
        return 'Sala no encontrada';
      case 409:
        return 'Reglas de descarte no cumplidas';
      default:
        return errorData?.message || 'Error desconocido';
    }
  };

  const handleDiscard = async () => {
    if (selectedCards.length === 0) {
      setError('Debes seleccionar al menos una carta para descartar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/game/${roomId}/discard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card_ids: selectedCards
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(getErrorMessage(response.status, errorData));
      }

      const data = await response.json();
      console.log('Discard successful:', data);
      setSelectedCards([]);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/game/${roomId}/skip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rule: "auto"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(getErrorMessage(response.status, errorData));
      }

      const data = await response.json();
      console.log('Skip successful:', data);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedCards,
    loading,
    error,
    handleCardSelect,
    handleDiscard,
    handleSkip,
    getErrorMessage
  };
};

// Componente para testear el mensaje de error
const ErrorDisplayTest = ({ error }) => {
  return (
    <main>
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
    </main>
  );
};

// Componnente para testear la informacion del jugador
const ProfileCardTest = () => {
  const ProfileCard = require('../components/ProfileCard.jsx').default;
  const userState = {
    name: 'Test Player',
    isHost: true,
    avatarPath: '/test-avatar.png',
    birthdate: '1990-01-01'
  };

  return (
    <ProfileCard
      name={userState.name}
      host={userState.isHost}
      avatar={userState.avatarPath}
      birthdate={userState.birthdate}
    />
  );
};

describe('GameScreen Logic Functions', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('handleCardSelect', () => {
    it('deberia seleccionar una carta cuando no fue selecionada', () => {
      const { result } = renderHook(() => useGameScreenLogic());

      expect(result.current.selectedCards).toEqual([]);

      act(() => {
        result.current.handleCardSelect(1);
      });

      expect(result.current.selectedCards).toEqual([1]);
    });

    it('se deberia deselecionar si es selecionada otra vez', () => {
      const { result } = renderHook(() => useGameScreenLogic());

      act(() => {
        result.current.handleCardSelect(1);
      });
      expect(result.current.selectedCards).toEqual([1]);

      act(() => {
        result.current.handleCardSelect(1);
      });
      expect(result.current.selectedCards).toEqual([]);
    });

    it('maneja selecciones multiples', () => {
      const { result } = renderHook(() => useGameScreenLogic());

      act(() => {
        result.current.handleCardSelect(1);
        result.current.handleCardSelect(2);
        result.current.handleCardSelect(3);
      });

      expect(result.current.selectedCards).toEqual([1, 2, 3]);
    });

    it('deberia manejar selecionar y desceleccionar', () => {
      const { result } = renderHook(() => useGameScreenLogic());

      act(() => {
        result.current.handleCardSelect(1);
        result.current.handleCardSelect(2);
        result.current.handleCardSelect(1); 
        result.current.handleCardSelect(3);
      });

      expect(result.current.selectedCards).toEqual([2, 3]);
    });
  });

  describe('handleDiscard', () => {
    it('deberia largar error si no hay seleccion', async () => {
      const { result } = renderHook(() => useGameScreenLogic());

      await act(async () => {
        await result.current.handleDiscard();
      });

      expect(result.current.error).toBe('Debes seleccionar al menos una carta para descartar');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('debe hacer la llamada a la api correcta', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          action: { discarded: [], drawn: [] },
          hand: { player_id: 7, cards: [] },
          deck: { remaining: 36 },
          discard: { top: null, count: 16 }
        })
      });

      const { result } = renderHook(() => useGameScreenLogic(456));

      act(() => {
        result.current.handleCardSelect(1);
        result.current.handleCardSelect(3);
      });

      await act(async () => {
        await result.current.handleDiscard();
      });

      expect(fetch).toHaveBeenCalledWith('/game/456/discard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card_ids: [1, 3]
        })
      });
    });

    it('estado en loading en request', async () => {
      let resolvePromise;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      fetch.mockReturnValueOnce(promise);

      const { result } = renderHook(() => useGameScreenLogic());

      act(() => {
        result.current.handleCardSelect(1);
      });

      act(() => {
        result.current.handleDiscard();
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);

      await act(async () => {
        resolvePromise({
          ok: true,
          json: async () => ({ action: {}, hand: {}, deck: {}, discard: {} })
        });
      });

      expect(result.current.loading).toBe(false);
    });

    it('debe limpiar la seleccion luego de descartar', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          action: { discarded: [], drawn: [] },
          hand: { player_id: 7, cards: [] },
          deck: { remaining: 36 },
          discard: { top: null, count: 16 }
        })
      });

      const { result } = renderHook(() => useGameScreenLogic());

      act(() => {
        result.current.handleCardSelect(1);
        result.current.handleCardSelect(2);
      });
      expect(result.current.selectedCards).toEqual([1, 2]);

      await act(async () => {
        await result.current.handleDiscard();
      });

      expect(result.current.selectedCards).toEqual([]);
    });

    it('maneja errores de api', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Not your turn' })
      });

      const { result } = renderHook(() => useGameScreenLogic());

      act(() => {
        result.current.handleCardSelect(1);
      });

      await act(async () => {
        await result.current.handleDiscard();
      });

      expect(result.current.error).toBe('No es tu turno');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('handleSkip', () => {
    it('hace la llamada correcta a la api', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          action: { discarded: [], drawn: [] },
          hand: { player_id: 7, cards: [] },
          deck: { remaining: 35 },
          discard: { top: null, count: 17 }
        })
      });

      const { result } = renderHook(() => useGameScreenLogic(789));

      await act(async () => {
        await result.current.handleSkip();
      });

      expect(fetch).toHaveBeenCalledWith('/game/789/skip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rule: "auto"
        })
      });
    });

    it('debe establecer estado en loading durante request', async () => {
      let resolvePromise;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      fetch.mockReturnValueOnce(promise);

      const { result } = renderHook(() => useGameScreenLogic());

      act(() => {
        result.current.handleSkip();
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);

      await act(async () => {
        resolvePromise({
          ok: true,
          json: async () => ({ action: {}, hand: {}, deck: {}, discard: {} })
        });
      });

      expect(result.current.loading).toBe(false);
    });

    it('maneja errores de api', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ message: 'Cannot apply rule' })
      });

      const { result } = renderHook(() => useGameScreenLogic());

      await act(async () => {
        await result.current.handleSkip();
      });

      expect(result.current.error).toBe('Reglas de descarte no cumplidas');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('retorno de errores ', () => {
    it('error status 400', () => {
      const { result } = renderHook(() => useGameScreenLogic());

      const message = result.current.getErrorMessage(400, {});
      expect(message).toBe('Error de validación: cartas inválidas o lista vacía');
    });

    it('error status 403', () => {
      const { result } = renderHook(() => useGameScreenLogic());

      const message = result.current.getErrorMessage(403, {});
      expect(message).toBe('No es tu turno');
    });

    it('error status 404', () => {
      const { result } = renderHook(() => useGameScreenLogic());

      const message = result.current.getErrorMessage(404, {});
      expect(message).toBe('Sala no encontrada');
    });

    it('error status 409', () => {
      const { result } = renderHook(() => useGameScreenLogic());

      const message = result.current.getErrorMessage(409, {});
      expect(message).toBe('Reglas de descarte no cumplidas');
    });
  });

  describe('Error Display', () => {
    it('se renderiza el error', () => {
      render(<ErrorDisplayTest error="Test error message" />);
      
      const errorElement = screen.getByText('Test error message');
      expect(errorElement).toBeInTheDocument();
      
      expect(errorElement.closest('div')).toHaveClass(
        'absolute', 'top-20', 'left-1/2', 'transform', '-translate-x-1/2',
        'bg-red-600', 'text-white', 'px-4', 'py-2', 'rounded-lg'
      );
    });

    it('no renderizar si no hay error', () => {
      render(<ErrorDisplayTest error={null} />);
      
      expect(screen.queryByText(/test error/i)).not.toBeInTheDocument();
    });
  });
});