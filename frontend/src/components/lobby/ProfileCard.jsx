//Generic ProfileCard that shows player data
//Takes:
// - name: string with player name
// - avatar: string with image URL
// - birthdate: string with player birthdate
export default function ProfileCard({ name, avatar, birthdate }) {
  //Container colors, size, position and style (card)
  const cardColors = 'border-[#825012]'
  const cardSize = 'w-64 h-64'
  const cardPosition = 'flex flex-col items-center justify-center p-6 gap-2'
  const cardStyle = 'bg-black/40 rounded-xl border'

  //Avatar size, style and border color
  const avatarSize = 'w-40 h-40'
  const avatarStyle = 'rounded-full border-4'
  const avatarColor = 'border-[#825012]'

  //Name style
  const nameStyle = 'text-lg font-bold text-[#B49150]'

  //Date style
  const dateStyle = 'text-center text-sm text-gray-300'
  return (
    <div className={`${cardSize} ${cardPosition} ${cardStyle} ${cardColors}`}>
      <img
        src={avatar}
        alt={name}
        className={`${avatarSize} ${avatarStyle} ${avatarColor}`}
      />
      <h2 className={`${nameStyle}`}>{name}</h2>
      <p className={`${dateStyle}`}>Fecha de nacimiento: {birthdate}</p>
    </div>
  )
}