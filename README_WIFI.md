# Analizador WiFi Gateway - Claro Chile

## Descripción
Aplicación de escritorio con interfaz corporativa moderna para analizar gateways WiFi residenciales. Incluye análisis con IA (Google Gemini), consultas masivas y chat interactivo.

## Características

### 🎨 Interfaz Corporativa Moderna
- Diseño Material Design con colores corporativos de Claro Chile
- Tipografía profesional (Segoe UI)
- Componentes visuales mejorados con sombras y bordes redondeados
- Experiencia de usuario optimizada

### 🔍 Funcionalidades
- **Análisis Individual**: Consulta detallada de un gateway por MAC address
- **Análisis Masivo**: Procesa múltiples MACs desde archivo o entrada manual
- **IA Integrada**: Análisis automático con Google Gemini
- **Chat Asistente**: Pregunta sobre los datos técnicos en lenguaje natural
- **Exportación**: Guarda informes y datos técnicos en formato TXT

### 📊 Datos Recopilados
- Información básica del gateway
- Dispositivos conectados
- Datos de rendimiento
- Configuración WiFi (2.4G y 5G)
- Puertos LAN
- Redes vecinas
- Historial de eventos y reinicios

## Instalación

### Requisitos Previos
- Python 3.8 o superior
- Conexión a la API de Huawei NCE
- API Key de Google Gemini

### Pasos de Instalación

1. **Instalar dependencias**:
```bash
pip install -r requirements_wifi.txt
```

2. **Configurar variables de entorno**:
   - Copia `.env.wifi.example` a `.env`
   - Edita `.env` y agrega tu API Key de Gemini:
```
GENAI_API_KEY=tu_api_key_aqui
```

3. **Ejecutar la aplicación**:
```bash
python wifi_analyzer_corporate.py
```

## Uso

### Análisis Individual
1. Selecciona el modo "Individual"
2. Ingresa la MAC address del gateway (sin separadores)
3. Haz clic en "🔍 Analizar"
4. Revisa el informe ejecutivo en la pestaña correspondiente
5. Usa el chat para hacer preguntas específicas sobre los datos

### Análisis Masivo
1. Selecciona el modo "Masiva"
2. Carga un archivo TXT con MACs (una por línea) o ingrésalas manualmente
3. Haz clic en "🚀 Iniciar Consulta Masiva"
4. Espera a que se procesen todas las consultas
5. Revisa los resultados en la pestaña "Resultados Masivos"
6. Exporta los resultados con el botón "💾 Exportar"

### Configuración del Prompt
- Haz clic en "⚙️ Configurar" para personalizar el prompt de análisis
- Edita el template según tus necesidades
- Guarda los cambios o restaura el prompt por defecto

## Estructura del Proyecto

```
wifi_analyzer_corporate.py    # Aplicación principal
requirements_wifi.txt          # Dependencias Python
.env.wifi.example             # Ejemplo de configuración
README_WIFI.md                # Esta documentación
```

## Colores Corporativos

La aplicación utiliza la siguiente paleta de colores:
- **Primario**: #1976D2 (Azul corporativo)
- **Primario Oscuro**: #0D47A1
- **Secundario**: #424242 (Gris)
- **Éxito**: #4CAF50 (Verde)
- **Advertencia**: #FF9800 (Naranja)
- **Error**: #F44336 (Rojo)
- **Fondo**: #F5F5F5 (Gris claro)

## Solución de Problemas

### Error de conexión SSL
La aplicación desactiva las advertencias SSL automáticamente para conectarse a la API de Huawei.

### Error de API Key
Verifica que `GENAI_API_KEY` esté correctamente configurada en el archivo `.env`.

### Timeout en consultas
Si las consultas tardan mucho, verifica la conexión a la API de Huawei o reduce el período de consulta de eventos.

## Soporte

Para soporte técnico, contacta al equipo de desarrollo de Claro Chile.

## Licencia

Uso interno de Claro Chile. Todos los derechos reservados.
