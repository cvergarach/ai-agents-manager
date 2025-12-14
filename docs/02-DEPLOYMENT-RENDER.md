# 🚀 GUÍA DE DEPLOYMENT EN RENDER

## Parte 1: Preparar el Proyecto

### 1. Crear repositorio en GitHub

1. Ve a https://github.com y crea una cuenta si no tienes
2. Click en "New repository"
3. Nombre: `ai-agents-manager`
4. Visibilidad: Private (recomendado) o Public
5. Click "Create repository"

### 2. Subir el código a GitHub

```bash
# En la carpeta raíz del proyecto (ai-agents-manager/)
git init
git add .
git commit -m "Initial commit - AI Agents Manager"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/ai-agents-manager.git
git push -u origin main
```

## Parte 2: Deploy del Backend en Render

### 1. Crear cuenta en Render

1. Ve a https://render.com
2. Click en "Get Started for Free"
3. Conecta tu cuenta de GitHub

### 2. Crear Web Service para el Backend

1. En el dashboard de Render, click "New +"
2. Selecciona "Web Service"
3. Conecta tu repositorio `ai-agents-manager`
4. Configura el servicio:

   **Configuración Básica:**
   - Name: `ai-agents-backend`
   - Region: Oregon (US West) o la más cercana
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

   **Plan:**
   - Selecciona "Free" (puedes actualizar después)

5. Click en "Advanced" y agrega las variables de entorno:

   ```
   PORT=3000
   NODE_ENV=production
   FRONTEND_URL=https://TU-FRONTEND.onrender.com
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_SERVICE_KEY=tu-service-role-key
   ANTHROPIC_API_KEY=tu-api-key-de-claude
   OPENAI_API_KEY=tu-api-key-de-openai
   GOOGLE_API_KEY=tu-api-key-de-google
   ```

   ⚠️ **IMPORTANTE**: 
   - Obtén estas keys de:
     - Anthropic: https://console.anthropic.com/
     - OpenAI: https://platform.openai.com/api-keys
     - Google: https://makersuite.google.com/app/apikey

6. Click "Create Web Service"
7. Espera a que termine el deploy (5-10 minutos)
8. **Copia la URL** que te dan (algo como: `https://ai-agents-backend.onrender.com`)

## Parte 3: Deploy del Frontend en Render

### 1. Crear Web Service para el Frontend

1. En Render, click "New +" → "Web Service"
2. Selecciona el mismo repositorio
3. Configura:

   **Configuración Básica:**
   - Name: `ai-agents-frontend`
   - Region: La misma que el backend
   - Branch: `main`
   - Root Directory: `frontend`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s dist -l $PORT`

   **Plan:**
   - Free

4. Variables de entorno:

   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key (NO el service key)
   VITE_API_URL=https://TU-BACKEND.onrender.com
   ```

5. Click "Create Web Service"
6. Espera al deploy

## Parte 4: Configurar Supabase para Production

### 1. Actualizar redirect URLs en Supabase

1. Ve a tu proyecto en Supabase
2. **Authentication** → **URL Configuration**
3. En "Redirect URLs" agrega:
   ```
   https://TU-FRONTEND.onrender.com
   https://TU-FRONTEND.onrender.com/**
   ```
4. Click "Save"

### 2. Actualizar Google OAuth

1. Ve a Google Cloud Console
2. Tus credenciales OAuth
3. En "Authorized redirect URIs" asegúrate de tener:
   ```
   https://TU_PROJECT_ID.supabase.co/auth/v1/callback
   ```

## Parte 5: Actualizar CORS en el Backend

Necesitas actualizar la URL del frontend en el backend que ya está desplegado:

1. En Render, ve a tu servicio `ai-agents-backend`
2. Click en "Environment"
3. Actualiza `FRONTEND_URL` con la URL real del frontend
4. Click "Save Changes" (se redesplegará automáticamente)

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando en:
- Frontend: `https://TU-FRONTEND.onrender.com`
- Backend: `https://TU-BACKEND.onrender.com`

## ⚠️ Notas Importantes

### Limitaciones del Plan Free de Render:

1. **Los servicios se "duermen" después de 15 minutos sin uso**
   - La primera petición después de dormir puede tardar 30-50 segundos
   - Para evitarlo, considera el plan pagado ($7/mes por servicio)

2. **750 horas gratis al mes**
   - Suficiente para un servicio 24/7
   - Si tienes 2 servicios (frontend + backend), se comparten

3. **Para mantener activo tu backend gratis:**
   - Usa un servicio como UptimeRobot (https://uptimerobot.com)
   - Configura un ping cada 14 minutos a tu backend
   - Endpoint: `https://TU-BACKEND.onrender.com/health`

### Costos de las APIs:

- **Anthropic (Claude)**: ~$3 por 1M tokens de entrada
- **OpenAI (GPT-4)**: ~$30 por 1M tokens de entrada
- **Google (Gemini)**: Gratis hasta cierto límite, luego ~$1.25 por 1M tokens

**Recomendación**: Empieza con límites de uso bajos en cada API para controlar costos.

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

Render detectará los cambios y redesplegará automáticamente.

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- Verifica que `SUPABASE_SERVICE_KEY` esté correcta
- Asegúrate de usar el service role key, no el anon key

### Error: "CORS policy"
- Verifica que `FRONTEND_URL` en el backend apunte a la URL correcta
- Incluye https:// en la URL

### Error al hacer login con Google
- Verifica los redirect URIs en Google OAuth
- Verifica los redirect URIs en Supabase Authentication

### El backend está lento
- Es normal en el plan free después de inactividad
- La primera petición "despierta" el servicio
