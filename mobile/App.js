import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// CONFIG: troque pelo IP do notebook quando testar no celular físico
// Descubra com: ipconfig (Windows) -> IPv4
const API_URL = 'http://192.168.1.100:5000/api'; // <-- ALTERE PARA SEU IP
// Para emulador Android use 10.0.2.2, para Expo Go web use localhost

const api = axios.create({ baseURL: API_URL, timeout: 8000 });
const QUEUE_KEY = '@gastos_queue';
const CACHE_KEY = '@gastos_cache';

export default function App() {
  const [resumo, setResumo] = useState(null);
  const [lista, setLista] = useState([]);
  const [queueLen, setQueueLen] = useState(0);
  const [online, setOnline] = useState(true);
  const [form, setForm] = useState({ tipo: 'despesa', categoria: '', valor: '', descricao: '' });

  const loadQueue = async () => {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    const q = raw ? JSON.parse(raw) : [];
    setQueueLen(q.length);
    return q;
  };
  const saveQueue = async (q) => { await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(q)); setQueueLen(q.length); };

  const carregar = async () => {
    try {
      const r = await api.get('/mock/resumo');
      setResumo(r.data);
      setOnline(true);
      // tenta buscar lista real se autenticado (ignora 401)
      try {
        const t = await api.get('/transacoes');
        setLista(t.data);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(t.data));
      } catch {}
      // sincroniza fila pendente
      await syncQueue();
    } catch (e) {
      setOnline(false);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) setLista(JSON.parse(cached));
      const q = await loadQueue();
      if (q.length) setLista(prev => [...q.map(x=>({ ...x, _offline:true })), ...prev]);
    }
    await loadQueue();
  };

  const syncQueue = async () => {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    const q = raw ? JSON.parse(raw) : [];
    if (!q.length) return;
    let synced = 0;
    const remaining = [];
    for (const item of q) {
      try {
        const { _offlineId, _offline, ...payload } = item;
        await api.post('/transacoes', { ...payload, valor: Number(payload.valor) });
        synced++;
      } catch (e) { remaining.push(item); if (!e.response) break; }
    }
    await saveQueue(remaining);
    if (synced) {
      try { const t = await api.get('/transacoes'); setLista(t.data); await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(t.data)); } catch {}
    }
  };

  useEffect(() => { carregar(); }, []);

  const salvar = async () => {
    if (!form.categoria || !form.valor) return Alert.alert('Preencha categoria e valor');
    const novo = { _offlineId: Date.now().toString(), _offline: true, ...form, valor: Number(form.valor), data: new Date().toISOString() };
    // otimista local
    setLista([novo, ...lista]);
    const q = await loadQueue();
    await saveQueue([...q, { ...form, valor: Number(form.valor), data: novo.data, _offlineId: novo._offlineId }]);
    setForm({ ...form, categoria: '', valor: '', descricao: '' });
    try {
      await api.post('/transacoes', { ...form, valor: Number(form.valor) });
      await syncQueue();
      Alert.alert('✅ Sincronizado com nuvem!');
      carregar();
    } catch (e) {
      if (!e.response) Alert.alert('📴 Offline - salvo localmente', 'Sincroniza quando voltar à internet');
      else Alert.alert('Erro', e.response?.data?.msg || e.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <StatusBar style="light" />
      <Text style={styles.title}>💰 Gastos</Text>
      <Text style={styles.sub}>PWA + Expo • Offline-first</Text>

      <View style={[styles.badge, { backgroundColor: online ? '#dcfce7' : '#fee2e2' }]}>
        <Text style={{ color: online ? '#166534' : '#991b1b', fontWeight:'bold' }}>{online ? '🟢 Online - Atlas sincronizado' : `🔴 Offline - ${queueLen} pendentes`}</Text>
        {!online && queueLen>0 && <TouchableOpacity onPress={syncQueue} style={styles.syncBtn}><Text style={{color:'#fff'}}>Sincronizar</Text></TouchableOpacity>}
      </View>

      {resumo && (
        <View style={styles.cards}>
          <Card label="Receitas" valor={resumo.receitas} cor="#10b981" />
          <Card label="Despesas" valor={resumo.despesas} cor="#ef4444" />
          <Card label="Saldo" valor={resumo.saldo} cor={resumo.saldo >=0 ? '#10b981':'#ef4444'} />
        </View>
      )}

      <View style={styles.form}>
        <Text style={styles.section}>+ Novo Lançamento {online?'':'📴'}</Text>
        <View style={{ flexDirection:'row', gap: 8 }}>
          <TextInput style={[styles.input,{flex:1}]} placeholder="Categoria" value={form.categoria} onChangeText={v=>setForm({...form,categoria:v})} />
          <TextInput style={[styles.input,{flex:1}]} placeholder="Valor" keyboardType="numeric" value={form.valor} onChangeText={v=>setForm({...form,valor:v})} />
        </View>
        <TextInput style={styles.input} placeholder="Descrição" value={form.descricao} onChangeText={v=>setForm({...form,descricao:v})} />
        <Button title={online? 'Adicionar e sincronizar' : '💾 Salvar offline'} onPress={salvar} color="#0f172a" />
        <Text style={styles.hint}>API: {API_URL} • Dados locais AsyncStorage + Atlas. {queueLen>0? `${queueLen} pendentes` : 'Tudo sincronizado'}</Text>
      </View>

      <Text style={styles.section}>Últimos Lançamentos ({lista.length})</Text>
      {lista.map(item=>(
        <View key={item._id || item._offlineId} style={[styles.item, item._offline && {borderColor:'#f59e0b', borderWidth:1}]}>
          <View><Text style={{fontWeight:'bold'}}>{item.categoria} - {item.tipo} {item._offline?'⏳':''}</Text><Text style={{fontSize:11, color:'#64748b'}}>{new Date(item.data).toLocaleDateString()} • {item.descricao||'-'}</Text></View>
          <Text style={{color: item.tipo==='receita'?'#10b981':'#ef4444', fontWeight:'bold'}}>R$ {Number(item.valor).toFixed(2)}</Text>
        </View>
      ))}
      {lista.length===0 && <Text style={{color:'#64748b'}}>Nenhum lançamento. Adicione acima (funciona offline).</Text>}
      <Text style={{marginTop:16, color:'#64748b', fontSize:11, textAlign:'center'}}>Expo Go: escaneie QR com npx expo start • APK: eas build -p android --profile preview</Text>
    </ScrollView>
  );
}
function Card({ label, valor, cor }){
  return <View style={styles.card}><Text style={{color:'#64748b', fontSize:12}}>{label}</Text><Text style={{color:cor, fontWeight:'bold', fontSize:18}}>R$ {Number(valor||0).toFixed(2)}</Text></View>
}
const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#f1f5f9', paddingTop:40 },
  title:{ fontSize:24, fontWeight:'bold', color:'#0f172a' },
  sub:{ color:'#64748b', marginBottom:8 },
  badge:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:10, borderRadius:10, marginBottom:12 },
  syncBtn:{ backgroundColor:'#0f172a', paddingHorizontal:12, paddingVertical:6, borderRadius:8 },
  cards:{ flexDirection:'row', gap:8, marginBottom:16 },
  card:{ flex:1, backgroundColor:'#fff', padding:12, borderRadius:12, elevation:2 },
  form:{ backgroundColor:'#fff', padding:12, borderRadius:12, gap:8, marginBottom:16 },
  input:{ borderWidth:1, borderColor:'#e2e8f0', borderRadius:8, padding:10, backgroundColor:'#fff' },
  section:{ fontWeight:'bold', fontSize:16, marginVertical:8, color:'#0f172a' },
  item:{ backgroundColor:'#fff', padding:12, borderRadius:8, flexDirection:'row', justifyContent:'space-between', marginBottom:6, alignItems:'center' },
  hint:{ fontSize:11, color:'#94a3b8' }
});
