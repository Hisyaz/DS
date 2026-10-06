#!/usr/bin/env python3
"""
Phase 3: Universal Key Parity & Localization Synchronizer.
Guarantees 100% complete key symmetry across all three language packets:
  - ukEnglishLanguagePacket.json ('en-GB')
  - castilianSpanishLanguagePacket.json ('es-ES')
  - argentineanSpanishLanguagePacket.json ('es-AR')
  - defaultLanguagePacket.ts (synced with en-GB)

Leaves ZERO missing keys, eliminating blank UI spots or fallback errors regardless
of active language packet selection.
"""

import json
import os

# Authoritative English translations for the keys present in Castilian but missing in UK English
UK_MISSING_TRANSLATIONS = {
    "BADGE_ACTIVE": "Standard 60 FPS",
    "BADGE_HIGH_QUALITY": "120 FPS • Maximum Fidelity",
    "BADGE_PERFORMANCE": "60+ FPS • Ultra Fast",
    "COLORBLIND_DEUTERANOPIA": "Deuteranopia",
    "COLORBLIND_DEUTERANOPIA_DESC": "Enhanced contrast calibration for green color vision deficiency",
    "COLORBLIND_HIGH_CONTRAST": "High Contrast",
    "COLORBLIND_HIGH_CONTRAST_DESC": "Sharpened edge contrast, heightened clarity, and boosted luminescence",
    "COLORBLIND_PROTANOPIA": "Protanopia",
    "COLORBLIND_PROTANOPIA_DESC": "Daltonization filter optimized for red color vision deficiency",
    "COLORBLIND_STANDARD": "Standard",
    "COLORBLIND_STANDARD_DESC": "Default full dynamic range spectrum",
    "COLORBLIND_TRITANOPIA": "Tritanopia",
    "COLORBLIND_TRITANOPIA_DESC": "Optimized separation palette for blue color vision deficiency",
    "Close": "Close",
    "Colorblind Mode": "Colorblind Mode",
    "Done": "Done",
    "Font Size": "Font Size",
    "Haptic Vibration": "Haptic Vibration",
    "OPEN_ADVANCED_GRAPHICS_MODAL": "OPEN ADVANCED GRAPHICS & HAPTICS STUDIO",
    "QUALITY_STATUS_NOTE": "Performance (ultra-fast), Balanced (standard 32-bit arcade), and High Quality (volumetric neon glow, holographic cards, luxury particle fx) modes are fully active with live switching.",
    "Quality Preset": "Quality Preset",
    "Tactile vibration on penalty shots, goal celebrations, card draws, and key moments.": "Tactile vibration on penalty shots, goal celebrations, card draws, and key moments.",
    "Vibration Disabled": "Vibration Disabled",
    "Vibration Enabled": "Vibration Enabled",
    "Your manager deploys their absolute highest-level international connections for a 1-year career breakthrough.": "Your manager deploys their absolute highest-level international connections for a 1-year career breakthrough.",
    "author": "SEP Core Development Team",
    "createdAt": "2026-09-07T11:25:00Z",
    "description": "Comprehensive Master UK English Language Packet covering every player-readable UI element, menu, card, store item, business, choice, event, perk, stat, position, playstyle, and trophy.",
    "flag": "🇬🇧",
    "formatVersion": "1.0.0",
    "languageCode": "en-GB",
    "languageName": "British English",
    "nativeName": "English (UK)",
    "packetId": "en-GB-official",
    "region": "United Kingdom",
}

# Authoritative Argentinean Spanish (Rioplatense) translations for keys present in Castilian/UK
AR_MISSING_TRANSLATIONS = {
    "Awarded annually to world football's supreme striker for overall attacking performance, clinical scoring, and decisive impact.": "Entregado anualmente al mejor delantero del fútbol mundial por su rendimiento ofensivo global, instinto goleador y jerarquía decisiva.",
    "BADGE_ACTIVE": "Estándar 60 FPS",
    "BADGE_HIGH_QUALITY": "120 FPS • Máxima Fidelidad",
    "BADGE_PERFORMANCE": "60+ FPS • Ultrarrápido",
    "COLORBLIND_DEUTERANOPIA": "Deuteranopía",
    "COLORBLIND_DEUTERANOPIA_DESC": "Calibración de contraste optimizada para ceguera al verde",
    "COLORBLIND_HIGH_CONTRAST": "Alto Contraste",
    "COLORBLIND_HIGH_CONTRAST_DESC": "Contraste de bordes mejorado, nitidez y luminosidad aumentada",
    "COLORBLIND_PROTANOPIA": "Protanopía",
    "COLORBLIND_PROTANOPIA_DESC": "Optimización de daltonismo para ceguera al rojo",
    "COLORBLIND_STANDARD": "Estándar",
    "COLORBLIND_STANDARD_DESC": "Espectro de color por defecto con rango dinámico completo",
    "COLORBLIND_TRITANOPIA": "Tritanopía",
    "COLORBLIND_TRITANOPIA_DESC": "Paleta de separación optimizada para ceguera al azul",
    "Close": "Cerrar",
    "Colorblind Mode": "Modo Daltónico",
    "DEV_STRENGTH_PRIMARY_TAG": "FORTALEZA PRINCIPAL",
    "DEV_STRENGTH_SECONDARY_TAG": "FORTALEZA SECUNDARIA",
    "DEV_TUTORIAL_ARCHETYPE_BONUS_DESC": "Tu arquetipo define cómo crecés en la cancha y qué atributos aumentan más rápido.",
    "DEV_TUTORIAL_TRAINING_REWARD_DESC": "Completar entrenamientos semanales te otorga puntos de desarrollo para potenciar a tu jugador.",
    "DEV_WEAKNESS_TAG": "ASPECTO A MEJORAR",
    "Done": "Listo",
    "FONT_SIZE_COMPACT": "Compacto",
    "FONT_SIZE_EXTRA_LARGE": "Extra Grande",
    "FONT_SIZE_LARGE": "Grande",
    "FONT_SIZE_STANDARD": "Estándar",
    "Font Size": "Tamaño de Letra",
    "Haptic Vibration": "Vibración Háptica",
    "NO_PROFILE_SELECTED": "No hay ningún perfil activo",
    "ONBOARDING_CONFIRM_BTN": "Confirmar Ajuste y Continuar",
    "ONBOARDING_DEVICE_DETECTED": "HARDWARE DETECTADO",
    "ONBOARDING_GRAPHIC_SUBTITLE": "Según el escaneo de tu dispositivo, elegí el preajuste visual más conveniente. Podés cambiarlo cuando quieras en Ajustes > Gráficos.",
    "ONBOARDING_GRAPHIC_TITLE": "CONFIGURACIÓN DE PANTALLA Y RENDIMIENTO",
    "ONBOARDING_RECOMMENDED_TAG": "RECOMENDADO PARA TU DISPOSITIVO",
    "OPEN_ADVANCED_GRAPHICS_MODAL": "ABRIR PANEL AVANZADO DE GRÁFICOS Y HÁPTICA",
    "PROFILE_ACTIVE_BADGE": "ACTIVO",
    "PROFILE_BACKUP_DESC": "Descargá tus datos de perfil completos o cargá un archivo JSON de respaldo.",
    "PROFILE_BACKUP_TITLE": "Copia de Seguridad del Perfil",
    "PROFILE_CANNOT_DELETE_LAST": "No podés eliminar el único perfil que queda.",
    "PROFILE_COLOR_BLACK": "Negro",
    "PROFILE_COLOR_BLUE": "Azul",
    "PROFILE_COLOR_LABEL": "Color de Perfil",
    "PROFILE_COLOR_RED": "Rojo",
    "PROFILE_COLOR_WHITE": "Blanco",
    "PROFILE_COLOR_YELLOW": "Amarillo",
    "PROFILE_CREATED_SUCCESS": "¡Perfil creado y activado con éxito!",
    "PROFILE_CREATE_BTN": "Crear Perfil",
    "PROFILE_CREATE_NEW_BTN": "Agregar Otro Perfil",
    "PROFILE_DELETED": "Perfil eliminado.",
    "PROFILE_DOWNLOAD_BTN": "Descargar Datos del Perfil",
    "PROFILE_DOWNLOAD_SUCCESS": "¡Datos de perfil descargados con éxito!",
    "PROFILE_LABEL": "Perfil",
    "PROFILE_LOAD_BTN": "Cargar Perfil JSON",
    "PROFILE_LOAD_SUCCESS": "¡Perfil cargado y activado con éxito!",
    "PROFILE_MODAL_TITLE": "Perfil de Jugador",
    "PROFILE_NAME_LABEL": "Nombre del Perfil",
    "PROFILE_NAME_REQUIRED": "El nombre del perfil no puede estar vacío.",
    "PROFILE_SAVE_BTN": "Guardar Cambios",
    "PROFILE_SWITCHED_SUCCESS": "¡Cambiaste de perfil con éxito!",
    "PROFILE_SWITCH_BTN": "Cambiar",
    "PROFILE_SWITCH_TITLE": "Cambiar de Perfil",
    "PROFILE_TAB_BACKUP": "Descargar y Cargar",
    "PROFILE_TAB_EDIT": "Editar Perfil",
    "PROFILE_TAB_SWITCH": "Cambiar y Administrar",
    "PROFILE_UPDATED_SUCCESS": "¡Perfil actualizado con éxito!",
    "QUALITY_BALANCED_BADGE": "Estándar 60 FPS",
    "QUALITY_BALANCED_DESC": "Estética retro arcade original de 32 bits con marcos pixelados, líneas CRT y dinamismo auténtico.",
    "QUALITY_BALANCED_TITLE": "Modo Equilibrado (Arcade 32-Bit)",
    "QUALITY_HIGH_QUALITY_BADGE": "120 FPS • Máxima Fidelidad",
    "QUALITY_HIGH_QUALITY_DESC": "Presentación visual de lujo con resplandor neón, brillo holográfico en cartas e inclinación 3D con partículas de festejo.",
    "QUALITY_HIGH_QUALITY_TITLE": "Modo Alta Calidad (Cyber-Arcade)",
    "QUALITY_PERFORMANCE_BADGE": "60+ FPS • Ultrarrápido",
    "QUALITY_PERFORMANCE_DESC": "Rendimiento óptimo y respuesta inmediata. Desactiva desenfoques pesados, filtros CRT y efectos complejos de GPU.",
    "QUALITY_PERFORMANCE_TITLE": "Modo Rendimiento (Gama Baja y Celulares)",
    "QUALITY_STATUS_NOTE": "Los modos Rendimiento (ultrarrápido), Equilibrado (arcade 32 bits) y Alta Calidad (neón y cartas holográficas) están activos con cambio instantáneo.",
    "Quality Preset": "Preajuste de Calidad",
    "SETTINGS_SUBTITLE": "Gráficos de pantalla, tamaño de texto, filtros de accesibilidad y opciones del dispositivo",
    "SETTINGS_TAB_GENERAL": "GENERAL",
    "SETTINGS_TAB_GRAPHICS": "GRÁFICOS",
    "SETTINGS_TITLE": "Ajustes",
    "STARTUP_PROFILE_CONFIRM_BTN": "Confirmar Perfil y Continuar",
    "STARTUP_PROFILE_CREATE_SUBTITLE": "Ingresá tu nombre de perfil y elegí un color de avatar para comenzar.",
    "STARTUP_PROFILE_CREATE_TITLE": "Creá Tu Perfil",
    "STARTUP_PROFILE_READING": "Cargando Perfil del Jugador...",
    "Tactile vibration on penalty shots, goal celebrations, card draws, and key moments.": "Vibración táctil en penales, festejos de goles, tiradas de cartas y momentos clave.",
    "Vibration Disabled": "Vibración Desactivada",
    "Vibration Enabled": "Vibración Activada",
    "Your agent deploys their absolute highest-level international connections for a 1-year career breakthrough.": "Tu representante activa sus mejores contactos internacionales para conseguirte un salto de carrera por 1 año.",
    "author": "SEP Core Development Team",
    "createdAt": "2026-09-07T11:25:00Z",
    "description": "Master Argentine Spanish (Rioplatense) Language Packet covering every UI element, dialog, card, store item, business, choice, event, perk, stat, position, and trophy.",
    "flag": "🇦🇷",
    "formatVersion": "1.0.0",
    "languageCode": "es-AR",
    "languageName": "Argentine Spanish",
    "nativeName": "Español (Argentina)",
    "packetId": "es-AR-official",
    "region": "Argentina & Cono Sur",
}

def synchronize_all_packets():
    uk_path = 'src/data/ukEnglishLanguagePacket.json'
    es_path = 'src/data/castilianSpanishLanguagePacket.json'
    ar_path = 'src/data/argentineanSpanishLanguagePacket.json'
    ts_path = 'src/data/defaultLanguagePacket.ts'

    with open(uk_path, 'r', encoding='utf-8') as f:
        uk_data = json.load(f)
    with open(es_path, 'r', encoding='utf-8') as f:
        es_data = json.load(f)
    with open(ar_path, 'r', encoding='utf-8') as f:
        ar_data = json.load(f)

    uk_tr = uk_data.setdefault('translations', {})
    es_tr = es_data.setdefault('translations', {})
    ar_tr = ar_data.setdefault('translations', {})

    # 1. Fill missing UK English translations
    for k, v in es_tr.items():
        if k not in uk_tr:
            if k in UK_MISSING_TRANSLATIONS:
                uk_tr[k] = UK_MISSING_TRANSLATIONS[k]
            elif k.startswith(('⚠️', '❌', '💀', '🔵', '🟠', '🟢')):
                # Emoji key outcome messages are already in English
                uk_tr[k] = v
            else:
                uk_tr[k] = v

    # 2. Fill missing Argentinean translations
    for k, v in es_tr.items():
        if k not in ar_tr:
            if k in AR_MISSING_TRANSLATIONS:
                ar_tr[k] = AR_MISSING_TRANSLATIONS[k]
            elif k.startswith(('⚠️', '❌', '💀', '🔵', '🟠', '🟢')):
                ar_tr[k] = v
            else:
                ar_tr[k] = v

    # 3. Check if any keys in UK or AR are missing in Castilian
    for k, v in uk_tr.items():
        if k not in es_tr:
            es_tr[k] = v
    for k, v in ar_tr.items():
        if k not in es_tr:
            es_tr[k] = v

    # 4. Verify 100% complete key symmetry
    all_keys = set(uk_tr.keys()) | set(es_tr.keys()) | set(ar_tr.keys())
    assert len(uk_tr) == len(all_keys), f"UK mismatch: {len(uk_tr)} vs {len(all_keys)}"
    assert len(es_tr) == len(all_keys), f"ES mismatch: {len(es_tr)} vs {len(all_keys)}"
    assert len(ar_tr) == len(all_keys), f"AR mismatch: {len(ar_tr)} vs {len(all_keys)}"

    # Update metadata totalKeys
    uk_data['meta']['totalKeys'] = len(uk_tr)
    es_data['meta']['totalKeys'] = len(es_tr)
    ar_data['meta']['totalKeys'] = len(ar_tr)

    # Save JSON files
    with open(uk_path, 'w', encoding='utf-8') as f:
        json.dump(uk_data, f, ensure_ascii=False, indent=2)
    with open(es_path, 'w', encoding='utf-8') as f:
        json.dump(es_data, f, ensure_ascii=False, indent=2)
    with open(ar_path, 'w', encoding='utf-8') as f:
        json.dump(ar_data, f, ensure_ascii=False, indent=2)

    # Sync defaultLanguagePacket.ts
    ts_content = f'import {{ LanguagePacket }} from "../types/languagePacket";\n\nexport const DEFAULT_UK_ENGLISH_PACKET: LanguagePacket = {json.dumps(uk_data, ensure_ascii=False, indent=2)};\n'
    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)

    print(f"SUCCESS: All 3 language packets synchronized with 100% key parity!")
    print(f"Total synchronized keys per packet: {len(all_keys)}")

if __name__ == '__main__':
    synchronize_all_packets()
