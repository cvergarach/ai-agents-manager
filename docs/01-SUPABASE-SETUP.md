# 🗄️ CONFIGURACIÓN DE SUPABASE - GUÍA PASO A PASO

## Paso 1: Crear Proyecto en Supabase

1. Ve a https://supabase.com
2. Crea una cuenta o inicia sesión
3. Click en "New Project"
4. Completa:
   - Name: `ai-agents-system`
   - Database Password: (guárdala, la necesitarás)
   - Region: Elige la más cercana a ti
5. Click "Create new project" (tarda ~2 minutos)

## Paso 2: Configurar Autenticación con Google

1. En tu proyecto de Supabase, ve a **Authentication** > **Providers**
2. Busca **Google** y habilítalo
3. Necesitas configurar Google OAuth:

### Configurar Google OAuth Console:

1. Ve a https://console.cloud.google.com
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Si es la primera vez, configura la pantalla de consentimiento:
   - User Type: External
   - App name: "AI Agents Manager"
   - User support email: tu email
   - Developer contact: tu email
   - Save and continue hasta el final
6. Ahora crea las credenciales OAuth:
   - Application type: **Web application**
   - Name: "AI Agents App"
   - Authorized redirect URIs: 
     - Copia desde Supabase: `https://TU_PROJECT_ID.supabase.co/auth/v1/callback`
     - Ejemplo: `https://abcdefghijk.supabase.co/auth/v1/callback`
7. Copia el **Client ID** y **Client Secret**

### Volver a Supabase:

1. Pega el **Client ID** de Google
2. Pega el **Client Secret** de Google
3. Click **Save**

## Paso 3: Crear las Tablas en la Base de Datos

1. En Supabase, ve a **SQL Editor**
2. Click **New query**
3. Copia y pega el siguiente SQL:

```sql
-- ============================================
-- SCHEMA PARA SISTEMA DE AGENTES DE IA
-- ============================================

-- Tabla de agentes
CREATE TABLE agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  model TEXT NOT NULL CHECK (model IN ('claude-3-5-sonnet-20241022', 'gpt-4', 'gemini-pro')),
  temperature DECIMAL(2,1) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de conversaciones
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'Nueva conversación',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de mensajes
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_conversations_agent_id ON conversations(agent_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas para AGENTS
CREATE POLICY "Users can view own agents"
  ON agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own agents"
  ON agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agents"
  ON agents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own agents"
  ON agents FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para CONVERSATIONS
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para MESSAGES
CREATE POLICY "Users can view messages from own conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

4. Click **Run** (botón abajo a la derecha)
5. Deberías ver el mensaje "Success. No rows returned"

## Paso 4: Obtener las Credenciales

1. Ve a **Project Settings** (icono de engranaje en la barra lateral)
2. Click en **API**
3. Guarda estos valores (los necesitarás en el .env):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: La clave que dice "anon" "public"
   - **service_role**: La clave que dice "service_role" (⚠️ NUNCA la pongas en el frontend)

## ✅ Verificación

Para verificar que todo está bien:
1. Ve a **Table Editor**
2. Deberías ver las tablas: `agents`, `conversations`, `messages`
3. Ve a **Authentication** > **Providers**
4. Google debería aparecer como "Enabled"

## 🎉 ¡Listo!

Tu base de datos está configurada. Ahora pasemos al Backend.
