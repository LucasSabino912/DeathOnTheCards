import "../../styles.css"
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../../context/UserContext.jsx";
import { useGame } from "../../context/GameContext.jsx";
import NombreDePartida from "../../components/create/NombreDePartida.jsx";
import CantidadDeJugadores from "../../components/create/CantidadDeJugadores.jsx";
import Continuar from "../../components/create/Continuar.jsx";
import ProfileCard from "../../components/lobby/ProfileCard.jsx";

export default function CreateScreen() {
  const navigate = useNavigate();
  const { userState, userDispatch } = useUser();
  const { gameDispatch, connectToGame  } = useGame();
  
  const [gameForm, setGameForm] = useState({
    nombre_partida: "",
    jugadoresMin: 2,
    jugadoresMax: 6
  });

  const [error, setError] = useState("");

  const handleContinue = async () => {
    try {
      const requestData = {
          room: {
              nombre_partida: gameForm.nombre_partida,
              jugadoresMin: gameForm.jugadoresMin,
              jugadoresMax: gameForm.jugadoresMax
          },
          player: {
              nombre: userState.name,
              avatar: userState.avatarPath,
              fechaNacimiento: userState.birthdate
          }
      };

      console.log(requestData);

      const response = await fetch("http://localhost:8000/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (response.status === 409) {
        setError("Ya existe una partida con ese nombre");
        return;
      }

      if (!response.ok) throw new Error();

      const data = await response.json();
      console.log("Response data:", data);
    
      const hostPlayer = data.players.find(player => player.is_host) || data.players[0];
      userDispatch({ 
        type: 'SET_USER', 
        payload: {
          id: hostPlayer.id,
          name: hostPlayer.name,
          avatarPath: hostPlayer.avatar,
          birthdate: hostPlayer.birthdate,
          isHost: hostPlayer.is_host
        }
      });
      
      gameDispatch({ 
        type: 'INITIALIZE_GAME', 
        payload: {
          room: data.room,
          players: data.players
        }
      });
      
      console.log('Connecting with gameId:', data.room.id, 'userId:', hostPlayer.id);
      connectToGame(data.room.id, hostPlayer.id);

      navigate(`/game_join/${data.room.id}`);
    } catch (error) {
      setError("Error al crear la partida: ", error);
    }
  };

  const setNombrePartida = (value) => {
    setGameForm(prev => ({
      ...prev,
      nombre_partida: value
    }));
    setError("");
  };

  const setJugadoresMin = (value) => {
    setGameForm(prev => ({
      ...prev,
      jugadoresMin: value
    }));
  };

  const setJugadoresMax = (value) => {
    setGameForm(prev => ({
      ...prev,
      jugadoresMax: value
    }));
  };

  return (
    <div className="pantalla-creacion">
      <div className="form-container">
        <ProfileCard
                name={userState.name}
                avatar={userState.avatarPath}
                birthdate={userState.birthdate}
              />

        <NombreDePartida 
          nombre_partida={gameForm.nombre_partida} 
          setNombrePartida={setNombrePartida}
          setError={setError}
        />
        
        <CantidadDeJugadores 
          jugadoresMin={gameForm.jugadoresMin}
          setJugadoresMin={setJugadoresMin}
          jugadoresMax={gameForm.jugadoresMax}
          setJugadoresMax={setJugadoresMax}
        />
        
        <Continuar
          nombre={gameForm.nombre_partida}
          onContinue={handleContinue}
          setError={setError}
        />
        
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}