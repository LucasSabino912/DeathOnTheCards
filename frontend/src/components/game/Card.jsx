export default function Card({ title, children, className = "" }) {
  return (
    <section
      className={`border-2 border-[#825012] bg-[#3C0800]/90 text-[#B49150]
                  shadow-xl backdrop-blur-sm ${className} rounded-none`}
    >
      {title && (
        <header className="px-6 py-4 border-b border-[#825012]/60">
          <h2 className="text-lg font-semibold tracking-wide">{title}</h2>
        </header>
      )}
      <div className="px-6 pb-6">{children}</div>
    </section>
  );
}

