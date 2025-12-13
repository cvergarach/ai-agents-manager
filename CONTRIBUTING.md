# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a AI Agents Manager! Este documento te guiará en el proceso.

## 🚀 Cómo Contribuir

### 1. Fork y Clone

```bash
# Fork el repositorio en GitHub
# Luego clona tu fork
git clone https://github.com/TU_USUARIO/ai-agents-manager.git
cd ai-agents-manager
```

### 2. Crea una Rama

```bash
# Crea una rama para tu feature
git checkout -b feature/mi-nueva-funcionalidad

# O para un bugfix
git checkout -b fix/descripcion-del-bug
```

### 3. Haz tus Cambios

- Sigue el estilo de código existente
- Comenta tu código cuando sea necesario
- Prueba tus cambios localmente

### 4. Commit

```bash
git add .
git commit -m "feat: descripción clara del cambio"
```

**Convención de commits:**
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Formato, punto y coma, etc
- `refactor:` Refactorización de código
- `test:` Agregar tests
- `chore:` Mantenimiento

### 5. Push y Pull Request

```bash
git push origin feature/mi-nueva-funcionalidad
```

Luego abre un Pull Request en GitHub con:
- Título descriptivo
- Descripción de los cambios
- Screenshots si aplica

## 📋 Áreas donde Puedes Contribuir

### Features Sugeridas

- [ ] Soporte para más modelos de IA (Llama, Mistral, etc.)
- [ ] Export/Import de conversaciones
- [ ] Compartir agentes entre usuarios
- [ ] Templates de agentes predefinidos
- [ ] Análisis de uso y estadísticas
- [ ] Modo oscuro/claro
- [ ] Búsqueda en conversaciones
- [ ] Etiquetas y categorías para agentes

### Mejoras de UX

- [ ] Animaciones más suaves
- [ ] Mejor feedback visual
- [ ] Modo móvil mejorado
- [ ] Atajos de teclado
- [ ] Tutorial interactivo

### Documentación

- [ ] Más ejemplos de agentes
- [ ] Videos tutoriales
- [ ] Traducciones a otros idiomas
- [ ] FAQ ampliado

## 🐛 Reportar Bugs

Si encuentras un bug:

1. Verifica que no esté ya reportado en [Issues](https://github.com/tu-usuario/ai-agents-manager/issues)
2. Crea un nuevo issue con:
   - Descripción clara del problema
   - Pasos para reproducirlo
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Información del entorno (navegador, OS, etc.)

## 💡 Sugerir Features

¿Tienes una idea? ¡Genial!

1. Abre un issue con la etiqueta `enhancement`
2. Describe claramente:
   - El problema que resuelve
   - Cómo funcionaría
   - Por qué sería útil

## ✅ Checklist antes de un PR

- [ ] El código funciona localmente
- [ ] No hay warnings en la consola
- [ ] El código sigue el estilo existente
- [ ] Los commits son claros y descriptivos
- [ ] La documentación está actualizada si aplica

## 📝 Estilo de Código

### JavaScript/React

```javascript
// ✅ Bueno
const handleSubmit = async (data) => {
  try {
    await api.createAgent(data)
  } catch (error) {
    console.error('Error:', error)
  }
}

// ❌ Malo
const handleSubmit=async(data)=>{
try{
await api.createAgent(data)
}catch(e){console.error(e)}}
```

### CSS

```css
/* ✅ Bueno */
.agent-card {
  padding: 24px;
  border-radius: 12px;
  background: var(--bg-secondary);
}

/* ❌ Malo */
.agent-card{padding:24px;border-radius:12px;background:var(--bg-secondary)}
```

## 🔍 Code Review

Todo PR será revisado. Podríamos pedir:
- Cambios en el código
- Tests adicionales
- Documentación
- Mejoras en la descripción

¡No te desanimes! Es parte normal del proceso.

## 🙏 Agradecimientos

Todos los contribuidores serán añadidos al README.

---

**¿Preguntas?** Abre un issue o escribe en [Discussions](https://github.com/tu-usuario/ai-agents-manager/discussions)
