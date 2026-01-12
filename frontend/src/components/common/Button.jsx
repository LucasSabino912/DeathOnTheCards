export default function Button({ onClick, children, className = "", title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={[
        "px-20 py-5 font-semibold transition border-4",
        "bg-[#3D0800] text-[#B49150] border-[#825012]",
        "hover:bg-[#4a0a00] focus:outline-none focus:ring-2 focus:ring-[#825012]/60",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#3D0800]",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
