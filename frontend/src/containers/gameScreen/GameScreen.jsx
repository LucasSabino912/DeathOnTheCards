import '../../index.css'
import { useUser } from '../../context/UserContext.jsx'
import { useGame } from '../../context/GameContext.jsx'
import { useState, useEffect, useRef } from 'react'
import Deck from '../../components/game/Deck.jsx'
import Discard from '../../components/game/Discard.jsx'
import GameEndModal from '../../components/modals/GameEndModal'
import HandCards from '../../components/game/HandCards.jsx'
import Secrets from '../../components/game/Secrets.jsx'
import ButtonGame from '../../components/common/ButtonGame.jsx'
import Draft from '../../components/game/Draft.jsx'
import Tabs from '../../components/game/Tabs.jsx'
import TabPanel from '../../components/game/TabPanel.jsx'
import Log from '../../components/game/Log.jsx'
import OtherPlayerSets from '../../components/game/OtherPlayerSets.jsx'
import LookIntoTheAshes from '../../components/modals/LookIntoTheAshes.jsx'
import SelectOtherPLayerSet from '../../components/modals/SelectOtherPLayerSet.jsx'
import PlayerSetsModal from '../../components/modals/PlayerSets.jsx'
import HideRevealStealSecretsModal from '../../components/modals/HideRevealStealSecrets.jsx'
import SelectPlayerModal from '../../components/modals/SelectPlayer.jsx'
import OtherPlayerSecrets from '../../components/game/OtherPLayerSecrets.jsx'
import { startActionWithCounterCheck, playNotSoFast } from '../../helpers/NSF.js'
import NsfBanner from '../../components/game/NsfBanner.jsx'
import SelectQtyModal from '../../components/modals/SelectQtyModal.jsx'
import OneMoreSecretsModal from '../../components/modals/OneMoreSecretsModal.jsx'
import SelectPlayerOneMoreModal from '../../components/modals/SelectPlayerOneMoreModal.jsx'
import SelectCard from '../../components/modals/SelectCardModal.jsx'
import SelectDirectionModal from '../../components/modals/SelectDirectionModal.jsx'
import SelectCardForExchange from '../../components/modals/SelectCardForExchange.jsx'

export default function GameScreen() {
  const { userState } = useUser()
  const { gameState, gameDispatch } = useGame()
  const [hasPlayedSet, setHasPLayedSet] = useState(false)
  const [hasPlayedEvent, setHasPLayedEvent] = useState(false)

  const [selectedCards, setSelectedCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPlayerSets, setShowPlayerSets] = useState(false)
    const selectedCardIdRef = useRef(null);

  useEffect(() => {
    console.log(gameState.nsfCounter);
  }, [gameState.nsfCounter.originalActionData, gameState.nsfCounter.cancellable, gameState.nsfCounter.initiatorPlayerId, gameState.nsfCounter.nsfChain]);
  // const [selectedCardTrade, setSelectedCardTrade] = useState(null)
  const [selectedCardIdForEvent, setSelectedCardIdForEvent] = useState(null);

  // const roomId = gameState?.roomId
  // const action = gameState.eventCards?.actionInProgress;
  // const step = action?.step;  

  const isWaitingForOtherPlayer = 
  gameState.turnoActual === userState.id && 
  (
    (gameState.detectiveAction.current !== null && 
     gameState.detectiveAction.current.stage !== 'completed') ||
    (gameState.eventCards.actionInProgress !== null && 
     gameState.eventCards.actionInProgress.step !== 'completed' &&
     gameState.eventCards.actionInProgress.playerId === userState.id)
  );
  // Obtener los sets del jugador actual
  const playerSetsForModal = (gameState.sets || [])
    .filter(set => set.owner_id === userState.id)
    .map((set, index) => {
      // set.cards tiene {id, name, description, type, img_src}
      const firstCard = set.cards?.[0]

      const mappedSet = {
        id: index,
        setType: set.set_type,
        setName: firstCard?.name || `Detective Set`,
        cards: set.cards || [],
        hasWildcard: set.hasWildcard || false,
        position: set.position,
      }

      return mappedSet
    })

  //helper para verificar si un jugador esta en desgracia social
  const isPlayerInDisgrace = (playerId) => {
    return gameState.playersInSocialDisgrace.some(
      player => player.player_id === playerId
    );
  };

  //Helper para el jugador actual
  const isCurrentPlayerInDisgrace = isPlayerInDisgrace(userState.id);

  const handleCardSelect = cardId => {
    //si el jugador esta en desgracia social
    if (isCurrentPlayerInDisgrace) {
      const isAlreadySelected = selectedCards.some(card => card.id === cardId);
      
      //si ya hay una carta seleccionada y estas intentando seleccionar otra
      if (selectedCards.length >= 1 && !isAlreadySelected) {
        setError('Solo puedes seleccionar una carta en desgracia social');
        setTimeout(() => setError(null), 3000);
        return; // ← Bloquear seleccion
      }
    }
    //si el jugador no esta en desgracia social
    setSelectedCards(prev => {
      const isSelected = prev.some(card => card.id === cardId)
      if (isSelected) {
        return prev.filter(card => card.id !== cardId)
      } else {
        const card = gameState.mano.find(c => c.id === cardId)
        return [...prev, { id: cardId, name: card?.name || '' }]
      }
    })
  }

  const handlePlayNotSoFast = async () => {
    // Validate selection
    if (selectedCards.length !== 1) return;
    
    const card = selectedCards[0];
    if (!card) return;
    
    // Check if it's a valid NSF card
    if (card.name !== "Not so fast") return;
    
    // Check if counter window is active
    if (!gameState.nsfCounter.active) return;
    
    // Play the NSF card
    const playedNsfCounter = await playNotSoFast(
      card, 
      userState.id, 
      gameState.roomId,
      gameState.nsfCounter.actionId,
      setError
    );
    
    if (playedNsfCounter) {
      setSelectedCards([]);
    }
  }

  const handlePLayEventCard = async () => {
    if (hasPlayedEvent) return;
    const card = selectedCards[0];  // Carta de evento a jugar
    const payload = { card_id: Number(card.id) };
    
    // ----------  Look Into The Ashes ----------
    if (card.name === "Look into the ashes") {
      // Jugar la carta iniciando la accion
      await startActionWithCounterCheck({
        roomId: gameState.roomId,
        userId: userState.id,
        cardsIds: [card.id],
        actionType: 'EVENT',
        endpoint: "/look-into-ashes/play",
        payload,
        setError,
        setLoading,
        gameDispatch,
        requiresEndpoint: true, 
        actionIdentifier: "EVENT_LOOK_ASHES_PLAYED",
        actionPayload: {},
      });
      setSelectedCards([]);
      setHasPLayedEvent(true);
      return;
    }

    // ----------  Early train to paddington ----------
    if (card.name === "Early train to paddington") {
      // Jugar la carta iniciando la accion
      await startActionWithCounterCheck({
        roomId: gameState.roomId,
        userId: userState.id,
        cardsIds: [card.id],
        actionType: 'EVENT',
        endpoint: "/early_train_to_paddington",
        payload,
        setError,
        setLoading,
        gameDispatch,
        requiresEndpoint: true, 
        actionIdentifier: null,
        actionPayload: null,
      });
      setSelectedCards([])
      setHasPLayedEvent(true)
      return;
    }

    // ----------  Another Victim ----------
    if (card.name === "Another Victim") {
      if (gameState.sets.length <= 0) return;
      // Jugar la carta y seleccionar el jugador objetivo y el set objetivo
      await startActionWithCounterCheck({
        roomId: gameState.roomId,
        userId: userState.id,
        cardsIds: [card.id],
        actionType: 'EVENT',
        endpoint: null,
        payload: null,
        setError,
        setLoading,
        gameDispatch,
        requiresEndpoint: false, 
        actionIdentifier: "EVENT_ANOTHER_VICTIM_START",
        actionPayload: { playerId: userState.id },
      })
      setLoading(false)
      setSelectedCards([])
      setHasPLayedEvent(true)
      return;
    }

    // ----------  Cards off the table ----------
    if (card.name === "Cards off the table") {
      // Jugar la carta y seleccionar el jugador objetivo     
      await startActionWithCounterCheck({
        roomId: gameState.roomId,
        userId: userState.id,
        cardsIds: [card.id],
        actionType: 'EVENT',
        endpoint: null,
        payload: null,
        setError,
        setLoading,
        gameDispatch,
        requiresEndpoint: false, 
        actionIdentifier: "EVENT_CARDS_OFF_TABLE_START",
        actionPayload: { 
          playerId: userState.id,
          message: 'Selecciona un jugador para descartar sus cartas NSF'
        },
      })
      setSelectedCards([])
      setHasPLayedEvent(true)
      return;
    }
    
    // ----------  Delay the murderers escape! ----------
    if (card.name === "Delay the murderers escape!") {
      selectedCardIdRef.current = card.id
      await startActionWithCounterCheck({
        roomId: gameState.roomId,
        userId: userState.id,
        cardsIds: [card.id],
        actionType: 'EVENT',
        endpoint: null,
        payload: null,
        setError,
        setLoading,
        gameDispatch,
        requiresEndpoint: false, 
        actionIdentifier: "EVENT_DELAY_ESCAPE_PLAYED",
        actionPayload: { 
          playerId: userState.id,
          showQty: true,
          message: 'Delay the Murderers Escape jugada'
        },
      })
      setHasPLayedEvent(true)
      setSelectedCards([])
      setLoading(false)
      return;
    }

    // ----------  And then there was one more... ----------
    if (card.name === "And then there was one more...") {
      const hasVisibleSecret = gameState.secretsFromAllPlayers.some(s => s.hidden === false);
      if (!hasVisibleSecret) { setError("No podes jugar And then there was one more.. si no hay secretos revelados."); return; };
      const payload = {
        card_id: card.id
      }
      await startActionWithCounterCheck({
        roomId: gameState.roomId,
        userId: userState.id,
        cardsIds: [card.id],
        actionType: 'EVENT',
        endpoint: "/event/one-more",
        payload,
        setError,
        setLoading,
        gameDispatch,
        requiresEndpoint: true, 
        actionIdentifier: "EVENT_ONE_MORE_PLAYED",
        actionPayload: {},
      });       
      setSelectedCards([])
      setHasPLayedEvent(true)
      return;
    }

    // ----------  Card trade ----------
    if (card.name === "Card trade") {
      await startActionWithCounterCheck({
        roomId: gameState.roomId,
        userId: userState.id,
        cardsIds: [card.id],
        actionType: 'EVENT',
        endpoint: null,
        payload: null,
        setError,
        setLoading,
        gameDispatch,
        requiresEndpoint: false, 
        actionIdentifier: "EVENT_ACTION_STARTED",
        actionPayload: { 
            player_id: userState.id,
            event_type: 'card_trade',
            card_name: 'Card trade',
            step: 'select_player',
            message: 'Selecciona un jugador para intercambiar cartas'
          },
      })
      setSelectedCards([])
      setHasPLayedEvent(true)
      return;
    }

    // ----------  Card trade ----------
    if (card.name === "Dead card folly") {
      await startActionWithCounterCheck({
        roomId: gameState.roomId,
        userId: userState.id,
        cardsIds: [card.id],
        actionType: 'EVENT',
        endpoint: null,
        payload: null,
        setError,
        setLoading,
        gameDispatch,
        requiresEndpoint: false, 
        actionIdentifier: "EVENT_DEAD_CARD_FOLLY_START",
        actionPayload: {
            playerId: userState.id,
            cardId: card.id,
            message: "Jugaste Dead Card Folly. Elegí una dirección.",
          },
      })
      setSelectedCardIdForEvent(card.id);
      console.log("🔍 selectedCardIdForEvent:", selectedCardIdForEvent);

      setSelectedCards([])
      setHasPLayedEvent(true)
      return;
    }  

    // La carta no esta implementada    
    setError("Esta carta aún no está implementada")
    setTimeout(() => setError(null), 3000)
    return;
  }

  const handleDiscard = async () => {
    if (selectedCards.length === 0) {
      setError('Debes seleccionar al menos una carta para descartar')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const cardsWithOrder = selectedCards.map((card, index) => ({
        order: index + 1,
        card_id: card.id,
      }))

      const response = await fetch(
        `http://localhost:8000/game/${gameState.roomId}/discard`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            HTTP_USER_ID: userState.id.toString(),
          },
          body: JSON.stringify({
            card_ids: cardsWithOrder,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(getErrorMessage(response.status, errorData))
      }

      const data = await response.json()
      setSelectedCards([])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFinishTurn = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `http://localhost:8000/game/${gameState.roomId}/finish-turn`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userState.id,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(getErrorMessage(response.status, errorData))
      }

      const data = await response.json()

      setHasPLayedEvent(false);
      setHasPLayedSet(false);
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePickFromDeck = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `http://localhost:8000/game/${gameState.roomId}/take-deck`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            HTTP_USER_ID: userState.id.toString(),
          },
          body: JSON.stringify({
            user_id: userState.id,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(getErrorMessage(response.status, errorData))
      }

      const data = await response.json()

      setSelectedCards([])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDraft = async cardId => {
    try {
      const response = await fetch(
        `http://localhost:8000/game/${gameState.gameId}/draft/pick`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            HTTP_USER_ID: userState.id.toString(),
          },
          body: JSON.stringify({
            card_id: cardId,
            user_id: userState.id,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(getErrorMessage(response.status, errorData))
      }

      const data = await response.json()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handler cuando P1 selecciona su carta propia para intercambiar
  // Handler cuando P1 selecciona su carta propia para intercambiar
  const handleSelectOwnCardForTrade = async (selectedCardId) => {
    setLoading(true);
    setError(null);
    try {
      const { actionInProgress } = gameState.eventCards || {};
      if (!actionInProgress || actionInProgress.eventType !== 'card_trade') {
        throw new Error("No hay una acción de Card Trade en progreso");
      }
      const targetPlayerId = actionInProgress.targetPlayerId;
      if (!targetPlayerId) {
        throw new Error("No se ha seleccionado un jugador objetivo");
      }
      const response = await fetch(
        `http://localhost:8000/api/game/${gameState.roomId}/event/card-trade/play`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'HTTP_USER_ID': userState.id.toString(),
          },
          body: JSON.stringify({
            own_card_id: selectedCardId, 
            target_player_id: targetPlayerId
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(getErrorMessage(response.status, errorData));
      }
      const data = await response.json();
      gameDispatch({
        type: 'EVENT_CARD_TRADE_UPDATE',
        payload: {
          step: 'waiting_target',
          actionId: data.action_id,
          targetPlayerId: targetPlayerId,
          message: `Esperando que ${gameState.jugadores.find(p => p.player_id === targetPlayerId)?.name || 'el jugador'} seleccione su carta...`
        }
      });
      setSelectedCards([]); // Limpiar selección
    } catch (err) {
      console.error("Error selecting own card for trade:", err);
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Handler cuando P2 selecciona su carta para completar el intercambio
  const handleSelectTargetCardForTrade = async (selectedCardId) => {
    setLoading(true)
    setError(null)
    try {
      const { actionInProgress } = gameState.eventCards
      if (!actionInProgress || actionInProgress.eventType !== 'card_trade') {
        throw new Error("No hay una acción de Card Trade en progreso")
      }
      const actionId = actionInProgress.actionId
      if (!actionId) {
        throw new Error("No action ID found")
      }
      const response = await fetch(
        `http://localhost:8000/api/game/${gameState.roomId}/event/card-trade/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'HTTP_USER_ID': userState.id.toString(),
          },
          body: JSON.stringify({
            action_id: actionId,
            own_card_id: selectedCardId
          }),
        }
      )
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Backend error:", errorData)
        throw new Error(getErrorMessage(response.status, errorData))
      }
      const data = await response.json()
      gameDispatch({
        type: 'EVENT_STEP_UPDATE',
        payload: {
          step: 'completed',
          message: 'Intercambio de cartas completado'
        }
      })
    } catch (err) {
      console.error("Error completing card trade:", err)
      setError(err.message)
      setTimeout(() => setError(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayerSelect = async (jugadorId) => {
    const { actionInProgress } = gameState.eventCards;
    const currentEventType = actionInProgress?.eventType;
    const { current: detectiveAction } = gameState.detectiveAction;
    const detectiveSetType = detectiveAction?.setType;
    const actionId = detectiveAction?.actionId;

    if (currentEventType === 'card_trade' && actionInProgress?.step === 'select_player') {
      // Guardar target en actionInProgress y avanzar al paso de seleccionar carta propia
      gameDispatch({
        type: 'EVENT_CARD_TRADE_UPDATE',
        payload: {
          step: 'select_own_card',
          targetPlayerId: jugadorId,
          message: 'Selecciona la carta que quieres intercambiar'
        }
      });

      return;
    }

    // Caso 0: Cards Off the Table
    if (currentEventType === 'cards_off_table') {
      // Se obtuvo el jugador objetivo, ahora se inicia la accion
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:8000/api/game/${gameState.roomId}/cards_off_the_table`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              HTTP_USER_ID: userState.id.toString(),
            },
            body: JSON.stringify({
              targetPlayerId: jugadorId,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Backend error:", errorData);
          throw new Error(getErrorMessage(response.status, errorData));
        }

        const data = await response.json();
        console.log("Cards Off the Table played successfully:", data);

        gameDispatch({
          type: 'EVENT_CARDS_OFF_TABLE_COMPLETE',
          payload: {
            message: `Se descartaron ${data.nsf_cards_discarded} cartas NSF`
          }
        });

        setSelectedCards([]);
        setHasPLayedEvent(true);

      } catch (err) {
        console.error("❌ Error playing Cards Off the Table:", err);
        setError(err.message);
        setTimeout(() => setError(null), 5000);
        
        gameDispatch({ type: 'EVENT_CARDS_OFF_TABLE_COMPLETE' });
      } finally {
        setLoading(false);
      }
      return;
    }

    // Caso 1: Another Victim
    if (currentEventType === 'another_victim') {
      // se obtuvo el jugador objetivo, ahora seleccionar el set
      gameDispatch({
        type: 'EVENT_ANOTHER_VICTIM_SELECT_PLAYER',
        payload: jugadorId,
      });
      return;
    }

    // Caso 2: Detective Action
    if (detectiveAction && actionId) {
      // Se obtuvo el jugador objetivo
      gameDispatch({
        type: 'DETECTIVE_TARGET_CONFIRMED',
        payload: {
          targetPlayerId: jugadorId,
          targetPlayerData: jugadorId,
        },
      });
      // Caso 2.a: Tambien seleccionar el secreto a ocular/revelar
      if (detectiveSetType == "marple" || detectiveSetType == "poirot" || detectiveSetType == "pyne") {
        gameDispatch({
          type: 'DETECTIVE_PLAYER_SELECTED',
          payload: {
            ...detectiveAction,
            targetPlayerId: jugadorId,
            needsSecret: true,
          },
        })
      } else { // Caso 2.b: El objetivo tiene que seleccionar el secreto a ocultar/revelar
        try {
          const payload = {
            actionId: actionId,
            executorId: userState.id,
            targetPlayerId: jugadorId,
            secretId: null,
          }
          const response = await fetch(
            `http://localhost:8000/api/game/${gameState.roomId}/detective-action`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                HTTP_USER_ID: userState.id.toString(),
              },
              body: JSON.stringify(payload),
            }
          );
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error("Backend error:", errorData);
            throw new Error(getErrorMessage(response.status, errorData));
          }
          
          const data = await response.json();

          gameDispatch({
            type: 'DETECTIVE_PLAYER_SELECTED',
            payload: {
              ...detectiveAction,
              targetPlayerId: jugadorId,
              needsSecret: false,
            },
          })
        } catch (error) { // Si hubo error resetear la seleccion de jugador
          gameDispatch({
            type: 'DETECTIVE_SET_SUBMITTED',
            payload: {
              ...detectiveAction,
              allowedPlayers: gameState.detectiveAction.allowedPlayers,
              secretsPool: gameState.detectiveAction.secretsPool,
            },
          });
          setError(error.message);
          setTimeout(() => setError(null), 5000);
        }
      }
    }  
  };

  const handlePlayDetective = async () => {
    const cardsToUse = selectedCards; // [{ id, name }]

    const minCards = {
      poirot: 3,
      marple: 3,
      satterthwaite: 2,
      pyne: 2,
      eileenbrent: 2,
      beresford: 2,
    };

    if (cardsToUse.length === 0) {
      setError("Debes seleccionar al menos una carta de detective");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const setType = detectSetType(cardsToUse); 
    if (!setType) {
      setError("Las cartas seleccionadas no forman un set válido");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (cardsToUse.length < minCards[setType]) {
      setError(`Set de ${setType} requiere al menos ${minCards[setType]} cartas`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (setType === 'pyne') {
      const hasRevealedSecret = gameState.secretsFromAllPlayers.some(s => !s.hidden);
      if (!hasRevealedSecret) {
        setError("Parker Pyne requiere que otros jugadores tengan secretos revelados");
        setTimeout(() => setError(null), 3000);
        return;
      }
    }

    const hasWildcard = checkForWildcard(cardsToUse);
    
    const payload = {
      owner: userState.id,
      setType,
      cards: cardsToUse.map(c => c.id),
      hasWildcard,
    };
    
    await startActionWithCounterCheck({
      roomId: gameState.roomId,
      userId: userState.id,
      cardsIds: cardsToUse.map(c => c.id),
      actionType: 'CREATE_SET',
      setPosition: null,
      endpoint: "/play-detective-set",
      payload,
      setLoading,
      setError,
      gameDispatch,
      requiresEndpoint: true, 
      actionIdentifier: "DETECTIVE_SET_SUBMITTED",
      actionPayload: { setType, cardsToUse, hasWildcard},
    });
    setLoading(false);
    setSelectedCards([]);
    setHasPLayedSet(true);
    return;
  };

  const handleAddToSet = async (set, detectiveToAdd) => {
    
    if (!set || !set.position) {
        setError("Debes seleccionar un set válido");
        setTimeout(() => setError(null), 3000);
        return;
    }
    
    if (!detectiveToAdd || !detectiveToAdd.id) {
        setError("Debes seleccionar un detective para agregar");
        setTimeout(() => setError(null), 3000);
        return;
    }

    const nameToSetType = {
      "Hercule Poirot": "poirot",
      "Miss Marple": "marple",
      "Mr Satterthwaite": "satterthwaite",
      "Parker Pyne": "pyne",
      'Lady Eileen "Bundle" Brent': "eileenbrent",
      "Tommy Beresford": "beresford",
      "Tuppence Beresford": "beresford",
      "Harley Quin Wildcard": "wildcard",
    };

    // 1. validar que el set es del tipo del detective 
    const setType = detectSetType(set.cards)

    // 2. validar que el detective no es una wildcard
    const hasWildcard = checkForWildcard([detectiveToAdd]);

    if (hasWildcard) {
      setError(`No se puede agregar wildcard a otro set`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    // 3. Check if Pyne can be played (need revealed secrets from other players)
    if (setType === 'pyne') {
      const hasOtherPlayersWithRevealedSecrets = gameState.secretsFromAllPlayers?.some(
        secret => secret.player_id !== userState.id && !secret.hidden
      );
      
      if (!hasOtherPlayersWithRevealedSecrets) {
        setError("Parker Pyne requiere que otros jugadores tengan secretos revelados");
        setTimeout(() => setError(null), 3000);
        return;
      }
    } 

    const payload = {
      owner: userState.id,
      setType,
      card: detectiveToAdd.id,
      setPosition: set.position,
    };

    await startActionWithCounterCheck({
      roomId: gameState.roomId,
      userId: userState.id,
      cardsIds: [detectiveToAdd.id],
      actionType: 'ADD_TO_SET',
      setPosition: set.position,
      endpoint: "/add-to-set",
      payload,
      setError,
      setLoading,
      gameDispatch,
      requiresEndpoint: true, 
      actionIdentifier: "DETECTIVE_SET_SUBMITTED",
      actionPayload: { setType, detectiveToAdd, set },
    });
    setLoading(flase);
    setSelectedCards([]);
    setHasPLayedSet(true);
    return;
  };

  const handleSelectSet = async (selectedSet) => {
    if (!selectedSet) { console.warn("No set selected"); return; }
    // se selecciono un set para robar con another victim
    setLoading(true);
    setError(null);

    if (selectedSet.setType === 'pyne') {
      const hasRevealedSecret = gameState.secretsFromAllPlayers.some(s => !s.hidden);
      if (!hasRevealedSecret) {
        setError("Parker Pyne requiere que otros jugadores tengan secretos revelados");
        setTimeout(() => setError(null), 3000);
        return;
      }
    }
    
    try {
      // POST to the Another Victim event endpoint
      const response = await fetch(
        `http://localhost:8000/api/game/${gameState.roomId}/event/another-victim`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            HTTP_USER_ID: userState.id.toString(),
          },
          body: JSON.stringify({
            originalOwnerId: selectedSet.owner_id,
            setPosition: selectedSet.position,
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        throw new Error(getErrorMessage(response.status, errorData));
      }
      
      const data = await response.json();
      
      if (!data.success || !data.transferredSet || !data.nextAction) {
        throw new Error("Respuesta incompleta del servidor");
      }
      
      const cardsFromTransferredSet = data.transferredSet.cards.map(card => ({
        id: card.cardId,
        name: card.name || ''
      }));
      
      const setType = detectSetType(cardsFromTransferredSet);
      
      if (!setType) {
        console.error("Could not detect set type from transferred cards:", cardsFromTransferredSet);
        throw new Error("Error al detectar el tipo de set transferido");
      }
      
      gameDispatch({
        type: 'DETECTIVE_SET_SUBMITTED',
        payload: {
          actionId: data.actionId,  
          setType: setType,
          stage: 'awaiting_player_selection',
          cards: cardsFromTransferredSet,
          hasWildcard: data.nextAction.metadata?.hasWildcard || false,
          allowedPlayers: data.nextAction.allowedPlayers || [],
          secretsPool: data.nextAction.metadata?.secretsPool || [],
          fromAnotherVictim: true,
          transferredSetPosition: data.transferredSet.position,
        },
      });
      
      gameDispatch({
        type: 'UPDATE_DRAW_ACTION',
        payload: { skipDiscard: true },
      });
      
      // Complete the Another Victim event
      gameDispatch({ type: 'EVENT_ANOTHER_VICTIM_COMPLETE' });
      
      setSelectedCards([]);
      setHasPLayedEvent(true);
    } catch (err) {
      console.error("❌ Error playing Another Victim:", err);
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  //Handler de HideRevealStealSecrets
  const handleActionOnSecret = async (selectedSecret) => {
    try {
      const actionId = gameState.detectiveAction.current?.actionId || gameState.detectiveAction?.incomingRequest?.actionId;
      const executorId = userState.id; // jugador que ejecuta
      const secretId = selectedSecret.id; 
      const detectiveType = gameState.detectiveAction?.actionInProgress?.setType;
      const targetPlayerId = gameState.detectiveAction.actionInProgress?.targetPlayerId; 

      let body = {};
      
      if (["marple", "pyne", "poirot"].includes(detectiveType)) {
        body = {
          actionId,
          executorId,
          targetPlayerId,
          secretId,
        };
      }
      
      // Detectives de dos pasos (target entrega secreto)
      if (["beresford", "satterthwaite", "eileenbrent"].includes(detectiveType)) { 
        body = {
          actionId,
          executorId,
          secretId,
        };
      }
      
      const response = await fetch(
        `http://localhost:8000/api/game/${gameState.roomId}/detective-action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            HTTP_USER_ID: userState.id.toString(),
          },
          body: JSON.stringify(body),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || "Error al ejecutar acción");
      }

      const data = await response.json();

      console.log(`data: ${data}`)
      
    } catch (error) {
      console.error("Error al ejecutar acción de detective", error);
    }
  };

  const detectSetType = selectedCards => {
    if (selectedCards.length === 0) return null;

    const selectedCardData = gameState.mano.filter(card =>
      selectedCards.some(sel => sel.id === card.id)
    );

    const nonDetectiveCards = selectedCardData.filter(
      card => card.type !== "DETECTIVE"
    );
    if (nonDetectiveCards.length > 0) {
      console.log("⚠️ Hay cartas que no son de detective:", nonDetectiveCards);
      return null;
    }

    const nameToSetType = {
      "Hercule Poirot": "poirot",
      "Miss Marple": "marple",
      "Mr Satterthwaite": "satterthwaite",
      "Parker Pyne": "pyne",
      'Lady Eileen "Bundle" Brent': "eileenbrent",
      "Tommy Beresford": "beresford",
      "Tuppence Beresford": "beresford",
      "Harley Quin Wildcard": "wildcard",
    };

    const wildcards = selectedCards.filter(
      card => nameToSetType[card.name] === "wildcard"
    );
    const normalCards = selectedCards.filter(
      card => nameToSetType[card.name] !== "wildcard"
    );

    if (normalCards.length === 0) {
      console.log("⚠️ Solo hay comodines, no es válido");
      return null;
    }

    const uniqueTypes = [
      ...new Set(normalCards.map(card => nameToSetType[card.name])),
    ];

    if (uniqueTypes.includes("beresford")) {
      if (uniqueTypes.length === 1 && uniqueTypes[0] === "beresford") {
        return "beresford";
      } else if (uniqueTypes.length > 1) {
        console.log("⚠️ Mezclando Beresford con otros tipos");
        return null;
      }
    }

    if (uniqueTypes.length !== 1) {
      console.log("⚠️ Cartas de diferentes tipos:", uniqueTypes);
      return null;
    }

    return uniqueTypes[0];
  };

  const checkForWildcard = selectedCards => {
    return selectedCards.some(card => card.name === "Harley Quin Wildcard");
  };

  const handleSelectCardFromAshes = async (selectedCardId) => {
    const { lookAshes } = gameState.eventCards
    
    if (!lookAshes?.actionId) {
      setError('No action ID found')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `http://localhost:8000/api/game/${gameState.roomId}/look-into-ashes/select`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'http-user-id': userState.id.toString(),
          },
          body: JSON.stringify({
            action_id: lookAshes.actionId,
            selected_card_id: selectedCardId,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Backend error response:", errorData)
        throw new Error(getErrorMessage(response.status, errorData))
      }

      const data = await response.json()

      // Close the modal and reset the state
      gameDispatch({
        type: 'EVENT_LOOK_ASHES_COMPLETE',
      })

    } catch (err) {
      console.error("Error selecting card from ashes:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDelayEscape = async (quantity) => {
    try {
      const cardId = selectedCardIdRef.current 

      const response = await fetch(
        `http://localhost:8000/api/game/${gameState.roomId}/event/delay-murderer-escape`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'HTTP_USER_ID': userState.id.toString(),
          },
          body: JSON.stringify({
            card_id: cardId,
            quantity: quantity, 
          }),
        }
      )

      const data = await response.json()
      console.log(' Delay escape completado:', data)

      gameDispatch({
        type: 'EVENT_DELAY_ESCAPE_COMPLETE',
        payload: data,
      })

    } catch (err) {
      console.error('Error en delay escape:', err)
      setError(err.message)
    }
  }

  const handleOneMoreSecret = async (selectedSecret) => {
    try {
      setLoading(true)
      setError(null)

      const requestBody = {
        action_id : gameState.eventCards.oneMore.actionId,
        selected_secret_id: selectedSecret.id,  
      }

      const response = await fetch(
        `http://localhost:8000/api/game/${gameState.roomId}/event/one-more/select-secret`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "HTTP_USER_ID": userState.id.toString(),
          },
          body: JSON.stringify(requestBody),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(getErrorMessage(response.status, errorData))
      }

      const data = await response.json()

      gameDispatch({
        type: "EVENT_ONE_MORE_SECRET_SELECTED",
        payload: {
          secret_id: selectedSecret.id,
          allowed_players: data.allowed_players, 
          message: data.message || 'Secreto seleccionado para One More',
        },
      })


    } catch (err) {
      console.error("Error selecting secret:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOneMoreSelectPlayer = async (jugadorId) => {
    try {
      setLoading(true);
      setError(null);

      const actionId = gameState.eventCards?.oneMore?.actionId;
      const roomId = gameState.roomId;

      if (!actionId || !jugadorId) {
        throw new Error("Faltan datos: actionId o playerId no válidos");
      }

      const response = await fetch(
        `http://localhost:8000/api/game/${roomId}/event/one-more/select-player`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "HTTP_USER_ID": userState.id.toString(),
          },
          body: JSON.stringify({
            action_id: actionId,
            target_player_id: jugadorId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status}`);
      }

      const data = await response.json();
      console.log("One More select-player completado:", data);

      gameDispatch({
        type: "EVENT_ONE_MORE_COMPLETE",
        payload: {
          message: data.message || "One More completada",
        },
      });

            gameDispatch({
        type: 'UPDATE_DRAW_ACTION',
       payload: { skipDiscard: true },
      })


    } catch (err) {
      console.error("Error en One More select-player:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDirection = async (direction) => {
    try {
      setLoading(true);
      setError(null);

      const cardId = selectedCardIdForEvent;

      if (!cardId || isNaN(cardId)) {
        throw new Error("No se encontró un card_id válido para Dead Card Folly");
      }
      
      const playerId = userState.id;
      const roomId = gameState.roomId;

      const response = await fetch(
        `http://localhost:8000/api/game/${roomId}/event/dead-card-folly/play`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "http-user-id": playerId.toString(),
          },
          body: JSON.stringify({
            player_id: playerId,
            card_id: cardId,
            direction: direction.toUpperCase(), // "LEFT" o "RIGHT"
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error en backend:", errorData);
        throw new Error(errorData.detail || `Error jugando Dead Card Folly: ${response.status}`);
      }
      
      const data = await response.json();
      
      gameDispatch({
        type: "EVENT_DEAD_CARD_FOLLY_SELECT",
        payload: {
          action_id: data.action_id,
          direction,
          player_id: playerId,
          message: `You chose ${direction}`,
        },
      });

      setSelectedCardIdForEvent(null);

    } catch (err) {
      console.error("Error jugando Dead Card Folly:", err);
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleExchange = async (selectedCardId) => {
    try {
      setLoading(true);
      setError(null);

      const playerId = userState.id;
      const roomId = gameState.roomId;
      const actionId = gameState.eventCards?.deadCardFolly?.actionId;

      if (!actionId || !selectedCardId || !playerId) {
        throw new Error("Faltan datos para enviar la carta seleccionada");
      }

      console.log("Enviando carta seleccionada para Dead Card Folly:", {
        action_id: actionId,
        player_id: playerId,
        card_id: selectedCardId,
      });

      const response = await fetch(
        `http://localhost:8000/api/game/${roomId}/event/dead-card-folly/select-card`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "http-user-id": playerId.toString(),
          },
          body: JSON.stringify({
            action_id: actionId,
            card_id: selectedCardId,
            player_id: playerId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error enviando carta: ${response.status}`);
      }

      const data = await response.json();
      console.log("Dead Card Folly - respuesta:", data);

      // Si el backend devuelve waiting=true, todavía faltan jugadores
      if (data.waiting) {
        console.log(`Waiting for ${data.pending_count} more players...`);
        // Simplemente mostramos un mensaje temporal
        setError(`Waiting for ${data.pending_count} more players...`);
        setTimeout(() => setError(null), 4000);
      } else {
        // Si el intercambio se completó, despachamos el evento final
        gameDispatch({
          type: "EVENT_DEAD_CARD_FOLLY_COMPLETE",
          payload: {
            message: data.message || "Exchange completed successfully",
          },
        });
      }

    } catch (err) {
      console.error(" Error enviando carta en Dead Card Folly:", err);
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (status, errorData) => {
    switch (status) {
      case 400:
        return 'Error de validación: cartas inválidas o lista vacía'
      case 403:
        return 'No es tu turno'
      case 404:
        return 'Sala no encontrada'
      case 409:
        return 'Reglas de descarte no cumplidas'
      default:
        return errorData?.message || 'Error desconocido'
    }
  }

  const printCardBacks = (n, type) => {
    const arrayForMap = []
    for (let i = 0; i < n; i++) {
      arrayForMap.push(i)
    }
    return (
      <div className='flex gap-5'>
        {arrayForMap.map(img => (
          <img
            key={img + "_card"} 
            src={ type == "secrets" ? "/cards/secret_front.png" : "/cards/01-card_back.png"} 
            alt="Top Discarded Card" 
            className="w-16 h-24 rounded-lg border-2 border-gray-400" 
          />
        ))}
      </div>
    )
  }

  const getNombreTurnoActual = (id) => {
    const jugador = gameState.jugadores.find(player => player.player_id == id);
    if (jugador) {
      if (jugador.name == userState.name) return "Yo";

      return (jugador.name ? jugador.name : "no name " + id)
    }
  }

  const currentPlayerIndex = gameState.jugadores.findIndex(
    player => player.player_id === userState.id
  );

  const shouldShowSelectOwnCard = 
    gameState.eventCards?.actionInProgress?.eventType === 'card_trade' &&
    gameState.eventCards?.actionInProgress?.step === 'select_own_card' &&
    gameState.eventCards?.actionInProgress?.playerId === userState.id

  const shouldShowSelectTargetCard = 
    gameState.eventCards?.actionInProgress?.eventType === 'card_trade' &&
    gameState.eventCards?.actionInProgress?.step === 'target_select_card' &&
    gameState.eventCards?.actionInProgress?.targetPlayerId === userState.id

  return (
    <main
      className="relative min-h-screen overflow-x-hidden flex"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      
    {/* Error display */}
    {error && (
      <div
        className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl"
        style={{ zIndex: 9999, minWidth: '300px' }}
      >
        {error}
      </div>
    )}

    {/* Nsf Banner */}
    { gameState.nsfCounter.active && <NsfBanner handler={handlePlayNotSoFast} />}

    {/* MAIN CONTENT AREA (Tabs) */}
    <div className="relative flex-1 min-h-screen px-4 py-3">
      {/** TAB NAVIGATE */}
      <Tabs className="w-full h-full" defaultTab={currentPlayerIndex >= 0 ? currentPlayerIndex : 0}>

        {gameState.jugadores.map((player) => (
          
          <TabPanel
            key={player.id}
            label={
              (player.name == userState.name ? "Yo" : player.name ) +
              " "
              + (player.is_host ? "👑" : "") +
              (isPlayerInDisgrace(player.player_id) ? "🚫" : "")}>
            {userState.id === player.player_id ? (
              <>
                {/* Secretos */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
                  <h2 className="text-white text-xl font-bold mb-2 text-center">
                    Secretos
                  </h2>
                  <Secrets />
                </div>

                {/* Mazos / Draft / Descartar */}
                <div
                  className="absolute top-1/2 left-0 w-full flex items-center justify-center gap-12 px-4"
                  style={{ transform: 'translateY(-50%)' }}
                >
                  {/* Mazos */}
                  <div className="flex flex-col items-center">
                    <h2 className="text-white text-xl font-bold mb-4 text-center">
                      Deck
                    </h2>
                    <Deck
                      cardsLeft={gameState.mazos?.deck?.count ?? 0}
                      onClick={handlePickFromDeck}
                      disabled={
                        gameState.turnoActual !== userState.id ||
                        gameState.mano.length === 6 ||
                        !(gameState.drawAction.hasDiscarded || gameState.drawAction.skipDiscard) ||
                        isWaitingForOtherPlayer
                      }
                    />
                  </div>

                  {/* Draft */}
                  <div className="flex flex-col items-center justify-center">
                    <h2 className="text-white text-xl font-bold mb-4 text-center">
                      Draft
                    </h2>
                    <Draft
                      handleDraft={handleDraft}
                      disabled={
                        gameState.turnoActual !== userState.id ||
                        gameState.mano.length === 6 ||
                        !(gameState.drawAction.hasDiscarded || gameState.drawAction.skipDiscard) ||
                        isWaitingForOtherPlayer
                      }
                    />
                  </div>

                  {/* Descartar */}
                  <div className="flex flex-col items-center">
                    <h2 className="text-white text-xl font-bold mb-4 text-center">
                      Discard
                    </h2>
                    <Discard
                      topDiscardedCard={gameState.mazos?.discard?.top ?? ''}
                      counterDiscarded={gameState.mazos?.discard?.count ?? 0}
                    />
                  </div>
                </div>

                {/* Cartas en mano */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-4">
                  <h2 className="text-white text-xl font-bold mb-2 text-center">
                    Cartas en mano
                  </h2>
                  <HandCards
                    selectedCards={selectedCards}
                    onSelect={handleCardSelect}
                  />
                </div>
              </>
            ) : (         /*  Tab de otro jugador  */

              <div className='flex flex-col items-center gap-5 overflow-y-auto px-4' style={{ height: 'calc(100vh - 120px)' }}>                
                {/* Secretos de otro jugador */}
                <div className="">
                  <h2 className="text-white text-xl font-bold mb-2 text-center">
                    Secretos
                  </h2>

                  <OtherPlayerSecrets player={player} />

                </div>

                {/* Cartas en mano */}
                <div className="">
                  <h2 className="text-white text-xl font-bold mb-2 text-center">
                    Cartas en mano
                  </h2>
                  
                  {printCardBacks(player.hand_size, "cards")}        
                  
                </div>

                {/* Sets */}
                <div className="">
                  <OtherPlayerSets player={player} />
                </div>

              </div>
            
            )}
          </TabPanel>

        ))}

      </Tabs>
    </div>

    {/* SIDE PANEL */}
    <aside className="w-[22%] min-w-[280px] max-w-sm bg-black/60 text-white p-4 flex flex-col justify-between border-l border-white/20">
      
      {/* Upper info */}
      <div>
        <h2 className="text-lg font-bold mb-2">Turno Actual</h2>
        <p className="mb-4">{getNombreTurnoActual(gameState.turnoActual)}</p>
        <Log />
      </div>

      <ButtonGame
        onClick={() => setShowPlayerSets(true)}
        disabled={loading || gameState.drawAction.hasDiscarded}
      >
        Ver Sets
      </ButtonGame>

      {/* Action buttons */}
      {gameState.turnoActual == userState.id && (
        <div>
          <h2 className="text-lg font-bold mb-4">Acciones de Turno</h2>

          {/* Estado */}
          <div className="text-white text-sm mb-3 bg-black/50 px-3 py-2 rounded">
            {/* CASO 1: Esperando accion de otro jugador */}
            {isWaitingForOtherPlayer && 
              'Esperando que un jugador complete su accion...'}
            
            {/* CASO 2: Jugo accion principal, no repuso cartas y no descarto */}
            {!isWaitingForOtherPlayer && 
            gameState.drawAction.skipDiscard && 
            !gameState.drawAction.hasDiscarded &&
            gameState.mano.length < 6 &&
            !isCurrentPlayerInDisgrace &&
              `Podes descartar (opcional) o robar ${6 - gameState.mano.length} carta(s)`}
            
            {/* CASO 3: Jugo accion principal, repuso cartas sin descartar */}
            {!isWaitingForOtherPlayer && 
            gameState.drawAction.skipDiscard && 
            !gameState.drawAction.hasDiscarded &&
            gameState.mano.length === 6 &&
            !isCurrentPlayerInDisgrace &&
              'Podes descartar (opcional) o finalizar turno'}

            {/* CASO 4: Turno normal (no jugo accion principal, no descarto) */}
            {!isWaitingForOtherPlayer && 
            !gameState.drawAction.skipDiscard && 
            !gameState.drawAction.hasDiscarded &&
            !isCurrentPlayerInDisgrace && 
              'Podes bajar un set, jugar una carta o descartar'}
            
            {/* CASO 5: Ya descarto, debe robar */}
            {!isWaitingForOtherPlayer && 
            gameState.drawAction.hasDiscarded &&
            !gameState.drawAction.hasDrawn &&
            !isCurrentPlayerInDisgrace &&
              `Roba ${gameState.drawAction.cardsToDrawRemaining} carta(s)`}
            
            {/* CASO 6: Ya descarto y robo, puede finalizar */}
            {!isWaitingForOtherPlayer &&
            gameState.drawAction.hasDiscarded &&
            gameState.drawAction.hasDrawn &&
              'Podes finalizar turno'}

            {/* CASO 7: Desgracia social, debe descartar */}
            {!isWaitingForOtherPlayer &&
            !gameState.drawAction.hasDiscarded &&
            !gameState.drawAction.hasDrawn &&
            isCurrentPlayerInDisgrace &&
              'Debes descartar una carta'}

            {/* CASO 8: Desgracia social, debe reponer */}
            {!isWaitingForOtherPlayer &&
            gameState.drawAction.hasDiscarded &&
            !gameState.drawAction.hasDrawn &&
            isCurrentPlayerInDisgrace &&
              'Roba 1 carta'}
          </div>

          {/* Botones */}
          <div className="flex flex-col space-y-3">
            
            {((selectedCards.length === 1 && !isCurrentPlayerInDisgrace)|| !hasPlayedEvent ) && (
                <ButtonGame
                  onClick={handlePLayEventCard}
                  disabled={
                    loading || selectedCards.length !== 1 || hasPlayedEvent || hasPlayedSet || gameState.drawAction.hasDiscarded || isWaitingForOtherPlayer || isCurrentPlayerInDisgrace
                  }
                >
                  Jugar Carta
                </ButtonGame>
            )}

            {(selectedCards.length > 0 || !gameState.drawAction.hasDiscarded ) && (
                <ButtonGame
                  onClick={handleDiscard}
                  disabled={
                    selectedCards.length === 0 ||
                    loading || 
                    isWaitingForOtherPlayer ||
                    gameState.drawAction.hasDiscarded ||
                    (isCurrentPlayerInDisgrace && selectedCards.length !== 1)
                  }
                > 
                  Descartar
                </ButtonGame>
            )}
         
            {(gameState.drawAction.hasDiscarded || gameState.drawAction.skipDiscard) &&
              gameState.mano.length === 6 &&
              selectedCards.length === 0 &&
              !isWaitingForOtherPlayer && (
                <ButtonGame onClick={handleFinishTurn} disabled={loading}>
                  Finalizar Turno
                </ButtonGame>
            )}
          
          </div>
        </div>
      )}
    </aside>

      {/* GAME END MODAL */}
      {gameState?.gameEnded && (
        <GameEndModal
          ganaste={gameState.ganaste}
          winners={gameState.winners}
          finish_reason={gameState.finish_reason || 'La partida ha terminado'}
        />
      )}

      {/* Modal de sets */}
      <PlayerSetsModal
        isOpen={showPlayerSets}
        onClose={() => setShowPlayerSets(false)}
        sets={playerSetsForModal} 
        selectedCards={selectedCards}
        onCardSelect={handleCardSelect}
        onCreateSet={() => handlePlayDetective()}
        onAddToset={handleAddToSet}
        hasPlayedSet={hasPlayedSet}
        hasPlayedEvent={hasPlayedEvent}
        isCurrentPlayerInDisgrace={isCurrentPlayerInDisgrace}
      />

      {gameState.eventCards?.anotherVictim?.showSelectSets && (
          <SelectOtherPLayerSet
            player={gameState.eventCards.anotherVictim.selectedPlayer}
            sets ={gameState.sets}
            onSelectSet={handleSelectSet}
          />
        )}

      {/* Modal de seleccionar jugador */}
      { ( gameState.eventCards?.anotherVictim?.showSelectPlayer || 
          gameState.detectiveAction?.showSelectPlayer ||
          gameState.eventCards?.cardsOffTable?.showSelectPlayer ||
          (gameState.eventCards?.actionInProgress?.eventType === 'card_trade' && 
           gameState.eventCards?.actionInProgress?.step === 'select_player')) && 
        (<SelectPlayerModal
          onPlayerSelect={handlePlayerSelect}
        />)
      }

      {/*Modal acción sobre secretos*/ }
      {(gameState.detectiveAction.showChooseOwnSecret || gameState.detectiveAction.showSelectSecret) && (
          <HideRevealStealSecretsModal
          isOpen={gameState.detectiveAction.showSelectSecret || gameState.detectiveAction.showChooseOwnSecret}
          detective={gameState.detectiveAction}
          onConfirm = {handleActionOnSecret}
        />
      )}

      {/* Modal de Look Into The Ashes */}
      <div>
        <LookIntoTheAshes 
          isOpen={gameState.eventCards?.lookAshes?.showSelectCard}
          availableCards={gameState.eventCards.lookAshes.availableCards}
          onSelectCard={handleSelectCardFromAshes}
        />
      </div>

      {/* Modal qty Delay the murderer's scape */}
      <div>
        <SelectQtyModal 
          isOpen={gameState.eventCards?.delayEscape?.showQty}
          onConfirm={handleConfirmDelayEscape}
        />
      </div>

      {/* Modal secretos One more*/}
      <div>
        <OneMoreSecretsModal 
          isOpen={gameState.eventCards?.oneMore?.showSecrets}
          onConfirm={handleOneMoreSecret}
        />

        <SelectPlayerOneMoreModal 
          isOpen={gameState.eventCards?.oneMore?.showPlayers}
          onConfirm={handleOneMoreSelectPlayer}
        />
      </div>

      {/* Modales dead card folly*/}
      <div>
        <SelectDirectionModal 
          isOpen={gameState.eventCards?.deadCardFolly?.showDirection}
          onConfirm={handleDirection}
        />
      </div>

      <div>
        <SelectCardForExchange 
        isOpen={gameState.eventCards?.deadCardFolly?.isSelecting}
        hand={gameState.mano}
        onConfirm={handleExchange}
      />

      </div>

      {/* Modales dead card folly*/}
      <div>
        <SelectDirectionModal 
          isOpen={gameState.eventCards?.deadCardFolly?.showDirection}
          onConfirm={handleDirection}
        />
      </div>

      <div>
        <SelectCardForExchange 
        isOpen={gameState.eventCards?.deadCardFolly?.isSelecting}
        hand={gameState.mano}
        onConfirm={handleExchange}
        />
      </div>

      {/* Modals de card trade */}
  
      {/* Modal Card Trade - P1 selecciona carta propia */}
      {shouldShowSelectOwnCard && (
        <SelectCard
          isOpen={true}
          availableCards={gameState.mano}
          onSelectCard={handleSelectOwnCardForTrade}
        />
      )}

      {/* Modal Card Trade - P2 selecciona carta propia */}
      {shouldShowSelectTargetCard && (
        <SelectCard
          isOpen={true}
          availableCards={gameState.mano}
          onSelectCard={handleSelectTargetCardForTrade}
        />
      )}

    </main>
  )
}