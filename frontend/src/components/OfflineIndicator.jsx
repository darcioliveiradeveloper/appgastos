import useOnline from '../hooks/useOnline';
import { getQueue } from '../services/offline';

export default function OfflineIndicator(){
  const online = useOnline();
  const queueLen = getQueue().length;
  if (online && queueLen===0) return null;
  return (
    <div className={`text-sm p-2 rounded-xl flex justify-between items-center ${online? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
      <span>{online ? `📤 ${queueLen} pendentes sincronizando...` : '📴 Offline - salvando localmente (sincroniza quando voltar)'}</span>
      <span className={`px-2 py-1 rounded text-xs ${online? 'bg-emerald-600 text-white':'bg-slate-900 text-white'}`}>{online? 'Online':'Offline'}</span>
    </div>
  )
}
