export default function ButtonJoin({
  onClick,
  children,
  disabled = false,
  className = '',
  title,
}) {
  const buttonColors =
    'bg-[#3D0800] text-[#B49150] border-[#825012] hover:bg-[#4a0a00] hover:text-yellow-400'
  const buttonSize = 'px-2 py-2'
  const buttonStyle = 'font-semibold transition border-4 rounded-full'
  const buttonFocus = 'focus:outline-none focus:ring-2 focus:ring-[#825012]/60'
  const buttonOthers =
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#3D0800]'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        buttonColors,
        buttonSize,
        buttonStyle,
        buttonFocus,
        buttonOthers,
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}
