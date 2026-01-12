//import { useAppContext, useAppDispatch } from '../../context/AppContext'
import { use, useEffect, useState } from 'react'
import { useUser } from '../../context/UserContext.jsx'
import { useNavigate } from 'react-router-dom'
import './JoinScreen.css'
import BackgroundList from '../../components/common/BackgroundList.jsx'
import Button from '../../components/common/Button.jsx'
import ItemList from '../../components/join/ItemList.jsx'
import ProfileCard from '../../components/lobby/ProfileCard.jsx'
import LobbyError from '../../components/lobby/LobbyError.jsx'
import { useGame } from '../../context/GameContext.jsx'

function JoinScreen() {
  const navigate = useNavigate()
  const { userState } = useUser()

  const [partidas, setPartidas] = useState([])
  //Position of Buttons and ProfileCard
  const elementsPosition = 'flex flex-col justify-center items-end h-screen'

  //Spacing between buttons
  const buttonSeparation = 'flex flex-col pt-12 gap-5 pe-8'

  //Separation itemList
  const itemListSeparation = 'pt-4 ps-4'

  //ProfileCard separation
  const profileCardSeparation = 'pe-8'

  //Fetch games from backend
  const fetchPartidas = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/game_list')
      if (!res.ok) throw new Error('Error al cargar partidas')
      const data = await res.json()
      
      const partidasNormalizadas = data.items.map(item => ({
        id: item.id,
        name: item.name,
        playersJoined: item.players_joined,
        playersMin: item.players_min,
        playersMax: item.players_max,
      }))
      setPartidas(partidasNormalizadas)

    } catch (err) {
      console.error('Error obteniendo partidas', err)
    }
  }

  useEffect(() => {
    fetchPartidas()
  }, [])

  //Condition to be logged - check if user has required data
  const isLoggedIn =
    userState.name !== '' &&
    userState.avatarPath !== '' &&
    userState.birthdate !== ''

  const player = {
    name: userState.name,
    avatar: userState.avatarPath,
    birthdate: userState.birthdate,
    isHost: userState.isHost,
  }

  console.log(partidas)

  return (
    <div>
      <BackgroundList>
        {isLoggedIn ? (
          <>
            {/* ItemList */}
            <div className={`${itemListSeparation}`}>
              <ItemList partidas={partidas} />
            </div>

            {/* Buttons and ProfileCard */}
            <div className={`${elementsPosition}`}>
              <div className={`${profileCardSeparation}`}>
                {/* Card with player data */}
                <ProfileCard
                  name={player.name}
                  host={player.host}
                  avatar={player.avatar}
                  birthdate={player.birthdate}
                />
              </div>
              {/* Buttons section */}
              <div className={`${buttonSeparation}`}>
                <Button onClick={fetchPartidas}>Actualizar</Button>
                <Button onClick={() => navigate('/lobby')}>Volver</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="justify-center">
            <LobbyError navigate={navigate} />
          </div>
        )}
      </BackgroundList>
    </div>
  )
}

export default JoinScreen
