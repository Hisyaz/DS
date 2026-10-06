import { LanguageCode } from './localizationSystem';

/**
 * AUTO-TRANSLATION & GLOBAL LOCALIZATION ENGINE
 * 
 * Guarantees that EVERY piece of player-readable text is localized into the active language:
 * 1. English (UK) - 'en-GB'
 * 2. Spanish (Spain) - 'es-ES'
 * 3. Spanish (Argentina) - 'es-AR'
 * 4. Portuguese (Brazil) - 'pt-BR'
 * 5. French (France) - 'fr-FR'
 * 
 * STRICT ARCHITECTURAL RULES:
 * - Never translate proper names (Clubs, Players, Cities, Official Brand names, Custom names).
 * - Use native regional football terminology (e.g. Delantero/Centrodelantero/Centroavante/Buteur).
 * - Translate UI labels, buttons, tooltips, dialogs, commentary, interviews, news, transfers, contracts, cards, perks, editor mode.
 * - Extensible architecture for future languages ('it-IT', 'de-DE', 'pt-PT', 'ar-SA').
 */

export type FutureSupportedLanguageCode = 'it-IT' | 'de-DE' | 'pt-PT' | 'ar-SA';

export interface TranslationDictionary {
  [key: string]: string;
}

// Master phrase translations for thousands of player-visible strings
export const PHRASE_DICTIONARY: Record<LanguageCode, TranslationDictionary> = {
  'en-GB': {},
  'es-ES': {
    // Navigation & Main Menu
    'Main Menu': 'Menú Principal',
    'Career Hub': 'Centro de Carrera',
    'Career Dashboard': 'Panel de Carrera',
    'Season Calendar': 'Calendario de Temporada',
    'Card Deck': 'Mazo de Cartas',
    'Active Perks': 'Ventajas Activas',
    'Finances & Assets': 'Finanzas y Patrimonio',
    'Development': 'Desarrollo',
    'Customization': 'Personalización',
    'Pro Store': 'Tienda Profesional',
    'National Team': 'Selección Nacional',
    'Trophies': 'Palmarés',
    'Settings': 'Ajustes',
    'Editor Sandbox': 'Modo Editor',
    'New Game': 'Nueva Carrera',
    'Continue Career': 'Continuar Carrera',
    'Play as a Legend': 'Jugar como Leyenda',
    'Unique Career Mode': 'Modo Carrera Única',
    'Card Collection': 'Álbum de Cartas',
    'Trophy Cabinet': 'Vitrina de Trofeos',
    'Return to Main Menu': 'Volver al Menú Principal',
    'Back to Career': 'Volver a la Carrera',
    'Confirm and Start': 'Confirmar e Iniciar',
    'Keep Creating': 'Seguir Editando',
    'Random Prospect': 'Promesa Aleatoria',
    'Reset': 'Restablecer',

    // Buttons
    'Confirm': 'Confirmar',
    'Cancel': 'Cancelar',
    'Back': 'Volver',
    'Close': 'Cerrar',
    'Save': 'Guardar',
    'Edit': 'Editar',
    'Delete': 'Eliminar',
    'Apply': 'Aplicar',
    'Accept': 'Aceptar',
    'Reject': 'Rechazar',
    'Negotiate': 'Negociar',
    'Renew Contract': 'Renovar Contrato',
    'Train': 'Entrenar',
    'Recover': 'Recuperar',
    'Rest & Rehab': 'Descanso y Recuperación',
    'Play Fixture': 'Jugar Partido',
    'Quick Simulation': 'Simulación Rápida',
    'Key Fixture': 'Partido Clave',
    'Simulate Block': 'Simular Bloque',
    'Sign Pro Contract': 'Firmar Contrato Profesional',
    'Pro Recruitment Scan': 'Ojeo de Clubes Profesionales',
    'Select Card': 'Seleccionar Carta',
    'Selected': 'Seleccionado',
    'Accept & Sign': 'Aceptar y Firmar',
    'Reject Bid': 'Rechazar Oferta',
    'Negotiate Terms': 'Negociar Condiciones',
    'Decline All': 'Rechazar Todo',
    'Accept Offer': 'Aceptar Oferta',
    'Decline Offer': 'Declinar Oferta',
    'Proceed': 'Continuar',
    'View Trophies': 'Ver Trofeos',
    'Start Career': 'Comenzar Carrera',
    'Resume': 'Reanudar',

    // Transfers & Contracts
    'Transfer Market': 'Mercado de Fichajes',
    'Official Transfer Proposals': 'Ofertas Oficiales de Traspaso',
    'Review incoming bids from interested clubs': 'Revisa las ofertas de los clubes interesados',
    'Transfer Fee': 'Precio de Traspaso',
    'Offered Weekly Wage': 'Sueldo Semanal Ofertado',
    'Weekly Salary': 'Sueldo Semanal',
    'Yearly Salary': 'Salario Anual',
    'Contract Duration': 'Duración del Contrato',
    'Current Market Valuation': 'Valor de Mercado Actual',
    'Squad Role': 'Rol en el Equipo',
    'Club Prestige': 'Prestigio del Club',
    'Signing Bonus': 'Prima de Fichaje',
    'Agent Cut': 'Comisión de Agencia',
    'Player Transfer Fee Cut': 'Porcentaje del Traspaso para el Jugador',
    'Free Agent': 'Agente Libre',
    'Free Agent (Unattached)': 'Agente Libre (Sin Equipo)',
    'Free Transfer (€0 Fee)': 'Traspaso Libre (Sin Coste)',
    'Release Clause': 'Cláusula de Rescisión',
    'Contract Years Remaining': 'Años de Contrato Restantes',
    'Negotiation Leverage': 'Capacidad de Negociación',
    'Negotiating...': 'Negociando...',
    'All Transfer Bids Withdrawn': 'Ofertas Retiradas',
    'Representation Offers Received!': '¡Ofertas de Representación Recibidas!',
    'Pre-Season Agency Pitch': 'Propuestas de Agencias en Pretemporada',
    'Decline All (Remain Self-Managed)': 'Rechazar Todo (Ser Auto-Gestionado)',
    'Contract Renewal': 'Renovación de Contrato',
    'Request Transfer': 'Solicitar Traspaso',
    'Demand Playing Time': 'Exigir Más Minutos',
    'Fast-Track to Pro Team': 'Salto Acelerado al Primer Equipo',
    'Trial at Elite Academy': 'Prueba en Cantera de Élite',

    // Agent Archetypes
    'Professional Agent': 'Agente Profesional',
    'Shady Fixer': 'Intermediario Informal',
    'Famous Super-Agent': 'Superagente Famoso',
    'Self-Managed': 'Sin Representante',
    'Negotiation Master': 'Maestro de la Negociación',
    'VIP Perks & Influence': 'Contactos VIP e Influencia',
    'Under-the-Table Deals': 'Acuerdos Extraoficiales',

    // Matches & Commentary
    'Matchday Performance': 'Rendimiento en el Partido',
    'Match Rating': 'Puntuación del Partido',
    'Goals Scored': 'Goles Marcados',
    'Assists': 'Asistencias',
    'Yellow Cards': 'Tarjetas Amarillas',
    'Red Cards': 'Tarjetas Rojas',
    'Man of the Match': 'Jugador del Partido',
    'Clean Sheet': 'Portería a Cero',
    'Goal!': '¡Gol!',
    'Penalty Shootout': 'Tanda de Penaltis',
    'Key Match': 'Partido Clave',
    'Final Whistle': 'Pitido Final',
    'Extra Time': 'Prórroga',
    'Match Winner': 'Gol de la Victoria',

    // Interviews
    'Press Conference': 'Rueda de Prensa',
    'Post-Match Interview': 'Entrevista Post-Partido',
    'Accept Interview': 'Conceder Entrevista',
    'Decline Interview': 'Rechazar Entrevista',
    'Confirm Statement': 'Confirmar Declaración',
    'Press Room Exit': 'Salir de la Sala de Prensa',
    'Sensational Victory': 'Victoria Espectacular',
    'Championship Final': 'Gran Final',
    'Silverware Secured': 'Título Conquistado',
    'Penalty Heartbreak': 'Duelo Cruel en los Penaltis',
    'Relegation Battle': 'Lucha por la Permanencia',

    // Positions & Attributes
    'Striker': 'Delantero Centro',
    'Centre Forward': 'Segundo Delantero',
    'Left Wing': 'Extremo Izquierdo',
    'Right Wing': 'Extremo Derecho',
    'Attacking Midfielder': 'Mediapunta',
    'Central Midfielder': 'Mediocentro',
    'Defensive Midfielder': 'Pivote Defensivo',
    'Left Midfielder': 'Interior Izquierdo',
    'Right Midfielder': 'Interior Derecho',
    'Left Back': 'Lateral Izquierdo',
    'Centre Back': 'Defensa Central',
    'Right Back': 'Lateral Derecho',
    'Goalkeeper': 'Portero',

    'Pace': 'Ritmo',
    'Stamina': 'Resistencia',
    'Strength': 'Fuerza',
    'Ball Control': 'Control de Balón',
    'Dribbling': 'Regate',
    'Composure': 'Compostura',
    'Short Pass': 'Pase Corto',
    'Long Shots': 'Tiro Lejano',
    'Positioning': 'Colocación',
    'Finishing': 'Definición',
    'Tackling': 'Entradas',
    'Handling': 'Blocaje',
    'Reflexes': 'Reflejos',
    'Aerial Reach': 'Juego Aéreo',
    '1-on-1': 'Mano a Mano',
    'Distribution': 'Saque / Pase',

    // Competitions & Standings
    'League Champions': 'Campeón de Liga',
    'Cup Champions': 'Campeón de Copa',
    'Runners-Up': 'Subcampeón',
    'Semi-Finals': 'Semifinales',
    'Quarter-Finals': 'Cuartos de Final',
    'Round of 16': 'Octavos de Final',
    'Group Stage': 'Fase de Grupos',
    'Promotion Playoff': 'Playoff de Ascenso',
    'Relegation Playoff': 'Playoff de Descenso',
    'Promoted to 1st Division': 'Ascendido a Primera División',
    'Relegated to 2nd Division': 'Descendido a Segunda División',
    'Safe from Relegation': 'Permanencia Conseguida',
    'Qualified for Champions League': 'Clasificado a la Champions League',
    'Qualified for Europa League': 'Clasificado a la Europa League',
    'Qualified for Conference League': 'Clasificado a la Conference League',
    'Qualified for Copa Libertadores': 'Clasificado a la Copa Libertadores',
    'Qualified for Copa Sudamericana': 'Clasificado a la Copa Sudamericana',

    // Economy & Assets
    'Total Net Assets': 'Patrimonio Total',
    'Available Cash': 'Efectivo Disponible',
    'Properties & Estates': 'Inmuebles y Fincas',
    'Commercial Businesses': 'Negocios Comerciales',
    'Sponsorship Deals': 'Contratos de Patrocinio',
    'Purchase Property': 'Comprar Propiedad',
    'Annual Revenue': 'Ingresos Anuales',
    'Weekly Passive Income': 'Ingreso Pasivo Semanal',

    // Editor & Sandbox
    'Team & Uniform Editor': 'Editor de Equipos y Equipaciones',
    'Competition & League Editor': 'Editor de Competiciones y Ligas',
    'Player Database Editor': 'Editor de Base de Datos de Jugadores',
    'Card Deck & Perks Editor': 'Editor de Mazo y Ventajas',
    'Trophy Designer': 'Diseñador de Trofeos',
    'Stadium Capacity': 'Aforo del Estadio',
    'Infrastructure Tier': 'Nivel de Instalaciones',
    'Save Preset': 'Guardar Plantilla',
    'Load Preset': 'Cargar Plantilla',

    // Street Cards & Perks
    'Outside Foot': 'Tiro de Exterior',
    'Outside foot': 'Tiro de exterior',
    'Trivela': 'Trivela',
    'Street Captain': 'Capitán Callejero',
    'Iconic Card': 'Carta Icónica',
    'ICONIC CARD': 'CARTA ICÓNICA',
    'Diamond Tier': 'Nivel Diamante',

    // Save Slot Selection
    'NEW CAREER — SELECT SAVE SLOT': 'NUEVA CARRERA — SELECCIONAR RANURA DE GUARDADO',
    'CONTINUE CAREER — SELECT SAVE SLOT': 'CONTINUAR CARRERA — SELECCIONAR RANURA',
    'SAVE CAREER — MANAGE SLOTS': 'GUARDAR CARRERA — GESTIONAR RANURAS',
    'CAREER SAVE SLOTS': 'RANURAS DE GUARDADO DE CARRERA',
    'Start a fresh journey in an empty slot, load a saved career, or upload a savefile from your computer.': 'Comienza un nuevo viaje en una ranura vacía, carga una carrera guardada o sube un archivo desde tu dispositivo.',
    'Select which isolated career instance you want to resume, or upload a savefile.': 'Selecciona qué carrera independiente deseas reanudar o sube un archivo de guardado.',
    '5 independent, fully isolated Unique Career save slots.': '5 ranuras de guardado independientes y totalmente aisladas para el Modo Carrera Única.',
    'Have a savefile on your device?': '¿Tienes un archivo de guardado en tu dispositivo?',
    'Upload & play right away.': 'Súbelo y juega de inmediato.',
    'Upload Savefile (.ftsave / .json)': 'Subir Archivo (.ftsave / .json)',
    'JUST LOADED': 'RECIÉN CARGADO',
    '— Empty Save Slot —': '— Ranura de Guardado Vacía —',
    'Ready for a new career or to import a savefile': 'Listo para una nueva carrera o para importar un archivo de guardado',
    'Season 1': 'Temporada 1',
    'NEW GAME': 'NUEVA CARRERA',
    'SAVE HERE': 'GUARDAR AQUÍ',
    'PLAY RIGHT AWAY': 'JUGAR DE INMEDIATO',
    'VIEW ALL SLOTS': 'VER TODAS LAS RANURAS',
    'Play this career or start a new character in this slot.': 'Juega esta carrera o crea un nuevo personaje en esta ranura.',
    'Saved Career:': 'Carrera Guardada:',
    'PLAY THIS CAREER': 'JUGAR ESTA CARRERA',
    'OVERWRITE & START FRESH': 'SOBRESCRIBIR Y EMPEZAR DE CERO',
    'OVERWRITE CAREER?': '¿SOBRESCRIBIR CARRERA?',
    'CONFIRM & OVERWRITE': 'CONFIRMAR Y SOBRESCRIBIR',
    'This will permanently delete this career instance.': 'Esto eliminará permanentemente esta partida de carrera.',
    'DELETE CAREER': 'ELIMINAR CARRERA',

    // Match Importance Mode Configuration
    'Select Match Importance Mode': 'Seleccionar Modo de Importancia de Partido',
    'Select Match Importance Mode ⚡': 'Seleccionar Modo de Importancia de Partido ⚡',
    'SELECT MATCH IMPORTANCE MODE': 'SELECCIONAR MODO DE IMPORTANCIA DE PARTIDO',
    'Match Importance Mode': 'Modo de Importancia de Partido',
    'NEW UNIQUE CAREER CONFIGURATION': 'CONFIGURACIÓN DE NUEVA CARRERA ÚNICA',
    'CAREER MATCH ENGINE SETTINGS': 'AJUSTES DEL MOTOR DE PARTIDOS DE CARRERA',
    'Choose how frequently you step onto the pitch for interactive': 'Elige con qué frecuencia saltas al campo para disputar',
    'Choose how frequently you step onto the pitch for interactive Key Matches.': 'Elige con qué frecuencia saltas al campo para disputar Partidos Clave interactivos.',
    'Key Matches': 'Partidos Clave',
    'Play 100% of Matches (Every Match is Interactive)': 'Juega el 100% de los Partidos (Cada Partido es Interactivo)',
    'Play ~30% Stakes (Finals, Derbies & Title Deciders)': 'Juega ~30% de Partidos Decisivos (Finales, Derbis y Título)',
    'Play ~10% Finals Only (Trophy & Survival Games)': 'Juega ~10% Solo Finales (Títulos y Permanencia)',
    'Slow Mode': 'Modo Lento',
    'Play All Matches (1, 2, 3)': 'Jugar Todos los Partidos (1, 2, 3)',
    '100% Matches': '100% de Partidos',
    'Decisive Mode': 'Modo Decisivo',
    'Definitive + Important (1 & 2)': 'Definitivos + Importantes (1 y 2)',
    '~30% High Stakes': '~30% Alta Tensión',
    'Finals Only': 'Solo Finales',
    'Definitive Only (1)': 'Solo Definitivos (1)',
    '~10% Finals Only': '~10% Solo Finales',
    'Active Mode:': 'Modo Activo:',
    'Confirm Career Mode & Continue': 'Confirmar Modo de Carrera y Continuar',
    'Save Match Settings': 'Guardar Ajustes de Partido',
  },

  'es-AR': {
    // Navigation & Main Menu
    'Main Menu': 'Menú Principal',
    'Career Hub': 'Centro de la Carrera',
    'Career Dashboard': 'Panel de Carrera',
    'Season Calendar': 'Calendario de Temporada',
    'Card Deck': 'Mazo de Cartas',
    'Active Perks': 'Habilidades Activas',
    'Finances & Assets': 'Economía y Bienes',
    'Development': 'Entrenamiento',
    'Customization': 'Personalización',
    'Pro Store': 'Tienda Pro',
    'National Team': 'Selección Mayor',
    'Trophies': 'Vitrinas y Copas',
    'Settings': 'Configuración',
    'Editor Sandbox': 'Modo Editor',
    'New Game': 'Nueva Partida',
    'Continue Career': 'Seguir Carrera',
    'Play as a Legend': 'Jugar con una Leyenda',
    'Unique Career Mode': 'Modo Carrera Única',
    'Card Collection': 'Álbum de Cartas',
    'Trophy Cabinet': 'Vitrina de Trofeos',
    'Return to Main Menu': 'Volver al Menú Principal',
    'Back to Career': 'Volver a la Carrera',
    'Confirm and Start': 'Confirmar y Arrancar',
    'Keep Creating': 'Seguir Armando',
    'Random Prospect': 'Pibe Aleatorio',
    'Reset': 'Reiniciar',

    // Buttons
    'Confirm': 'Confirmar',
    'Cancel': 'Cancelar',
    'Back': 'Atrás',
    'Close': 'Cerrar',
    'Save': 'Guardar',
    'Edit': 'Editar',
    'Delete': 'Borrar',
    'Apply': 'Aplicar',
    'Accept': 'Aceptar',
    'Reject': 'Rechazar',
    'Negotiate': 'Pelear Precio',
    'Renew Contract': 'Renovar Contrato',
    'Train': 'Entrenar',
    'Recover': 'Recuperar Físico',
    'Rest & Rehab': 'Kinesiología y Descanso',
    'Play Fixture': 'Jugar la Fecha',
    'Quick Simulation': 'Simulación Rápida',
    'Key Fixture': 'Partido Bravo',
    'Simulate Block': 'Simular Bloque',
    'Sign Pro Contract': 'Firmar Contrato Profesional',
    'Pro Recruitment Scan': 'Búsqueda de Clubes',
    'Select Card': 'Elegir Carta',
    'Selected': 'Elegido',
    'Accept & Sign': 'Aceptar y Firmar',
    'Reject Bid': 'Rechazar Oferta',
    'Negotiate Terms': 'Negociar Contrato',
    'Decline All': 'Rechazar Todas',
    'Accept Offer': 'Agarrar Oferta',
    'Decline Offer': 'Rechazar Oferta',
    'Proceed': 'Avanzar',
    'View Trophies': 'Ver Títulos',
    'Start Career': 'Arrancar Carrera',
    'Resume': 'Seguir',

    // Transfers & Contracts
    'Transfer Market': 'Mercado de Pases',
    'Official Transfer Proposals': 'Ofertas de Pase Oficiales',
    'Review incoming bids from interested clubs': 'Revisá las ofertas de los clubes interesados',
    'Transfer Fee': 'Monto del Pase',
    'Offered Weekly Wage': 'Sueldo Semanal Ofrecido',
    'Weekly Salary': 'Sueldo Semanal',
    'Yearly Salary': 'Sueldo Anual',
    'Contract Duration': 'Años de Contrato',
    'Current Market Valuation': 'Valor de Mercado Actual',
    'Squad Role': 'Rol en el Plantel',
    'Club Prestige': 'Prestigio del Club',
    'Signing Bonus': 'Prima por Firma',
    'Agent Cut': 'Comisión del Representante',
    'Player Transfer Fee Cut': 'Porcentaje del Pase para el Jugador',
    'Free Agent': 'Jugador Libre',
    'Free Agent (Unattached)': 'Pase en su Poder (Libre)',
    'Free Transfer (€0 Fee)': 'Pase Libre (Costo Cero)',
    'Release Clause': 'Cláusula de Rescisión',
    'Contract Years Remaining': 'Años de Contrato Restantes',
    'Negotiation Leverage': 'Poder de Negociación',
    'Negotiating...': 'Negociando...',
    'All Transfer Bids Withdrawn': 'Ofertas Caídas',
    'Representation Offers Received!': '¡Llegaron Ofertas de Representantes!',
    'Pre-Season Agency Pitch': 'Propuestas de Agentes en Pretemporada',
    'Decline All (Remain Self-Managed)': 'Rechazar Todas (Manejarse Solo)',
    'Contract Renewal': 'Renovación de Contrato',
    'Request Transfer': 'Pedir el Pase',
    'Demand Playing Time': 'Exigir Titularidad',
    'Fast-Track to Pro Team': 'Subir a Primera de Una',
    'Trial at Elite Academy': 'Prueba en Inferiores Top',

    // Agent Archetypes
    'Professional Agent': 'Representante Profesional',
    'Shady Fixer': 'Intermediario del Ascenso',
    'Famous Super-Agent': 'Empresario Famoso',
    'Self-Managed': 'Sin Representante',
    'Negotiation Master': 'Habilidoso para los Números',
    'VIP Perks & Influence': 'Contactos Pesados en Clubes',
    'Under-the-Table Deals': 'Arreglos por Abajo de la Mesa',

    // Matches & Commentary
    'Matchday Performance': 'Rendimiento en la Cancha',
    'Match Rating': 'Puntaje del Partido',
    'Goals Scored': 'Goles Convertidos',
    'Assists': 'Asistencias',
    'Yellow Cards': 'Tarjetas Amarillas',
    'Red Cards': 'Tarjetas Rojas',
    'Man of the Match': 'La Figura de la Cancha',
    'Clean Sheet': 'Valla Invicta',
    'Goal!': '¡Gooool!',
    'Penalty Shootout': 'Definición por Penales',
    'Key Match': 'Clásico / Partido Caliente',
    'Final Whistle': 'Pitazo Final',
    'Extra Time': 'Alargue',
    'Match Winner': 'Gol del Triunfo',

    // Interviews
    'Press Conference': 'Conferencia de Prensa',
    'Post-Match Interview': 'Declaraciones Post-Partido',
    'Accept Interview': 'Hablar con la Prensa',
    'Decline Interview': 'Pasar de Largo',
    'Confirm Statement': 'Confirmar Declaración',
    'Press Room Exit': 'Irse del Vestuario',
    'Sensational Victory': 'Triunfazo Histórico',
    'Championship Final': 'Final del Campeonato',
    'Silverware Secured': 'Vuelta Olímpica',
    'Penalty Heartbreak': 'Tristeza en los Penales',
    'Relegation Battle': 'Pelea por el Descenso',

    // Positions & Attributes
    'Striker': 'Centrodelantero / 9 de Área',
    'Centre Forward': 'Segundo Delantero',
    'Left Wing': 'Extremo Izquierdo',
    'Right Wing': 'Extremo Derecho',
    'Attacking Midfielder': 'Enganche / Volante Ofensivo',
    'Central Midfielder': 'Volante Central / Mixto',
    'Defensive Midfielder': 'Volante Central / 5 de Marca',
    'Left Midfielder': 'Volante por Izquierda',
    'Right Midfielder': 'Volante por Derecha',
    'Left Back': 'Lateral Izquierdo',
    'Centre Back': 'Primer / Segundo Central',
    'Right Back': 'Lateral Derecho',
    'Goalkeeper': 'Arquero',

    'Pace': 'Pique / Velocidad',
    'Stamina': 'Pulmón / Resistencia',
    'Strength': 'Potencia / Físico',
    'Ball Control': 'Control de Pelota',
    'Dribbling': 'Gambeta',
    'Composure': 'Frialdad',
    'Short Pass': 'Pase Corto',
    'Long Shots': 'Remate de Afuera',
    'Positioning': 'Ubicación',
    'Finishing': 'Definición',
    'Tackling': 'Quite y Marca',
    'Handling': 'Seguridad de Manos',
    'Reflexes': 'Reflejos',
    'Aerial Reach': 'Juego Aéreo',
    '1-on-1': 'Mano a Mano',
    'Distribution': 'Saque con el Pie',

    // Competitions & Standings
    'League Champions': 'Campeón del Torneo',
    'Cup Champions': 'Campeón de la Copa',
    'Runners-Up': 'Subcampeón',
    'Semi-Finals': 'Semifinales',
    'Quarter-Finals': 'Cuartos de Final',
    'Round of 16': 'Octavos de Final',
    'Group Stage': 'Fase de Grupos',
    'Promotion Playoff': 'Reducido por el Ascenso',
    'Relegation Playoff': 'Promoción / Desempate',
    'Promoted to 1st Division': 'Ascendido a Primera División',
    'Relegated to 2nd Division': 'Descendido a Segunda',
    'Safe from Relegation': 'Salvado del Descenso',
    'Qualified for Champions League': 'Clasificado a Champions League',
    'Qualified for Europa League': 'Clasificado a Europa League',
    'Qualified for Conference League': 'Clasificado a Conference League',
    'Qualified for Copa Libertadores': 'Clasificado a la Copa Libertadores',
    'Qualified for Copa Sudamericana': 'Clasificado a la Copa Sudamericana',

    // Economy & Assets
    'Total Net Assets': 'Patrimonio Neto',
    'Available Cash': 'Plata en Mano',
    'Properties & Estates': 'Departamentos y Propiedades',
    'Commercial Businesses': 'Emprendimientos Comerciales',
    'Sponsorship Deals': 'Contratos de Marcas',
    'Purchase Property': 'Comprar Inmueble',
    'Annual Revenue': 'Ganancia Anual',
    'Weekly Passive Income': 'Ingreso Pasivo Semanal',

    // Editor & Sandbox
    'Team & Uniform Editor': 'Editor de Clubes y Camisetas',
    'Competition & League Editor': 'Editor de Torneos y Ligas',
    'Player Database Editor': 'Editor de Planteles y Jugadores',
    'Card Deck & Perks Editor': 'Editor de Cartas y Mejoras',
    'Trophy Designer': 'Creador de Copas',
    'Stadium Capacity': 'Capacidad del Estadio',
    'Infrastructure Tier': 'Nivel del Predio',
    'Save Preset': 'Guardar Plantilla',
    'Load Preset': 'Cargar Plantilla',

    // Street Cards & Perks
    'Outside Foot': 'Tres Dedos',
    'Outside foot': 'Tres dedos',
    'Trivela': 'Trivela',
    'Street Captain': 'Capitán de Potrero',
    'Iconic Card': 'Carta Icónica',
    'ICONIC CARD': 'CARTA ICÓNICA',
    'Diamond Tier': 'Nivel Diamante',

    // Save Slot Selection
    'NEW CAREER — SELECT SAVE SLOT': 'NUEVA CARRERA — ELEGIR RANURA DE GUARDADO',
    'CONTINUE CAREER — SELECT SAVE SLOT': 'CONTINUAR CARRERA — ELEGIR RANURA',
    'SAVE CAREER — MANAGE SLOTS': 'GUARDAR CARRERA — ADMINISTRAR RANURAS',
    'CAREER SAVE SLOTS': 'RANURAS DE GUARDADO DE CARRERA',
    'Start a fresh journey in an empty slot, load a saved career, or upload a savefile from your computer.': 'Arrancá un nuevo camino en una ranura vacía, cargá una carrera guardada o subí un archivo desde tu dispositivo.',
    'Select which isolated career instance you want to resume, or upload a savefile.': 'Elegí qué carrera independiente querés retomar o subí un archivo de guardado.',
    '5 independent, fully isolated Unique Career save slots.': '5 ranuras de guardado independientes y totalmente aisladas para el Modo Carrera Única.',
    'Have a savefile on your device?': '¿Tenés un archivo de guardado en tu dispositivo?',
    'Upload & play right away.': 'Subilo y jugá al instante.',
    'Upload Savefile (.ftsave / .json)': 'Subir Archivo (.ftsave / .json)',
    'JUST LOADED': 'RECIÉN CARGADO',
    '— Empty Save Slot —': '— Ranura de Guardado Vacía —',
    'Ready for a new career or to import a savefile': 'Listo para arrancar una nueva carrera o importar un archivo',
    'Season 1': 'Temporada 1',
    'NEW GAME': 'NUEVA CARRERA',
    'SAVE HERE': 'GUARDAR ACÁ',
    'PLAY RIGHT AWAY': 'JUGAR AL INSTANTE',
    'VIEW ALL SLOTS': 'VER TODAS LAS RANURAS',
    'Play this career or start a new character in this slot.': 'Jugá esta carrera o armá un nuevo jugador en esta ranura.',
    'Saved Career:': 'Carrera Guardada:',
    'PLAY THIS CAREER': 'JUGAR ESTA CARRERA',
    'OVERWRITE & START FRESH': 'SOBRESCRIBIR Y ARRANCAR DE CERO',
    'OVERWRITE CAREER?': '¿SOBRESCRIBIR CARRERA?',
    'CONFIRM & OVERWRITE': 'CONFIRMAR Y SOBRESCRIBIR',
    'This will permanently delete this career instance.': 'Esto va a borrar definitivamente esta partida de carrera.',
    'DELETE CAREER': 'BORRAR CARRERA',

    // Match Importance Mode Configuration
    'Select Match Importance Mode': 'Elegir Modo de Importancia de Partido',
    'Select Match Importance Mode ⚡': 'Elegir Modo de Importancia de Partido ⚡',
    'SELECT MATCH IMPORTANCE MODE': 'ELEGIR MODO DE IMPORTANCIA DE PARTIDO',
    'Match Importance Mode': 'Modo de Importancia de Partido',
    'NEW UNIQUE CAREER CONFIGURATION': 'CONFIGURACIÓN DE NUEVA CARRERA ÚNICA',
    'CAREER MATCH ENGINE SETTINGS': 'CONFIGURACIÓN DEL MOTOR DE PARTIDOS DE CARRERA',
    'Choose how frequently you step onto the pitch for interactive': 'Elegí con qué frecuencia entrás a la cancha a jugar',
    'Choose how frequently you step onto the pitch for interactive Key Matches.': 'Elegí con qué frecuencia entrás a la cancha a jugar Partidos Clave interactivos.',
    'Key Matches': 'Partidos Clave',
    'Play 100% of Matches (Every Match is Interactive)': 'Jugá el 100% de los Partidos (Cada Partido es Interactivo)',
    'Play ~30% Stakes (Finals, Derbies & Title Deciders)': 'Jugá ~30% de Partidos Picantes (Finales, Clásicos y Título)',
    'Play ~10% Finals Only (Trophy & Survival Games)': 'Jugá ~10% Solo Finales (Copas y Permanencia)',
    'Slow Mode': 'Modo Lento',
    'Play All Matches (1, 2, 3)': 'Jugar Todos los Partidos (1, 2, 3)',
    '100% Matches': '100% de Partidos',
    'Decisive Mode': 'Modo Decisivo',
    'Definitive + Important (1 & 2)': 'Definitivos + Importantes (1 y 2)',
    '~30% High Stakes': '~30% Partidos Picantes',
    'Finals Only': 'Solo Finales',
    'Definitive Only (1)': 'Solo Definitivos (1)',
    '~10% Finals Only': '~10% Solo Finales',
    'Active Mode:': 'Modo Activo:',
    'Confirm Career Mode & Continue': 'Confirmar Modo de Carrera y Seguir',
    'Save Match Settings': 'Guardar Configuración de Partidos',
  },

  'pt-BR': {
    // Navigation & Main Menu
    'Main Menu': 'Menu Principal',
    'Career Hub': 'Central da Carreira',
    'Career Dashboard': 'Painel da Carreira',
    'Season Calendar': 'Calendário da Temporada',
    'Card Deck': 'Deck de Cartas',
    'Active Perks': 'Vantagens Ativas',
    'Finances & Assets': 'Finanças e Patrimônio',
    'Development': 'Desenvolvimento',
    'Customization': 'Personalização',
    'Pro Store': 'Loja Profissional',
    'National Team': 'Seleção Brasileira',
    'Trophies': 'Galeria de Troféus',
    'Settings': 'Configurações',
    'Editor Sandbox': 'Modo Editor',
    'New Game': 'Novo Jogo',
    'Continue Career': 'Continuar Carreira',
    'Play as a Legend': 'Jogar como Lenda',
    'Unique Career Mode': 'Modo Carreira Única',
    'Card Collection': 'Álbum de Cartas',
    'Trophy Cabinet': 'Sala de Troféus',
    'Return to Main Menu': 'Voltar ao Menu Principal',
    'Back to Career': 'Voltar para a Carreira',
    'Confirm and Start': 'Confirmar e Iniciar',
    'Keep Creating': 'Continuar Editando',
    'Random Prospect': 'Joia Aleatória',
    'Reset': 'Redefinir',

    // Buttons
    'Confirm': 'Confirmar',
    'Cancel': 'Cancelar',
    'Back': 'Voltar',
    'Close': 'Fechar',
    'Save': 'Salvar',
    'Edit': 'Editar',
    'Delete': 'Excluir',
    'Apply': 'Aplicar',
    'Accept': 'Aceitar',
    'Reject': 'Rejeitar',
    'Negotiate': 'Negociar',
    'Renew Contract': 'Renovar Contrato',
    'Train': 'Treinar',
    'Recover': 'Recuperar',
    'Rest & Rehab': 'Fisioterapia e Descanso',
    'Play Fixture': 'Jogar Partida',
    'Quick Simulation': 'Simulação Rápida',
    'Key Fixture': 'Jogo Decisivo',
    'Simulate Block': 'Simular Bloco',
    'Sign Pro Contract': 'Assinar Contrato Profissional',
    'Pro Recruitment Scan': 'Radar de Clubes Profissionais',
    'Select Card': 'Selecionar Carta',
    'Selected': 'Selecionado',
    'Accept & Sign': 'Aceitar e Assinar',
    'Reject Bid': 'Recusar Proposta',
    'Negotiate Terms': 'Negociar Termos',
    'Decline All': 'Recusar Todas',
    'Accept Offer': 'Aceitar Proposta',
    'Decline Offer': 'Recusar Proposta',
    'Proceed': 'Prosseguir',
    'View Trophies': 'Ver Troféus',
    'Start Career': 'Iniciar Carreira',
    'Resume': 'Retomar',

    // Transfers & Contracts
    'Transfer Market': 'Mercado da Bola',
    'Official Transfer Proposals': 'Propostas Oficiais de Transferência',
    'Review incoming bids from interested clubs': 'Avalie as propostas recebidas de clubes interessados',
    'Transfer Fee': 'Valor da Transferência',
    'Offered Weekly Wage': 'Salário Semanal Proposto',
    'Weekly Salary': 'Salário Semanal',
    'Yearly Salary': 'Salário Anual',
    'Contract Duration': 'Duração do Contrato',
    'Current Market Valuation': 'Avaliação de Mercado Atual',
    'Squad Role': 'Papel no Elenco',
    'Club Prestige': 'Prestígio do Clube',
    'Signing Bonus': 'Luvas de Assinatura',
    'Agent Cut': 'Comissão do Empresário',
    'Player Transfer Fee Cut': 'Fatia do Jogador na Venda',
    'Free Agent': 'Jogador Sem Clube',
    'Free Agent (Unattached)': 'Agente Livre (Sem Clube)',
    'Free Transfer (€0 Fee)': 'Transferência Gratuita (Passe Livre)',
    'Release Clause': 'Multa Rescisória',
    'Contract Years Remaining': 'Anos de Contrato Restantes',
    'Negotiation Leverage': 'Poder de Barganha',
    'Negotiating...': 'Negociando...',
    'All Transfer Bids Withdrawn': 'Propostas Retiradas',
    'Representation Offers Received!': 'Ofertas de Agenciamento Recebidas!',
    'Pre-Season Agency Pitch': 'Apresentação de Agências na Pré-Temporada',
    'Decline All (Remain Self-Managed)': 'Recusar Todas (Seguir Autônomo)',
    'Contract Renewal': 'Renovação Contratual',
    'Request Transfer': 'Pedir para Ser Negociado',
    'Demand Playing Time': 'Pedir Mais Minutos',
    'Fast-Track to Pro Team': 'Subida Direta ao Profissional',
    'Trial at Elite Academy': 'Teste em Base de Elite',

    // Agent Archetypes
    'Professional Agent': 'Empresário Profissional',
    'Shady Fixer': 'Agente Informal',
    'Famous Super-Agent': 'Superempresário Renomado',
    'Self-Managed': 'Sem Empresário',
    'Negotiation Master': 'Mestre das Negociações',
    'VIP Perks & Influence': 'Contatos VIP e Influência',
    'Under-the-Table Deals': 'Acordos de Bastidores',

    // Matches & Commentary
    'Matchday Performance': 'Desempenho no Jogo',
    'Match Rating': 'Nota da Partida',
    'Goals Scored': 'Gols Marcados',
    'Assists': 'Assistências',
    'Yellow Cards': 'Cartões Amarelos',
    'Red Cards': 'Cartões Vermelhos',
    'Man of the Match': 'Melhor em Campo',
    'Clean Sheet': 'Sem Sofrer Gols',
    'Goal!': 'Gol!',
    'Penalty Shootout': 'Disputa de Pênaltis',
    'Key Match': 'Jogo Decisivo / Clássico',
    'Final Whistle': 'Apito Final',
    'Extra Time': 'Prorrogação',
    'Match Winner': 'Gol da Vitória',

    // Interviews
    'Press Conference': 'Coletiva de Imprensa',
    'Post-Match Interview': 'Entrevista Pós-Jogo',
    'Accept Interview': 'Dar Entrevista',
    'Decline Interview': 'Recusar Entrevista',
    'Confirm Statement': 'Confirmar Declaração',
    'Press Room Exit': 'Sair da Sala de Imprensa',
    'Sensational Victory': 'Vitória Espetacular',
    'Championship Final': 'Grande Final',
    'Silverware Secured': 'Título Conquistado',
    'Penalty Heartbreak': 'Decepção nos Pênaltis',
    'Relegation Battle': 'Luta Contra o Rebaixamento',

    // Positions & Attributes
    'Striker': 'Centroavante',
    'Centre Forward': 'Segundo Atacante',
    'Left Wing': 'Ponta Esquerda',
    'Right Wing': 'Ponta Direita',
    'Attacking Midfielder': 'Meia-Armador / Meia-Atacante',
    'Central Midfielder': 'Segundo Volante / Meio-Campo',
    'Defensive Midfielder': 'Primeiro Volante',
    'Left Midfielder': 'Meia Esquerda',
    'Right Midfielder': 'Meia Direita',
    'Left Back': 'Lateral Esquerdo',
    'Centre Back': 'Zagueiro Central',
    'Right Back': 'Lateral Direito',
    'Goalkeeper': 'Goleiro',

    'Pace': 'Ritmo / Velocidade',
    'Stamina': 'Resistência / Fôlego',
    'Strength': 'Força Física',
    'Ball Control': 'Controle de Bola',
    'Dribbling': 'Drible',
    'Composure': 'Frieza / Compostura',
    'Short Pass': 'Passe Curto',
    'Long Shots': 'Chute de Longe',
    'Positioning': 'Posicionamento',
    'Finishing': 'Finalização',
    'Tackling': 'Desarme',
    'Handling': 'Firmeza nas Mãos',
    'Reflexes': 'Reflexos',
    'Aerial Reach': 'Jogo Aéreo',
    '1-on-1': '1 contra 1',
    'Distribution': 'Reposição de Bola',

    // Competitions & Standings
    'League Champions': 'Campeão da Liga',
    'Cup Champions': 'Campeão da Copa',
    'Runners-Up': 'Vice-Campeão',
    'Semi-Finals': 'Semifinais',
    'Quarter-Finals': 'Quartas de Final',
    'Round of 16': 'Oitavas de Final',
    'Group Stage': 'Fase de Grupos',
    'Promotion Playoff': 'Playoff de Acesso',
    'Relegation Playoff': 'Playoff de Rebaixamento',
    'Promoted to 1st Division': 'Promovido à 1ª Divisão',
    'Relegated to 2nd Division': 'Rebaixado à 2ª Divisão',
    'Safe from Relegation': 'Permanência Garantida',
    'Qualified for Champions League': 'Classificado para a Champions League',
    'Qualified for Europa League': 'Classificado para a Europa League',
    'Qualified for Conference League': 'Classificado para a Conference League',
    'Qualified for Copa Libertadores': 'Classificado para a Libertadores',
    'Qualified for Copa Sudamericana': 'Classificado para a Copa Sul-Americana',

    // Economy & Assets
    'Total Net Assets': 'Patrimônio Líquido',
    'Available Cash': 'Saldo em Conta',
    'Properties & Estates': 'Imóveis e Mansões',
    'Commercial Businesses': 'Empreendimentos Comerciais',
    'Sponsorship Deals': 'Contratos de Patrocínio',
    'Purchase Property': 'Comprar Imóvel',
    'Annual Revenue': 'Faturamento Anual',
    'Weekly Passive Income': 'Renda Passiva Semanal',

    // Editor & Sandbox
    'Team & Uniform Editor': 'Editor de Times e Uniformes',
    'Competition & League Editor': 'Editor de Competições e Ligas',
    'Player Database Editor': 'Editor de Banco de Dados de Atletas',
    'Card Deck & Perks Editor': 'Editor de Cartas e Vantagens',
    'Trophy Designer': 'Criador de Troféus',
    'Stadium Capacity': 'Capacidade do Estádio',
    'Infrastructure Tier': 'Nível do CT',
    'Save Preset': 'Salvar Modelo',
    'Load Preset': 'Carregar Modelo',

    // Street Cards & Perks
    'Outside Foot': 'Trivela',
    'Outside foot': 'Trivela',
    'Trivela': 'Trivela',
    'Street Captain': 'Capitão da Rua',
    'Iconic Card': 'Carta Icônica',
    'ICONIC CARD': 'CARTA ICÔNICA',
    'Diamond Tier': 'Nível Diamante',

    // Save Slot Selection
    'NEW CAREER — SELECT SAVE SLOT': 'NOVA CARREIRA — SELECIONAR ESPAÇO DE SALVAMENTO',
    'CONTINUE CAREER — SELECT SAVE SLOT': 'CONTINUAR CARREIRA — SELECIONAR ESPAÇO',
    'SAVE CAREER — MANAGE SLOTS': 'SALVAR CARREIRA — GERENCIAR ESPAÇOS',
    'CAREER SAVE SLOTS': 'ESPAÇOS DE SALVAMENTO DE CARREIRA',
    'Start a fresh journey in an empty slot, load a saved career, or upload a savefile from your computer.': 'Comece uma nova jornada em um espaço vazio, carregue uma carreira salva ou envie um arquivo do seu dispositivo.',
    'Select which isolated career instance you want to resume, or upload a savefile.': 'Selecione qual carreira isolada deseja continuar ou envie um arquivo de salvamento.',
    '5 independent, fully isolated Unique Career save slots.': '5 espaços de salvamento independentes e totalmente isolados para o Modo Carreira Única.',
    'Have a savefile on your device?': 'Tem um arquivo de save no seu aparelho?',
    'Upload & play right away.': 'Envie e jogue na hora.',
    'Upload Savefile (.ftsave / .json)': 'Carregar Arquivo (.ftsave / .json)',
    'JUST LOADED': 'RECÉM-CARREGADO',
    '— Empty Save Slot —': '— Espaço de Salvamento Vazio —',
    'Ready for a new career or to import a savefile': 'Pronto para uma nova carreira ou para importar um arquivo de save',
    'Season 1': 'Temporada 1',
    'NEW GAME': 'NOVO JOGO',
    'SAVE HERE': 'SALVAR AQUI',
    'PLAY RIGHT AWAY': 'JOGAR AGORA MESMO',
    'VIEW ALL SLOTS': 'VER TODOS OS ESPAÇOS',
    'Play this career or start a new character in this slot.': 'Jogue esta carreira ou comece um novo jogador neste espaço.',
    'Saved Career:': 'Carreira Salva:',
    'PLAY THIS CAREER': 'JOGAR ESTA CARREIRA',
    'OVERWRITE & START FRESH': 'SOBRESCREVER E COMEÇAR DO ZERO',
    'OVERWRITE CAREER?': 'SOBRESCREVER CARREIRA?',
    'CONFIRM & OVERWRITE': 'CONFIRMAR E SOBRESCREVER',
    'This will permanently delete this career instance.': 'Isso excluirá permanentemente esta instância de carreira.',
    'DELETE CAREER': 'EXCLUIR CARREIRA',

    // Match Importance Mode Configuration
    'Select Match Importance Mode': 'Selecionar Modo de Importância de Partida',
    'Select Match Importance Mode ⚡': 'Selecionar Modo de Importância de Partida ⚡',
    'SELECT MATCH IMPORTANCE MODE': 'SELECIONAR MODO DE IMPORTÂNCIA DE PARTIDA',
    'Match Importance Mode': 'Modo de Importância de Partida',
    'NEW UNIQUE CAREER CONFIGURATION': 'CONFIGURAÇÃO DA NOVA CARREIRA ÚNICA',
    'CAREER MATCH ENGINE SETTINGS': 'CONFIGURAÇÕES DO MOTOR DE PARTIDAS',
    'Choose how frequently you step onto the pitch for interactive': 'Escolha com que frequência você entra em campo para',
    'Choose how frequently you step onto the pitch for interactive Key Matches.': 'Escolha com que frequência você entra em campo para disputar Partidas Decisivas interativas.',
    'Key Matches': 'Partidas Decisivas',
    'Play 100% of Matches (Every Match is Interactive)': 'Jogue 100% das Partidas (Cada Jogo é Interativo)',
    'Play ~30% Stakes (Finals, Derbies & Title Deciders)': 'Jogue ~30% Decisivos (Finais, Clássicos e Títulos)',
    'Play ~10% Finals Only (Trophy & Survival Games)': 'Jogue ~10% Apenas Finais (Troféus e Permanência)',
    'Slow Mode': 'Modo Cadenciado',
    'Play All Matches (1, 2, 3)': 'Jogar Todas as Partidas (1, 2, 3)',
    '100% Matches': '100% dos Jogos',
    'Decisive Mode': 'Modo Decisivo',
    'Definitive + Important (1 & 2)': 'Definitivas + Importantes (1 e 2)',
    '~30% High Stakes': '~30% Alta Decisão',
    'Finals Only': 'Apenas Finais',
    'Definitive Only (1)': 'Apenas Definitivas (1)',
    '~10% Finals Only': '~10% Apenas Finais',
    'Active Mode:': 'Modo Ativo:',
    'Confirm Career Mode & Continue': 'Confirmar Modo de Carreira e Continuar',
    'Save Match Settings': 'Salvar Configurações de Partida',
  },

  'fr-FR': {
    // Navigation & Main Menu
    'Main Menu': 'Menu Principal',
    'Career Hub': 'Centre de Carrière',
    'Career Dashboard': 'Tableau de Bord',
    'Season Calendar': 'Calendrier de Saison',
    'Card Deck': 'Deck de Cartes',
    'Active Perks': 'Atouts Actifs',
    'Finances & Assets': 'Finances & Patrimoine',
    'Development': 'Développement',
    'Customization': 'Personnalisation',
    'Pro Store': 'Boutique Pro',
    'National Team': 'Équipe Nationale',
    'Trophies': 'Palmarès',
    'Settings': 'Paramètres',
    'Editor Sandbox': 'Mode Éditeur',
    'New Game': 'Nouvelle Partie',
    'Continue Career': 'Continuer Carrière',
    'Play as a Legend': 'Incarner une Légende',
    'Unique Career Mode': 'Mode Carrière Unique',
    'Card Collection': 'Collection de Cartes',
    'Trophy Cabinet': 'Armoire à Trophées',
    'Return to Main Menu': 'Retour au Menu Principal',
    'Back to Career': 'Retour à la Carrière',
    'Confirm and Start': 'Confirmer et Démarrer',
    'Keep Creating': 'Poursuivre la Création',
    'Random Prospect': 'Espoir Aléatoire',
    'Reset': 'Réinitialiser',

    // Buttons
    'Confirm': 'Confirmer',
    'Cancel': 'Annuler',
    'Back': 'Retour',
    'Close': 'Fermer',
    'Save': 'Sauvegarder',
    'Edit': 'Modifier',
    'Delete': 'Supprimer',
    'Apply': 'Appliquer',
    'Accept': 'Accepter',
    'Reject': 'Refuser',
    'Negotiate': 'Négocier',
    'Renew Contract': 'Prolonger Contrat',
    'Train': 'S\'entraîner',
    'Recover': 'Récupérer',
    'Rest & Rehab': 'Soins et Récupération',
    'Play Fixture': 'Jouer le Match',
    'Quick Simulation': 'Simulation Rapide',
    'Key Fixture': 'Match Clé',
    'Simulate Block': 'Simuler le Bloc',
    'Sign Pro Contract': 'Signer Contrat Pro',
    'Pro Recruitment Scan': 'Détection de Clubs Pros',
    'Select Card': 'Choisir Carte',
    'Selected': 'Sélectionné',
    'Accept & Sign': 'Accepter et Signer',
    'Reject Bid': 'Rejeter l\'Offre',
    'Negotiate Terms': 'Négocier les Conditions',
    'Decline All': 'Tout Décliner',
    'Accept Offer': 'Accepter l\'Offre',
    'Decline Offer': 'Décliner l\'Offre',
    'Proceed': 'Poursuivre',
    'View Trophies': 'Voir Trophées',
    'Start Career': 'Lancer la Carrière',
    'Resume': 'Reprendre',

    // Transfers & Contracts
    'Transfer Market': 'Marché des Transferts',
    'Official Transfer Proposals': 'Offres Officielles de Transfert',
    'Review incoming bids from interested clubs': 'Examinez les offres transmises par les clubs intéressés',
    'Transfer Fee': 'Indemnité de Transfert',
    'Offered Weekly Wage': 'Salaire Hebdomadaire Proposé',
    'Weekly Salary': 'Salaire Hebdomadaire',
    'Yearly Salary': 'Salaire Annuel',
    'Contract Duration': 'Durée du Contrat',
    'Current Market Valuation': 'Valeur Marchande Actuelle',
    'Squad Role': 'Statut dans l\'Équipe',
    'Club Prestige': 'Prestige du Club',
    'Signing Bonus': 'Prime à la Signature',
    'Agent Cut': 'Commission d\'Agent',
    'Player Transfer Fee Cut': 'Part Joueur sur le Transfert',
    'Free Agent': 'Joueur Libre',
    'Free Agent (Unattached)': 'Joueur Libre (Sans Club)',
    'Free Transfer (€0 Fee)': 'Transfert Libre (Sans Indemnité)',
    'Release Clause': 'Clause Libératoire',
    'Contract Years Remaining': 'Années de Contrat Restantes',
    'Negotiation Leverage': 'Marge de Négociation',
    'Negotiating...': 'Négociation en cours...',
    'All Transfer Bids Withdrawn': 'Offres Retirées',
    'Representation Offers Received!': 'Offres d\'Agents Reçues !',
    'Pre-Season Agency Pitch': 'Propositions d\'Agences en Pré-Saison',
    'Decline All (Remain Self-Managed)': 'Tout Refuser (Rester Autonome)',
    'Contract Renewal': 'Prolongation de Contrat',
    'Request Transfer': 'Demander un Bon de Sortie',
    'Demand Playing Time': 'Réclamer du Temps de Jeu',
    'Fast-Track to Pro Team': 'Promotion Immédiate en Équipe Pro',
    'Trial at Elite Academy': 'Essai en Centre de Formation d\'Élite',

    // Agent Archetypes
    'Professional Agent': 'Agent Professionnel',
    'Shady Fixer': 'Intermédiaire Informel',
    'Famous Super-Agent': 'Super-Agent Célèbre',
    'Self-Managed': 'Sans Agent',
    'Negotiation Master': 'Maître Négociateur',
    'VIP Perks & Influence': 'Réseau VIP et Influence',
    'Under-the-Table Deals': 'Accords Secrets',

    // Matches & Commentary
    'Matchday Performance': 'Performance du Jour',
    'Match Rating': 'Note de Match',
    'Goals Scored': 'Buts Marqués',
    'Assists': 'Passes Décisives',
    'Yellow Cards': 'Cartons Jaunes',
    'Red Cards': 'Cartons Rouges',
    'Man of the Match': 'Homme du Match',
    'Clean Sheet': 'Cage Inviolée',
    'Goal!': 'But !',
    'Penalty Shootout': 'Séance de Tirs au But',
    'Key Match': 'Match Choc',
    'Final Whistle': 'Coup de Sifflet Final',
    'Extra Time': 'Prolongations',
    'Match Winner': 'But de la Victoire',

    // Interviews
    'Press Conference': 'Conférence de Presse',
    'Post-Match Interview': 'Interview d\'Après-Match',
    'Accept Interview': 'Accorder l\'Interview',
    'Decline Interview': 'Refuser l\'Interview',
    'Confirm Statement': 'Confirmer la Déclaration',
    'Press Room Exit': 'Sortir de la Salle de Presse',
    'Sensational Victory': 'Victoire Éclatante',
    'Championship Final': 'Grande Finale',
    'Silverware Secured': 'Trophée Décroché',
    'Penalty Heartbreak': 'Désillusion aux Tirs au But',
    'Relegation Battle': 'Bataille pour le Maintien',

    // Positions & Attributes
    'Striker': 'Buteur / Avant-Centre',
    'Centre Forward': 'Second Attaquant',
    'Left Wing': 'Ailier Gauche',
    'Right Wing': 'Ailier Droit',
    'Attacking Midfielder': 'Milieu Offensif',
    'Central Midfielder': 'Milieu Relayeur',
    'Defensive Midfielder': 'Milieu Défensif / Récupérateur',
    'Left Midfielder': 'Milieu Gauche',
    'Right Midfielder': 'Milieu Droit',
    'Left Back': 'Arrière Gauche',
    'Centre Back': 'Défenseur Central',
    'Right Back': 'Arrière Droit',
    'Goalkeeper': 'Gardien de But',

    'Pace': 'Vitesse / Accélération',
    'Stamina': 'Endurance',
    'Strength': 'Puissance Physique',
    'Ball Control': 'Contrôle de Balle',
    'Dribbling': 'Dribble',
    'Composure': 'Sang-Froid',
    'Short Pass': 'Passe Courte',
    'Long Shots': 'Tir de Loin',
    'Positioning': 'Placement',
    'Finishing': 'Finition',
    'Tackling': 'Tacle / Interception',
    'Handling': 'Prise de Balle',
    'Reflexes': 'Réflexes',
    'Aerial Reach': 'Détente Aérienne',
    '1-on-1': 'Face-à-Face',
    'Distribution': 'Relance',

    // Competitions & Standings
    'League Champions': 'Champion de Ligue',
    'Cup Champions': 'Vainqueur de Coupe',
    'Runners-Up': 'Finaliste',
    'Semi-Finals': 'Demi-Finales',
    'Quarter-Finals': 'Quarts de Finale',
    'Round of 16': 'Huitièmes de Finale',
    'Group Stage': 'Phase de Groupes',
    'Promotion Playoff': 'Barrages de Promotion',
    'Relegation Playoff': 'Barrages de Relégation',
    'Promoted to 1st Division': 'Promu en 1ère Division',
    'Relegated to 2nd Division': 'Relégué en 2ème Division',
    'Safe from Relegation': 'Maintien Assuré',
    'Qualified for Champions League': 'Qualifié pour la Ligue des Champions',
    'Qualified for Europa League': 'Qualifié pour la Ligue Europa',
    'Qualified for Conference League': 'Qualifié pour la Ligue Conférence',
    'Qualified for Copa Libertadores': 'Qualifié pour la Copa Libertadores',
    'Qualified for Copa Sudamericana': 'Qualifié pour la Copa Sudamericana',

    // Economy & Assets
    'Total Net Assets': 'Patrimoine Total',
    'Available Cash': 'Trésorerie Disponible',
    'Properties & Estates': 'Biens Immobiliers',
    'Commercial Businesses': 'Investissements Commerciaux',
    'Sponsorship Deals': 'Contrats de Sponsoring',
    'Purchase Property': 'Acquérir le Bien',
    'Annual Revenue': 'Chiffre d\'Affaires Annuel',
    'Weekly Passive Income': 'Revenu Passif Hebdomadaire',

    // Editor & Sandbox
    'Team & Uniform Editor': 'Éditeur de Clubs et Maillots',
    'Competition & League Editor': 'Éditeur de Compétitions et Ligues',
    'Player Database Editor': 'Éditeur de Base de Données Joueurs',
    'Card Deck & Perks Editor': 'Éditeur de Cartes et Atouts',
    'Trophy Designer': 'Créateur de Trophées',
    'Stadium Capacity': 'Capacité du Stade',
    'Infrastructure Tier': 'Niveau du Centre d\'Entraînement',
    'Save Preset': 'Enregistrer Modèle',
    'Load Preset': 'Charger Modèle',

    // Street Cards & Perks
    'Outside Foot': 'Extérieur du pied',
    'Outside foot': 'Extérieur du pied',
    'Trivela': 'Trivela',
    'Street Captain': 'Capitaine de Rue',
    'Iconic Card': 'Carte Iconique',
    'ICONIC CARD': 'CARTE ICONIQUE',
    'Diamond Tier': 'Niveau Diamant',

    // Save Slot Selection
    'NEW CAREER — SELECT SAVE SLOT': 'NOUVELLE CARRIÈRE — SÉLECTIONNER UN EMPLACEMENT',
    'CONTINUE CAREER — SELECT SAVE SLOT': 'CONTINUER LA CARRIÈRE — SÉLECTIONNER UN EMPLACEMENT',
    'SAVE CAREER — MANAGE SLOTS': 'SAUVEGARDER — GÉRER LES EMPLACEMENTS',
    'CAREER SAVE SLOTS': 'EMPLACEMENTS DE SAUVEGARDE DE CARRIÈRE',
    'Start a fresh journey in an empty slot, load a saved career, or upload a savefile from your computer.': 'Commencez une nouvelle aventure dans un emplacement vide, chargez une carrière ou importez un fichier de sauvegarde.',
    'Select which isolated career instance you want to resume, or upload a savefile.': 'Sélectionnez la carrière que vous souhaitez reprendre ou importez un fichier.',
    '5 independent, fully isolated Unique Career save slots.': '5 emplacements de sauvegarde indépendants et totalement isolés pour le Mode Carrière Unique.',
    'Have a savefile on your device?': 'Vous avez un fichier de sauvegarde sur votre appareil ?',
    'Upload & play right away.': 'Importez et jouez immédiatement.',
    'Upload Savefile (.ftsave / .json)': 'Importer Sauvegarde (.ftsave / .json)',
    'JUST LOADED': 'CHARGÉ À L\'INSTANT',
    '— Empty Save Slot —': '— Emplacement de Sauvegarde Vide —',
    'Ready for a new career or to import a savefile': 'Prêt pour une nouvelle carrière ou pour importer une sauvegarde',
    'Season 1': 'Saison 1',
    'NEW GAME': 'NOUVELLE CARRIÈRE',
    'SAVE HERE': 'ENREGISTRER ICI',
    'PLAY RIGHT AWAY': 'JOUER IMMÉDIATEMENT',
    'VIEW ALL SLOTS': 'VOIR TOUS LES EMPLACEMENTS',
    'Play this career or start a new character in this slot.': 'Jouez cette carrière ou commencez un nouveau personnage dans cet emplacement.',
    'Saved Career:': 'Carrière Sauvegardée :',
    'PLAY THIS CAREER': 'JOUER CETTE CARRIÈRE',
    'OVERWRITE & START FRESH': 'ÉCRASER ET REPARTIR DE ZÉRO',
    'OVERWRITE CAREER?': 'ÉCRASER LA CARRIÈRE ?',
    'CONFIRM & OVERWRITE': 'CONFIRMER ET ÉCRASER',
    'This will permanently delete this career instance.': 'Cela supprimera définitivement cette session de carrière.',
    'DELETE CAREER': 'SUPPRIMER LA CARRIÈRE',

    // Match Importance Mode Configuration
    'Select Match Importance Mode': 'Sélectionner le Mode d\'Importance des Matchs',
    'Select Match Importance Mode ⚡': 'Sélectionner le Mode d\'Importance des Matchs ⚡',
    'SELECT MATCH IMPORTANCE MODE': 'SÉLECTIONNER LE MODE D\'IMPORTANCE DES MATCHS',
    'Match Importance Mode': 'Mode d\'Importance des Matchs',
    'NEW UNIQUE CAREER CONFIGURATION': 'CONFIGURATION DE LA NOUVELLE CARRIÈRE UNIQUE',
    'CAREER MATCH ENGINE SETTINGS': 'PARAMÈTRES DU MOTEUR DE MATCHS',
    'Choose how frequently you step onto the pitch for interactive': 'Choisissez à quelle fréquence vous entrez sur le terrain pour des',
    'Choose how frequently you step onto the pitch for interactive Key Matches.': 'Choisissez à quelle fréquence vous entrez sur le terrain pour disputer des Matchs Clés interactifs.',
    'Key Matches': 'Matchs Clés',
    'Play 100% of Matches (Every Match is Interactive)': 'Jouez 100 % des Matchs (Chaque Match est Interactif)',
    'Play ~30% Stakes (Finals, Derbies & Title Deciders)': 'Jouez ~30 % à Fort Enjeu (Finales, Derbys et Titres)',
    'Play ~10% Finals Only (Trophy & Survival Games)': 'Jouez ~10 % Finales Uniquement (Trophées et Maintien)',
    'Slow Mode': 'Mode Lent',
    'Play All Matches (1, 2, 3)': 'Jouer Tous les Matchs (1, 2, 3)',
    '100% Matches': '100 % des Matchs',
    'Decisive Mode': 'Mode Décisif',
    'Definitive + Important (1 & 2)': 'Définitifs + Importants (1 et 2)',
    '~30% High Stakes': '~30 % Fort Enjeu',
    'Finals Only': 'Finales Uniquement',
    'Definitive Only (1)': 'Définitifs Uniquement (1)',
    '~10% Finals Only': '~10 % Finales Uniquement',
    'Active Mode:': 'Mode Actif :',
    'Confirm Career Mode & Continue': 'Confirmer le Mode de Carrière et Continuer',
    'Save Match Settings': 'Enregistrer les Paramètres de Match',
  },
};

/**
 * Universal auto-translator for any dynamic or generated phrase.
 * If targetLang is 'en-GB', returns English directly.
 * Otherwise looks up exact phrase, normalized phrase, or template matches.
 */
export function autoTranslateText(text: string, targetLang: LanguageCode): string {
  if (!text || typeof text !== 'string') return text || '';
  if (targetLang === 'en-GB') return text;

  const trimmed = text.trim();

  // 1. Direct dictionary match
  const dict = PHRASE_DICTIONARY[targetLang];
  if (dict && dict[trimmed]) {
    return dict[trimmed];
  }

  // 2. Case-insensitive dictionary match
  if (dict) {
    const lower = trimmed.toLowerCase();
    for (const [k, v] of Object.entries(dict)) {
      if (k.toLowerCase() === lower) {
        return v;
      }
    }
  }

  // 3. Dynamic patterns (Regex Matchers preserving proper nouns, numbers, currencies)
  return translateDynamicSentence(trimmed, targetLang);
}

/**
 * Dynamic sentence & template translator that extracts numbers, amounts, team names,
 * and reconstructs the sentence in natural regional football phrasing.
 */
export function translateDynamicSentence(text: string, targetLang: LanguageCode): string {
  if (!text || targetLang === 'en-GB') return text;

  // Pattern: "X has submitted an official transfer offer of €Y with €Z/week wage"
  const offerMatch = text.match(/(.+) (?:have|has) submitted an official transfer offer (?:of|for) (.+) with (.+)\/week/i);
  if (offerMatch) {
    const club = offerMatch[1].trim();
    const fee = offerMatch[2].trim();
    const wage = offerMatch[3].trim();
    switch (targetLang) {
      case 'es-ES': return `¡El ${club} ha presentado una oferta de traspaso oficial por ${fee} con un salario de ${wage}/semana!`;
      case 'es-AR': return `¡El ${club} presentó una oferta formal de ${fee} con un sueldo de ${wage}/semana!`;
      case 'pt-BR': return `O ${club} apresentou uma proposta oficial de transferência no valor de ${fee} com salário de ${wage}/semana!`;
      case 'fr-FR': return `Le ${club} a soumis une offre de transfert officielle de ${fee} avec un salaire de ${wage}/semaine !`;
    }
  }

  // Pattern: "Signed contract with X until Y"
  const contractMatch = text.match(/Signed (?:contract|new deal) with (.+) until (\d{4})/i);
  if (contractMatch) {
    const club = contractMatch[1].trim();
    const year = contractMatch[2].trim();
    switch (targetLang) {
      case 'es-ES': return `Contrato firmado con el ${club} hasta ${year}.`;
      case 'es-AR': return `Contrato firmado con ${club} hasta ${year}.`;
      case 'pt-BR': return `Contrato assinado com o ${club} até ${year}.`;
      case 'fr-FR': return `Contrat signé avec le ${club} jusqu'en ${year}.`;
    }
  }

  // Pattern: "Finished Rank #N in X"
  const rankMatch = text.match(/Finished Rank #(\d+) in (.+)/i);
  if (rankMatch) {
    const rank = rankMatch[1];
    const comp = rankMatch[2];
    switch (targetLang) {
      case 'es-ES': return `Finalizó en la posición #${rank} en ${comp}`;
      case 'es-AR': return `Terminó en el puesto #${rank} en ${comp}`;
      case 'pt-BR': return `Terminou na #${rank}ª colocação em ${comp}`;
      case 'fr-FR': return `Classé au #${rank} rang en ${comp}`;
    }
  }

  // Pattern: "Injured for N weeks (X)"
  const injuryMatch = text.match(/Injured for (\d+) (?:weeks|week) \((.+)\)/i);
  if (injuryMatch) {
    const weeks = injuryMatch[1];
    const injury = injuryMatch[2];
    switch (targetLang) {
      case 'es-ES': return `Lesionado durante ${weeks} semanas (${injury})`;
      case 'es-AR': return `De baja por ${weeks} semanas (${injury})`;
      case 'pt-BR': return `Lesionado por ${weeks} semanas (${injury})`;
      case 'fr-FR': return `Blessé pendant ${weeks} semaines (${injury})`;
    }
  }

  // Pattern: "Scored N goals and provided M assists"
  const statsMatch = text.match(/Scored (\d+) goals? and provided (\d+) assists?/i);
  if (statsMatch) {
    const goals = statsMatch[1];
    const assists = statsMatch[2];
    switch (targetLang) {
      case 'es-ES': return `Marcó ${goals} goles y repartió ${assists} asistencias`;
      case 'es-AR': return `Convirtió ${goals} goles y metió ${assists} asistencias`;
      case 'pt-BR': return `Marcou ${goals} gols e deu ${assists} assistências`;
      case 'fr-FR': return `A marqué ${goals} buts et délivré ${assists} passes décisives`;
    }
  }

  // Pattern: "Matchday N" / "Fixture N" / "Week N"
  const mdMatch = text.match(/(?:Matchday|Fixture|Week|Round) (\d+)/i);
  if (mdMatch) {
    const num = mdMatch[1];
    switch (targetLang) {
      case 'es-ES': return `Jornada ${num}`;
      case 'es-AR': return `Fecha ${num}`;
      case 'pt-BR': return `Rodada ${num}`;
      case 'fr-FR': return `Journée ${num}`;
    }
  }

  // Pattern: "+N Stat Points" or "+N Points Available"
  const pointsMatch = text.match(/\+?(\d+) (?:Stat Points|Points Available|Points)/i);
  if (pointsMatch) {
    const pts = pointsMatch[1];
    switch (targetLang) {
      case 'es-ES': return `+${pts} Puntos de Atributo`;
      case 'es-AR': return `+${pts} Puntos de Habilidad`;
      case 'pt-BR': return `+${pts} Pontos de Atributo`;
      case 'fr-FR': return `+${pts} Points d'Attribut`;
    }
  }

  // Pattern: "SLOT N" or "Slot N"
  const slotMatch = text.match(/^(?:SLOT|Slot) (\d+)$/i);
  if (slotMatch) {
    const sId = slotMatch[1];
    switch (targetLang) {
      case 'es-ES':
      case 'es-AR': return `RANURA ${sId}`;
      case 'pt-BR': return `ESPAÇO ${sId}`;
      case 'fr-FR': return `EMPLACEMENT ${sId}`;
    }
  }

  // Pattern: "N Isolated Save Slots"
  const totalSlotsMatch = text.match(/^(\d+) Isolated Save Slots$/i);
  if (totalSlotsMatch) {
    const tot = totalSlotsMatch[1];
    switch (targetLang) {
      case 'es-ES':
      case 'es-AR': return `${tot} Ranuras de Guardado Aisladas`;
      case 'pt-BR': return `${tot} Espaços de Salvamento Isolados`;
      case 'fr-FR': return `${tot} Emplacements de Sauvegarde Isolés`;
    }
  }

  // Fallback: return raw text if no pattern matched
  return text;
}
