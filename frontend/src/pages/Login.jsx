import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState(''); const [senha, setSenha] = useState(''); const [isRegister, setIsRegister] = useState(false);
  const [nome, setNome] = useState(''); const [codigo, setCodigo] = useState(''); const [msg, setMsg] = useState('');
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault(); setMsg('');
    try {
      const url = isRegister ? '/auth/register' : '/auth/login';
      const body = isRegister ? { nome, email, senha, codigoAtivacao: codigo } : { email, senha };
      const { data } = await api.post(url, body);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // redireciona admin para painel
      if (data.user?.role === 'admin') nav('/admin'); else nav('/');
    } catch (err) { setMsg(err.response?.data?.msg || err.message); }
  };
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 -m-4 p-4 rounded-2xl">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center text-2xl mb-3 shadow">💰</div>
          <h1 className="text-2xl font-extrabold">AppGastos</h1>
          <p className="text-indigo-100 text-sm">Finanças pessoais com controle total</p>
        </div>
        <div className="p-6">
          <div className="flex bg-slate-100 rounded-lg p-1 mb-4">
            <button onClick={()=>setIsRegister(false)} className={`flex-1 py-2 rounded-md text-sm font-semibold ${!isRegister?'bg-white shadow text-indigo-600':'text-slate-500'}`}>Entrar</button>
            <button onClick={()=>setIsRegister(true)} className={`flex-1 py-2 rounded-md text-sm font-semibold ${isRegister?'bg-white shadow text-indigo-600':'text-slate-500'}`}>Criar conta</button>
          </div>
          <form onSubmit={submit} className="space-y-3">
            {isRegister && <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Nome completo" value={nome} onChange={e=>setNome(e.target.value)} required/>}
            <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/>
            <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Senha" type="password" value={senha} onChange={e=>setSenha(e.target.value)} required/>
            {isRegister && (
              <div>
                <input className="w-full border-2 border-amber-300 p-3 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none bg-amber-50" placeholder="Código de ativação (ex: APP-XXXX-XXXX)" value={codigo} onChange={e=>setCodigo(e.target.value.toUpperCase())} required/>
                <p className="text-xs text-slate-500 mt-1">🔑 Código fornecido pelo suporte. Master: admin@teste.com</p>
              </div>
            )}
            {msg && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-200">{msg}</p>}
            <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-xl font-bold shadow hover:opacity-90">{isRegister ? 'Ativar e Criar Conta' : 'Entrar no AppGastos'}</button>
          </form>
          <p className="text-xs text-slate-400 text-center mt-4">Acesso master: admin@teste.com / admin123 → gera códigos</p>
        </div>
      </div>
    </div>
  )
}
