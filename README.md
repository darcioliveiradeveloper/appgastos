# AppGastos - Controle Financeiro Pessoal v1.2.0

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
cd frontend && npm run dev # http://localhost:5173 -> http://192.168.3.20:5173 no celular
cd mobile && npx expo start # Expo Go
```

## Funcionalidades v1.2.0
- [x] Auth JWT + Códigos `APP-XXXX-XXXX` + Master `admin@appgastos.com` / `admin123`
- [x] Header VendaCerta azul + 5 ícones (editar nome, trocar senha, paleta 5 cores, sair→/, info v1.2.0) + data pill dentro do header
- [x] Bem-vindo sem barra, Login sem barra (Entrar+Sair), Dashboard/Receitas/Despesas/Cartão/Invest/Relatórios padronizados `max-w-6xl`, `CardPadrao`, `gap-2`, sem scroll
- [x] PWA `start_url: /` (abre na Welcome), `theme #1e1b4b` azul, offline + Atlas

## Histórico de Versões
| Versão | Data | Notas |
|--------|------|-------|
| **v1.2.0** | Set 2026 | Layouts padronizados Dashboard→Relatórios, Welcome/Login sem barra, azul padrão, distância header→menu e entre cards padronizada |
| v1.1.0 | Set 2026 | Header azul, paleta 5 cores, editar nome/senha, Welcome/Login sem barra, máscara código |
| v1.0.0 | Set 2026 | Lançamento: scaffold, Atlas, JWT, Dashboard, CSV/JSON, offline, APK |

## Armazenamento
- **Nuvem:** MongoDB Atlas `cluster0.hxe2xzb.mongodb.net/gastos`
- **Local:** PWA `localStorage` + Mobile `AsyncStorage` + Workbox
- **Master:** `admin@appgastos.com` / `admin123` → 👑 Master gera códigos

## Deploy
- Render: `render.yaml` Root `backend` | Vercel: Root `frontend` `VITE_API_URL=https://gastos-backend-kdfi.onrender.com/api`
