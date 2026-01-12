//Generic background image
//Takes:
// - children: represent internal elements => allows render childs inside
export default function Background({ children }) {
  //Background image style
  const bgImageStyle = 'bg-no-repeat bg-center bg-cover'
  //Background image size
  const bgImageSize = 'w-screen h-screen'

  return (
    <div
      className={`${bgImageSize} ${bgImageStyle}`}
      style={{ backgroundImage: "url('images/bg_characters.jpeg')" }}
    >
      {children}
    </div>
  )
}
