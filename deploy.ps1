# Deploy helper Windows PowerShell
param([switch]$Backend, [switch]$Frontend, [switch]$All)
if (-not $Backend -and -not $Frontend -and -not $All) { $All = $true }
Write-Host "=== Gastos Deploy ===" -ForegroundColor Cyan

if ($All -or $Backend) {
  Write-Host "`n[Backend] Teste local..." -ForegroundColor Yellow
  Set-Location backend; node --check src/server.js; if(!$?) { Write-Error "backend check falhou"; exit 1 }
  Write-Host "Envie para Render: git push -> Render auto-deploy (rootDir backend)" -ForegroundColor Green
  Write-Host "Ou Docker: docker build -t gastos-backend ./backend && docker run -p 5000:5000 --env-file backend/.env gastos-backend"
  Set-Location ..
}
if ($All -or $Frontend) {
  Write-Host "`n[Frontend] Build..." -ForegroundColor Yellow
  Set-Location frontend; npm run build; if(!$?) { Write-Error "frontend build falhou"; exit 1 }
  Write-Host "Deploy Vercel:" -ForegroundColor Green
  Write-Host "  npx vercel --prod   # dentro de frontend/ (VITE_API_URL env no dashboard Vercel)"
  Write-Host "  ou: vercel --prod --cwd frontend"
  Set-Location ..
}
Write-Host "`nPronto! Configure envs:" -ForegroundColor Cyan
Write-Host "  Render -> MONGO_URI, JWT_SECRET, FRONTEND_URL=https://SEU-APP.vercel.app"
Write-Host "  Vercel -> VITE_API_URL=https://SEU-BACKEND.onrender.com/api"
