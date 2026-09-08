# AppGastos - Controle Financeiro Pessoal v1.1.0

Monorepo **Backend + Frontend PWA + App Expo** — Node, Express, MongoDB Atlas, React, Vite, Tailwind, Recharts. **100% offline-first** com cópia local + nuvem.

**Deploy:** Backend `https://gastos-backend-kdfi.onrender.com` | Frontend `https://appgastos-gamma.vercel.app/` | Repo `https://github.com/darcioliveiradeveloper/appgastos`

## Estrutura
```
Gastos/
├── backend/   # API Express + Mongoose (Atlas)
├── frontend/  # Vite + React + PWA offline (IndexedDB queue)
└── mobile/    # Expo React Native + AsyncStorage offline
```

## Quick Start
```bash
cd backend && npm run dev # http://localhost:5000/api/health
cd frontend && npm run dev # http://localhost:5173
cd mobile && npx expo start # Expo Go
```

## Funcionalidades v1.1.0
- [x] Auth JWT + Códigos de ativação `APP-XXXX-XXXX` + Master `admin@appgastos.com`
- [x] Header VendaCerta azul (5 ícones: editar nome, trocar senha, paleta 5 cores, sair, info) + data pill
- [x] Bem-vindo sem barra, Login estilo VendaCerta com versão, Dashboard padrão max-w-6xl sem scroll
- [x] Receitas / Despesas / Cartão / Investimentos / Relatórios + Offline + PWA

## Histórico de Versões
| Versão | Data | Notas |
|--------|------|-------|
| **v1.1.0** | Set 2026 | Header azul VendaCerta, paleta 5 cores, editar nome/senha, Welcome/Login sem barra, máscara código, menu padrão |
| v1.0.0 | Set 2026 | Lançamento: scaffold, Atlas, JWT, Dashboard, Relatórios CSV/JSON, offline, APK |

## Armazenamento
- **Nuvem:** MongoDB Atlas `cluster0.hxe2xzb.mongodb.net/gastos`
- **Local:** PWA `localStorage` + Mobile `AsyncStorage` + Workbox
- **Master:** `admin@appgastos.com` / `admin123` → gera códigos em 👑 Master

## Deploy
- Render: `render.yaml` Root `backend` | Vercel: Root `frontend` `VITE_API_URL=https://gastos-backend-kdfi.onrender.com/api`
