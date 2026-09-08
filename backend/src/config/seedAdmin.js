import User from '../models/User.js';

export const seedAdmin = async () => {
  const seeds = [
    { nome: 'Master Admin', email: 'admin@appgastos.com', senha: 'admin123', role: 'admin' },
  ];
  for (const s of seeds) {
    let u = await User.findOne({ email: s.email });
    if (!u) {
      await User.create(s);
      console.log(`👑 Seed criado: ${s.email} / ${s.senha} (${s.role})`);
    } else {
      let changed = false;
      if (u.role !== s.role) { u.role = s.role; changed = true; }
      const ok = await u.compararSenha(s.senha);
      if (!ok) { u.senha = s.senha; changed = true; }
      if (changed) { await u.save(); console.log(`🔑 Seed atualizado: ${s.email}`); }
    }
  }
};
