export function CardPadrao({ children, className='' }) {
  return <div className={`bg-white rounded-2xl shadow border border-slate-100 p-5 w-full overflow-hidden ${className}`}>{children}</div>
}
export function TituloCard({ children }) {
  return <h2 className="text-lg font-extrabold text-slate-800 mb-3 tracking-tight">{children}</h2>
}
export function TituloPagina({ children, subtitulo }) {
  return (
    <div className="mb-2">
      <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{children}</h1>
      {subtitulo && <p className="text-sm text-slate-500">{subtitulo}</p>}
    </div>
  )
}
export function Grid({ cols=3, children }) {
  const map = { 1: 'grid-cols-1', 2: 'grid-cols-1 md:grid-cols-2', 3: 'grid-cols-1 md:grid-cols-3', 4: 'grid-cols-1 md:grid-cols-4' };
  return <div className={`grid ${map[cols]||map[3]} gap-2 w-full`}>{children}</div>
}
