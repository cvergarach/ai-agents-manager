# 🤖 AI Agents Manager

Sistema completo de gestión de agentes de IA personalizados con soporte para **Claude**, **GPT-4** y **Gemini**. Crea agentes con personalidades y comportamientos únicos, y chatea con ellos usando diferentes modelos de IA.

![Stack](https://img.shields.io/badge/React-18-blue)
![Stack](https://img.shields.io/badge/Node.js-18+-green)
![Stack](https://img.shields.io/badge/Supabase-Database-orange)
![Stack](https://img.shields.io/badge/Render-Deployment-purple)

## ✨ Características

- 🔐 **Autenticación con Google** usando Supabase Auth
- 🤖 **Múltiples Modelos de IA**: Claude 3.5 Sonnet, GPT-4, Gemini Pro
- 👥 **Agentes Personalizados**: Crea agentes con comportamientos únicos
- 💬 **Chat en Tiempo Real** con tus agentes
- 📊 **Dashboard Intuitivo** para gestionar tus agentes
- 🎨 **UI Moderna** con animaciones y diseño responsivo
- 🔒 **Seguridad**: Row Level Security en Supabase
- ☁️ **Deploy Fácil**: Listo para Render

## 🎯 ¿Para Qué Sirve Este Proyecto?

Este es un **proyecto fundacional** perfecto para:

1. ✅ **Aprender arquitectura Full-Stack moderna**
   - Frontend (React + Vite)
   - Backend (Node.js + Express)
   - Base de datos (PostgreSQL con Supabase)

2. ✅ **Integrar múltiples APIs de IA**
   - Anthropic (Claude)
   - OpenAI (GPT)
   - Google (Gemini)

3. ✅ **Base para proyectos futuros**
   - Sistema de usuarios con autenticación
   - CRUD completo
   - Chat en tiempo real
   - Arquitectura escalable

## 🏗️ Arquitectura

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │ ───> │   Backend   │ ───> │  Supabase   │
│  (React)    │ <─── │  (Express)  │ <─── │ (PostgreSQL)│
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ├────> Anthropic API (Claude)
                            ├────> OpenAI API (GPT-4)
                            └────> Google AI (Gemini)
```

## 📁 Estructura del Proyecto

```
ai-agents-manager/
├── backend/                 # API del servidor
│   ├── server.js           # Servidor Express
│   ├── package.json
│   └── .env.example        # Plantilla de configuración
│
├── frontend/                # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes UI
│   │   │   ├── Auth.jsx
│   │   │   ├── AgentCard.jsx
│   │   │   ├── AgentForm.jsx
│   │   │   └── Chat.jsx
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   ├── lib/            # Utilidades
│   │   │   ├── supabase.js
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── App.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
│
├── supabase/
│   └── schema.sql          # Schema de la base de datos
│
└── docs/                    # Documentación
    ├── 01-SUPABASE-SETUP.md
    ├── 02-DEPLOYMENT-RENDER.md
    └── 03-LOCAL-DEVELOPMENT.md
```

## 🚀 Inicio Rápido

### Opción 1: Desarrollo Local

```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/ai-agents-manager.git
cd ai-agents-manager

# 2. Configura Supabase
# Sigue: docs/01-SUPABASE-SETUP.md

# 3. Configura el Backend
cd backend
npm install
cp .env.example .env
# Edita .env con tus credenciales
npm run dev

# 4. Configura el Frontend (en otra terminal)
cd frontend
npm install
cp .env.example .env
# Edita .env con tus credenciales
npm run dev

# 5. Abre http://localhost:5173
```

📖 **Guía completa**: `docs/03-LOCAL-DEVELOPMENT.md`

### Opción 2: Deploy en Render

1. Crea proyecto en Supabase
2. Sube el código a GitHub
3. Deploy en Render (Frontend + Backend)

📖 **Guía completa**: `docs/02-DEPLOYMENT-RENDER.md`

## 📚 Documentación

| Guía | Descripción |
|------|-------------|
| [01-SUPABASE-SETUP.md](docs/01-SUPABASE-SETUP.md) | Configurar base de datos y autenticación |
| [02-DEPLOYMENT-RENDER.md](docs/02-DEPLOYMENT-RENDER.md) | Deploy en producción |
| [03-LOCAL-DEVELOPMENT.md](docs/03-LOCAL-DEVELOPMENT.md) | Desarrollo local paso a paso |

## 🔑 Variables de Entorno Necesarias

### Backend (.env)
```env
PORT=3000
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=tu-service-key
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-proj-xxxxx
GOOGLE_API_KEY=AIzaSyxxxxx
```

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_API_URL=http://localhost:3000
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Framework UI
- **Vite** - Build tool
- **Supabase Client** - Autenticación y Database
- **Lucide React** - Iconos

### Backend
- **Node.js 18+** - Runtime
- **Express** - Web framework
- **Supabase** - Base de datos y autenticación
- **Anthropic SDK** - Claude API
- **OpenAI SDK** - GPT API
- **Google Generative AI** - Gemini API

### Database
- **PostgreSQL** (via Supabase)
- **Row Level Security** - Seguridad a nivel de fila

## 🎨 Capturas de Pantalla

### Login
![Login](https://via.placeholder.com/800x400?text=Login+Screen)

### Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+View)

### Chat
![Chat](https://via.placeholder.com/800x400?text=Chat+Interface)

## 🔐 Seguridad

- ✅ Row Level Security (RLS) en todas las tablas
- ✅ API Keys nunca expuestas en el frontend
- ✅ Autenticación OAuth con Google
- ✅ Tokens JWT manejados por Supabase
- ✅ Validación en backend

## 💡 Casos de Uso

### 1. Asistente de Marketing
```javascript
{
  name: "Marketing Expert",
  model: "claude-3-5-sonnet-20241022",
  system_prompt: "Eres un experto en marketing digital especializado en estrategias de contenido para redes sociales..."
}
```

### 2. Code Reviewer
```javascript
{
  name: "Code Reviewer",
  model: "gpt-4",
  system_prompt: "Eres un senior developer experto en code review. Analiza código y proporciona feedback constructivo..."
}
```

### 3. Creative Writer
```javascript
{
  name: "Story Teller",
  model: "gemini-pro",
  system_prompt: "Eres un escritor creativo que ayuda a desarrollar historias y personajes..."
}
```

## 📊 Costos Estimados

### APIs de IA (Pay-as-you-go)

| Modelo | Precio Entrada | Precio Salida | Créditos Gratis |
|--------|----------------|---------------|-----------------|
| Claude 3.5 Sonnet | $3/1M tokens | $15/1M tokens | $5 iniciales |
| GPT-4 | $30/1M tokens | $60/1M tokens | $5 iniciales |
| Gemini Pro | $1.25/1M tokens | $5/1M tokens | Tier gratis generoso |

### Hosting

- **Supabase**: Gratis hasta 500MB DB, 50,000 usuarios
- **Render**: 
  - Free: 750 horas/mes por servicio
  - Paid: $7/mes por servicio (siempre activo)

**Estimado para uso personal**: ~$0-5/mes

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! 

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la [MIT License](LICENSE).

## 🆘 Soporte

¿Tienes problemas? 

1. 📖 Revisa la [documentación](docs/)
2. 🐛 Abre un [issue](https://github.com/tu-usuario/ai-agents-manager/issues)
3. 💬 Pregunta en [Discussions](https://github.com/tu-usuario/ai-agents-manager/discussions)

## 🎓 Aprende Más

### Recursos Recomendados

- [React Docs](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Express Guide](https://expressjs.com/en/guide/routing.html)
- [Anthropic API](https://docs.anthropic.com)
- [OpenAI API](https://platform.openai.com/docs)
- [Google AI](https://ai.google.dev/docs)

## ⭐ Star History

Si este proyecto te ayuda, ¡dale una estrella! ⭐

---

**Hecho con ❤️ usando React, Node.js, y múltiples APIs de IA**
