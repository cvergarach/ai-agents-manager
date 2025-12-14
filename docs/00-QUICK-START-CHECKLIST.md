# ✅ CHECKLIST: De Cero a Producción en 1 Hora

Sigue estos pasos en orden para tener tu aplicación funcionando.

## Paso 1: Obtener API Keys (15 minutos)

### ☐ Supabase
1. [ ] Ir a https://supabase.com
2. [ ] Crear cuenta
3. [ ] Crear proyecto "ai-agents-system"
4. [ ] Guardar:
   - [ ] Project URL: `https://xxxxx.supabase.co`
   - [ ] anon key
   - [ ] service_role key

### ☐ Anthropic (Claude)
1. [ ] Ir a https://console.anthropic.com/
2. [ ] Crear cuenta
3. [ ] Crear API Key
4. [ ] Guardar: `sk-ant-xxxxx`

### ☐ OpenAI (GPT-4)
1. [ ] Ir a https://platform.openai.com/
2. [ ] Crear cuenta
3. [ ] Crear API Key
4. [ ] Guardar: `sk-proj-xxxxx`

### ☐ Google (Gemini)
1. [ ] Ir a https://makersuite.google.com/app/apikey
2. [ ] Iniciar sesión con Google
3. [ ] Crear API Key
4. [ ] Guardar: `AIzaSyxxxxx`

### ☐ Google OAuth (para login)
1. [ ] Ir a https://console.cloud.google.com
2. [ ] Crear proyecto
3. [ ] Configurar OAuth consent screen
4. [ ] Crear credenciales OAuth 2.0
5. [ ] Guardar: Client ID y Client Secret

## Paso 2: Configurar Supabase (10 minutos)

1. [ ] En Supabase, ir a SQL Editor
2. [ ] Ejecutar el script de `supabase/schema.sql`
3. [ ] Ir a Authentication > Providers
4. [ ] Habilitar Google
5. [ ] Pegar Client ID y Client Secret
6. [ ] En URL Configuration, agregar: `http://localhost:5173`

## Paso 3: Setup Local (10 minutos)

### ☐ Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus keys
npm run dev
```

### ☐ Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Editar .env con tus keys
npm run dev
```

## Paso 4: Probar Localmente (5 minutos)

1. [ ] Abrir http://localhost:5173
2. [ ] Login con Google
3. [ ] Crear un agente de prueba
4. [ ] Chatear con el agente
5. [ ] ✅ Todo funciona

## Paso 5: Deploy en Render (20 minutos)

### ☐ GitHub
1. [ ] Crear repositorio en GitHub
2. [ ] Subir código:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/ai-agents-manager.git
git push -u origin main
```

### ☐ Backend en Render
1. [ ] Crear cuenta en https://render.com
2. [ ] New + > Web Service
3. [ ] Conectar repositorio
4. [ ] Configurar:
   - Name: `ai-agents-backend`
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
5. [ ] Agregar variables de entorno
6. [ ] Deploy
7. [ ] Guardar URL: `https://xxxxx.onrender.com`

### ☐ Frontend en Render
1. [ ] New + > Web Service
2. [ ] Mismo repositorio
3. [ ] Configurar:
   - Name: `ai-agents-frontend`
   - Root Directory: `frontend`
   - Build: `npm install && npm run build`
   - Start: `npx serve -s dist -l $PORT`
4. [ ] Agregar variables de entorno (usar URL del backend)
5. [ ] Deploy
6. [ ] Guardar URL: `https://xxxxx.onrender.com`

### ☐ Configuración Final
1. [ ] Actualizar FRONTEND_URL en backend (Render)
2. [ ] Actualizar Redirect URLs en Supabase (ambas URLs de Render)
3. [ ] Actualizar Redirect URIs en Google OAuth Console

## ✅ ¡Completado!

Tu app está en producción en:
- Frontend: https://TU-FRONTEND.onrender.com
- Backend: https://TU-BACKEND.onrender.com

## 🎯 Próximos Pasos

- [ ] Invitar a amigos a probar
- [ ] Crear agentes personalizados
- [ ] Experimentar con diferentes modelos
- [ ] Agregar nuevas funcionalidades

## 📌 Información Importante

### URLs a Guardar
- Supabase URL: ___________________________
- Backend URL: ___________________________
- Frontend URL: ___________________________

### Costos Mensuales Estimados
- Supabase: **$0** (tier gratis)
- Render: **$0** (tier gratis, con sleep)
- APIs de IA: **~$0-5** (solo pagas lo que uses)

### Limitaciones Tier Gratis
- ⚠️ Backend se duerme tras 15 min de inactividad
- ⏱️ Primera request puede tardar 30-50 segundos
- 💡 Solución: Usar UptimeRobot para ping cada 14 min

## 🆘 Ayuda Rápida

### Backend no responde
```bash
# Verificar health check
curl https://TU-BACKEND.onrender.com/health
```

### Error de CORS
- Revisar FRONTEND_URL en variables de entorno del backend

### Login de Google falla
- Revisar redirect URIs en Google Console y Supabase

### Error de API Key
- Verificar que las keys no tengan espacios
- Regenerar key si es necesario

---

**Tiempo total estimado: ~1 hora**

¿Problemas? Revisa las guías detalladas en `/docs`
