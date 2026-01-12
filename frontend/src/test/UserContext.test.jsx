import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserProvider, useUser } from '../context/UserContext'

describe('UserContext', () => {
  describe('Provider Initialization', () => {
    it('provides initial user state', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      expect(result.current.userState).toEqual({
        id: null,
        name: '',
        avatarPath: '',
        birthdate: null,
        isHost: false
      })
    })
    
    it('provides userDispatch function', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      expect(result.current.userDispatch).toBeDefined()
      expect(typeof result.current.userDispatch).toBe('function')
    })
  })

  describe('SET_ID Action', () => {
    it('sets user id', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_ID',
          payload: 123
        })
      })
      
      expect(result.current.userState.id).toBe(123)
    })
    
    it('preserves other state properties when setting id', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_USER',
          payload: {
            name: 'Jugador 1',
            avatarPath: '/avatar.png'
          }
        })
      })
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_ID',
          payload: 456
        })
      })
      
      expect(result.current.userState).toEqual({
        id: 456,
        name: 'Jugador 1',
        avatarPath: '/avatar.png',
        birthdate: null,
        isHost: false
      })
    })
    
    it('can set id to null', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_ID',
          payload: 123
        })
      })
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_ID',
          payload: null
        })
      })
      
      expect(result.current.userState.id).toBeNull()
    })
  })

  describe('SET_USER Action', () => {
    it('sets complete user data', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      const userData = {
        id: 1,
        name: 'Alice',
        avatarPath: '/avatars/alice.png',
        birthdate: '1990-01-01',
        isHost: true
      }
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_USER',
          payload: userData
        })
      })
      
      expect(result.current.userState).toEqual(userData)
    })
    
    it('sets partial user data', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_USER',
          payload: {
            name: 'Bob',
            avatarPath: '/avatars/bob.png'
          }
        })
      })
      
      expect(result.current.userState).toEqual({
        id: null,
        name: 'Bob',
        avatarPath: '/avatars/bob.png',
        birthdate: null,
        isHost: false
      })
    })
    
    it('overwrites previous user data', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_USER',
          payload: {
            id: 1,
            name: 'Charlie'
          }
        })
      })
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_USER',
          payload: {
            id: 2,
            name: 'David'
          }
        })
      })
      
      expect(result.current.userState.id).toBe(2)
      expect(result.current.userState.name).toBe('David')
    })
    
    it('handles empty payload', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_USER',
          payload: {}
        })
      })
      
      expect(result.current.userState).toEqual({
        id: null,
        name: '',
        avatarPath: '',
        birthdate: null,
        isHost: false
      })
    })
  })

  describe('UPDATE_USER Action', () => {
    it('updates specific user fields', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      // Set initial user
      act(() => {
        result.current.userDispatch({
          type: 'SET_USER',
          payload: {
            id: 1,
            name: 'Eve',
            avatarPath: '/avatars/eve.png',
            birthdate: '1995-05-05',
            isHost: false
          }
        })
      })
      
      // Update only name
      act(() => {
        result.current.userDispatch({
          type: 'UPDATE_USER',
          payload: {
            name: 'Eve Updated'
          }
        })
      })
      
      expect(result.current.userState).toEqual({
        id: 1,
        name: 'Eve Updated',
        avatarPath: '/avatars/eve.png',
        birthdate: '1995-05-05',
        isHost: false
      })
    })
    
    it('updates multiple fields at once', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_USER',
          payload: {
            id: 5,
            name: 'Frank',
            avatarPath: '/old-avatar.png'
          }
        })
      })
      
      act(() => {
        result.current.userDispatch({
          type: 'UPDATE_USER',
          payload: {
            name: 'Franklin',
            avatarPath: '/new-avatar.png',
            birthdate: '2000-01-01'
          }
        })
      })
      
      expect(result.current.userState).toEqual({
        id: 5,
        name: 'Franklin',
        avatarPath: '/new-avatar.png',
        birthdate: '2000-01-01',
        isHost: false
      })
    })
    
    it('preserves unchanged fields', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_USER',
          payload: {
            id: 10,
            name: 'Grace',
            avatarPath: '/grace.png',
            birthdate: '1985-12-25',
            isHost: true
          }
        })
      })
      
      act(() => {
        result.current.userDispatch({
          type: 'UPDATE_USER',
          payload: {
            avatarPath: '/grace-new.png'
          }
        })
      })
      
      expect(result.current.userState.id).toBe(10)
      expect(result.current.userState.name).toBe('Grace')
      expect(result.current.userState.birthdate).toBe('1985-12-25')
      expect(result.current.userState.isHost).toBe(true)
      expect(result.current.userState.avatarPath).toBe('/grace-new.png')
    })
  })

  describe('SET_HOST Action', () => {
    it('sets isHost to true', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_HOST',
          payload: true
        })
      })
      
      expect(result.current.userState.isHost).toBe(true)
    })
    
    it('sets isHost to false', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      // First set to true
      act(() => {
        result.current.userDispatch({
          type: 'SET_HOST',
          payload: true
        })
      })
      
      // Then set to false
      act(() => {
        result.current.userDispatch({
          type: 'SET_HOST',
          payload: false
        })
      })
      
      expect(result.current.userState.isHost).toBe(false)
    })
    
    it('preserves other user data when setting host status', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_USER',
          payload: {
            id: 7,
            name: 'Henry',
            avatarPath: '/henry.png'
          }
        })
      })
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_HOST',
          payload: true
        })
      })
      
      expect(result.current.userState).toEqual({
        id: 7,
        name: 'Henry',
        avatarPath: '/henry.png',
        birthdate: null,
        isHost: true
      })
    })
  })

  describe('SET_PLAYER_DATA Action', () => {
    it('sets player data from API response format', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      const apiData = {
        id: 100,
        name: 'Isabella',
        avatar: '/avatars/isabella.png',
        birthdate: '1992-03-15',
        is_host: true
      }
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_PLAYER_DATA',
          payload: apiData
        })
      })
      
      expect(result.current.userState).toEqual({
        id: 100,
        name: 'Isabella',
        avatarPath: '/avatars/isabella.png',
        birthdate: '1992-03-15',
        isHost: true
      })
    })
    
    it('maps avatar to avatarPath correctly', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_PLAYER_DATA',
          payload: {
            id: 200,
            name: 'Jack',
            avatar: '/custom/path.png',
            birthdate: null,
            is_host: false
          }
        })
      })
      
      expect(result.current.userState.avatarPath).toBe('/custom/path.png')
      expect(result.current.userState.avatar).toBeUndefined()
    })
    
    it('maps is_host to isHost correctly', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_PLAYER_DATA',
          payload: {
            id: 300,
            name: 'Kate',
            avatar: '/kate.png',
            birthdate: '1988-07-20',
            is_host: true
          }
        })
      })
      
      expect(result.current.userState.isHost).toBe(true)
      expect(result.current.userState.is_host).toBeUndefined()
    })
    
    it('handles non-host player data', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_PLAYER_DATA',
          payload: {
            id: 400,
            name: 'Liam',
            avatar: '/liam.png',
            birthdate: '1995-11-30',
            is_host: false
          }
        })
      })
      
      expect(result.current.userState.isHost).toBe(false)
    })
    
    it('overwrites existing user data', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      // Set initial data
      act(() => {
        result.current.userDispatch({
          type: 'SET_USER',
          payload: {
            id: 1,
            name: 'OldName',
            avatarPath: '/old.png',
            isHost: false
          }
        })
      })
      
      // Update with player data
      act(() => {
        result.current.userDispatch({
          type: 'SET_PLAYER_DATA',
          payload: {
            id: 500,
            name: 'Mia',
            avatar: '/mia.png',
            birthdate: '1993-04-10',
            is_host: true
          }
        })
      })
      
      expect(result.current.userState).toEqual({
        id: 500,
        name: 'Mia',
        avatarPath: '/mia.png',
        birthdate: '1993-04-10',
        isHost: true
      })
    })
  })

  describe('CLEAR_USER Action', () => {
    it('resets user state to initial values', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      // Set user data
      act(() => {
        result.current.userDispatch({
          type: 'SET_USER',
          payload: {
            id: 999,
            name: 'Noah',
            avatarPath: '/noah.png',
            birthdate: '1990-06-15',
            isHost: true
          }
        })
      })
      
      // Clear user
      act(() => {
        result.current.userDispatch({
          type: 'CLEAR_USER'
        })
      })
      
      expect(result.current.userState).toEqual({
        id: null,
        name: '',
        avatarPath: '',
        birthdate: null,
        isHost: false
      })
    })
    
    it('can be called multiple times safely', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      act(() => {
        result.current.userDispatch({ type: 'CLEAR_USER' })
        result.current.userDispatch({ type: 'CLEAR_USER' })
        result.current.userDispatch({ type: 'CLEAR_USER' })
      })
      
      expect(result.current.userState).toEqual({
        id: null,
        name: '',
        avatarPath: '',
        birthdate: null,
        isHost: false
      })
    })
    
    it('allows setting new data after clearing', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      // Set, clear, then set again
      act(() => {
        result.current.userDispatch({
          type: 'SET_USER',
          payload: { id: 1, name: 'First' }
        })
      })
      
      act(() => {
        result.current.userDispatch({ type: 'CLEAR_USER' })
      })
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_USER',
          payload: { id: 2, name: 'Second' }
        })
      })
      
      expect(result.current.userState.id).toBe(2)
      expect(result.current.userState.name).toBe('Second')
    })
  })

  describe('Unknown Action Types', () => {
    it('returns current state for unknown action type', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      const initialState = { ...result.current.userState }
      
      act(() => {
        result.current.userDispatch({
          type: 'UNKNOWN_ACTION',
          payload: { something: 'value' }
        })
      })
      
      expect(result.current.userState).toEqual(initialState)
    })
    
    it('does not throw error for unknown action', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      expect(() => {
        act(() => {
          result.current.userDispatch({
            type: 'INVALID_TYPE'
          })
        })
      }).not.toThrow()
    })
  })

  describe('Error Handling', () => {
    it('throws error when useUser is used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error
      console.error = vi.fn()
      
      expect(() => {
        renderHook(() => useUser())
      }).toThrow('useUser must be used within a UserProvider')
      
      console.error = originalError
    })
  })

  describe('Complex Action Sequences', () => {
    it('handles multiple sequential updates correctly', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_ID',
          payload: 1
        })
        result.current.userDispatch({
          type: 'UPDATE_USER',
          payload: { name: 'Oliver' }
        })
        result.current.userDispatch({
          type: 'SET_HOST',
          payload: true
        })
        result.current.userDispatch({
          type: 'UPDATE_USER',
          payload: { avatarPath: '/oliver.png' }
        })
      })
      
      expect(result.current.userState).toEqual({
        id: 1,
        name: 'Oliver',
        avatarPath: '/oliver.png',
        birthdate: null,
        isHost: true
      })
    })
    
    it('maintains state integrity through complex workflow', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      // Simulate a typical user flow
      act(() => {
        // User logs in
        result.current.userDispatch({
          type: 'SET_PLAYER_DATA',
          payload: {
            id: 777,
            name: 'Sophia',
            avatar: '/sophia.png',
            birthdate: '1991-09-09',
            is_host: false
          }
        })
      })
      
      expect(result.current.userState.isHost).toBe(false)
      
      act(() => {
        // User becomes host
        result.current.userDispatch({
          type: 'SET_HOST',
          payload: true
        })
      })
      
      expect(result.current.userState.isHost).toBe(true)
      expect(result.current.userState.name).toBe('Sophia')
      
      act(() => {
        // User updates avatar
        result.current.userDispatch({
          type: 'UPDATE_USER',
          payload: { avatarPath: '/sophia-new.png' }
        })
      })
      
      expect(result.current.userState.avatarPath).toBe('/sophia-new.png')
      expect(result.current.userState.isHost).toBe(true)
      
      act(() => {
        // User logs out
        result.current.userDispatch({ type: 'CLEAR_USER' })
      })
      
      expect(result.current.userState).toEqual({
        id: null,
        name: '',
        avatarPath: '',
        birthdate: null,
        isHost: false
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles null payload gracefully', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      expect(() => {
        act(() => {
          result.current.userDispatch({
            type: 'SET_USER',
            payload: null
          })
        })
      }).not.toThrow()
    })
    
    it('handles undefined payload gracefully', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      expect(() => {
        act(() => {
          result.current.userDispatch({
            type: 'UPDATE_USER'
            // no payload
          })
        })
      }).not.toThrow()
    })
    
    it('handles special characters in name', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_USER',
          payload: {
            name: "O'Brien-Smith @#$%"
          }
        })
      })
      
      expect(result.current.userState.name).toBe("O'Brien-Smith @#$%")
    })
    
    it('handles very long name strings', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      const longName = 'A'.repeat(1000)
      
      act(() => {
        result.current.userDispatch({
          type: 'SET_USER',
          payload: { name: longName }
        })
      })
      
      expect(result.current.userState.name).toBe(longName)
    })
    
    it('handles various date formats', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      })
      
      const testDates = [
        '2000-01-01',
        '1990-12-31',
        '2025-10-12'
      ]
      
      testDates.forEach(date => {
        act(() => {
          result.current.userDispatch({
            type: 'UPDATE_USER',
            payload: { birthdate: date }
          })
        })
        
        expect(result.current.userState.birthdate).toBe(date)
      })
    })
  })
})