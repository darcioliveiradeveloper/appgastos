import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Lancamentos from './pages/Lancamentos';
import Receitas from './pages/Receitas';
import Despesas from './pages/Despesas';
import Cartao from './pages/Cartao';
import Investimentos from './pages/Investimentos';
import Relatorios from './pages/Relatorios';
import Admin from './pages/Admin';
import BemVindo from './pages/BemVindo';

export default function App(){
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<BemVindo/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/lancamentos" element={<Lancamentos/>} />
          <Route path="/receitas" element={<Receitas/>} />
          <Route path="/despesas" element={<Despesas/>} />
          <Route path="/cartao" element={<Cartao/>} />
          <Route path="/investimentos" element={<Investimentos/>} />
          <Route path="/relatorios" element={<Relatorios/>} />
          <Route path="/admin" element={<Admin/>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
