# Deploy - Passo a Passo (5 min)

## 1. GitHub
```powershell
cd C:\Users\Darci\Documents\Darci\GitHub\Gastos
git init; git add .; git commit -m "gastos v1"
gh repo create gastos --public --source=. --push
# ou crie manualmente e: git remote add origin https://github.com/SEUUSER/gastos.git; git push -u origin main
```

## 2. Backend no Render (grátis)
1. https://dashboard.render.com -> New + -> Web Service -> Connect `gastos` repo
2. **Root Directory:** `backend` | **Build:** `npm install` | **Start:** `node src/server.js`
3. Env Vars:
   ```
   MONGO_URI=mongodb+srv://darcioliveiradeveloper:Darci.101076@cluster0.hxe2xzb.mongodb.net/gastos?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=gastos_secret_2026_super_seguro_troque_em_producao
   FRONTEND_URL=https://SEU-APP.vercel.app,http://localhost:5173
   PORT=5000
   ```
4. Deploy -> copie URL: `https://gastos-backend-xxxx.onrender.com`

## 3. Frontend no Vercel (grátis)
1. https://vercel.com -> Add New Project -> Import `gastos`
2. **Root Directory:** `frontend` | **Build:** `npm run build` | **Output:** `dist`
3. Env Var: `VITE_API_URL=https://gastos-backend-xxxx.onrender.com/api`
4. Deploy -> URL: `https://gastos-xxxx.vercel.app`

> Teste PWA: acesse Vercel URL no celular -> Chrome ⋮ > Adicionar à tela inicial

## 4. Celular (Expo APK já pronto)
```powershell
cd mobile
# ajuste App.js API_URL para https://gastos-backend-xxxx.onrender.com/api
npx expo start # Expo Go
# APK:
npm i -g eas-cli; eas login; eas build -p android --profile preview
```

## 5. Atualizar mobile após deploy
- Troque `mobile/app.json` `extra.apiUrl` e `App.js` `API_URL` para URL Render.
- Re-build APK ou use OTA: `eas update`.

## Comandos locais
```powershell
.\deploy.ps1 -All        # testa builds
.\deploy.ps1 -Backend    # só backend
.\deploy.ps1 -Frontend   # só frontend
```
