import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const VERSAO = 'v1.0.0';

export default function Login() {
  const [email, setEmail] = useState(''); const [senha, setSenha] = useState(''); const [isRegister, setIsRegister] = useState(false);
  const [nome, setNome] = useState(''); const [codigo, setCodigo] = useState(''); const [msg, setMsg] = useState('');
  const nav = useNavigate();
  const formatCodigo = (v) => {
    let raw = v.toUpperCase().replace(/[^A-Z0-9]/g, '');
    // força prefixo APP
    // limita a 11 chars alfanum (APP + 8)
    raw = raw.slice(0, 11);
    if (raw.length <= 3) return raw;
    if (raw.length <= 7) return raw.slice(0,3) + '-' + raw.slice(3);
    return raw.slice(0,3) + '-' + raw.slice(3,7) + '-' + raw.slice(7);
  };
  const submit = async (e) => {
    e.preventDefault(); setMsg('');
    try {
      const url = isRegister ? '/auth/register' : '/auth/login';
      const body = isRegister ? { nome, email, senha, codigoAtivacao: codigo } : { email, senha };
      const { data } = await api.post(url, body);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user?.role === 'admin') nav('/admin'); else nav('/dashboard');
    } catch (err) { setMsg(err.response?.data?.msg || err.message); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1e1b4b] via-[#4338ca] to-[#06b6d4] p-4 w-full overflow-hidden">
      <div className="w-full max-w-sm bg-white rounded-[1.5rem] shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-[#1e1b4b] via-[#4338ca] to-[#06b6d4] p-6 text-white text-center rounded-t-[1.5rem]">
          <h1 className="text-2xl font-extrabold">AppGastos</h1>
          <p className="text-purple-100 text-sm mt-1">Controle Financeiro Pessoal</p>
          <p className="text-purple-200 text-xs mt-1">{VERSAO}</p>
        </div>
        <div className="p-6">
          <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
            <button type="button" onClick={()=>setIsRegister(false)} className={`flex-1 py-2 rounded-lg text-sm font-bold ${!isRegister?'bg-white shadow text-purple-700':'text-slate-500'}`}>Entrar</button>
            <button type="button" onClick={()=>setIsRegister(true)} className={`flex-1 py-2 rounded-lg text-sm font-bold ${isRegister?'bg-white shadow text-purple-700':'text-slate-500'}`}>Criar conta</button>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-sm text-slate-600">Nome</label>
                <input className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl mt-1 focus:outline-none focus:border-purple-500" placeholder="Seu nome" value={nome} onChange={e=>setNome(e.target.value)} required/>
              </div>
            )}
            <div>
              <label className="text-sm text-slate-600">E-mail</label>
              <input className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl mt-1 focus:outline-none focus:border-purple-500" placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)} required/>
            </div>
            <div>
              <label className="text-sm text-slate-600">Senha</label>
              <input className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl mt-1 focus:outline-none focus:border-purple-500" placeholder="Sua senha" type="password" value={senha} onChange={e=>setSenha(e.target.value)} required/>
            </div>
            {isRegister && (
              <div>
                <label className="text-sm text-slate-600">Código de ativação</label>
                <input className="w-full bg-amber-50 border-2 border-amber-300 p-3 rounded-xl mt-1 focus:outline-none focus:border-amber-500 uppercase tracking-widest font-mono" placeholder="APP-XXXX-XXXX" value={codigo} onChange={e=>setCodigo(formatCodigo(e.target.value))} maxLength={13} required/>
                <p className="text-xs text-slate-500 mt-1">Formato: APP-XXXX-XXXX • 13 caracteres</p>
              </div>
            )}
            {msg && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-200">{msg}</p>}
            <div className="flex gap-2">
              <button className="flex-1 bg-[#4338ca] hover:bg-[#3730a3] text-white px-6 py-3 rounded-xl font-bold shadow">Entrar</button>
              <button type="button" onClick={()=>nav('/')} className="px-6 py-3 rounded-xl font-bold border border-slate-300 text-slate-600 hover:bg-slate-50">Voltar</button>
              <button type="button" onClick={()=>{ try{ window.close(); }catch{}; setTimeout(()=>{ if(!window.closed) window.location.href='about:blank'; },300); }} className="px-6 py-3 rounded-xl font-bold border border-red-200 text-red-600 hover:bg-red-50">Sair</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
