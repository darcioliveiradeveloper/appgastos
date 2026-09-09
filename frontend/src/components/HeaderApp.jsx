import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const VERSAO = 'v1.3.0';

export default function HeaderApp(){
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [showNome, setShowNome] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [nomeInput, setNomeInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(()=>{
    const tema = localStorage.getItem('tema') || 'azul';
    document.documentElement.setAttribute('data-tema', tema);
    // busca usuario
    const localUser = (()=>{ try{ return JSON.parse(localStorage.getItem('user')||'null'); }catch{ return null; }})();
    if (localUser) setUser(localUser);
    api.get('/auth/me').then(r=>{ setUser(r.data); localStorage.setItem('user', JSON.stringify(r.data)); }).catch(()=>{});
  },[]);

  const trocarTema = ()=>{
    const temas = ['azul','vermelho','verde','roxo','amarelo'];
    const atual = document.documentElement.getAttribute('data-tema') || 'azul';
    const idx = (temas.indexOf(atual)+1)%temas.length;
    const novo = temas[idx];
    document.documentElement.setAttribute('data-tema', novo);
    localStorage.setItem('tema', novo);
  };
  const sair = ()=>{ localStorage.removeItem('token'); localStorage.removeItem('user'); nav('/'); };
  const salvarNome = async ()=>{
    if (!nomeInput.trim()) { setMsg('Informe nome'); return; }
    try { const r = await api.post('/me/nome', { nome: nomeInput.trim() }); setUser(r.data); localStorage.setItem('user', JSON.stringify(r.data)); setShowNome(false); setMsg(''); } catch(e){ setMsg(e.response?.data?.msg || e.message); }
  };
  const salvarSenha = async ()=>{
    if (!senhaInput || senhaInput.length<4) { setMsg('Senha mínimo 4'); return; }
    try { await api.post('/auth/trocar-senha', { novaSenha: senhaInput }); setShowSenha(false); setSenhaInput(''); setMsg(''); alert('Senha alterada!'); } catch(e){ setMsg(e.response?.data?.msg || e.message); }
  };

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const hojeCap = hoje.charAt(0).toUpperCase()+hoje.slice(1);

  return (
    <>
      <header className="header-venda">
        <div className="topo-inner">
          <div className="topo-linha1">AppGastos - Controle Financeiro</div>
          <div className="topo-linha2">
            <span>{user ? user.nome : 'Carregando...'}</span>
            <span className="topo-botoes">
              <button className="btn-header-icon" title="Editar nome" onClick={()=>{ setNomeInput(user?.nome||''); setShowNome(true); }}>✏️</button>
              <button className="btn-header-icon" title="Trocar senha" onClick={()=>setShowSenha(true)}>🔒</button>
              <button className="btn-header-icon" title="Trocar cor" onClick={trocarTema}>🎨</button>
              <button className="btn-header-icon btn-sair" title="Sair" onClick={sair}>✕</button>
              <button className="btn-header-icon" title="Informações" onClick={()=>setShowInfo(true)}>ℹ️</button>
            </span>
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 flex justify-center" style={{marginTop:'-36px', position:'relative', zIndex:5}}>
        <span className="data-pill capitalize">{hojeCap}</span>
      </div>

      {/* Modais */}
      {showNome && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={()=>setShowNome(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold">Editar nome</h3>
            <input value={nomeInput} onChange={e=>setNomeInput(e.target.value)} className="w-full border p-3 rounded-xl mt-3" placeholder="Seu nome" />
            {msg && <p className="text-red-600 text-sm mt-2">{msg}</p>}
            <div className="flex gap-2 mt-4"><button onClick={()=>setShowNome(false)} className="flex-1 border p-3 rounded-xl">Cancelar</button><button onClick={salvarNome} className="flex-1 bg-[var(--c2)] text-white p-3 rounded-xl font-bold">Salvar</button></div>
          </div>
        </div>
      )}
      {showSenha && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={()=>setShowSenha(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold">Trocar senha</h3>
            <input type="password" value={senhaInput} onChange={e=>setSenhaInput(e.target.value)} className="w-full border p-3 rounded-xl mt-3" placeholder="Nova senha" />
            {msg && <p className="text-red-600 text-sm mt-2">{msg}</p>}
            <div className="flex gap-2 mt-4"><button onClick={()=>setShowSenha(false)} className="flex-1 border p-3 rounded-xl">Cancelar</button><button onClick={salvarSenha} className="flex-1 bg-[var(--c2)] text-white p-3 rounded-xl font-bold">Salvar</button></div>
          </div>
        </div>
      )}
      {showInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={()=>setShowInfo(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-auto" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold">AppGastos — {VERSAO}</h3>
            <p className="text-sm text-slate-500 mt-2">Controle financeiro pessoal com PWA offline, Dashboard, Receitas, Despesas, Cartão, Investimentos e Relatórios.</p>
            <p className="text-sm text-slate-600 mt-3"><b>Desenvolvido por</b><br/>Darci Oliveira</p>
            <div className="mt-4 border-t pt-3 space-y-2">
              <p className="font-bold text-sm">Histórico</p>
              <p className="text-xs text-purple-700 font-bold">v1.3.0 — Set 2026</p><p className="text-xs text-slate-500">Fix datas UTC, Dashboard 2 pizzas + barra com saldo, evolução com período e valores nos pontos, header data e menu ajustados, Cartão limites disponíveis.</p>
              <p className="text-xs text-purple-700 font-bold">v1.2.0 — Set 2026</p><p className="text-xs text-slate-500">Layouts padronizados max-w-6xl sem scroll, Dashboard com CardPadrao, Receitas/Despesas/Cartão/Invest/Relatórios no mesmo padrão, Welcome sem barra e Login sem barra.</p>
              <p className="text-xs text-purple-700 font-bold">v1.1.0 — Set 2026</p><p className="text-xs text-slate-500">Header VendaCerta azul, 5 ícones, paleta 5 cores, editar nome, trocar senha, data pill, menu padrão, Welcome sem barra, Login VendaCerta com máscara APP-XXXX-XXXX.</p>
            </div>
            <button onClick={()=>setShowInfo(false)} className="w-full bg-[var(--c2)] text-white p-3 rounded-xl font-bold mt-4">Fechar</button>
          </div>
        </div>
      )}

      {/* Data pílula abaixo do header será renderizada pelo Dashboard, mas Header já deixa espaço */}
    </>
  )
}
