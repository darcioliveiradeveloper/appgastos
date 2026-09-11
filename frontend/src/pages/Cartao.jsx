import { useEffect, useState } from 'react';
import api from '../services/api';
import { CardPadrao, TituloCard, TituloPagina, Grid } from '../components/ui/CardPadrao';

export default function Cartao(){
  const [cartoes,setCartoes]=useState([]);
  const [form,setForm]=useState({ nome:'', limite:'', vencimento:'10', cor:'#4f46e5' });
  const [editId,setEditId]=useState(null);
  const [fatura,setFatura]=useState([]);
  const [trans,setTrans]=useState({ categoria:'', descricao:'', valor:'', cartao:'' });
  const [limiteSel,setLimiteSel]=useState('');
  const [limites,setLimites]=useState({ proxima:'', usado:'', disponivel:'', futuras:'' });
  const [editLimites,setEditLimites]=useState(false);
  const [valorPago,setValorPago]=useState('');
  const [historico,setHistorico]=useState([]);
  // carrega limites salvos do cartão selecionado
  useEffect(()=>{
    const c = cartoes.find(x=>x.nome===limiteSel);
    if (c) {
      setLimites({
        proxima: c.faturaAtual ? String(c.faturaAtual) : '',
        usado: c.limiteUsado ? String(c.limiteUsado) : '',
        disponivel: c.limiteDisponivel ? String(c.limiteDisponivel) : '',
        futuras: c.faturasFuturas ? String(c.faturasFuturas) : ''
      });
      setEditLimites(false);
      api.get(`/pagamentos?cartao=${encodeURIComponent(c.nome)}`).then(r=>setHistorico(r.data)).catch(()=>setHistorico([]));
    } else {
      setLimites({ proxima:'', usado:'', disponivel:'', futuras:'' });
      setEditLimites(false);
      setHistorico([]);
    }
  }, [limiteSel, cartoes]);

  const carregarCartoes = async ()=>{ try{ const r=await api.get('/cartoes'); setCartoes(r.data); if(r.data[0] && !limiteSel) { setTrans(s=>({...s,cartao:r.data[0].nome})); setLimiteSel(r.data[0].nome); } } catch{} };
  const carregarFatura = async ()=>{ try{ const r=await api.get('/transacoes'); setFatura(r.data.filter(t=>t.conta && t.conta!=='carteira')); } catch{ setFatura([]);} };
  useEffect(()=>{ carregarCartoes(); carregarFatura(); },[]);

  const salvarCartao = async(e)=>{
    e.preventDefault();
    if (editId) {
      await api.put(`/cartoes/${editId}`, { nome:form.nome, limite:Number(form.limite), vencimento:Number(form.vencimento), cor:form.cor });
      setEditId(null);
    } else {
      await api.post('/cartoes', { nome:form.nome, limite:Number(form.limite), vencimento:Number(form.vencimento), cor:form.cor });
    }
    setForm({ nome:'', limite:'', vencimento:'10', cor:'#4f46e5' }); carregarCartoes();
  };
  const editarCartao = (c)=>{ setForm({ nome:c.nome, limite:String(c.limite), vencimento:String(c.vencimento), cor:c.cor }); setEditId(c._id); window.scrollTo({top:0,behavior:'smooth'}); };
  const excluirCartao = async(id)=>{ if(!confirm('Excluir cartão?')) return; await api.delete(`/cartoes/${id}`); carregarCartoes(); };
  const lancarCartao = async(e)=>{ e.preventDefault(); await api.post('/transacoes', { tipo:'despesa', categoria:trans.categoria, descricao:trans.descricao, valor:Number(trans.valor), conta:trans.cartao }); setTrans({...trans,categoria:'',descricao:'',valor:''}); carregarFatura(); };
  const totalFatura = fatura.reduce((s,t)=>s+Number(t.valor),0);

  const cartaoSelecionado = cartoes.find(c=>c.nome===limiteSel);
  // auto-calcula Faturas Futuras quando Fatura Atual e Usado mudam: Futuras = Usado - Fatura Atual, Disponível = Limite - Usado
  const handleLimiteChange = async (campo, valor) => {
    const novo = { ...limites, [campo]: valor };
    const proxima = Number(campo==='proxima'? valor : novo.proxima || 0);
    const usado = Number(campo==='usado'? valor : novo.usado || 0);
    const total = cartaoSelecionado ? cartaoSelecionado.limite : 0;
    if (campo==='proxima' || campo==='usado') {
      novo.disponivel = String(total - usado);
      novo.futuras = String(usado - proxima);
    }
    if (campo==='disponivel') {
      const disp = Number(valor||0);
      novo.usado = String(total - disp);
      novo.futuras = String((total - disp) - proxima);
    }
    setLimites(novo);
    // salva no cartão selecionado
    if (limiteSel && cartaoSelecionado) {
      try {
        await api.put(`/cartoes/${cartaoSelecionado._id}`, {
          faturaAtual: Number(novo.proxima||0),
          limiteUsado: Number(novo.usado||0),
          limiteDisponivel: Number(novo.disponivel||0),
          faturasFuturas: Number(novo.futuras||0)
        });
        setCartoes(prev=> prev.map(c=> c._id===cartaoSelecionado._id ? { ...c, faturaAtual: Number(novo.proxima||0), limiteUsado: Number(novo.usado||0), limiteDisponivel: Number(novo.disponivel||0), faturasFuturas: Number(novo.futuras||0) } : c));
      } catch {}
    }
  };

  return (
    <div className="space-y-2 w-full max-w-6xl mx-auto overflow-hidden">
      <TituloPagina subtitulo="Fatura e cartões">Cartão</TituloPagina>
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-5 rounded-2xl shadow flex justify-between items-center w-full overflow-hidden">
        <div><h2 className="text-lg font-extrabold">💳 Fatura Total</h2><p className="text-violet-100 text-sm">Soma dos cartões</p></div>
        <div className="bg-white text-violet-600 px-4 py-2 rounded-xl font-extrabold">R$ {totalFatura.toFixed(2)}</div>
      </div>

      <CardPadrao>
        <TituloCard>{editId ? 'Editar cartão' : 'Novo cartão'}</TituloCard>
        <form onSubmit={salvarCartao} className="grid md:grid-cols-5 gap-2">
          <input placeholder="Nome (Nubank)" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} className="border border-slate-200 p-3 rounded-xl" required/>
          <input placeholder="Limite total (ex: 3000)" value={form.limite} onChange={e=>setForm({...form,limite:e.target.value})} className="border border-slate-200 p-3 rounded-xl" required/>
          <input placeholder="Vencimento dia (ex: 10)" type="number" value={form.vencimento} onChange={e=>setForm({...form,vencimento:e.target.value})} className="border border-slate-200 p-3 rounded-xl"/>
          <input type="color" value={form.cor} onChange={e=>setForm({...form,cor:e.target.value})} className="border p-1 rounded-xl h-[48px]"/>
          <button className={`${editId?'bg-amber-600':'bg-violet-600'} text-white rounded-xl font-bold`}>{editId?'Salvar':' + Cartão'}</button>
        </form>
        {editId && <button onClick={()=>{setEditId(null); setForm({ nome:'', limite:'', vencimento:'10', cor:'#4f46e5' });}} className="text-sm text-slate-500 mt-2">Cancelar edição</button>}
      </CardPadrao>

      <Grid cols={3}>
        {cartoes.map(c=>(
          <div key={c._id} className="rounded-2xl p-5 shadow w-full overflow-hidden relative border-2" style={{background: c.cor, borderColor: c.cor}}>
            <p className="font-extrabold text-black text-lg">{c.nome}</p><p className="text-sm font-bold text-black">Limite R$ {c.limite.toFixed(2)} • Venc dia {c.vencimento}</p>
            {(c.faturaAtual || c.limiteUsado) ? (
              <div className="mt-2 bg-white/80 rounded-xl p-2 text-xs text-black">
                <p>Fatura: R$ {(c.faturaAtual||0).toFixed(2)} • Usado: R$ {(c.limiteUsado||0).toFixed(2)}</p>
                <p>Disp: R$ {(c.limiteDisponivel||0).toFixed(2)} • Futuras: R$ {(c.faturasFuturas||0).toFixed(2)}</p>
              </div>
            ) : <p className="text-xs mt-2 font-bold text-black">Gastos: R$ {fatura.filter(f=>f.conta===c.nome).reduce((s,t)=>s+t.valor,0).toFixed(2)}</p>}
            <div className="flex gap-1 mt-2">
              <button onClick={()=>editarCartao(c)} className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-xs border">✏️</button>
              <button onClick={()=>excluirCartao(c._id)} className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-xs border">🗑️</button>
            </div>
          </div>
        ))}
      </Grid>
      {cartoes.length===0 && <p className="text-slate-500 text-sm">Nenhum cartão. Crie acima.</p>}

      <CardPadrao>
        <TituloCard>Limites Disponíveis</TituloCard>
        <p className="text-xs text-slate-500 mb-3">Preencha com dados do banco. Ex: limite 3000, próxima 1200, usado 2900 → disponível 100, futuras 1700. Clique em Editar para alterar.</p>
        <div className="grid md:grid-cols-2 gap-2 mb-3">
          <select value={limiteSel} onChange={e=>setLimiteSel(e.target.value)} className="border border-slate-200 p-3 rounded-xl w-full">
            <option value="">Selecione o cartão</option>
            {cartoes.map(c=> <option key={c._id} value={c.nome}>{c.nome} — Limite R$ {c.limite.toFixed(2)}</option>)}
          </select>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between"><span className="text-sm text-slate-600">Limite total</span><b className="text-slate-800">R$ {cartaoSelecionado ? cartaoSelecionado.limite.toFixed(2) : '0.00'}</b></div>
        </div>
        {limiteSel && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl"><p className="text-xs font-extrabold text-emerald-700">Fatura Atual</p><input value={limites.proxima} onChange={e=>handleLimiteChange('proxima', e.target.value)} disabled={!editLimites} placeholder="2000" className={`w-full border p-2 rounded-lg mt-1 font-bold ${editLimites?'bg-white border-emerald-200 text-emerald-700':'bg-slate-100 border-slate-200 text-slate-500'}`} /><p className="text-xs text-slate-500">a pagar mês atual</p></div>
              <div className="bg-white border border-slate-200 p-3 rounded-xl"><p className="text-xs font-extrabold text-slate-600">Limite usado</p><input value={limites.usado} onChange={e=>handleLimiteChange('usado', e.target.value)} disabled={!editLimites} placeholder="2500" className={`w-full border p-2 rounded-lg mt-1 font-bold ${editLimites?'bg-white':'bg-slate-100 text-slate-500'}`} /><p className="text-xs text-slate-400">total já comprometido</p></div>
              <div className="bg-violet-50 border border-violet-200 p-3 rounded-xl"><p className="text-xs font-extrabold text-violet-700">Limite disponível</p><input value={limites.disponivel} readOnly className="w-full bg-slate-100 border border-violet-200 p-2 rounded-lg mt-1 font-bold text-violet-700" /><p className="text-xs text-slate-500">após fatura</p></div>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl"><p className="text-xs font-extrabold text-amber-700">Faturas Futuras</p><input value={limites.futuras} readOnly className="w-full bg-slate-100 border border-amber-200 p-2 rounded-lg mt-1 font-bold text-amber-700" /><p className="text-xs text-slate-500">parcelas outros meses</p></div>
            </div>
            <div className="flex gap-2 mt-3">
              {!editLimites ? <button onClick={()=>setEditLimites(true)} className="bg-amber-500 text-white px-4 py-2 rounded-xl font-bold">✏️ Editar</button>
              : <><button onClick={async()=>{ if(cartaoSelecionado){ await api.put(`/cartoes/${cartaoSelecionado._id}`, { faturaAtual:Number(limites.proxima||0), limiteUsado:Number(limites.usado||0), limiteDisponivel:Number(limites.disponivel||0), faturasFuturas:Number(limites.futuras||0) }); setCartoes(prev=> prev.map(c=> c._id===cartaoSelecionado._id ? { ...c, faturaAtual:Number(limites.proxima||0), limiteUsado:Number(limites.usado||0), limiteDisponivel:Number(limites.disponivel||0), faturasFuturas:Number(limites.futuras||0) } : c)); setEditLimites(false); } }} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold">💾 Salvar</button><button onClick={()=>{ const c=cartoes.find(x=>x.nome===limiteSel); setLimites({ proxima: c.faturaAtual?String(c.faturaAtual):'', usado:c.limiteUsado?String(c.limiteUsado):'', disponivel:c.limiteDisponivel?String(c.limiteDisponivel):'', futuras:c.faturasFuturas?String(c.faturasFuturas):'' }); setEditLimites(false); }} className="border px-4 py-2 rounded-xl">Cancelar</button></>}
            </div>
            {limiteSel && (
              <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex flex-col md:flex-row gap-2 items-center">
                <div className="flex-1 w-full">
                  <p className="text-xs font-extrabold text-emerald-700">Pagar fatura</p>
                  <input type="number" value={valorPago} onChange={e=>setValorPago(e.target.value)} placeholder="Valor pago (ex: 500)" className="w-full border border-emerald-200 p-2 rounded-lg mt-1" />
                </div>
                <button onClick={async()=>{
                  const pago = Number(valorPago||0);
                  if (!pago || pago<=0) return alert('Informe valor pago');
                  const novaFatura = Math.max(0, Number(limites.proxima||0) - pago);
                  const novoUsado = Math.max(0, Number(limites.usado||0) - pago);
                  const total = cartaoSelecionado ? cartaoSelecionado.limite : 0;
                  const novoDisp = total - novoUsado;
                  const novoFut = novoUsado - novaFatura;
                  const novoLimites = { proxima: String(novaFatura), usado: String(novoUsado), disponivel: String(novoDisp), futuras: String(novoFut) };
                  setLimites(novoLimites);
                  await api.put(`/cartoes/${cartaoSelecionado._id}`, { faturaAtual: novaFatura, limiteUsado: novoUsado, limiteDisponivel: novoDisp, faturasFuturas: novoFut });
                  await api.post('/pagamentos', { cartao: cartaoSelecionado.nome, cartaoId: cartaoSelecionado._id, valor: pago });
                  const hist = await api.get(`/pagamentos?cartao=${encodeURIComponent(cartaoSelecionado.nome)}`);
                  setHistorico(hist.data);
                  setCartoes(prev=> prev.map(c=> c._id===cartaoSelecionado._id ? { ...c, faturaAtual: novaFatura, limiteUsado: novoUsado, limiteDisponivel: novoDisp, faturasFuturas: novoFut } : c));
                  setValorPago('');
                  alert(`Pago R$ ${pago.toFixed(2)}! Fatura atual agora R$ ${novaFatura.toFixed(2)}`);
                }} className="bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold w-full md:w-auto">💳 Pagar</button>
                <p className="text-xs text-slate-500">Valor pago abate da fatura e do limite usado, atualizando disponível e futuras.</p>
              </div>
            )}
            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="font-extrabold text-sm">Resumo de todos os cartões</p>
              <div className="grid grid-cols-3 gap-2 mt-2 text-center text-sm">
                <div><p className="text-slate-500">Total Limites</p><p className="font-bold">R$ {cartoes.reduce((s,c)=>s+c.limite,0).toFixed(2)}</p></div>
                <div><p className="text-slate-500">Total Faturas</p><p className="font-bold text-emerald-600">R$ {cartoes.reduce((s,c)=>s+(c.faturaAtual||0),0).toFixed(2)}</p></div>
                <div><p className="text-slate-500">Total Futuras</p><p className="font-bold text-amber-600">R$ {cartoes.reduce((s,c)=>s+(c.faturasFuturas||0),0).toFixed(2)}</p></div>
              </div>
            </div>
            {historico.length>0 && (
              <div className="mt-3">
                <p className="font-bold text-sm mb-2">Histórico de pagamentos — {limiteSel}</p>
                <div className="space-y-1 max-h-40 overflow-auto">
                  {historico.map(h=>(
                    <div key={h._id} className="flex justify-between bg-white border p-2 rounded-lg text-sm">
                      <span>{new Date(h.data).toLocaleDateString('pt-BR')} • {new Date(h.data).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</span>
                      <b className="text-emerald-600">R$ {h.valor.toFixed(2)}</b>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardPadrao>

      <CardPadrao>
        <TituloCard>Lançar no cartão</TituloCard>
        <form onSubmit={lancarCartao} className="grid md:grid-cols-5 gap-2">
          <select value={trans.cartao} onChange={e=>setTrans({...trans,cartao:e.target.value})} className="border border-slate-200 p-3 rounded-xl">{cartoes.map(c=><option key={c._id} value={c.nome}>{c.nome}</option>)}</select>
          <input placeholder="Categoria" value={trans.categoria} onChange={e=>setTrans({...trans,categoria:e.target.value})} className="border border-slate-200 p-3 rounded-xl" required/>
          <input placeholder="Descrição" value={trans.descricao} onChange={e=>setTrans({...trans,descricao:e.target.value})} className="border border-slate-200 p-3 rounded-xl"/>
          <input placeholder="Valor" type="number" step="0.01" value={trans.valor} onChange={e=>setTrans({...trans,valor:e.target.value})} className="border border-slate-200 p-3 rounded-xl" required/>
          <button className="bg-indigo-600 text-white rounded-xl font-bold">Lançar</button>
        </form>
      </CardPadrao>
      <CardPadrao>
        <TituloCard>Fatura detalhada</TituloCard>
        <div className="overflow-auto w-full">
          <table className="w-full text-sm"><thead className="bg-violet-50"><tr><th className="p-3 text-left">Data</th><th className="p-3">Cartão</th><th className="p-3">Categoria</th><th className="p-3 text-right">Valor</th></tr></thead>
          <tbody>{fatura.map(t=> <tr key={t._id} className="border-t"><td className="p-3">{new Date(t.data).toLocaleDateString('pt-BR', {timeZone:'UTC'})}</td><td className="p-3">{t.conta}</td><td className="p-3">{t.categoria}</td><td className="p-3 text-right font-bold text-violet-600">R$ {t.valor.toFixed(2)}</td></tr>)}</tbody></table>
          {fatura.length===0 && <p className="p-4 text-slate-500">Nenhum gasto no cartão.</p>}
        </div>
      </CardPadrao>
    </div>
  )
}
