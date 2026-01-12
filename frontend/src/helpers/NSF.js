export const startActionWithCounterCheck = async ({
  roomId,
  userId,
  cardsIds,
  actionType,         // "EVENT", "CREATE_SET", "ADD_TO_SET"
  setPosition,
  endpoint,           // "/play-detective-set" o otro
  payload,            // body del endpoint real: objeto
  requiresEndpoint = true, 
  actionIdentifier,
  actionPayload,    // null if requires endpoint = true
  setLoading,
  setError,
  gameDispatch,
}) => {
  if (!setLoading || !setError) {
    throw new Error("setLoading and setError are required");
  }
  setLoading(true);
  setError(null);
  try {
    const request = {
        playerId: userId, // ID del jugador que inicia la acción
        cardIds: cardsIds, // Lista de IDs de cartas (cardsXgame.id) jugadas en la acción
        additionalData: { // Datos adicionales de la acción
            actionType: actionType, 
            setPosition: setPosition ? setPosition : null, // Posición del set al que se agrega la carta (obligatorio si actionType=ADD_TO_SET)")
        }
    }
    const response = await fetch(
      `http://localhost:8000/api/game/${roomId}/start-action`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "http-user-id": userId.toString(),
        },
        body: JSON.stringify(request),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Start Action Failed");
    }
    // 2. No es cancelable entonces continuar con el efecto de la accion
    if (!data.cancellable) {
      return await resumeAction({
          roomId: roomId,
          userId: userId,
          endpoint,
          payload,
          requiresEndpoint,
          actionIdentifier,
          actionPayload,
          gameDispatch,
        });
    }
    // 3. Si es cancelable entonces guardar datos de la accion, y esperar la validacion e inicio de cadena de NSF para todos por wsocket
    gameDispatch({
        type: 'SAVE_ACTION_DATA', 
        payload: { 
            cards: cardsIds,  //  [ ...{cardsxgame.id} ]
            endpoint: endpoint, 
            body: payload,   
            requiresEndpoint: requiresEndpoint,  
            actionIdentifier: actionIdentifier,
            actionPayload: actionPayload,
        }
    });
  } catch (err) {
    console.error("Counter check error:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


export const callOriginalEndpoint = async ({
  roomId,
  userId,
  endpoint, // Endpoint que continua despues de la cadena de NFS
  payload,
  actionIdentifier,
  actionPayload,
  gameDispatch,
}) => {
  const resp = await fetch(
    `http://localhost:8000/api/game/${roomId}${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "http-user-id": userId.toString(),
      },
      body: JSON.stringify(payload),
    }
  );
  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data.detail || "Action failed");
  }
  // Continua con el efecto de la carta/set
  if (endpoint = "/look-into-ashes/play") {
    gameDispatch({
      type: actionIdentifier,
      payload: { action_id: data.action_id, available_cards: data.available_cards } 
    })
  }
  if (endpoint = "/play-detective-set") {
    gameDispatch({
          type: actionIdentifier,
          payload: { 
              actionId: data.actionId,
              setType: actionPayload.setType, 
              stage: 'awaiting_player_selection',
              cards: actionPayload.cardsToUse,
              hasWildcard: actionPayload.hasWildcard,
              allowedPlayers: data.nextAction.allowedPlayers || [],
              secretsPool: data.nextAction.metadata?.secretsPool || [],
      }
    });
  }
  if (endpoint = "/add-to-set") {
    gameDispatch({ 
          type: actionIdentifier, 
          payload: {
            actionId: data.actionId,
            setType: actionPayload.setType, 
            stage: 'awaiting_player_selection',
            cards: [actionPayload.detectiveToAdd, ...actionPayload.set.cards],
            hasWildcard: checkForWildcard(set.cards),
            allowedPlayers: data.nextAction.allowedPlayers || [],
            secretsPool: data.nextAction.metadata?.secretsPool || [],
        } 
    });
  }
  if (endpoint = "/event/one-more") {
    gameDispatch({
      type: actionIdentifier,
      payload: {
        action_id: data.action_id,
        available_secrets: data.available_secrets,
      },
    })
  }
  gameDispatch({ type: "UPDATE_DRAW_ACTION", payload: { skipDiscard: true } });
  return data;
};

export const playNotSoFast = async (card, userId, roomId, actionId, setError) => {
    try {
      const request = {
        actionId: actionId,
        playerId: userId,
        cardId: card.id,
      }
      const response = await fetch(
        `http://localhost:8000/api/game/${roomId}/instant/not-so-fast`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "http-user-id": userId.toString(),
          },
          body: JSON.stringify(request),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Action failed");
      }
      return response.ok;
    } catch (err) {
      setError(err.message);
    }
}

export const resumeAction = async ({
  roomId,
  userId,
  endpoint,
  payload,
  requiresEndpoint,
  actionIdentifier,
  actionPayload,
  gameDispatch,
}) => {
  try {
    if (requiresEndpoint) {
      // llmar al endpoint
      const actionData = await callOriginalEndpoint({
        roomId,
        userId,
        endpoint,
        payload,
        actionIdentifier,
        actionPayload,
        gameDispatch
      });
      return actionData;
    } else {
      // Continuar con la accion sin endpoint
      gameDispatch({ 
        type: actionIdentifier, 
        payload: actionPayload 
      });
      gameDispatch({ type: "UPDATE_DRAW_ACTION", payload: { skipDiscard: true } });
      return true;
    }
  } catch (error) {
    console.error("Resume action error:", error);
    throw error;
  }
};

export const cancelEffect = async ({
  roomId,
  userId,
  actionId,
  cardsIds,
  additionalData
}) => {
  try {
    const request = {
      actionId: actionId,
      playerId: userId, 
      cardIds: cardsIds,
      additionalData: additionalData,
    }    
    const response = await fetch(
      `http://localhost:8000/api/game/${roomId}/instant/not-so-fast/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "http-user-id": userId.toString(),
        },
        body: JSON.stringify(request),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Cancel action failed");
    }
    return data;
  } catch (error) {
    console.error("Cancel effect error:", error);
    throw error;
  }
};