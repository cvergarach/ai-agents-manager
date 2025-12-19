import requests
import json
import os
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, Toplevel, filedialog
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
import threading
import re

# Ignorar advertencias SSL
from requests.packages.urllib3.exceptions import InsecureRequestWarning
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

load_dotenv()

# --- CONFIGURACIÓN ---
BASE_URL = "https://176.52.129.49:26335"
USERNAME = "Claro_cvergara_API"
PASSWORD = "H0men3tw0rk@api"

MAX_HOURS_PER_QUERY = 4
DAYS_BACK_EVENTS = 7

# Colores corporativos
COLORS = {
    'primary': '#1976D2',
    'primary_dark': '#0D47A1',
    'primary_light': '#BBDEFB',
    'secondary': '#424242',
    'success': '#4CAF50',
    'warning': '#FF9800',
    'error': '#F44336',
    'bg_main': '#F5F5F5',
    'bg_card': '#FFFFFF',
    'text_primary': '#212121',
    'text_secondary': '#757575',
    'border': '#E0E0E0'
}

# Prompt por defecto (simplificado para espacio)
DEFAULT_PROMPT = """
# ROL Y OBJETIVO
Actúa como un ingeniero de redes senior. Traduce datos técnicos en un informe ejecutivo claro para call center.

# REGLAS
- Usa TEXTO PLANO (sin markdown)
- Emojis: ✅ (bueno), ⚠️ (advertencia), ❌ (crítico)
- Lenguaje simple y claro

# ESTRUCTURA
INFORME DE DIAGNÓSTICO - GATEWAY RESIDENCIAL

ESTADO GENERAL DEL SERVICIO
[Estado con emoji y descripción breve]

CALIDAD DE SEÑAL ÓPTICA
- Estado: [emoji]
- Rx: [valor e interpretación]
- Tx: [valor e interpretación]

DISPOSITIVOS CONECTADOS
[Lista de dispositivos con detalles]

CONFIGURACIÓN WIFI
[Detalles de 2.4G y 5G]

ANÁLISIS DE INTERFERENCIA
[Redes vecinas problemáticas]

EVENTOS RECIENTES
[Resumen de reinicios y cambios]

PUERTOS LAN
[Estado de cada puerto]

RECOMENDACIONES
[Acciones priorizadas]

PROBLEMAS Y SOLUCIONES
[Lista de problemas con soluciones]

--- DATOS TÉCNICOS ---
{contenido}
"""


class WiFiAnalyzerCorporate:
    def __init__(self, root):
        self.root = root
        self.root.title("Analizador WiFi Gateway - Claro Chile")
        self.root.geometry("1200x800")
        self.root.configure(bg=COLORS['bg_main'])
        
        # Variables
        self.prompt_template_str = DEFAULT_PROMPT
        self.datos_tecnicos_contexto = None
        self.mac_list = []
        self.bulk_results = {}
        self.chat_history = []
        
        # Configurar estilo
        self.setup_styles()
        
        # Crear interfaz
        self.create_ui()
    
    def setup_styles(self):
        """Configurar estilos corporativos"""
        style = ttk.Style()
        style.theme_use('clam')
        
        # Botones primarios
        style.configure('Primary.TButton',
                       background=COLORS['primary'],
                       foreground='white',
                       borderwidth=0,
                       focuscolor='none',
                       padding=10)
        style.map('Primary.TButton',
                 background=[('active', COLORS['primary_dark'])])
        
        # Frames con estilo de tarjeta
        style.configure('Card.TFrame',
                       background=COLORS['bg_card'],
                       relief='flat',
                       borderwidth=1)
        
        # Labels
        style.configure('Title.TLabel',
                       background=COLORS['bg_card'],
                       foreground=COLORS['text_primary'],
                       font=('Segoe UI', 14, 'bold'))
        
        style.configure('Subtitle.TLabel',
                       background=COLORS['bg_card'],
                       foreground=COLORS['text_secondary'],
                       font=('Segoe UI', 10))
    
    def create_ui(self):
        """Crear interfaz de usuario"""
        # Header
        header = tk.Frame(self.root, bg=COLORS['primary'], height=80)
        header.pack(fill=tk.X, side=tk.TOP)
        header.pack_propagate(False)
        
        title_label = tk.Label(header,
                              text="🌐 Analizador WiFi Gateway",
                              bg=COLORS['primary'],
                              fg='white',
                              font=('Segoe UI', 20, 'bold'))
        title_label.pack(side=tk.LEFT, padx=20, pady=20)
        
        subtitle = tk.Label(header,
                           text="Claro Chile - Soporte Técnico",
                           bg=COLORS['primary'],
                           fg=COLORS['primary_light'],
                           font=('Segoe UI', 11))
        subtitle.pack(side=tk.LEFT, padx=5)
        
        # Contenedor principal
        main_container = tk.Frame(self.root, bg=COLORS['bg_main'])
        main_container.pack(fill=tk.BOTH, expand=True, padx=15, pady=15)
        
        # Panel de entrada
        self.create_input_panel(main_container)
        
        # Barra de progreso
        self.create_progress_bar(main_container)
        
        # Notebook con tabs
        self.create_tabs(main_container)
        
        # Barra de estado
        self.create_status_bar()
    
    def create_input_panel(self, parent):
        """Panel de entrada de datos"""
        input_frame = tk.Frame(parent, bg=COLORS['bg_card'], relief='flat', bd=1)
        input_frame.pack(fill=tk.X, pady=(0, 15))
        
        # Padding interno
        inner_frame = tk.Frame(input_frame, bg=COLORS['bg_card'])
        inner_frame.pack(fill=tk.X, padx=20, pady=15)
        
        # Modo de consulta
        mode_frame = tk.Frame(inner_frame, bg=COLORS['bg_card'])
        mode_frame.pack(fill=tk.X, pady=(0, 15))
        
        tk.Label(mode_frame, text="Modo de Consulta:",
                bg=COLORS['bg_card'],
                fg=COLORS['text_primary'],
                font=('Segoe UI', 11, 'bold')).pack(side=tk.LEFT, padx=(0, 15))
        
        self.mode_var = tk.StringVar(value="single")
        
        tk.Radiobutton(mode_frame, text="Individual",
                      variable=self.mode_var, value="single",
                      command=self.cambiar_modo,
                      bg=COLORS['bg_card'],
                      fg=COLORS['text_primary'],
                      selectcolor=COLORS['primary_light'],
                      font=('Segoe UI', 10)).pack(side=tk.LEFT, padx=5)
        
        tk.Radiobutton(mode_frame, text="Masiva",
                      variable=self.mode_var, value="bulk",
                      command=self.cambiar_modo,
                      bg=COLORS['bg_card'],
                      fg=COLORS['text_primary'],
                      selectcolor=COLORS['primary_light'],
                      font=('Segoe UI', 10)).pack(side=tk.LEFT, padx=5)
        
        # Frame para modo individual
        self.single_frame = tk.Frame(inner_frame, bg=COLORS['bg_card'])
        self.single_frame.pack(fill=tk.X)
        
        tk.Label(self.single_frame, text="MAC Address:",
                bg=COLORS['bg_card'],
                fg=COLORS['text_primary'],
                font=('Segoe UI', 10)).pack(side=tk.LEFT, padx=(0, 10))
        
        self.mac_entry = tk.Entry(self.single_frame,
                                 font=('Segoe UI', 11),
                                 relief='solid',
                                 bd=1,
                                 width=25)
        self.mac_entry.pack(side=tk.LEFT, padx=(0, 10))
        self.mac_entry.insert(0, "78EB46AB75CA")
        
        self.analyze_btn = tk.Button(self.single_frame,
                                    text="🔍 Analizar",
                                    command=self.iniciar_analisis,
                                    bg=COLORS['primary'],
                                    fg='white',
                                    font=('Segoe UI', 10, 'bold'),
                                    relief='flat',
                                    padx=20,
                                    pady=8,
                                    cursor='hand2')
        self.analyze_btn.pack(side=tk.LEFT, padx=5)
        
        tk.Button(self.single_frame,
                 text="🗑️ Limpiar",
                 command=self.limpiar_resultados,
                 bg=COLORS['secondary'],
                 fg='white',
                 font=('Segoe UI', 10),
                 relief='flat',
                 padx=15,
                 pady=8,
                 cursor='hand2').pack(side=tk.LEFT, padx=5)
        
        tk.Button(self.single_frame,
                 text="⚙️ Configurar",
                 command=self.abrir_ventana_prompt,
                 bg=COLORS['secondary'],
                 fg='white',
                 font=('Segoe UI', 10),
                 relief='flat',
                 padx=15,
                 pady=8,
                 cursor='hand2').pack(side=tk.LEFT, padx=5)
        
        # Frame para modo masivo (oculto inicialmente)
        self.bulk_frame = tk.Frame(inner_frame, bg=COLORS['bg_card'])
        
        bulk_btn_frame = tk.Frame(self.bulk_frame, bg=COLORS['bg_card'])
        bulk_btn_frame.pack(fill=tk.X, pady=(0, 10))
        
        tk.Button(bulk_btn_frame,
                 text="📁 Cargar Archivo",
                 command=self.cargar_archivo_macs,
                 bg=COLORS['primary'],
                 fg='white',
                 font=('Segoe UI', 10),
                 relief='flat',
                 padx=15,
                 pady=8,
                 cursor='hand2').pack(side=tk.LEFT, padx=5)
        
        tk.Button(bulk_btn_frame,
                 text="✏️ Ingresar Manual",
                 command=self.ingresar_macs_manual,
                 bg=COLORS['primary'],
                 fg='white',
                 font=('Segoe UI', 10),
                 relief='flat',
                 padx=15,
                 pady=8,
                 cursor='hand2').pack(side=tk.LEFT, padx=5)
        
        self.mac_count_label = tk.Label(bulk_btn_frame,
                                        text="MACs cargadas: 0",
                                        bg=COLORS['bg_card'],
                                        fg=COLORS['text_secondary'],
                                        font=('Segoe UI', 10))
        self.mac_count_label.pack(side=tk.LEFT, padx=20)
        
        bulk_action_frame = tk.Frame(self.bulk_frame, bg=COLORS['bg_card'])
        bulk_action_frame.pack(fill=tk.X)
        
        self.analyze_bulk_btn = tk.Button(bulk_action_frame,
                                         text="🚀 Iniciar Consulta Masiva",
                                         command=self.iniciar_consulta_masiva,
                                         bg=COLORS['success'],
                                         fg='white',
                                         font=('Segoe UI', 10, 'bold'),
                                         relief='flat',
                                         padx=20,
                                         pady=8,
                                         state='disabled',
                                         cursor='hand2')
        self.analyze_bulk_btn.pack(side=tk.LEFT, padx=5)
        
        tk.Button(bulk_action_frame,
                 text="💾 Exportar",
                 command=self.exportar_resultados_masivos,
                 bg=COLORS['secondary'],
                 fg='white',
                 font=('Segoe UI', 10),
                 relief='flat',
                 padx=15,
                 pady=8,
                 cursor='hand2').pack(side=tk.LEFT, padx=5)
    
    def create_progress_bar(self, parent):
        """Barra de progreso"""
        self.progress_frame = tk.Frame(parent, bg=COLORS['bg_card'], relief='flat', bd=1)
        self.progress_frame.pack(fill=tk.X, pady=(0, 15))
        
        inner = tk.Frame(self.progress_frame, bg=COLORS['bg_card'])
        inner.pack(fill=tk.X, padx=20, pady=10)
        
        self.progress_label = tk.Label(inner,
                                       text="Estado: Listo",
                                       bg=COLORS['bg_card'],
                                       fg=COLORS['text_secondary'],
                                       font=('Segoe UI', 10))
        self.progress_label.pack(fill=tk.X)
        
        self.progress_bar = ttk.Progressbar(inner, mode='indeterminate')
        self.progress_bar.pack(fill=tk.X, pady=(5, 0))
    
    def create_tabs(self, parent):
        """Crear pestañas de resultados"""
        self.notebook = ttk.Notebook(parent)
        self.notebook.pack(fill=tk.BOTH, expand=True)
        
        # Tab Informe
        self.tab_informe = tk.Frame(self.notebook, bg=COLORS['bg_card'])
        self.notebook.add(self.tab_informe, text="📊 Informe Ejecutivo")
        
        self.text_informe = tk.Text(self.tab_informe,
                                   wrap=tk.WORD,
                                   font=('Segoe UI', 11),
                                   bg='white',
                                   fg=COLORS['text_primary'],
                                   padx=20,
                                   pady=15,
                                   relief='flat',
                                   spacing1=5,
                                   spacing2=3,
                                   spacing3=5)
        
        scrollbar = tk.Scrollbar(self.tab_informe, command=self.text_informe.yview)
        self.text_informe.configure(yscrollcommand=scrollbar.set)
        self.text_informe.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10, pady=10)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y, pady=10)
        
        # Configurar tags
        self.text_informe.tag_configure("titulo", font=('Segoe UI', 16, 'bold'), foreground=COLORS['primary'])
        self.text_informe.tag_configure("seccion", font=('Segoe UI', 13, 'bold'), foreground=COLORS['primary_dark'])
        self.text_informe.tag_configure("exito", foreground=COLORS['success'], font=('Segoe UI', 10, 'bold'))
        self.text_informe.tag_configure("advertencia", foreground=COLORS['warning'], font=('Segoe UI', 10, 'bold'))
        self.text_informe.tag_configure("error", foreground=COLORS['error'], font=('Segoe UI', 10, 'bold'))
        
        # Tab Datos Técnicos
        self.tab_tecnicos = tk.Frame(self.notebook, bg=COLORS['bg_card'])
        self.notebook.add(self.tab_tecnicos, text="🔧 Datos Técnicos")
        
        self.text_tecnicos = scrolledtext.ScrolledText(self.tab_tecnicos,
                                                      wrap=tk.WORD,
                                                      font=('Courier New', 9),
                                                      bg='#1e1e1e',
                                                      fg='#00ff00')
        self.text_tecnicos.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Tab Chat
        self.tab_chat = tk.Frame(self.notebook, bg=COLORS['bg_card'])
        self.notebook.add(self.tab_chat, text="💬 Chat Asistente", state="disabled")
        
        self.chat_display = scrolledtext.ScrolledText(self.tab_chat,
                                                     wrap=tk.WORD,
                                                     state='disabled',
                                                     font=('Segoe UI', 10),
                                                     bg='white')
        self.chat_display.pack(fill=tk.BOTH, expand=True, padx=10, pady=(10, 5))
        
        self.chat_display.tag_configure("user", foreground=COLORS['primary'], font=('Segoe UI', 10, 'bold'))
        self.chat_display.tag_configure("bot", foreground=COLORS['text_primary'])
        self.chat_display.tag_configure("error", foreground=COLORS['error'])
        
        chat_input_frame = tk.Frame(self.tab_chat, bg=COLORS['bg_card'])
        chat_input_frame.pack(fill=tk.X, padx=10, pady=(0, 10))
        
        self.chat_input = tk.Entry(chat_input_frame, font=('Segoe UI', 11))
        self.chat_input.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 5))
        self.chat_input.bind("<Return>", self.enviar_mensaje_chat)
        
        self.chat_send_btn = tk.Button(chat_input_frame,
                                      text="Enviar",
                                      command=self.enviar_mensaje_chat,
                                      bg=COLORS['primary'],
                                      fg='white',
                                      font=('Segoe UI', 10),
                                      relief='flat',
                                      padx=20,
                                      cursor='hand2')
        self.chat_send_btn.pack(side=tk.RIGHT)
        
        # Tab Resultados Masivos
        self.tab_bulk = tk.Frame(self.notebook, bg=COLORS['bg_card'])
        self.notebook.add(self.tab_bulk, text="📋 Resultados Masivos")
        
        columns = ("MAC", "Estado", "Timestamp")
        self.bulk_tree = ttk.Treeview(self.tab_bulk, columns=columns, show='tree headings', height=20)
        self.bulk_tree.heading("#0", text="Nº")
        self.bulk_tree.column("#0", width=50)
        
        for col in columns:
            self.bulk_tree.heading(col, text=col)
            if col == "MAC":
                self.bulk_tree.column(col, width=200)
            elif col == "Estado":
                self.bulk_tree.column(col, width=100)
            else:
                self.bulk_tree.column(col, width=150)
        
        bulk_scroll = ttk.Scrollbar(self.tab_bulk, orient=tk.VERTICAL, command=self.bulk_tree.yview)
        self.bulk_tree.configure(yscrollcommand=bulk_scroll.set)
        self.bulk_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10, pady=10)
        bulk_scroll.pack(side=tk.RIGHT, fill=tk.Y, pady=10)
        
        self.bulk_tree.bind('<Double-1>', lambda e: self.ver_detalle_bulk())
    
    def create_status_bar(self):
        """Barra de estado"""
        self.status_label = tk.Label(self.root,
                                    text="✅ Aplicación lista",
                                    bg=COLORS['bg_card'],
                                    fg=COLORS['text_secondary'],
                                    font=('Segoe UI', 9),
                                    anchor=tk.W,
                                    relief='flat',
                                    bd=1)
        self.status_label.pack(fill=tk.X, side=tk.BOTTOM, padx=5, pady=2)
    
    # Métodos de funcionalidad
    def cambiar_modo(self):
        if self.mode_var.get() == "single":
            self.bulk_frame.pack_forget()
            self.single_frame.pack(fill=tk.X)
        else:
            self.single_frame.pack_forget()
            self.bulk_frame.pack(fill=tk.X)
    
    def iniciar_analisis(self):
        mac = self.mac_entry.get().strip().replace(":", "").replace("-", "").upper()
        if not mac or len(mac) != 12:
            messagebox.showwarning("Advertencia", "Formato de MAC inválido")
            return
        self.analyze_btn.config(state='disabled')
        self.limpiar_resultados()
        threading.Thread(target=self.ejecutar_analisis, args=(mac,), daemon=True).start()
    
    def ejecutar_analisis(self, gateway_mac):
        try:
            self.progress_bar.start()
            self.actualizar_estado("🔄 Procesando...", COLORS['primary'])
            self.actualizar_progreso("Recopilando datos del gateway...")
            
            datos_tecnicos = self.recopilar_datos_gateway(gateway_mac)
            
            if not datos_tecnicos or "[!]" in datos_tecnicos:
                self.mostrar_error("Error de Recopilación", datos_tecnicos or "No se recibieron datos.")
                return
            
            self.text_tecnicos.delete(1.0, tk.END)
            self.text_tecnicos.insert(1.0, datos_tecnicos)
            self.datos_tecnicos_contexto = datos_tecnicos
            
            self.actualizar_progreso("Analizando con IA (Gemini)...")
            analisis = self.analizar_con_ia({"contenido": datos_tecnicos}, self.prompt_template_str)
            
            self.formatear_informe(analisis)
            self.notebook.select(self.tab_informe)
            self.notebook.tab(self.tab_chat, state="normal")
            
            self.insertar_mensaje_chat("Asistente: Datos cargados. Puedes hacerme preguntas.\n", "bot")
            
            self.actualizar_estado(f"✅ Análisis completado: {gateway_mac}", COLORS['success'])
            messagebox.showinfo("Éxito", "Análisis completado exitosamente")
            
        except Exception as e:
            self.mostrar_error("Error Inesperado", str(e))
        finally:
            self.progress_bar.stop()
            self.analyze_btn.config(state='normal')
            self.actualizar_progreso("Listo")
    
    def recopilar_datos_gateway(self, gateway_mac):
        """Recopila datos del gateway"""
        try:
            with requests.Session() as session:
                self.actualizar_progreso("Autenticando...")
                login_url = f"{BASE_URL}/rest/plat/smapp/v1/sessions"
                login_payload = {"grantType": "password", "userName": USERNAME, "value": PASSWORD}
                response = session.put(login_url, json=login_payload, verify=False, timeout=10)
                response.raise_for_status()
                token = response.json().get("accessSession")
                
                if not token:
                    return "[!] No se pudo obtener el token de autenticación."
                
                headers = {"X-Auth-Token": token, "Accept": "application/json"}
                
                datos_completos = ""
                consultas = [
                    ("Información básica", self.get_basic_info),
                    ("Dispositivos conectados", self.get_connected_devices),
                    ("Datos de rendimiento", self.get_performance_data),
                    ("Configuración WiFi", self.get_wifi_band_info),
                    ("Puertos LAN", self.get_downstream_ports),
                    ("Redes vecinas", self.get_neighboring_ssids),
                    ("Eventos", self.get_events_and_reboots)
                ]
                
                for nombre, func in consultas:
                    self.actualizar_progreso(f"Consultando {nombre}...")
                    datos_completos += func(session, headers, gateway_mac)
                
                return datos_completos
                
        except requests.exceptions.RequestException as e:
            return f"\n[!] Error de conexión: {e}"
    
    def get_basic_info(self, session, headers, mac):
        output = "\n" + "="*80 + "\n===== INFORMACIÓN BÁSICA =====\n" + "="*80
        url = f"{BASE_URL}/restconf/v1/data/huawei-nce-resource-activation-configuration-home-gateway:home-gateway/home-gateway-info"
        return output + self.api_call(session, headers, mac, url, params={"mac": mac})
    
    def get_connected_devices(self, session, headers, mac):
        output = "\n" + "="*80 + "\n===== DISPOSITIVOS CONECTADOS =====\n" + "="*80
        url = f"{BASE_URL}/restconf/v1/data/huawei-nce-resource-activation-configuration-home-gateway:home-gateway/sub-devices"
        return output + self.api_call(session, headers, mac, url, params={"mac": mac})
    
    def get_performance_data(self, session, headers, mac):
        output = "\n" + "="*80 + "\n===== RENDIMIENTO =====\n" + "="*80
        url = f"{BASE_URL}/restconf/v1/operations/huawei-nce-homeinsight-performance-management:query-history-pm-datas"
        end, start = datetime.now(timezone.utc), datetime.now(timezone.utc) - timedelta(hours=1)
        payload = {
            "huawei-nce-homeinsight-performance-management:input": {
                "query-indicator-groups": {"query-indicator-group": [{"indicator-group-name": "QUALITY_ANALYSIS"}]},
                "res-type-name": "HOME_NETWORK",
                "gateway-list": [{"gateway-mac": mac}],
                "data-type": "ANALYSIS_BY_5MIN",
                "start-time": start.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
                "end-time": end.strftime('%Y-%m-%dT%H:%M:%S.000Z')
            }
        }
        return output + self.api_call(session, headers, mac, url, method='post', json_payload=payload, timeout=20)
    
    def get_wifi_band_info(self, session, headers, mac):
        output = "\n" + "="*80 + "\n===== CONFIGURACIÓN WIFI =====\n" + "="*80
        url = f"{BASE_URL}/restconf/v1/data/huawei-nce-resource-activation-configuration-home-gateway:home-gateway/wifi-band"
        for band in ["2.4G", "5G"]:
            output += f"\n--- Banda {band} ---"
            output += self.api_call(session, headers, mac, url, params={"mac": mac, "radio-type": band})
        return output
    
    def get_downstream_ports(self, session, headers, mac):
        output = "\n" + "="*80 + "\n===== PUERTOS LAN =====\n" + "="*80
        url = f"{BASE_URL}/restconf/v1/operations/huawei-nce-resource-activation-configuration-home-gateway:query-gateway-downstream-port"
        payload = {"huawei-nce-resource-activation-configuration-home-gateway:input": {"mac": mac}}
        return output + self.api_call(session, headers, mac, url, method='post', json_payload=payload)
    
    def get_neighboring_ssids(self, session, headers, mac):
        output = "\n" + "="*80 + "\n===== REDES VECINAS =====\n" + "="*80
        url = f"{BASE_URL}/restconf/v1/data/huawei-nce-resource-activation-configuration-home-gateway:home-gateway/neighbor-ssids"
        for band in ["2.4G", "5G"]:
            output += f"\n--- Banda {band} ---"
            output += self.api_call(session, headers, mac, url, params={"mac": mac, "radio-type": band}, timeout=20)
        return output
    
    def get_events_and_reboots(self, session, headers, mac):
        output = "\n" + "="*80 + "\n===== EVENTOS Y REINICIOS =====\n" + "="*80
        end_time = datetime.now(timezone.utc)
        start_time_total = end_time - timedelta(days=DAYS_BACK_EVENTS)
        
        all_events = []
        current_start = start_time_total
        
        while current_start < end_time:
            current_end = min(current_start + timedelta(hours=MAX_HOURS_PER_QUERY), end_time)
            start_str = current_start.strftime("%Y-%m-%dT%H:%M:%SZ")
            end_str = current_end.strftime("%Y-%m-%dT%H:%M:%SZ")
            
            events_url = f"{BASE_URL}/restconf/v1/data/huawei-nce-streams-home-gateway:home-gateway/event-data"
            params = {"mac": mac, "start-time": start_str, "end-time": end_str}
            
            try:
                response = session.get(events_url, headers=headers, params=params, verify=False, timeout=15)
                response.raise_for_status()
                data = response.json()
                events_batch = data.get("huawei-nce-streams-home-gateway:event-data", {}).get("event-data-list", [])
                all_events.extend(events_batch)
                current_start = current_end
            except Exception as e:
                output += f"\n[!] Error en ventana {start_str}: {e}"
                break
        
        output += f"\n--- Total de eventos: {len(all_events)} ---\n"
        output += json.dumps(all_events, indent=4, ensure_ascii=False)
        
        reboot_events = [e for e in all_events if e.get('event-type') == 'GATEWAY_ONLINE']
        output += f"\n--- Reinicios detectados: {len(reboot_events)} ---\n"
        
        return output
    
    def api_call(self, session, headers, mac, url, method='get', params=None, json_payload=None, timeout=15):
        try:
            if method == 'get':
                r = session.get(url, headers=headers, params=params, verify=False, timeout=timeout)
            else:
                r = session.post(url, headers=headers, json=json_payload, verify=False, timeout=timeout)
            r.raise_for_status()
            return "\n" + json.dumps(r.json(), indent=4)
        except Exception as e:
            return f"\n[!] Error: {e}"
    
    def analizar_con_ia(self, prompt_inputs: dict, template_str: str):
        try:
            api_key = os.getenv("GENAI_API_KEY")
            if not api_key:
                return "❌ Error: No se encontró GENAI_API_KEY en .env"
            
            llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash-exp", google_api_key=api_key, temperature=0.5)
            prompt = PromptTemplate(input_variables=list(prompt_inputs.keys()), template=template_str)
            chain = prompt | llm
            return chain.invoke(prompt_inputs).content
        except Exception as e:
            return f"❌ Error al analizar con IA: {e}"
    
    def formatear_informe(self, texto_raw):
        self.text_informe.configure(state='normal')
        self.text_informe.delete(1.0, tk.END)
        texto = re.sub(r'[\*#]+', '', texto_raw)
        
        for linea in texto.split('\n'):
            linea_limpia = linea.strip()
            if not linea_limpia:
                self.text_informe.insert(tk.END, '\n')
                continue
            
            if self.es_titulo_principal(linea_limpia):
                self.text_informe.insert(tk.END, linea_limpia + '\n', 'titulo')
                self.text_informe.insert(tk.END, '─' * 80 + '\n\n')
            elif self.es_seccion(linea_limpia):
                self.text_informe.insert(tk.END, '\n' + linea_limpia + '\n', 'seccion')
            elif linea_limpia.startswith('✅'):
                self.text_informe.insert(tk.END, '   ' + linea_limpia + '\n', 'exito')
            elif linea_limpia.startswith('⚠️'):
                self.text_informe.insert(tk.END, '   ' + linea_limpia + '\n', 'advertencia')
            elif linea_limpia.startswith('❌'):
                self.text_informe.insert(tk.END, '   ' + linea_limpia + '\n', 'error')
            else:
                self.text_informe.insert(tk.END, '   ' + linea_limpia + '\n', 'normal')
        
        self.text_informe.configure(state='disabled')
    
    def es_titulo_principal(self, linea):
        palabras_clave = ['INFORME', 'ANÁLISIS', 'DIAGNÓSTICO']
        return any(palabra in linea.upper() for palabra in palabras_clave) and len(linea) < 100
    
    def es_seccion(self, linea):
        palabras_clave = ['ESTADO', 'CALIDAD', 'DISPOSITIVOS', 'CONFIGURACIÓN', 'INTERFERENCIA', 
                         'PUERTOS', 'RECOMENDACIONES', 'PROBLEMAS', 'HISTORIAL']
        return any(palabra in linea.upper() for palabra in palabras_clave) and len(linea) < 80
    
    def enviar_mensaje_chat(self, event=None):
        pregunta = self.chat_input.get().strip()
        if not pregunta or not self.datos_tecnicos_contexto:
            return
        
        self.insertar_mensaje_chat(f"Tú: {pregunta}\n", "user")
        self.chat_input.delete(0, tk.END)
        self.chat_input.config(state='disabled')
        self.chat_send_btn.config(state='disabled')
        
        threading.Thread(target=self.procesar_pregunta_chat, args=(pregunta,), daemon=True).start()
    
    def procesar_pregunta_chat(self, pregunta):
        try:
            template_chat = """
Eres un asistente experto en redes. Responde basándote ÚNICAMENTE en los datos técnicos proporcionados.

HISTORIAL:
{chat_history}

DATOS TÉCNICOS:
{contexto}

PREGUNTA: {pregunta}

RESPUESTA (texto plano, sin markdown):
"""
            historial_formateado = "\n".join(self.chat_history[-10:]) if self.chat_history else "Sin historial previo"
            
            prompt_inputs = {
                "contexto": self.datos_tecnicos_contexto,
                "pregunta": pregunta,
                "chat_history": historial_formateado
            }
            
            respuesta_ia = self.analizar_con_ia(prompt_inputs, template_chat)
            
            self.chat_history.append(f"Humano: {pregunta}")
            self.chat_history.append(f"Asistente: {respuesta_ia.strip()}")
            
            if len(self.chat_history) > 20:
                self.chat_history = self.chat_history[-20:]
            
            self.root.after(0, self.finalizar_chat, f"Asistente: {respuesta_ia}\n", "bot")
            
        except Exception as e:
            self.root.after(0, self.finalizar_chat, f"Error: {e}\n", "error")
    
    def finalizar_chat(self, respuesta, tag):
        self.insertar_mensaje_chat(respuesta, tag)
        self.chat_input.config(state='normal')
        self.chat_send_btn.config(state='normal')
        self.chat_input.focus()
    
    def insertar_mensaje_chat(self, mensaje, tag):
        self.chat_display.config(state='normal')
        self.chat_display.insert(tk.END, mensaje, tag)
        self.chat_display.config(state='disabled')
        self.chat_display.see(tk.END)
    
    def cargar_archivo_macs(self):
        filepath = filedialog.askopenfilename(
            title="Seleccionar archivo con MACs",
            filetypes=[("Archivos de texto", "*.txt"), ("Todos", "*.*")]
        )
        if filepath:
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    macs = [line.strip().replace(":", "").replace("-", "").upper()
                           for line in f if line.strip()]
                    macs = [mac for mac in macs if len(mac) == 12 and mac.isalnum()]
                if macs:
                    self.mac_list = macs
                    self.mac_count_label.config(text=f"MACs cargadas: {len(macs)}", fg=COLORS['success'])
                    self.analyze_bulk_btn.config(state='normal')
                    messagebox.showinfo("Éxito", f"Se cargaron {len(macs)} MACs válidas")
                else:
                    messagebox.showwarning("Advertencia", "No se encontraron MACs válidas")
            except Exception as e:
                messagebox.showerror("Error", f"Error al leer archivo: {e}")
    
    def ingresar_macs_manual(self):
        dialog = Toplevel(self.root)
        dialog.title("Ingresar MACs manualmente")
        dialog.geometry("600x400")
        dialog.transient(self.root)
        dialog.grab_set()
        
        tk.Label(dialog, text="Ingresa las direcciones MAC (una por línea):",
                font=('Segoe UI', 10), padx=10, pady=10).pack(fill=tk.X)
        
        text_area = scrolledtext.ScrolledText(dialog, wrap=tk.WORD, font=('Courier New', 10))
        text_area.pack(expand=True, fill=tk.BOTH, padx=10, pady=5)
        
        def guardar_macs():
            contenido = text_area.get(1.0, tk.END)
            macs = [line.strip().replace(":", "").replace("-", "").upper()
                   for line in contenido.split('\n') if line.strip()]
            macs = [mac for mac in macs if len(mac) == 12 and mac.isalnum()]
            if macs:
                self.mac_list = macs
                self.mac_count_label.config(text=f"MACs cargadas: {len(macs)}", fg=COLORS['success'])
                self.analyze_bulk_btn.config(state='normal')
                messagebox.showinfo("Éxito", f"Se cargaron {len(macs)} MACs", parent=dialog)
                dialog.destroy()
            else:
                messagebox.showwarning("Advertencia", "No se ingresaron MACs válidas", parent=dialog)
        
        button_frame = tk.Frame(dialog, padx=10, pady=10)
        button_frame.pack(fill=tk.X)
        
        tk.Button(button_frame, text="Guardar", command=guardar_macs,
                 bg=COLORS['primary'], fg='white', padx=20, pady=5).pack(side=tk.RIGHT, padx=5)
        tk.Button(button_frame, text="Cancelar", command=dialog.destroy,
                 bg=COLORS['secondary'], fg='white', padx=20, pady=5).pack(side=tk.RIGHT)
    
    def iniciar_consulta_masiva(self):
        if not self.mac_list:
            messagebox.showwarning("Advertencia", "No hay MACs cargadas")
            return
        self.bulk_results = {}
        self.analyze_bulk_btn.config(state='disabled')
        self.actualizar_tabla_bulk()
        threading.Thread(target=self.ejecutar_consulta_masiva, daemon=True).start()
    
    def ejecutar_consulta_masiva(self):
        try:
            self.progress_bar.start()
            total = len(self.mac_list)
            
            for idx, mac in enumerate(self.mac_list, 1):
                self.actualizar_progreso(f"Consultando MAC {idx}/{total}: {mac}")
                try:
                    datos_tecnicos = self.recopilar_datos_gateway(mac)
                    if datos_tecnicos and "[!]" not in datos_tecnicos:
                        analisis = self.analizar_con_ia({"contenido": datos_tecnicos}, self.prompt_template_str)
                        self.bulk_results[mac] = {
                            "estado": "✅ Éxito",
                            "datos": datos_tecnicos,
                            "analisis": analisis,
                            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        }
                    else:
                        self.bulk_results[mac] = {
                            "estado": "❌ Error",
                            "datos": datos_tecnicos or "Sin datos",
                            "analisis": "No disponible",
                            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        }
                except Exception as e:
                    self.bulk_results[mac] = {
                        "estado": "❌ Error",
                        "datos": str(e),
                        "analisis": "No disponible",
                        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    }
                self.root.after(0, self.actualizar_tabla_bulk)
            
            self.root.after(0, self.finalizar_consulta_masiva)
        except Exception as e:
            self.root.after(0, lambda: messagebox.showerror("Error", f"Error en consulta masiva: {e}"))
        finally:
            self.progress_bar.stop()
    
    def finalizar_consulta_masiva(self):
        exitosos = sum(1 for r in self.bulk_results.values() if "Éxito" in r["estado"])
        total = len(self.bulk_results)
        self.actualizar_estado(f"✅ Consulta completada: {exitosos}/{total}", COLORS['success'])
        self.analyze_bulk_btn.config(state='normal')
        self.notebook.select(self.tab_bulk)
        messagebox.showinfo("Completado", f"Consultas exitosas: {exitosos}/{total}")
    
    def actualizar_tabla_bulk(self):
        self.bulk_tree.delete(*self.bulk_tree.get_children())
        for idx, (mac, result) in enumerate(self.bulk_results.items(), 1):
            self.bulk_tree.insert("", tk.END, text=str(idx),
                                 values=(mac, result["estado"], result["timestamp"]))
    
    def ver_detalle_bulk(self):
        selection = self.bulk_tree.selection()
        if not selection:
            messagebox.showwarning("Advertencia", "Selecciona una MAC")
            return
        
        item = self.bulk_tree.item(selection[0])
        mac = item["values"][0]
        
        if mac in self.bulk_results:
            result = self.bulk_results[mac]
            self.text_tecnicos.delete(1.0, tk.END)
            self.text_tecnicos.insert(1.0, result["datos"])
            self.formatear_informe(result["analisis"])
            self.notebook.select(self.tab_informe)
    
    def exportar_resultados_masivos(self):
        if not self.bulk_results:
            messagebox.showwarning("Advertencia", "No hay resultados para exportar")
            return
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"resultados_masivos_{timestamp}.txt"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write("="*80 + "\n")
                f.write("RESULTADOS DE CONSULTA MASIVA\n")
                f.write(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"Total: {len(self.bulk_results)}\n")
                f.write("="*80 + "\n\n")
                
                for idx, (mac, result) in enumerate(self.bulk_results.items(), 1):
                    f.write(f"\n{'='*80}\n")
                    f.write(f"CONSULTA #{idx} - MAC: {mac}\n")
                    f.write(f"Estado: {result['estado']}\n")
                    f.write(f"Timestamp: {result['timestamp']}\n")
                    f.write(f"{'='*80}\n")
                    f.write("--- ANÁLISIS ---\n")
                    f.write(result['analisis'] + "\n")
                    f.write("--- DATOS TÉCNICOS ---\n")
                    f.write(result['datos'] + "\n")
            
            messagebox.showinfo("Exportado", f"Resultados exportados a:\n{filename}")
        except Exception as e:
            messagebox.showerror("Error", f"Error al exportar: {e}")
    
    def abrir_ventana_prompt(self):
        prompt_window = Toplevel(self.root)
        prompt_window.title("Editor de Prompt")
        prompt_window.geometry("800x600")
        prompt_window.transient(self.root)
        prompt_window.grab_set()
        
        tk.Label(prompt_window, text="Edita el prompt para la generación del informe:",
                font=('Segoe UI', 10), padx=10, pady=10).pack(fill=tk.X)
        
        text_area = scrolledtext.ScrolledText(prompt_window, wrap=tk.WORD, font=('Courier New', 10))
        text_area.pack(expand=True, fill=tk.BOTH, padx=10, pady=5)
        text_area.insert(tk.END, self.prompt_template_str)
        
        button_frame = tk.Frame(prompt_window, padx=10, pady=10)
        button_frame.pack(fill=tk.X)
        
        def guardar_y_cerrar():
            self.prompt_template_str = text_area.get(1.0, tk.END)
            messagebox.showinfo("Guardado", "Prompt actualizado", parent=prompt_window)
            prompt_window.destroy()
        
        def restaurar_defecto():
            if messagebox.askokcancel("Restaurar", "¿Restaurar prompt por defecto?", parent=prompt_window):
                text_area.delete(1.0, tk.END)
                text_area.insert(tk.END, DEFAULT_PROMPT)
        
        tk.Button(button_frame, text="Guardar", command=guardar_y_cerrar,
                 bg=COLORS['primary'], fg='white', padx=20, pady=5).pack(side=tk.RIGHT, padx=5)
        tk.Button(button_frame, text="Restaurar", command=restaurar_defecto,
                 bg=COLORS['secondary'], fg='white', padx=20, pady=5).pack(side=tk.RIGHT, padx=5)
        tk.Button(button_frame, text="Cancelar", command=prompt_window.destroy,
                 bg=COLORS['secondary'], fg='white', padx=20, pady=5).pack(side=tk.LEFT)
    
    def limpiar_resultados(self):
        self.text_informe.configure(state='normal')
        self.text_informe.delete(1.0, tk.END)
        self.text_informe.configure(state='disabled')
        self.text_tecnicos.delete(1.0, tk.END)
        self.datos_tecnicos_contexto = None
        self.notebook.tab(self.tab_chat, state="disabled")
        self.chat_display.config(state='normal')
        self.chat_display.delete(1.0, tk.END)
        self.chat_display.config(state='disabled')
        self.chat_history = []
        self.actualizar_estado("🗑️ Resultados limpiados", COLORS['text_secondary'])
    
    def mostrar_error(self, titulo, mensaje):
        self.text_informe.configure(state='normal')
        self.text_informe.delete(1.0, tk.END)
        self.text_informe.insert(1.0, f"❌ {titulo}\n{mensaje}", 'error')
        self.text_informe.configure(state='disabled')
        self.actualizar_estado(f"❌ {titulo}", COLORS['error'])
        messagebox.showerror(titulo, mensaje)
    
    def actualizar_estado(self, mensaje, color):
        self.status_label.config(text=mensaje, fg=color)
        self.root.update_idletasks()
    
    def actualizar_progreso(self, mensaje):
        self.progress_label.config(text=f"Estado: {mensaje}")
        self.root.update_idletasks()


if __name__ == "__main__":
    root = tk.Tk()
    app = WiFiAnalyzerCorporate(root)
    root.mainloop()
