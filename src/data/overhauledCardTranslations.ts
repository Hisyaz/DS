import { CardLocalizedText } from '../utils/cardTranslationsDatabase';
import { OUTFIELD_STAT_METADATA } from './statProgressionCardsData';

type SupportedLangs = 'en-GB' | 'es-ES' | 'es-AR' | 'pt-BR' | 'fr-FR';

export interface StatTranslationDictionary {
  statLabel: Record<SupportedLangs, string>;
  groupLabel: Record<SupportedLangs, string>;
  flatName: Record<SupportedLangs, string>;
  flatDesc: Record<SupportedLangs, string>;
  ptsName: Record<SupportedLangs, string>;
  ptsDesc: Record<SupportedLangs, string>;
}

const STAT_LOCALIZATIONS: Record<string, StatTranslationDictionary> = {
  pace: {
    statLabel: { 'en-GB': 'Pace', 'es-ES': 'Ritmo', 'es-AR': 'Pique', 'pt-BR': 'Ritmo', 'fr-FR': 'Vitesse' },
    groupLabel: { 'en-GB': 'Physical', 'es-ES': 'Físico', 'es-AR': 'Físico', 'pt-BR': 'Físico', 'fr-FR': 'Physique' },
    flatName: { 'en-GB': 'Pace Explosion', 'es-ES': 'Explosión de Ritmo', 'es-AR': 'Explosión de Arranque', 'pt-BR': 'Explosão de Ritmo', 'fr-FR': 'Explosion de Vitesse' },
    flatDesc: { 'en-GB': 'Burst speed sprint training pushing acceleration to elite thresholds.', 'es-ES': 'Entrenamiento de velocidad pura para superar a rivales con aceleración fulgurante.', 'es-AR': 'Práctica de velocidad para dejar clavado a tu marcador en el primer paso.', 'pt-BR': 'Treino de aceleração pura para deixar qualquer marcador para trás.', 'fr-FR': 'Accélération pure pour déposer vos adversaires dès la prise d’élan.' },
    ptsName: { 'en-GB': 'Pace Sprint Reps', 'es-ES': 'Series de Velocidad', 'es-AR': 'Repeticiones de Pique', 'pt-BR': 'Séries de Corrida e Pique', 'fr-FR': 'Répétitions de Sprint' },
    ptsDesc: { 'en-GB': 'Targeted sprint development points to systematically advance sprint speed tier by tier.', 'es-ES': 'Puntos de desarrollo destinados a mejorar tu velocidad de punta y aceleración.', 'es-AR': 'Puntos de entrenamiento progresivo para subir de nivel tu velocidad y pique.', 'pt-BR': 'Pontos focados para desenvolver progressivamente seu ritmo e velocidade.', 'fr-FR': 'Points de progression pour augmenter votre vitesse par paliers constants.' },
  },
  stamina: {
    statLabel: { 'en-GB': 'Stamina', 'es-ES': 'Resistencia', 'es-AR': 'Resistencia', 'pt-BR': 'Resistência', 'fr-FR': 'Endurance' },
    groupLabel: { 'en-GB': 'Physical', 'es-ES': 'Físico', 'es-AR': 'Físico', 'pt-BR': 'Físico', 'fr-FR': 'Physique' },
    flatName: { 'en-GB': 'Endless Engine', 'es-ES': 'Motor Inagotable', 'es-AR': 'Pulmones de Acero', 'pt-BR': 'Fôlego Interminável', 'fr-FR': 'Moteur Inépuisable' },
    flatDesc: { 'en-GB': 'High-volume endurance sessions granting relentless box-to-box stamina.', 'es-ES': 'Resistencia cardiovascular de élite para mantener la intensidad hasta el minuto 95.', 'es-AR': 'Fondo físico total para correr toda la cancha sin aflojar ni un minuto.', 'pt-BR': 'Capacidade aeróbica de ponta para correr os 90 minutos em ritmo máximo.', 'fr-FR': 'Capacité aérobie exceptionnelle pour répéter les efforts de la première à la dernière minute.' },
    ptsName: { 'en-GB': 'Aerobic Volume Training', 'es-ES': 'Volumen Aeróbico', 'es-AR': 'Fondo Aeróbico', 'pt-BR': 'Volume Aeróbico', 'fr-FR': 'Volume Aérobie' },
    ptsDesc: { 'en-GB': 'Stat points invested into lung capacity and high-intensity recovery cycles.', 'es-ES': 'Puntos de desarrollo para elevar tu resistencia física y resistencia a la fatiga.', 'es-AR': 'Puntos de evolución para aumentar tu resistencia en los momentos clave.', 'pt-BR': 'Pontos de desenvolvimento para aprimorar sua resistência física.', 'fr-FR': 'Points d’évolution pour améliorer votre volume athlétique et endurance.' },
  },
  strength: {
    statLabel: { 'en-GB': 'Strength', 'es-ES': 'Fuerza', 'es-AR': 'Fuerza', 'pt-BR': 'Força', 'fr-FR': 'Force' },
    groupLabel: { 'en-GB': 'Physical', 'es-ES': 'Físico', 'es-AR': 'Físico', 'pt-BR': 'Físico', 'fr-FR': 'Physique' },
    flatName: { 'en-GB': 'Iron Frame Physicality', 'es-ES': 'Potencia Muscular', 'es-AR': 'Choque y Firmeza', 'pt-BR': 'Força e Postura', 'fr-FR': 'Puissance Physique' },
    flatDesc: { 'en-GB': 'Gym conditioning that transforms you into an immovable force in shoulder-to-shoulder duels.', 'es-ES': 'Acondicionamiento físico de choque para dominar en los duels cuerpo a cuerpo.', 'es-AR': 'Trabajo de pesas y masa muscular para no perder jamás un choque cuerpo a cuerpo.', 'pt-BR': 'Desenvolvimento de força corporal para vencer divididas com autoridade.', 'fr-FR': 'Renforcement physique pour remporter chaque duel à l’épaule.' },
    ptsName: { 'en-GB': 'Power Resistance Reps', 'es-ES': 'Trabajo de Potencia', 'es-AR': 'Cargas de Potencia', 'pt-BR': 'Musculação e Potência', 'fr-FR': 'Développement Puissance' },
    ptsDesc: { 'en-GB': 'Targeted investment into core stability and upper-body shielding leverage.', 'es-ES': 'Puntos de entrenamiento dedicados a aumentar tu potencia muscular y fuerza de duelo.', 'es-AR': 'Puntos dedicados a ganar lomo, potencia y resistencia en el choque.', 'pt-BR': 'Pontos para elevar sua massa muscular e poder de sustentação física.', 'fr-FR': 'Points de progression pour consolider votre puissance et stabilité.' },
  },
  ballControl: {
    statLabel: { 'en-GB': 'Ball Control', 'es-ES': 'Control de Balón', 'es-AR': 'Control de Primera', 'pt-BR': 'Controle de Bola', 'fr-FR': 'Contrôle de Balle' },
    groupLabel: { 'en-GB': 'Progression', 'es-ES': 'Progresión', 'es-AR': 'Progresión', 'pt-BR': 'Progressão', 'fr-FR': 'Progression' },
    flatName: { 'en-GB': 'Velvet First Touch', 'es-ES': 'Control de Seda', 'es-AR': 'Toque Aterciopelado', 'pt-BR': 'Domínio Aveludado', 'fr-FR': 'Premier Toucher Soyeux' },
    flatDesc: { 'en-GB': 'Cushioning high-velocity passes instantly into favorable playing angles.', 'es-ES': 'Amortiguación impecable para dominar cualquier balón aéreo o raso al primer contacto.', 'es-AR': 'Control perfecto que duerme cualquier pelotazo al instante en la punta del botín.', 'pt-BR': 'Domínio cirúrgico para colar a bola no pé logo no primeiro toque.', 'fr-FR': 'Amorti chirurgical pour scotcher le ballon au pied dès la réception.' },
    ptsName: { 'en-GB': 'Trapping Precision Reps', 'es-ES': 'Técnica de Control', 'es-AR': 'Práctica de Domada', 'pt-BR': 'Treino de Domínio', 'fr-FR': 'Précision de Prise' },
    ptsDesc: { 'en-GB': 'Progressive stat points perfecting first-touch consistency under rapid closing pressure.', 'es-ES': 'Puntos de desarrollo para pulir la calidad de tu primer toque en cualquier situación.', 'es-AR': 'Puntos de entrenamiento para mejorar el control y amortiguación de pelota.', 'pt-BR': 'Pontos para aperfeiçoar o primeiro toque e a recepção de passes rápidos.', 'fr-FR': 'Points d’évolution pour peaufiner votre toucher de balle sous pressing.' },
  },
  retention: {
    statLabel: { 'en-GB': 'Retention', 'es-ES': 'Retención', 'es-AR': 'Aguante de Pelota', 'pt-BR': 'Retenção', 'fr-FR': 'Rétention' },
    groupLabel: { 'en-GB': 'Progression', 'es-ES': 'Progresión', 'es-AR': 'Progresión', 'pt-BR': 'Progressão', 'fr-FR': 'Progression' },
    flatName: { 'en-GB': 'Shielding Vault', 'es-ES': 'Protección Blindada', 'es-AR': 'Aguante y Cobertura', 'pt-BR': 'Proteção de Posse', 'fr-FR': 'Bouclier Protecteur' },
    flatDesc: { 'en-GB': 'Using body geometry and foot pivots to keep possession untouched under heavy press.', 'es-ES': 'Uso del cuerpo y giros rápidos para blindar el balón ante la presión asfixiante.', 'es-AR': 'Técnica para cubrir la pelota con el lomo e impedir que te la roben.', 'pt-BR': 'Giro de corpo e postura perfeita para reter a bola sem perder a posse.', 'fr-FR': 'Utilisation des appuis et du corps pour conserver le ballon sous forte pression.' },
    ptsName: { 'en-GB': 'Possession Grip Reps', 'es-ES': 'Práctica de Retención', 'es-AR': 'Control Bajo Presión', 'pt-BR': 'Fundamentos de Retenção', 'fr-FR': 'Travail de Conservation' },
    ptsDesc: { 'en-GB': 'Stat points dedicated to maintaining ball security in suffocating midfield areas.', 'es-ES': 'Puntos de desarrollo para no perder nunca el cuero en zonas comprometidas.', 'es-AR': 'Puntos para afianzar el aguante de la pelota ante los centrales.', 'pt-BR': 'Pontos para fortalecer o giro e a segurança com a bola nos pés.', 'fr-FR': 'Points d’amélioration pour fiabiliser la conservation de balle en milieu dense.' },
  },
  dribbling: {
    statLabel: { 'en-GB': 'Dribbling', 'es-ES': 'Regate', 'es-AR': 'Gambeta', 'pt-BR': 'Drible', 'fr-FR': 'Dribble' },
    groupLabel: { 'en-GB': 'Progression', 'es-ES': 'Progresión', 'es-AR': 'Progresión', 'pt-BR': 'Progressão', 'fr-FR': 'Progression' },
    flatName: { 'en-GB': 'Street Dribbler', 'es-ES': 'Regateador Nato', 'es-AR': 'Gambeteador Impredecible', 'pt-BR': 'Driblador Audacioso', 'fr-FR': 'Dribbleur Flamboyant' },
    flatDesc: { 'en-GB': 'Hypnotic feints and sudden changes of direction leaving defenders tackling shadows.', 'es-ES': 'Fintas desequilibrantes y cambios de ritmo eléctricos que desarman defensas.', 'es-AR': 'Pura gambeta y quiebre de cintura para limpiar rivales en el mano a mano.', 'pt-BR': 'Gingado envolvente e fintas secas para quebrar a marcação adversária.', 'fr-FR': 'Feintes dévastatrices et changements d’appui pour éliminer en un-contre-un.' },
    ptsName: { 'en-GB': 'Agile Slalom Reps', 'es-ES': 'Slalom y Desborde', 'es-AR': 'Quiebre y Amagues', 'pt-BR': 'Exercícios de Finta', 'fr-FR': 'Slalom et Changement d’Appui' },
    ptsDesc: { 'en-GB': 'Targeted stat points focused on close-control slalom dribbling and ball glued to feet.', 'es-ES': 'Puntos de desarrollo para potenciar tu regate corto y capacidad de desborde.', 'es-AR': 'Puntos progresivos para perfeccionar tu cintura y habilidad de gambeta.', 'pt-BR': 'Pontos para acelerar o desenvolvimento de seus dribles curtos e controle.', 'fr-FR': 'Points d’évolution pour affiner vos crochets et votre conduite de balle.' },
  },
  shortPass: {
    statLabel: { 'en-GB': 'Short Pass', 'es-ES': 'Pase Corto', 'es-AR': 'Pase Corto', 'pt-BR': 'Passe Curto', 'fr-FR': 'Passe Courte' },
    groupLabel: { 'en-GB': 'Creation', 'es-ES': 'Creación', 'es-AR': 'Creación', 'pt-BR': 'Criação', 'fr-FR': 'Création' },
    flatName: { 'en-GB': 'Tiki-Taka Precision', 'es-ES': 'Pase al Pie', 'es-AR': 'Pared y Descarga', 'pt-BR': 'Toca e Passa', 'fr-FR': 'Passe Courte Fluide' },
    flatDesc: { 'en-GB': 'Laser-guided ground distribution with ideal weighting into teammate strides.', 'es-ES': 'Pases medidos al milímetro que facilitan la continuidad del juego ofensivo.', 'es-AR': 'Toques al pie con peso justo para armar juego rápido a un solo toque.', 'pt-BR': 'Distribuição precisa e limpa para acelerar o jogo de aproximação.', 'fr-FR': 'Distribution au sol millimétrée permettant de fluidifier la circulation de balle.' },
    ptsName: { 'en-GB': 'One-Touch Rondo Drills', 'es-ES': 'Rondos y Combinación', 'es-AR': 'Rondos de Precisión', 'pt-BR': 'Rodas de Bobinho e Passe', 'fr-FR': 'Toro et Répétitions Passes' },
    ptsDesc: { 'en-GB': 'Systematic stat points to build flawless short passing accuracy under pressure.', 'es-ES': 'Puntos de desarrollo para elevar la precisión de tu pase corto y combinativo.', 'es-AR': 'Puntos de entrenamiento para perfeccionar la entrega y pases cortos.', 'pt-BR': 'Pontos para aprimorar a precisão do passe curto e tabelas rápidas.', 'fr-FR': 'Points de progression pour optimiser votre jeu court en une touche.' },
  },
  longPass: {
    statLabel: { 'en-GB': 'Long Pass', 'es-ES': 'Pase Largo', 'es-AR': 'Pase Largo', 'pt-BR': 'Passe Longo', 'fr-FR': 'Passe Longue' },
    groupLabel: { 'en-GB': 'Creation', 'es-ES': 'Creación', 'es-AR': 'Creación', 'pt-BR': 'Criação', 'fr-FR': 'Création' },
    flatName: { 'en-GB': 'Radar Diagonal', 'es-ES': 'Cambio de Orientación', 'es-AR': 'Cambio de Frente Milimétrico', 'pt-BR': 'Virada de Jogo Precisa', 'fr-FR': 'Transversale Chirurgicale' },
    flatDesc: { 'en-GB': 'Panoramic diagonal launches that stretch opposing defensive blocks across the pitch.', 'es-ES': 'Lanzamientos largos con trayectoria perfecta para habilitar a los extremos.', 'es-AR': 'Pelotazos teledirigidos para cambiar de frente y sorprender a la defensa.', 'pt-BR': 'Lançamentos precisos que encontram companheiros desmarcados na outra ponta.', 'fr-FR': 'Ouvertures lumineuses qui renversent le jeu et transpercent les blocs adverses.' },
    ptsName: { 'en-GB': 'Switch Distribution Reps', 'es-ES': 'Práctica de Desplazamiento', 'es-AR': 'Entrenamiento de Bocha Larga', 'pt-BR': 'Treino de Lançamento', 'fr-FR': 'Perfectionnement Transversales' },
    ptsDesc: { 'en-GB': 'Stat point investment into field trajectory vision and long-distance striking accuracy.', 'es-ES': 'Puntos de desarrollo para perfeccionar la precisión en pases largos y centros templados.', 'es-AR': 'Puntos para mejorar el golpeo aéreo y la puntería en pelotas largas.', 'pt-BR': 'Pontos de evolução para afinar a mira nos lançamentos de longa distância.', 'fr-FR': 'Points de progression pour accroître la précision de vos transversales.' },
  },
  crossing: {
    statLabel: { 'en-GB': 'Crossing', 'es-ES': 'Centros', 'es-AR': 'Centros', 'pt-BR': 'Cruzamentos', 'fr-FR': 'Centres' },
    groupLabel: { 'en-GB': 'Creation', 'es-ES': 'Creación', 'es-AR': 'Creación', 'pt-BR': 'Criação', 'fr-FR': 'Création' },
    flatName: { 'en-GB': 'Whipped Delivery', 'es-ES': 'Centro Venenoso', 'es-AR': 'Centro Envenenado', 'pt-BR': 'Cruzamento Perfeito', 'fr-FR': 'Centre Brossé' },
    flatDesc: { 'en-GB': 'Curling trajectory crosses delivering maximum threat right between goalkeeper and defenders.', 'es-ES': 'Envíos enroscados desde las bandas que caen con precisión letal en el área rival.', 'es-AR': 'Centros con comba que superan a los centrales y le caen servidos al nueve.', 'pt-BR': 'Cruzamentos colocados com curva que facilitam o cabeceio dos atacantes.', 'fr-FR': 'Centres enroulés plongeants déposés pile dans la course des attaquants.' },
    ptsName: { 'en-GB': 'Wing Delivery Drills', 'es-ES': 'Técnica de Centros', 'es-AR': 'Lanzamiento por Afuera', 'pt-BR': 'Treino de Bolas Alçadas', 'fr-FR': 'Entraînement aux Centres' },
    ptsDesc: { 'en-GB': 'Stat points dedicated to mastering curving crosses and cutback passes.', 'es-ES': 'Puntos de desarrollo enfocados en la calidad de tus centros y pases hacia atrás.', 'es-AR': 'Puntos de entrenamiento para clavar los centros en el punto penal.', 'pt-BR': 'Pontos para dominar a arte de colocar a bola na cabeça dos companheiros.', 'fr-FR': 'Points d’évolution pour affiner vos centres tendus ou lobés.' },
  },
  shooting: {
    statLabel: { 'en-GB': 'Shooting', 'es-ES': 'Disparo', 'es-AR': 'Definición', 'pt-BR': 'Finalização', 'fr-FR': 'Finition' },
    groupLabel: { 'en-GB': 'Goalscoring', 'es-ES': 'Definición', 'es-AR': 'Goleador', 'pt-BR': 'Artilharia', 'fr-FR': 'Finition' },
    flatName: { 'en-GB': 'Clinical Finisher', 'es-ES': 'Definidor Quirúrgico', 'es-AR': 'Definidor Implacable', 'pt-BR': 'Finalizador Implacável', 'fr-FR': 'Finisseur Clinique' },
    flatDesc: { 'en-GB': 'Ice-cold finishing placing strikes into unreachable side netting inside the 18-yard box.', 'es-ES': 'Remates precisos a los ángulos que no dan oportunidad de reacción al guardameta.', 'es-AR': 'Definiciones secas y justas para mandarla a guardar sin titubear.', 'pt-BR': 'Chutes certeiros no canto para não dar a menor chance ao goleiro.', 'fr-FR': 'Frappes nettes et précises au ras du poteau ne laissant aucune chance au gardien.' },
    ptsName: { 'en-GB': 'Box Finishing Reps', 'es-ES': 'Repeticiones de Remate', 'es-AR': 'Práctica de Definición', 'pt-BR': 'Treino de Finalizações', 'fr-FR': 'Répétitions Devant le But' },
    ptsDesc: { 'en-GB': 'Stat point progression to consistently execute lethal close-range finishes.', 'es-ES': 'Puntos de desarrollo para elevar la efectividad goleadora en el mano a mano.', 'es-AR': 'Puntos de evolución para aumentar tu eficacia goleadora y definir mejor.', 'pt-BR': 'Pontos para transformar chances claras em gols com regularidade.', 'fr-FR': 'Points d’évolution pour maximiser votre ratio d’efficacité devant la cage.' },
  },
  heading: {
    statLabel: { 'en-GB': 'Heading', 'es-ES': 'Remate de Cabeza', 'es-AR': 'Cabezazo', 'pt-BR': 'Cabeceio', 'fr-FR': 'Jeu de Tête' },
    groupLabel: { 'en-GB': 'Goalscoring', 'es-ES': 'Definición', 'es-AR': 'Goleador', 'pt-BR': 'Artilharia', 'fr-FR': 'Finition' },
    flatName: { 'en-GB': 'Aerial Dominator', 'es-ES': 'Martillazo Aéreo', 'es-AR': 'Frentazo Goleador', 'pt-BR': 'Cabeceio Fulminante', 'fr-FR': 'Coup de Casque' },
    flatDesc: { 'en-GB': 'Elevating with commanding hangtime to power headers downward into the net.', 'es-ES': 'Salto imponente y remate picado de cabeza que supera a cualquier zaguero.', 'es-AR': 'Frentazo potente anticipando a los defensores para romper el arco.', 'pt-BR': 'Salto no tempo certo para cabecear firme para baixo com endereço certo.', 'fr-FR': 'Détente athlétique pour smasher la balle de la tête hors de portée.' },
    ptsName: { 'en-GB': 'Aerial Timing Drills', 'es-ES': 'Salto y Cabezazo', 'es-AR': 'Timing Aéreo', 'pt-BR': 'Treino de Bola Aérea', 'fr-FR': 'Timing Aérien' },
    ptsDesc: { 'en-GB': 'Stat points dedicated to perfecting aerial trajectory timing and header power.', 'es-ES': 'Puntos de desarrollo para calibrar el salto y la potencia del cabezazo.', 'es-AR': 'Puntos para mejorar el salto, anticipación y dirección del frentazo.', 'pt-BR': 'Pontos para aperfeiçoar o tempo de bola e impulsão em jogadas aéreas.', 'fr-FR': 'Points d’amélioration pour caler votre détente et la force de vos têtes.' },
  },
  longShots: {
    statLabel: { 'en-GB': 'Long Shots', 'es-ES': 'Tiros Lejanos', 'es-AR': 'Tiros de Afuera', 'pt-BR': 'Chutes de Longe', 'fr-FR': 'Tirs de Loin' },
    groupLabel: { 'en-GB': 'Goalscoring', 'es-ES': 'Definición', 'es-AR': 'Goleador', 'pt-BR': 'Artilharia', 'fr-FR': 'Finition' },
    flatName: { 'en-GB': 'Rocket Launch', 'es-ES': 'Misil Teledirigido', 'es-AR': 'Bomba de Media Distancia', 'pt-BR': 'Bomba de Longe', 'fr-FR': 'Missile Hors Surface' },
    flatDesc: { 'en-GB': 'Thunderous distance strikes dipping with swerve to score from outside the box.', 'es-ES': 'Trallazos imparables de media distancia que dejan clavados a los porteros.', 'es-AR': 'Zurdazos o derechazos de afuera del área que bajan de golpe al ángulo.', 'pt-BR': 'Disparos venenosos de fora da área com curva e potência máximas.', 'fr-FR': 'Frappes surpuissantes de plus de 20 mètres finissant directement sous la barre.' },
    ptsName: { 'en-GB': 'Distance Ballistics Reps', 'es-ES': 'Técnica de Larga Distancia', 'es-AR': 'Práctica de Bombas', 'pt-BR': 'Treino de Chutes Longos', 'fr-FR': 'Frappes Hors Surface' },
    ptsDesc: { 'en-GB': 'Stat point progression to consistently convert distance attempts into goal threats.', 'es-ES': 'Puntos de desarrollo para perfeccionar la potencia y curva de tus disparos lejanos.', 'es-AR': 'Puntos para ganar confianza y puntería rematando de media distancia.', 'pt-BR': 'Pontos para aprimorar o chute de longe e assustar de qualquer lugar.', 'fr-FR': 'Points d’évolution pour devenir un danger permanent sur les tirs de loin.' },
  },
  tackling: {
    statLabel: { 'en-GB': 'Tackling', 'es-ES': 'Entradas', 'es-AR': 'Quite', 'pt-BR': 'Desarme', 'fr-FR': 'Tacle' },
    groupLabel: { 'en-GB': 'Defensive', 'es-ES': 'Defensivo', 'es-AR': 'Defensivo', 'pt-BR': 'Defesa', 'fr-FR': 'Défense' },
    flatName: { 'en-GB': 'Clean Hook Tackle', 'es-ES': 'Entrada Impecable', 'es-AR': 'Quite Limpio y Firme', 'pt-BR': 'Desarme Limpo', 'fr-FR': 'Tacle Glissé Impeccable' },
    flatDesc: { 'en-GB': 'Timing defensive challenges cleanly to dispossess attackers without fouling.', 'es-ES': 'Intervenciones limpias que arrebatan el balón sin conceder falta alguna.', 'es-AR': 'Barridas milimétricas que van directo a la pelota y desarman al atacante.', 'pt-BR': 'Desarmes com timing perfeito para desarmar atacantes de forma limpa.', 'fr-FR': 'Tacles précis au sol chipant la balle dans les pieds sans commettre d’infraction.' },
    ptsName: { 'en-GB': '1v1 Challenge Drills', 'es-ES': 'Técnica de Duelo', 'es-AR': 'Práctica de Barridas', 'pt-BR': 'Treino de Desarme', 'fr-FR': 'Exercices de Tacle' },
    ptsDesc: { 'en-GB': 'Stat points dedicated to winning standing and sliding challenges on the floor.', 'es-ES': 'Puntos de desarrollo para dominar las entradas rasas y ganar balones divididos.', 'es-AR': 'Puntos para afinar la entrada al suelo y no quedar pagando nunca.', 'pt-BR': 'Pontos para aumentar a taxa de sucesso nos desarmes terrestres.', 'fr-FR': 'Points de progression pour optimiser votre efficacité dans le tacle.' },
  },
  marking: {
    statLabel: { 'en-GB': 'Marking', 'es-ES': 'Marcaje', 'es-AR': 'Marca', 'pt-BR': 'Marcação', 'fr-FR': 'Marquage' },
    groupLabel: { 'en-GB': 'Defensive', 'es-ES': 'Defensivo', 'es-AR': 'Defensivo', 'pt-BR': 'Defesa', 'fr-FR': 'Défense' },
    flatName: { 'en-GB': 'Shadow Lockdown', 'es-ES': 'Marcaje Asfixiante', 'es-AR': 'Marca Pegajosa', 'pt-BR': 'Marcação Sombra', 'fr-FR': 'Marquage au Pantalon' },
    flatDesc: { 'en-GB': 'Gluing yourself to opponent strikers to eliminate their turning angles completely.', 'es-ES': 'Marcaje estrecho que no deja respirar al delantero ni girar con comodidad.', 'es-AR': 'Pegarse como estampilla al atacante para anularle cualquier chance de giro.', 'pt-BR': 'Marcação colada que não dá espaço nem para o adversário respirar.', 'fr-FR': 'Marquage individuel collant empêchant l’attaquant de se retourner.' },
    ptsName: { 'en-GB': 'Containment Footwork Drills', 'es-ES': 'Cobertura y Marca', 'es-AR': 'Postura Defensiva', 'pt-BR': 'Postura de Marcação', 'fr-FR': 'Cadrage et Recul Frein' },
    ptsDesc: { 'en-GB': 'Stat point progression to perfect tight containment and avoid getting bypassed.', 'es-ES': 'Puntos de desarrollo para mejorar tu postura corporal y eficacia en la marca.', 'es-AR': 'Puntos para aprender a aguantar y no regalar la espalda al delantero.', 'pt-BR': 'Pontos para aprimorar o posicionamento e marcação cerrada.', 'fr-FR': 'Points d’évolution pour cadenasser votre vis-à-vis sans vous faire déborder.' },
  },
  interceptions: {
    statLabel: { 'en-GB': 'Interceptions', 'es-ES': 'Intercepciones', 'es-AR': 'Cortes', 'pt-BR': 'Interceptações', 'fr-FR': 'Interceptions' },
    groupLabel: { 'en-GB': 'Defensive', 'es-ES': 'Defensivo', 'es-AR': 'Defensivo', 'pt-BR': 'Defesa', 'fr-FR': 'Défense' },
    flatName: { 'en-GB': 'Passing Lane Trap', 'es-ES': 'Lectura de Pase', 'es-AR': 'Anticipo Seguro', 'pt-BR': 'Corte na Linha de Passe', 'fr-FR': 'Anticipation Coupe-Trajectoire' },
    flatDesc: { 'en-GB': 'Reading the passer’s eyes and stepping cleanly into lanes to spark quick breaks.', 'es-ES': 'Anticipación brillante que lee la intención del rival antes de que suelte el balón.', 'es-AR': 'Lectura de juego para adivinar el pase contrario y salir jugando de contra.', 'pt-BR': 'Leitura rápida da intenção do passador para interceptar e sair em contragolpe.', 'fr-FR': 'Lecture du jeu pour couper la trajectoire avant que la passe n’arrive à destination.' },
    ptsName: { 'en-GB': 'Lane Anticipation Drills', 'es-ES': 'Trabajo de Anticipación', 'es-AR': 'Práctica de Corte', 'pt-BR': 'Treino de Antecipação', 'fr-FR': 'Exercices d’Interception' },
    ptsDesc: { 'en-GB': 'Stat points dedicated to intercepting through-balls and cutoffs.', 'es-ES': 'Puntos de desarrollo para cortar balones filtrados y recuperar la posesión.', 'es-AR': 'Puntos para perfeccionar la anticipación e interceptar pases clave.', 'pt-BR': 'Pontos para melhorar seu instinto de antecipação e roubo de bola.', 'fr-FR': 'Points de progression pour couper les lignes de passe adverses.' },
  },
  positioning: {
    statLabel: { 'en-GB': 'Positioning', 'es-ES': 'Colocación', 'es-AR': 'Posición', 'pt-BR': 'Posicionamento', 'fr-FR': 'Placement' },
    groupLabel: { 'en-GB': 'Mental', 'es-ES': 'Mental', 'es-AR': 'Mental', 'pt-BR': 'Mental', 'fr-FR': 'Mental' },
    flatName: { 'en-GB': 'Tactical Ghost', 'es-ES': 'Fantasma Táctico', 'es-AR': 'Desmarque Inteligente', 'pt-BR': 'Posicionamento Inteligente', 'fr-FR': 'Fantôme Tactique' },
    flatDesc: { 'en-GB': 'Drifting silently into open half-spaces to offer constant passing solutions.', 'es-ES': 'Ubicación inteligente en los espacios libres para recibir sin oposición.', 'es-AR': 'Moverse sin pelota a los huecos vacíos para recibir siempre libre de marca.', 'pt-BR': 'Movimentação silenciosa nos espaços vazios para ser a melhor opção de passe.', 'fr-FR': 'Déplacement malin dans les demi-espaces pour être constamment démarqué.' },
    ptsName: { 'en-GB': 'Spatial Geometry Drills', 'es-ES': 'Lectura de Espacios', 'es-AR': 'Lectura de Cancha', 'pt-BR': 'Ocupação de Espaço', 'fr-FR': 'Géométrie du Placement' },
    ptsDesc: { 'en-GB': 'Stat points dedicated to mastering offensive and defensive spatial positioning.', 'es-ES': 'Puntos de desarrollo para estar siempre en el lugar y momento adecuados.', 'es-AR': 'Puntos para pararte siempre en la zona justa de la cancha.', 'pt-BR': 'Pontos para aprender a se posicionar perfeitamente em campo.', 'fr-FR': 'Points d’évolution pour affiner votre compréhension spatiale du jeu.' },
  },
  composure: {
    statLabel: { 'en-GB': 'Composure', 'es-ES': 'Compostura', 'es-AR': 'Temple', 'pt-BR': 'Compostura', 'fr-FR': 'Sang-Froid' },
    groupLabel: { 'en-GB': 'Mental', 'es-ES': 'Mental', 'es-AR': 'Mental', 'pt-BR': 'Mental', 'fr-FR': 'Mental' },
    flatName: { 'en-GB': 'Cold-Blooded Veins', 'es-ES': 'Sangre Fría', 'es-AR': 'Mente Fría y Temple', 'pt-BR': 'Sangue Frio', 'fr-FR': 'Calme Olympien' },
    flatDesc: { 'en-GB': 'Complete mental tranquility that prevents panic under aggressive pressing.', 'es-ES': 'Serenidad absoluta para decidir con calma en los momentos de mayor tensión.', 'es-AR': 'Tranquilidad total para no apurarte cuando la jugada quema y el rival presiona.', 'pt-BR': 'Tranquilidade mental para tomar a melhor decisão sob pressão infernal.', 'fr-FR': 'Tranquillité absolue permettant de garder les idées claires sous forte pression.' },
    ptsName: { 'en-GB': 'Stress Calibration Reps', 'es-ES': 'Control de Presión', 'es-AR': 'Manejo del Estrés', 'pt-BR': 'Foco Sob Tensão', 'fr-FR': 'Gestion du Stress' },
    ptsDesc: { 'en-GB': 'Stat points invested into making calm, rational choices when surrounded by markers.', 'es-ES': 'Puntos de desarrollo para mantener la cabeza fría en jugadas determinantes.', 'es-AR': 'Puntos para templar los nervios y no desesperarte jamás con la pelota.', 'pt-BR': 'Pontos para fortalecer o psicológico e evitar erros por ansiedade.', 'fr-FR': 'Points d’évolution pour tempérer vos nerfs et décider avec lucidité.' },
  },
  reactions: {
    statLabel: { 'en-GB': 'Reactions', 'es-ES': 'Reacción', 'es-AR': 'Reflejos', 'pt-BR': 'Reação', 'fr-FR': 'Réactivité' },
    groupLabel: { 'en-GB': 'Mental', 'es-ES': 'Mental', 'es-AR': 'Mental', 'pt-BR': 'Mental', 'fr-FR': 'Mental' },
    flatName: { 'en-GB': 'Lightning Trigger', 'es-ES': 'Reacción Relámpago', 'es-AR': 'Reflejo Instantáneo', 'pt-BR': 'Gatilho Elétrico', 'fr-FR': 'Réflexe Éclair' },
    flatDesc: { 'en-GB': 'Instant cognitive response reacting to loose balls and deflection ricochets.', 'es-ES': 'Reacción casi instantánea para ganar balones divididos y rebotes sueltos.', 'es-AR': 'Chispa inmediata para anticipar rebotes y llegar un segundo antes que todos.', 'pt-BR': 'Reflexos rápidos para reagir antes de todo mundo a sobras e rebotes.', 'fr-FR': 'Vitesse de réaction fulgurante sur ballons qui traînent ou contres favorables.' },
    ptsName: { 'en-GB': 'Split-Second Response Drills', 'es-ES': 'Velocidad de Decisión', 'es-AR': 'Práctica de Reflejo', 'pt-BR': 'Tempo de Resposta', 'fr-FR': 'Vitesse d’Exécution' },
    ptsDesc: { 'en-GB': 'Stat points dedicated to sharpening reaction speed and cognitive alertness.', 'es-ES': 'Puntos de desarrollo para acelerar tu tiempo de respuesta ante cualquier rebote.', 'es-AR': 'Puntos para agudizar los reflejos y reaccionar más rápido en jugadas vivas.', 'pt-BR': 'Pontos para afinar os reflexos e antecipar o desfecho das jogadas.', 'fr-FR': 'Points d’évolution pour raccourcir votre temps de réaction en match.' },
  },
};

/**
 * Builds the complete dictionary of translations for all overhauled stat cards:
 * Street Cards, Youth Cards, and Career Cards across all 5 languages.
 */
export function generateOverhauledTranslations(): Record<string, Record<SupportedLangs, CardLocalizedText>> {
  const translations: Record<string, Record<SupportedLangs, CardLocalizedText>> = {};

  const registerEntry = (id: string, entry: Record<SupportedLangs, CardLocalizedText>) => {
    translations[id] = entry;
    // Also support prefix 'card-street-', 'card-youth-', 'card-career-'
    if (!id.startsWith('card-')) {
      translations[`card-street-${id}`] = entry;
      translations[`card-youth-${id}`] = entry;
      translations[`card-career-${id}`] = entry;
    }
  };

  // 1. Single Stat Cards (Flat & Points)
  OUTFIELD_STAT_METADATA.forEach((meta) => {
    const loc = STAT_LOCALIZATIONS[meta.statKey];
    if (!loc) return;

    // Street Flat
    registerEntry(`street-flat-${meta.statKey}`, {
      'en-GB': { name: meta.streetFlatName, description: meta.streetFlatDesc },
      'es-ES': { name: `Calle: ${loc.flatName['es-ES']}`, description: loc.flatDesc['es-ES'] },
      'es-AR': { name: `Potrero: ${loc.flatName['es-AR']}`, description: loc.flatDesc['es-AR'] },
      'pt-BR': { name: `Várzea: ${loc.flatName['pt-BR']}`, description: loc.flatDesc['pt-BR'] },
      'fr-FR': { name: `Bitume: ${loc.flatName['fr-FR']}`, description: loc.flatDesc['fr-FR'] },
    });

    // Street Points
    registerEntry(`street-pts-${meta.statKey}`, {
      'en-GB': { name: meta.streetPointsName, description: meta.streetPointsDesc },
      'es-ES': { name: `Desarrollo: ${loc.ptsName['es-ES']}`, description: loc.ptsDesc['es-ES'] },
      'es-AR': { name: `Entrenamiento: ${loc.ptsName['es-AR']}`, description: loc.ptsDesc['es-AR'] },
      'pt-BR': { name: `Evolução: ${loc.ptsName['pt-BR']}`, description: loc.ptsDesc['pt-BR'] },
      'fr-FR': { name: `Progression: ${loc.ptsName['fr-FR']}`, description: loc.ptsDesc['fr-FR'] },
    });

    // Youth Flat
    registerEntry(`yc-stat-flat-${meta.statKey}`, {
      'en-GB': { name: meta.youthFlatName, description: meta.youthFlatDesc },
      'es-ES': { name: `Academia: ${loc.flatName['es-ES']}`, description: loc.flatDesc['es-ES'] },
      'es-AR': { name: `Inferiores: ${loc.flatName['es-AR']}`, description: loc.flatDesc['es-AR'] },
      'pt-BR': { name: `Base: ${loc.flatName['pt-BR']}`, description: loc.flatDesc['pt-BR'] },
      'fr-FR': { name: `Centre: ${loc.flatName['fr-FR']}`, description: loc.flatDesc['fr-FR'] },
    });

    // Youth Points
    registerEntry(`yc-stat-pts-${meta.statKey}`, {
      'en-GB': { name: meta.youthPointsName, description: meta.youthPointsDesc },
      'es-ES': { name: `Puntos Cantera: ${loc.ptsName['es-ES']}`, description: loc.ptsDesc['es-ES'] },
      'es-AR': { name: `Puntos Inferiores: ${loc.ptsName['es-AR']}`, description: loc.ptsDesc['es-AR'] },
      'pt-BR': { name: `Puntos Base: ${loc.ptsName['pt-BR']}`, description: loc.ptsDesc['pt-BR'] },
      'fr-FR': { name: `Paliers Formation: ${loc.ptsName['fr-FR']}`, description: loc.ptsDesc['fr-FR'] },
    });

    // Career Flat
    registerEntry(`career-stat-flat-${meta.statKey}`, {
      'en-GB': { name: meta.careerFlatName, description: meta.careerFlatDesc },
      'es-ES': { name: `Profesional: ${loc.flatName['es-ES']}`, description: loc.flatDesc['es-ES'] },
      'es-AR': { name: `Primera: ${loc.flatName['es-AR']}`, description: loc.flatDesc['es-AR'] },
      'pt-BR': { name: `Profissional: ${loc.flatName['pt-BR']}`, description: loc.flatDesc['pt-BR'] },
      'fr-FR': { name: `Professionnel: ${loc.flatName['fr-FR']}`, description: loc.flatDesc['fr-FR'] },
    });

    // Career Points
    registerEntry(`career-stat-pts-${meta.statKey}`, {
      'en-GB': { name: meta.careerPointsName, description: meta.careerPointsDesc },
      'es-ES': { name: `Evolución Pro: ${loc.ptsName['es-ES']}`, description: loc.ptsDesc['es-ES'] },
      'es-AR': { name: `Evolución Primera: ${loc.ptsName['es-AR']}`, description: loc.ptsDesc['es-AR'] },
      'pt-BR': { name: `Evolução Profissional: ${loc.ptsName['pt-BR']}`, description: loc.ptsDesc['pt-BR'] },
      'fr-FR': { name: `Perfectionnement Pro: ${loc.ptsName['fr-FR']}`, description: loc.ptsDesc['fr-FR'] },
    });
  });

  // 2. Synergy/Group Cards
  const groupTranslations: Record<string, Record<SupportedLangs, CardLocalizedText>> = {
    phys: {
      'en-GB': { name: 'Athletic Engine Synergy', description: 'Simultaneous athletic progression accelerating Pace, Stamina, and Strength.' },
      'es-ES': { name: 'Sinergia Física y Atlética', description: 'Entrenamiento integral que mejora Ritmo, Resistencia y Fuerza corporal simultáneamente.' },
      'es-AR': { name: 'Combo Físico y Potencia', description: 'Trabajo integral de preparación física para subir Pique, Resistencia y Choque.' },
      'pt-BR': { name: 'Sinergia Atlética Completa', description: 'Aprimoramento físico total acelerando Ritmo, Resistência e Força muscular.' },
      'fr-FR': { name: 'Synergie Athlétique Complète', description: 'Entraînement complet boostant simultanément Vitesse, Endurance et Force.' },
    },
    tech: {
      'en-GB': { name: 'Technical Maestro Synergy', description: 'Combined masterclass developing Ball Control, Retention, and Dribbling.' },
      'es-ES': { name: 'Sinergia de Técnica y Regate', description: 'Perfeccionamiento técnico conjunto de Control de Balón, Retención y Regate.' },
      'es-AR': { name: 'Combo de Habilidad y Gambeta', description: 'Práctica de alta escuela puliendo Control, Aguante de Pelota y Gambeta.' },
      'pt-BR': { name: 'Sinergia de Habilidade e Drible', description: 'Desenvolvimento técnico coordenado de Controle, Proteção e Drible.' },
      'fr-FR': { name: 'Synergie Technique et Dribble', description: 'Masterclass technique développant Contrôle de Balle, Rétention et Dribble.' },
    },
    play: {
      'en-GB': { name: 'Master Playmaker Synergy', description: 'Visionary distribution session upgrading Short Pass, Long Pass, and Crossing.' },
      'es-ES': { name: 'Sinergia de Creación y Pase', description: 'Visión de juego magistral que perfecciona Pase Corto, Pase Largo y Centros.' },
      'es-AR': { name: 'Combo de Armado y Pase', description: 'Visión panorámica para clavar Pases Cortos, Cambios de Frente y Centros.' },
      'pt-BR': { name: 'Sinergia de Armação e Criação', description: 'Visão de jogo para dominar Passes Curtos, Lançamentos e Cruzamentos.' },
      'fr-FR': { name: 'Synergie Création et Passe', description: 'Vision de passe globale perfectionnant Passe Courte, Passe Longue et Centres.' },
    },
    finishing: {
      'en-GB': { name: 'Total Finisher Synergy', description: 'Lethal penalty-box masterclass advancing Shooting, Heading, and Long Shots.' },
      'es-ES': { name: 'Sinergia de Gol y Remate', description: 'Poder goleador absoluto perfeccionando Disparo, Remate de Cabeza y Tiros Lejanos.' },
      'es-AR': { name: 'Combo Goleador Total', description: 'Eficacia letal adentro y afuera del área: Definición, Cabezazo y Bombas.' },
      'pt-BR': { name: 'Sinergia Artilheira Total', description: 'Poder de fogo completo para dominar Chute, Cabeceio e Finalizações de Longe.' },
      'fr-FR': { name: 'Synergie de Finition Totale', description: 'Arsenal offensif complet boostant Finition, Jeu de Tête et Frappes de Loin.' },
    },
    def: {
      'en-GB': { name: 'Wall of Steel Synergy', description: 'Impenetrable defensive coordination advancing Tackling, Marking, and Interceptions.' },
      'es-ES': { name: 'Sinergia Defensiva Total', description: 'Muro defensivo coordinado que mejora Entradas, Marcaje e Intercepciones.' },
      'es-AR': { name: 'Combo Defensivo Férreo', description: 'Firmeza total para ganar Quites, anular con la Marca y Anticipar pases.' },
      'pt-BR': { name: 'Sinergia Defensiva Insuperável', description: 'Parede defensiva aprimorando Desarme, Marcação e Interceptações.' },
      'fr-FR': { name: 'Synergie Défensive Complète', description: 'Mur défensif impénétrable perfectionnant Tacle, Marquage et Interceptions.' },
    },
    mental: {
      'en-GB': { name: 'Tactical Telepathy Synergy', description: 'Elite game understanding elevating Positioning, Composure, and Reactions.' },
      'es-ES': { name: 'Sinergia Mental y Serenidad', description: 'Inteligencia táctica superior que agudiza Colocación, Compostura y Reacción.' },
      'es-AR': { name: 'Combo de Inteligencia y Temple', description: 'Madurez futbolística para ganar Posición, Temple de Acero y Reflejos.' },
      'pt-BR': { name: 'Sinergia Mental e Inteligência', description: 'Leitura tática avançada aprimorando Posicionamento, Frieza e Reações.' },
      'fr-FR': { name: 'Synergie Mentale et Sang-Froid', description: 'Intelligence tactique supérieure boostant Placement, Sang-Froid et Réflexes.' },
    },
  };

  ['street', 'yc', 'career'].forEach((stage) => {
    const stagePrefix = stage === 'street' ? 'street-group-' : stage === 'yc' ? 'yc-group-' : 'career-group-pts-';
    const stageSuffix = stage === 'yc' ? '-points' : '';

    Object.entries(groupTranslations).forEach(([groupKey, trans]) => {
      registerEntry(`${stagePrefix}${groupKey}${stageSuffix}`, trans);
    });
  });

  // 3. Distributable Points
  const distribTranslations: Record<SupportedLangs, CardLocalizedText> = {
    'en-GB': { name: 'Free Development Stat Points', description: 'Unassigned stat points you can freely invest into any attribute of your choice.' },
    'es-ES': { name: 'Puntos de Desarrollo Libres', description: 'Puntos de desarrollo libres que puedes asignar al atributo que prefieras.' },
    'es-AR': { name: 'Puntos de Evolución a Elección', description: 'Puntos libres para invertirlos en el atributo que más quieras potenciar.' },
    'pt-BR': { name: 'Pontos de Desenvolvimento Livres', description: 'Pontos de atributo livres para distribuir em qualquer fundamento que desejar.' },
    'fr-FR': { name: 'Points de Développement Libres', description: 'Points d’attributs libres à allouer selon vos priorités tactiques.' },
  };
  registerEntry('street-distrib-pts', distribTranslations);
  registerEntry('yc-distrib-pts', distribTranslations);
  registerEntry('career-distrib-pts', distribTranslations);

  // 4. Superior Training (Iconic)
  const superiorTranslations: Record<SupportedLangs, CardLocalizedText> = {
    'en-GB': { name: 'Superior Training', description: 'You discovered a revolutionary form of development. Grants +100 Development Stat Points instantly.' },
    'es-ES': { name: 'Entrenamiento Superior', description: 'Descubriste una metodología revolucionaria de preparación. Otorga +100 puntos de desarrollo de inmediato.' },
    'es-AR': { name: 'Entrenamiento Magistral', description: 'Accediste a una fórmula revolucionaria de entrenamiento. Te otorga +100 puntos de evolución al instante.' },
    'pt-BR': { name: 'Treinamento Superior', description: 'Você dominou uma metodologia revolucionária de evolução. Concede +100 pontos de desenvolvimento imediatamente.' },
    'fr-FR': { name: 'Entraînement Supérieur', description: 'Vous avez découvert une méthodologie révolutionnaire. Vous recevez +100 points de développement immédiatement.' },
  };
  registerEntry('yc-superior-training', superiorTranslations);
  registerEntry('career-superior-training', superiorTranslations);

  return translations;
}
