# Gastos - Controle Financeiro Pessoal

Monorepo **Backend + Frontend PWA + App Expo** — Node, Express, MongoDB Atlas, React, Vite, Tailwind, Recharts. **100% offline-first** com cópia local + nuvem.

## Estrutura
```
Gastos/
├── backend/   # API Express + Mongoose (Atlas com fallback mock)
├── frontend/  # Vite + React + PWA offline (IndexedDB queue)
└── mobile/    # Expo React Native + AsyncStorage offline
```

## Quick Start

### 1. Backend (Atlas já configurado)
```bash
cd backend
# .env já com MONGO_URI Atlas darcioliveiradeveloper@cluster0.hxe2xzb
npm run dev # http://localhost:5000/api/health
```

### 2. Frontend PWA (instalável, offline)
```bash
cd frontend
npm run dev # http://localhost:5173
# Celular mesma Wi-Fi: http://SEU_IP:5173 -> Chrome ⋮ > Adicionar à tela inicial
# Offline: adicione lançamentos sem internet -> fila localStorage -> sync auto ao voltar
npm run build # gera dist/ com SW + manifest
```

### 3. Mobile Expo + APK
```bash
cd mobile
npm install # instala @react-native-async-storage/async-storage
npx expo start # QR no Expo Go
# Edite App.js:7 API_URL = http://SEU_IP:5000/api (ipconfig) - 10.0.2.2 para emulador
# Gerar APK:
npm install -g eas-cli
eas login
eas build -p android --profile preview # APK interno compartilhável
# ou local: npx expo prebuild && eas build --local
```

## Funcionalidades
- [x] Etapa 1: Scaffold monorepo + Atlas fix DNS 8.8.8.8
- [x] Etapa 2: Auth JWT, Transações, Investimentos
- [x] Etapa 3: Dashboard filtros mês/ano + evolução 6 meses + Relatórios com CSV/JSON/PDF
- [x] Etapa 4: Offline-first PWA (fila localStorage + sync) + Mobile AsyncStorage + EAS APK

## Armazenamento
- **Nuvem:** MongoDB Atlas `cluster0.hxe2xzb.mongodb.net/gastos`
- **Local:** PWA `localStorage` queue + cache + Mobile `AsyncStorage` + workbox `NetworkFirst`
- **Backup:** Relatórios > Exportar JSON (restauração) / CSV (Excel) / Imprimir PDF

## Gráficos
- Recharts: Pizza por categoria, Barra receita vs despesa, Linha evolução 6 meses
