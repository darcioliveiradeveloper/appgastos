import { Link, useNavigate } from 'react-router-dom';
import OfflineIndicator from './OfflineIndicator';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); };
  const logado = !!localStorage.getItem('token');
  const user = (()=>{ try{ return JSON.parse(localStorage.getItem('user')||'null'); }catch{ return null; }})();
  return (
    <div className="min-h-screen">
      <nav className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white p-4 flex justify-between items-center shadow-lg">
        <Link to="/" className="font-extrabold text-xl tracking-tight flex items-center gap-2">💰 AppGastos</Link>
        <div className="flex gap-4 text-sm items-center">
          {logado ? <>
            <Link to="/" className="hover:underline">Dashboard</Link>
            <Link to="/lancamentos" className="hover:underline">Lançamentos</Link>
            <Link to="/investimentos" className="hover:underline">Investimentos</Link>
            <Link to="/relatorios" className="hover:underline">Relatórios</Link>
            {user?.role==='admin' && <Link to="/admin" className="bg-white text-indigo-600 px-3 py-1 rounded-full font-bold">👑 Master</Link>}
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
