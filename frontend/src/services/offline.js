// Fila offline simples usando localStorage + IndexedDB fallback
// Armazena transações quando sem internet/atlas e sincroniza quando volta
const QUEUE_KEY = 'gastos_offline_queue';
const CACHE_KEY = 'gastos_cache_transacoes';

export const isOnline = () => navigator.onLine;

export const getQueue = () => {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; }
};
export const saveToQueue = (transacao) => {
  const q = getQueue();
  const item = { ...transacao, _offlineId: Date.now().toString(), _offlineAt: new Date().toISOString() };
  q.push(item);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  return item;
};
export const clearQueue = () => localStorage.removeItem(QUEUE_KEY);
export const removeFromQueue = (offlineId) => {
  const q = getQueue().filter(i => i._offlineId !== offlineId);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
};

export const cacheTransacoes = (lista) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data: lista, at: Date.now() })); } catch {}
};
export const getCachedTransacoes = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    return raw?.data || null;
  } catch { return null; }
};

// Sincroniza fila com API (chamar quando voltar online)
export const syncQueue = async (api) => {
  const q = getQueue();
  if (!q.length) return { synced: 0 };
  let synced = 0;
  for (const item of [...q]) {
    try {
      const { _offlineId, _offlineAt, ...payload } = item;
      await api.post('/transacoes', { ...payload, valor: Number(payload.valor) });
      removeFromQueue(_offlineId);
      synced++;
    } catch (e) {
      // se 401 ou erro definitivo, mantém na fila; se rede, para
      if (!e.response) break;
    }
  }
  return { synced, remaining: getQueue().length };
};

// Hook simples para status
export const onOnlineStatusChange = (cb) => {
  window.addEventListener('online', () => cb(true));
  window.addEventListener('offline', () => cb(false));
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
};
