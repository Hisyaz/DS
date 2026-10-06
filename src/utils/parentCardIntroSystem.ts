import { ParentCardRarity, ParentCardTypeId } from '../types/parentCards';

export interface PositionOption {
  id: 'ATT' | 'MID' | 'DEF' | 'GK';
  subPosition: string;
  choiceTitle: string;
  narrativeText: string;
  rewardLabel: string;
  badgeBg: string;
  badgeText: string;
  borderHover: string;
  disabled?: boolean;
  comingSoonText?: string;
}

export const POSITION_CHOICES: PositionOption[] = [
  {
    id: 'ATT',
    subPosition: 'ST',
    choiceTitle: 'Choice 1: Lead the Attack',
    narrativeText:
      'You decide that the best way to change the game is by being the player closest to the goal, the one who takes responsibility for creating and finishing attacks.',
    rewardLabel: 'Attacker (ATT)',
    badgeBg: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
    badgeText: 'ATT',
    borderHover: 'hover:border-rose-500 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]',
  },
  {
    id: 'MID',
    subPosition: 'CM',
    choiceTitle: 'Choice 2: Control the Game',
    narrativeText:
      'You realize your greatest strength is controlling the rhythm of the game, creating opportunities, and connecting every part of the team.',
    rewardLabel: 'Midfielder (MID)',
    badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    badgeText: 'MID',
    borderHover: 'hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]',
  },
  {
    id: 'DEF',
    subPosition: 'CB',
    choiceTitle: 'Choice 3: Build the Foundation',
    narrativeText:
      'You choose to become the foundation of the team, stopping opponents and protecting your teammates when they need you most.',
    rewardLabel: 'Defender (DEF)',
    badgeBg: 'bg-sky-500/20 border-sky-500/40 text-sky-300',
    badgeText: 'DEF',
    borderHover: 'hover:border-sky-500 hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]',
  },
  {
    id: 'GK',
    subPosition: 'GK',
    choiceTitle: 'Choice 4: Protect the Goal',
    narrativeText:
      'Goalkeeper career path and specialized shot-stopper mechanics are currently under active development and will be released in an upcoming update.',
    rewardLabel: 'Goalkeeper (GK) • Coming Soon',
    badgeBg: 'bg-slate-800/80 border-slate-700/60 text-slate-400',
    badgeText: 'GK',
    borderHover: 'border-slate-800',
    disabled: true,
    comingSoonText: 'Coming Soon',
  },
];

// ==========================================
// ELABORATED NORMAL CHILDHOOD INTRO STORIES
// ==========================================
export const NORMAL_INTRO_STORIES: Record<
  ParentCardTypeId,
  Record<ParentCardRarity, Record<'en' | 'es', string>>
> = {
  ex_pro_player: {
    bronze: {
      en: 'Born into a modest football household where your parent competed across hard-fought lower-tier divisions, your earliest memories are smelling damp grass, listening to post-match locker room banter, and kicking taped-up balls against garden brick walls. Though their professional career was humble, your parent passed down timeless fundamentals—soft first touches, body orientation, and an unshakeable blue-collar work ethic that shaped your character before your 10th birthday.',
      es: 'Nacido en un humilde hogar futbolero donde tu progenitor batalló en duras divisiones de ascenso, tus primeros recuerdos son el inconfundible olor a pasto mojado, las charlas de vestuario y patear contra los ladrillos del patio. Aunque su carrera fue modesta, te transmitió fundamentos eternos: control orientado, visión de juego y una ética de trabajo intachable antes de cumplir 10 años.',
    },
    silver: {
      en: 'Growing up as the child of a respected regional professional, stadium lights, team bus journeys, and tactical whiteboards formed the backdrop of your daily childhood. Your parent spent countless weekend afternoons drilling you to strike the ball with both feet with pinpoint accuracy. By age 10, your tactical maturity, positional instincts, and effortless technical poise turned heads across every local youth tournament.',
      es: 'Creciendo como hijo de un respetado profesional regional, las luces de los estadios, los viajes en micro y las pizarras tácticas formaron parte de tu rutina diaria. Tu viejo pasó incontables tardes enseñándote a pegarle con ambas piernas con idéntica precisión. A los 10 años, tu lectura de juego, ubicación en la cancha y serenidad técnica asombraban en cada torneo infantil.',
    },
    gold: {
      en: 'Your parent enjoyed a celebrated top-flight professional career, granting you backstage access to elite training grounds, masterclass dressing rooms, and advice from seasoned internationals from early infancy. Through intensive, structured home training and video review, they sculpted your game awareness and technique into that of an elite youth prodigy, fully prepared for premier academy football by age 10.',
      es: 'Tu progenitor disfrutó de una carrera consagrada en primera división, abriéndote las puertas de los centros de alto rendimiento y vestuarios de élite desde la cuna. Con entrenamientos metódicos en casa y análisis de video, pulió tu técnica y comprensión del juego, formándote como un auténtico pibe prodigio listo para academias de primer nivel a los 10 años.',
    },
    legendary: {
      en: 'Born to a legendary international icon, football excellence was woven into your very DNA. Surrounded by glittering trophy cabinets, historic match jerseys, and massive public expectations, your parent oversaw a bespoke, world-class athletic regimen from your earliest steps. At age 10, your composure under heavy pressing and surgical passing rivaled that of seasoned teenage prospects.',
      es: 'Hijo de una leyenda indiscutida del fútbol mundial, la excelencia corre por tus venas. Rodeado de vitrinas repletas de trofeos y camisetas históricas, tu progenitor diseñó un plan de alto rendimiento exclusivo desde tus primeros pasos. A los 10 años, tu frialdad bajo presión extrema y tu precisión milimétrica rivalizaban con juveniles de elite.',
    },
    iconic: {
      en: 'Raised by an immortal titan of world football, your childhood was a divine masterclass in sporting perfection. Every first touch, off-the-ball sprint, and mental habit was sculpted by the greatest tactical mind you could ever meet. Stepping onto the pitch at age 10, you carry the poise of a future Ballon d’Or winner, destined to continue an exalted football dynasty.',
      es: 'Criado por un titán inmortal del fútbol mundial, tu infancia fue una verdadera cátedra de perfección deportiva. Cada control orientado, desmarque y fortaleza mental fueron forjados por la mente más brillante del fútbol. Al pisar el césped a los 10 años, mostrás la presencia de un futuro Balón de Oro, destinado a continuar una dinastía sagrada.',
    },
  },
  average_family: {
    bronze: {
      en: "In a quiet, loving, working-class home, your parents knew little about complex tactical systems or pressing schemes, but they were the loudest, proudest voices on the park touchline every Saturday morning. Their thermos of warm tea, home-cooked dinners, and unconditional hugs provided a joyful, emotionally secure sanctuary as you approached your 10th birthday.",
      es: 'En un hogar humilde, laburante y lleno de afecto, tus viejos no entendían nada de esquemas tácticos ni presiones altas, pero eran los que más fuerte gritaban tus goles al costado de la cancha cada sábado. El termo de mate caliente, las comidas caseras y los abrazos incondicionales te dieron una infancia feliz, equilibrada y llena de paz rumbo a los 10 años.',
    },
    silver: {
      en: 'Your parents stood vigilantly on soggy sidelines through freezing downpours and biting winds, always waiting with a dry towel and a warm embrace regardless of the final score. Their gentle wisdom and unwavering emotional support taught you to remain composed when games turned chaotic, forging a rock-solid mental anchor by age 10.',
      es: 'Tus padres te bancaron en canchas de tierra y bajo lluvias heladas, siempre firmes con una campera seca y un abrazo sincero sin importar el resultado. Su apoyo incondicional y ternura te enseñaron a no desesperar en los momentos difíciles, forjando un temple sereno y una cabeza fría y madura a los 10 años.',
    },
    gold: {
      en: 'Growing up in a deeply united household that organized raffles and sacrificed hard-earned savings just to afford your leather boots and tournament travel, you learned the immense value of family sacrifice. That bottomless well of genuine love endowed you with fierce gratitude, quiet humility, and remarkable mental fortitude at age 10.',
      es: 'Creciendo en una familia unida que hizo rifas y juntó peso por peso para comprarte los mejores botines y costear viajes a torneos lejanos, aprendiste el valor sagrado del sacrificio. Ese amor gigante te llenó de humildad, gratitud y un corazón gigante para dejar la vida en cada pelota a los 10 años.',
    },
    legendary: {
      en: 'Your family home was a tranquil fortress of unconditional love, resilience, and quiet dignity. While youth football around you grew increasingly ruthless, your parents provided an impenetrable sanctuary of emotional balance, nurturing an extraordinary inner peace and limitless self-belief as you turned age 10.',
      es: 'Tu hogar fue un templo de tranquilidad, humildad y amor incondicional. Mientras el ambiente del fútbol infantil se volvía cada vez más feroz, tus viejos te brindaron una paz emocional inexpugnable, cultivando una serenidad de acero y una fe ciega en tu propio juego a los 10 años.',
    },
    iconic: {
      en: 'The golden standard of parental devotion and emotional wisdom. Your parents nurtured your heart and soul with absolute trust, freeing you from anxiety and instilling a transcendent, world-class mental composure that leaves seasoned coaches in awe whenever you touch the ball at age 10.',
      es: 'El estándar de oro del amor familiar y la sabiduría emocional. Tus padres cuidaron tu cabeza y tu corazón con una confianza infinita, liberándote de miedos y transmitiéndote una templanza serena de crack mundial que impresiona a cualquier entrenador a los 10 años.',
    },
  },
  helicopter_parents: {
    bronze: {
      en: 'Your parents monitored every detail of your daily childhood schedule with a digital stopwatch—mandatory wall-passing drills at dawn, strictly weighed protein portions, and zero missed practices. Their relentless micro-discipline ensured your physical stamina, agility, and fundamental habits were years ahead of the competition by age 10.',
      es: 'Tus viejos controlaban cada detalle de tu rutina infantil con cronómetro en mano: pases contra la pared al amanecer, porciones de comida pesadas al gramo y cero faltas a entrenar. Esa estricta disciplina aseguró que tu ritmo físico, resistencia y reflejos estuvieran años luz por delante de tus rivales a los 10 años.',
    },
    silver: {
      en: 'Every evening in your home was meticulously structured around agility ladders, core stability circuits, and post-match tactical video reviews alongside your parents. Their uncompromising standard instilled an unbreakable daily work ethic and premier professional recovery habits before your 10th birthday.',
      es: 'Todas las noches en tu casa estaban organizadas con circuitos de conos, elongación estricta y análisis de video de tus partidos junto a tus padres. Su altísima exigencia te grabó a fuego una disciplina de trabajo y hábitos de recuperación profesionales antes de cumplir los 10 años.',
    },
    gold: {
      en: 'Your parents treated your football development like an elite aerospace project—bespoke nutritionists, dawn interval sprints, and rigorous performance scorecards after every game. This relentless domestic crucible transformed you into an ultra-conditioned, hyper-focused athletic phenomenon at age 10.',
      es: 'Tus viejos trataron tu desarrollo futbolístico como una ciencia exacta: nutricionistas personalizados, pasadas de velocidad al alba y planillas de rendimiento tras cada partido. Esta intensa exigencia familiar te moldeó como un atleta de élite hiperconcentrado a los 10 años.',
    },
    legendary: {
      en: 'Immersed in an uncompromising high-performance blueprint since your toddler years, your parents engineered your lifestyle with biomechanical precision. This scientific approach forged a tireless cardiovascular engine, lightning reflexes, and enormous athletic potential as you stepped onto the pitch at age 10.',
      es: 'Metido en un plan de alto rendimiento implacable desde que aprendiste a caminar, tus padres diseñaron tu estilo de vida con precisión biomédica. Este método científico forjó una resistencia física inagotable, reflejos felinos y un potencial atlético monumental a los 10 años.',
    },
    iconic: {
      en: 'An extraordinary, masterfully calculated athletic upbringing where every calorie, minute of sleep, and repetition was engineered for absolute pitch dominance. Your parents sculpted an unstoppable athletic marvel endowed with supreme physiological resilience and boundless potential by age 10.',
      es: 'Una formación calculada al milímetro para el dominio deportivo absoluto, donde cada caloría, hora de sueño y ejercicio fueron calibrados a la perfección. Tus padres esculpieron un animal competitivo imparable con vigor físico de élite y un techo ilimitado a los 10 años.',
    },
  },
  immigrant_family: {
    bronze: {
      en: 'Relocating to an unfamiliar country during your early childhood, cultural differences and foreign dialects felt daunting, but the neighborhood concrete football cage became your passport. Dodging older street players and adapting to rough asphalt games taught you quick reflexes and rapid adaptability by age 10.',
      es: 'Al mudarte a un país nuevo de muy chico, el idioma y las costumbres eran un desafío, pero la canchita de cemento del barrio fue tu pasaporte universal. Eludir a chicos más grandes en el asfalto te enseñó a pensar rápido, aguantar la pelota y adaptarte al instante antes de los 10 años.',
    },
    silver: {
      en: "Watching your immigrant parents work grueling graveyard shifts in a foreign land ignited an insatiable fire in your chest. Football was your family's beacon of hope, and your parents' selfless sacrifices endowed you with relentless cardiovascular stamina and an unyielding will to succeed by age 10.",
      es: 'Ver a tus viejos romperse el alma en turnos de madrugada en una tierra desconocida encendió un fuego sagrado en tu pecho. El fútbol fue la bandera de esperanza familiar, y su sacrificio te otorgó un motor inagotable, garra pura y una determinación feroz a los 10 años.',
    },
    gold: {
      en: 'Raised in a vibrant multicultural home overcoming societal hurdles, you developed profound mental toughness and cross-cultural charisma. Carrying the pride, music, and traditions of your ancestral roots gave you a fearless swagger and instant camaraderie with teammates at age 10.',
      es: 'Criado en un hogar multicultural que la peleó desde abajo contra viento y marea, forjaste una personalidad brava y un carisma especial. Llevar con orgullo las raíces de tu gente te dio una soltura bárbara, coraje en la cancha y química inmediata con cualquier grupo a los 10 años.',
    },
    legendary: {
      en: "Your family's courageous odyssey across international borders proved to you that no obstacle in life is insurmountable. Embodying the rich footballing heritage of multiple nations, your outsider hunger granted you bottomless stamina and natural locker room leadership by age 10.",
      es: 'La odisea valiente de tu familia cruzando fronteras te enseñó que ninguna barrera es eterna. Llevando en la sangre la riqueza futbolera de dos mundos, tu hambre de gloria te dio un aire incansable y un liderazgo natural respetado en cualquier vestuario a los 10 años.',
    },
    iconic: {
      en: "A magnificent global saga of sacrifice, ancestral identity, and supreme adaptability. Drawing strength from your family's epic international journey, you emerged as a captivating, world-class prodigy blessed with endless lungs, magnetic charisma, and fearless composure at age 10.",
      es: 'Una epopeya emocionante de superación, orgullo e identidad internacional. Inspirado en el épico viaje de tu gente, te convertiste en un talento carismático de clase mundial, con pulmones inagotables, personalidad magnética y sangre fría a los 10 años.',
    },
  },
  raised_in_ghetto: {
    bronze: {
      en: 'Growing up on cracked asphalt cages and dirt potreros, football was your daily ticket to survival and freedom. Battling against aggressive older teenagers under flickering streetlights taught you to protect the ball with your life, use your elbows smartly, and stay razor-sharp at every second by age 10.',
      es: 'Creciendo en los potreros de tierra y canchitas de asfalto del barrio, la pelota era tu escape de todos los días. Jugar con los más grandes bajo faroles rotos te enseñó a poner el cuerpo, cubrir el balón con la vida y estar siempre despierto antes de los 10 años.',
    },
    silver: {
      en: 'Street pick-up games in your neighborhood were fast, brutal, and pride-driven. Evading reckless sliding tackles on unforgiving concrete honed your explosive first step, balance, and street-smart cunning, giving you the heart of a true street fighter by age 10.',
      es: 'Los picados en el barrio eran picantes, ásperos y por el honor. Eludir patadas en el cemento pelado afinó tu cintura, tus reflejos felinos y tu picardía callejera, forjando un corazón guerrero que no le teme a nada a los 10 años.',
    },
    gold: {
      en: 'Tempered in the high-stakes furnace of fenced urban cages, you learned to play your best under hostile crowds and heavy intimidation. The raw adversity of your environment instilled dazzling dribbling flair, fearsome physical toughness, and clutch composure under pressure by age 10.',
      es: 'Forjado en la caldera de los torneos clandestinos y las jaulas del barrio, aprendiste a jugar con el público en contra y sin temblar. La dureza de la calle te dio una gambeta endemoniada, potencia física para bancar el choque y una frialdad bárbara a los 10 años.',
    },
    legendary: {
      en: "Football was your escape route from poverty and your sacred weapon on the streets. Gritty wagers and high-stakes matches against adult neighborhood legends endowed you with ferocious physical power, supersonic dribbling instincts, and zero fear of any stage at age 10.",
      es: 'El fútbol fue tu pasaporte hacia la gloria y tu escudo protector en la calle. Jugar picados por plata contra hombres hechos y derechos te dio un lomo de acero, una gambeta indescifrable y cero respeto por las camisetas pesadas a los 10 años.',
    },
    iconic: {
      en: 'An immortal king of the asphalt born from pure adversity and football magic. Rising from broken glass and concrete with the ball seemingly glued to your boots, you enter age 10 radiating the invincible swagger of a legendary street monarch.',
      es: 'Un rey auténtico del potrero nacido de la pura adversidad y la magia de la pelota. Surgido del asfalto con el balón pegado a la suela y una explosión física descomunal, llegás a los 10 años con aura de crack intocable.',
    },
  },
  rich_parents: {
    bronze: {
      en: 'Growing up in an affluent, comfortable home, your parents enrolled you in elite weekend academies and ensured you always sported the newest branded boots and specialized training gear, granting you a smooth, stress-free technical foundation as you reached age 10.',
      es: 'Creciendo en un hogar acomodado y con todas las facilidades, tus viejos te anotaron en escuelas de fútbol privadas y nunca te faltaron botines de estreno ni indumentaria de primera línea, dándote una base técnica cómoda y cuidada a los 10 años.',
    },
    silver: {
      en: 'With private manicured turf facilities in your garden and high-profile private skills trainers on monthly retainer, your family spared no expense. This premier domestic investment gave you silky ball control, sharp tactical understanding, and early business poise by age 10.',
      es: 'Con canchas privadas de césped impecable y preparadores personales contratados mes a mes, tu familia invirtió fuerte en tu juego. Esta preparación de elite te brindó un control de pelota refinado, entendimiento táctico y visión comercial a los 10 años.',
    },
    gold: {
      en: 'Surrounded by significant wealth, elite European academies, and top-tier sports consultants, your family backed your athletic journey with €4,000,000 in starting capital and a commercial venture, opening every gilded door in professional football by age 10.',
      es: 'Rodeado de alto poder adquisitivo, las mejores academias del continente y asesores deportivos top, tu familia bancó tu sueño con 4.000.000 € de capital inicial y negocios comerciales, abriéndote todas las puertas de la élite a los 10 años.',
    },
    legendary: {
      en: 'Raised in luxury with state-of-the-art private training complexes, personal video analysts, and dedicated physiotherapists, your family constructed an international commercial empire around your career, guaranteeing total financial freedom and premier facilities by age 10.',
      es: 'Criado entre lujos con centros de alto rendimiento privados, analistas de video y kinesiólogos exclusivos, tu familia levantó una estructura comercial internacional alrededor de tu carrera, con respaldo económico absoluto a los 10 años.',
    },
    iconic: {
      en: 'Born into dynastic wealth and elite global sporting connections, your childhood was backed by venture funds, world-class athletic laboratories, and limitless private infrastructure, launching your football journey with unprecedented privilege and supremacy at age 10.',
      es: 'Nacido en una dinastía de alta sociedad y conexiones deportivas mundiales, tu infancia contó con fondos corporativos, laboratorios atléticos de vanguardia e infraestructura ilimitada, iniciando tu carrera con privilegios únicos a los 10 años.',
    },
  },
  iconic_parent: {
    bronze: {
      en: 'Guided by a wise football lineage and an iconic footballing figure in your household, your early training combined timeless fundamentals with patient mentorship. Their profound understanding of the game provided you with a composed, mature footballing intellect by age 10.',
      es: 'Guiado por una figura icónica del fútbol en tu propia casa, tus primeros entrenamientos combinaron técnica depurada y consejos de oro. Su profundo entendimiento del juego te otorgó una madurez y claridad futbolística envidiable a los 10 años.',
    },
    silver: {
      en: 'Living under the tutelage of an iconic parent who conquered the sport’s most demanding stages, your daily conversations revolved around spatial awareness, reading opposing body language, and mastering the tempo of matches. By age 10, your elegance and decision-making looked years ahead of your peers.',
      es: 'Bajo la tutela de una figura legendaria que brilló en las canchas más exigentes del mundo, tus charlas cotidianas giraban en torno a los espacios libres, los perfiles y el ritmo del partido. A los 10 años, tu elegancia y toma de decisiones parecían de un profesional.',
    },
    gold: {
      en: 'Born into the sacred royalty of the beautiful game, your iconic parent surrounded you with world champions, master tacticians, and the serene aura of a champion. Absorbing elite technical secrets like second nature, you emerged as a generational wunderkind by age 10.',
      es: 'Hijo de la realeza sagrada de la pelota, tu progenitor te rodeó de campeones mundiales, estrategas de primer orden y la tranquilidad propia de los elegidos. Asimilando secretos técnicos como algo natural, te convertiste en un wunderkind generacional a los 10 años.',
    },
    legendary: {
      en: 'A magnificent alignment of football genius and parental devotion. Your iconic parent gifted you with the sacred mental composure of continental champions and breathtaking technical finesse, forging an unstoppable, battle-ready phenom by age 10.',
      es: 'Una alianza mágica de jerarquía futbolera y devoción familiar. Tu progenitor legendario te transmitió la templanza sagrada de los campeones y una finura técnica que no se compra con nada, creando un fenómeno imparable a los 10 años.',
    },
    iconic: {
      en: 'The ultimate football destiny. Guided by masters who stood at the absolute pinnacle of world football, every touch, instinct, and heartbeat from infancy was sculpted for global dominance. You step onto the pitch at age 10 carrying the unmistakable aura of an immortal in the making.',
      es: 'El destino futbolístico supremo. Guiado por quienes conquistaron la cima absoluta del fútbol mundial, cada toque, amague y latido desde la cuna fueron esculpidos para reinar. Pisás la cancha a los 10 años con el aura inconfundible de un futuro inmortal.',
    },
  },
};

// =========================================================================
// SPECIAL WASTED TALENT INTRO STORIES (INSANE TALENT + TERRIBLE ATTITUDE)
// =========================================================================
export const WASTED_TALENT_INTRO_STORIES: Record<
  ParentCardTypeId,
  Record<ParentCardRarity, Record<'en' | 'es', string>>
> = {
  ex_pro_player: {
    bronze: {
      en: 'Your ex-pro parent recognized immediately that you possessed tenfold the natural talent they ever had—celestial ball control and an intuitive curve that left local coaches speechless. But their blood ran cold watching your terrible attitude: you mocked defensive drills, hurled water bottles when substituted, and punched an opposing defender who dared tackle you hard. At age 10, your genius is undeniable, but your fiery temper has already earned you multiple red cards and a notorious local reputation.',
      es: 'Tu viejo exjugador vio al toque que tenías diez veces más talento natural del que él jamás soñó: la pelota pegada a la suela y una pegada con rosca que dejaba mudos a los profes. Pero se quería morir con tu conducta: te reías de los ejercicios defensivos, pateabas botellas al salir del cambio y le metiste una piña a un rival que te fue a trabar fuerte. A los 10 años sos un crack descomunal, pero tu calentura ya te costó rojas directas y fama de problemático.',
    },
    silver: {
      en: 'Having played regionally, your parent understood tactics inside out, but you treated coaching advice like a personal insult. You could pick out the top corner from 30 yards with your eyes closed, yet you spent halftimes screaming at your own teammates and storming off the pitch in anger. Your parent was forced to apologize to tournament directors after you threw your shin guards at a referee. An otherworldly natural talent, chained to an explosive, untamable ego.',
      es: 'Con su pasado en el ascenso regional, tu viejo sabía bocha de táctica, pero vos te tomabas cada indicación como una ofensa. Clavabas la pelota en el ángulo desde 30 metros casi sin mirar, pero te pasabas los entretiempos puteando a tus propios compañeros y yéndote caliente al vestuario. Tu viejo tuvo que pedirle perdón de rodillas a los organizadores después de que le tiraste las canilleras al árbitro. Un talento de otra galaxia con una cabeza inmanejable.',
    },
    gold: {
      en: 'Your parent was a celebrated first-division star, but you turned their respected name into a circus of youth football controversy. Scouts traveled across the nation to witness your breathtaking, physics-defying dribbles—only to watch you collect straight red cards for childish headbutts and curse out match officials. Your parent pleaded with you to show humility, but you simply sneered, confident that your terrifying generational magic made you completely untouchable.',
      es: 'Tu viejo brilló en primera división, pero vos convertiste su apellido en un polvorín de escándalos infantiles. Llegaban ojeadores de todo el país a ver tus gambetas imposibles y tus golazos, y terminaban viendo cómo te echaban con roja directa por meterle un cabezazo a un rival o insultar a la terna arbitral. Tu viejo te suplicaba humildad, pero vos te reías en la cara de todos, sabiendo que tu magia descomunal te hacía prácticamente intocable.',
    },
    legendary: {
      en: 'Born to a legendary international icon, your god-given technique dwarfed even your parent’s prime. You danced past entire youth teams as if they were statues. Yet you weaponized that brilliance with utter contempt: skipping morning sessions, mocking the manager’s tactics, and starting fistfights in the tunnel. Your legendary parent watched in agony as scouts reached the exact same conclusion: the most gifted kid on the continent, and the biggest disciplinary nightmare.',
      es: 'Hijo de una gloria legendaria, tu magia innata superaba incluso la de tu viejo en su mejor época. Pasabas a equipos enteros como si fueran conos de entrenamiento. Pero usabas esa genialidad con soberbia pura: faltabas a entrenar, te burlabas del planteo del técnico y te agarrabas a piñas en el túnel. Tu viejo miraba con dolor cómo los cazatalentos decían lo mismo: el pibe con más condiciones del continente, pero un peligro andante para cualquier vestuario.',
    },
    iconic: {
      en: 'The child of an immortal titan, blessed with celestial football gifts that emerge once every half-century. With a nonchalant flick, you could humiliate veteran defenders. But you carried a poisonous, uncontrollable rage—furious at living in your parent’s shadow, you purposely provoked referees, spat at opponents, and collected match suspensions like trophies. At age 10, you are a breathtaking enigma: a divine prodigy whose toxic defiance threatens to burn down your own destiny.',
      es: 'Hijo de un titán inmortal, tocado por la varita con un talento que aparece una vez cada cincuenta años. De espaldas y con un taco humillabas a jugadores más grandes. Pero llevabas adentro una furia volcánica: podrido de que te comparen con tu viejo, provocabas a los árbitros, escupías rivales y coleccionabas suspensiones como si fueran medallas. A los 10 años sos un enigma fascinante: un prodigio celestial con una bomba de tiempo en la cabeza.',
    },
  },
  average_family: {
    bronze: {
      en: 'In a quiet, hardworking household, your parents knew nothing about football tactics, but were utterly bewildered by what you could do with a ball. Spectators crowded around park pitches just to watch you pull off impossible tricks. Yet peaceful family dinners were constantly shattered by angry phone calls from youth coordinators—reporting screaming matches, broken equipment, and straight red cards. Your loving parents plead with you to behave, terrified by your wild, uncontrollable temper.',
      es: 'En una casa tranquila y laburante, tus viejos no cazaban una de fútbol, pero quedaban pasmados con lo que hacías con la pelota. La gente se amontonaba en la plaza para verte tirar caños y rabonas. Pero la paz de la cena familiar se cortaba siempre con llamados de profes indignados: insultos al juez, banderines rotos y rojas directas. Tus viejos te ruegan entre lágrimas que te calmes, asustados por tu temperamento incontrolable.',
    },
    silver: {
      en: 'Your parents stood on muddy sidelines with hot thermoses, watching you do things on the pitch that felt like witchcraft. But while other kids celebrated goals with teammates, you were busy mocking opposing goalkeepers, taunting parents in the crowd, and getting into shoving matches. After every match, your parents had to shield you from furious crowds. They love you unconditionally, but fear your arrogance will destroy your miraculous gift before you turn pro.',
      es: 'Tus viejos se bancaban el frío en la orilla de la cancha, viendo cómo hacías magia negra con la pelota. Pero mientras los demás festejaban en equipo, vos te burlabas del arquero rival, le hacías gestos a la tribuna y terminabas a los empujones. Tras cada partido tus viejos tenían que cubrirte de la bronca de los rivales. Te aman con locura, pero tienen terror de que tu soberbia e indisciplina arruinen tu don milagroso.',
    },
    gold: {
      en: 'Your parents sacrificed hard-earned savings to buy your boots, only for you to throw them into the dressing room trash after a screaming match with your coach. You possessed breathtaking brilliance—scoring hat-tricks in five minutes—yet you walked off mid-match when a teammate didn’t pass you the ball. Your parents carry the heavy burden of endless disciplinary hearings, desperate for their brilliant problem child to find self-control before it is too late.',
      es: 'Tus viejos se rompieron el lomo para comprarte los botines, y vos los tiraste al tacho del vestuario tras una discusión a los gritos con el DT. Tenías una zurda/diestra bendecida—clavabas tres goles en cinco minutos—pero te ibas de la cancha enojado si un compañero no te la daba redonda. Tus viejos viven peregrinando por comisiones de disciplina, rezando para que su pibe superdotado no arruine su vida por calentón.',
    },
    legendary: {
      en: 'A humble, peaceful family that became the unwilling custodians of a volatile football hurricane. On the pitch, your supernatural vision and sublime touch made you look like a visitor from the future. Off the pitch, you were completely unmanageable: suspended from two junior leagues for referee intimidation and school brawls. Your parents offer boundless warmth, but your reckless defiance makes you a ticking powder keg at age 10.',
      es: 'Una familia humilde y de buen corazón que se encontró cuidando a un auténtico huracán. En la cancha, tu visión sobrenatural y tu toque de terciopelo parecían de otra dimensión. Afuera, eras inmanejable: suspendido en dos ligas infantiles por amenazar árbitros y pelearte en el colegio. Tus viejos te dan todo su amor, pero tu rebeldía te convierte en un barril de pólvora a los 10 años.',
    },
    iconic: {
      en: 'Your humble parents gave you unconditional love and quiet sanctuary, yet you grew up as an untamable, volcanic prodigy. You could juggle through an entire defense with nonchalant arrogance, but you possessed zero respect for rules or authority. Having already accumulated four straight red cards and an infamous reputation before your 10th birthday, you are a celestial wunderkind with the soul of a football outlaw.',
      es: 'Tus viejos te criaron con amor y paciencia infinita, pero naciste con alma de bandido y pies de artista. Hacías jueguitos esquivando a tres rivales con un desprecio total, pero no respetabas ni al técnico ni al reglamento. Acumulando cuatro rojas directas y una fama brava en toda la región antes de los 10 años, sos un genio celestial con la conducta de un forajido.',
    },
  },
  helicopter_parents: {
    bronze: {
      en: 'Your parents tried to run your daily life with military precision—wall passes at 7 AM, balanced diets, and strict bedtimes. In response, you rebelled violently, deliberately blasting balls through garage windows and mocking your father’s stopwatch. Yet when you stepped onto a pitch, you dismantled opposing teams with effortless genius without breaking a sweat. Your parents are locked in an exhausting war of wills against a gifted delinquent.',
      es: 'Tus viejos quisieron manejarte como a un soldado: pases a la pared a las 7 AM, comidas medidas y cama temprano. Vos les respondiste con rebeldía pura: reventando vidrios del garaje de un bombazo y burlándote del cronómetro de tu papá. Pero entrabas a la cancha y bailabas a los contrarios sin transpirar. Tus viejos viven en una guerra desgastante contra un superdotado rebelde sin causa.',
    },
    silver: {
      en: 'Every attempt by your parents to enforce agility grids and video analysis was met with sarcastic laughter and open defiance. You refused to stretch, ate junk food out of spite, yet regularly scored overhead kicks and nutmegged three defenders in a row. Your parents hired sports psychologists to curb your fiery temper after multiple red card dismissals, but you simply laughed in their faces. You are a natural-born maverick.',
      es: 'Cada intento de tus viejos por meterte conos de agilidad y análisis táctico terminó en risas burlonas y desobediencia total. Te negabas a elongar, comías chatarra por pura provocación, pero clavabas chilenas y tirabas tres caños seguidos como si nada. Pusieron psicólogos deportivos para frenar tus rojas y trompadas, pero te les reíste en la cara. Sos un rebelde indomable.',
    },
    gold: {
      en: 'Your parents engineered an elite high-performance masterplan, but you tore up the schedule and set fire to their expectations. You possessed transcendent, effortless brilliance—you never needed to train to be the best player on the pitch. But your explosive temper resulted in shouting matches with academy coaches, locker room vandalism, and instant suspensions. Your parents’ rigid control only fueled your reckless, rebellious fire at age 10.',
      es: 'Tus viejos diseñaron un plan de alto rendimiento perfecto, y vos les prendiste fuego las planillas. Tenías un talento sobrenatural tan zarpado que no necesitabas entrenar para ser el mejor de la cancha. Pero tu mecha corta desató peleas con técnicos, destrozos en vestuarios y sanciones inmediatas. La obsesión de tus viejos solo le tiró nafta a tu fuego rebelde a los 10 años.',
    },
    legendary: {
      en: 'Years of calculated athletic conditioning collided head-on with a completely feral, unmanageable ego. Your touch was celestial and your vision surgical, but you treated referees like enemies and teammates like servants. After your third match suspension for headbutting an opponent who dared tackle you hard, your parents realized their scientific regimen could never tame your terrifying, volatile temperament.',
      es: 'Años de preparación atlética científica chocaron de frente contra un ego salvaje y destructivo. Tu pegada era un guante y tu panorama letal, pero tratabas a los árbitros como enemigos y a tus compañeros con desprecio. Tras tu tercera suspensión por meterle un cabezazo a un rival que te raspó, tus viejos entendieron que ninguna ciencia puede domar a un monstruo desquiciado.',
    },
    iconic: {
      en: 'An all-out war between an obsessive parental empire and an untouchable, arrogant genius. Your parents invested fortunes to construct an athletic machine, but you turned into a magnificent monster who scores screamers, gets sent off for inciting riots, and refuses to apologize. You enter age 10 with god-tier technical stats and the worst disciplinary reputation in youth football.',
      es: 'Una guerra total entre una estructura familiar obsesiva y un crack intocable y soberbio. Tus viejos gastaron fortunas para armar una máquina perfecta, pero criaron a un monstruo genial que la clava al ángulo, se va expulsado por incitar a la violencia y no le pide perdón a nadie. Llegás a los 10 años con calidad de Dios y el peor prontuario disciplinario del fútbol infantil.',
    },
  },
  immigrant_family: {
    bronze: {
      en: 'Your parents crossed borders and worked grueling hours hoping for a peaceful future, but your explosive temper brought chaos to your new neighborhood. On concrete cages, your breathtaking flair left older kids dizzy, but you had a hair-trigger fury: any hard foul resulted in a flying punch. Your parents spent their rare days off pleading with tournament directors not to ban their prodigiously gifted, wildly uncontrollable child.',
      es: 'Tus viejos cruzaron fronteras y laburaron mil horas buscando un futuro en paz, pero tu mecha corta llenó de quilombos al barrio nuevo. En las canchas de cemento bailabas a los más grandes con tu magia, pero no aguantabas una: a la primera patada tirabas una piña voladora. Tus viejos pasaban sus pocos francos rogándole a los delegados que no suspendan a su pibe de oro incontrolable.',
    },
    silver: {
      en: 'Watching your parents sacrifice everything in a foreign country should have humbled you, but your immense football talent made you arrogant. You were the undisputed wizard of the neighborhood courts, pulling off moves nobody had ever seen. Yet when coaches benched you for arriving late, you insulted them in three languages and kicked down the dugout. A breathtaking talent whose volatile defiance keeps your family on edge.',
      es: 'Ver a tus viejos romperse el alma en tierra extraña debió darte humildad, pero tu talento gigante te volvió agrandado. Eras el mago absoluto de las canchitas, tirando lujos que nadie había visto jamás. Pero cuando el profe te mandó al banco por llegar tarde, lo puteaste en tres idiomas y pateaste el banco de suplentes. Un crack descomunal que vive caminando por la cornisa.',
    },
    gold: {
      en: 'Raised in a gritty immigrant enclave, your otherworldly ball manipulation was whispered about across the entire city. But you refused to play by the host country’s academy rules: walking out on tactical drills, picking fights with privileged academy kids, and getting red-carded for reckless retaliation. Your parents wept as prestigious clubs revoked offers, terrified that your rebellious attitude would destroy your family’s golden ticket.',
      es: 'Criado en una barriada de inmigrantes, toda la ciudad hablaba de tus pies mágicos y tu potrero puro. Pero te negabas a acatar las normas de las academias locales: te ibas en medio de la práctica, te agarrabas a trompadas con los pibes chetos y te echaban por venganzas absurdas. Tus viejos lloraban viendo cómo se caían ofertas de clubes grandes por culpa de tu conducta ingobernable.',
    },
    legendary: {
      en: 'Carrying the fierce pride of your homeland, you played with an electrifying, savage brilliance that mesmerized everyone. But you were utterly ungovernable. You treated referees with open disdain, accumulated disciplinary cautions by the dozen, and got into fistfights in stadium parking lots. Your parents pray every night that your transcendent, divine football gift will survive your insatiable appetite for chaos.',
      es: 'Llevando el orgullo salvaje de tus raíces, jugabas con una electricidad y un desparpajo que enamoraba a todos. Pero eras imposible de controlar. Mirabas con desprecio a los árbitros, sumabas amarillas de a docenas y te peleabas hasta en el estacionamiento del estadio. Tus viejos rezan cada noche para que tu talento celestial sobreviva a tu adicción por el bardo.',
    },
    iconic: {
      en: 'A legendary immigrant origin steeped in raw genius and untamable fire. You were blessed with magical, celestial footwork that could change the fate of your family forever. Yet you chose the path of the defiant outcast—picking fights with opposition supporters, accumulating straight red cards, and daring anyone to tell you what to do. You enter age 10 as an immortal street wizard with a catastrophic reputation.',
      es: 'Un origen de película marcado por una genialidad salvaje y un fuego indomable. Tenías en las piernas la magia bendecida para salvar a tu familia para siempre. Pero elegiste ser el villano rebelde: peleándote con las hinchadas rivales, sumando rojas directas y desafiando a quien se atreviera a darte una orden. A los 10 años sos un mago inmortal con un prontuario temible.',
    },
  },
  raised_in_ghetto: {
    bronze: {
      en: 'Growing up on unforgiving asphalt cages, you quickly proved you had the fastest feet and purest touch in the entire district. But the streets also taught you that weakness was fatal, forging a hair-trigger temper. You responded to hard tackles with savage retaliation, resulting in endless youth league bans. You possess magical football gifts, but your terrible conduct makes you a walking hazard on any pitch.',
      es: 'Creciendo en el asfalto caliente del barrio, demostraste rápido que tenías la mejor cintura y el toque más dulce de toda la zona. Pero el potrero también te enseñó que achicar es morir, forjándote una mecha cortísima. Respondías a cada patada con una piña o una patada criminal, comiéndote suspensiones eternas. Tenés un guante en el pie, pero sos un peligro andante.',
    },
    silver: {
      en: 'In the brutal street tournaments of your neighborhood, you were an undisputed wunderkind—humiliating grown men with dazzling elasticos and no-look passes. But your mouth was as sharp as your boots: taunting opposing crews, spitting at referees, and inciting mass brawls. Your raw talent was astronomical, but coaches knew that signing you meant bringing a ticking grenade into the locker room.',
      es: 'En los campeonatos bravos del barrio eras el rey indiscutido: dejabas pagando a tipos grandes con elásticas y pases sin mirar. Pero tu lengua era más filosa que tus botines: cargabas a las barras rivales, escupías al árbitro y armabas batallas campales. Tu talento era de otro planeta, pero cualquier técnico sabía que llevarte era meter una granada sin espoleta al vestuario.',
    },
    gold: {
      en: 'Forged in ruthless underground cage leagues, your close control and explosive shooting were nothing short of sorcery. Yet you had zero respect for authority or organized football etiquette. You skipped official academy trials to play street matches for cash, threw punches when provoked, and collected straight red cards like badges of honor. An uncontainable street prodigy consumed by volatile rage.',
      es: 'Forjado en las jaulas más pesadas del conurbano, tu control de pelota y tu bombazo eran pura brujería. Pero no tenías ni una pizca de respeto por la autoridad. Pegabas el faltazo a pruebas en clubes de primera para jugar por plata en el barro, te agarrabas a las trompadas y coleccionabas rojas directas con orgullo. Un pibe de oro consumido por su propia rabia.',
    },
    legendary: {
      en: 'The most terrifying footballing delinquent to emerge from the pavement in decades. Your touch was like silk, your dribbling like lightning, and your temper like nitro-glycerin. Opponents dreaded facing you because you would either score five goals or break their shins in a retaliatory brawl. You enter age 10 with kingly street swagger, monstrous natural stats, and an infamous conduct record.',
      es: 'El pibe más temible que pisó el asfalto en décadas. Tu toque era de seda, tu gambeta un rayo y tu carácter pura dinamita. Los rivales temblaban al jugar contra vos porque o les clavabas cinco pepas o terminabas a las patadas en una batalla campal. Llegás a los 10 años con un porte de rey de la calle, números de crack y una reputación tremenda.',
    },
    iconic: {
      en: 'An immortal street legend whose name strikes awe and terror across the city. You possess celestial, generational football gifts that no academy can teach—a ball glued to your soul. Yet you are completely feral, proudly holding the record for the quickest red card in youth cup history and brawling with anyone who challenges your throne. You are the ultimate bad boy: an untouchable genius of chaos.',
      es: 'Una leyenda viva del potrero cuyo nombre genera admiración y pánico en cada cancha. Tenés una magia celestial que ninguna escuela te puede enseñar: la pelota atada al corazón. Pero sos un animal salvaje: dueño del récord de la expulsión más rápida en copas infantiles y peleador serial con quien mire tu trono. Sos el bad boy definitivo: un genio del caos.',
    },
  },
  rich_parents: {
    bronze: {
      en: 'Surrounded by private luxury and new gear every week, you possessed supernatural talent that money could never buy. But privilege turned you into an insufferable brat. You openly mocked coaches at elite weekend clinics, refused to pass to teammates you deemed inferior, and got expelled from two youth programs for kicking the referee’s bag into a fountain. A gifted problem child whose parents constantly write checks to cover your tantrums.',
      es: 'Rodeado de lujos y estrenando botines todas las semanas, tenías un talento descomunal que ninguna billetera puede comprar. Pero la plata te volvió insoportable. Te burlabas de los profes en las clínicas privadas, no se la pasabas a nadie porque decías que eran malos y te rajaron de dos clubes por tirarle el bolso al árbitro a una fuente. Un nene caprichoso cuyos viejos pagan multas para tapar tus escándalos.',
    },
    silver: {
      en: 'Your parents hired the most expensive personal trainers in the country, but you regularly locked them out of the private pitch or showed up an hour late with an arrogant grin. You could bend free kicks into the top corner with effortless ease, but during matches you showed off, humiliated opponents, and picked up childish red cards for sarcastic clapping. Your parents’ wealth can buy anything except your discipline.',
      es: 'Tus viejos contrataron a los mejores entrenadores del país, y vos los dejabas plantados afuera de la cancha o caías una hora tarde riéndote en su cara. Clavabas los tiros libres en el ángulo con una facilidad insultante, pero en los partidos te sobrabas, humillabas a los rivales y te hacías echar aplaudiendo al juez con ironía. La guita de tu familia compra todo, menos tu cabeza.',
    },
    gold: {
      en: 'With a €4,000,000 family commercial fund and VIP access to world-class academies, you had the world at your feet. Scouts called your natural technique generational. Yet your toxic attitude disgusted academy directors: you bragged about your family’s money, threw temper tantrums on the bench, and picked up a three-month ban for insulting a match official. Your family’s lawyers work overtime to protect your toxic genius.',
      es: 'Con un fondo familiar de 4.000.000 € y pase VIP a las mejores canteras del mundo, tenías el destino servido. Los ojeadores decían que tu técnica era de época. Pero tu actitud soberbia asqueó a los coordinadores: refregabas la plata de tus viejos, tirabas berrinches en el banco y te comiste tres meses de sanción por putear al árbitro. Los abogados familiares laburan horas extras para tapar tus desastres.',
    },
    legendary: {
      en: 'Living in a private luxury estate with manicured pitches, you treated the sport like your personal playground. You were capable of breathtaking, impossible football that left national team scouts in awe. But you were completely incorrigible—vandalizing dressing rooms after being substituted, walking off mid-game in protest, and collecting straight red cards without remorse. A gilded rebel who believes talent excuses everything.',
      es: 'Viviendo en una mansión con canchas de golf y fútbol privado, te tomaste el deporte como tu parque de diversiones. Hacías jugadas de PlayStation que dejaban mudos a los seleccionadores juveniles. Pero eras incorregible: rompías el vestuario si te sacaban, te ibas de la cancha a mitad de partido y acumulabas rojas directas sin que se te mueva un pelo. Un rebelde con plata que cree que por jugar bien puede pisar a todos.',
    },
    iconic: {
      en: 'Born into dynasty and unlimited millions, you were gifted with celestial, peerless football genius that shocked the elite establishment. Yet you turned into the most infamous enfant terrible in junior football: arriving in luxury cars, sneering at legendary coaches, inciting on-pitch riots, and racking up conduct fines. At age 10, you are an untouchable, magnetic nightmare of supreme skill and rotten attitude.',
      es: 'Nacido en una dinastía multimillonaria, fuiste bendecido con un talento celestial que dejó atónito a todo el ambiente. Pero te convertiste en el enfant terrible más temido del fútbol infantil: llegando en autos importados, riéndote de técnicos históricos, armando tole-tole en la cancha y coleccionando multas. A los 10 años sos una pesadilla magnética de habilidad pura y mala leche.',
    },
  },
  iconic_parent: {
    bronze: {
      en: 'Being the child of an iconic football figure should have set you on a path of glory, but you despised the suffocating comparisons. You possessed the exact same magical touch and supernatural vision as your famous parent—perhaps even superior. Yet you rebelled violently: deliberately playing out of position, ignoring tactical guidelines, and collecting senseless red cards just to humiliate the family name. A volatile genius suffocating under inherited greatness.',
      es: 'Ser hijo de un ídolo de la pelota debió ponerte en camino a la gloria, pero vos odiabas que te comparen a cada segundo. Tenías el mismo guante en el pie y la visión de crack de tu viejo, incluso superior. Pero te rebelaste con violencia: jugabas donde querías, te pasabas las órdenes tácticas por el bolsillo y te hacías echar con rojas absurdas solo para manchar el apellido. Un genio rebelde asfixiado por la sombra de su padre.',
    },
    silver: {
      en: 'Your parent is an immortal of the game, but every time people praised their legacy, your blood boiled. On the pitch, your supernatural ability was undeniable—you could dribble past an entire team while yawning. But you used that brilliance to provoke: taunting coaches, refusing to train, and getting sent off for aggressive headbutts. Your iconic parent sits in the stands in agony, watching their divine gifts trapped inside a furious rebel.',
      es: 'Tu viejo es un prócer del fútbol, pero cada vez que elogiaban su historia a vos se te salía la cadena. En la cancha tu magia era indiscutible: te gambeteabas a medio equipo bostezando. Pero usabas esa categoría para pudrirla: burlándote de los DTs, faltando a entrenar y yéndote expulsado por tirar cabezazos. Tu viejo miraba desde la tribuna con dolor cómo sus dones sagrados estaban en manos de un rebelde enfurecido.',
    },
    gold: {
      en: 'The football world expected you to be the crown prince of football royalty. Instead, you became its greatest villain. Your celestial ball control and breathtaking flair drew gasps from global scouts, but your explosive temper was legendary. You cursed at your famous parent’s former teammates, threw your captain’s armband at a referee, and walked off the pitch in anger. You demand to be recognized as a god in your own right, even if you have to burn the sport to do it.',
      es: 'El mundo esperaba que fueras el príncipe heredero del fútbol. En cambio, te convertiste en el villano perfecto. Tu control de pelota celestial y tus lujos arrancaban suspiros a los ojeadores del mundo, pero tu temperamento era dinamita pura. Insultaste a excompañeros de tu viejo, le revoleaste la cinta de capitán al árbitro y te fuiste de la cancha puteando. Querés que te reconozcan como un dios propio, aunque tengas que prender fuego todo.',
    },
    legendary: {
      en: 'A terrifying convergence of celestial talent and venomous rebellion. You possess generational magic that surpasses your iconic parent—every touch is pure poetry. But you treat the sport like a war zone. You have been kicked out of three elite academies for insubordination, fistfights, and reckless disciplinary offenses. Your iconic parent knows you could win the Ballon d’Or or end up completely blacklisted before you turn 20.',
      es: 'Una mezcla aterradora de talento celestial y rebeldía venenosa. Tenés una magia de época que supera incluso a tu viejo legendario: cada toque tuyo es arte puro. Pero te tomás el fútbol como una guerra callejera. Te rajaron de tres canteras de élite por insubordinación, trompadas y faltas disciplinarias graves. Tu viejo sabe que podés ganar el Balón de Oro o terminar prohibido en todos lados antes de los 20.',
    },
    iconic: {
      en: 'The ultimate dark prodigy. Born to the absolute greatest football royalty, you possess an otherworldly, divine genius that defies description. Yet you wield it like a weapon of pure spite against the world. You refuse all advice, brawl with anyone who dares tackle you, collect straight red cards with pride, and sneer at football traditions. You enter age 10 as a terrifying, magnetic anomaly: an unstoppable demon of football magic who bows to no one.',
      es: 'El prodigio oscuro definitivo. Nacido de la realeza más sagrada de la pelota, tenés una genialidad divina que no tiene explicación. Pero la usás como un arma de puro despecho contra el mundo. No escuchás a nadie, te agarrás a las piñas con el que te raspe, sumás rojas directas con orgullo y te reís de la historia del fútbol. A los 10 años sos una anomalía magnética y aterradora: un demonio imparable de magia que no se arrodilla ante nadie.',
    },
  },
};

/**
 * Checks whether an archetype id represents the volatile "Wasted Talent" archetype
 */
export function isWastedTalentArchetype(playerTypeId?: string): boolean {
  if (!playerTypeId) return false;
  const normalized = playerTypeId.toLowerCase().trim();
  return (
    normalized === 'wasted_talent' ||
    normalized.includes('wasted') ||
    normalized === 'volatile_genius'
  );
}

/**
 * Retrieves the appropriate childhood intro story based on:
 * 1. Parent card type (e.g. ex_pro_player, raised_in_ghetto, etc.)
 * 2. Parent card rarity tier (bronze, silver, gold, legendary, iconic)
 * 3. Player archetype (if wasted talent -> loads the gifted problem kid storyline)
 * 4. Language preference ('es' or 'en')
 */
export function getParentCardIntroStory(
  typeId: ParentCardTypeId,
  rarity: ParentCardRarity,
  playerTypeId?: string,
  lang: string = 'en'
): string {
  const isEs = lang.toLowerCase().startsWith('es');
  const langKey: 'en' | 'es' = isEs ? 'es' : 'en';

  if (isWastedTalentArchetype(playerTypeId)) {
    const wastedTypeStories = WASTED_TALENT_INTRO_STORIES[typeId] || WASTED_TALENT_INTRO_STORIES.average_family;
    const rarityStory = wastedTypeStories[rarity] || wastedTypeStories.bronze;
    return rarityStory[langKey] || rarityStory.en;
  }

  const normalTypeStories = NORMAL_INTRO_STORIES[typeId] || NORMAL_INTRO_STORIES.average_family;
  const rarityStory = normalTypeStories[rarity] || normalTypeStories.bronze;
  return rarityStory[langKey] || rarityStory.en;
}

