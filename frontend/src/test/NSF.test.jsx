import { describe, it, expect, vi, beforeEach } from 'vitest';
import { startActionWithCounterCheck, callOriginalEndpoint, playNotSoFast, resumeAction, cancelEffect } from '../helpers/NSF.js';

global.fetch = vi.fn();

describe('NSF Module Tests', () => {
  beforeEach(() => vi.clearAllMocks());

  // ========== startActionWithCounterCheck ==========
  describe('startActionWithCounterCheck', () => {
    const mockParams = {
      roomId: 'room123',
      userId: 1,
      cardsIds: [101, 102],
      actionType: 'CREATE_SET',
      setPosition: null,
      endpoint: '/test',
      payload: { test: 1 },
      requiresEndpoint: true,
      actionIdentifier: 'TEST_ACTION',
      actionPayload: null,
      setLoading: vi.fn(),
      setError: vi.fn(),
      gameDispatch: vi.fn(),
    };

    // CE1: Parámetros válidos
    describe('Valid Parameters', () => {
      it('should call setLoading correctly', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ cancellable: false }) });
        await startActionWithCounterCheck(mockParams);
        expect(mockParams.setLoading).toHaveBeenCalledWith(true);
        expect(mockParams.setLoading).toHaveBeenCalledWith(false);
      });

      it('should make correct POST request', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ cancellable: false }) });
        await startActionWithCounterCheck(mockParams);
        
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/game/room123/start-action',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'http-user-id': '1' }
          })
        );
      });
    });

    // CE2: Parámetros inválidos
    describe('Invalid Parameters', () => {
      it('should throw error if setLoading missing', async () => {
        await expect(startActionWithCounterCheck({ ...mockParams, setLoading: null }))
          .rejects.toThrow('setLoading and setError are required');
      });

      it('should throw error if setError missing', async () => {
        await expect(startActionWithCounterCheck({ ...mockParams, setError: null }))
          .rejects.toThrow('setLoading and setError are required');
      });
    });

    // CE3: No cancelable
    describe('Not Cancellable Response', () => {
      it('should not dispatch SAVE_ACTION_DATA when cancellable=false', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ cancellable: false }) });
        await startActionWithCounterCheck(mockParams);
        expect(mockParams.gameDispatch).not.toHaveBeenCalled();
      });
    });

    // CE4: Cancelable
    describe('Cancellable Response', () => {
      it('should dispatch SAVE_ACTION_DATA when cancellable=true', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ cancellable: true }) });
        await startActionWithCounterCheck(mockParams);
        
        expect(mockParams.gameDispatch).toHaveBeenCalledWith({
          type: 'SAVE_ACTION_DATA',
          payload: {
            cards: [101, 102],
            endpoint: '/test',
            body: { test: 1 },
            requiresEndpoint: true,
            actionIdentifier: 'TEST_ACTION',
            actionPayload: null,
          }
        });
      });
    });

    // CE5: Errores
    describe('Error Handling', () => {
      it('should handle HTTP errors', async () => {
        fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ detail: 'Error' }) });
        await startActionWithCounterCheck(mockParams);
        expect(mockParams.setError).toHaveBeenCalledWith('Error');
      });

      it('should handle network errors', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));
        await startActionWithCounterCheck(mockParams);
        expect(mockParams.setError).toHaveBeenCalledWith('Network error');
        expect(mockParams.setLoading).toHaveBeenCalledWith(false);
      });

      it('should use default error message', async () => {
        fetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
        await startActionWithCounterCheck(mockParams);
        expect(mockParams.setError).toHaveBeenCalledWith('Start Action Failed');
      });
    });

    // Valores borde
    describe('Boundary Values', () => {

      it('should handle null setPosition', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ cancellable: false }) });
        await startActionWithCounterCheck(mockParams);
        const body = JSON.parse(fetch.mock.calls[0][1].body);
        expect(body.additionalData.setPosition).toBeNull();
      });

      it('should handle defined setPosition', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ cancellable: false }) });
        await startActionWithCounterCheck({ ...mockParams, setPosition: 2 });
        const body = JSON.parse(fetch.mock.calls[0][1].body);
        expect(body.additionalData.setPosition).toBe(2);
      });
    });

    // Caja blanca: Ramificaciones
    describe('Branch Coverage', () => {
      it('BRANCH: validation check - TRUE', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ cancellable: false }) });
        await startActionWithCounterCheck(mockParams);
        expect(mockParams.setLoading).toHaveBeenCalled();
      });

      it('BRANCH: validation check - FALSE', async () => {
        await expect(startActionWithCounterCheck({ ...mockParams, setLoading: null }))
          .rejects.toThrow();
      });

      it('BRANCH: response.ok - FALSE', async () => {
        fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ detail: 'Error' }) });
        await startActionWithCounterCheck(mockParams);
        expect(mockParams.setError).toHaveBeenCalledWith('Error');
      });

      it('BRANCH: cancellable - FALSE', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ cancellable: false }) });
        await startActionWithCounterCheck(mockParams);
        expect(mockParams.gameDispatch).not.toHaveBeenCalled();
      });

      it('BRANCH: cancellable - TRUE', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ cancellable: true }) });
        await startActionWithCounterCheck(mockParams);
        expect(mockParams.gameDispatch).toHaveBeenCalled();
      });
    });
  });

  // ========== callOriginalEndpoint ==========
  describe('callOriginalEndpoint', () => {
    const mockParams = {
      roomId: 'room123',
      userId: 1,
      endpoint: '/test',
      payload: { data: 1 },
      actionIdentifier: 'TEST',
      actionPayload: { setType: 'poirot', cardsToUse: [{ id: 1 }], hasWildcard: false },
      gameDispatch: vi.fn(),
    };

    // CE1: Éxito
    describe('Successful Response', () => {

    // CE2: Errores
    describe('Errors', () => {
      it('should throw on HTTP error', async () => {
        fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ detail: 'Error' }) });
        await expect(callOriginalEndpoint(mockParams)).rejects.toThrow('Error');
      });

      it('should use default error', async () => {
        fetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
        await expect(callOriginalEndpoint(mockParams)).rejects.toThrow('Action failed');
      });
    });
  });

  // ========== playNotSoFast ==========
  describe('playNotSoFast', () => {
    const card = { id: 501 };
    const userId = 1;
    const roomId = 'room123';
    const actionId = 789;
    const setError = vi.fn();

    // CE1: Éxito
    describe('Success', () => {
      it('should make correct request', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
        await playNotSoFast(card, userId, roomId, actionId, setError);
        
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/game/room123/instant/not-so-fast',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'http-user-id': '1' }
          })
        );
      });

      it('should send correct body', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
        await playNotSoFast(card, userId, roomId, actionId, setError);
        
        const body = JSON.parse(fetch.mock.calls[0][1].body);
        expect(body).toEqual({ actionId: 789, playerId: 1, cardId: 501 });
      });

      it('should return true on success', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
        const result = await playNotSoFast(card, userId, roomId, actionId, setError);
        expect(result).toBe(true);
      });
    });

    // CE2: Errores
    describe('Errors', () => {
      it('should call setError on failure', async () => {
        fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ detail: 'Invalid' }) });
        await playNotSoFast(card, userId, roomId, actionId, setError);
        expect(setError).toHaveBeenCalledWith('Invalid');
      });

      it('should use default error', async () => {
        fetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
        await playNotSoFast(card, userId, roomId, actionId, setError);
        expect(setError).toHaveBeenCalledWith('Action failed');
      });

      it('should handle network error', async () => {
        fetch.mockRejectedValueOnce(new Error('Network'));
        await playNotSoFast(card, userId, roomId, actionId, setError);
        expect(setError).toHaveBeenCalledWith('Network');
      });
    });

    // Valores borde
    describe('Boundary Values', () => {
      it('should handle userId 0', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
        await playNotSoFast(card, 0, roomId, actionId, setError);
        expect(fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ headers: expect.objectContaining({ 'http-user-id': '0' }) })
        );
      });

      it('should handle negative actionId', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
        await playNotSoFast(card, userId, roomId, -1, setError);
        const body = JSON.parse(fetch.mock.calls[0][1].body);
        expect(body.actionId).toBe(-1);
      });
    });
  });

  // ========== resumeAction ==========
  describe('resumeAction', () => {
    const mockParams = {
      roomId: 'room123',
      userId: 1,
      endpoint: '/test',
      payload: { data: 1 },
      requiresEndpoint: true,
      actionIdentifier: 'TEST',
      actionPayload: null,
      gameDispatch: vi.fn(),
    };  

    // CE2: requiresEndpoint = false
    describe('Without Endpoint', () => {
      it('should dispatch directly when requiresEndpoint=false', async () => {
        const params = { 
          ...mockParams, 
          requiresEndpoint: false, 
          actionPayload: { test: 1 } 
        };
        await resumeAction(params);
        
        expect(params.gameDispatch).toHaveBeenCalledWith({
          type: 'TEST',
          payload: { test: 1 }
        });
      });

      it('should dispatch UPDATE_DRAW_ACTION', async () => {
        const params = { ...mockParams, requiresEndpoint: false, actionPayload: {} };
        await resumeAction(params);
        
        expect(params.gameDispatch).toHaveBeenCalledWith({
          type: 'UPDATE_DRAW_ACTION',
          payload: { skipDiscard: true }
        });
      });
    });

    // Caja blanca: Ramificaciones
    describe('Branch Coverage', () => {

      it('BRANCH: requiresEndpoint - FALSE', async () => {
        const params = { ...mockParams, requiresEndpoint: false, actionPayload: {} };
        await resumeAction(params);
        expect(params.gameDispatch).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ========== cancelEffect ==========
  describe('cancelEffect', () => {
    const mockParams = {
      roomId: 'room123',
      userId: 1,
      actionId: 456,
      cardsIds: [10, 20],
      additionalData: { test: 'data' },
    };

    // CE1: Éxito
    describe('Success', () => {
      it('should make correct POST request', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
        await cancelEffect(mockParams);
        
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/game/room123/instant/not-so-fast/cancel',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'http-user-id': '1' }
          })
        );
      });

      it('should send correct body', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
        await cancelEffect(mockParams);
        
        const body = JSON.parse(fetch.mock.calls[0][1].body);
        expect(body).toEqual({
          actionId: 456,
          playerId: 1,
          cardIds: [10, 20],
          additionalData: { test: 'data' }
        });
      });

      it('should return data', async () => {
        const data = { cancelled: true };
        fetch.mockResolvedValueOnce({ ok: true, json: async () => data });
        const result = await cancelEffect(mockParams);
        expect(result).toEqual(data);
      });
    });

    // CE2: Errores
    describe('Errors', () => {
      it('should throw on HTTP error', async () => {
        fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ detail: 'Error' }) });
        await expect(cancelEffect(mockParams)).rejects.toThrow('Error');
      });

      it('should use default error', async () => {
        fetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
        await expect(cancelEffect(mockParams)).rejects.toThrow('Cancel action failed');
      });

      it('should handle network error', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));
        await expect(cancelEffect(mockParams)).rejects.toThrow('Network error');
      });
    });

    // Valores borde
    describe('Boundary Values', () => {
      it('should handle empty cardsIds', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
        await cancelEffect({ ...mockParams, cardsIds: [] });
        const body = JSON.parse(fetch.mock.calls[0][1].body);
        expect(body.cardIds).toEqual([]);
      });

      it('should handle null additionalData', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
        await cancelEffect({ ...mockParams, additionalData: null });
        const body = JSON.parse(fetch.mock.calls[0][1].body);
        expect(body.additionalData).toBeNull();
      });
    });
  });
});
});