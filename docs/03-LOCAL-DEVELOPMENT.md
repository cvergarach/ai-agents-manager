# 💻 GUÍA DE DESARROLLO LOCAL

Esta guía te ayudará a ejecutar el proyecto en tu computadora local.

## Requisitos Previos

1. **Node.js 18 o superior**
   - Descargar de: https://nodejs.org/
   - Verificar instalación: `node --version`

2. **npm** (viene con Node.js)
   - Verificar: `npm --version`

3. **Git**
   - Descargar de: https://git-scm.com/
   - Verificar: `git --version`

## Paso 1: Configurar Supabase

Sigue la guía completa en `docs/01-SUPABASE-SETUP.md`

Resumen rápido:
1. Crear proyecto en https://supabase.com
2. Configurar Google OAuth
3. Ejecutar el SQL schema
4. Guardar las credenciales (URL y keys)

## Paso 2: Obtener API Keys de los Modelos de IA

### Claude (Anthropic)

1. Ve a https://console.anthropic.com/
2. Regístrate o inicia sesión
3. Ve a "API Keys"
4. Click "Create Key"
5. Copia la clave (empieza con `sk-ant-`)

**Créditos**: Anthropic da $5 gratis para empezar

### GPT-4 (OpenAI)

1. Ve a https://platform.openai.com/
2. Regístrate o inicia sesión
3. Ve a "API keys"
4. Click "Create new secret key"
5. Copia la clave (empieza con `sk-proj-` o `sk-`)

**Créditos**: OpenAI da $5 gratis para nuevas cuentas

### Gemini (Google)

1. Ve a https://makersuite.google.com/app/apikey
2. Inicia sesión con tu cuenta de Google
3. Click "Create API key"
4. Copia la clave (empieza con `AIzaSy`)

**Créditos**: Google tiene un tier gratuito generoso

## Paso 3: Configurar el Backend

```bash
# 1. Navega a la carpeta backend
cd backend

# 2. Instala las dependencias
npm install

# 3. Crea el archivo .env (copia del ejemplo)
cp .env.example .env

# 4. Edita el archivo .env con tus credenciales
# Usa tu editor favorito (VS Code, nano, vim, etc.)
nano .env
```

Completa el archivo `.env` con tus valores:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...tu-service-key...

ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
OPENAI_API_KEY=sk-proj-xxxxx
GOOGLE_API_KEY=AIzaSyxxxxx
```

**⚠️ IMPORTANTE**: Usa el `SUPABASE_SERVICE_KEY`, NO el anon key

```bash
# 5. Inicia el servidor
npm run dev
```

Deberías ver:
```
╔══════════════════════════════════════════╗
║   🚀 AI Agents Backend                   ║
║   Puerto: 3000                           ║
║   Entorno: development                   ║
╚══════════════════════════════════════════╝
```

## Paso 4: Configurar el Frontend

**Abre una NUEVA terminal** (deja el backend corriendo):

```bash
# 1. Navega a la carpeta frontend
cd frontend

# 2. Instala las dependencias
npm install

# 3. Crea el archivo .env
cp .env.example .env

# 4. Edita el archivo .env
nano .env
```

Completa con:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...tu-anon-key...
VITE_API_URL=http://localhost:3000
```

**⚠️ IMPORTANTE**: Aquí SÍ usa el `SUPABASE_ANON_KEY`, NO el service key

```bash
# 5. Inicia el servidor de desarrollo
npm run dev
```

Deberías ver:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Paso 5: Probar la Aplicación

1. Abre tu navegador en `http://localhost:5173`
2. Deberías ver la pantalla de login
3. Click en "Continuar con Google"
4. Inicia sesión con tu cuenta de Google
5. Te redirigirá al dashboard

## Estructura del Proyecto

```
ai-agents-manager/
├── backend/                    # API del servidor
│   ├── server.js              # Servidor Express
│   ├── package.json
│   ├── .env                   # Configuración (no subir a git)
│   └── .env.example
│
├── frontend/                   # Aplicación React
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── pages/             # Páginas principales
│   │   ├── lib/               # Utilidades (API, Supabase)
│   │   ├── styles/            # CSS
│   │   ├── App.jsx            # Componente raíz
│   │   └── main.jsx           # Punto de entrada
│   ├── package.json
│   ├── .env
│   └── index.html
│
├── docs/                       # Documentación
│   ├── 01-SUPABASE-SETUP.md
│   ├── 02-DEPLOYMENT-RENDER.md
│   └── 03-LOCAL-DEVELOPMENT.md
│
└── supabase/
    └── schema.sql              # Schema de la base de datos
```

## Scripts Disponibles

### Backend
```bash
npm start       # Iniciar en producción
npm run dev     # Iniciar con nodemon (auto-reload)
```

### Frontend
```bash
npm run dev     # Servidor de desarrollo
npm run build   # Build para producción
npm run preview # Preview del build
```

## Flujo de Trabajo de Desarrollo

1. **Hacer cambios en el código**
   - Los cambios se reflejan automáticamente (hot reload)

2. **Probar en el navegador**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

3. **Ver logs**
   - Backend: En la terminal donde corre `npm run dev`
   - Frontend: En la consola del navegador (F12)

## Comandos Útiles

### Ver logs del backend
```bash
# Ya están visibles en la terminal
# Para ver más detalles, puedes agregar console.log() en server.js
```

### Limpiar e reinstalar dependencias
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Verificar que el backend responde
```bash
curl http://localhost:3000/health
# Debería responder: {"status":"ok"...}
```

## Troubleshooting

### Error: "EADDRINUSE :::3000"
- El puerto 3000 ya está en uso
- Soluciones:
  - Detén el proceso que usa el puerto
  - Cambia el puerto en `.env` a 3001

### Error: "Cannot connect to Supabase"
- Verifica que las URLs y keys sean correctas
- Asegúrate de no tener espacios extra en el .env

### Error: "Module not found"
- Ejecuta `npm install` nuevamente
- Verifica que estés en la carpeta correcta

### El login con Google no funciona
- Verifica que tengas los redirect URIs configurados
- En desarrollo, usa: `http://localhost:5173`

### Los cambios no se reflejan
- Verifica que el servidor esté corriendo
- Intenta refrescar el navegador (Ctrl + R)
- Si sigue sin funcionar, detén y reinicia el servidor

## Tips para Desarrollo

1. **Usa VS Code**
   - Tiene excelente soporte para React y Node.js
   - Extensiones recomendadas:
     - ES7+ React/Redux/React-Native snippets
     - ESLint
     - Prettier

2. **Mantén las terminales organizadas**
   - Terminal 1: Backend (`cd backend && npm run dev`)
   - Terminal 2: Frontend (`cd frontend && npm run dev`)

3. **Revisa la consola del navegador**
   - Presiona F12 para ver errores de JavaScript
   - La pestaña Network muestra peticiones al backend

4. **Git commits frecuentes**
   ```bash
   git add .
   git commit -m "Descripción del cambio"
   ```

## Próximos Pasos

Una vez que tengas todo funcionando localmente:

1. ✅ Crea tu primer agente
2. ✅ Prueba chatear con diferentes modelos
3. ✅ Experimenta con diferentes prompts del sistema
4. 📚 Lee la guía de deployment: `docs/02-DEPLOYMENT-RENDER.md`

## Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de React](https://react.dev)
- [Documentación de Express](https://expressjs.com)
- [API de Anthropic](https://docs.anthropic.com)
- [API de OpenAI](https://platform.openai.com/docs)
- [API de Google Gemini](https://ai.google.dev/docs)
