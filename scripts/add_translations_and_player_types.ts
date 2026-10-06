import fs from 'fs';
import path from 'path';

const missing64: Record<string, { ar: string; es: string; en: string }> = {
  " ": { ar: " ", es: " ", en: " " },
  " (": { ar: " (", es: " (", en: " (" },
  ",": { ar: ",", es: ",", en: "," },
  "-": { ar: "-", es: "-", en: "-" },
  ".": { ar: ".", es: ".", en: "." },
  "T": { ar: "T", es: "T", en: "T" },
  "a": { ar: "a", es: "a", en: "a" },
  "|": { ar: "|", es: "|", en: "|" },
  "Card JSON configuration saved!": {
    ar: "¡Configuración JSON de la carta guardada!",
    es: "¡Configuración JSON de la carta guardada!",
    en: "Card JSON configuration saved!"
  },
  "Card PNG exported successfully!": {
    ar: "¡Imagen PNG de la carta exportada con éxito!",
    es: "¡Imagen PNG de la carta exportada con éxito!",
    en: "Card PNG exported successfully!"
  },
  "Card loaded from JSON!": {
    ar: "¡Carta cargada exitosamente desde JSON!",
    es: "¡Carta cargada exitosamente desde JSON!",
    en: "Card loaded from JSON!"
  },
  "Crash log history cleared": {
    ar: "Historial de registros de error limpiado",
    es: "Historial de registros de fallos limpiado",
    en: "Crash log history cleared"
  },
  "Error exporting card image": {
    ar: "Error al exportar la imagen de la carta",
    es: "Error al exportar la imagen de la carta",
    en: "Error exporting card image"
  },
  "Error parsing JSON document file.": {
    ar: "Error al procesar el archivo de documento JSON.",
    es: "Error al procesar el archivo de documento JSON.",
    en: "Error parsing JSON document file."
  },
  "Error parsing JSON file": {
    ar: "Error al procesar el archivo JSON",
    es: "Error al procesar el archivo JSON",
    en: "Error parsing JSON file"
  },
  "Invalid card JSON format": {
    ar: "Formato JSON de carta no válido",
    es: "Formato JSON de carta no válido",
    en: "Invalid card JSON format"
  },
  "Invalid document format or no cards found in file.": {
    ar: "Formato de documento no válido o no se encontraron cartas en el archivo.",
    es: "Formato de documento no válido o no se encontraron cartas en el archivo.",
    en: "Invalid document format or no cards found in file."
  },
  "Minimum squad size reached. Add another player before removing this player.": {
    ar: "Tamaño mínimo de plantel alcanzado. Añadí otro jugador antes de eliminar a este.",
    es: "Tamaño mínimo de plantilla alcanzado. Añade otro jugador antes de eliminar a este.",
    en: "Minimum squad size reached. Add another player before removing this player."
  },
  "No cards to delete in this category.": {
    ar: "No hay cartas para eliminar en esta categoría.",
    es: "No hay cartas para eliminar en esta categoría.",
    en: "No cards to delete in this category."
  },
  "Please enter a name for the card!": {
    ar: "¡Por favor ingresá un nombre para la carta!",
    es: "¡Por favor introduce un nombre para la carta!",
    en: "Please enter a name for the card!"
  },
  "Please enter a team name": {
    ar: "Por favor ingresá el nombre del equipo",
    es: "Por favor introduce el nombre del equipo",
    en: "Please enter a team name"
  },
  "Please select a league for the team": {
    ar: "Por favor seleccioná una liga para el equipo",
    es: "Por favor selecciona una liga para el equipo",
    en: "Please select a league for the team"
  },
  "Please specify a perk name!": {
    ar: "¡Por favor especificá un nombre para la ventaja!",
    es: "¡Por favor especifica un nombre para la ventaja!",
    en: "Please specify a perk name!"
  },
  "Report shared successfully": {
    ar: "Informe compartido con éxito",
    es: "Informe compartido con éxito",
    en: "Report shared successfully"
  },
  "Reset to default New Prodigy card": {
    ar: "Restablecer a la carta por defecto de Nueva Promesa",
    es: "Restablecer a la carta por defecto de Nueva Promesa",
    en: "Reset to default New Prodigy card"
  },
  "Sharing not supported on this browser.": {
    ar: "La función de compartir no es compatible con este navegador.",
    es: "La función de compartir no es compatible con este navegador.",
    en: "Sharing not supported on this browser."
  },
  "ℹ️ Special Hairstyles have signature colors and disable hair dyes.": {
    ar: "ℹ️ Los peinados especiales tienen colores distintivos y desactivan las tinturas.",
    es: "ℹ️ Los peinados especiales tienen colores distintivos y desactivan los tintes de pelo.",
    en: "ℹ️ Special Hairstyles have signature colors and disable hair dyes."
  },
  "⚠️ Attribute is already maxed at 99!": {
    ar: "⚠️ ¡El atributo ya está al tope máximo de 99!",
    es: "⚠️ ¡El atributo ya está al máximo de 99!",
    en: "⚠️ Attribute is already maxed at 99!"
  },
  "⚠️ No unassigned stat points available!": {
    ar: "⚠️ ¡No hay puntos de atributo sin asignar disponibles!",
    es: "⚠️ ¡No hay puntos de atributo sin asignar disponibles!",
    en: "⚠️ No unassigned stat points available!"
  },
  "⚠️ You still have unassigned attribute points. Please assign and save all points before continuing.": {
    ar: "⚠️ Todavía tenés puntos de atributo sin asignar. Por favor asigná y guardá todos los puntos antes de continuar.",
    es: "⚠️ Todavía tienes puntos de atributo sin asignar. Por favor asigna y guarda todos los puntos antes de continuar.",
    en: "⚠️ You still have unassigned attribute points. Please assign and save all points before continuing."
  },
  "⚡ Editor Mode Activated! Infinite 99/99 Cash Unlocked.": {
    ar: "⚡ ¡Modo Editor Activado! Dinero Infinito 99/99 Desbloqueado.",
    es: "⚡ ¡Modo Editor Activado! Dinero Infinito 99/99 Desbloqueado.",
    en: "⚡ Editor Mode Activated! Infinite 99/99 Cash Unlocked."
  },
  "⚡ Fitness is already at maximum (100%)!": {
    ar: "⚡ ¡La condición física ya está al máximo (100%)!",
    es: "⚡ ¡La condición física ya está al máximo (100%)!",
    en: "⚡ Fitness is already at maximum (100%)!"
  },
  "⚡ UNLOCKED GOAT TIER!": {
    ar: "⚡ ¡NIVEL GOAT HISTÓRICO DESBLOQUEADO!",
    es: "⚡ ¡NIVEL GOAT HISTÓRICO DESBLOQUEADO!",
    en: "⚡ UNLOCKED GOAT TIER!"
  },
  "⛔ Potential Ceiling Reached! You cannot distribute stat points while your Overall matches or exceeds your Potential.": {
    ar: "⛔ ¡Techo de Potencial Alcanzado! No podés distribuir puntos mientras tu Media General iguale o supere tu Potencial.",
    es: "⛔ ¡Techo de Potencial Alcanzado! No puedes distribuir puntos mientras tu Media General iguale o supere tu Potencial.",
    en: "⛔ Potential Ceiling Reached! You cannot distribute stat points while your Overall matches or exceeds your Potential."
  },
  "✅ Global Competitions database imported successfully!": {
    ar: "✅ ¡Base de datos de Competiciones Globales importada con éxito!",
    es: "✅ ¡Base de datos de Competiciones Globales importada con éxito!",
    en: "✅ Global Competitions database imported successfully!"
  },
  "❌ Chemistry is already at 0%!": {
    ar: "❌ ¡La química del equipo ya está en 0%!",
    es: "❌ ¡La química del equipo ya está en 0%!",
    en: "❌ Chemistry is already at 0%!"
  },
  "❌ DATABASE ERROR: No official Youth League team found for this city.": {
    ar: "❌ ERROR DE BASE DE DATOS: No se encontró ningún equipo juvenil oficial para esta ciudad.",
    es: "❌ ERROR DE BASE DE DATOS: No se encontró ningún equipo juvenil oficial para esta ciudad.",
    en: "❌ DATABASE ERROR: No official Youth League team found for this city."
  },
  "❌ Invalid JSON file. Please check syntax.": {
    ar: "❌ Archivo JSON no válido. Por favor comprobá la sintaxis.",
    es: "❌ Archivo JSON no válido. Por favor comprueba la sintaxis.",
    en: "❌ Invalid JSON file. Please check syntax."
  },
  "❌ No Injury Recovery Points available!": {
    ar: "❌ ¡No hay puntos de recuperación de lesiones disponibles!",
    es: "❌ ¡No hay puntos de recuperación de lesiones disponibles!",
    en: "❌ No Injury Recovery Points available!"
  },
  "❌ No Recovery Supplements in inventory!": {
    ar: "❌ ¡No tenés Suplementos de Recuperación en el inventario!",
    es: "❌ ¡No tienes Suplementos de Recuperación en el inventario!",
    en: "❌ No Recovery Supplements in inventory!"
  },
  "❌ No Recovery Supplements in inventory! Purchase one in the Store (€10,000).": {
    ar: "❌ ¡No tenés Suplementos de Recuperación en el inventario! Comprá uno en la Tienda (€10.000).",
    es: "❌ ¡No tienes Suplementos de Recuperación en el inventario! Compra uno en la Tienda (€10.000).",
    en: "❌ No Recovery Supplements in inventory! Purchase one in the Store (€10,000)."
  },
  "❌ Transfer offer declined.": {
    ar: "❌ Oferta de transferencia rechazada.",
    es: "❌ Oferta de traspaso rechazada.",
    en: "❌ Transfer offer declined."
  },
  "❤️ Parents already gave advice this season.": {
    ar: "❤️ Tus padres ya te dieron consejos en esta temporada.",
    es: "❤️ Tus padres ya te dieron consejos esta temporada.",
    en: "❤️ Parents already gave advice this season."
  },
  "🃏 Card Deck Editor Opened! Create, save & import custom card decks.": {
    ar: "🃏 ¡Editor de Mazos Abierto! Creá, guardá e importá mazos personalizados.",
    es: "🃏 ¡Editor de Mazos Abierto! Crea, guarda e importa barajas personalizadas.",
    en: "🃏 Card Deck Editor Opened! Create, save & import custom card decks."
  },
  "🌱 Youth Academy activates immediately upon Character Creation completion!": {
    ar: "🌱 ¡La Academia Juvenil se activa inmediatamente al completar la Creación de Personaje!",
    es: "🌱 ¡La Academia Juvenil se activa inmediatamente al completar la Creación de Personaje!",
    en: "🌱 Youth Academy activates immediately upon Character Creation completion!"
  },
  "🎉 Character Confirmed & Saved!": {
    ar: "🎉 ¡Personaje Confirmado y Guardado!",
    es: "🎉 ¡Personaje Confirmado y Guardado!",
    en: "🎉 Character Confirmed & Saved!"
  },
  "🎮 Resuming saved career progress...": {
    ar: "🎮 Reanudando progreso de carrera guardado...",
    es: "🎮 Reanudando progreso de carrera guardado...",
    en: "🎮 Resuming saved career progress..."
  },
  "🎮 Unique Career Restored from Continue!": {
    ar: "🎮 ¡Carrera Única Reanudada desde Continuar!",
    es: "🎮 ¡Carrera Única Reanudada desde Continuar!",
    en: "🎮 Unique Career Restored from Continue!"
  },
  "🎮 Unique Career Started! Welcome to Character Creation.": {
    ar: "🎮 ¡Carrera Única Iniciada! Bienvenido a la Creación de Personaje.",
    es: "🎮 ¡Carrera Única Iniciada! Bienvenido a la Creación de Personaje.",
    en: "🎮 Unique Career Started! Welcome to Character Creation."
  },
  "🏆 Achievements coming soon! Track career trophies, milestones, and record unlocks.": {
    ar: "🏆 ¡Logros próximamente! Seguí tus trofeos, hitos y récords de carrera.",
    es: "🏆 ¡Logros próximamente! Sigue tus trofeos, hitos y récords de carrera.",
    en: "🏆 Achievements coming soon! Track career trophies, milestones, and record unlocks."
  },
  "🏆 Competitions Editor Opened! Customize leagues, tournaments, UI designs & qualification rules.": {
    ar: "🏆 ¡Editor de Competiciones Abierto! Personalizá ligas, torneos, diseños y reglas de clasificación.",
    es: "🏆 ¡Editor de Competiciones Abierto! Personaliza ligas, torneos, diseños y reglas de clasificación.",
    en: "🏆 Competitions Editor Opened! Customize leagues, tournaments, UI designs & qualification rules."
  },
  "🏢 Navigated to Accounting: Purchase new property/business investments!": {
    ar: "🏢 Navegaste a Finanzas: ¡Comprá nuevas propiedades e inversiones comerciales!",
    es: "🏢 Navegaste a Finanzas: ¡Compra nuevas propiedades e inversiones comerciales!",
    en: "🏢 Navigated to Accounting: Purchase new property/business investments!"
  },
  "💾 Career progress saved to Continue! Returned to Main Menu.": {
    ar: "💾 ¡Progreso de carrera guardado en Continuar! Volviste al Menú Principal.",
    es: "💾 ¡Progreso de carrera guardado en Continuar! Has vuelto al Menú Principal.",
    en: "💾 Career progress saved to Continue! Returned to Main Menu."
  },
  "📈 Navigated to Accounting: Upgrade your property tier!": {
    ar: "📈 Navegaste a Finanzas: ¡Mejorá el nivel de tus propiedades!",
    es: "📈 Navegaste a Finanzas: ¡Mejora el nivel de tus propiedades!",
    en: "📈 Navigated to Accounting: Upgrade your property tier!"
  },
  "📈 Navigated to Development: Assign your unassigned attribute points!": {
    ar: "📈 Navegaste a Desarrollo: ¡Asigná tus puntos de atributo disponibles!",
    es: "📈 Navegaste a Desarrollo: ¡Asigna tus puntos de atributo disponibles!",
    en: "📈 Navigated to Development: Assign your unassigned attribute points!"
  },
  "📥 Exported Global Competitions database to JSON file!": {
    ar: "📥 ¡Base de datos de Competiciones Globales exportada a archivo JSON!",
    es: "📥 ¡Base de datos de Competiciones Globales exportada a archivo JSON!",
    en: "📥 Exported Global Competitions database to JSON file!"
  },
  "🔄 Reset all competitions to factory defaults.": {
    ar: "🔄 Se restablecieron todas las competiciones a los valores por defecto.",
    es: "🔄 Se han restablecido todas las competiciones a los valores por defecto.",
    en: "🔄 Reset all competitions to factory defaults."
  },
  "🔒 No saved career found! Start a New Game to begin.": {
    ar: "🔒 ¡No se encontró ninguna carrera guardada! Iniciá una Nueva Partida para comenzar.",
    es: "🔒 ¡No se encontró ninguna carrera guardada! Inicia una Nueva Partida para comenzar.",
    en: "🔒 No saved career found! Start a New Game to begin."
  },
  "🗑️ Card deleted.": {
    ar: "🗑️ Carta eliminada.",
    es: "🗑️ Carta eliminada.",
    en: "🗑️ Card deleted."
  },
  "🛒 Navigated to Store: Buy Pro Equipment for performance benefits!": {
    ar: "🛒 Navegaste a la Tienda: ¡Comprá equipamiento profesional para mejorar tu rendimiento!",
    es: "🛒 Navegaste a la Tienda: ¡Compra equipamiento profesional para mejorar tu rendimiento!",
    en: "🛒 Navigated to Store: Buy Pro Equipment for performance benefits!"
  },
  "🛒 Navigated to Store: Buy Season Boost for development acceleration!": {
    ar: "🛒 Navegaste a la Tienda: ¡Comprá potenciadores de temporada para acelerar tu desarrollo!",
    es: "🛒 Navegaste a la Tienda: ¡Compra potenciadores de temporada para acelerar tu desarrollo!",
    en: "🛒 Navigated to Store: Buy Season Boost for development acceleration!"
  },
  "🛒 Navigated to Store: Purchase a Recovery Supplement (€10,000).": {
    ar: "🛒 Navegaste a la Tienda: Comprá un Suplemento de Recuperación (€10.000).",
    es: "🛒 Navegaste a la Tienda: Compra un Suplemento de Recuperación (€10.000).",
    en: "🛒 Navigated to Store: Purchase a Recovery Supplement (€10,000)."
  },
  "🛡️ Team Editor Opened! Customize club names, emblems & shirt designs.": {
    ar: "🛡️ ¡Editor de Equipos Abierto! Personalizá nombres de club, escudos y camisetas.",
    es: "🛡️ ¡Editor de Equipos Abierto! Personaliza nombres de club, escudos y camisetas.",
    en: "🛡️ Team Editor Opened! Customize club names, emblems & shirt designs."
  },
  "🧪 Navigated to Team Synergy: Improve team chemistry!": {
    ar: "🧪 Navegaste a Sinergia de Equipo: ¡Mejorá la química del plantel!",
    es: "🧪 Navegaste a Sinergia de Equipo: ¡Mejora la química del equipo!",
    en: "🧪 Navigated to Team Synergy: Improve team chemistry!"
  }
};

const playerTypeTranslations: Record<string, { ar: string; es: string; en: string }> = {
  // Names
  "Speedster": { ar: "Velocista", es: "Velocista", en: "Speedster" },
  "Tank": { ar: "Tanque", es: "Tanque", en: "Tank" },
  "Flair": { ar: "Virtuoso", es: "Virtuoso", en: "Flair" },
  "Architect": { ar: "Arquitecto", es: "Arquitecto", en: "Architect" },
  "Ice Cold": { ar: "Sangre Fría", es: "Sangre Fría", en: "Ice Cold" },
  "Ice-Cold": { ar: "Sangre Fría", es: "Sangre Fría", en: "Ice-Cold" },
  "Patient": { ar: "Estratégico", es: "Estratégico", en: "Patient" },
  "Cannon": { ar: "Bombardero", es: "Cañonero", en: "Cannon" },
  "Wasted Talent": { ar: "Crack Rebelde", es: "Talento Rebelde", en: "Wasted Talent" },

  // Badges
  "⚡ VELOCITY": { ar: "⚡ VELOCIDAD", es: "⚡ VELOCIDAD", en: "⚡ VELOCITY" },
  "🛡️ COLOSSUS": { ar: "🛡️ COLOSO", es: "🛡️ COLOSO", en: "🛡️ COLOSSUS" },
  "🛡️ BULWARK": { ar: "🛡️ MURALLA", es: "🛡️ BASTIÓN", en: "🛡️ BULWARK" },
  "✨ MAGICIAN": { ar: "✨ MAGO DEL POTRERO", es: "✨ MAGO DEL BALÓN", en: "✨ MAGICIAN" },
  "✨ VIRTUOSO": { ar: "✨ VIRTUOSO", es: "✨ VIRTUOSO", en: "✨ VIRTUOSO" },
  "📐 MAESTRO": { ar: "📐 MAESTRO", es: "📐 MAESTRO", en: "📐 MAESTRO" },
  "🧭 VISIONARY": { ar: "🧭 VISIONARIO", es: "🧭 VISIONARIO", en: "🧭 VISIONARY" },
  "❄️ FINISHER": { ar: "❄️ DEFINIDOR LETAL", es: "❄️ DEFINIDOR CLÍNICO", en: "❄️ FINISHER" },
  "❄️ UNFAZED": { ar: "❄️ IMPERTURBABLE", es: "❄️ IMPERTURBABLE", en: "❄️ UNFAZED" },
  "🧱 GUARDIAN": { ar: "🧱 GUARDIÁN", es: "🧱 GUARDIÁN", en: "🧱 GUARDIAN" },
  "🎯 DISCIPLINE": { ar: "🎯 DISCIPLINA", es: "🎯 DISCIPLINA", en: "🎯 DISCIPLINE" },
  "💥 ARTILLERY": { ar: "💥 ARTILLERÍA", es: "💥 ARTILLERÍA", en: "💥 ARTILLERY" },
  "💣 BALLISTIC": { ar: "💣 BALÍSTICO", es: "💣 BALÍSTICO", en: "💣 BALLISTIC" },
  "🔮 VOLATILE GENIUS": { ar: "🔮 GENIO VOLÁTIL", es: "🔮 GENIO VOLÁTIL", en: "🔮 VOLATILE GENIUS" },
  "🔥 VOLATILE": { ar: "🔥 VOLÁTIL", es: "🔥 VOLÁTIL", en: "🔥 VOLATILE" },

  // Subtitles
  "Lightning Pace & Explosive Burst": {
    ar: "Pique Demoledor y Aceleración Explosiva",
    es: "Ritmo Relámpago y Aceleración Explosiva",
    en: "Lightning Pace & Explosive Burst"
  },
  "Physical Powerhouse & Aerial Juggernaut": {
    ar: "Potencia Física y Gigante Aéreo",
    es: "Portento Físico y Titán Aéreo",
    en: "Physical Powerhouse & Aerial Juggernaut"
  },
  "Pure Physical Dominance & High Work Rate": {
    ar: "Potencia Física y Despliegue Incansable",
    es: "Poderío Físico Puro y Despliegue Incansable",
    en: "Pure Physical Dominance & High Work Rate"
  },
  "Street Magician & Master Dribbler": {
    ar: "Mago del Potrero y Gambeteador Serial",
    es: "Mago del Regate y Creador Desequilibrante",
    en: "Street Magician & Master Dribbler"
  },
  "Effortless Dribbling & Playmaking Ingenuity": {
    ar: "Gambeta Desequilibrante y Magia Pura",
    es: "Regate Desequilibrante y Magia Creativa",
    en: "Effortless Dribbling & Playmaking Ingenuity"
  },
  "Tactical Maestro & Visionary Playmaker": {
    ar: "Maestro Táctico y Conductor Visionario",
    es: "Maestro Táctico y Organizador Visionario",
    en: "Tactical Maestro & Visionary Playmaker"
  },
  "Visionary Passing & Tactical Mastery": {
    ar: "Visión Privilegiada y Maestría Táctica",
    es: "Visión de Juego Privilegiada y Maestría Táctica",
    en: "Visionary Passing & Tactical Mastery"
  },
  "Ruthless Lethality & Clutch Composure": {
    ar: "Frialdad Implacable y Definición en Momentos Calientes",
    es: "Letalidad Implacable y Sangre Fría en Momentos Decisivos",
    en: "Ruthless Lethality & Clutch Composure"
  },
  "Iron Composure & Clinical Finishing": {
    ar: "Frialdad Absoluta y Definición Quirúrgica",
    es: "Sangre Fría de Acero y Definición Quirúrgica",
    en: "Iron Composure & Clinical Finishing"
  },
  "Tireless Engine & Defensive Shield": {
    ar: "Pulmón Incansable y Escudo Defensivo",
    es: "Motor Incansable y Muralla Defensiva",
    en: "Tireless Engine & Defensive Shield"
  },
  "Calculated Positioning & Relentless Discipline": {
    ar: "Ubicación Milimétrica y Rigor Táctico",
    es: "Ubicación Milimétrica y Rigor Táctico",
    en: "Calculated Positioning & Relentless Discipline"
  },
  "Ballistic Striker & Shot Power Artillery": {
    ar: "Artillería Pesada y Bombazos Teledirigidos",
    es: "Artillería Pesada y Disparos Misilísticos",
    en: "Ballistic Striker & Shot Power Artillery"
  },
  "Devastating Long Shots & Striking Power": {
    ar: "Pegada Devastadora y Bombazos de Distancia",
    es: "Tiro de Larga Distancia Devastador y Potencia de Golpeo",
    en: "Devastating Long Shots & Striking Power"
  },
  "Supreme Natural Magic & Severe Disciplinary Issues": {
    ar: "Magia Sobrenatural y Problemas Graves de Disciplina",
    es: "Magia Innata y Conflictos Disciplinarios Graves",
    en: "Supreme Natural Magic & Severe Disciplinary Issues"
  },
  "Genius on the Ball, Unpredictable Character": {
    ar: "Genio con la Pelota, Carácter Impredecible",
    es: "Genio con el Balón, Carácter Impredecible",
    en: "Genius on the Ball, Unpredictable Character"
  },

  // Archetype Roles
  "Pure Kinetic Engine": { ar: "Motor Cinético Puro", es: "Motor Cinético Puro", en: "Pure Kinetic Engine" },
  "Immovable Force": { ar: "Fuerza Inamovible", es: "Fuerza Inamovible", en: "Immovable Force" },
  "Indomitable Physical Force": { ar: "Fuerza Física Indomable", es: "Fuerza Física Indomable", en: "Indomitable Physical Force" },
  "Samba Virtuoso": { ar: "Artista de la Gambeta", es: "Virtuoso del Regate", en: "Samba Virtuoso" },
  "Maverick Artist": { ar: "Artista Impredecible", es: "Artista Impredecible", en: "Maverick Artist" },
  "Metronome Conductor": { ar: "Metrónomo y Conductor", es: "Metrónomo del Equipo", en: "Metronome Conductor" },
  "Master Tactician": { ar: "Maestro Estratega", es: "Maestro Estratega", en: "Master Tactician" },
  "Apex Assassin": { ar: "Asesino del Área", es: "Goleador Implacable", en: "Apex Assassin" },
  "Cold-Blooded Finisher": { ar: "Definidor Letal", es: "Definidor Letal", en: "Cold-Blooded Finisher" },
  "Tactical Anchor": { ar: "Eje Táctico", es: "Pivote Táctico", en: "Tactical Anchor" },
  "Long-Range Bombarder": { ar: "Bombardero de Distancia", es: "Bombardero de Larga Distancia", en: "Long-Range Bombarder" },
  "Long-Range Destroyer": { ar: "Bombardero de Distancia", es: "Bombardero de Distancia", en: "Long-Range Destroyer" },
  "Unpredictable Maverick": { ar: "Fenómeno Indomable", es: "Fenómeno Indomable", en: "Unpredictable Maverick" },
  "Flawed Phenomenon": { ar: "Fenómeno Indomable", es: "Fenómeno Indomable", en: "Flawed Phenomenon" },

  // Taglines
  "Outrunning defensive lines before they can even set their shape.": {
    ar: "Desborda a las defensas antes de que puedan armar la línea.",
    es: "Desborda a las líneas defensivas antes de que puedan ordenarse.",
    en: "Outrunning defensive lines before they can even set their shape."
  },
  "Dominating physical duels, aerial battles, and defensive collisions.": {
    ar: "Domina los duelos físicos, la batalla aérea y los choques defensivos.",
    es: "Domina los duelos físicos, las disputas aéreas y las colisiones defensivas.",
    en: "Dominating physical duels, aerial battles, and defensive collisions."
  },
  "Overpowering duels and asserting dominance through raw strength.": {
    ar: "Gana todos los duelos cuerpo a cuerpo y se impone por potencia.",
    es: "Gana todos los duelos y se impone por pura potencia física.",
    en: "Overpowering duels and asserting dominance through raw strength."
  },
  "Mesmerizing defenders with close control, elastis, and feints in tight spaces.": {
    ar: "Fascina a los defensores con control milimétrico, elásticas y amagues en una baldosa.",
    es: "Enamora con regates en una baldosa, elásticas y quiebros impredecibles.",
    en: "Mesmerizing defenders with close control, elastis, and feints in tight spaces."
  },
  "Turning defensive pressure into an invitation for magic.": {
    ar: "Convierte la presión del rival en una invitación para tirar un caño o inventar magia.",
    es: "Convierte la presión rival en una invitación al espectáculo.",
    en: "Turning defensive pressure into an invitation for magic."
  },
  "Dictating the match tempo with surgical line-breaking passes and spatial geometry.": {
    ar: "Maneja los tiempos con pases quirúrgicos entre líneas y lectura espacial.",
    es: "Dicta el ritmo del encuentro con pases quirúrgicos que rompen líneas.",
    en: "Dictating the match tempo with surgical line-breaking passes and spatial geometry."
  },
  "Dictating game tempo and orchestrating team structure.": {
    ar: "Maneja los hilos del partido y los tiempos del equipo.",
    es: "Dicta el ritmo del partido y orquesta la estructura del equipo.",
    en: "Dictating game tempo and orchestrating team structure."
  },
  "Zero heartbeat in the penalty box; clinical execution when everything is on the line.": {
    ar: "Pulso de acero en el área rival; definición quirúrgica cuando la pelota quema.",
    es: "Cero pulsaciones dentro del área; ejecución clínica en momentos de máxima presión.",
    en: "Zero heartbeat in the penalty box; clinical execution when everything is on the line."
  },
  "Never rattled by the occasion, ruthless when the net beckons.": {
    ar: "Inmune a la presión de los clásicos, letal cuando queda mano a mano frente al arco.",
    es: "Nunca tiembla ante la presión; implacable frente a la portería.",
    en: "Never rattled by the occasion, ruthless when the net beckons."
  },
  "Relentless work rate, discipline, and anticipation that smothers opposition attacks.": {
    ar: "Despliegue incansable, disciplina y anticipación para ahogar los ataques rivales.",
    es: "Entrega constante, rigor y anticipación que asfixian los ataques rivales.",
    en: "Relentless work rate, discipline, and anticipation that smothers opposition attacks."
  },
  "Striking only when the odds tip irreversibly in their favor.": {
    ar: "Lee la jugada dos tiempos antes y golpea en el momento justo.",
    es: "Golpea justo cuando las probabilidades se inclinan a su favor.",
    en: "Striking only when the odds tip irreversibly in their favor."
  },
  "Unleashing unstoppable supersonic strikes from anywhere in the attacking half.": {
    ar: "Saca misiles imparables desde cualquier sector del campo rival.",
    es: "Desata misiles imparables desde cualquier rincón del ataque.",
    en: "Unleashing unstoppable supersonic strikes from anywhere in the attacking half."
  },
  "Unleashing thunderous strikes that bend physics and break crossbars.": {
    ar: "Saca misiles de media distancia que rompen arcos y revientan travesaños.",
    es: "Desata cañonazos imparables que desafían la física.",
    en: "Unleashing thunderous strikes that bend physics and break crossbars."
  },
  "World-class celestial technique and long-range fireworks, notorious for heated brawls and stupid red cards.": {
    ar: "Técnica de otra galaxia y misiles al ángulo, famoso por peleas calientes y rojas insólitas.",
    es: "Técnica mundial y golazos de ensueño, célebre por discusiones acaloradas y expulsiones evitables.",
    en: "World-class celestial technique and long-range fireworks, notorious for heated brawls and stupid red cards."
  },
  "A generational gift haunted by nocturnal indiscipline and erratic conduct.": {
    ar: "Un talento de otra galaxia acechado por la noche, la rebeldía y la polémica.",
    es: "Un don generacional acechado por la indisciplina nocturna y la rebeldía.",
    en: "A generational gift haunted by nocturnal indiscipline and erratic conduct."
  },

  // Descriptions
  "Born with explosive twitch muscle fibers and blazing acceleration. The Speedster relies on pure kinetic velocity, sharp transitional burst, and reflexive reactions to tear past opponents in open space.": {
    ar: "Nacido con fibras rápidas explosivas y una aceleración demoledora. El Velocista explota su velocidad punta pura, piques demoledores y reflejos felinos para romper defensas en campo abierto.",
    es: "Nacido con fibras musculares de contracción rápida y una aceleración fulgurante. El Velocista confía en su velocidad pura, cambios de ritmo brutales y reflejos para superar rivales en espacios abiertos.",
    en: "Born with explosive twitch muscle fibers and blazing acceleration. The Speedster relies on pure kinetic velocity, sharp transitional burst, and reflexive reactions to tear past opponents in open space."
  },
  "A commanding physical presence who overpowers adversaries in shoulder-to-shoulder contests, wins every ball in the air, and anchors defensive or offensive duels with sheer raw strength.": {
    ar: "Una presencia física imponente que arrasa con los rivales en el cuerpo a cuerpo, gana cada pelota por arriba y sostiene los duelos con pura potencia.",
    es: "Una presencia física imponente que se impone en el cuerpo a cuerpo, gana todos los balones por alto y fija los duelos con pura potencia muscular.",
    en: "A commanding physical presence who overpowers adversaries in shoulder-to-shoulder contests, wins every ball in the air, and anchors defensive or offensive duels with sheer raw strength."
  },
  "Blessed with supernatural close control, balance, and quick feet. The Street Magician can create chances out of absolutely nothing and leave defenders completely tied in knots.": {
    ar: "Dotado de un control sobrenatural en espacios reducidos, equilibrio y cintura de potrero. El Mago crea jugadas de la nada y deja pagando a los defensores.",
    es: "Bendecido con un control orientado sobrenatural, agilidad y cambios de dirección letales. Crea peligro de la nada y desarticula defensas con su regate.",
    en: "Blessed with supernatural close control, balance, and quick feet. The Street Magician can create chances out of absolutely nothing and leave defenders completely tied in knots."
  },
  "A chess master with high football IQ. The Architect always has their head on a swivel, sees passing angles nobody else can, and orchestrates the team rhythm with laser-guided delivery.": {
    ar: "Un ajedrecista con lectura total de la cancha. El Arquitecto mira antes de recibir, ve líneas de pase invisibles para los demás y maneja la orquesta con envíos teledirigidos.",
    es: "Un estratega con máxima inteligencia futbolística. Siempre con la cabeza levantada, encuentra líneas de pase imposibles y orquesta al equipo con precisión quirúrgica.",
    en: "A chess master with high football IQ. The Architect always has their head on a swivel, sees passing angles nobody else can, and orchestrates the team rhythm with laser-guided delivery."
  },
  "Possesses nerves of steel and unmatched composure under pressure. When a clutch goal is desperately needed in injury time, the Ice-Cold player calmly strokes it into the bottom corner without breaking a sweat.": {
    ar: "Nervios de titanio y frialdad inalterable bajo presión. Cuando se necesita el gol salvador en el tiempo de descuento, la clava contra el palo con total serenidad.",
    es: "Posee nervios de acero y una calma imperturbable bajo presión. Cuando el equipo necesita el gol de la victoria en el descuento, define con precisión quirúrgica.",
    en: "Possesses nerves of steel and unmatched composure under pressure. When a clutch goal is desperately needed in injury time, the Ice-Cold player calmly strokes it into the bottom corner without breaking a sweat."
  },
  "An indefatigable workhorse who never stops running. The Guardian reads opposing attacks before they develop, intercepts dangerous passes, and shields the defense through discipline and positional mastery.": {
    ar: "Un obrero incansable que nunca deja de correr. El Guardián lee los ataques rivales antes de que arranquen, intercepta pases clave y protege a la defensa con disciplina.",
    es: "Un pulmón incombustible que no deja de presionar. Lee las ofensivas del oponente antes de que nazcan, intercepta balones y sostiene al bloque con orden y rigor táctico.",
    en: "An indefatigable workhorse who never stops running. The Guardian reads opposing attacks before they develop, intercepts dangerous passes, and shields the defense through discipline and positional mastery."
  },
  "Armed with immense leg power and an explosive shooting technique. The Cannon can turn any clearance into a screamer from 35 yards, shattering the net and striking fear into opposing goalkeepers.": {
    ar: "Equipado con un cañón en la pierna y una técnica de remate fulminante. Puede transformar cualquier rebote a 35 metros en un bombazo que rompe redes y hace temblar al arquero.",
    es: "Dotado de una potencia de disparo aterradora y técnica balística de golpeo. Convierte cualquier despeje a 35 metros en un trallazo supersónico que destroza las redes.",
    en: "Armed with immense leg power and an explosive shooting technique. The Cannon can turn any clearance into a screamer from 35 yards, shattering the net and striking fear into opposing goalkeepers."
  },
  "A player blessed with generational raw genius and sublime ball-striking, but cursed with a short fuse and zero tactical patience. Capable of scoring a 40-yard bicycle kick in the 89th minute, then getting sent off in the 90th for an off-the-ball punch.": {
    ar: "Un jugador bendecido con magia de potrero inigualable y pegada divina, pero con mecha corta y cero paciencia táctica. Te clava una chilena al ángulo a los 89 y lo echan a los 90 por una trompada.",
    es: "Un jugador dotado de un talento generacional descomunal y golpeo sublime, pero con un temperamento volcánico y escasa disciplina. Capaz de marcar de chilena en el 89 y ser expulsado en el 90 por encararse con el rival.",
    en: "A player blessed with generational raw genius and sublime ball-striking, but cursed with a short fuse and zero tactical patience. Capable of scoring a 40-yard bicycle kick in the 89th minute, then getting sent off in the 90th for an off-the-ball punch."
  },
  "⚠️ High Disciplinary Risk: Starts at Bad Reputation Tier 1. Higher probability of cards, training feuds, and volatile reactions to manager decisions.": {
    ar: "⚠️ Alto Riesgo Disciplinario: Inicia en Nivel 1 de Mala Reputación. Mayor probabilidad de tarjetas, conflictos en los entrenamientos y reacciones calientes con el DT.",
    es: "⚠️ Alto Riesgo Disciplinario: Comienza en el Nivel 1 de Mala Reputación. Mayor probabilidad de tarjetas, disputas en entrenamientos y roces con las decisiones del entrenador.",
    en: "⚠️ High Disciplinary Risk: Starts at Bad Reputation Tier 1. Higher probability of cards, training feuds, and volatile reactions to manager decisions."
  },

  // Summaries
  "Extreme physical speed with elite transitional counter-attacking threat.": {
    ar: "Velocidad física extrema con letal amenaza de contragolpe en transición.",
    es: "Velocidad física extrema con letal amenaza de contragolpe en transición.",
    en: "Extreme physical speed with elite transitional counter-attacking threat."
  },
  "Extreme physical power and aerial domination; lacks explosive agility.": {
    ar: "Potencia física extrema y dominio aéreo absoluto; menor agilidad explosiva.",
    es: "Poderío físico extremo y dominio aéreo absoluto; menor agilidad explosiva.",
    en: "Extreme physical power and aerial domination; lacks explosive agility."
  },
  "Elite dribbling agility and flair; struggles with aerial challenges and pure physical endurance.": {
    ar: "Agilidad de regate y fantasía de élite; sufre en duelos aéreos y resistencia física pura.",
    es: "Agilidad de regate y desborde élite; sufre en disputas aéreas y resistencia física pura.",
    en: "Elite dribbling agility and flair; struggles with aerial challenges and pure physical endurance."
  },
  "Supreme passing vision and tactical composure; limited straight-line pace and physical strength.": {
    ar: "Visión de pase suprema y templanza táctica; menor velocidad en carrera lineal y potencia física.",
    es: "Visión de juego suprema y templanza táctica; menor velocidad punta y potencia física.",
    en: "Supreme passing vision and tactical composure; limited straight-line pace and physical strength."
  },
  "Supreme finishing accuracy, penalty nerves, and composure; low defensive contribution.": {
    ar: "Precisión de definición suprema, frialdad en penales y temple; escaso aporte defensivo.",
    es: "Precisión de remate suprema, templanza en penaltis y sangre fría; escasa aportación defensiva.",
    en: "Supreme finishing accuracy, penalty nerves, and composure; low defensive contribution."
  },
  "Supreme stamina and defensive awareness; modest creative flair and long-range shooting.": {
    ar: "Resistencia suprema y lectura defensiva; menor fantasía creativa y disparo lejano.",
    es: "Resistencia sobrehumana y lectura táctica defensiva; menor desborde creativo y tiro lejano.",
    en: "Supreme stamina and defensive awareness; modest creative flair and long-range shooting."
  },
  "Supreme shot power and long-distance threat; less suited to intricate short passing in congested boxes.": {
    ar: "Potencia de tiro suprema y peligro a distancia; menos cómodo en el toque corto en áreas abarrotadas.",
    es: "Potencia de golpeo suprema y peligro a larga distancia; menos adaptado a la asociación corta en espacios cerrados.",
    en: "Supreme shot power and long-distance threat; less suited to intricate short passing in congested boxes."
  },
  "Extreme technical brilliance with severe volatile temperament and defensive neglect.": {
    ar: "Brillantez técnica extrema con temperamento muy volátil y descuido defensivo.",
    es: "Brillantez técnica extrema con temperamento muy volátil y desatención defensiva.",
    en: "Extreme technical brilliance with severe volatile temperament and defensive neglect."
  }
};

const allEntries = { ...missing64, ...playerTypeTranslations };

// Update JSON files
const arPath = path.resolve('./src/data/argentineanSpanishLanguagePacket.json');
const esPath = path.resolve('./src/data/castilianSpanishLanguagePacket.json');
const enPath = path.resolve('./src/data/ukEnglishLanguagePacket.json');

const arJson = JSON.parse(fs.readFileSync(arPath, 'utf-8'));
const esJson = JSON.parse(fs.readFileSync(esPath, 'utf-8'));
const enJson = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

for (const [key, tr] of Object.entries(allEntries)) {
  arJson.translations[key] = tr.ar;
  esJson.translations[key] = tr.es;
  enJson.translations[key] = tr.en;
}

fs.writeFileSync(arPath, JSON.stringify(arJson, null, 2), 'utf-8');
fs.writeFileSync(esPath, JSON.stringify(esJson, null, 2), 'utf-8');
fs.writeFileSync(enPath, JSON.stringify(enJson, null, 2), 'utf-8');

console.log('Successfully updated JSON language packets with', Object.keys(allEntries).length, 'entries.');
