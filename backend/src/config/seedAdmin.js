import User from '../models/User.js';

export const seedAdmin = async () => {
  const email = 'admin@teste.com';
  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({ nome: 'Master Admin', email, senha: 'admin123', role: 'admin' });
    console.log('👑 Admin criado: admin@teste.com / admin123');
  } else if (admin.role !== 'admin') {
    admin.role = 'admin';
    admin.senha = 'admin123'; // vai hashear no pre-save
    // força re-hash
    admin.markModified('senha');
    await admin.save();
    console.log('👑 Admin atualizado para role admin');
  } else {
    // garante senha admin123 (se mudou)
    const ok = await admin.compararSenha('admin123');
    if (!ok) {
      admin.senha = 'admin123';
      await admin.save();
      console.log('🔑 Senha admin resetada para admin123');
    }
  }
};
