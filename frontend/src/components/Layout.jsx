import { Link, useNavigate } from 'react-router-dom';
import OfflineIndicator from './OfflineIndicator';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const logout = () => { localStorage.removeItem('token'); navigate('/login'); };
  const logado = !!localStorage.getItem('token');
  return (
    <div className="min-h-screen">
      <nav className="bg-slate-900 text-white p-4 flex justify-between items-center">
        <Link to="/" className="font-bold text-xl">💰 Gastos</Link>
        <div className="flex gap-4 text-sm items-center">
          {logado ? <>
            <Link to="/" className="hover:underline">Dashboard</Link>
            <Link to="/lancamentos" className="hover:underline">Lançamentos</Link>
            <Link to="/investimentos" className="hover:underline">Investimentos</Link>
            <Link to="/relatorios" className="hover:underline">Relatórios</Link>
            <button onClick={logout} className="bg-red-600 px-3 py-1 rounded">Sair</button>
          </> : <Link to="/login" className="bg-emerald-600 px-3 py-1 rounded">Entrar</Link>}
        </div>
      </nav>
      <div className="max-w-6xl mx-auto p-4 space-y-3">
        <OfflineIndicator />
        <main>{children}</main>
      </div>
    </div>
  )
}
