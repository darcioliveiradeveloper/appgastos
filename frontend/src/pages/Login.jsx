import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState(''); const [senha, setSenha] = useState(''); const [isRegister, setIsRegister] = useState(false);
  const [nome, setNome] = useState(''); const [msg, setMsg] = useState('');
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    try {
      const url = isRegister ? '/auth/register' : '/auth/login';
      const body = isRegister ? { nome, email, senha } : { email, senha };
      const { data } = await api.post(url, body);
      localStorage.setItem('token', data.token);
      nav('/');
    } catch (err) { setMsg(err.response?.data?.msg || err.message); }
  };
  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow mt-10">
      <h1 className="text-xl font-bold mb-4">{isRegister ? 'Criar conta' : 'Entrar'}</h1>
      <form onSubmit={submit} className="space-y-3">
        {isRegister && <input className="w-full border p-2 rounded" placeholder="Nome" value={nome} onChange={e=>setNome(e.target.value)} required/>}
        <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/>
        <input className="w-full border p-2 rounded" placeholder="Senha" type="password" value={senha} onChange={e=>setSenha(e.target.value)} required/>
        {msg && <p className="text-red-600 text-sm">{msg}</p>}
        <button className="w-full bg-slate-900 text-white p-2 rounded">{isRegister ? 'Cadastrar' : 'Entrar'}</button>
      </form>
      <button onClick={()=>setIsRegister(!isRegister)} className="text-sm text-blue-600 mt-3">{isRegister ? 'Já tenho conta' : 'Criar conta'}</button>
    </div>
  )
}
