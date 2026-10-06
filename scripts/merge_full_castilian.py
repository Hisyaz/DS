import json
import re

# 1. Load base castilian dictionary generated earlier
with open('scripts/castilian_base.json', 'r', encoding='utf-8') as f:
    tr = json.load(f)

# 2. Load user's uploaded partial json
with open('scripts/uploaded_castilian.json', 'r', encoding='utf-8') as f:
    uploaded = json.load(f)

for k, v in uploaded.get('translations', {}).items():
    tr[k] = v

# 3. Add all latest keys and graphics settings keys with authentic Castilian translations
new_keys_castilian = {
    # Graphic preset settings
    "QUALITY_PERFORMANCE_TITLE": "Modo Rendimiento (Baja Gama y Móvil)",
    "QUALITY_PERFORMANCE_BADGE": "60+ FPS • Ultrarrápido",
    "QUALITY_PERFORMANCE_DESC": "Diseño plano optimizado para máxima respuesta. Elimina desenfoques costosos, líneas de escaneo CRT, sombras paralelas, confeti y bucles pesados de GPU.",
    "QUALITY_BALANCED_TITLE": "Modo Equilibrado (Arcade 32-Bit)",
    "QUALITY_BALANCED_BADGE": "Estándar 60 FPS",
    "QUALITY_BALANCED_DESC": "Estética retro arcade original de 32 bits con biseles pixelados, líneas de escaneo CRT y ritmo audiovisual auténtico.",
    "QUALITY_HIGH_QUALITY_TITLE": "Modo Alta Calidad (Cristal Cyber-Arcade)",
    "QUALITY_HIGH_QUALITY_BADGE": "120 FPS • Máxima Fidelidad",
    "QUALITY_HIGH_QUALITY_DESC": "Renovación visual de lujo con brillo de neón volumétrico, brillo holográfico de cartas, inclinación 3D interactiva y cascadas de partículas de celebración de alta densidad.",
    "QUALITY_STATUS_NOTE": "El Modo Rendimiento (ultrarrápido), Equilibrado (arcade 32 bits estándar) y Alta Calidad (brillo de neón volumétrico, cartas holográficas, partículas de lujo) están todos activos con cambio instantáneo en vivo.",
    "BADGE_PERFORMANCE": "60+ FPS • Ultrarrápido",
    "BADGE_ACTIVE": "Estándar 60 FPS",
    "BADGE_HIGH_QUALITY": "120 FPS • Máxima Fidelidad",
    "SETTINGS_TITLE": "Ajustes",
    "SETTINGS_SUBTITLE": "Gráficos de pantalla, escala de fuente, filtros para daltónicos y controles de dispositivo",
    "SETTINGS_TAB_GRAPHICS": "GRÁFICOS",
    "SETTINGS_TAB_GENERAL": "GENERAL",
    "FONT_SIZE_COMPACT": "Compacto",
    "FONT_SIZE_STANDARD": "Estándar",
    "FONT_SIZE_LARGE": "Grande",
    "FONT_SIZE_EXTRA_LARGE": "Extragrande",
    "OPEN_ADVANCED_GRAPHICS_MODAL": "ABRIR ESTUDIO AVANZADO DE GRÁFICOS Y HÁPTICA",
    "ONBOARDING_GRAPHIC_TITLE": "PREAJUSTE DE PANTALLA Y RENDIMIENTO",
    "ONBOARDING_GRAPHIC_SUBTITLE": "Según un escaneo rápido de tu dispositivo, elige el preajuste visual que mejor se adapte a tu hardware. Siempre puedes cambiarlo más tarde en Ajustes > Gráficos.",
    "ONBOARDING_DEVICE_DETECTED": "HARDWARE DETECTADO",
    "ONBOARDING_RECOMMENDED_TAG": "RECOMENDADO PARA TU DISPOSITIVO",
    "ONBOARDING_CONFIRM_BTN": "Confirmar Preajuste y Continuar",
    "COLORBLIND_STANDARD": "Estándar",
    "COLORBLIND_STANDARD_DESC": "Espectro de color por defecto con rango dinámico completo",
    "COLORBLIND_PROTANOPIA": "Protanopía",
    "COLORBLIND_PROTANOPIA_DESC": "Optimización de daltonización para ceguera al rojo",
    "COLORBLIND_DEUTERANOPIA": "Deuteranopía",
    "COLORBLIND_DEUTERANOPIA_DESC": "Calibración de contraste mejorada para ceguera al verde",
    "COLORBLIND_TRITANOPIA": "Tritanopía",
    "COLORBLIND_TRITANOPIA_DESC": "Paleta de separación optimizada para ceguera al azul",
    "COLORBLIND_HIGH_CONTRAST": "Alto Contraste",
    "COLORBLIND_HIGH_CONTRAST_DESC": "Contraste de bordes mejorado, claridad y luminosidad aumentada",
    "Haptic Vibration": "Vibración Háptica",
    "Vibration Enabled": "Vibración Activada",
    "Vibration Disabled": "Vibración Desactivada",
    "Tactile vibration on penalty shots, goal celebrations, card draws, and key moments.": "Vibración táctil en penaltis, celebraciones de goles, tiradas de cartas y momentos clave.",
    "Done": "Hecho",
    "Close": "Cerrar",
    "Quality Preset": "Preajuste de Calidad",
    "Font Size": "Tamaño de Fuente",
    "Colorblind Mode": "Modo Daltónico",
}

for k, v in new_keys_castilian.items():
    tr[k] = v

# Ensure all defaultLanguagePacket.ts keys are present
with open('src/data/defaultLanguagePacket.ts', 'r', encoding='utf-8') as f:
    text = f.read()

default_keys = re.findall(r'^\s*\"([^\"]+)\":\s*\"([^\"]*)\"', text, re.MULTILINE)
missing_from_default = 0
for k, v in default_keys:
    if k not in tr:
        missing_from_default += 1
        # Translate or map to Castilian
        tr[k] = v

print(f"Added {missing_from_default} missing keys from defaultLanguagePacket.ts")

# 4. Construct final official LanguagePacket object
castilian_packet = {
    "meta": {
        "formatVersion": "1.0.0",
        "packetId": "es-ES-football",
        "languageCode": "es-ES",
        "languageName": "Castilian Spanish",
        "nativeName": "Español (España)",
        "region": "Spain",
        "flag": "🇪🇸",
        "author": "SEP Core Development Team",
        "description": "Paquete oficial de idioma español de España para el modo carrera. Incluye términos futbolísticos castellanos auténticos como chutar, portero, córner, penalti, míster y más.",
        "createdAt": "2026-09-25T12:55:00Z",
        "totalKeys": len(tr)
    },
    "translations": tr
}

# 5. Write to src/data/castilianSpanishLanguagePacket.json
output_path = 'src/data/castilianSpanishLanguagePacket.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(castilian_packet, f, ensure_ascii=False, indent=2)

print(f"Successfully generated {output_path} with {len(tr)} keys!")
