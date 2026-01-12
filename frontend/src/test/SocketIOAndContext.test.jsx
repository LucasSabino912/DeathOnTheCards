// __tests__/SocketIOAndContext.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { GameProvider, useGame } from '../context/GameContext.jsx';

// Mock socket.io-client
const mockSocket = {
  on: vi.fn(),
  disconnect: vi.fn(),
  emit: vi.fn(),
  id: 'mock-socket-id'
};

vi.mock('socket.io-client', () => ({
  default: vi.fn(() => mockSocket)
}));

// Test component that uses the GameContext
const TestComponent = () => {
  const { gameState, gameDispatch, connectToGame, disconnectFromGame } = useGame();
  
  return (
    <div>
      <div data-testid="connected">{gameState.connected ? 'connected' : 'disconnected'}</div>
      <div data-testid="game-id">{gameState.gameId || 'no-game'}</div>
      <div data-testid="current-turn">{gameState.turnoActual || 'no-turn'}</div>
      <div data-testid="players-count">{gameState.jugadores.length}</div>
      <div data-testid="hand-size">{gameState.mano.length}</div>
      <div data-testid="secrets-size">{gameState.secretos.length}</div>
      <div data-testid="game-ended">{gameState.gameEnded ? 'ended' : 'playing'}</div>
      <div data-testid="win-status">{gameState.ganaste === null ? 'unknown' : (gameState.ganaste ? 'won' : 'lost')}</div>
      <div data-testid="backend-connected">{gameState.connected ? 'backend-connected' : 'backend-not-connected'}</div>
      
      <button 
        onClick={() => gameDispatch({ type: 'RESET_GAME' })}
        data-testid="reset-button"
      >
        Reset
      </button>
      
      <button 
        onClick={() => connectToGame(123, 456)}
        data-testid="connect-button"
      >
        Connect to Game
      </button>
      
      <button 
        onClick={() => disconnectFromGame()}
        data-testid="disconnect-button"
      >
        Disconnect
      </button>
    </div>
  );
};

describe('GameContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    expect(screen.getByTestId('connected')).toHaveTextContent('disconnected');
    expect(screen.getByTestId('game-id')).toHaveTextContent('no-game');
    expect(screen.getByTestId('current-turn')).toHaveTextContent('no-turn');
    expect(screen.getByTestId('players-count')).toHaveTextContent('0');
    expect(screen.getByTestId('hand-size')).toHaveTextContent('0');
    expect(screen.getByTestId('secrets-size')).toHaveTextContent('0');
    expect(screen.getByTestId('game-ended')).toHaveTextContent('playing');
    expect(screen.getByTestId('win-status')).toHaveTextContent('unknown');
    expect(screen.getByTestId('backend-connected')).toHaveTextContent('backend-not-connected');
  });

  it('should handle manual connection to game', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Initially no socket event listeners should be registered
    expect(mockSocket.on).not.toHaveBeenCalled();

    // Click connect button to trigger socket connection
    const connectButton = screen.getByTestId('connect-button');
    
    act(() => {
      connectButton.click();
    });

    // Now socket should be created and event listeners registered
    expect(mockSocket.on).toHaveBeenCalled();
    
    // Find and trigger the connected handler
    const connectedHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connected')?.[1];
    expect(connectedHandler).toBeDefined();
    
    act(() => {
      connectedHandler();
    });

    await waitFor(() => {
      expect(screen.getByTestId('connected')).toHaveTextContent('connected');
    });
  });

  it('should handle socket disconnection', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Connect first
    const connectButton = screen.getByTestId('connect-button');
    act(() => {
      connectButton.click();
    });

    // Get connected handler and trigger it
    const connectedHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connected')?.[1];
    act(() => {
      connectedHandler();
    });

    // Get disconnected handler and trigger it
    const disconnectedHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnected')?.[1];
    expect(disconnectedHandler).toBeDefined();
    
    act(() => {
      disconnectedHandler();
    });

    await waitFor(() => {
      expect(screen.getByTestId('connected')).toHaveTextContent('disconnected');
    });
  });

  it('should handle backend connected event', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Connect to game
    const connectButton = screen.getByTestId('connect-button');
    act(() => {
      connectButton.click();
    });

    // Find and trigger connected event from backend
    const connectedHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connected')?.[1];
    expect(connectedHandler).toBeDefined();

    const mockConnectedData = {
      message: 'Conectado exitosamente',
      user_id: 456,
      game_id: 123,
      sid: 'mock-socket-id'
    };

    act(() => {
      connectedHandler(mockConnectedData);
    });

    await waitFor(() => {
      expect(screen.getByTestId('backend-connected')).toHaveTextContent('backend-connected');
    });
  });

  it('should handle game_state_public event', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Connect first
    const connectButton = screen.getByTestId('connect-button');
    act(() => {
      connectButton.click();
    });

    const mockGameStatePublic = {
      game_id: 'test-game-123',
      turno_actual: 'player1',
      jugadores: [
        { user_id: 'player1', nombre: 'Player 1' },
        { user_id: 'player2', nombre: 'Player 2' }
      ],
      mazos: { deck1: ['card1', 'card2'] },
      timestamp: '2023-01-01T00:00:00.000Z'
    };

    const gameStateHandler = mockSocket.on.mock.calls.find(call => call[0] === 'game_state_public')?.[1];
    expect(gameStateHandler).toBeDefined();
    
    act(() => {
      gameStateHandler(mockGameStatePublic);
    });

    await waitFor(() => {
      expect(screen.getByTestId('game-id')).toHaveTextContent('test-game-123');
      expect(screen.getByTestId('current-turn')).toHaveTextContent('player1');
      expect(screen.getByTestId('players-count')).toHaveTextContent('2');
    });
  });

  it('should handle game_state_private event', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Connect first
    const connectButton = screen.getByTestId('connect-button');
    act(() => {
      connectButton.click();
    });

    const mockGameStatePrivate = {
      user_id: 'player1',
      mano: ['card1', 'card2', 'card3'],
      secretos: ['secret1'],
      timestamp: '2023-01-01T00:00:00.000Z'
    };

    const privateStateHandler = mockSocket.on.mock.calls.find(call => call[0] === 'game_state_private')?.[1];
    expect(privateStateHandler).toBeDefined();
    
    act(() => {
      privateStateHandler(mockGameStatePrivate);
    });

    await waitFor(() => {
      expect(screen.getByTestId('hand-size')).toHaveTextContent('3');
      expect(screen.getByTestId('secrets-size')).toHaveTextContent('1');
    });
  });

  it('should handle game_ended (game won) event', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Connect first
    const connectButton = screen.getByTestId('connect-button');
    act(() => {
      connectButton.click();
    });

    const mockGameEndResult = {
      winners: [{ player_id: 456 }],
      reason: 'test'
    };

    const gameEndedHandler = mockSocket.on.mock.calls.find(call => call[0] === 'game_ended')?.[1];
    expect(gameEndedHandler).toBeDefined();
    
    act(() => {
      gameEndedHandler(mockGameEndResult);
    });

    await waitFor(() => {
      expect(screen.getByTestId('game-ended')).toHaveTextContent('ended');
      expect(screen.getByTestId('win-status')).toHaveTextContent('won');
    });
  });

  it('should handle game_ended (game lost) event', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Connect first
    const connectButton = screen.getByTestId('connect-button');
    act(() => {
      connectButton.click();
    });

    const mockGameEndResult = {
      winners: [{ player_id: 123 }],
      reason: 'test'
    };

    const gameEndedHandler = mockSocket.on.mock.calls.find(call => call[0] === 'game_ended')?.[1];
    expect(gameEndedHandler).toBeDefined();
    
    act(() => {
      gameEndedHandler(mockGameEndResult);
    });

    await waitFor(() => {
      expect(screen.getByTestId('game-ended')).toHaveTextContent('ended');
      expect(screen.getByTestId('win-status')).toHaveTextContent('lost');
    });
  });

  it('should setup all socket event listeners after connection', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Initially no listeners
    expect(mockSocket.on).not.toHaveBeenCalled();

    // Connect to game
    const connectButton = screen.getByTestId('connect-button');
    act(() => {
      connectButton.click();
    });

    // Verify all expected event listeners are registered after connection
    const eventNames = mockSocket.on.mock.calls.map(call => call[0]);
    expect(eventNames).toContain('disconnected');
    expect(eventNames).toContain('connected');
    expect(eventNames).toContain('game_state_public');
    expect(eventNames).toContain('game_state_private');
    expect(eventNames).toContain('connect_error');
  });

  it('should handle manual disconnection', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Connect first
    const connectButton = screen.getByTestId('connect-button');
    act(() => {
      connectButton.click();
    });

    expect(mockSocket.disconnect).not.toHaveBeenCalled();

    // Manually disconnect
    const disconnectButton = screen.getByTestId('disconnect-button');
    act(() => {
      disconnectButton.click();
    });

    expect(mockSocket.disconnect).toHaveBeenCalledOnce();
  });

  it('should not create socket connection on mount', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Socket should not be created on mount - only when connectToGame is called
    expect(mockSocket.on).not.toHaveBeenCalled();
    expect(mockSocket.disconnect).not.toHaveBeenCalled();
  });

  it('should throw error when useGame is used outside GameProvider', () => {
    // Mock console.error to avoid test output pollution
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useGame must be used within a GameProvider');

    consoleSpy.mockRestore();
  });

  it('should handle multiple connections properly', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    const connectButton = screen.getByTestId('connect-button');
    
    // First connection
    act(() => {
      connectButton.click();
    });
    
    const firstCallCount = mockSocket.on.mock.calls.length;
    expect(firstCallCount).toBeGreaterThan(0);
    
    // Second connection should disconnect first and create new one
    act(() => {
      connectButton.click();
    });
    
    // Should have called disconnect once for cleanup
    expect(mockSocket.disconnect).toHaveBeenCalledOnce();
    
    // Should have more socket.on calls for the new connection
    expect(mockSocket.on.mock.calls.length).toBeGreaterThan(firstCallCount);
  });
});