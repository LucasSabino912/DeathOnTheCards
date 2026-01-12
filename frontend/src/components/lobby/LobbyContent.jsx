import ProfileCard from './ProfileCard'
import Button from '../common/Button'

//Shows buttons and player profile card in lobby
//only if player is logged
//Takes:
// - player: data of player
// - navigate: function of react that allows redirections like links
// - handleLogout: function to logout
export default function LobbyContent({ player, navigate, handleLogout }) {
  //Position of all elements -> adjusted to right, next to background in column
  const elementsPosition =
    'flex flex-col justify-center items-end h-screen pe-48'

  //Spacing between buttons
  const buttonSeparation = 'flex flex-col pt-12 gap-5'

  return (
    <div className={`${elementsPosition}`}>
      {/* Card with player data */}
      <ProfileCard
        name={player.name}
        host={player.host}
        avatar={player.avatar}
        birthdate={player.birthdate}
      />
      {/* Buttons section */}
      <div className={`${buttonSeparation}`}>
        <Button onClick={() => navigate('/newgame')}>Crear partida</Button>
        <Button onClick={() => navigate('/games')}>Unirse a partida</Button>
        <Button onClick={handleLogout}>Salir</Button>
      </div>
    </div>
  )
}
