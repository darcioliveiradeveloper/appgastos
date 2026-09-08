import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import OfflineIndicator from './OfflineIndicator';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); };
  const logado = !!localStorage.getItem('token');
  const user = (()=>{ try{ return JSON.parse(localStorage.getItem('user')||'null'); }catch{ return null; }})();
  const isActive = (path) => location.pathname === path ? 'bg-white text-indigo-600 shadow' : 'hover:bg-white/20';
  const MenuLink = ({to, children}) => (
    <Link to={to} onClick={()=>setOpen(false)} className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${isActive(to)}`}>{children}</Link>
  );
  const isWelcome = location.pathname === '/' || location.pathname === '/login';
  if (isWelcome) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="p-0">{children}</main>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <nav className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/dashboard" className="font-extrabold text-xl tracking-tight flex items-center gap-2">💰 AppGastos</Link>
          {/* Desktop */}
          <div className="hidden lg:flex gap-1 items-center">
            {logado ? <>
              <MenuLink to="/dashboard">📊 Dashboard</MenuLink>
              <MenuLink to="/receitas">💚 Receitas</MenuLink>
              <MenuLink to="/despesas">🔴 Despesas</MenuLink>
              <MenuLink to="/cartao">💳 Cartão</MenuLink>
              <MenuLink to="/investimentos">📈 Investimentos</MenuLink>
              <MenuLink to="/relatorios">📑 Relatórios</MenuLink>
              {user?.role==='admin' && <Link to="/admin" onClick={()=>setOpen(false)} className="bg-yellow-300 text-indigo-700 px-3 py-2 rounded-xl text-sm font-extrabold">👑 Master</Link>}
              <button onClick={logout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl text-sm font-bold ml-2">Sair</button>
            </> : <>
              <Link to="/" className={`px-3 py-2 rounded-xl text-sm font-semibold ${isActive('/')}`}>Início</Link>
              <Link to="/login" className="bg-white text-indigo-600 px-5 py-2 rounded-xl font-bold shadow">Entrar</Link>
            </>}
          </div>
          {/* Mobile hamburger */}
          <button onClick={()=>setOpen(!open)} className="lg:hidden bg-white/20 p-2 rounded-xl">{open?'✕':'☰'}</button>
        </div>
        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden px-4 pb-4 space-y-1 bg-indigo-700/50 backdrop-blur">
            {logado ? <>
              <MenuLink to="/dashboard">📊 Dashboard</MenuLink>
              <MenuLink to="/receitas">💚 Receitas</MenuLink>
              <MenuLink to="/despesas">🔴 Despesas</MenuLink>
              <MenuLink to="/cartao">💳 Cartão</MenuLink>
              <MenuLink to="/investimentos">📈 Investimentos</MenuLink>
              <MenuLink to="/relatorios">📑 Relatórios</MenuLink>
              {user?.role==='admin' && <Link to="/admin" onClick={()=>setOpen(false)} className="block bg-yellow-300 text-indigo-700 px-3 py-2 rounded-xl font-bold">👑 Master</Link>}
              <button onClick={logout} className="w-full text-left bg-red-500 px-3 py-2 rounded-xl font-bold">Sair</button>
            </> : <>
              <Link to="/" onClick={()=>setOpen(false)} className="block px-3 py-2">Início</Link>
              <Link to="/login" onClick={()=>setOpen(false)} className="block bg-white text-indigo-600 px-3 py-2 rounded-xl font-bold">Entrar</Link>
            </>}
          </div>
        )}
      </nav>
      <div className="max-w-6xl mx-auto p-4 space-y-3 w-full overflow-hidden">
        <OfflineIndicator />
        <main>{children}</main>
      </div>
    </div>
  )
}
