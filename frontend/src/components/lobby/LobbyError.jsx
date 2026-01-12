import Button from '../common/Button'

//Shows error message and a button to login
//only if player is not logged
//Takes:
// - navigate: function of react that allows redirections like links
export default function LobbyError({ navigate }) {
  //Position of all elements -> adjusted to right, next to background in column
  const elementsPosition =
    'flex flex-col justify-center items-end h-screen pe-48 relative z-100'

  //Style of error text
  const errorStyle =
    'font-[Limelight] text-4xl w-64 text-center text-red-600 pb-4'
  //Style of message after error
  const errorMsgStyle =
    'font-[Limelight] text-4xl w-64 text-center text-white pb-8'

  return (
    <div className={`${elementsPosition}`}>
      <p className={`${errorStyle}`}>¡ERROR!</p>
      <p className={`${errorMsgStyle}`}>
        Debes iniciar sesion para acceder al lobby
      </p>
      <Button onClick={() => navigate('/')}>Ingreso</Button>
    </div>
  )
}
