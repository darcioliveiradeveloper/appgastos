import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import OfflineIndicator from './OfflineIndicator';
import HeaderApp from './HeaderApp';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); };
  const logado = !!localStorage.getItem('token');
  const user = (()=>{ try{ return JSON.parse(localStorage.getItem('user')||'null'); }catch{ return null; }})();
  const isActive = (path) => location.pathname === path ? 'bg-white text-indigo-600 shadow' : 'hover:bg-white/20';
  const isActiveSec = (path) => location.pathname === path ? 'bg-[var(--c2)] text-white shadow' : 'hover:bg-slate-100 text-slate-700';
  const MenuLink = ({to, children}) => (
    <Link to={to} onClick={()=>setOpen(false)} className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${isActive(to)}`}>{children}</Link>
  );
  const SecLink = ({to, children}) => (
    <Link to={to} onClick={()=>setOpen(false)} className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${isActiveSec(to)}`}>{children}</Link>
  );
  const isWelcome = location.pathname === '/' || location.pathname === '/login';
  if (isWelcome) {
    return (
      <div className="min-h-screen bg-slate-50 overflow-x-hidden">
        <main className="p-0 w-full overflow-x-hidden">{children}</main>
      </div>
    );
  }
  // Header VendaCerta para logados
  if (logado) {
    return (
      <div className="min-h-screen overflow-x-hidden" style={{background:'var(--card-bg)'}}>
        <HeaderApp />
        {/* Navegação secundária AppGastos abaixo do header */}
        <div className="max-w-6xl mx-auto px-4 mt-0.5 relative z-10">
          <div className="bg-white rounded-2xl shadow border p-2 flex flex-wrap gap-1 justify-center">
            <SecLink to="/dashboard">📊 Dashboard</SecLink>
            <SecLink to="/receitas">💚 Receitas</SecLink>
            <SecLink to="/despesas">🔴 Despesas</SecLink>
            <SecLink to="/cartao">💳 Cartão</SecLink>
            <SecLink to="/investimentos">📈 Invest</SecLink>
            <SecLink to="/relatorios">📑 Relatórios</SecLink>
            {user?.role==='admin' && <Link to="/admin" onClick={()=>setOpen(false)} className={`px-3 py-2 rounded-xl text-sm font-bold ${isActiveSec('/admin')}`}>👑 Master</Link>}
          </div>
          <div className="hidden lg:block text-center mt-2">
            <OfflineIndicator />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 pt-1 pb-4 space-y-2 w-full overflow-hidden">
          <div className="lg:hidden"><OfflineIndicator /></div>
          <main>{children}</main>
        </div>
        {/* Mobile menu overlay */}
        {open && (
          <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={()=>setOpen(false)}>
            <div className="bg-white m-4 rounded-2xl p-4 space-y-1" onClick={e=>e.stopPropagation()}>
              <SecLink to="/dashboard">📊 Dashboard</SecLink>
              <SecLink to="/receitas">💚 Receitas</SecLink>
              <SecLink to="/despesas">🔴 Despesas</SecLink>
              <SecLink to="/cartao">💳 Cartão</SecLink>
              <SecLink to="/investimentos">📈 Investimentos</SecLink>
              <SecLink to="/relatorios">📑 Relatórios</SecLink>
              {user?.role==='admin' && <Link to="/admin" onClick={()=>setOpen(false)} className={`block px-3 py-2 rounded-xl font-bold ${isActiveSec('/admin')}`}>👑 Master</Link>}
              <button onClick={logout} className="w-full bg-red-500 text-white px-3 py-2 rounded-xl font-bold">Sair</button>
            </div>
          </div>
        )}
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <nav className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="font-extrabold text-xl tracking-tight flex items-center gap-2">💰 AppGastos</Link>
          <Link to="/login" className="bg-white text-indigo-600 px-5 py-2 rounded-xl font-bold shadow">Entrar</Link>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto p-4 space-y-3 w-full overflow-hidden">
        <OfflineIndicator />
        <main>{children}</main>
      </div>
    </div>
  )
}
