// GameContext.js
import {
  createContext,
  useContext,
  useReducer,
  useRef,
  useEffect,
  useCallback,
} from 'react'
import io from 'socket.io-client'
import { resumeAction, cancelEffect } from '../helpers/NSF'

const GameContext = createContext()

const gameInitialState = {
  userId: null,
  gameId: null,
  roomId: null,
  turnoActual: null,
  status: null,
  jugadores: [],
  mazos: {
    deck: {
      count: 0,
      draft: [],
    },
    discard: {
      top: '',
      count: 0,
    },
  },
  sets: [],
  mano: [],
  secretsFromAllPlayers: [],
  secretos: [],
  playersInSocialDisgrace: [],
  gameEnded: false,
  gameCancelled: false,
  winners: [],
  ganaste: null,
  finish_reason: null,
  lastUpdate: null,
  connected: false,
  logs: [], // { id, message, type, timestamp, playerId }
  playerLeftNotification: null,

  nsfCounter: {
    active: false,
    actionId: null,
    nsfActionId: null,
    initiatorPlayerId: null,
    actionType: null,
    actionName: null,
    cardsIds: [],           // las cartas jugadas como intención
    cancellable: null,
    timeRemaining: 0,
    originalActionData: {  // lo que se enviaría si se ejecuta
      endpoint: null,        // string "/event/..."
      body: null,            // body: { ...payload }
      requiresEndpoint: false,  
      actionIdentifier: null,
      actionPayload: null,
    },
    nsfChain: [],           // array de { playerId, cardId, timestamp }
    finalResolution: null,   // “continue” | “cancelled”
    showNsfBanner: false
  },

  // Detective Actions
  detectiveAction: {
    // Active action
    current: null, // { actionId, setType, stage, cards, hasWildcard }
    allowedPlayers: [],
    secretsPool: [],  // [{playerId:19,"position":1, "hidden": false, "cardId:2"},{playerId:19,...}]
    targetPlayerId: null,

    // Modals
    showCreateSet: false,
    showSelectPlayer: false,
    showSelectSecret: false,
    showWaiting: false,

    incomingRequest: null, // { actionId, requesterId, setType }
    showChooseOwnSecret: false,

    // Transparency
    actionInProgress: null, // { playerId, setType, step, message }
  },

  // Event Cards
  eventCards: {
    // Cards Off The Table
    cardsOffTable: {
      showSelectPlayer: false,
    },

    // Another Victim
    anotherVictim: {
      showSelectPlayer: false,
      selectedPlayer: null,
      showSelectSets: false,
      selectedSet: null,
    },

    // Look Into Ashes
    lookAshes: {
      actionId: null,
      availableCards: [],
      showSelectCard: false,
    },

    // And Then There Was One More
    oneMore: {
      actionId: null,
      availableSecrets: [],
      allowedPlayers: [],
      selectedSecretId: null,
      showSecrets: false,
      showPlayers: false,
    },

    // Delay The Murderer Escape
    delayEscape: {
      actionId: null,
      showQty: false,
    },

    //dead card folly
    deadCardFolly:{
      actionId: null,
      showDirection: false,
      isSelecting: false,
      
    },

    // Transparency for all events
    actionInProgress: null, // { playerId, eventType, step, message }
  },

  // Simple discard & draw tracking
  drawAction: {
    cardsToDrawRemaining: 0, // How many more cards player needs to draw
    otherPlayerDrawing: null, // { playerId, cardsRemaining, message }
    hasDiscarded: false,
    hasDrawn: false,
    skipDiscard: false,
  },
}

  const gameReducer = (state, action) => {
    switch (action.type) {
      // -------------------
      // | GAME-CONNECTION |
      // -------------------

      case 'SOCKET_CONNECTED':
        return {
          ...state,
          connected: true,
        }

      case 'SOCKET_DISCONNECTED':
        return {
          ...state,
          connected: false,
        }

      case 'SET_GAME_ID':
        return {
          ...state,
          gameId: action.payload,
        }

      case 'INITIALIZE_GAME':
        const initLog = {
          id: `init-${Date.now()}`,
          message: action.payload.message || 'Juego inicializado',
          type: 'system',
          timestamp: new Date().toISOString(),
        };

        return {
          ...state,
          gameId: action.payload.room.game_id,
          roomId: action.payload.room.id,
          roomInfo: action.payload.room,
          jugadores: action.payload.players,
          gameCancelled: false,
          logs: [...state.logs, initLog].slice(-50)
        }

      case 'UPDATE_GAME_STATE_PUBLIC':
        return {
          ...state,
          roomId: action.payload.room_id ?? state.roomId,
          gameId: action.payload.game_id ?? state.gameId,
          status: action.payload.status ?? state.status,
          turnoActual: action.payload.turno_actual ?? state.turnoActual,

          jugadores:
            Array.isArray(action.payload.jugadores) &&
            action.payload.jugadores.length > 0
              ? action.payload.jugadores
              : state.jugadores,

          mazos:
            action.payload.mazos && Object.keys(action.payload.mazos).length > 0
              ? action.payload.mazos
              : state.mazos,

          sets:
            Array.isArray(action.payload.sets) && action.payload.sets.length > 0
              ? action.payload.sets
              : state.sets,
          
          secretsFromAllPlayers:
            Array.isArray(action.payload.secretsFromAllPlayers) && action.payload.secretsFromAllPlayers.length > 0
              ? action.payload.secretsFromAllPlayers
              : state.secretsFromAllPlayers,

          gameEnded: action.payload.game_ended ?? state.gameEnded,
          lastUpdate: action.payload.timestamp ?? new Date().toISOString(),
        }

      case 'UPDATE_GAME_STATE_PRIVATE':
        return {
          ...state,
          userId: action.payload.user_id ?? state.userId,
          mano: Array.isArray(action.payload.mano)
            ? action.payload.mano
            : state.mano,

          secretos: Array.isArray(action.payload.secretos)
            ? action.payload.secretos
            : state.secretos,

          lastUpdate: action.payload.timestamp ?? new Date().toISOString(),
        }

      case 'GAME_ENDED':
        const endLog = {
          id: `end-${Date.now()}`,
          message: action.payload.message || action.payload.reason || 'Juego terminado',
          type: 'game_end',
          timestamp: new Date().toISOString(),
        };

        return {
          ...state,
          gameEnded: true,
          ganaste: action.payload.ganaste ?? false,

          winners: Array.isArray(action.payload.winners)
            ? action.payload.winners
            : state.winners,

          finish_reason: action.payload.reason,

          lastUpdate: action.payload.timestamp ?? new Date().toISOString(),
          logs: [...state.logs, endLog].slice(-50)
        }

      case 'GAME_CANCELLED':
        return {
          ...state,
          gameCancelled: true,
          lastUpdate: action.payload.timestamp ?? new Date().toISOString(),
        }

      case 'PLAYER_LEFT_NOTIFICATION':
        return {
          ...state,
          playerLeftNotification: {
            playerName: action.payload.playerName,
            timestamp: action.payload.timestamp,
          },
          lastUpdate: action.payload.timestamp ?? new Date().toISOString(),
        }

      case 'CLEAR_PLAYER_LEFT_NOTIFICATION':
        return {
          ...state,
          playerLeftNotification: null,
        }

      // --------------------
      // | ACTION - COUNTER |
      // --------------------

      case 'SAVE_ACTION_DATA':
        console.log("SAVE_ACTION_DATA TRIGERED")
        return {
          ...state,
          nsfCounter: {
            ...state.nsfCounter,
            cardsIds: action.payload.cards,
            originalActionData:{
              endpoint: action.payload.endpoint,
              body: action.payload.body,
              requiresEndpoint: action.payload.requiresEndpoint,  
              actionIdentifier: action.payload.actionIdentifier,
              actionPayload: action.payload.actionPayload,
            }
          }
        }
      
      case 'VALID_ACTION':
        return {
          ...state,
          nsfCounter: {
            ...state.nsfCounter,
              actionId: action.payload.action_id,
              initiatorPlayerId: action.payload.player_id,
              actionType: action.payload.action_type,
              actionName: action.payload.action_name,
              cancellable: action.payload.cancellable,
          }
        }
      
      case 'NSF_COUNTER_START':
        return {
          ...state,
          nsfCounter: {
            ...state.nsfCounter,
            active: true,
            actionId: action.payload.action_id,
            nsfActionId: action.payload.nsf_action_id,
            initiatorPlayerId: action.payload.player_id,
            actionType: action.payload.action_type,
            actionName: action.payload.action_name,
            timeRemaining: action.payload.time_remaining,
            showNsfBanner: true
          }
        }
      
      case 'NSF_COUNTER_TICK':
        return {
          ...state,
          nsfCounter: {
            ...state.nsfCounter,
            nsfActionId: action.payload.action_id,
            timeRemaining: action.payload.remaining_time,
          }
        }
      
      case 'NSF_PLAYED':
        const nsfPlayedLog = {
          id: `instant-${Date.now()}`,
          message: action.payload.message,
          type: 'instant',
          timestamp: new Date().toISOString(),
          playerId: action.payload.player_id,
        };

        return {
          ...state,
          nsfCounter: {
            ...state.nsfCounter,
            nsfActionId: action.payload.nsf_action_id,
            nsfChain: [ ...state.nsfCounter.nsfChain, { playerId: action.payload.player_id, timestamp: action.payload.timestamp } ],
          },
          logs: [...state.logs, nsfPlayedLog].slice(-50)
        }

      case 'NSF_COUNTER_COMPLETE':
        // Se termino la cadena de NSF entonces se retoma la accion
        const nsfComplete = {
          id: `instant-${Date.now()}`,
          message: action.payload.message,
          type: 'instant',
          timestamp: new Date().toISOString(),
        }

        return {
          ...state,
          nsfCounter: {
            ...state.nsfCounter,
            actionId: action.payload.action_id,
            finalResolution: action.payload.final_result,
            active: false,
            showNsfBanner: false,
            originalActionData: {
              endpoint: null,
              body: null,
              actionIdentifier: null,
              actionPayload: null,
            },
            nsfChain: []
          },
          logs: [...state.logs, nsfComplete].slice(-50)
        }

      // ---------------------
      // | DETECTIVE ACTIONS |
      // ---------------------

      case 'DETECTIVE_ACTION_STARTED':
        const detectiveStartLog = {
          id: `detective-start-${Date.now()}`,
          message: action.payload.message,
          type: 'detective',
          timestamp: new Date().toISOString(),
          playerId: action.payload.player_id,
        };

        return {
          ...state,
          detectiveAction: {
            ...state.detectiveAction,
            actionInProgress: {
              initiatorPlayerId: action.payload.player_id,
              setType: action.payload.set_type,
              step: 'select_target',
              message: action.payload.message,
            },
          },
          logs: [...state.logs, detectiveStartLog].slice(-50)
        };

      case 'DETECTIVE_TARGET_CONFIRMED':
        const targetConfirmedLog = {
          id: `detective-confirmed-${Date.now()}`,
          message: `Esperando confirmación de ${action.payload.targetPlayerData?.name || 'jugador objetivo'}`,
          type: 'detective',
          timestamp: new Date().toISOString(),
          playerId: action.payload.targetPlayerId,
        };

        return {
          ...state,
          detectiveAction: {
            ...state.detectiveAction,
            targetPlayerId: action.payload.targetPlayerId,
            showSelectPlayer: false,
            showWaiting: true,
            actionInProgress: {
              ...state.detectiveAction.actionInProgress,
              targetPlayerId: action.payload.targetPlayerId,
              step: 'waiting_target_confirmation',
              message: `Esperando confirmación de ${action.payload.targetPlayerData?.name || 'jugador'}`,
            },
          },
          logs: [...state.logs, targetConfirmedLog].slice(-50)
        };

      case 'DETECTIVE_PLAYER_SELECTED':
        const playerSelectedLog = {
          id: `detective-selected-${Date.now()}`,
          message: action.payload.message || 'Jugador seleccionado',
          type: 'detective',
          timestamp: new Date().toISOString(),
          playerId: action.payload.playerId,
        };

        return {
          ...state,
          detectiveAction: {
            ...state.detectiveAction,
            targetPlayerId: action.payload.playerId,
            showSelectPlayer: false,
            showSelectSecret: action.payload.needsSecret,
            showWaiting: !action.payload.needsSecret,
          },
          logs: action.payload.message ? [...state.logs, playerSelectedLog].slice(-50) : state.logs
        };

      case 'DETECTIVE_TARGET_NOTIFIED':
        const targetNotifiedLog = {
          id: `detective-notified-${Date.now()}`,
          message: action.payload.message || 'Objetivo notificado',
          type: 'detective',
          timestamp: new Date().toISOString(),
        };

        return {
          ...state,
          detectiveAction: {
            ...state.detectiveAction,
            actionInProgress: {
              ...state.detectiveAction.actionInProgress,
              step: 'target_must_confirm',
            },
            showSelectPlayer: true,
          },
          logs: action.payload?.message ? [...state.logs, targetNotifiedLog].slice(-50) : state.logs
        };

      case 'DETECTIVE_TARGET_SELECTED':
        const targetSelectedLog = {
          id: `detective-target-${Date.now()}`,
          message: action.payload.message,
          type: 'detective',
          timestamp: new Date().toISOString(),
          playerId: action.payload.target_player_id,
        };

        return {
          ...state,
          detectiveAction: {
            ...state.detectiveAction,
            actionInProgress: {
              ...state.detectiveAction.actionInProgress,
              targetPlayerId: action.payload.target_player_id,
              step: 'waiting_for_secret',
              message: action.payload.message,
            },
          },
          logs: [...state.logs, targetSelectedLog].slice(-50)
        }

      case 'DETECTIVE_START_CREATE_SET':
        return {
          ...state,
          detectiveAction: {
            ...state.detectiveAction,
            showCreateSet: true,
          },
        }

      case 'DETECTIVE_SET_SUBMITTED':
        const setSubmittedLog = {
          id: `detective-set-${Date.now()}`,
          message: action.payload.message || `Set de detective ${action.payload.setType} jugado`,
          type: 'detective',
          timestamp: new Date().toISOString(),
        };

        return {
          ...state,
          detectiveAction: {
            ...state.detectiveAction,
            current: {
              actionId: action.payload.actionId,
              setType: action.payload.setType,
              stage: action.payload.stage,
              cards: action.payload.cards,
              hasWildcard: action.payload.hasWildcard,
            },
            allowedPlayers: action.payload.allowedPlayers,
            secretsPool: action.payload.secretsPool,
            showCreateSet: false,
            showSelectPlayer: true,
          },
          logs: [...state.logs, setSubmittedLog].slice(-50)
        }

      case 'DETECTIVE_INCOMING_REQUEST':
        const incomingRequestLog = {
          id: `detective-request-${Date.now()}`,
          message: action.payload.message || 'Solicitud de detective recibida',
          type: 'detective',
          timestamp: new Date().toISOString(),
          playerId: action.payload.requester_id,
        };

        return {
          ...state,
          detectiveAction: {
            ...state.detectiveAction,
            incomingRequest: {
              actionId: action.payload.action_id,
              requesterId: action.payload.requester_id,
              setType: action.payload.set_type,
            },
            showChooseOwnSecret: true,
          },
          logs: [...state.logs, incomingRequestLog].slice(-50)
        }

      case 'DETECTIVE_ACTION_COMPLETE':
        const detectiveCompleteLog = {
          id: `detective-complete-${Date.now()}`,
          message: action.payload?.message || 'Acción de detective completada',
          type: 'detective',
          timestamp: new Date().toISOString(),
        };

        return {
          ...state,
          detectiveAction: {
            current: null,
            allowedPlayers: [],
            secretsPool: 'hidden',
            targetPlayerId: null,
            showCreateSet: false,
            showSelectPlayer: false,
            showSelectSecret: false,
            showWaiting: false,
            incomingRequest: null,
            showChooseOwnSecret: false,
            actionInProgress: null,
          },
          logs: [...state.logs, detectiveCompleteLog].slice(-50)
        }

      // ---------------
      // | EVENT CARDS |
      // ---------------

      case 'EVENT_ACTION_STARTED':
        const eventLog = {
          id: `event-${Date.now()}`,
          message: action.payload.message,
          type: 'event',
          timestamp: new Date().toISOString(),
          playerId: action.payload.player_id,
        };
        
        return {
          ...state,
          eventCards: {
            ...state.eventCards,
            actionInProgress: {
              playerId: action.payload.player_id,
              eventType: action.payload.event_type,
              cardName: action.payload.card_name,
              step: action.payload.step,
              message:
                action.payload.message ||
                `Playing ${action.payload.card_name}...`,
            },
          },
          logs: [...state.logs, eventLog].slice(-50)
        }

      case 'EVENT_STEP_UPDATE':
        const stepUpdateLog = {
          id: `event-step-${Date.now()}`,
          message: action.payload.message,
          type: 'event',
          timestamp: new Date().toISOString(),
        };

        return {
          ...state,
          eventCards: {
            ...state.eventCards,
            actionInProgress: {
              ...state.eventCards.actionInProgress,
              step: action.payload.step,
              message: action.payload.message,
            },
          },
          logs: action.payload.message ? [...state.logs, stepUpdateLog].slice(-50) : state.logs
        }

      case 'EVENT_CARD_TRADE_UPDATE': {
        console.log('[EVENT_CARD_TRADE_UPDATE]', action.payload);

        return {
          ...state,
          eventCards: {
            ...state.eventCards,
            actionInProgress: {
              ...state.eventCards.actionInProgress,
              ...action.payload,
            },
            logs: [
              ...(state.eventCards.logs || []),
              {
                type: 'EVENT',
                step: action.payload.step,
                info: `Card Trade actualizado: ${action.payload.step}`,
                timestamp: Date.now(),
              },
            ].slice(-50),
          },
        };
      }

      case 'EVENT_CARDS_OFF_TABLE_START':
        const cardsOffTableLog = {
          id: `event-cards-off-${Date.now()}`,
          message: action.payload?.message || 'Cards Off the Table jugada',
          type: 'event',
          timestamp: new Date().toISOString(),
          playerId: action.payload?.playerId || action.payload?.player_id,
        };

        return {
          ...state,
          eventCards: {
            ...state.eventCards,
            cardsOffTable: { showSelectPlayer: true },
            actionInProgress: {
              playerId: action.payload?.playerId || action.payload?.player_id,
              eventType: 'cards_off_table',
              step: 'select_player',
              message: action.payload?.message || 'Selecciona un jugador',
            },
          },
          logs: [...state.logs, cardsOffTableLog].slice(-50)
        }

      case 'EVENT_CARDS_OFF_TABLE_COMPLETE':
        const cardsOffCompleteLog = {
          id: `event-cards-off-complete-${Date.now()}`,
          message: action.payload?.message || 'Cards Off the Table completada',
          type: 'event',
          timestamp: new Date().toISOString(),
        };

        return {
          ...state,
          eventCards: {
            ...state.eventCards,
            cardsOffTable: { showSelectPlayer: false },
            actionInProgress: null,
          },
          logs: [...state.logs, cardsOffCompleteLog].slice(-50)
        }

      case 'EVENT_LOOK_ASHES_PLAYED':
        const lookAshesLog = {
          id: `event-ashes-${Date.now()}`,
          message: action.payload.message || 'Look Into the Ashes jugada',
          type: 'event',
          timestamp: new Date().toISOString(),
          playerId: action.payload.player_id,
        };

        return {
          ...state,
          eventCards: {
            ...state.eventCards,
            lookAshes: {
              actionId: action.payload.action_id,
              availableCards: action.payload.available_cards,
              showSelectCard: true,
            },
          },
          logs: [...state.logs, lookAshesLog].slice(-50)
        }

      case 'EVENT_ANOTHER_VICTIM_START':
        const anotherVictimLog = {
          id: `event-victim-${Date.now()}`,
          message: action.payload?.message || 'Another Victim jugada',
          type: 'event',
          timestamp: new Date().toISOString(),
          playerId: action.payload?.playerId,
        };

        return {
          ...state,
          eventCards: {
            ...state.eventCards,
            anotherVictim: {
              showSelectPlayer: true,
              selectedPlayer: null,
            },
            actionInProgress: {
              playerId: action.payload?.playerId,
              eventType: 'another_victim',
              step: 'select_player',
              message: 'Selecciona un jugador objetivo',
            },
          },
          logs: [...state.logs, anotherVictimLog].slice(-50)
        }

      case 'EVENT_ANOTHER_VICTIM_SELECT_PLAYER':
        const victimSelectLog = {
          id: `event-victim-select-${Date.now()}`,
          message: action.payload.message || `Jugador seleccionado para Another Victim`,
          type: 'event',
          timestamp: new Date().toISOString(),
        };

        return {
          ...state,
          eventCards: {
            ...state.eventCards,
            anotherVictim: {
              ...state.eventCards.anotherVictim,
              selectedPlayer: action.payload,
              showSelectSets: true,
              showSelectPlayer: false,
            },
          },
          logs: action.payload?.message ? [...state.logs, victimSelectLog].slice(-50) : state.logs
        }
      
      case 'EVENT_ANOTHER_VICTIM_COMPLETE':
        const victimCompleteLog = {
          id: `event-victim-complete-${Date.now()}`,
          message: action.payload?.message || 'Another Victim completada',
          type: 'event',
          timestamp: new Date().toISOString(),
        };

        return {
          ...state,
          eventCards: {
            ...state.eventCards,
            anotherVictim: {
              ...state.eventCards.anotherVictim,
              showSelectPlayer: false,
              showSelectSets: false,
              selectedPlayer: null,
              selectedSet: null,
            },
            actionInProgress: null,
          },
          logs: [...state.logs, victimCompleteLog].slice(-50)
        }

      case 'EVENT_LOOK_ASHES_COMPLETE':
        const ashesCompleteLog = {
          id: `event-ashes-complete-${Date.now()}`,
          message: action.payload?.message || 'Look Into the Ashes completada',
          type: 'event',
          timestamp: new Date().toISOString(),
        };

        return {
          ...state,
          eventCards: {
            ...state.eventCards,
            lookAshes: {
              actionId: null,
              availableCards: [],
              showSelectCard: false,
            },
            actionInProgress: null,
          },
          logs: [...state.logs, ashesCompleteLog].slice(-50)
        }

      case 'EVENT_ONE_MORE_PLAYED':
        const oneMoreLog = {
          id: `event-one-more-${Date.now()}`,
          message: action.payload.message || 'And Then There Was One More jugada',
          type: 'event',
          timestamp: new Date().toISOString(),
          playerId: action.payload.player_id,
        };

        return {
          ...state,
          eventCards: {
            ...state.eventCards,
            oneMore: {
              ...state.eventCards.oneMore,
              actionId: action.payload.action_id,
              availableSecrets: action.payload.available_secrets,
              showSecrets: true,
            },
          },
          logs: [...state.logs, oneMoreLog].slice(-50)
        }

      case 'EVENT_ONE_MORE_SECRET_SELECTED':
        const oneMoreSecretLog = {
          id: `event-one-more-secret-${Date.now()}`,
          message: action.payload.message || 'Secreto seleccionado para One More',
          type: 'event',
          timestamp: new Date().toISOString(),
        };

        return {
          ...state,
          eventCards: {
            ...state.eventCards,
            oneMore: {
              ...state.eventCards.oneMore,
              selectedSecretId: action.payload.secret_id,
              allowedPlayers: action.payload.allowed_players,
              showSecrets: false,
              showPlayers: true,
            },
          },
          logs: action.payload?.message ? [...state.logs, oneMoreSecretLog].slice(-50) : state.logs
        }

      case 'EVENT_ONE_MORE_COMPLETE':
        const oneMoreCompleteLog = {
          id: `event-one-more-complete-${Date.now()}`,
          message: action.payload?.message || 'One More completada',
          type: 'event',
          timestamp: new Date().toISOString(),
        };

        return {
          ...state,
          eventCards: {
            ...state.eventCards,
            oneMore: {
              actionId: null,
              availableSecrets: [],
              allowedPlayers: [],
              selectedSecretId: null,
              showSecrets: false,
              showPlayers: false,
            },
            actionInProgress: null,
          },
          logs: [...state.logs, oneMoreCompleteLog].slice(-50)
        }

      case 'EVENT_DELAY_ESCAPE_PLAYED':
        const delayEscapeLog = {
          id: `event-delay-${Date.now()}`,
          message: action.payload.message || 'Delay the Murderers Escape jugada',
          type: 'event',
          timestamp: new Date().toISOString(),
          playerId: action.payload.player_id,
        };

        return {
          ...state,
          eventCards: {
            ...state.eventCards,
            delayEscape: {
              actionId: action.payload.action_id,
              showQty: true,
            },
          },
          logs: [...state.logs, delayEscapeLog].slice(-50)
        }

      case 'EVENT_DELAY_ESCAPE_COMPLETE':
        const delayCompleteLog = {
          id: `event-delay-complete-${Date.now()}`,
          message: action.payload?.message || 'Delay the Murderers Escape completada',
          type: 'event',
          timestamp: new Date().toISOString(),
        };

        return {
          ...state,
          eventCards: {
            ...state.eventCards,
            delayEscape: {
              actionId: null,
              showQty: false,
            },
            actionInProgress: null,
          },
          logs: [...state.logs, delayCompleteLog].slice(-50)
        }
      
      // ----------------------
      // | CARDS DRAW-DISCARD |
      // ----------------------
      case 'PLAYER_MUST_DRAW':
        const isMe = action.payload.player_id === state.userId

        const discardLog = {
          id: `discard-${Date.now()}`,
          message: action.payload.message,
          type: 'discard',
          timestamp: new Date().toISOString(),
          playerId: action.payload.player_id,
        };

        return {
          ...state,
          drawAction: {
            ...state.drawAction,
            cardsToDrawRemaining: isMe ? action.payload.cards_to_draw : 0,
            otherPlayerDrawing: !isMe
              ? {
                  playerId: action.payload.player_id,
                  cardsRemaining: action.payload.cards_to_draw,
                  message: action.payload.message,
                }
              : null,
            hasDiscarded: true,
            hasDrawn: false,
          },
          logs: [...state.logs, discardLog].slice(-50)
        }

      case 'CARD_DRAWN_SIMPLE':
        const isMeDrawing = action.payload.player_id === state.userId
        const cardsRemaining = action.payload.cards_remaining

        const drawLog = {
          id: `draw-${Date.now()}`,
          message: action.payload.message,
          type: 'draw',
          timestamp: new Date().toISOString(),
          playerId: action.payload.player_id,
        };

        return {
          ...state,
          drawAction: {
            ...state.drawAction,
            cardsToDrawRemaining: isMeDrawing
              ? cardsRemaining
              : state.drawAction.cardsToDrawRemaining,
            otherPlayerDrawing:
              !isMeDrawing && cardsRemaining > 0
                ? {
                    playerId: action.payload.player_id,
                    cardsRemaining: cardsRemaining,
                    message: action.payload.message,
                  }
                : null,
            hasDiscarded: state.drawAction.hasDiscarded,
            hasDrawn: cardsRemaining === 0 ? true : state.drawAction.hasDrawn,
          },
          logs: [...state.logs, drawLog].slice(-50)
        }

      case 'UPDATE_DRAW_ACTION':
        return {
          ...state,
          drawAction: {
            ...state.drawAction,
            ...action.payload,
          },
        };

      case 'RESET_DRAW_ACTION':
        return {
          ...state,
          drawAction: {
            cardsToDrawRemaining: 0,
            otherPlayerDrawing: null,
            hasDiscarded: false,
            hasDrawn: false,
            skipDiscard: false,
          },
        };

      case 'DRAW_ACTION_COMPLETE':
        
        const drawCompleteLog = {
          id: `draw-complete-${Date.now()}`,
          message: action.payload?.message || 'Robo de cartas completado',
          type: 'draw',
          timestamp: new Date().toISOString(),
          playerId: action.payload?.player_id,
        };

        return {
          ...state,
          drawAction: {
            cardsToDrawRemaining: 0,
            otherPlayerDrawing: null,
            hasDiscarded: true,
            hasDrawn: true,
          },
          logs: [...state.logs, drawCompleteLog].slice(-50)
        }

      case 'FINISH_TURN':

        const finishTurnLog = {
          id: `turn-${Date.now()}`,
          message: action.payload.message,
          type: 'turn',
          timestamp: new Date().toISOString(),
          playerId: action.payload.player_id,
        };

        return {
          ...state,
          drawAction: {
            cardsToDrawRemaining: 0,
            otherPlayerDrawing: null,
            hasDiscarded: false,
            hasDrawn: false,
            skipDiscard: false,
          },
          logs: [...state.logs, finishTurnLog].slice(-50)
        }


      case 'EVENT_DEAD_CARD_FOLLY_START':
      const deadCardFollyLog = {
        id: `event-dead-card-folly-${Date.now()}`,
        message: action.payload?.message || 'Dead Card Folly jugada',
        type: 'event',
        timestamp: new Date().toISOString(),
        playerId: action.payload?.playerId,
      };

      return {
        ...state,
        eventCards: {
          ...state.eventCards,
          deadCardFolly: {
            ...state.eventCards.deadCardFolly,
            showDirection: true, 
            isSelecting: false,
            direction: null,
          },
          actionInProgress: {
            playerId: action.payload?.playerId,
            eventType: 'dead_card_folly',
            step: 'select_direction',
            message: 'Selecciona la dirección',
          },
        },
        logs: [...state.logs, deadCardFollyLog].slice(-50)
      };


      case "EVENT_DEAD_CARD_FOLLY_SELECT": {
        const follyLog = {
          id: `folly-select-${Date.now()}`,
          message: action.payload.message || 'Seleccionar carta para intercambiar',
          type: "event",
          timestamp: action.payload.timestamp || new Date().toISOString(),
          playerId: action.payload.player_id,
        };

        return {
          ...state,
          eventCards: {
            ...state.eventCards,
            deadCardFolly: {
              ...state.eventCards.deadCardFolly,
              showDirection: false,
              isSelecting: true,
              actionId: action.payload.action_id,
              direction: action.payload.direction,
            },
            actionInProgress: {
              playerId: action.payload.player_id,
              eventType: "dead_card_folly",
              step: "select_card",
              message: action.payload.message,
            },
          },
          logs: [...state.logs, follyLog].slice(-50),
        };
      }

      case "EVENT_DEAD_CARD_FOLLY_COMPLETE": {
        const follyLog = {
          id: `folly-complete-${Date.now()}`,
          message: action.payload.message,
          type: "event",
          timestamp: action.payload.timestamp || new Date().toISOString(),
        };

        return {
          ...state,
          eventCards: {
            ...state.eventCards,
            deadCardFolly: {
              ...state.eventCards.deadCardFolly,
              isSelecting: false,
              actionId: null,
              direction: null,
            },
            actionInProgress: null,
          },
          logs: [...state.logs, follyLog].slice(-50),
        };
      }
             

      // --------------------
      // | DESGRACIA SOCIAL |
      // --------------------

      case 'SOCIAL_DISGRACE_UPDATE': {
        const { players_in_disgrace, change } = action.payload;

        let finalList = players_in_disgrace || [];

        //Si la lista del backend viene vacia pero el 'change' dice que
        //alguien entro, construimos la lista nosotros mismos.
        if (finalList.length === 0 && change && change.action === 'entered') {
          //Asumimos que la lista solo debe contener al jugador que acaba de entrar
          finalList = [
            {
              player_id: change.player_id,
              player_name: change.player_name,
              avatar_src: change.avatar_src,
              entered_at: new Date().toISOString() 
            }
          ];
        }

        let logMessage = null;
        if (change) {
          if (change.action === 'entered') {
            logMessage = {
              type: 'SOCIAL_DISGRACE',
              message: `${change.player_name} ha entrado en desgracia social`,
              timestamp: new Date().toISOString(),
              playerId: change.player_id,
              action: 'entered'
            };
          } else if (change.action === 'exited') {
            logMessage = {
              type: 'SOCIAL_DISGRACE',
              message: `${change.player_name} ha salido de desgracia social`,
              timestamp: new Date().toISOString(),
              playerId: change.player_id,
              action: 'exited'
            };
          }
        }
        
        return {
          ...state,
          playersInSocialDisgrace: finalList, //lista corregida
          logs: logMessage 
            ? [...state.logs, logMessage].slice(-50)
            : state.logs
        };
      }

        default:
          return state;

    }}
  

export const GameProvider = ({ children }) => {
  const [gameState, gameDispatch] = useReducer(gameReducer, gameInitialState)
  const socketRef = useRef(null)
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const connectToGame = useCallback((roomId, userId) => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    const socket = io('http://localhost:8000', {
      query: {
        room_id: roomId,
        user_id: userId,
      },
      transports: ['websocket', 'polling'],
      forceNew: true,
    })

    socketRef.current = socket

    // -------------------------------
    // | CONNECTION ACTION LISTENERS |
    // -------------------------------

    socket.on('connected', data => {
      console.log('✅ Backend confirmed connection room:', roomId)
      gameDispatch({ type: 'SOCKET_CONNECTED' })
    })

    socket.on('disconnected', () => {
      console.log('❌ Socket disconnected')
      gameDispatch({ type: 'SOCKET_DISCONNECTED' })
    })

    socket.on('player_connected', () => {
      console.log('✅ Player joined room:', roomId)
    })

    socket.on('player_disconnected', () => {
      console.log('✅ Player leaved room:', roomId)
    })

    // ------------------------
    // | GAME STATE LISTENERS |
    // ------------------------

    socket.on('game_state_public', data => {
      gameDispatch({
        type: 'UPDATE_GAME_STATE_PUBLIC',
        payload: data,
      })
    })

    socket.on('game_state_private', data => {
      gameDispatch({ type: 'UPDATE_GAME_STATE_PRIVATE', payload: data })
    })

    socket.on('connect_error', error => {
      console.error('❌ Socket connection error:', error)
    })

    socket.on('game_ended', data => {
      gameDispatch({
        type: 'GAME_ENDED',
        payload: {
          ganaste: data.winners.some(w => w.player_id === userId),
          winners: data.winners,
          reason: data.reason,
        },
      })
    })

    // --------------------
    // | ACTION LISTENERS |
    // --------------------

    socket.on('valid_action', data => {
      console.log('RCEIVED VALID ACTION: ', data);
      gameDispatch({
        type: 'VALID_ACTION',
        payload: data,
      })
    })

    socket.on('nsf_counter_start', data => {
      console.log('RECEIVED START COUNTER WINDOW', data)
      gameDispatch({
        type: 'NSF_COUNTER_START',
        payload: data,
      })
    })

    socket.on('nsf_counter_tick', data => {
      gameDispatch({
        type: 'NSF_COUNTER_TICK',
        payload: data,
      })
    })

    socket.on('nsf_played', data => {
      console.log("NSF_PLAYED", data)
      gameDispatch({
        type: 'NSF_PLAYED',
        payload: data,
      })
    })

    socket.on('nsf_counter_complete', async data => {
      console.log('RECEIVED COUNTER COMPLETE:', data);
      
      const currentState = gameStateRef.current;
      
      gameDispatch({
        type: 'NSF_COUNTER_COMPLETE',
        payload: data,
      });
      
      if (currentState.nsfCounter.initiatorPlayerId === currentState.userId) {
        console.log("RESUMING ACTION");
        
        if (data.final_result === 'continue') {
          const { endpoint, body, requiresEndpoint, actionIdentifier, actionPayload } = 
            currentState.nsfCounter.originalActionData;
          
          console.log('RESUMING ACTION', requiresEndpoint ? endpoint : actionIdentifier);
          
          await resumeAction({
            roomId: currentState.roomId,
            userId: currentState.userId,
            endpoint,
            payload: body,
            requiresEndpoint,
            actionIdentifier,
            actionPayload,
            gameDispatch,
          });

        } else if (data.final_result === 'cancelled') {
          const { actionType } = currentState.nsfCounter;
          const { body } = currentState.nsfCounter.originalActionData;
          let additionalDataToCancel = { actionType: actionType }
          
          if (actionType == 'ADD_TO_SET') {
              additionalDataToCancel = { actionType: actionType, player_target: currentState.userId, setPosition: body.setPosition }
          }
          await cancelEffect({
            roomId: currentState.roomId,
            userId: currentState.userId,
            actionId: data.action_id,
            cardsIds: currentState.nsfCounter.cardsIds,
            additionalData: additionalDataToCancel
          });
          gameDispatch({ type: "UPDATE_DRAW_ACTION", payload: { skipDiscard: true } });

        }
      }
    });

    socket.on('cancelled_action_executed', data => {
      gameDispatch({
        type: '',
        payload: data,
      })
    })
    
    // ------------------------------
    // | DETECTIVE ACTION LISTENERS |
    // ------------------------------

    socket.on('detective_action_started', data => {
      gameDispatch({
        type: 'DETECTIVE_ACTION_STARTED',
        payload: data,
      })
    })

    socket.on('detective_target_selected', data => {
      gameDispatch({
        type: 'DETECTIVE_TARGET_SELECTED',
        payload: data,
      })
    })

    socket.on('select_own_secret', data => {
      gameDispatch({
        type: 'DETECTIVE_INCOMING_REQUEST',
        payload: data,
      })
    })

    socket.on('detective_action_complete', data => {
      gameDispatch({ type: 'DETECTIVE_ACTION_COMPLETE' })
    })

    // ------------------------
    // | EVENT CARD LISTENERS |
    // ------------------------

    socket.on('event_action_started', data => {
      gameDispatch({
        type: 'EVENT_ACTION_STARTED',
        payload: data,
      })
    })

    socket.on('event_step_update', data => {
      gameDispatch({
        type: 'EVENT_STEP_UPDATE',
        payload: data,
      })
    })

    socket.on('event_action_complete', data => {
    })

    // Card Trade - P2 recibe notificación para seleccionar carta
    socket.on('card_trade_select_own_card', (data) => {
      console.log('WS: card_trade_select_own_card received', data)

      gameDispatch({
        type: 'EVENT_CARD_TRADE_UPDATE',
        payload: {
          eventType: 'card_trade',
          step: 'target_select_card',
          actionId: data.action_id,
          targetPlayerId: data.target_id,
          requesterId: data.requester_id,
          message: `${data.requester_name || 'Un jugador'} quiere intercambiar una carta contigo`
        }
      })
    })


    // Card Trade - Todos reciben notificación de intercambio completo
    socket.on('card_trade_complete', (data) => {
      console.log('WS: card_trade_complete received', data)
      
      gameDispatch({
        type: 'EVENT_STEP_UPDATE',
        payload: {
          step: 'completed',
          message: data.message || 'Intercambio de cartas completado'
        }
      })
    })
    // ---------------------------
    // | DEAD CARD FOLLY EVENTS |
    // ---------------------------

    socket.on("dead_card_folly_select_card", (data) => {
      console.log("Dead Card Folly - selección iniciada:", data);
      gameDispatch({
        type: "EVENT_DEAD_CARD_FOLLY_SELECT",
        payload: data,
      });
    });

    socket.on("dead_card_folly_complete", (data) => {
      console.log("Dead Card Folly - rotación completada:", data);
      gameDispatch({
        type: "EVENT_DEAD_CARD_FOLLY_COMPLETE",
        payload: data,
      });
    });


    // ------------------------
    // | DRAW-DISCARD CARD LISTENERS |
    // ------------------------

    socket.on('player_must_draw', data => {
      gameDispatch({
        type: 'PLAYER_MUST_DRAW',
        payload: data,
      })
    })

    socket.on('card_drawn_simple', data => {
      gameDispatch({
        type: 'CARD_DRAWN_SIMPLE',
        payload: data,
      })
    })

    socket.on('turn_finished', data => {
      gameDispatch({ 
        type: 'FINISH_TURN',
        payload: data,
      })
    })

    // ------------------------
    // | CANCEL - EXIT GAME LISTENERS |
    // ------------------------

    // Caso abandonar sala
    socket.on('player_left', data => {
      if (data.player_id === userId) {
        // Yo abandono la sala
        gameDispatch({
          type: 'PLAYER_REMOVED_FROM_LOBBY',
          payload: { timestamp: new Date().toISOString() },
        })
      } else {
        // Otro abandona la sala => actualizar lista de jugadores
        gameDispatch({
          type: 'UPDATE_GAME_STATE_PUBLIC',
          payload: {
            jugadores: data.players,
            timestamp: new Date().toISOString(),
          },
        })

        // Notificar que un jugador salio
        gameDispatch({
          type: 'PLAYER_LEFT_NOTIFICATION',
          payload: {
            playerName: 'Un jugador',
            timestamp: new Date().toISOString(),
          },
        })
      }
    })

    // Caso cancelar partida
    socket.on('game_cancelled', data => {
      gameDispatch({
        type: 'GAME_CANCELLED',
        payload: { timestamp: new Date().toISOString() },
      })
    })

    // ------------------------------
    // | DESGRACIA SOCIAL LISTENERS |
    // ------------------------------
    socket.on('social_disgrace_update', (data) => {
      console.log('Actualizacion desgracia social:', data);
      console.log('Players in disgrace:', data.players_in_disgrace);
      
      gameDispatch({
        type: 'SOCIAL_DISGRACE_UPDATE',
        payload: {
          players_in_disgrace: data.players_in_disgrace,
          change: data.change
        }
      });
    });
  }, [])

  // Function to disconnect from socket
  const disconnectFromGame = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      gameDispatch({ type: 'SOCKET_DISCONNECTED' })
    }
  }, [gameState.roomId])

  return (
    <GameContext.Provider
      value={{ gameState, gameDispatch, connectToGame, disconnectFromGame }}
    >
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}