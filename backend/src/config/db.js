import mongoose from 'mongoose';
import dns from 'dns';
// Corrige DNS local que bloqueia SRV do Atlas (usa 8.8.8.8)
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch {}

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGO_URI_LOCAL;
  if (!uri) {
    console.warn('⚠️  MONGO_URI não definido - rodando sem banco (mock)');
    return;
  }
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log(`✅ MongoDB conectado: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (err) {
    console.warn('⚠️  MongoDB não conectado:', err.message, '- rodando em modo mock (sem banco)');
  }
};
