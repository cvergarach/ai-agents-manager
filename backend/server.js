import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import https from 'https';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// CONFIGURACIÓN DE CLIENTES
// ============================================

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Usamos service key para el backend
);

// Anthropic (Claude)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// OpenAI (GPT-4)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Google (Gemini)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors({
  origin: [
    'https://ai-agents-frontend-qwdn.onrender.com',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ AGREGAR ESTAS LÍNEAS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de autenticación
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const token = authHeader.substring(7);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401).json({ error: 'Error de autenticación' });
  }
};

// ============================================
// RUTAS DE SALUD
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// RUTAS DE AGENTES (CRUD)
// ============================================

// Obtener todos los agentes del usuario
app.get('/api/agents', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error al obtener agentes:', error);
    res.status(500).json({ error: 'Error al obtener agentes' });
  }
});

// Obtener un agente específico
app.get('/api/agents/:id', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Agente no encontrado' });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error al obtener agente:', error);
    res.status(500).json({ error: 'Error al obtener agente' });
  }
});

// Crear un nuevo agente
app.post('/api/agents', authenticateUser, async (req, res) => {
  try {
    const { name, description, system_prompt, model, temperature, max_tokens } = req.body;

    if (!name || !system_prompt || !model) {
      return res.status(400).json({
        error: 'El nombre, prompt del sistema y modelo son obligatorios'
      });
    }

    // Validar que el modelo sea válido
    const validModels = ['claude-3-5-sonnet-20241022', 'gpt-4', 'gemini-2.5-flash'];
    if (!validModels.includes(model)) {
      return res.status(400).json({
        error: `Modelo inválido. Debe ser uno de: ${validModels.join(', ')}`
      });
    }

    const { data, error } = await supabase
      .from('agents')
      .insert([
        {
          user_id: req.user.id,
          name,
          description: description || '',
          system_prompt,
          model,
          temperature: temperature || 0.7,
          max_tokens: max_tokens || 1000,
          is_active: true
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error al crear agente:', error);
    res.status(500).json({ error: 'Error al crear agente' });
  }
});

// Actualizar un agente
app.put('/api/agents/:id', authenticateUser, async (req, res) => {
  try {
    const { name, description, system_prompt, model, temperature, max_tokens, is_active } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (system_prompt !== undefined) updateData.system_prompt = system_prompt;
    if (model !== undefined) updateData.model = model;
    if (temperature !== undefined) updateData.temperature = temperature;
    if (max_tokens !== undefined) updateData.max_tokens = max_tokens;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from('agents')
      .update(updateData)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Agente no encontrado' });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error al actualizar agente:', error);
    res.status(500).json({ error: 'Error al actualizar agente' });
  }
});

// Eliminar un agente
app.delete('/api/agents/:id', authenticateUser, async (req, res) => {
  try {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Agente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar agente:', error);
    res.status(500).json({ error: 'Error al eliminar agente' });
  }
});

// ============================================
// RUTAS DE CHAT
// ============================================

// Chatear con un agente
app.post('/api/chat', authenticateUser, async (req, res) => {
  try {
    const { agent_id, message, conversation_id } = req.body;

    if (!agent_id || !message) {
      return res.status(400).json({ error: 'agent_id y message son obligatorios' });
    }

    // Obtener el agente
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agent_id)
      .eq('user_id', req.user.id)
      .single();

    if (agentError || !agent) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }

    // Crear o usar conversación existente
    let convId = conversation_id;
    if (!convId) {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert([{
          agent_id,
          user_id: req.user.id,
          title: message.substring(0, 50) + '...'
        }])
        .select()
        .single();

      if (convError) throw convError;
      convId = newConv.id;
    }

    // Guardar mensaje del usuario
    await supabase
      .from('messages')
      .insert([{
        conversation_id: convId,
        role: 'user',
        content: message
      }]);

    // Obtener historial de la conversación
    const { data: history } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    // Generar respuesta según el modelo
    let aiResponse = '';

    if (agent.model === 'claude-3-5-sonnet-20241022') {
      // Claude
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: agent.max_tokens,
        temperature: agent.temperature,
        system: agent.system_prompt,
        messages: history.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });
      aiResponse = response.content[0].text;

    } else if (agent.model === 'gpt-4') {
      // GPT-4
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        max_tokens: agent.max_tokens,
        temperature: agent.temperature,
        messages: [
          { role: 'system', content: agent.system_prompt },
          ...history.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ]
      });
      aiResponse = response.choices[0].message.content;

    } else if (agent.model === 'gemini-2.5-flash') {
      // Gemini
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      // Gemini necesita formato diferente
      const chat = model.startChat({
        history: history.slice(0, -1).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          maxOutputTokens: agent.max_tokens,
          temperature: agent.temperature,
        },
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      aiResponse = response.text();
    }

    // Guardar respuesta del asistente
    await supabase
      .from('messages')
      .insert([{
        conversation_id: convId,
        role: 'assistant',
        content: aiResponse
      }]);

    res.json({
      conversation_id: convId,
      message: aiResponse,
      model: agent.model
    });

  } catch (error) {
    console.error('Error en el chat:', error);
    res.status(500).json({
      error: 'Error al procesar el mensaje',
      details: error.message
    });
  }
});

// Obtener conversaciones
app.get('/api/conversations', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        agents(name, model)
      `)
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error al obtener conversaciones:', error);
    res.status(500).json({ error: 'Error al obtener conversaciones' });
  }
});

// Obtener mensajes de una conversación
app.get('/api/conversations/:id/messages', authenticateUser, async (req, res) => {
  try {
    // Verificar que la conversación pertenece al usuario
    const { data: conv } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (!conv) {
      return res.status(404).json({ error: 'Conversación no encontrada' });
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', req.params.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

// ============================================
// RUTAS DE WIFI ANALYZER
// ============================================

// Configuración para ignorar SSL (Huawei API)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Helper: Autenticar con Huawei API
async function authenticateHuawei() {
  try {
    const response = await axios.put(
      `${process.env.HUAWEI_API_URL}/rest/plat/smapp/v1/sessions`,
      {
        grantType: 'password',
        userName: process.env.HUAWEI_USERNAME,
        value: process.env.HUAWEI_PASSWORD
      },
      { httpsAgent, timeout: 10000 }
    );
    return response.data.accessSession;
  } catch (error) {
    console.error('Error autenticando con Huawei:', error.message);
    throw new Error('No se pudo autenticar con la API de Huawei');
  }
}

// Helper: Recopilar datos del gateway
async function collectGatewayData(mac, token) {
  const headers = {
    'X-Auth-Token': token,
    'Accept': 'application/json'
  };

  const baseUrl = process.env.HUAWEI_API_URL;
  let data = `\n${'='.repeat(80)}\nANÁLISIS DE GATEWAY: ${mac}\n${'='.repeat(80)}\n`;

  try {
    // Información básica
    const basicInfo = await axios.get(
      `${baseUrl}/restconf/v1/data/huawei-nce-resource-activation-configuration-home-gateway:home-gateway/home-gateway-info`,
      { params: { mac }, headers, httpsAgent, timeout: 15000 }
    );
    data += `\n\n===== INFORMACIÓN BÁSICA =====\n${JSON.stringify(basicInfo.data, null, 2)}`;

    // Dispositivos conectados
    const devices = await axios.get(
      `${baseUrl}/restconf/v1/data/huawei-nce-resource-activation-configuration-home-gateway:home-gateway/sub-devices`,
      { params: { mac }, headers, httpsAgent, timeout: 15000 }
    );
    data += `\n\n===== DISPOSITIVOS CONECTADOS =====\n${JSON.stringify(devices.data, null, 2)}`;

    // Configuración WiFi
    for (const band of ['2.4G', '5G']) {
      const wifi = await axios.get(
        `${baseUrl}/restconf/v1/data/huawei-nce-resource-activation-configuration-home-gateway:home-gateway/wifi-band`,
        { params: { mac, 'radio-type': band }, headers, httpsAgent, timeout: 15000 }
      );
      data += `\n\n===== WIFI ${band} =====\n${JSON.stringify(wifi.data, null, 2)}`;
    }

    // Puertos LAN
    const ports = await axios.post(
      `${baseUrl}/restconf/v1/operations/huawei-nce-resource-activation-configuration-home-gateway:query-gateway-downstream-port`,
      { 'huawei-nce-resource-activation-configuration-home-gateway:input': { mac } },
      { headers, httpsAgent, timeout: 15000 }
    );
    data += `\n\n===== PUERTOS LAN =====\n${JSON.stringify(ports.data, null, 2)}`;

    return data;
  } catch (error) {
    console.error('Error recopilando datos:', error.message);
    return data + `\n\n[ERROR] No se pudieron recopilar todos los datos: ${error.message}`;
  }
}

// Analizar gateway individual
app.post('/api/wifi/analyze', authenticateUser, async (req, res) => {
  try {
    const { mac } = req.body;

    if (!mac || mac.length !== 12) {
      return res.status(400).json({ error: 'MAC address inválida' });
    }

    // Autenticar con Huawei
    const token = await authenticateHuawei();

    // Recopilar datos
    const technicalData = await collectGatewayData(mac, token);

    // Analizar con Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
Actúa como ingeniero de redes senior. Analiza estos datos técnicos de un gateway y crea un informe ejecutivo claro para call center.

REGLAS:
- Usa TEXTO PLANO (sin markdown)
- Emojis: ✅ (bueno), ⚠️ (advertencia), ❌ (crítico)
- Lenguaje simple

ESTRUCTURA:
INFORME DE DIAGNÓSTICO - GATEWAY ${mac}

ESTADO GENERAL
[Estado con emoji y descripción]

CALIDAD DE SEÑAL
[Análisis de potencia óptica]

DISPOSITIVOS CONECTADOS
[Lista con detalles]

CONFIGURACIÓN WIFI
[2.4G y 5G]

PROBLEMAS Y SOLUCIONES
[Lista priorizada]

DATOS TÉCNICOS:
${technicalData}
`;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    res.json({
      mac,
      technicalData,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en análisis WiFi:', error);
    res.status(500).json({
      error: 'Error al analizar gateway',
      details: error.message
    });
  }
});

// Análisis masivo
app.post('/api/wifi/analyze-bulk', authenticateUser, async (req, res) => {
  try {
    const { macs } = req.body;

    if (!Array.isArray(macs) || macs.length === 0) {
      return res.status(400).json({ error: 'Se requiere un array de MACs' });
    }

    const token = await authenticateHuawei();
    const results = [];

    for (const mac of macs) {
      try {
        const technicalData = await collectGatewayData(mac, token);

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `Analiza brevemente este gateway ${mac}:\n\n${technicalData}`;
        const result = await model.generateContent(prompt);

        results.push({
          mac,
          status: 'success',
          analysis: result.response.text(),
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        results.push({
          mac,
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    res.json({ results });

  } catch (error) {
    console.error('Error en análisis masivo:', error);
    res.status(500).json({ error: 'Error en análisis masivo' });
  }
});

// Chat con datos del gateway
app.post('/api/wifi/chat', authenticateUser, async (req, res) => {
  try {
    const { question, context, history } = req.body;

    if (!question || !context) {
      return res.status(400).json({ error: 'Se requiere pregunta y contexto' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
Eres un asistente experto en redes. Responde basándote ÚNICAMENTE en los datos técnicos.

HISTORIAL:
${history || 'Sin historial previo'}

DATOS TÉCNICOS:
${context}

PREGUNTA: ${question}

RESPUESTA (texto plano, sin markdown):
`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    res.json({ answer });

  } catch (error) {
    console.error('Error en chat WiFi:', error);
    res.status(500).json({ error: 'Error en chat' });
  }
});

// ============================================
// MANEJO DE ERRORES
// ============================================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║   🚀 AI Agents Backend                   ║
║   Puerto: ${PORT}                         ║
║   Entorno: ${process.env.NODE_ENV || 'development'}              ║
╚══════════════════════════════════════════╝
  `);
});
