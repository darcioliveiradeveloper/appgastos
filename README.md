# AppGastos - Controle Financeiro Pessoal v1.4.0

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

## Funcionalidades v1.4.0
- [x] Auth JWT + Códigos `APP-XXXX-XXXX` + Master `admin@appgastos.com` / `admin123`
- [x] Header azul VendaCerta + 5 ícones + paleta 5 cores + data pill
- [x] Dashboard: KPIs com data, 2 pizzas com % e quadrado, barra com saldo (X/Y), evolução com período e valores nos pontos
- [x] PWA `start_url: /` (Welcome), sem scroll, max-w-6xl padrão

## Histórico de Versões
| Versão | Data | Notas |
|--------|------|-------|
| **v1.4.0** | Set 2026 | Dashboard títulos, pizzas, barras, evolução, header/menu ajustes |
| v1.3.0 | Set 2026 | Fix datas, 2 pizzas, barra com saldo, evolução período, Cartão limites |
| v1.2.0 | Set 2026 | Layouts padronizados, Welcome/Login sem barra, azul padrão |
| v1.1.0 | Set 2026 | Header azul, paleta 5 cores, editar nome/senha |
| v1.0.0 | Set 2026 | Lançamento: scaffold, Atlas, JWT, offline, PWA |

## Armazenamento
- **Nuvem:** MongoDB Atlas `cluster0.hxe2xzb.mongodb.net/gastos`
- **Local:** PWA `localStorage` + Mobile `AsyncStorage` + Workbox
- **Master:** `admin@appgastos.com` / `admin123` → 👑 Master gera códigos

## Deploy
- Render: `render.yaml` Root `backend` | Vercel: Root `frontend` `VITE_API_URL=https://gastos-backend-kdfi.onrender.com/api`
