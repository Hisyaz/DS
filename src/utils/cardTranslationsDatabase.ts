/**
 * CARD TRANSLATIONS DATABASE
 * Single source of truth for full multilingual card localization across all 5 supported languages:
 * - English (en-GB)
 * - Español España (es-ES)
 * - Español Argentina (es-AR)
 * - Português Brasil (pt-BR)
 * - Français (fr-FR)
 *
 * Covers 100% of all default and option file cards (255 cards total).
 */

import type { CustomCard } from '../types';

export interface CardLocalizedText {
  name: string;
  description: string;
}

export const ALL_CARD_TRANSLATIONS: Record<string, Record<string, CardLocalizedText>> = {
  "default-parent-ex_pro_player-bronze": {
    "en-GB": {
      "name": "Ex-Pro Player (BRONZE)",
      "description": "One of your parents played professional football and now represents your career with insider experience."
    },
    "es-ES": {
      "name": "Exjugador Profesional (BRONCE)",
      "description": "Uno de tus padres jugó al fútbol profesional y ahora gestiona tu desarrollo con conocimiento interno del deporte."
    },
    "es-AR": {
      "name": "Exjugador Profesional (BRONCE)",
      "description": "Uno de tus viejos jugó en Primera y ahora maneja tus primeros pasos con experiencia de vestuario."
    },
    "pt-BR": {
      "name": "Ex-Jogador Profissional (BRONZE)",
      "description": "Um dos seus pais jogou futebol profissional e agora gerencia seu desenvolvimento com visão de bastidores."
    },
    "fr-FR": {
      "name": "Ancien Joueur Pro (BRONZE)",
      "description": "L'un de vos parents a joué au niveau professionnel et guide vos débuts grâce à ses connaissances du milieu."
    }
  },
  "default-parent-ex_pro_player-silver": {
    "en-GB": {
      "name": "Ex-Pro Player (SILVER)",
      "description": "One of your parents played professional football and now represents your career with insider experience."
    },
    "es-ES": {
      "name": "Exjugador Profesional (PLATA)",
      "description": "Uno de tus padres jugó al fútbol profesional y ahora gestiona tu desarrollo con conocimiento interno del deporte."
    },
    "es-AR": {
      "name": "Exjugador Profesional (PLATA)",
      "description": "Uno de tus viejos jugó en Primera y ahora maneja tus primeros pasos con experiencia de vestuario."
    },
    "pt-BR": {
      "name": "Ex-Jogador Profissional (PRATA)",
      "description": "Um dos seus pais jogou futebol profissional e agora gerencia seu desenvolvimento com visão de bastidores."
    },
    "fr-FR": {
      "name": "Ancien Joueur Pro (ARGENT)",
      "description": "L'un de vos parents a joué au niveau professionnel et guide vos débuts grâce à ses connaissances du milieu."
    }
  },
  "default-parent-ex_pro_player-gold": {
    "en-GB": {
      "name": "Ex-Pro Player (GOLD)",
      "description": "One of your parents played professional football and now represents your career with insider experience."
    },
    "es-ES": {
      "name": "Exjugador Profesional (ORO)",
      "description": "Uno de tus padres jugó al fútbol profesional y ahora gestiona tu desarrollo con conocimiento interno del deporte."
    },
    "es-AR": {
      "name": "Exjugador Profesional (ORO)",
      "description": "Uno de tus viejos jugó en Primera y ahora maneja tus primeros pasos con experiencia de vestuario."
    },
    "pt-BR": {
      "name": "Ex-Jogador Profissional (OURO)",
      "description": "Um dos seus pais jogou futebol profissional e agora gerencia seu desenvolvimento com visão de bastidores."
    },
    "fr-FR": {
      "name": "Ancien Joueur Pro (OR)",
      "description": "L'un de vos parents a joué au niveau professionnel et guide vos débuts grâce à ses connaissances du milieu."
    }
  },
  "default-parent-ex_pro_player-legendary": {
    "en-GB": {
      "name": "Ex-Pro Player (LEGENDARY)",
      "description": "One of your parents played professional football and now represents your career with insider experience."
    },
    "es-ES": {
      "name": "Exjugador Profesional (LEGENDARIO)",
      "description": "Uno de tus padres jugó al fútbol profesional y ahora gestiona tu desarrollo con conocimiento interno del deporte."
    },
    "es-AR": {
      "name": "Exjugador Profesional (LEGENDARIO)",
      "description": "Uno de tus viejos jugó en Primera y ahora maneja tus primeros pasos con experiencia de vestuario."
    },
    "pt-BR": {
      "name": "Ex-Jogador Profissional (LENDÁRIO)",
      "description": "Um dos seus pais jogou futebol profissional e agora gerencia seu desenvolvimento com visão de bastidores."
    },
    "fr-FR": {
      "name": "Ancien Joueur Pro (LÉGENDAIRE)",
      "description": "L'un de vos parents a joué au niveau professionnel et guide vos débuts grâce à ses connaissances du milieu."
    }
  },
  "default-parent-average_family-bronze": {
    "en-GB": {
      "name": "Average Family (BRONZE)",
      "description": "Raised in a supportive, loving household that always believed in you and kept you grounded."
    },
    "es-ES": {
      "name": "Familia Promedio (BRONCE)",
      "description": "Criado en un hogar cariñoso y humilde que siempre priorizó tu bienestar y te mantuvo con los pies en el suelo."
    },
    "es-AR": {
      "name": "Familia Tipo (BRONCE)",
      "description": "Criado en un hogar humilde y familiero que siempre te bancó y te mantuvo con los pies sobre la tierra."
    },
    "pt-BR": {
      "name": "Família Comum (BRONZE)",
      "description": "Criado em um lar afetuoso e acolhedor que sempre priorizou sua felicidade e manteve seus pés no chão."
    },
    "fr-FR": {
      "name": "Famille Ordinaire (BRONZE)",
      "description": "Élevé dans un foyer aimant et soutenant qui a toujours privilégié votre épanouissement et gardé les pieds sur terre."
    }
  },
  "default-parent-average_family-silver": {
    "en-GB": {
      "name": "Average Family (SILVER)",
      "description": "Raised in a supportive, loving household that always believed in you and kept you grounded."
    },
    "es-ES": {
      "name": "Familia Promedio (PLATA)",
      "description": "Criado en un hogar cariñoso y humilde que siempre priorizó tu bienestar y te mantuvo con los pies en el suelo."
    },
    "es-AR": {
      "name": "Familia Tipo (PLATA)",
      "description": "Criado en un hogar humilde y familiero que siempre te bancó y te mantuvo con los pies sobre la tierra."
    },
    "pt-BR": {
      "name": "Família Comum (PRATA)",
      "description": "Criado em um lar afetuoso e acolhedor que sempre priorizou sua felicidade e manteve seus pés no chão."
    },
    "fr-FR": {
      "name": "Famille Ordinaire (ARGENT)",
      "description": "Élevé dans un foyer aimant et soutenant qui a toujours privilégié votre épanouissement et gardé les pieds sur terre."
    }
  },
  "default-parent-average_family-gold": {
    "en-GB": {
      "name": "Average Family (GOLD)",
      "description": "Raised in a supportive, loving household that always believed in you and kept you grounded."
    },
    "es-ES": {
      "name": "Familia Promedio (ORO)",
      "description": "Criado en un hogar cariñoso y humilde que siempre priorizó tu bienestar y te mantuvo con los pies en el suelo."
    },
    "es-AR": {
      "name": "Familia Tipo (ORO)",
      "description": "Criado en un hogar humilde y familiero que siempre te bancó y te mantuvo con los pies sobre la tierra."
    },
    "pt-BR": {
      "name": "Família Comum (OURO)",
      "description": "Criado em um lar afetuoso e acolhedor que sempre priorizou sua felicidade e manteve seus pés no chão."
    },
    "fr-FR": {
      "name": "Famille Ordinaire (OR)",
      "description": "Élevé dans un foyer aimant et soutenant qui a toujours privilégié votre épanouissement et gardé les pieds sur terre."
    }
  },
  "default-parent-average_family-legendary": {
    "en-GB": {
      "name": "Average Family (LEGENDARY)",
      "description": "Raised in a supportive, loving household that always believed in you and kept you grounded."
    },
    "es-ES": {
      "name": "Familia Promedio (LEGENDARIO)",
      "description": "Criado en un hogar cariñoso y humilde que siempre priorizó tu bienestar y te mantuvo con los pies en el suelo."
    },
    "es-AR": {
      "name": "Familia Tipo (LEGENDARIO)",
      "description": "Criado en un hogar humilde y familiero que siempre te bancó y te mantuvo con los pies sobre la tierra."
    },
    "pt-BR": {
      "name": "Família Comum (LENDÁRIO)",
      "description": "Criado em um lar afetuoso e acolhedor que sempre priorizou sua felicidade e manteve seus pés no chão."
    },
    "fr-FR": {
      "name": "Famille Ordinaire (LÉGENDAIRE)",
      "description": "Élevé dans un foyer aimant et soutenant qui a toujours privilégié votre épanouissement et gardé les pieds sur terre."
    }
  },
  "default-parent-helicopter_parents-bronze": {
    "en-GB": {
      "name": "Helicopter Parents (BRONZE)",
      "description": "Your parents controlled every aspect of your football upbringing and represent you with fierce loyalty."
    },
    "es-ES": {
      "name": "Padres Sobreprotectores (BRONCE)",
      "description": "Tus padres controlaron cada detalle de tu formación futbolística, exigiéndote al máximo y actuando como tus agentes."
    },
    "es-AR": {
      "name": "Padres Helicóptero (BRONCE)",
      "description": "Tus viejos controlaron cada milímetro de tu desarrollo, exigiéndote a full y actuando como tus representantes."
    },
    "pt-BR": {
      "name": "Pais Superprotetores (BRONZE)",
      "description": "Seus pais controlaram cada detalhe da sua formação, cobrando rendimento máximo e agindo como seus agentes."
    },
    "fr-FR": {
      "name": "Parents Hélicoptères (BRONZE)",
      "description": "Vos parents ont contrôlé chaque étape de votre progression, exigeant l'excellence et gérant vos intérêts."
    }
  },
  "default-parent-helicopter_parents-silver": {
    "en-GB": {
      "name": "Helicopter Parents (SILVER)",
      "description": "Your parents controlled every aspect of your football upbringing and represent you with fierce loyalty."
    },
    "es-ES": {
      "name": "Padres Sobreprotectores (PLATA)",
      "description": "Tus padres controlaron cada detalle de tu formación futbolística, exigiéndote al máximo y actuando como tus agentes."
    },
    "es-AR": {
      "name": "Padres Helicóptero (PLATA)",
      "description": "Tus viejos controlaron cada milímetro de tu desarrollo, exigiéndote a full y actuando como tus representantes."
    },
    "pt-BR": {
      "name": "Pais Superprotetores (PRATA)",
      "description": "Seus pais controlaram cada detalhe da sua formação, cobrando rendimento máximo e agindo como seus agentes."
    },
    "fr-FR": {
      "name": "Parents Hélicoptères (ARGENT)",
      "description": "Vos parents ont contrôlé chaque étape de votre progression, exigeant l'excellence et gérant vos intérêts."
    }
  },
  "default-parent-helicopter_parents-gold": {
    "en-GB": {
      "name": "Helicopter Parents (GOLD)",
      "description": "Your parents controlled every aspect of your football upbringing and represent you with fierce loyalty."
    },
    "es-ES": {
      "name": "Padres Sobreprotectores (ORO)",
      "description": "Tus padres controlaron cada detalle de tu formación futbolística, exigiéndote al máximo y actuando como tus agentes."
    },
    "es-AR": {
      "name": "Padres Helicóptero (ORO)",
      "description": "Tus viejos controlaron cada milímetro de tu desarrollo, exigiéndote a full y actuando como tus representantes."
    },
    "pt-BR": {
      "name": "Pais Superprotetores (OURO)",
      "description": "Seus pais controlaram cada detalhe da sua formação, cobrando rendimento máximo e agindo como seus agentes."
    },
    "fr-FR": {
      "name": "Parents Hélicoptères (OR)",
      "description": "Vos parents ont contrôlé chaque étape de votre progression, exigeant l'excellence et gérant vos intérêts."
    }
  },
  "default-parent-helicopter_parents-legendary": {
    "en-GB": {
      "name": "Helicopter Parents (LEGENDARY)",
      "description": "Your parents controlled every aspect of your football upbringing and represent you with fierce loyalty."
    },
    "es-ES": {
      "name": "Padres Sobreprotectores (LEGENDARIO)",
      "description": "Tus padres controlaron cada detalle de tu formación futbolística, exigiéndote al máximo y actuando como tus agentes."
    },
    "es-AR": {
      "name": "Padres Helicóptero (LEGENDARIO)",
      "description": "Tus viejos controlaron cada milímetro de tu desarrollo, exigiéndote a full y actuando como tus representantes."
    },
    "pt-BR": {
      "name": "Pais Superprotetores (LENDÁRIO)",
      "description": "Seus pais controlaram cada detalhe da sua formação, cobrando rendimento máximo e agindo como seus agentes."
    },
    "fr-FR": {
      "name": "Parents Hélicoptères (LÉGENDAIRE)",
      "description": "Vos parents ont contrôlé chaque étape de votre progression, exigeant l'excellence et gérant vos intérêts."
    }
  },
  "default-parent-immigrant_family-bronze": {
    "en-GB": {
      "name": "Immigrant Family (BRONZE)",
      "description": "Your family moved in search of a better future. Growing up as an outsider made adapting second nature."
    },
    "es-ES": {
      "name": "Familia Inmigrante (BRONCE)",
      "description": "Tu familia emigró en busca de un futuro mejor. Crecer como forastero forjó tu adaptabilidad y resistencia."
    },
    "es-AR": {
      "name": "Familia Inmigrante (BRONCE)",
      "description": "Tu familia se mudó buscando un futuro mejor. Crecer como forastero te enseñó a adaptarte y pelearla siempre."
    },
    "pt-BR": {
      "name": "Família Imigrante (BRONZE)",
      "description": "Sua família se mudou em busca de um futuro melhor. Crescer como forasteiro ensinou resiliência e adaptação rápida."
    },
    "fr-FR": {
      "name": "Famille Immigrée (BRONZE)",
      "description": "Votre famille a émigré en quête d'un avenir meilleur. Grandir en étranger vous a appris l'adaptabilité et la résilience."
    }
  },
  "default-parent-immigrant_family-silver": {
    "en-GB": {
      "name": "Immigrant Family (SILVER)",
      "description": "Your family moved in search of a better future. Growing up as an outsider made adapting second nature."
    },
    "es-ES": {
      "name": "Familia Inmigrante (PLATA)",
      "description": "Tu familia emigró en busca de un futuro mejor. Crecer como forastero forjó tu adaptabilidad y resistencia."
    },
    "es-AR": {
      "name": "Familia Inmigrante (PLATA)",
      "description": "Tu familia se mudó buscando un futuro mejor. Crecer como forastero te enseñó a adaptarte y pelearla siempre."
    },
    "pt-BR": {
      "name": "Família Imigrante (PRATA)",
      "description": "Sua família se mudou em busca de um futuro melhor. Crescer como forasteiro ensinou resiliência e adaptação rápida."
    },
    "fr-FR": {
      "name": "Famille Immigrée (ARGENT)",
      "description": "Votre famille a émigré en quête d'un avenir meilleur. Grandir en étranger vous a appris l'adaptabilité et la résilience."
    }
  },
  "default-parent-immigrant_family-gold": {
    "en-GB": {
      "name": "Immigrant Family (GOLD)",
      "description": "Your family moved in search of a better future. Growing up as an outsider made adapting second nature."
    },
    "es-ES": {
      "name": "Familia Inmigrante (ORO)",
      "description": "Tu familia emigró en busca de un futuro mejor. Crecer como forastero forjó tu adaptabilidad y resistencia."
    },
    "es-AR": {
      "name": "Familia Inmigrante (ORO)",
      "description": "Tu familia se mudó buscando un futuro mejor. Crecer como forastero te enseñó a adaptarte y pelearla siempre."
    },
    "pt-BR": {
      "name": "Família Imigrante (OURO)",
      "description": "Sua família se mudou em busca de um futuro melhor. Crescer como forasteiro ensinou resiliência e adaptação rápida."
    },
    "fr-FR": {
      "name": "Famille Immigrée (OR)",
      "description": "Votre famille a émigré en quête d'un avenir meilleur. Grandir en étranger vous a appris l'adaptabilité et la résilience."
    }
  },
  "default-parent-immigrant_family-legendary": {
    "en-GB": {
      "name": "Immigrant Family (LEGENDARY)",
      "description": "Your family moved in search of a better future. Growing up as an outsider made adapting second nature."
    },
    "es-ES": {
      "name": "Familia Inmigrante (LEGENDARIO)",
      "description": "Tu familia emigró en busca de un futuro mejor. Crecer como forastero forjó tu adaptabilidad y resistencia."
    },
    "es-AR": {
      "name": "Familia Inmigrante (LEGENDARIO)",
      "description": "Tu familia se mudó buscando un futuro mejor. Crecer como forastero te enseñó a adaptarte y pelearla siempre."
    },
    "pt-BR": {
      "name": "Família Imigrante (LENDÁRIO)",
      "description": "Sua família se mudou em busca de um futuro melhor. Crescer como forasteiro ensinou resiliência e adaptação rápida."
    },
    "fr-FR": {
      "name": "Famille Immigrée (LÉGENDAIRE)",
      "description": "Votre famille a émigré en quête d'un avenir meilleur. Grandir en étranger vous a appris l'adaptabilité et la résilience."
    }
  },
  "default-parent-raised_in_ghetto-bronze": {
    "en-GB": {
      "name": "Raised in the Ghetto (BRONZE)",
      "description": "Football was your escape from a difficult childhood (orphan/single parent), forging unmatched resilience."
    },
    "es-ES": {
      "name": "Criado en el Barrio (BRONCE)",
      "description": "El fútbol fue tu vía de escape ante una infancia difícil, forjando un hambre competitiva y una garra inquebrantables."
    },
    "es-AR": {
      "name": "Forjado en el Potrero (BRONCE)",
      "description": "El fútbol fue tu cable a tierra ante una infancia durísima, forjando rebeldía, hambre de gloria y potrero puro."
    },
    "pt-BR": {
      "name": "Criado na Quebrada (BRONZE)",
      "description": "O futebol foi sua salvação de uma infância humilde e dura, moldando raça pura e uma fome de vencer insaciável."
    },
    "fr-FR": {
      "name": "Enfant du Quartier (BRONZE)",
      "description": "Le football fut votre planche de salut face à une enfance rude, forgeant une hargne et une faim de victoires sans égale."
    }
  },
  "default-parent-raised_in_ghetto-silver": {
    "en-GB": {
      "name": "Raised in the Ghetto (SILVER)",
      "description": "Football was your escape from a difficult childhood (orphan/single parent), forging unmatched resilience."
    },
    "es-ES": {
      "name": "Criado en el Barrio (PLATA)",
      "description": "El fútbol fue tu vía de escape ante una infancia difícil, forjando un hambre competitiva y una garra inquebrantables."
    },
    "es-AR": {
      "name": "Forjado en el Potrero (PLATA)",
      "description": "El fútbol fue tu cable a tierra ante una infancia durísima, forjando rebeldía, hambre de gloria y potrero puro."
    },
    "pt-BR": {
      "name": "Criado na Quebrada (PRATA)",
      "description": "O futebol foi sua salvação de uma infância humilde e dura, moldando raça pura e uma fome de vencer insaciável."
    },
    "fr-FR": {
      "name": "Enfant du Quartier (ARGENT)",
      "description": "Le football fut votre planche de salut face à une enfance rude, forgeant une hargne et une faim de victoires sans égale."
    }
  },
  "default-parent-raised_in_ghetto-gold": {
    "en-GB": {
      "name": "Raised in the Ghetto (GOLD)",
      "description": "Football was your escape from a difficult childhood (orphan/single parent), forging unmatched resilience."
    },
    "es-ES": {
      "name": "Criado en el Barrio (ORO)",
      "description": "El fútbol fue tu vía de escape ante una infancia difícil, forjando un hambre competitiva y una garra inquebrantables."
    },
    "es-AR": {
      "name": "Forjado en el Potrero (ORO)",
      "description": "El fútbol fue tu cable a tierra ante una infancia durísima, forjando rebeldía, hambre de gloria y potrero puro."
    },
    "pt-BR": {
      "name": "Criado na Quebrada (OURO)",
      "description": "O futebol foi sua salvação de uma infância humilde e dura, moldando raça pura e uma fome de vencer insaciável."
    },
    "fr-FR": {
      "name": "Enfant du Quartier (OR)",
      "description": "Le football fut votre planche de salut face à une enfance rude, forgeant une hargne et une faim de victoires sans égale."
    }
  },
  "default-parent-raised_in_ghetto-legendary": {
    "en-GB": {
      "name": "Raised in the Ghetto (LEGENDARY)",
      "description": "Football was your escape from a difficult childhood (orphan/single parent), forging unmatched resilience."
    },
    "es-ES": {
      "name": "Criado en el Barrio (LEGENDARIO)",
      "description": "El fútbol fue tu vía de escape ante una infancia difícil, forjando un hambre competitiva y una garra inquebrantables."
    },
    "es-AR": {
      "name": "Forjado en el Potrero (LEGENDARIO)",
      "description": "El fútbol fue tu cable a tierra ante una infancia durísima, forjando rebeldía, hambre de gloria y potrero puro."
    },
    "pt-BR": {
      "name": "Criado na Quebrada (LENDÁRIO)",
      "description": "O futebol foi sua salvação de uma infância humilde e dura, moldando raça pura e uma fome de vencer insaciável."
    },
    "fr-FR": {
      "name": "Enfant du Quartier (LÉGENDAIRE)",
      "description": "Le football fut votre planche de salut face à une enfance rude, forgeant une hargne et une faim de victoires sans égale."
    }
  },
  "default-parent-rich_parents-bronze": {
    "en-GB": {
      "name": "Rich Parents (BRONZE)",
      "description": "Your family gave you access to elite academies, facilities, and significant initial wealth."
    },
    "es-ES": {
      "name": "Padres Acomodados (BRONCE)",
      "description": "Tu familia te facilitó entrenadores de élite, excelentes instalaciones y un importante respaldo financiero desde el inicio."
    },
    "es-AR": {
      "name": "Padres Adinerados (BRONCE)",
      "description": "Tu familia te bancó entrenamientos de élite, complejos de primer nivel y un respaldo económico sustancial de entrada."
    },
    "pt-BR": {
      "name": "Família Abastada (BRONZE)",
      "description": "Sua família garantiu acesso a técnicos de ponta, centros de excelência e estrutura financeira sólida desde o início."
    },
    "fr-FR": {
      "name": "Parents Aisés (BRONZE)",
      "description": "Votre famille vous a offert les meilleurs coachs privés, des installations de pointe et un confort financier dès le premier jour."
    }
  },
  "default-parent-rich_parents-silver": {
    "en-GB": {
      "name": "Rich Parents (SILVER)",
      "description": "Your family gave you access to elite academies, facilities, and significant initial wealth."
    },
    "es-ES": {
      "name": "Padres Acomodados (PLATA)",
      "description": "Tu familia te facilitó entrenadores de élite, excelentes instalaciones y un importante respaldo financiero desde el inicio."
    },
    "es-AR": {
      "name": "Padres Adinerados (PLATA)",
      "description": "Tu familia te bancó entrenamientos de élite, complejos de primer nivel y un respaldo económico sustancial de entrada."
    },
    "pt-BR": {
      "name": "Família Abastada (PRATA)",
      "description": "Sua família garantiu acesso a técnicos de ponta, centros de excelência e estrutura financeira sólida desde o início."
    },
    "fr-FR": {
      "name": "Parents Aisés (ARGENT)",
      "description": "Votre famille vous a offert les meilleurs coachs privés, des installations de pointe et un confort financier dès le premier jour."
    }
  },
  "default-parent-rich_parents-gold": {
    "en-GB": {
      "name": "Rich Parents (GOLD)",
      "description": "Your family gave you access to elite academies, facilities, and significant initial wealth."
    },
    "es-ES": {
      "name": "Padres Acomodados (ORO)",
      "description": "Tu familia te facilitó entrenadores de élite, excelentes instalaciones y un importante respaldo financiero desde el inicio."
    },
    "es-AR": {
      "name": "Padres Adinerados (ORO)",
      "description": "Tu familia te bancó entrenamientos de élite, complejos de primer nivel y un respaldo económico sustancial de entrada."
    },
    "pt-BR": {
      "name": "Família Abastada (OURO)",
      "description": "Sua família garantiu acesso a técnicos de ponta, centros de excelência e estrutura financeira sólida desde o início."
    },
    "fr-FR": {
      "name": "Parents Aisés (OR)",
      "description": "Votre famille vous a offert les meilleurs coachs privés, des installations de pointe et un confort financier dès le premier jour."
    }
  },
  "default-parent-rich_parents-legendary": {
    "en-GB": {
      "name": "Rich Parents (LEGENDARY)",
      "description": "Your family gave you access to elite academies, facilities, and significant initial wealth."
    },
    "es-ES": {
      "name": "Padres Acomodados (LEGENDARIO)",
      "description": "Tu familia te facilitó entrenadores de élite, excelentes instalaciones y un importante respaldo financiero desde el inicio."
    },
    "es-AR": {
      "name": "Padres Adinerados (LEGENDARIO)",
      "description": "Tu familia te bancó entrenamientos de élite, complejos de primer nivel y un respaldo económico sustancial de entrada."
    },
    "pt-BR": {
      "name": "Família Abastada (LENDÁRIO)",
      "description": "Sua família garantiu acesso a técnicos de ponta, centros de excelência e estrutura financeira sólida desde o início."
    },
    "fr-FR": {
      "name": "Parents Aisés (LÉGENDAIRE)",
      "description": "Votre famille vous a offert les meilleurs coachs privés, des installations de pointe et un confort financier dès le premier jour."
    }
  },
  "default-parent-iconic_parent-iconic": {
    "en-GB": {
      "name": "Iconic Parent (⭐ ICONIC)",
      "description": "An exceptionally rare football upbringing inspired by football’s greatest legends. Your parent sacrificed everything for your dream, instilling elite mentality, discipline, and constant emotional support."
    },
    "es-ES": {
      "name": "Padre Icónico (⭐ ICÓNICO)",
      "description": "Una crianza futbolística legendaria inspirada en los mitos del deporte. Tu padre se sacrificó entero por tu sueño, inculcándote mentalidad de élite, disciplina y cariño incondicional."
    },
    "es-AR": {
      "name": "Padre Icónico (⭐ ICÓNICO)",
      "description": "Una crianza futbolística mítica inspirada en las leyendas de la pelota. Tu viejo dejó la vida por tu sueño, formándote con mentalidad ganadora, disciplina y aguante de fierro."
    },
    "pt-BR": {
      "name": "Pai Icônico (⭐ ICÔNICO)",
      "description": "Uma formação futebolística grandiosa inspirada nos maiores craques. Seu pai abriu mão de tudo pelo seu sonho, moldando mentalidade de campeão, disciplina e amor incondicional."
    },
    "fr-FR": {
      "name": "Parent Emblématique (⭐ ICONIQUE)",
      "description": "Une formation footballistique hors du commun inspirée des légendes du jeu. Votre parent a tout sacrifié pour votre rêve, transmettant mentalité d'élite, rigueur et soutien sans faille."
    }
  },
  "card-street-street_footballer": {
    "en-GB": {
      "name": "Street Footballer",
      "description": "You learned football outside traditional academies. Creativity, improvisation, and instinct became your first teachers."
    },
    "es-ES": {
      "name": "Futbolista Callejero",
      "description": "Aprendiste a jugar fuera de las academias tradicionales. La creatividad y el desparpajo fueron tus mejores entrenadores."
    },
    "es-AR": {
      "name": "Pibe de Potrero",
      "description": "Aprendiste a jugar en el potrero, lejos de las escuelitas formales. La gambeta y la picardía fueron tus primeros maestros."
    },
    "pt-BR": {
      "name": "Boleiro de Rua",
      "description": "Você aprendeu a jogar futebol fora das escolinhas tradicionais. O improviso e a ginga foram seus professores."
    },
    "fr-FR": {
      "name": "Footballeur de Rue",
      "description": "Vous avez appris le football hors des centres de formation traditionnels. La créativité et l'audace ont forgé votre jeu."
    }
  },
  "card-street-found_money": {
    "en-GB": {
      "name": "Found Money",
      "description": "After a street match, you found money someone had dropped."
    },
    "es-ES": {
      "name": "Dinero Encontrado",
      "description": "Encontraste dinero en la calle después de un partido."
    },
    "es-AR": {
      "name": "Plata Encontrada",
      "description": "Encontraste plata tirada en la calle después de un picado."
    },
    "pt-BR": {
      "name": "Grana Encontrada",
      "description": "Encontrou um dinheiro na rua após uma partida."
    },
    "fr-FR": {
      "name": "Argent Trouvé",
      "description": "Vous avez trouvé de l'argent dans la rue après un match."
    }
  },
  "card-street-wall_practice": {
    "en-GB": {
      "name": "Wall Practice",
      "description": "Hours practicing against walls improved your first touch and passing."
    },
    "es-ES": {
      "name": "Práctica Contra el Muro",
      "description": "Horas pateando el balón contra una pared perfeccionaron tu control orientado."
    },
    "es-AR": {
      "name": "Paredón Interminable",
      "description": "Horas pateando contra el paredón le dieron precisión quirúrgica a tu primer toque."
    },
    "pt-BR": {
      "name": "Treino no Paredão",
      "description": "Horas chutando a bola contra a parede afiaram seu domínio de primeira."
    },
    "fr-FR": {
      "name": "Pratique du Mur",
      "description": "Des heures à frapper contre un mur ont aiguisé votre premier contrôle."
    }
  },
  "card-street-endless_matches": {
    "en-GB": {
      "name": "Endless Matches",
      "description": "Street games lasted for hours, teaching you to keep playing when others were tired."
    },
    "es-ES": {
      "name": "Partidos Interminables",
      "description": "Partidos que duraban horas te enseñaron a no dejar de correr cuando todos estaban agotados."
    },
    "es-AR": {
      "name": "Picados Eternos",
      "description": "Partidos que duraban toda la tarde te enseñaron a seguir corriendo cuando a los demás no les daban las piernas."
    },
    "pt-BR": {
      "name": "Peladas Sem Fim",
      "description": "Peladas que duravam horas ensinaram você a continuar correndo mesmo exausto."
    },
    "fr-FR": {
      "name": "Matchs Sans Fin",
      "description": "Des matchs de plusieurs heures vous ont appris à courir quand tous les autres s'effondraient."
    }
  },
  "card-street-recorded_skill": {
    "en-GB": {
      "name": "Recorded Skill",
      "description": "Someone recorded your best move and people started noticing your talent."
    },
    "es-ES": {
      "name": "Regate Grabado",
      "description": "Alguien grabó tu mejor regate y la gente empezó a hablar de tu talento."
    },
    "es-AR": {
      "name": "Caño Grabado",
      "description": "Alguien filmó tu mejor firulete y en el barrio no se habla de otra cosa."
    },
    "pt-BR": {
      "name": "Drible Gravado",
      "description": "Alguém filmou seu melhor drible e as pessoas começaram a comentar sobre você."
    },
    "fr-FR": {
      "name": "Geste Filmé",
      "description": "Quelqu'un a filmé votre plus beau dribble et la rumeur commence à enfler."
    }
  },
  "card-street-local_tournament": {
    "en-GB": {
      "name": "Local Tournament",
      "description": "You dominated a neighborhood tournament against local players."
    },
    "es-ES": {
      "name": "Torneo Local",
      "description": "Ganaste un torneo de barrio compitiendo contra jugadores mayores y más duros."
    },
    "es-AR": {
      "name": "Torneo Relámpago",
      "description": "Ganaste un campeonato barrial enfrentando a veteranos curtidos y mañosos."
    },
    "pt-BR": {
      "name": "Torneio de Várzea",
      "description": "Venceu um torneio do bairro contra adversários mais velhos e cascudos."
    },
    "fr-FR": {
      "name": "Tournoi Local",
      "description": "Vous avez remporté un tournoi de quartier face à des adversaires plus âgés et rugueux."
    }
  },
  "card-street-student_of_game": {
    "en-GB": {
      "name": "Student of the Game",
      "description": "You studied professional players and copied their movements."
    },
    "es-ES": {
      "name": "Estudiante del Juego",
      "description": "Observabas a los futbolistas profesionales en televisión y copiabas sus desmarques."
    },
    "es-AR": {
      "name": "Obsesivo de la Táctica",
      "description": "Mirabas a los cracks por la tele y copiabas cada uno de sus movimientos."
    },
    "pt-BR": {
      "name": "Estudioso da Bola",
      "description": "Assistia aos profissionais na TV e copiava cada movimentação deles."
    },
    "fr-FR": {
      "name": "Étudiant du Jeu",
      "description": "Vous regardiez les pros à la télé pour reproduire fidèlement leurs déplacements."
    }
  },
  "card-street-old_boots": {
    "en-GB": {
      "name": "Old Boots",
      "description": "Playing with poor equipment forced you to improve your technique."
    },
    "es-ES": {
      "name": "Botas Desgastadas",
      "description": "Jugar con botas deterioradas te forzó a confiar únicamente en tu técnica pura."
    },
    "es-AR": {
      "name": "Botines Viejos",
      "description": "Jugar con botines gastados te obligó a pegarle con pura técnica y sensibilidad."
    },
    "pt-BR": {
      "name": "Chuteiras Gastas",
      "description": "Jogar com chuteiras surradas forçou você a confiar puramente na técnica."
    },
    "fr-FR": {
      "name": "Crampons Usés",
      "description": "Jouer avec des chaussures usées vous a forcé à développer une technique irréprochable."
    }
  },
  "card-street-both_feet": {
    "en-GB": {
      "name": "Both Feet",
      "description": "Playing anywhere forced you to use whichever foot was available."
    },
    "es-ES": {
      "name": "Ambos Perfiles",
      "description": "Los espacios reducidos te forzaron a utilizar cualquiera de las dos piernas."
    },
    "es-AR": {
      "name": "Manejo de Dos Perfiles",
      "description": "El poco espacio en el potrero te obligó a definir con la pierna que tocara."
    },
    "pt-BR": {
      "name": "Ambidestro da Rua",
      "description": "Espaços apertados forçaram você a usar qualquer um dos pés com naturalidade."
    },
    "fr-FR": {
      "name": "Deux Pieds Affûtés",
      "description": "Les espaces réduits vous ont forcé à manier indifféremment les deux pieds."
    }
  },
  "card-street-street_captain": {
    "en-GB": {
      "name": "Street Captain",
      "description": "Your teammates naturally followed your decisions, earning you neighborhood respect and street fame."
    },
    "es-ES": {
      "name": "Capitán Callejero",
      "description": "Los demás compañeros confiaban en ti para tomar las decisiones en el campo."
    },
    "es-AR": {
      "name": "Caudillo de Potrero",
      "description": "Los pibes te miraban a vos para saber qué hacer en los momentos calientes."
    },
    "pt-BR": {
      "name": "Capitão da Rua",
      "description": "A molecada procurava você para liderar e decidir as jogadas nas partidas."
    },
    "fr-FR": {
      "name": "Capitaine de Rue",
      "description": "Les autres joueurs s'en remettaient à vos décisions lors des moments clés."
    }
  },
  "card-street-lost_your_temper": {
    "en-GB": {
      "name": "Lost Your Temper",
      "description": "A confrontation during a match affected your reputation."
    },
    "es-ES": {
      "name": "Pérdida de Papeles",
      "description": "Una discusión subida de tono en un partido dañó tu reputación en el barrio."
    },
    "es-AR": {
      "name": "Calentura de Partido",
      "description": "Una bronca en el picado te manchó la reputación entre la gente del barrio."
    },
    "pt-BR": {
      "name": "Perdeu a Cabeça",
      "description": "Uma briga durante a pelada prejudicou sua reputação na vizinhança."
    },
    "fr-FR": {
      "name": "Coup de Sang",
      "description": "Une dispute houleuse pendant un match a écorné votre réputation dans le quartier."
    }
  },
  "card-street-bad_landing": {
    "en-GB": {
      "name": "Bad Landing",
      "description": "A street match ended with an awkward injury."
    },
    "es-ES": {
      "name": "Mala Caída",
      "description": "Caíste de mala manera sobre el hormigón y te lastimaste."
    },
    "es-AR": {
      "name": "Caída Fea",
      "description": "Caíste mal sobre el cemento duro y te golpeaste feo."
    },
    "pt-BR": {
      "name": "Queda Feia",
      "description": "Caiu de mau jeito no asfalto e acabou se machucando."
    },
    "fr-FR": {
      "name": "Mauvaise Réception",
      "description": "Une mauvaise chute sur le bitume vous a provoqué une douleur persistante."
    }
  },
  "card-street-skipped_training": {
    "en-GB": {
      "name": "Skipped Training",
      "description": "You spent too much time playing and not enough improving."
    },
    "es-ES": {
      "name": "Entrenamiento Saltado",
      "description": "Pasaste el día jugando en la calle en vez de acudir a tu entrenamiento formal."
    },
    "es-AR": {
      "name": "Faltazo al Entrenamiento",
      "description": "Te quedaste jugando con los pibes en vez de ir a entrenar con el club."
    },
    "pt-BR": {
      "name": "Matou o Treino",
      "description": "Passou o dia jogando na rua em vez de cumprir suas obrigações esportivas."
    },
    "fr-FR": {
      "name": "Entraînement Manqué",
      "description": "Vous avez passé la journée à jouer dehors au lieu d'honorer vos obligations."
    }
  },
  "card-street-no_structure": {
    "en-GB": {
      "name": "No Structure",
      "description": "Without organized coaching, some fundamentals developed slower."
    },
    "es-ES": {
      "name": "Sin Formación Táctica",
      "description": "Nadie te estaba enseñando los fundamentos del fútbol organizado y colectivo."
    },
    "es-AR": {
      "name": "Sin Formación Táctica",
      "description": "Nadie te enseñaba los conceptos básicos del fútbol ordenado y federado."
    },
    "pt-BR": {
      "name": "Sem Base Tática",
      "description": "Ninguém estava ensinando os fundamentos táticos do futebol organizado."
    },
    "fr-FR": {
      "name": "Manque d'Encadrement",
      "description": "Personne ne vous apprenait les bases du jeu collectif et structuré."
    }
  },
  "card-street-overshadowed": {
    "en-GB": {
      "name": "Overshadowed",
      "description": "Another player received the attention you wanted."
    },
    "es-ES": {
      "name": "Eclipsado",
      "description": "Otro chico del barrio se llevó todos los elogios que tú sentías merecer."
    },
    "es-AR": {
      "name": "Opacado",
      "description": "Otro pibe del barrio se llevó los elogios que te correspondían a vos."
    },
    "pt-BR": {
      "name": "Ofuscado",
      "description": "Outro boleiro do bairro recebeu os elogios que você achava que merecia."
    },
    "fr-FR": {
      "name": "Dans l'Ombre",
      "description": "Un autre joueur du quartier a récolté tous les éloges que vous méritiez."
    }
  },
  "card-street-bad_habits": {
    "en-GB": {
      "name": "Bad Habits",
      "description": "You developed habits that affected your preparation."
    },
    "es-ES": {
      "name": "Malos Hábitos",
      "description": "Adquiriste costumbres que sirven en la calle pero perjudican en el fútbol federado."
    },
    "es-AR": {
      "name": "Malas Costumbres",
      "description": "Agarraste mañas que rinden en el potrero pero restan en el fútbol profesional."
    },
    "pt-BR": {
      "name": "Maus Costumes",
      "description": "Pegou manias que funcionam na rua mas atrapalham no futebol profissional."
    },
    "fr-FR": {
      "name": "Mauvaises Habitudes",
      "description": "De mauvaises habitudes efficaces dans la rue mais pénalisantes en club."
    }
  },
  "card-street-street_trouble": {
    "en-GB": {
      "name": "Street Trouble",
      "description": "A fight outside football affected your image."
    },
    "es-ES": {
      "name": "Problemas Callejeros",
      "description": "Te viste envuelto en altercados que no tenían nada que ver con el fútbol."
    },
    "es-AR": {
      "name": "Lío Callejero",
      "description": "Te metiste en una bronca que nada tenía que ver con la pelota."
    },
    "pt-BR": {
      "name": "Confusão na Rua",
      "description": "Acabou envolvido em confusões fora de campo que nada tinham a ver com a bola."
    },
    "fr-FR": {
      "name": "Ennuis de Rue",
      "description": "Vous vous êtes retrouvé mêlé à des histoires n'ayant rien à voir avec le ballon."
    }
  },
  "card-street-bad_fields": {
    "en-GB": {
      "name": "Bad Fields",
      "description": "Poor playing conditions limited your technical growth."
    },
    "es-ES": {
      "name": "Malos Terrenos",
      "description": "Baches y superficies irregulares dificultaron el desarrollo de una técnica limpia."
    },
    "es-AR": {
      "name": "Canchas con Pozos",
      "description": "Canchas desparejas y con pozos complicaron pulir la técnica de pase."
    },
    "pt-BR": {
      "name": "Campos Esburacados",
      "description": "Buracos e terrenos ruins dificultaram o desenvolvimento de uma técnica refinada."
    },
    "fr-FR": {
      "name": "Terrains Dégradés",
      "description": "Nids-de-poule et bosses ont compliqué le développement d'un jeu fluide."
    }
  },
  "card-street-divided_focus": {
    "en-GB": {
      "name": "Divided Focus",
      "description": "You had less time to dedicate fully to football."
    },
    "es-ES": {
      "name": "Foco Dividido",
      "description": "Demasiadas distracciones cotidianas desviaron tu concentración de la mejora deportiva."
    },
    "es-AR": {
      "name": "Foco Disperso",
      "description": "Demasiadas cosas cotidianas te sacaron el foco de seguir progresando."
    },
    "pt-BR": {
      "name": "Foco Dividido",
      "description": "Muitas distrações do dia a dia tirando seu foco de evoluir no futebol."
    },
    "fr-FR": {
      "name": "Attention Dispersée",
      "description": "Trop de sollicitations extérieures vous détournant de votre progression sportive."
    }
  },
  "card-street-playing_injured": {
    "en-GB": {
      "name": "Playing Injured",
      "description": "You ignored pain and kept playing."
    },
    "es-ES": {
      "name": "Jugando con Molestias",
      "description": "Seguiste jugando cuando el cuerpo te pedía a gritos descansar."
    },
    "es-AR": {
      "name": "Jugando Tocado",
      "description": "Seguiste jugando con molestias cuando tendrías que haber parado."
    },
    "pt-BR": {
      "name": "Jogando Machucado",
      "description": "Continuou em campo quando o corpo pedia repouso imediato."
    },
    "fr-FR": {
      "name": "Jouer Blessé",
      "description": "Vous avez continué à jouer alors que votre corps réclamait du repos."
    }
  },
  "card-street-street_warrior": {
    "en-GB": {
      "name": "Street Warrior",
      "description": "You survived every challenge by becoming physically stronger."
    },
    "es-ES": {
      "name": "Guerrero del Asfalto",
      "description": "Aprendiste a utilizar tu cuerpo y luchar cada balón como si fuera el último."
    },
    "es-AR": {
      "name": "Guerrero del Potrero",
      "description": "Aprendiste a poner el cuerpo y trabar cada pelota a muerte."
    },
    "pt-BR": {
      "name": "Guerreiro de Rua",
      "description": "Aprendeu a usar o corpo e disputar cada bola com alma e garra."
    },
    "fr-FR": {
      "name": "Guerrier du Bitume",
      "description": "Vous avez appris à utiliser votre corps et batailler sur chaque ballon."
    }
  },
  "card-street-street_magician": {
    "en-GB": {
      "name": "Street Magician",
      "description": "You became impossible to predict but ignored simple football."
    },
    "es-ES": {
      "name": "Mago Callejero",
      "description": "Desarrollaste un regate impredecible que los defensas rivales jamás logran anticipar."
    },
    "es-AR": {
      "name": "Mago del Potrero",
      "description": "Desarrollaste una gambeta indescifrable que vuelve locos a los defensores."
    },
    "pt-BR": {
      "name": "Mágico da Rua",
      "description": "Desenvolveu um estilo de drible imprevisível que zagueiro nenhum consegue ler."
    },
    "fr-FR": {
      "name": "Magicien du Bitume",
      "description": "Un style de dribble déroutant et totalement illisible pour les défenseurs adverses."
    }
  },
  "card-street-speed_demon": {
    "en-GB": {
      "name": "Speed Demon",
      "description": "You focused everything on explosive acceleration."
    },
    "es-ES": {
      "name": "Demonio de la Velocidad",
      "description": "Te enfocaste en ser el jugador más veloz y explosivo sobre el terreno de juego."
    },
    "es-AR": {
      "name": "Flecha Imparable",
      "description": "Te enfocaste en tener un pique corto letal e inalcanzable para cualquiera."
    },
    "pt-BR": {
      "name": "Demônio da Velocidade",
      "description": "Focou em ser o jogador mais rápido e explosivo dentro de campo."
    },
    "fr-FR": {
      "name": "Bolide des Rues",
      "description": "Vous avez tout misé sur une pointe de vitesse fulgurante et dévastatrice."
    }
  },
  "card-street-shoot_first": {
    "en-GB": {
      "name": "Shoot First",
      "description": "You always searched for the decisive shot."
    },
    "es-ES": {
      "name": "Gatillo Rápido",
      "description": "Siempre buscas portería, a veces pecando de individualista ante tus compañeros."
    },
    "es-AR": {
      "name": "Pateador Nato",
      "description": "Siempre buscás el arco, a veces olvidándote de tocarla a los que entran solos."
    },
    "pt-BR": {
      "name": "Chuta Primeiro",
      "description": "Sempre procurando o gol, às vezes esquecendo de tocar para os companheiros."
    },
    "fr-FR": {
      "name": "Frappe d'Abord",
      "description": "Toujours en quête du tir au but, parfois au détriment du jeu collectif."
    }
  },
  "card-street-street_defender": {
    "en-GB": {
      "name": "Street Defender",
      "description": "You learned that stopping opponents mattered more than creating highlights."
    },
    "es-ES": {
      "name": "Cerrojo Callejero",
      "description": "Aprendiste que frenar a los rivales vale tanto como regatearlos."
    },
    "es-AR": {
      "name": "Rústico del Potrero",
      "description": "Aprendiste que anticipar al rival y cortarlo vale tanto como tirar un sombrero."
    },
    "pt-BR": {
      "name": "Zagueiro Cascudo",
      "description": "Aprendeu que desarmar o adversário tem tanto valor quanto driblá-lo."
    },
    "fr-FR": {
      "name": "Défenseur Rugueux",
      "description": "Vous avez compris que stopper net un attaquant vaut autant que marquer."
    }
  },
  "card-street-street_scout": {
    "en-GB": {
      "name": "Street Scout",
      "description": "A professional scout discovered you while watching a street match. Your talent was impossible to ignore."
    },
    "es-ES": {
      "name": "Ojeador en el Asfalto",
      "description": "Un ojeador federado estuvo observando un partido en el que brillaste."
    },
    "es-AR": {
      "name": "Ojeador en el Potrero",
      "description": "Un captador de talentos estuvo en la tribuna mirando tu picado."
    },
    "pt-BR": {
      "name": "Olheiro na Várzea",
      "description": "Um olheiro profissional estava de olho em uma pelada em que você jogou."
    },
    "fr-FR": {
      "name": "Recruteur de Quartier",
      "description": "Un recruteur a assisté discrètement à l'un de vos matchs sauvages."
    }
  },
  "card-street-trivela": {
    "en-GB": {
      "name": "Trivela",
      "description": "You learned you don't need your weak foot at all, you mastered your outside foot technique."
    },
    "es-ES": {
      "name": "Trivela",
      "description": "Aprendiste a golpear con el exterior de tu bota para no depender de tu pierna mala."
    },
    "es-AR": {
      "name": "Tres Dedos Magistral",
      "description": "Le pegás de tres dedos para no tener que acomodarte con la pierna inhábil."
    },
    "pt-BR": {
      "name": "Trivela Clássica",
      "description": "Aprendeu a chutar de três dedos para compensar a perna fraca."
    },
    "fr-FR": {
      "name": "Trivela",
      "description": "Vous maîtrisez l'extérieur du pied pour pallier l'usage de votre mauvais pied."
    }
  },
  "card-street-temp-positive-1": {
    "en-GB": {
      "name": "Cage Tour Domination",
      "description": "An unstoppable 6-month run across urban street tournaments gives you god-tier swagger on the ball."
    },
    "es-ES": {
      "name": "Dominio en las Jaulas",
      "description": "Racha invicta de 6 meses dominando torneos callejeros en jaulas de cemento."
    },
    "es-AR": {
      "name": "Amo de las Jaulas",
      "description": "Seis meses invicto dominando canchas enrejadas en los picados más picantes."
    },
    "pt-BR": {
      "name": "Soberania na Gaiola",
      "description": "Sequência invicta de 6 meses reinando nos torneios clandestinos de rua."
    },
    "fr-FR": {
      "name": "Domination de la Cage",
      "description": "Règne d'invincibilité de 6 mois dans les tournois urbains en cage."
    }
  },
  "card-street-temp-negative-1": {
    "en-GB": {
      "name": "Asphalt Bruised Knee & Ankles",
      "description": "Hard pavement impacts take their toll, leaving severe joint inflammation for the next 6 months."
    },
    "es-ES": {
      "name": "Rodillas y Tobillos Magullados",
      "description": "El impacto constante contra el hormigón pasa factura con inflamaciones articulares durante 6 meses."
    },
    "es-AR": {
      "name": "Articulaciones Golpeadas por Cemento",
      "description": "Los porrazos contra el cemento te dejan rodillas y tobillos inflamados durante 6 meses."
    },
    "pt-BR": {
      "name": "Joelhos e Tornozelos Ralados",
      "description": "O impacto no chão duro cobra a conta com dores articulares e inchaço nos próximos 6 meses."
    },
    "fr-FR": {
      "name": "Articulations Meurtries par le Bitume",
      "description": "Les réceptions sur le béton provoquent des inflammations articulaires durant 6 mois."
    }
  },
  "card-street-temp-double-1": {
    "en-GB": {
      "name": "Underground Cage King",
      "description": "You become an undisputed street legend for 1 year, trading off-pitch discipline and locker room peace for insane raw flair."
    },
    "es-ES": {
      "name": "Rey Clandestino de la Jaula",
      "description": "Te conviertes en leyenda urbana durante 1 año, canjeando disciplina táctica por una fantasía callejera brutal."
    },
    "es-AR": {
      "name": "Leyenda del Potrero Nocturno",
      "description": "Sos leyenda del barrio por 1 año, canjeando disciplina táctica por magia pura de potrero."
    },
    "pt-BR": {
      "name": "Rei Clandestino da Gaiola",
      "description": "Você vira lenda urbana por 1 ano, trocando disciplina por um futebol de rua espetacular."
    },
    "fr-FR": {
      "name": "Roi Clandestin de la Cage",
      "description": "Légende vivante des cages pendant 1 an, troquant la discipline pour un génie brut de rue."
    }
  },
  "card-youth-yc-pos-overflow-chem": {
    "en-GB": {
      "name": "Overflow Chemistry Surge",
      "description": "An electrifying surge of squad bonding and locker room cohesion pushes team synergy beyond normal limits into Overflow Chemistry (+1 stat bonus to all attributes per 1% overflow)!"
    },
    "es-ES": {
      "name": "Oleada de Química Desbordante",
      "description": "El entrenamiento táctico intensivo y la camaradería juvenil impulsan la química del equipo por encima del límite estándar."
    },
    "es-AR": {
      "name": "Explosión de Química Desbordante",
      "description": "El trabajo táctico en juveniles y la unión del grupo disparan la química de equipo por encima del tope habitual."
    },
    "pt-BR": {
      "name": "Surto de Entrosamento Transbordante",
      "description": "O entrosamento nas categorias de base e a união do elenco elevam a química do time além do limite convencional."
    },
    "fr-FR": {
      "name": "Afflux de Chimie Débordante",
      "description": "L'entraînement tactique intensif et la cohésion d'équipe propulsent l'affinité collective bien au-delà de la limite habituelle."
    }
  },
  "card-youth-yc-pos-01": {
    "en-GB": {
      "name": "Academy Finisher",
      "description": "Your training sessions begin to focus heavily on finishing and movement inside the box."
    },
    "es-ES": {
      "name": "Definidor de Cantera",
      "description": "Horas extra practicando la definición en la academia te convierten en un rematador letal dentro del área."
    },
    "es-AR": {
      "name": "Goleador de Inferiores",
      "description": "Horas y horas definiendo en inferiores te transforman en un definidor clínico mano a mano."
    },
    "pt-BR": {
      "name": "Finalizador da Base",
      "description": "Horas extras de finalização na base transformam você em um matador implacável dentro da área."
    },
    "fr-FR": {
      "name": "Buteur du Centre de Formation",
      "description": "Des heures supplémentaires de finition au centre de formation font de vous un finisseur clinique."
    }
  },
  "card-youth-yc-pos-02": {
    "en-GB": {
      "name": "Speed Merchant",
      "description": "Speed drills and sprint technique coaching sharpen your acceleration on the wing."
    },
    "es-ES": {
      "name": "Velocista de Banda",
      "description": "Una zancada imparable y un cambio de ritmo supersónico que desarbolan cualquier repliegue rival."
    },
    "es-AR": {
      "name": "Velocista Imparable",
      "description": "Una potencia de arranque y pique supersónico que dejan parados a los laterales contrarios."
    },
    "pt-BR": {
      "name": "Flecha do Ataque",
      "description": "Arranque explosivo e velocidade estonteante que destroem qualquer linha defensiva."
    },
    "fr-FR": {
      "name": "Flèche Offensive",
      "description": "Une accélération foudroyante et une pointe de vitesse qui déstabilisent toute défense adverse."
    }
  },
  "card-youth-yc-pos-03": {
    "en-GB": {
      "name": "Midfield Maestro",
      "description": "Hours spent on passing grids improve your vision and ball distribution."
    },
    "es-ES": {
      "name": "Director de Orquesta",
      "description": "Una visión panorámica prodigiosa que marca el tempo del partido con pases milimétricos."
    },
    "es-AR": {
      "name": "Patrón del Medio",
      "description": "Una claridad mental y panorama de juego que manejan los hilos y ritmos del partido."
    },
    "pt-BR": {
      "name": "Maestro do Meio-Campo",
      "description": "Visão de jogo privilegiada ditando o ritmo da partida com passes teleguiados."
    },
    "fr-FR": {
      "name": "Chef d'Orchestre du Milieu",
      "description": "Une vision de jeu exceptionnelle qui dicte le tempo du match par des passes millimétrées."
    }
  },
  "card-youth-yc-pos-04": {
    "en-GB": {
      "name": "Rock at the Back",
      "description": "Physical battles against older youth forwards forge a formidable defensive monster."
    },
    "es-ES": {
      "name": "Muralla Defensiva",
      "description": "Una colocación defensiva inquebrantable y contundencia en cada duelo individual."
    },
    "es-AR": {
      "name": "Roca en el Fondo",
      "description": "Anticipación firme, cruces salvadores y presencia física imponente en la última línea."
    },
    "pt-BR": {
      "name": "Xerife da Zaga",
      "description": "Posicionamento impecável e imposição física absoluta em cada dividida defensiva."
    },
    "fr-FR": {
      "name": "Roc Défensif",
      "description": "Un sens du placement irréprochable et une autorité intraitable dans chaque duel défensif."
    }
  },
  "card-youth-yc-pos-05": {
    "en-GB": {
      "name": "Aerial Dominator",
      "description": "Mastering jump timing and header direction makes you dangerous on set pieces."
    },
    "es-ES": {
      "name": "Dominador Aéreo",
      "description": "Salto imperial y remate de cabeza contundente para imponerse en ambas áreas."
    },
    "es-AR": {
      "name": "Rey del Juego Aéreo",
      "description": "Un cabezazo demoledor y salto con suspensión para ganar de arriba en las dos áreas."
    },
    "pt-BR": {
      "name": "Gigante do Ar",
      "description": "Impulsão impressionante e cabeceio certeiro para dominar as jogadas aéreas nas duas áreas."
    },
    "fr-FR": {
      "name": "Dominateur Aérien",
      "description": "Une détente verticale impressionnante et un coup de tête tranchant dans les deux surfaces."
    }
  },
  "card-youth-yc-pos-06": {
    "en-GB": {
      "name": "Dribbling Wizard",
      "description": "Tight-space cone drills grant exceptional footwork to glide past defenders."
    },
    "es-ES": {
      "name": "Mago del Regate",
      "description": "Desborde eléctrico en una baldosa y cambios de dirección imposibles de descifrar."
    },
    "es-AR": {
      "name": "Fenómeno de la Gambeta",
      "description": "Gambeta corta indescifrable, freno y arranque que dejan sentado a cualquier defensor."
    },
    "pt-BR": {
      "name": "Mágico do Drible",
      "description": "Controle de bola fantástico e dribles desconcertantes em espaços minúsculos."
    },
    "fr-FR": {
      "name": "Magicien du Dribble",
      "description": "Un toucher de velours et des feintes imprévisibles dans les petits espaces."
    }
  },
  "card-youth-yc-pos-07": {
    "en-GB": {
      "name": "Cross Specialist",
      "description": "Whipped deliveries into the penalty box become your signature weapon."
    },
    "es-ES": {
      "name": "Especialista en Centros",
      "description": "Pone balones teledirigidos con rosca tensa directo a la cabeza de los delanteros."
    },
    "es-AR": {
      "name": "Precisión de Centro",
      "description": "Centros con comba perfecta y efecto veneno justo a la carrera del 9."
    },
    "pt-BR": {
      "name": "Especialista em Cruzamentos",
      "description": "Cruzamentos com curva açucarada na medida certa para a finalização dos atacantes."
    },
    "fr-FR": {
      "name": "Spécialiste des Centres",
      "description": "Des trajectoires brossées au cordeau qui déposent le ballon sur la tête des attaquants."
    }
  },
  "card-youth-yc-pos-08": {
    "en-GB": {
      "name": "Long Shot Screamer",
      "description": "Developing leg power allows you to threaten goal from well outside the penalty arc."
    },
    "es-ES": {
      "name": "Cañón de Larga Distancia",
      "description": "Un disparo devastador desde media distancia capaz de romper redes y sorprender al portero."
    },
    "es-AR": {
      "name": "Bombazo desde Afuera",
      "description": "Un zapatazo infernal de afuera del área que baja de golpe y vence a cualquier arquero."
    },
    "pt-BR": {
      "name": "Bomba de Fora da Área",
      "description": "Chute potente de longa distância que estufa as redes e surpreende qualquer goleiro."
    },
    "fr-FR": {
      "name": "Missile Lointain",
      "description": "Une frappe supersonique à mi-distance qui surprend les gardiens les plus vigilants."
    }
  },
  "card-youth-yc-pos-09": {
    "en-GB": {
      "name": "Tactical Mastermind",
      "description": "Studying video footage helps you anticipate opponent movements before they happen."
    },
    "es-ES": {
      "name": "Cerebro Táctico",
      "description": "Capacidad innata para interpretar sistemas tácticos complejos y anticipar las transiciones del rival."
    },
    "es-AR": {
      "name": "Estratega Táctico",
      "description": "Lectura cerebral de los movimientos del rival, anticipando cada transición ofensiva y defensiva."
    },
    "pt-BR": {
      "name": "Mente Tática",
      "description": "Capacidade brilhante de entender esquemas táticos e antecipar jogadas do adversário."
    },
    "fr-FR": {
      "name": "Stratège Tactique",
      "description": "Intelligence situationnelle remarquable pour décrypter les schémas adverses et anticiper les transitions."
    }
  },
  "card-youth-yc-pos-10": {
    "en-GB": {
      "name": "Iron Lung",
      "description": "Relentless endurance conditioning enables you to press high for all 90 minutes."
    },
    "es-ES": {
      "name": "Pulmón de Hierro",
      "description": "Capacidad aeróbica insaciable que te permite presionar, bajar a defender y llegar al área durante los 90 minutos."
    },
    "es-AR": {
      "name": "Pulmones de Acero",
      "description": "Un despliegue físico conmovedor de área a área sin bajar el ritmo hasta el pitazo final."
    },
    "pt-BR": {
      "name": "Pulmão de Aço",
      "description": "Resistência aeróbica fora do comum para correr e marcar de área a área o jogo inteiro."
    },
    "fr-FR": {
      "name": "Poumons d'Acier",
      "description": "Un volume de course inépuisable capable de répéter les efforts d'une surface à l'autre pendant 90 minutes."
    }
  },
  "card-youth-yc-pos-11": {
    "en-GB": {
      "name": "Pressing Monster",
      "description": "Reading opponent passing lanes lets you snap up loose balls effortlessly."
    },
    "es-ES": {
      "name": "Monstruo de la Presión",
      "description": "Acoso asfixiante al poseedor del balón que provoca pérdidas y recuperaciones en campo contrario."
    },
    "es-AR": {
      "name": "Fiera de la Presión",
      "description": "Presión alta implacable sobre la salida rival que fuerza errores en zona de peligro."
    },
    "pt-BR": {
      "name": "Monstro da Pressão",
      "description": "Marcação sob pressão sufocante que força erros na saída de bola dos adversários."
    },
    "fr-FR": {
      "name": "Monstre du Pressing",
      "description": "Un harcèlement étouffant sur le porteur du ballon qui provoque des récupérations hautes."
    }
  },
  "card-youth-yc-pos-12": {
    "en-GB": {
      "name": "Ice in the Veins",
      "description": "Staying calm under heavy pressure prevents mistakes in high-stakes situations."
    },
    "es-ES": {
      "name": "Hielo en las Venas",
      "description": "Calma olímpica en los momentos decisivos bajo máxima presión ambiental."
    },
    "es-AR": {
      "name": "Sangre Fría",
      "description": "Paz interior absoluta para definir penales y jugadas calientes en el último minuto."
    },
    "pt-BR": {
      "name": "Frieza nos Nervos",
      "description": "Tranquilidade absoluta sob pressão máxima nos momentos cruciais da partida."
    },
    "fr-FR": {
      "name": "Sang-Froid Absolu",
      "description": "Une sérénité totale sous très haute pression lors des moments les plus décisifs."
    }
  },
  "card-youth-yc-pos-13": {
    "en-GB": {
      "name": "Ball Retention Specialist",
      "description": "Using body shielding ensures opponents cannot strip the ball from you easily."
    },
    "es-ES": {
      "name": "Especialista en Retención",
      "description": "Uso magistral del cuerpo y la suela para esconder el balón y oxigenar al equipo."
    },
    "es-AR": {
      "name": "Aguante de Pelota",
      "description": "Uso del cuerpo y la pisada para aguantar de espaldas y descargar limpio hacia los volantes."
    },
    "pt-BR": {
      "name": "Especialista em Proteger a Bola",
      "description": "Proteção de bola de costas impecável usando o corpo para ganhar tempo e desafogar o time."
    },
    "fr-FR": {
      "name": "Conservation de Balle",
      "description": "Utilisation parfaite du corps pour protéger le ballon dos au jeu et faire remonter le bloc."
    }
  },
  "card-youth-yc-pos-14": {
    "en-GB": {
      "name": "Lightning Reflexes",
      "description": "Split-second instinctive reactions allow quick responses to deflections and loose balls."
    },
    "es-ES": {
      "name": "Reflejos Felinos",
      "description": "Tiempos de reacción instantáneos ante rechaces y balones sueltos en el área chica."
    },
    "es-AR": {
      "name": "Reflejos Eléctricos",
      "description": "Reacción supersónica para cazar rebotes y anticipar a defensores en una milésima de segundo."
    },
    "pt-BR": {
      "name": "Reflexos Relâmpago",
      "description": "Tempo de reação fulminante para antecipar qualquer sobra de bola dentro da área."
    },
    "fr-FR": {
      "name": "Réflexes Éclairs",
      "description": "Temps de réaction foudroyant pour bondir sur les seconds ballons dans la surface."
    }
  },
  "card-youth-yc-pos-15": {
    "en-GB": {
      "name": "Playmaker Genius",
      "description": "Unlocking defense-splitting long passes transforms your team’s transitions."
    },
    "es-ES": {
      "name": "Genio Creador",
      "description": "Imaginación pura para filtrar balones inverosímiles entre líneas defensivas cerradas."
    },
    "es-AR": {
      "name": "Generador de Juego",
      "description": "Imaginación desbordante para meter pases filtrados donde nadie ve un espacio."
    },
    "pt-BR": {
      "name": "Gênio da Criação",
      "description": "Criatividade pura para quebrar defesas fechadas com passes verticais desconcertantes."
    },
    "fr-FR": {
      "name": "Créateur de Génie",
      "description": "Créativité pure pour distiller des ballons d'une précision chirurgicale entre les lignes."
    }
  },
  "card-youth-yc-pos-16": {
    "en-GB": {
      "name": "Training Hard",
      "description": "Relentless extra hours on the training ground grant you versatile development stat points to allocate freely."
    },
    "es-ES": {
      "name": "Entrenamiento a Fondo",
      "description": "Dedicación obsesiva y máxima intensidad en cada sesión de trabajo matutino."
    },
    "es-AR": {
      "name": "Matarse Entrenando",
      "description": "Actitud intachable y entrega total en cada ejercicio de la pretemporada."
    },
    "pt-BR": {
      "name": "Foco Total no Treino",
      "description": "Dedicação disciplinada e entrega máxima em cada sessão de treinamento."
    },
    "fr-FR": {
      "name": "Acharnement à l'Entraînement",
      "description": "Implication totale et débauche d'énergie à chaque séance de travail."
    }
  },
  "card-youth-yc-neg-01": {
    "en-GB": {
      "name": "Training Injury",
      "description": "A training injury keeps you from developing normally."
    },
    "es-ES": {
      "name": "Lesión de Entrenamiento",
      "description": "Un golpe desafortunado durante una sesión táctica frena temporalmente tu progresión."
    },
    "es-AR": {
      "name": "Lesión en la Práctica",
      "description": "Un choque duro en la práctica te deja con molestias físicas y frena tu ritmo."
    },
    "pt-BR": {
      "name": "Lesão no Treino",
      "description": "Uma pancada feia no coletivo causa dores e interrompe temporariamente sua evolução."
    },
    "fr-FR": {
      "name": "Blessure à l'Entraînement",
      "description": "Un choc regrettable à l'entraînement freine momentanément votre montée en puissance."
    }
  },
  "card-youth-yc-neg-02": {
    "en-GB": {
      "name": "Broke Boots",
      "description": "Your equipment is falling apart and replacing it costs more than expected."
    },
    "es-ES": {
      "name": "Botas Rotas",
      "description": "Rotura imprevista de tu calzado preferido antes de un partido crucial de cantera."
    },
    "es-AR": {
      "name": "Botines Deshechos",
      "description": "Se abrieron los botines regalones justo en la previa de un clásico de inferiores."
    },
    "pt-BR": {
      "name": "Chuteiras Furadas",
      "description": "Abertura repentina da sua chuteira favorita antes de uma partida decisiva da base."
    },
    "fr-FR": {
      "name": "Crampons Déchirés",
      "description": "Rupture inopinée de vos crampons fétiches juste avant un match capital."
    }
  },
  "card-youth-yc-neg-03": {
    "en-GB": {
      "name": "Locker Room Conflict",
      "description": "An argument with teammates damages the atmosphere around you."
    },
    "es-ES": {
      "name": "Conflicto en el Vestuario",
      "description": "Disputa acalorada con un compañero de equipo que tensa el ambiente colectivo."
    },
    "es-AR": {
      "name": "Bronca en el Vestuario",
      "description": "Fuerte cruce de palabras con un compañero que calienta el clima del plantel."
    },
    "pt-BR": {
      "name": "Racha no Vestiário",
      "description": "Discussão áspera com um companheiro de time que prejudica o ambiente do grupo."
    },
    "fr-FR": {
      "name": "Tension dans le Vestiaire",
      "description": "Une altercation animée avec un partenaire détériore l'harmonie du groupe."
    }
  },
  "card-youth-yc-neg-04": {
    "en-GB": {
      "name": "Media Distraction",
      "description": "Unwanted early media noise disrupts your focus and hurts your composure."
    },
    "es-ES": {
      "name": "Ruido Mediático Temprano",
      "description": "Titulares prematuros en prensa generan distracciones y expectativas desmedidas."
    },
    "es-AR": {
      "name": "Distracción con la Prensa",
      "description": "Elogios desmedidos en los diarios desvían la concentración en el entrenamiento diario."
    },
    "pt-BR": {
      "name": "Distração da Mídia",
      "description": "Manchetes antecipadas na imprensa geram desfoque e cobrança exagerada."
    },
    "fr-FR": {
      "name": "Distraction Médiatique",
      "description": "Une surexposition précoce dans les médias perturbe votre concentration quotidienne."
    }
  },
  "card-youth-yc-neg-05": {
    "en-GB": {
      "name": "Bad Reputation Spike",
      "description": "On-pitch arguments lead to booking warnings and a rising bad reputation."
    },
    "es-ES": {
      "name": "Pico de Mala Fama",
      "description": "Un mal gesto hacia la afición o el árbitro provoca críticas generalizadas."
    },
    "es-AR": {
      "name": "Fama Conflictiva",
      "description": "Un berrinche en la cancha te genera mala fama entre los árbitros y formadores."
    },
    "pt-BR": {
      "name": "Fama de Encrenqueiro",
      "description": "Uma atitude impulsiva em campo atrai críticas e gera antipatia da arbitragem."
    },
    "fr-FR": {
      "name": "Mauvaise Réputation",
      "description": "Un écart de conduite sur le terrain vous attire de vives critiques des observateurs."
    }
  },
  "card-youth-yc-neg-06": {
    "en-GB": {
      "name": "Growth Stagnation",
      "description": "A slump in form leads to tactical doubts and loss of confidence."
    },
    "es-ES": {
      "name": "Estancamiento de Crecimiento",
      "description": "Meseta en el desarrollo físico y técnico que merma temporalmente la confianza."
    },
    "es-AR": {
      "name": "Bajón de Rendimiento",
      "description": "Una meseta en el rendimiento que te genera dudas sobre tu crecimiento deportivo."
    },
    "pt-BR": {
      "name": "Queda de Rendimento",
      "description": "Queda temporária de rendimento físico e técnico que afeta sua autoconfiança."
    },
    "fr-FR": {
      "name": "Baisse de Régime",
      "description": "Une phase de stagnation physique et technique qui ébranle temporairement votre confiance."
    }
  },
  "card-youth-yc-neg-07": {
    "en-GB": {
      "name": "Overtired & Sluggish",
      "description": "Back-to-back fixture congestion drains your physical speed and energy."
    },
    "es-ES": {
      "name": "Sobrecarga y Fatiga",
      "description": "Acumulación de partidos y entrenamientos que dejan las piernas pesadas."
    },
    "es-AR": {
      "name": "Piernas Pesadas y Cansancio",
      "description": "Exceso de minutos en juveniles que te deja sin chispa en los partidos de fin de semana."
    },
    "pt-BR": {
      "name": "Exaustão e Pernas Pesadas",
      "description": "Desgaste muscular acumulado de treinos e jogos deixando o corpo pesado."
    },
    "fr-FR": {
      "name": "Épuisement Physique",
      "description": "Une accumulation de fatigue musculaire qui émousse votre explosivité en match."
    }
  },
  "card-youth-yc-neg-08": {
    "en-GB": {
      "name": "Tactical Confusion",
      "description": "Changing tactical instructions leaves you uncertain about your movement."
    },
    "es-ES": {
      "name": "Desconcierto Táctico",
      "description": "Dificultades para asimilar un nuevo sistema táctico implementado por el entrenador."
    },
    "es-AR": {
      "name": "Dudas Tácticas",
      "description": "Cambio brusco de esquema táctico que te hace dudar de tus movimientos en la cancha."
    },
    "pt-BR": {
      "name": "Dúvidas Táticas",
      "description": "Dificuldade para se adaptar a uma nova formação tática escalada pelo treinador."
    },
    "fr-FR": {
      "name": "Confusion Tactique",
      "description": "Des difficultés à intégrer les nouvelles consignes et variations de schéma tactique."
    }
  },
  "card-youth-yc-neg-09": {
    "en-GB": {
      "name": "Ankle Sprain",
      "description": "A sharp twist in training hampers your mobility and dribbling confidence."
    },
    "es-ES": {
      "name": "Esguince de Tobillo",
      "description": "Una torcedura dolorosa al pisar mal el césped te obliga a guardar reposo."
    },
    "es-AR": {
      "name": "Torcedura de Tobillo",
      "description": "Una mala pisada en una jugada dividida te deja con el tobillo hinchado."
    },
    "pt-BR": {
      "name": "Entorse de Tornozelo",
      "description": "Uma torção dolorosa no tornozelo obriga você a fazer repouso e fisioterapia."
    },
    "fr-FR": {
      "name": "Entorse de la Cheville",
      "description": "Une torsion brutale de la cheville vous contraint à quelques jours d'indisponibilité."
    }
  },
  "card-youth-yc-neg-10": {
    "en-GB": {
      "name": "Manager Doghouse",
      "description": "Disagreeing with the youth coach drops your standing in the team."
    },
    "es-ES": {
      "name": "En la Nevera del Míster",
      "description": "Pérdida de minutos por discrepancias técnicas o tácticas con el cuerpo técnico."
    },
    "es-AR": {
      "name": "Castigado por el DT",
      "description": "El director técnico te sienta en el banco por no cumplir sus órdenes tácticas."
    },
    "pt-BR": {
      "name": "Na Geladeira do Técnico",
      "description": "Perda de espaço no time titular por discordâncias táticas com a comissão."
    },
    "fr-FR": {
      "name": "En Disgrâce auprès du Coach",
      "description": "Mis à l'écart du onze de départ à la suite de divergences tactiques avec l'entraîneur."
    }
  },
  "card-youth-yc-de-01": {
    "en-GB": {
      "name": "Obsessed with Training",
      "description": "You train harder than everyone else, but your body struggles to recover."
    },
    "es-ES": {
      "name": "Obsesión con el Gimnasio",
      "description": "Aumento notable de potencia física a costa de una pérdida temporal de flexibilidad y agilidad."
    },
    "es-AR": {
      "name": "Obsesión por los Fierros",
      "description": "Ganancia de masa y potencia muscular a cambio de perder algo de agilidad y cintura."
    },
    "pt-BR": {
      "name": "Treino Físico Obsessivo",
      "description": "Ganho acentuado de força física à custa de leve perda de mobilidade e leveza."
    },
    "fr-FR": {
      "name": "Obsession de la Musculation",
      "description": "Gain net de puissance musculaire au détriment d'une légère perte d'élasticité et de vivacité."
    }
  },
  "card-youth-yc-de-02": {
    "en-GB": {
      "name": "Shooting Addict",
      "description": "You stay after every session practicing your finishing, but your passing development suffers."
    },
    "es-ES": {
      "name": "Adicto al Remate",
      "description": "Confianza desmedida en el disparo a puerta que sacrifica opciones de pase más claras."
    },
    "es-AR": {
      "name": "Obsesión por el Gol",
      "description": "Pateás al arco desde cualquier lado con confianza, sacrificando a veces la descarga fácil."
    },
    "pt-BR": {
      "name": "Fominha de Finalização",
      "description": "Confiança nas alturas para chutar no gol, arriscando chutes mesmo com companheiros livres."
    },
    "fr-FR": {
      "name": "Acharné devant le But",
      "description": "Une propension accrue à tenter sa chance au but en oubliant parfois le coéquipier mieux démarqué."
    }
  },
  "card-youth-yc-de-03": {
    "en-GB": {
      "name": "Physical Development",
      "description": "You dedicate yourself to becoming physically dominant."
    },
    "es-ES": {
      "name": "Desarrollo Físico Masivo",
      "description": "Un crecimiento corporal acelerado que incrementa la fuerza pero requiere readaptar el centro de gravedad."
    },
    "es-AR": {
      "name": "Explosión de Fuerza",
      "description": "Un estirón físico que te da ventaja en el choque pero te hace sentir algo torpe al inicio."
    },
    "pt-BR": {
      "name": "Explosão Muscular",
      "description": "Desenvolvimento físico que aumenta a imponência em divididas, mas exige adaptação de postura."
    },
    "fr-FR": {
      "name": "Développement Physique",
      "description": "Une transformation morphologique qui renforce l'impact physique tout en nécessitant un temps d'ajustement moteur."
    }
  },
  "card-youth-yc-de-04": {
    "en-GB": {
      "name": "All-Out Attack",
      "description": "You throw yourself completely into offensive runs at the cost of your defensive work."
    },
    "es-ES": {
      "name": "Ataque Total",
      "description": "Vocación ofensiva permanente que desestabiliza a la defensa contraria pero desprotege la espalda."
    },
    "es-AR": {
      "name": "Todo al Ataque",
      "description": "Subida constante al ataque que crea peligro pero deja huecos a la espalda del lateral."
    },
    "pt-BR": {
      "name": "Ofensiva Total",
      "description": "Apoio constante ao ataque que cria chances, mas deixa espaços para contra-ataques."
    },
    "fr-FR": {
      "name": "Attaque à Tout Va",
      "description": "Une projection constante vers l'avant qui dynamise l'attaque mais expose les lignes arrière."
    }
  },
  "card-youth-yc-de-05": {
    "en-GB": {
      "name": "Defensive Obsession",
      "description": "You focus entirely on shutting down opponents, neglecting your goalscoring development."
    },
    "es-ES": {
      "name": "Obsesión Defensiva",
      "description": "Rigor y repliegue impecables pero con escasa iniciativa ofensiva."
    },
    "es-AR": {
      "name": "Enfoque Defensivo Absoluto",
      "description": "Concentración extrema en la marca que asegura el cero pero resta presencia en ataque."
    },
    "pt-BR": {
      "name": "Foco Defensivo Rígido",
      "description": "Marcação impecável e cobertura defensiva que garante segurança, mas diminui o apoio à frente."
    },
    "fr-FR": {
      "name": "Rigueur Défensive",
      "description": "Une discipline défensive de fer qui verrouille l'arrière-garde tout en limitant les montées."
    }
  },
  "card-youth-yc-ls-01": {
    "en-GB": {
      "name": "Teammate’s Family",
      "description": "You become close with one of your teammates and spend more time together outside training."
    },
    "es-ES": {
      "name": "Familia de Compañero",
      "description": "Vínculo afectivo con el entorno de otro canterano que proporciona apoyo y estabilidad emocional."
    },
    "es-AR": {
      "name": "Asado con Compañeros",
      "description": "Compartir asados con la familia de un compañero te da contención y estabilidad."
    },
    "pt-BR": {
      "name": "Amizade Familiar",
      "description": "Acolhimento da família de um parceiro de clube trazendo apoio e tranquilidade emocional."
    },
    "fr-FR": {
      "name": "Cercle Familial d'un Partenaire",
      "description": "L'accueil chaleureux des proches d'un coéquipier vous apporte un précieux équilibre émotionnel."
    }
  },
  "card-youth-yc-ls-02": {
    "en-GB": {
      "name": "Locker Room Favorite",
      "description": "Your personality makes you popular with the squad."
    },
    "es-ES": {
      "name": "Favorito del Vestuario",
      "description": "Carisma natural que une al grupo y eleva la moral de toda la plantilla juvenil."
    },
    "es-AR": {
      "name": "Querido en el Plantel",
      "description": "Tu buena onda y sentido del humor unen al grupo y mejoran la convivencia en la pensión."
    },
    "pt-BR": {
      "name": "Xodó do Vestiário",
      "description": "Simpatia e carisma contagiantes que unem o elenco jovem e melhoram o clima."
    },
    "fr-FR": {
      "name": "Chouchou du Vestiaire",
      "description": "Une joie de vivre communicative qui resserre les liens et galvanise le vestiaire."
    }
  },
  "card-youth-yc-ls-03": {
    "en-GB": {
      "name": "Weekend Job",
      "description": "You start earning a little money outside football, but it takes some time away from recovery."
    },
    "es-ES": {
      "name": "Trabajo de Fin de Semana",
      "description": "Una ocupación complementaria que forja disciplina financiera pero exige gestionar la energía."
    },
    "es-AR": {
      "name": "Changa de Fin de Semana",
      "description": "Un laburo temporal para costear botines que te enseña a valorar cada centavo."
    },
    "pt-BR": {
      "name": "Bico de Fim de Semana",
      "description": "Trabalho extra aos fins de semana que ensina valorização financeira e responsabilidade."
    },
    "fr-FR": {
      "name": "Petit Boulot du Week-end",
      "description": "Une activité d'appoint qui forge le sens des réalités tout en demandant une saine gestion d'énergie."
    }
  },
  "card-youth-yc-ls-04": {
    "en-GB": {
      "name": "Manager’s Favorite",
      "description": "The manager begins to trust you and takes a personal interest in your development."
    },
    "es-ES": {
      "name": "Ojo Derecho del Entrenador",
      "description": "La confianza absoluta del míster te garantiza continuidad y respaldo ante cualquier error."
    },
    "es-AR": {
      "name": "El Pollo del Técnico",
      "description": "El técnico de inferiores te tiene una fe ciega y te respalda en cada partido."
    },
    "pt-BR": {
      "name": "Queridinho do Treinador",
      "description": "Confiança total da comissão técnica garantindo sequência de jogos e aprendizado rápido."
    },
    "fr-FR": {
      "name": "Protégé du Manager",
      "description": "L'estime indéfectible du coach qui vous accorde un temps de jeu précieux et des conseils réguliers."
    }
  },
  "card-youth-yc-ls-05": {
    "en-GB": {
      "name": "Local Youth Star",
      "description": "Local news outlets run features on your progress, boosting your reputation."
    },
    "es-ES": {
      "name": "Promesa Local",
      "description": "Reconocimiento creciente de la comunidad vecinal que llena de orgullo a tu entorno."
    },
    "es-AR": {
      "name": "Joya del Barrio",
      "description": "Los vecinos del barrio te reconocen y te felicitan en la calle por tus goles en inferiores."
    },
    "pt-BR": {
      "name": "Craque da Cidade",
      "description": "Reconhecimento da comunidade local que acompanha seus passos com entusiasmo e carinho."
    },
    "fr-FR": {
      "name": "Jeune Prodige Local",
      "description": "L'admiration du quartier qui suit avec fierté vos exploits sous le maillot du club."
    }
  },
  "card-youth-yc-ls-06": {
    "en-GB": {
      "name": "Mentor Relationship",
      "description": "A senior team veteran takes you under their wing and shares priceless wisdom."
    },
    "es-ES": {
      "name": "Consejos del Veterano",
      "description": "Un futbolista experimentado del primer equipo comparte lecciones inestimables sobre la profesión."
    },
    "es-AR": {
      "name": "El Espejo del Capitán",
      "description": "Un histórico del primer equipo te sienta a charlar y te cuenta los secretos del profesionalismo."
    },
    "pt-BR": {
      "name": "Conselhos do Veterano",
      "description": "Um jogador experiente do elenco principal dá dicas valiosas sobre a carreira profissional."
    },
    "fr-FR": {
      "name": "Leçons d'un Vétéran",
      "description": "Un joueur chevronné de l'équipe première partage son savoir et vous guide dans les rouages du métier."
    }
  },
  "card-youth-yc-ls-07": {
    "en-GB": {
      "name": "Agent Guidance",
      "description": "An experienced agent offers career management and connects you to club scouts."
    },
    "es-ES": {
      "name": "Asesoramiento de Representante",
      "description": "Un agente profesional orienta tus primeros pasos contractuales con criterio y serenidad."
    },
    "es-AR": {
      "name": "Guía de Representante",
      "description": "Un representante serio te ayuda a ordenar tus prioridades y no marearte con promesas."
    },
    "pt-BR": {
      "name": "Orientação de Empresário",
      "description": "Um agente profissional orienta seus primeiros passos contratuais com visão de futuro."
    },
    "fr-FR": {
      "name": "Conseils d'un Agent",
      "description": "Un agent sérieux et avisé vous accompagne dans vos premiers choix contractuels."
    }
  },
  "card-youth-yc-ls-08": {
    "en-GB": {
      "name": "Boot Sponsor Deal",
      "description": "A local sports brand sponsors your footwear in exchange for social media promo."
    },
    "es-ES": {
      "name": "Contrato de Botas",
      "description": "Una marca deportiva te suministra material de primera calidad a cambio de visibilidad."
    },
    "es-AR": {
      "name": "Sponsor de Botines",
      "description": "Una marca de indumentaria te manda botines de estreno para cada fin de semana."
    },
    "pt-BR": {
      "name": "Patrocínio de Chuteiras",
      "description": "Uma marca esportiva fornece materiais de primeira linha em troca de visibilidade nas redes."
    },
    "fr-FR": {
      "name": "Contrat de Crampons",
      "description": "Un équipementier vous fournit des chaussures haut de gamme en échange d'une exposition mesurée."
    }
  },
  "card-youth-yc-ls-09": {
    "en-GB": {
      "name": "Viral Youth Highlight",
      "description": "A clip of your solo goal goes viral on TikTok and Instagram."
    },
    "es-ES": {
      "name": "Gol Viral en Redes",
      "description": "Un vídeo de tu mejor jugada explota en redes sociales atrayendo miles de seguidores."
    },
    "es-AR": {
      "name": "Jugada Viral en Redes",
      "description": "Un golazo tuyo en inferiores se hace viral en TikTok y te llena de mensajes de apoyo."
    },
    "pt-BR": {
      "name": "Lance Viral na Internet",
      "description": "Um gol de placa ou drible seu viraliza nas redes sociais conquistando milhares de fãs."
    },
    "fr-FR": {
      "name": "Action Virale",
      "description": "Un bijou technique en championnat jeune fait le tour des réseaux sociaux et booste votre notoriété."
    }
  },
  "card-youth-yc-ls-10": {
    "en-GB": {
      "name": "Veteran Representative",
      "description": "A veteran youth representative signs you onto their boutique agency."
    },
    "es-ES": {
      "name": "Agente Veterano",
      "description": "Un intermediario curtido en mil negociaciones te protege de cláusulas abusivas."
    },
    "es-AR": {
      "name": "Empresario Fogueado",
      "description": "Un representante con años de oficio en el fútbol te blinda ante contratos tramposos."
    },
    "pt-BR": {
      "name": "Empresário Experiente",
      "description": "Um intermediário tarimbado no mercado protege você de pegadinhas contratuais."
    },
    "fr-FR": {
      "name": "Représentant d'Expérience",
      "description": "Un agent chevronné et rompu aux négociations vous préserve des pièges contractuels."
    }
  },
  "card-youth-yc-ico-01": {
    "en-GB": {
      "name": "⭐ ICONIC — ELITE SCOUT",
      "description": "A top-level football agent/scout has been watching your development and believes you are one of the most exciting young talents in the competition. He represents elite prospects and decides to personally take you under his wing."
    },
    "es-ES": {
      "name": "⭐ ICÓNICO — OJEADOR DE ÉLITE",
      "description": "Un legendario ojeador internacional queda deslumbrado por tu talento y te abre las puertas del fútbol mundial."
    },
    "es-AR": {
      "name": "⭐ ICÓNICO — CAZATALENTOS DE ÉLITE",
      "description": "Un cazatalentos mítico del fútbol internacional queda fascinado con tu juego y te lleva a la cúspide."
    },
    "pt-BR": {
      "name": "⭐ ICÔNICO — OLHEIRO DE ELITE",
      "description": "Um lendário olheiro do futebol mundial fica maravilhado com o seu futebol e abre portas de gigantes europeus."
    },
    "fr-FR": {
      "name": "⭐ ICONIQUE — RECRUTEUR D'ÉLITE",
      "description": "Un recruteur de renommée mondiale est subjugué par votre potentiel et vous propulse vers l'élite."
    }
  },
  "card-youth-yc-ico-02": {
    "en-GB": {
      "name": "⭐ ICONIC — THE MASTER’S CHOICE",
      "description": "One of the most respected managers in football has personally noticed your potential. He doesn’t normally recruit unknown youth players, but something about your game convinces him to make an exception."
    },
    "es-ES": {
      "name": "⭐ ICÓNICO — LA ELECCIÓN DEL MAESTRO",
      "description": "Un entrenador legendario de la academia te elige como su pupilo predilecto para moldear tu destino."
    },
    "es-AR": {
      "name": "⭐ ICÓNICO — EL ELEGIDO DEL MAESTRO",
      "description": "El formador más sabio del club te elige como su protegido de oro para convertirte en una leyenda."
    },
    "pt-BR": {
      "name": "⭐ ICÔNICO — A ESCOLHA DO MESTRE",
      "description": "Um histórico treinador de base escolhe você a dedo como seu pupilo principal para moldar um futuro brilhante."
    },
    "fr-FR": {
      "name": "⭐ ICONIQUE — LE CHOIX DU MAÎTRE",
      "description": "Un grand formateur historique vous désigne comme son protégé pour façonner une carrière d'exception."
    }
  },
  "card-youth-yc-ico-03": {
    "en-GB": {
      "name": "⭐ ICONIC — STEP ON THE BALL",
      "description": "The legendary mastery of \"La Pisadita\" (Step on the ball). Freezing defenders with your sole and body shielding grants an unstoppable retention edge (+30% in duels, +1 yearly, stat break to 100 at 99)."
    },
    "es-ES": {
      "name": "⭐ ICÓNICO — PISADA MAGISTRAL",
      "description": "Dominio absoluto del tiempo y el espacio en la cancha. El balón se convierte en una extensión viva de tu pie."
    },
    "es-AR": {
      "name": "⭐ ICÓNICO — LA PISADITA DE ORO",
      "description": "Parás la pelota con la suela, levantás la cabeza y hacés bailar a los rivales a tu propio ritmo."
    },
    "pt-BR": {
      "name": "⭐ ICÔNICO — CONTROLE MAGISTRAL",
      "description": "Pisa na bola, dita o ritmo e faz a marcação dançar conforme a sua orquestra em campo."
    },
    "fr-FR": {
      "name": "⭐ ICONIQUE — LA CARESSE DE LA SEMELLE",
      "description": "Maîtrise insolente de l'espace et du tempo. Le cuir colle à votre semelle dans une symphonie technique."
    }
  },
  "card-youth-temp-positive-1": {
    "en-GB": {
      "name": "Academy Surge Blitz",
      "description": "Intense 6-month specialized physical and tactical drills provide rapid developmental stat acceleration."
    },
    "es-ES": {
      "name": "Intensivo Acelerado de Cantera",
      "description": "Régimen especial de 6 meses con entrenamientos personalizados que multiplica exponencialmente tu progresión."
    },
    "es-AR": {
      "name": "Pretemporada Relámpago de Inferiores",
      "description": "Plan acelerado de 6 meses de preparación intensiva que dispara tu crecimiento futbolístico."
    },
    "pt-BR": {
      "name": "Aceleração de Base",
      "description": "Programa intensivo de 6 meses focado em desenvolvimento físico e técnico que alavanca sua evolução."
    },
    "fr-FR": {
      "name": "Accélération Intensive en Académie",
      "description": "Un programme intensif de 6 mois d'entraînement individualisé qui décuple votre courbe de progression."
    }
  },
  "card-youth-temp-negative-1": {
    "en-GB": {
      "name": "Youth Growth Plate Spurt Fatigue",
      "description": "Sudden 3-inch biological growth spurt creates temporary clumsiness and severe coordination lag for 6 months."
    },
    "es-ES": {
      "name": "Estirón y Desajuste Muscular",
      "description": "Fase de crecimiento óseo rápido durante 6 meses que genera fatiga y descompensaciones biomecánicas transitorias."
    },
    "es-AR": {
      "name": "Estirón y Desbalance Físico",
      "description": "Crecimiento repentino en 6 meses que te produce dolores de crecimiento y desajustes de coordinación."
    },
    "pt-BR": {
      "name": "Fase de Crescimento e Desgaste",
      "description": "Estirão rápido durante 6 meses provocando fadiga muscular e adaptação no centro de gravidade."
    },
    "fr-FR": {
      "name": "Poussée de Croissance et Fatigue",
      "description": "Une poussée de croissance rapide sur 6 mois provoquant raideurs et fatigue biomécanique transitoire."
    }
  },
  "card-youth-temp-double-1": {
    "en-GB": {
      "name": "All-In Academy Prodigy Protocol",
      "description": "1 full year of nonstop triple-session training. Massive pace and finishing gains at the cost of burnout and physical strain."
    },
    "es-ES": {
      "name": "Protocolo Prodígio Absoluto",
      "description": "Inmersión total de 1 año como joya de la cantera: rendimiento superlativo a cambio de un desgaste mental riguroso."
    },
    "es-AR": {
      "name": "Régimen de Joya Absoluta",
      "description": "Un año entero como la gran promesa del club: explosión de jerarquía a cambio de máxima exigencia mental."
    },
    "pt-BR": {
      "name": "Protocolo Joia Rara",
      "description": "Um ano de dedicação extrema como a grande aposta do clube: evolução técnica absurda com cobrança pesada."
    },
    "fr-FR": {
      "name": "Protocole Prodige Absolu",
      "description": "Immersion totale d'un an en tant que pépite du centre: progression fulgurante assortie d'une pression intense."
    }
  },
  "card-career-1": {
    "en-GB": {
      "name": "Overflow Chemistry Surge (Bronze)",
      "description": "A focused team-bonding dinner elevates locker room trust beyond normal capacity, triggering Overflow Chemistry (+1 stat bonus to all attributes per 1% overflow)."
    },
    "es-ES": {
      "name": "Oleada de Química Desbordante (Bronce)",
      "description": "Una cena de equipo enfocada eleva la confianza del vestuario más allá de los límites normales."
    },
    "es-AR": {
      "name": "Explosión de Química Desbordante (Bronce)",
      "description": "Un asado íntimo con el plantel fortalece la confianza del vestuario superando los límites habituales."
    },
    "pt-BR": {
      "name": "Surto de Entrosamento Transbordante (Bronze)",
      "description": "Um jantar descontraído fortalece o vestiário e eleva a confiança do elenco além dos limites normais."
    },
    "fr-FR": {
      "name": "Afflux de Chimie Débordante (Bronze)",
      "description": "Un dîner d'équipe ciblé renforce la confiance du vestiaire bien au-delà des limites ordinaires."
    }
  },
  "card-career-2": {
    "en-GB": {
      "name": "Overflow Chemistry Surge (Silver)",
      "description": "An intensive tactical retreat and cohesive squad understanding produces an electric synergy surge, pushing team chemistry well past 100%."
    },
    "es-ES": {
      "name": "Oleada de Química Desbordante (Plata)",
      "description": "Una concentración táctica intensiva y un entendimiento colectivo cohesionado llevan la química del vestuario al siguiente nivel."
    },
    "es-AR": {
      "name": "Explosión de Química Desbordante (Plata)",
      "description": "Una concentración a puertas cerradas y sincronización táctica llevan la unión del plantel a otro nivel."
    },
    "pt-BR": {
      "name": "Surto de Entrosamento Transbordante (Prata)",
      "description": "Uma concentração tática bem aproveitada leva o entrosamento do vestiário a um patamar superior."
    },
    "fr-FR": {
      "name": "Afflux de Chimie Débordante (Argent)",
      "description": "Un stage tactique intensif et une saine émulation collective hissent la cohésion du vestiaire au niveau supérieur."
    }
  },
  "card-career-3": {
    "en-GB": {
      "name": "Overflow Chemistry Surge (Gold)",
      "description": "Unshakeable team spirit and shared tactical intuition unlock immense locker room cohesion, granting a massive overflow chemistry boost across the squad."
    },
    "es-ES": {
      "name": "Oleada de Química Desbordante (Oro)",
      "description": "Un espíritu de equipo inquebrantable y una intuición táctica compartida desbloquean una química de élite."
    },
    "es-AR": {
      "name": "Explosión de Química Desbordante (Oro)",
      "description": "Una comunión indestructible en el plantel y una telepatía táctica compartida desatan una química de élite."
    },
    "pt-BR": {
      "name": "Surto de Entrosamento Transbordante (Ouro)",
      "description": "Um espírito de equipe inabalável e sintonia perfeita em campo desbloqueiam uma química de nível mundial."
    },
    "fr-FR": {
      "name": "Afflux de Chimie Débordante (Or)",
      "description": "Un état d'esprit inébranlable et une intuition partagée débloquent une cohésion d'équipe exceptionnelle."
    }
  },
  "card-career-4": {
    "en-GB": {
      "name": "Overflow Chemistry Surge (Legendary)",
      "description": "Historic squad brotherhood and absolute tactical telepathy achieve the pinnacle of team synergy, unlocking maximum 200% Overflow Chemistry (+100 stat points distributed)!"
    },
    "es-ES": {
      "name": "Oleada de Química Desbordante (Legendario)",
      "description": "Una hermandad histórica en la plantilla y una telepatía táctica absoluta trascienden todas las métricas de química."
    },
    "es-AR": {
      "name": "Explosión de Química Desbordante (Legendario)",
      "description": "Una hermandad histórica e inquebrantable en el vestuario rompe cualquier escala de química y mística."
    },
    "pt-BR": {
      "name": "Surto de Entrosamento Transbordante (Lendário)",
      "description": "Uma fraternidade histórica no vestiário e conexão telepática em campo quebram todos os recordes de química."
    },
    "fr-FR": {
      "name": "Afflux de Chimie Débordante (Légendaire)",
      "description": "Une fraternité légendaire et une télépathie tactique absolue qui transcendent toutes les limites de cohésion."
    }
  },
  "card-career-5": {
    "en-GB": {
      "name": "Extra Finishing Session",
      "description": "Extra time spent in front of goal honing accuracy, technique, and calm under pressure."
    },
    "es-ES": {
      "name": "Sesión Extra de Definición",
      "description": "Te quedas después del entrenamiento para disparar a puerta hasta que cada toque sea natural."
    },
    "es-AR": {
      "name": "Práctica Extra de Definición",
      "description": "Te quedás después de hora pateando al arco hasta que cada toque salga de memoria."
    },
    "pt-BR": {
      "name": "Treino Extra de Finalização",
      "description": "Você fica depois do treino chutando a gol até que cada finalização saia no reflexo."
    },
    "fr-FR": {
      "name": "Séance de Finition Supplémentaire",
      "description": "Vous prolongez l'entraînement face au but jusqu'à ce que chaque frappe devienne un automatisme."
    }
  },
  "card-career-6": {
    "en-GB": {
      "name": "Passing Reps",
      "description": "Repetitive short passing drills building rhythm, vision, and first touch confidence."
    },
    "es-ES": {
      "name": "Repeticiones de Pase",
      "description": "Pases una y otra vez hasta que el balón vaya exactamente donde tú quieres."
    },
    "es-AR": {
      "name": "Perfeccionamiento de Pase",
      "description": "Pases cortos y largos una y otra vez hasta poner la pelota exactamente donde querés."
    },
    "pt-BR": {
      "name": "Série de Passes",
      "description": "Passes repetidos exaustivamente até a bola ir exatamente onde você deseja."
    },
    "fr-FR": {
      "name": "Gammes de Passes",
      "description": "Répétition inlassable de passes jusqu'à ce que le ballon atterrisse au millimètre près."
    }
  },
  "card-career-7": {
    "en-GB": {
      "name": "Defensive Drills",
      "description": "Focused defensive footwork and positioning exercises to sharpen tackling and marking."
    },
    "es-ES": {
      "name": "Ejercicios Defensivos",
      "description": "Trabajo en cómo posicionarte cuando el rival tiene el balón."
    },
    "es-AR": {
      "name": "Ejercicios de Marca",
      "description": "Trabajás cómo perfilarte y cerrar espacios cuando el rival tiene la pelota."
    },
    "pt-BR": {
      "name": "Treino Defensivo",
      "description": "Foco em posicionamento corporal e coberturas quando o adversário está com a bola."
    },
    "fr-FR": {
      "name": "Gammes Défensives",
      "description": "Travail approfondi du placement et des compensations quand l'adversaire a le ballon."
    }
  },
  "card-career-8": {
    "en-GB": {
      "name": "First Touch Work",
      "description": "Dedicated ball-reception sessions improving control out of the air and tight-space retention."
    },
    "es-ES": {
      "name": "Control Orientado",
      "description": "Controlar balones difíciles hasta que no se te escapen nunca."
    },
    "es-AR": {
      "name": "Control Orientado",
      "description": "Dominar pelotas complicadas y divididas hasta que queden siempre pegadas al botín."
    },
    "pt-BR": {
      "name": "Domínio Orientado",
      "description": "Amortecer bolas difíceis até que fiquem coladas nos seus pés."
    },
    "fr-FR": {
      "name": "Premier Contrôle",
      "description": "Contrôler des trajectoires difficiles jusqu'à ce que le ballon vous obéisse au doigt et à l'œil."
    }
  },
  "card-career-9": {
    "en-GB": {
      "name": "Crossing Practice",
      "description": "Delivery practice from wide areas aiming for whipped crosses and accurate long passes."
    },
    "es-ES": {
      "name": "Práctica de Centros",
      "description": "Poner balones al área desde diferentes ángulos."
    },
    "es-AR": {
      "name": "Práctica de Centros",
      "description": "Meter centros al área desde diferentes perfiles y velocidades."
    },
    "pt-BR": {
      "name": "Treino de Cruzamentos",
      "description": "Colocar bolas na área a partir de diversos ângulos da lateral."
    },
    "fr-FR": {
      "name": "Exercices de Centres",
      "description": "Déposer des ballons précis dans la surface depuis différents angles."
    }
  },
  "card-career-10": {
    "en-GB": {
      "name": "Reaction Training",
      "description": "High-tempo agility and mental sharpness exercises for split-second pitch decision making."
    },
    "es-ES": {
      "name": "Entrenamiento de Reacción",
      "description": "Ejercicios rápidos que te ayudan a tomar decisiones más rápido."
    },
    "es-AR": {
      "name": "Entrenamiento de Reacción",
      "description": "Ejercicios a un toque y de reflejos que te ayudan a resolver más rápido."
    },
    "pt-BR": {
      "name": "Treino de Reação",
      "description": "Exercícios rápidos que ajudam você a tomar decisões em fração de segundos."
    },
    "fr-FR": {
      "name": "Vivacité et Réflexes",
      "description": "Exercices rapides pour accélérer la prise de décision sous forte pression."
    }
  },
  "card-career-11": {
    "en-GB": {
      "name": "Positioning Lesson",
      "description": "Tactical film review sessions understanding space, off-the-ball movement, and passing lanes."
    },
    "es-ES": {
      "name": "Lección de Colocación",
      "description": "El entrenador te enseña dónde deberías estar antes de que llegue la jugada."
    },
    "es-AR": {
      "name": "Lección de Posicionamiento",
      "description": "El técnico te enseña dónde pararte antes de que arranque la jugada."
    },
    "pt-BR": {
      "name": "Lição de Posicionamento",
      "description": "A comissão técnica ensina onde se posicionar antes de a jogada acontecer."
    },
    "fr-FR": {
      "name": "Leçon de Placement",
      "description": "L'entraîneur vous montre où vous positionner avant même le déclenchement de l'action."
    }
  },
  "card-career-12": {
    "en-GB": {
      "name": "Strength Session",
      "description": "Gym conditioning focused on core power, stability, and enduring physical durability."
    },
    "es-ES": {
      "name": "Sesión de Fuerza",
      "description": "Levantar pesas para aguantar mejor los choques en los partidos."
    },
    "es-AR": {
      "name": "Trabajo de Potencia",
      "description": "Trabajo de pesas para ganar choque y aguantar la marca en Primera."
    },
    "pt-BR": {
      "name": "Sessão de Força",
      "description": "Trabalho de musculação para suportar divididas com mais firmeza nos jogos."
    },
    "fr-FR": {
      "name": "Séance de Renforcement",
      "description": "Travail de musculation pour remporter les duels physiques avec autorité."
    }
  },
  "card-career-13": {
    "en-GB": {
      "name": "Specialist Finisher",
      "description": "Advanced clinical finishing masterclass inside the penalty box under match condition simulation."
    },
    "es-ES": {
      "name": "Especialista en Definición",
      "description": "Práctica dedicada a remates desde cualquier posición del campo."
    },
    "es-AR": {
      "name": "Especialista en el Gol",
      "description": "Entrenamiento específico de remate en cualquier situación de partido."
    },
    "pt-BR": {
      "name": "Especialista em Gols",
      "description": "Treino dedicado a finalizações rápidas de qualquer ponto do campo."
    },
    "fr-FR": {
      "name": "Finisseur Spécialiste",
      "description": "Perfectionnement intensif pour marquer dans toutes les positions possibles."
    }
  },
  "card-career-14": {
    "en-GB": {
      "name": "Pressing School",
      "description": "Intense Gegenpressing drills teaching high-energy traps, quick anticipation, and spatial awareness."
    },
    "es-ES": {
      "name": "Escuela de Presión",
      "description": "Aprender cuándo salir a morder y cuándo mantener la línea."
    },
    "es-AR": {
      "name": "Escuela de Presión",
      "description": "Aprender cuándo saltar a presionar y cuándo achicar y aguantar la línea."
    },
    "pt-BR": {
      "name": "Escola de Pressão",
      "description": "Aprender o momento exato de pressionar alto ou manter a linha recuada."
    },
    "fr-FR": {
      "name": "École du Pressing",
      "description": "Apprendre le timing exact entre le jaillissement au pressing et le repli tactique."
    }
  },
  "card-career-15": {
    "en-GB": {
      "name": "Creative Passing Session",
      "description": "Playmaking masterclass focusing on through balls, diagonal switches, and key chance creation."
    },
    "es-ES": {
      "name": "Pase Creativo",
      "description": "Intentar pases arriesgados que rompen líneas."
    },
    "es-AR": {
      "name": "Pase Creativo",
      "description": "Intentar pases de primera y filtrados que parten la defensa rival."
    },
    "pt-BR": {
      "name": "Passe Criativo",
      "description": "Tentar passes verticais e ousados que quebram linhas adversárias."
    },
    "fr-FR": {
      "name": "Passes Créatives",
      "description": "Tenter des passes audacieuses et tranchantes pour désorganiser le bloc adverse."
    }
  },
  "card-career-16": {
    "en-GB": {
      "name": "Defensive Masterclass",
      "description": "Elite defensive coaching on tight man-marking, cutting passing lanes, and backline coordination."
    },
    "es-ES": {
      "name": "Cátedra Defensiva",
      "description": "Anticipar jugadas antes de que sucedan para ganar duelos."
    },
    "es-AR": {
      "name": "Cátedra Defensiva",
      "description": "Leer la intención del rival un segundo antes para ganar cada anticipo."
    },
    "pt-BR": {
      "name": "Aula Defensiva",
      "description": "Antecipar as intenções do adversário para vencer cada dividida sem falta."
    },
    "fr-FR": {
      "name": "Masterclass Défensive",
      "description": "Anticiper les lignes de passe adverses pour régner en maître dans chaque duel."
    }
  },
  "card-career-17": {
    "en-GB": {
      "name": "Sloppy Training",
      "description": "Lack of focus during training drills led to unforced errors and poor touch."
    },
    "es-ES": {
      "name": "Entrenamiento Descuidado",
      "description": "Pierdes la concentración y no cumples con el ritmo de la sesión."
    },
    "es-AR": {
      "name": "Práctica Desprolija",
      "description": "Perdés el foco en la práctica y te desconectás del ritmo del equipo."
    },
    "pt-BR": {
      "name": "Treino Desatento",
      "description": "Perde o foco durante a atividade e não acompanha o ritmo dos colegas."
    },
    "fr-FR": {
      "name": "Séance Négligée",
      "description": "Baisse de concentration et difficultés à suivre l'intensité de la séance."
    }
  },
  "card-career-18": {
    "en-GB": {
      "name": "Finishing Slump",
      "description": "A temporary dip in goalscoring confidence leading to rushed shots in key moments."
    },
    "es-ES": {
      "name": "Bache Goleador",
      "description": "El balón parece no querer entrar pase lo que pase."
    },
    "es-AR": {
      "name": "Sequía Goleadora",
      "description": "El arco parece cerrado con candado y no entra ni de casualidad."
    },
    "pt-BR": {
      "name": "Jejum de Gols",
      "description": "A bola simplesmente teima em não entrar, não importa o que tente."
    },
    "fr-FR": {
      "name": "Passe Sans But",
      "description": "Le ballon refuse obstinément d'entrer dans les filets quoi qu'il arrive."
    }
  },
  "card-career-19": {
    "en-GB": {
      "name": "Defensive Mistakes",
      "description": "Misjudged positioning and loose marking during defensive practice scenarios."
    },
    "es-ES": {
      "name": "Errores Defensivos",
      "description": "Malas decisiones en la marca que cuestan goles o sustos."
    },
    "es-AR": {
      "name": "Desatenciones en la Marca",
      "description": "Desatenciones en el fondo que dejan solo al delantero rival."
    },
    "pt-BR": {
      "name": "Falhas Defensivas",
      "description": "Erros de posicionamento na marcação que custam caro para a equipe."
    },
    "fr-FR": {
      "name": "Erreurs Défensives",
      "description": "Mauvais choix de placement entraînant des situations dangereuses pour votre camp."
    }
  },
  "card-career-20": {
    "en-GB": {
      "name": "Heavy Legs",
      "description": "Overworked muscles and slow recovery result in sluggish sprint speed and endurance."
    },
    "es-ES": {
      "name": "Piernas Pesadas",
      "description": "El cuerpo te pesa y tardas en arrancar."
    },
    "es-AR": {
      "name": "Piernas de Plomo",
      "description": "Las piernas pesan una tonelada y te cuesta un mundo arrancar."
    },
    "pt-BR": {
      "name": "Pernas Pesadas",
      "description": "O corpo está exausto e o arranque fica lento nas jogadas."
    },
    "fr-FR": {
      "name": "Jambes Lourdes",
      "description": "Le corps est lourd et le manque de vivacité se fait cruellement sentir."
    }
  },
  "card-career-21": {
    "en-GB": {
      "name": "Poor First Touch",
      "description": "Heavy touch issues during technical drills cause the ball to bounce away unexpectedly."
    },
    "es-ES": {
      "name": "Mal Primer Toque",
      "description": "El balón se te escapa demasiado lejos cada vez que recibes."
    },
    "es-AR": {
      "name": "Control Impreciso",
      "description": "La pelota te rebota larga cada vez que intentás pararla."
    },
    "pt-BR": {
      "name": "Domínio Impreciso",
      "description": "A bola escapa longe dos pés a cada recepção de passe."
    },
    "fr-FR": {
      "name": "Contrôle Défaillant",
      "description": "Le ballon s'éloigne trop de vous sur chaque prise de balle."
    }
  },
  "card-career-22": {
    "en-GB": {
      "name": "Lost Concentration",
      "description": "Mental distractions on the pitch lead to delayed reactions and spatial disorientation."
    },
    "es-ES": {
      "name": "Desconexión Mental",
      "description": "La cabeza en otra parte durante momentos importantes del partido."
    },
    "es-AR": {
      "name": "Falta de Concentración",
      "description": "Te vas del partido mentalmente en jugadas que exigen atención total."
    },
    "pt-BR": {
      "name": "Perda de Concentração",
      "description": "A cabeça viaja para longe em momentos decisivos do confronto."
    },
    "fr-FR": {
      "name": "Déconcentration",
      "description": "Absences coupables lors de phases de jeu exigeant une vigilance absolue."
    }
  },
  "card-career-23": {
    "en-GB": {
      "name": "Tactical Confusion",
      "description": "Struggled to absorb complex managerial instructions during tactical walkthroughs."
    },
    "es-ES": {
      "name": "Desconcierto Táctico",
      "description": "No estás seguro de dónde deberías estar en el campo."
    },
    "es-AR": {
      "name": "Dudas Tácticas",
      "description": "No sabés bien qué espacio cubrir ni cuál es tu rol exacto en la cancha."
    },
    "pt-BR": {
      "name": "Dúvidas no Esquema",
      "description": "Incerteza sobre qual espaço ocupar e qual função exercer no campo."
    },
    "fr-FR": {
      "name": "Confusion Tactique",
      "description": "Incertitude quant au rôle précis et aux zones à couvrir sur le terrain."
    }
  },
  "card-career-24": {
    "en-GB": {
      "name": "Bad Crossing Session",
      "description": "Inconsistent delivery from wide positions with multiple overhit crosses and long passes."
    },
    "es-ES": {
      "name": "Mala Sesión de Centros",
      "description": "Los centros salen demasiado pasados o directos al portero."
    },
    "es-AR": {
      "name": "Centros Descalibrados",
      "description": "Los centros se van a la tribuna o mueren fáciles en las manos del arquero."
    },
    "pt-BR": {
      "name": "Cruzamentos Descalibrados",
      "description": "Cruzamentos saem direto nas mãos do goleiro ou pela linha de fundo."
    },
    "fr-FR": {
      "name": "Mauvais Centres",
      "description": "Des centres imprécis qui filent au troisième poteau ou dans les bras du gardien."
    }
  },
  "card-career-25": {
    "en-GB": {
      "name": "Training Plateau",
      "description": "Development stagnates temporarily during routine training drills."
    },
    "es-ES": {
      "name": "Estancamiento en el Rendimiento",
      "description": "Trabajas duro pero sientes que no estás mejorando."
    },
    "es-AR": {
      "name": "Meseta de Rendimiento",
      "description": "Te rompés el lomo entrenando pero sentís que no avanzás un centímetro."
    },
    "pt-BR": {
      "name": "Evolução Travada",
      "description": "Você trabalha duro no dia a dia, mas sente que o futebol não decola."
    },
    "fr-FR": {
      "name": "Plateau de Progression",
      "description": "Beaucoup d'efforts fournis sans sentiment d'amélioration tangible à court terme."
    }
  },
  "card-career-26": {
    "en-GB": {
      "name": "Tactical Misfit",
      "description": "Struggling to fit into the manager's tactical system and formation."
    },
    "es-ES": {
      "name": "Inadaptación al Sistema",
      "description": "La forma de jugar del equipo no encaja con tus puntos fuertes."
    },
    "es-AR": {
      "name": "Incompatibilidad Táctica",
      "description": "La propuesta del equipo no coincide en nada con tus mayores virtudes."
    },
    "pt-BR": {
      "name": "Incompatibilidade Tática",
      "description": "O estilo tático adotado pelo time não favorece as suas melhores características."
    },
    "fr-FR": {
      "name": "Inadéquation Tactique",
      "description": "Le plan de jeu collectif ne met pas en valeur vos principales qualités."
    }
  },
  "card-career-27": {
    "en-GB": {
      "name": "Competition for Places",
      "description": "In-form squad rival challenges your starting position in the lineup."
    },
    "es-ES": {
      "name": "Competencia Feroz por el Puesto",
      "description": "Otro jugador rinde mejor que tú en tu misma posición."
    },
    "es-AR": {
      "name": "Pelea Dura por el Puesto",
      "description": "Otro compañero está rindiendo a full y te está ganando el puesto."
    },
    "pt-BR": {
      "name": "Disputa Firme pela Vaga",
      "description": "Outro companheiro de posição vive grande fase e ganha a preferência do treinador."
    },
    "fr-FR": {
      "name": "Concurrence Féroce",
      "description": "Un coéquipier brille au même poste et menace directement votre statut."
    }
  },
  "card-career-28": {
    "en-GB": {
      "name": "Poor Tactical Adaptation",
      "description": "Difficulty adjusting to new managerial pressing schemes and defensive triggers."
    },
    "es-ES": {
      "name": "Dificultad de Adaptación",
      "description": "Te cuesta entender lo que el entrenador te pide en cada jugada."
    },
    "es-AR": {
      "name": "Desajuste con las Órdenes",
      "description": "Te cuesta asimilar en la cancha lo que el cuerpo técnico pide en el pizarrón."
    },
    "pt-BR": {
      "name": "Dificuldade de Absorção Tática",
      "description": "Dificuldade para colocar em prática o que o comandante exige na prancheta."
    },
    "fr-FR": {
      "name": "Assimilation Difficile",
      "description": "Difficultés à traduire sur le terrain les exigences tactiques du staff."
    }
  },
  "card-career-29": {
    "en-GB": {
      "name": "Extra Session",
      "description": "Pushed through an intense extra shooting workout after team practice."
    },
    "es-ES": {
      "name": "Sesión Extraordinaria",
      "description": "Más trabajo con el balón que aumenta tu nivel pero desgasta el físico."
    },
    "es-AR": {
      "name": "Turno Extraordinario",
      "description": "Metés horas extras con pelota que mejoran tu técnica pero cansan el físico."
    },
    "pt-BR": {
      "name": "Treino Extraordinário",
      "description": "Mais horas com a bola elevam a qualidade técnica, mas cobram energia física."
    },
    "fr-FR": {
      "name": "Séance Extra",
      "description": "Volume supplémentaire avec ballon qui perfectionne la technique au prix d'une fatigue accrue."
    }
  },
  "card-career-30": {
    "en-GB": {
      "name": "Defensive Focus",
      "description": "Sacrificed attack flair drills to concentrate entirely on defensive tackling mechanics."
    },
    "es-ES": {
      "name": "Enfoque Defensivo",
      "description": "Mejoras atrás a costa de llegar menos al área rival."
    },
    "es-AR": {
      "name": "Foco en la Marca",
      "description": "Te hacés una fiera atrás pero perdés llegada al área contraria."
    },
    "pt-BR": {
      "name": "Foco na Marcação",
      "description": "Evolução expressiva na zaga sacrificando a presença no ataque adversário."
    },
    "fr-FR": {
      "name": "Discipline Défensive",
      "description": "Progrès notables dans le travail défensif réduisant les incursions offensives."
    }
  },
  "card-career-31": {
    "en-GB": {
      "name": "Speed Work",
      "description": "Focused heavily on sprint acceleration, leaning down at the expense of raw physical strength."
    },
    "es-ES": {
      "name": "Trabajo de Velocidad",
      "description": "Ganas explosividad en carreras cortas pero pierdes resistencia."
    },
    "es-AR": {
      "name": "Velocidad Pura",
      "description": "Ganás pique corto y arranque explosivo pero te fundís antes."
    },
    "pt-BR": {
      "name": "Velocidade Pura",
      "description": "Ganho de explosão muscular em piques curtos, reduzindo o fôlego a longo prazo."
    },
    "fr-FR": {
      "name": "Vitesse Pure",
      "description": "Gain de vitesse explosive sur les premiers mètres réduisant un peu l'endurance."
    }
  },
  "card-career-32": {
    "en-GB": {
      "name": "Creative Freedom",
      "description": "Embraced high-risk dribbling and flair, occasionally wandering out of assigned tactical structure."
    },
    "es-ES": {
      "name": "Libertad Creativa",
      "description": "Más opciones de hacer jugadas increíbles pero mayor riesgo de perderla."
    },
    "es-AR": {
      "name": "Libertad Creativa",
      "description": "Más chances de inventar una genialidad pero más riesgo de perder la pelota."
    },
    "pt-BR": {
      "name": "Liberdade Criativa",
      "description": "Mais liberdade para criar jogadas mágicas correndo maior risco de desarmes."
    },
    "fr-FR": {
      "name": "Liberté Créative",
      "description": "Plus de liberté pour créer l'inattendu, avec un risque accru de pertes de balle."
    }
  },
  "card-career-33": {
    "en-GB": {
      "name": "Safe Passing",
      "description": "Prioritized ball retention and short risk-free passes over daring long-distance balls."
    },
    "es-ES": {
      "name": "Pase Seguro",
      "description": "No pierdes balones pero tampoco arriesgas para crear peligro."
    },
    "es-AR": {
      "name": "Pase Seguro",
      "description": "No regalás ninguna pelota pero tampoco metés pases que rompan líneas."
    },
    "pt-BR": {
      "name": "Passe de Segurança",
      "description": "Zero erros de passe curto, mas sem arriscar lançamentos verticais de perigo."
    },
    "fr-FR": {
      "name": "Passes Sécurisés",
      "description": "Très peu de déchets dans les transmissions, mais moins de passes tranchantes vers l'avant."
    }
  },
  "card-career-34": {
    "en-GB": {
      "name": "Aggressive Press",
      "description": "Relentless closing down on opposition ball carriers, draining energy reserves."
    },
    "es-ES": {
      "name": "Presión Agresiva",
      "description": "Recuperas balones arriba pero te arriesgas a cometer faltas o cansarte."
    },
    "es-AR": {
      "name": "Presión al Límite",
      "description": "Mordés arriba y recuperás pelotas pero te llenás de amarillas y desgaste."
    },
    "pt-BR": {
      "name": "Pressão Agressiva",
      "description": "Desarmes frequentes no campo de ataque correndo risco de faltas e cartões."
    },
    "fr-FR": {
      "name": "Pressing Agressif",
      "description": "Nombreuses récupérations dans le camp adverse compensées par des fautes et cartons évitables."
    }
  },
  "card-career-35": {
    "en-GB": {
      "name": "Aerial Specialist",
      "description": "Bulk training for aerial duels and headers, slightly compromising top sprint speed."
    },
    "es-ES": {
      "name": "Especialista Aéreo",
      "description": "Dominas por arriba pero pierdes algo de velocidad en el suelo."
    },
    "es-AR": {
      "name": "Especialista del Aire",
      "description": "Ganás todo de arriba pero perdés agilidad en el mano a mano por abajo."
    },
    "pt-BR": {
      "name": "Especialista Aéreo",
      "description": "Soberania absoluta no jogo aéreo sacrificando agilidade e velocidade rasteira."
    },
    "fr-FR": {
      "name": "Spécialiste Aérien",
      "description": "Domination impressionnante dans les airs au détriment d'une certaine vivacité au sol."
    }
  },
  "card-career-36": {
    "en-GB": {
      "name": "Long-Shot Specialist",
      "description": "Practiced long-range power strikes from distance, neglecting short pass combinations."
    },
    "es-ES": {
      "name": "Especialista en Tiros Lejanos",
      "description": "Amenaza constante desde fuera pero a veces te precipitas."
    },
    "es-AR": {
      "name": "Especialista en Bombazos",
      "description": "Bombazos temibles desde afuera pero a veces tirás cuando conviene tocar."
    },
    "pt-BR": {
      "name": "Especialista em Chutes de Longe",
      "description": "Ameaça letal de média distância arriscando chutes precipitados ocasionalmente."
    },
    "fr-FR": {
      "name": "Spécialiste Frappes Lointaines",
      "description": "Danger permanent hors de la surface avec parfois un excès d'individualisme."
    }
  },
  "card-career-37": {
    "en-GB": {
      "name": "Attack-Minded Fullback",
      "description": "Overlapping aggressively down the flank, leaving open spaces behind in defense."
    },
    "es-ES": {
      "name": "Lateral Ofensivo",
      "description": "Subidas constantes al ataque que dejan tu banda desprotegida."
    },
    "es-AR": {
      "name": "Lateral Volante",
      "description": "Te sumás al ataque como un puntero pero dejás regalada tu banda."
    },
    "pt-BR": {
      "name": "Lateral Ofensivo",
      "description": "Apoio fulminante no ataque que por vezes desguarnece o corredor defensivo."
    },
    "fr-FR": {
      "name": "Latéral Ultra-Offensif",
      "description": "Apports offensifs constants sur le flanc découvrant occasionnellement l'arrière-garde."
    }
  },
  "card-career-38": {
    "en-GB": {
      "name": "Deep-Lying Playmaker",
      "description": "Dictating tempo from deep with supreme passing range, trading off dynamic pace and dribbling."
    },
    "es-ES": {
      "name": "Organizador Retrasado",
      "description": "Distribución brillante desde atrás pero poca llegada al área rival."
    },
    "es-AR": {
      "name": "Volante Central de Buen Pie",
      "description": "Manejás la salida limpia desde el fondo pero no pisás el área contraria."
    },
    "pt-BR": {
      "name": "Volante Distribuidor",
      "description": "Distribuição magistral iniciando as jogadas sem pisar na área para finalizar."
    },
    "fr-FR": {
      "name": "Meneur de Jeu Reculé",
      "description": "Orientation lumineuse du jeu depuis la base sans participation directe à la finition."
    }
  },
  "card-career-39": {
    "en-GB": {
      "name": "Pressing Machine",
      "description": "Engineered high-intensity pressing engine that strains composure and physical conditioning."
    },
    "es-ES": {
      "name": "Máquina de Presionar",
      "description": "Corres todo el partido presionando pero llegas justo de aire a definir."
    },
    "es-AR": {
      "name": "Tractor de la Mitad",
      "description": "Corrés a todos los rivales pero cuando llegás al área te falta aire para definir."
    },
    "pt-BR": {
      "name": "Motor de Marcação",
      "description": "Correria sem trégua para sufocar os adversários chegando sem pernas para chutar."
    },
    "fr-FR": {
      "name": "Machine de Récupération",
      "description": "Débauche d'énergie incessante au pressing laissant peu de lucidité pour conclure."
    }
  },
  "card-career-40": {
    "en-GB": {
      "name": "New Ways to Play",
      "description": "You dreamed about new ways to play. An ultra-rare flash of inspiration breaking through human boundaries to unlock the historic 100 Stat Break rating."
    },
    "es-ES": {
      "name": "Nuevas Formas de Jugar",
      "description": "Experimentar en el campo que amplía tu visión pero cuesta asimilar."
    },
    "es-AR": {
      "name": "Nuevos Recursos de Juego",
      "description": "Sumar recursos y variantes a tu fútbol que tardan un poco en afianzarse."
    },
    "pt-BR": {
      "name": "Novos Caminhos de Jogo",
      "description": "Experimentar novas funções táticas ampliando a visão mas exigindo paciência."
    },
    "fr-FR": {
      "name": "Nouvelles Perspectives de Jeu",
      "description": "Exploration de nouvelles facettes tactiques élargissant le registre avec un temps d'adaptation."
    }
  },
  "card-career-41": {
    "en-GB": {
      "name": "Football Idol",
      "description": "You were inspired by your football idol. Channeling the supernatural mastery of legends who redefined football history to reach the historic 100 Stat Break rating."
    },
    "es-ES": {
      "name": "Ídolo de Juventud",
      "description": "Intentar jugar como tu referencia profesional te inspira pero añade presión."
    },
    "es-AR": {
      "name": "El Ídolo del Póster",
      "description": "Querer jugar como tu ídolo de la infancia te llena de ganas pero te mete presión."
    },
    "pt-BR": {
      "name": "Ídolo do Futebol",
      "description": "Tentar reproduzir os lances do seu maior ídolo inspira, mas atrai comparações."
    },
    "fr-FR": {
      "name": "Idole d'Enfance",
      "description": "Vouloir égaler votre modèle footballistique apporte motivation et pression accrue."
    }
  },
  "card-career-42": {
    "en-GB": {
      "name": "Training Discovery",
      "description": "You discovered something during training. An unprecedented realization in body mechanics and precision that elevates your craft beyond perfection to 100 rating."
    },
    "es-ES": {
      "name": "Descubrimiento en el Entrenamiento",
      "description": "Descubres un recurso técnico que no sabías que tenías."
    },
    "es-AR": {
      "name": "Hallazgo en la Práctica",
      "description": "Descubrís un tiro o recurso en la práctica que suma a tu repertorio."
    },
    "pt-BR": {
      "name": "Descoberta no Treino",
      "description": "Você descobre um novo recurso técnico fantástico durante os treinos diários."
    },
    "fr-FR": {
      "name": "Découverte à l'Entraînement",
      "description": "Révélation d'un nouveau geste technique enrichissant instantanément votre registre."
    }
  },
  "card-career-temp-positive-1": {
    "en-GB": {
      "name": "Purple Patch Scoring Spree",
      "description": "You enter a transcendent 6-month goalscoring zone where everything you touch hits the back of the net."
    },
    "es-ES": {
      "name": "Racha Goleadora de Oro",
      "description": "Estado de gracia durante 6 meses donde cada balón que tocas dentro del área termina en gol."
    },
    "es-AR": {
      "name": "Racha de Oro Goleadora",
      "description": "Seis meses en estado de gracia donde pelota que tocás en el área termina adentro."
    },
    "pt-BR": {
      "name": "Fase Iluminada de Gols",
      "description": "Fase mágica de 6 meses onde cada bola que você toca dentro da grande área estufa a rede."
    },
    "fr-FR": {
      "name": "Période Bénie devant le But",
      "description": "État de grâce de 6 mois où chaque ballon touché dans la surface se transforme en but."
    }
  },
  "card-career-temp-negative-1": {
    "en-GB": {
      "name": "Tactical Freefall & Crisis",
      "description": "Managerial crisis and tactical changes leave you isolated and out of form for 6 tough months."
    },
    "es-ES": {
      "name": "Crisis y Caída Táctica",
      "description": "Sequía y desconcierto durante 6 meses donde los esquemas tácticos no fluyen en el campo."
    },
    "es-AR": {
      "name": "Crisis y Descalabro Táctico",
      "description": "Seis meses donde no sale una y el equipo se pierde en la cancha."
    },
    "pt-BR": {
      "name": "Crise Tática e Queda",
      "description": "Sequência turbulenta de 6 meses onde nada funciona e a equipe se perde no gramado."
    },
    "fr-FR": {
      "name": "Crise Tactique Prolongée",
      "description": "Période difficile de 6 mois durant laquelle les plans de jeu collectifs peinent à se mettre en place."
    }
  },
  "card-career-temp-double-1": {
    "en-GB": {
      "name": "Contract Year Glory Hunt",
      "description": "Playing for a monster new contract. You hog the ball and shoot from everywhere for a full season."
    },
    "es-ES": {
      "name": "Caza de Gloria en Año de Contrato",
      "description": "Último año de contrato que desata ambición goleadora individual feroz por encima del plan colectivo."
    },
    "es-AR": {
      "name": "Año de Contrato y Obsesión",
      "description": "Último año de contrato: mostrás todo para un pase millonario sacrificando el orden táctico."
    },
    "pt-BR": {
      "name": "Temporada de Renovação em Alta",
      "description": "Último ano de contrato: busca frenética por destaque individual e números expressivos."
    },
    "fr-FR": {
      "name": "Chasse à la Gloire en Fin de Contrat",
      "description": "Dernière année de contrat: ambitions individuelles accrues pour décrocher le gros lot au détriment du collectif."
    }
  },
  "card-life-0": {
    "en-GB": {
      "name": "Smart Investment",
      "description": "You receive advice from someone who understands money and make a small investment."
    },
    "es-ES": {
      "name": "Inversión Inteligente",
      "description": "Recibes asesoramiento financiero de calidad y colocas tus ahorros en un proyecto rentable."
    },
    "es-AR": {
      "name": "Inversión Inteligente",
      "description": "Te asesorás con gente seria de números y ponés la plata en un negocio seguro y rentable."
    },
    "pt-BR": {
      "name": "Investimento Inteligente",
      "description": "Orientação financeira de qualidade colocando suas economias em aplicações seguras."
    },
    "fr-FR": {
      "name": "Investissement Intelligent",
      "description": "Conseils avisés pour placer vos économies dans un projet financier solide et rentable."
    }
  },
  "card-life-1": {
    "en-GB": {
      "name": "Family Support",
      "description": "Your family helps you during an important period of your career."
    },
    "es-ES": {
      "name": "Apoyo Familiar",
      "description": "Tu familia te arropa en un momento importante de tu carrera deportiva."
    },
    "es-AR": {
      "name": "Banca Familiar",
      "description": "Tu familia te banca y te acompaña en una etapa clave de tu carrera."
    },
    "pt-BR": {
      "name": "Apoio da Família",
      "description": "Sua família acolhe e apoia você em um momento decisivo da carreira esportiva."
    },
    "fr-FR": {
      "name": "Soutien Familial",
      "description": "Votre entourage familial vous entoure et vous stabilise lors d'une phase charnière de votre carrière."
    }
  },
  "card-life-2": {
    "en-GB": {
      "name": "Private Trainer",
      "description": "You hire a specialist trainer to work on your physical condition."
    },
    "es-ES": {
      "name": "Preparador Físico Personal",
      "description": "Contratas a un preparador especialista para afinar tu rendimiento físico individual."
    },
    "es-AR": {
      "name": "Preparador Físico Personal",
      "description": "Contratás a un profe particular para potenciar tu físico y prevenir lesiones."
    },
    "pt-BR": {
      "name": "Preparador Físico Particular",
      "description": "Contratação de um profissional dedicado para aprimorar sua forma atlética."
    },
    "fr-FR": {
      "name": "Préparateur Privé",
      "description": "Recrutement d'un préparateur physique attitré pour optimiser votre condition athlétique."
    }
  },
  "card-life-3": {
    "en-GB": {
      "name": "Recovery Retreat",
      "description": "You spend several days recovering away from football."
    },
    "es-ES": {
      "name": "Retiro de Descanso",
      "description": "Pasas varios días desconectando y recargando energías lejos del bullicio del fútbol."
    },
    "es-AR": {
      "name": "Descanso en la Naturaleza",
      "description": "Te tomás unos días en el campo para despejar la cabeza y renovar energías."
    },
    "pt-BR": {
      "name": "Retiro de Descanso",
      "description": "Dias de descanso longe do burburinho da bola para renovar corpo e mente."
    },
    "fr-FR": {
      "name": "Séjour de Récupération",
      "description": "Plusieurs jours de calme absolu loin du tumulte médiatique pour régénérer le corps et l'esprit."
    }
  },
  "card-life-4": {
    "en-GB": {
      "name": "Nutrition Plan",
      "description": "A professional nutritionist creates a personalized diet."
    },
    "es-ES": {
      "name": "Plan de Nutrición",
      "description": "Un nutricionista deportivo profesional diseña un menú adaptado a tu metabolismo."
    },
    "es-AR": {
      "name": "Dieta Deportiva de Élite",
      "description": "Un nutricionista deportivo te arma un plan de comidas a medida de tu desgaste."
    },
    "pt-BR": {
      "name": "Plano de Nutrição",
      "description": "Um nutricionista esportivo monta uma dieta personalizada para seu metabolismo."
    },
    "fr-FR": {
      "name": "Plan Nutritionnel",
      "description": "Un nutritionniste élabore un programme alimentaire sur-mesure adapté à vos besoins énergétiques."
    }
  },
  "card-life-5": {
    "en-GB": {
      "name": "Local Hero",
      "description": "Your actions in your hometown receive positive attention."
    },
    "es-ES": {
      "name": "Ídolo Local",
      "description": "Una visita cercana a tu barrio de origen alegra a los jóvenes de la zona."
    },
    "es-AR": {
      "name": "Héroe del Barrio",
      "description": "Te das una vuelta por el club de barrio y los pibes se vuelven locos de alegría."
    },
    "pt-BR": {
      "name": "Herói da Quebrada",
      "description": "Uma visita ao seu bairro de infância traz esperança e alegria aos jovens da região."
    },
    "fr-FR": {
      "name": "Héros Local",
      "description": "Une visite dans votre quartier d'enfance inspire la jeunesse et renforce votre cote d'amour."
    }
  },
  "card-life-6": {
    "en-GB": {
      "name": "Viral Moment",
      "description": "A harmless moment involving you goes viral for all the right reasons."
    },
    "es-ES": {
      "name": "Momento Viral Simpático",
      "description": "Un vídeo divertido en redes sociales muestra tu lado más humano y cercano."
    },
    "es-AR": {
      "name": "Momento Viral Espontáneo",
      "description": "Un video tuyo en redes mostrando tu lado familiero se llena de comentarios positivos."
    },
    "pt-BR": {
      "name": "Momento Viral Espontâneo",
      "description": "Um vídeo descontraído nas redes sociais exibe seu lado humilde e carismático."
    },
    "fr-FR": {
      "name": "Moment Viral Positif",
      "description": "Une courte vidéo naturelle sur les réseaux sociaux dévoile votre personnalité chaleureuse."
    }
  },
  "card-life-7": {
    "en-GB": {
      "name": "Charity Match",
      "description": "You participate in a charity event."
    },
    "es-ES": {
      "name": "Partido Benéfico",
      "description": "Participas en un encuentro benéfico recaudando fondos para causas sociales."
    },
    "es-AR": {
      "name": "Picado Solidario",
      "description": "Jugás un partido a beneficio en las vacaciones para ayudar a comedores comunitarios."
    },
    "pt-BR": {
      "name": "Jogo Beneficente",
      "description": "Participação em partida solidária arrecadando fundos para causas sociais importantes."
    },
    "fr-FR": {
      "name": "Match de Gala Caritatif",
      "description": "Participation à un match caritatif mobilisant des fonds pour des causes solidaires."
    }
  },
  "card-life-8": {
    "en-GB": {
      "name": "Mentor",
      "description": "A former professional player takes an interest in your development."
    },
    "es-ES": {
      "name": "Consejos de un Maestro",
      "description": "Un exfutbolista consagrado te brinda valiosos consejos sobre cómo gestionar tu carrera."
    },
    "es-AR": {
      "name": "La Charla con el Ídolo",
      "description": "Un consagrado de Primera te sienta a tomar unos mates y te enseña los códigos del fútbol."
    },
    "pt-BR": {
      "name": "Conselhos de um Mentor",
      "description": "Um ex-jogador consagrado dá dicas preciosas sobre como gerir a carreira profissional."
    },
    "fr-FR": {
      "name": "Mentor Bienveillant",
      "description": "Un ancien grand nom du football prend le temps de vous transmettre son expérience du très haut niveau."
    }
  },
  "card-life-9": {
    "en-GB": {
      "name": "New Apartment",
      "description": "You move into a better living environment."
    },
    "es-ES": {
      "name": "Nuevo Hogar",
      "description": "Te instalas en una vivienda más cómoda y tranquila cerca de las instalaciones del club."
    },
    "es-AR": {
      "name": "Casa Nueva y Tranquila",
      "description": "Te mudás a un departamento más amplio y cerca del predio de entrenamiento."
    },
    "pt-BR": {
      "name": "Apartamento Novo",
      "description": "Mudança para um imóvel mais espaçoso e sossegado perto do centro de treinamento."
    },
    "fr-FR": {
      "name": "Nouveau Foyer",
      "description": "Installation dans un logement moderne et paisible à proximité des infrastructures du club."
    }
  },
  "card-life-10": {
    "en-GB": {
      "name": "Financial Discipline",
      "description": "You decide to stop wasting money and start managing your finances properly."
    },
    "es-ES": {
      "name": "Disciplina Financiera",
      "description": "Aprendes a gestionar tus ingresos evitando gastos innecesarios o impulsivos."
    },
    "es-AR": {
      "name": "Educación Financiera",
      "description": "Aprendés a cuidar el bolsillo y no patinarte la plata en caprichos pasajeros."
    },
    "pt-BR": {
      "name": "Disciplina Financeira",
      "description": "Controle rigoroso dos seus ganhos evitando compras impulsivas e supérfluas."
    },
    "fr-FR": {
      "name": "Rigueur Financière",
      "description": "Excellente gestion de vos revenus évitant les dépenses superflues et ostentatoires."
    }
  },
  "card-life-11": {
    "en-GB": {
      "name": "Perfect Routine",
      "description": "You establish a disciplined daily routine."
    },
    "es-ES": {
      "name": "Rutina Impecable",
      "description": "Horarios de sueño regulares y descanso ordenado que potencian tu rendimiento."
    },
    "es-AR": {
      "name": "Rutina de Profesional",
      "description": "Descanso ordenado, siestas a horario y cero salidas que te dejan 10 puntos en la cancha."
    },
    "pt-BR": {
      "name": "Rotina Impecável",
      "description": "Hábitos de sono regulares e disciplina diária que potencializam seu rendimento nos jogos."
    },
    "fr-FR": {
      "name": "Hygiène de Vie Modèle",
      "description": "Sommeil réparateur et rythmes biologiques respectés qui décuplent votre fraîcheur en match."
    }
  },
  "card-life-12": {
    "en-GB": {
      "name": "Childhood Friend Returns",
      "description": "Someone important from your childhood reconnects with you."
    },
    "es-ES": {
      "name": "Reencuentro con Amigos de la Infancia",
      "description": "Tus amigos de siempre te visitan y te recuerdan de dónde vienes."
    },
    "es-AR": {
      "name": "Asado con los Pibes de Siempre",
      "description": "Los pibes del barrio vienen a visitarte y te recuerdan quién sos y de dónde saliste."
    },
    "pt-BR": {
      "name": "Amigos de Infância",
      "description": "Seus amigos de longa data visitam você e ajudam a manter a humildade e a essência."
    },
    "fr-FR": {
      "name": "Retrouvailles d'Enfance",
      "description": "Vos amis de jeunesse viennent vous rendre visite et vous reconnectent à vos racines."
    }
  },
  "card-life-13": {
    "en-GB": {
      "name": "Media Training",
      "description": "You receive professional media training."
    },
    "es-ES": {
      "name": "Preparación para Medios",
      "description": "Aprendes a desenvolverte con soltura y tranquilidad ante micrófonos y cámaras."
    },
    "es-AR": {
      "name": "Fogueo con la Prensa",
      "description": "Aprendés a declarar tranquilo ante las cámaras sin pisar ningún palito periodístico."
    },
    "pt-BR": {
      "name": "Media Training",
      "description": "Treinamento especializado para falar bem diante das câmeras e jornalistas sem tropeços."
    },
    "fr-FR": {
      "name": "Média Training",
      "description": "Formation à la communication pour s'exprimer avec aisance et sérénité face aux micros."
    }
  },
  "card-life-14": {
    "en-GB": {
      "name": "First Luxury Purchase",
      "description": "You finally buy something you have dreamed about since childhood."
    },
    "es-ES": {
      "name": "Primer Detalle de Lujo",
      "description": "Te das un capricho merecido tras meses de sacrificio deportivo."
    },
    "es-AR": {
      "name": "Primer Gusto Personal",
      "description": "Te comprás un gusto que siempre soñaste tras romperte el lomo en la cancha."
    },
    "pt-BR": {
      "name": "Primeiro Luxo Merecido",
      "description": "Você se dá um presente merecido após meses de muito empenho no gramado."
    },
    "fr-FR": {
      "name": "Premier Plaisir Mérité",
      "description": "Un achat plaisir bien mérité récompensant des mois de sacrifices sur le terrain."
    }
  },
  "card-life-15": {
    "en-GB": {
      "name": "Personal Chef",
      "description": "You hire someone to handle your meals."
    },
    "es-ES": {
      "name": "Cocinero Personal",
      "description": "Contratas a un profesional de cocina que prepara menús saludables a diario."
    },
    "es-AR": {
      "name": "Cocinero Personal",
      "description": "Contratás a un chef para que te prepare comida sana y rica todos los días."
    },
    "pt-BR": {
      "name": "Chef de Cozinha Particular",
      "description": "Contratação de um chef para preparar refeições saudáveis e balanceadas em casa."
    },
    "fr-FR": {
      "name": "Chef à Domicile",
      "description": "Recrutement d'un cuisinier personnel pour assurer des repas sains et équilibrés au quotidien."
    }
  },
  "card-life-16": {
    "en-GB": {
      "name": "Quiet Weekend",
      "description": "You turn down the nightlife and stay home."
    },
    "es-ES": {
      "name": "Fin de Semana de Relax",
      "description": "Dos días completos de desconexión total para despejar cuerpo y mente."
    },
    "es-AR": {
      "name": "Finde Desconectado",
      "description": "Dos días enteros de paz y campo para limpiar la cabeza de tensiones."
    },
    "pt-BR": {
      "name": "Fim de Semana Zen",
      "description": "Dois dias inteiros de descanso total recarregando as baterias com calma."
    },
    "fr-FR": {
      "name": "Week-end Paisible",
      "description": "Deux journées complètes de détente totale pour faire le vide et aborder le match reposé."
    }
  },
  "card-life-17": {
    "en-GB": {
      "name": "Community Project",
      "description": "You invest time and money into your local community."
    },
    "es-ES": {
      "name": "Iniciativa Comunitaria",
      "description": "Financias una escuela deportiva local para brindar oportunidades a otros jóvenes."
    },
    "es-AR": {
      "name": "Canchita Comunitaria",
      "description": "Ponés plata para arreglar la canchita del barrio para que jueguen los pibes de la zona."
    },
    "pt-BR": {
      "name": "Ação Social no Bairro",
      "description": "Apoio a uma escolinha esportiva comunitária oferecendo futuro para a molecada."
    },
    "fr-FR": {
      "name": "Projet Solidaire",
      "description": "Financement d'une école de football de quartier pour offrir des opportunités aux jeunes."
    }
  },
  "card-life-18": {
    "en-GB": {
      "name": "Financial Advisor",
      "description": "You hire a professional financial advisor."
    },
    "es-ES": {
      "name": "Asesor de Patrimonio",
      "description": "Un consultor acreditado diseña una estrategia de ahorro e inversión a largo plazo."
    },
    "es-AR": {
      "name": "Asesor Patrimonial",
      "description": "Un contador de confianza te arma una estrategia financiera para el día de mañana."
    },
    "pt-BR": {
      "name": "Consultor de Patrimônio",
      "description": "Um especialista financeiro traça uma estratégia sólida para o futuro da sua família."
    },
    "fr-FR": {
      "name": "Conseiller Patrimonial",
      "description": "Un spécialiste accrédité structure votre patrimoine pour garantir la sécurité de vos proches."
    }
  },
  "card-life-19": {
    "en-GB": {
      "name": "Recovery Technology",
      "description": "You purchase advanced recovery equipment."
    },
    "es-ES": {
      "name": "Cápsula de Recuperación",
      "description": "Adquieres equipamiento de crioterapia y descanso avanzado para uso doméstico."
    },
    "es-AR": {
      "name": "Tecnología de Recuperación",
      "description": "Comprás botas de presoterapia y bañera de hielo para recuperar en casa como un crack."
    },
    "pt-BR": {
      "name": "Aparelhos de Fisioterapia",
      "description": "Equipamentos modernos de crioterapia em casa para acelerar a recuperação muscular."
    },
    "fr-FR": {
      "name": "Équipements de Récupération",
      "description": "Installation d'équipements de cryothérapie à domicile pour écourter la récupération physique."
    }
  },
  "card-life-20": {
    "en-GB": {
      "name": "Healthy Relationship",
      "description": "A stable relationship gives you greater emotional stability."
    },
    "es-ES": {
      "name": "Estabilidad Sentimental",
      "description": "Una relación sentimental sana y madura te aporta serenidad en el día a día."
    },
    "es-AR": {
      "name": "Compañera de Vida",
      "description": "Una pareja compañera que te banca en las buenas y en las malas te da paz mental."
    },
    "pt-BR": {
      "name": "Relacionamento Saudável",
      "description": "Um relacionamento maduro e parceiro trazendo equilíbrio e tranquilidade emocional."
    },
    "fr-FR": {
      "name": "Équilibre Affectif",
      "description": "Une vie de couple saine et complice vous apporte une indispensable sérénité au quotidien."
    }
  },
  "card-life-21": {
    "en-GB": {
      "name": "Personal Brand",
      "description": "You begin carefully building your own public identity."
    },
    "es-ES": {
      "name": "Marca Personal Consolidada",
      "description": "Tu imagen pública profesional atrae acuerdos comerciales respetuosos con tus valores."
    },
    "es-AR": {
      "name": "Marca Personal Propia",
      "description": "Tu perfil serio y profesional atrae convenios con marcas que respetan tu estilo."
    },
    "pt-BR": {
      "name": "Marca Própria em Alta",
      "description": "Sua postura exemplar atrai parcerias comerciais alinhadas aos seus valores éticos."
    },
    "fr-FR": {
      "name": "Marque Personnelle Valorisé",
      "description": "Une image publique exemplaire qui attire des partenaires commerciaux valorisants."
    }
  },
  "card-life-22": {
    "en-GB": {
      "name": "Study the Game",
      "description": "You spend your free time studying football instead of partying."
    },
    "es-ES": {
      "name": "Estudio de Rivales",
      "description": "Dedicas tus tardes libres a analizar vídeos tácticos de los próximos contrincantes."
    },
    "es-AR": {
      "name": "Mirar Fútbol y Analizar",
      "description": "Te pasás las tardes mirando cómo marcan los centrales del próximo rival."
    },
    "pt-BR": {
      "name": "Estudo dos Adversários",
      "description": "Horas vagas dedicadas a assistir a vídeos dos próximos adversários para antecipar jogadas."
    },
    "fr-FR": {
      "name": "Visionnage Tactique",
      "description": "Visionnage minutieux des vidéos des prochains adversaires pour déceler leurs failles."
    }
  },
  "card-life-23": {
    "en-GB": {
      "name": "Generous Gesture",
      "description": "You quietly help someone in need without seeking publicity."
    },
    "es-ES": {
      "name": "Gesto Solidario Anónimo",
      "description": "Ayudas económicamente a familias necesitadas sin buscar publicidad ni fotos."
    },
    "es-AR": {
      "name": "Mano Solidaria en Silencio",
      "description": "Le das una mano económica a familias que la pasan mal sin avisarle a nadie."
    },
    "pt-BR": {
      "name": "Solidariedade sem Alarde",
      "description": "Ajuda financeira a pessoas necessitadas sem alarde nem exibicionismo."
    },
    "fr-FR": {
      "name": "Générosité Discrète",
      "description": "Aide financière anonyme accordée à des familles en difficulté loin des caméras."
    }
  },
  "card-life-24": {
    "en-GB": {
      "name": "Big Break Lifestyle",
      "description": "Your growing success allows you to improve several areas of your life simultaneously."
    },
    "es-ES": {
      "name": "Excesos del Éxito",
      "description": "El estilo de vida acomodado comienza a restarte hambre competitiva en los entrenamientos."
    },
    "es-AR": {
      "name": "La Buena Vida Te Aburguesa",
      "description": "Tanta comodidad y salidas te hacen perder ese fuego sagrado de comerte la cancha."
    },
    "pt-BR": {
      "name": "Ilusão do Luxo",
      "description": "O conforto excessivo da fama começa a tirar sua fome de vitória nos treinamentos."
    },
    "fr-FR": {
      "name": "Excès de Confort",
      "description": "Le train de vie princier commence à émousser votre mordant et votre faim de victoires."
    }
  },
  "card-life-25": {
    "en-GB": {
      "name": "Expensive Night Out",
      "description": "You spend far more than you intended during a night out."
    },
    "es-ES": {
      "name": "Noche de Fiesta Cara",
      "description": "Una factura desmedida en un club exclusivo te deja con dolor de cabeza y de bolsillo."
    },
    "es-AR": {
      "name": "Salida Nocturna Costosa",
      "description": "Una noche de copas con conocidos interesados te cuesta una fortuna de la nada."
    },
    "pt-BR": {
      "name": "Noitada Salgada",
      "description": "Conta astronômica em balada exclusiva pesando no bolso e deixando ressaca no treino."
    },
    "fr-FR": {
      "name": "Soirée Hors de Prix",
      "description": "Une note salée en boîte de nuit qui pèse sur les finances et laisse des traces à l'entraînement."
    }
  },
  "card-life-26": {
    "en-GB": {
      "name": "Bad Purchase",
      "description": "You buy an expensive item that turns out to be almost worthless."
    },
    "es-ES": {
      "name": "Capricho Inútil",
      "description": "Gastas una suma importante en un objeto extravagante del que te arrepientes al instante."
    },
    "es-AR": {
      "name": "Gasto al Cuete",
      "description": "Te comprás algo carísimo e inútil que al otro día tenés tirado en un rincón."
    },
    "pt-BR": {
      "name": "Compra por Impulso",
      "description": "Gasto volumoso em um item supérfluo que logo perde a graça e fica encostado."
    },
    "fr-FR": {
      "name": "Achat Inconsidéré",
      "description": "Une dépense colossale pour un bien superflu dont vous regrettez l'acquisition dès le lendemain."
    }
  },
  "card-life-27": {
    "en-GB": {
      "name": "Party Photos",
      "description": "Photos from a private party appear online."
    },
    "es-ES": {
      "name": "Fotografías Nocturnas Filtradas",
      "description": "Imágenes tuyas en una fiesta a deshoras se publican en internet y causan revuelo."
    },
    "es-AR": {
      "name": "Fotos de Boliche en Redes",
      "description": "Te sacan fotos en un boliche de madrugada y se arma lío en los medios deportivos."
    },
    "pt-BR": {
      "name": "Fotos de Balada Vazadas",
      "description": "Fotos curtindo noitada tarde da noite vazam na internet e irritam a diretoria."
    },
    "fr-FR": {
      "name": "Clichés Nocturnes Ébruités",
      "description": "Des photos de vous en soirée festive filtrent sur les réseaux et font jaser les supporters."
    }
  },
  "card-life-28": {
    "en-GB": {
      "name": "Wrong Crowd",
      "description": "You begin spending time with people who create problems around you."
    },
    "es-ES": {
      "name": "Amistades Tóxicas",
      "description": "Un grupo de conocidos interesados te distrae de tus metas profesionales."
    },
    "es-AR": {
      "name": "Los Amigos del Campeón",
      "description": "Gente interesada que aparece cuando brillas y te saca del foco de entrenar."
    },
    "pt-BR": {
      "name": "Amizades por Interesse",
      "description": "Pessoas aproveitadoras ao seu redor tentando tirar vantagem da sua fama e dinheiro."
    },
    "fr-FR": {
      "name": "Mauvais Entourage",
      "description": "De prétendus amis intéressés qui profitent de vos succès et vous détournent du terrain."
    }
  },
  "card-life-29": {
    "en-GB": {
      "name": "Financial Mistake",
      "description": "You make a poor financial decision."
    },
    "es-ES": {
      "name": "Despiste Administrativo",
      "description": "Una multa o recargo imprevisto por desatender la gestión de tus cuentas bancarias."
    },
    "es-AR": {
      "name": "Descuido con los Números",
      "description": "Te llega una deuda impositiva por colgarte con los papeles del banco."
    },
    "pt-BR": {
      "name": "Prejuízo com Multas",
      "description": "Multas e taxas inesperadas por falta de atenção na conferência das contas bancárias."
    },
    "fr-FR": {
      "name": "Étourderie Administrative",
      "description": "Rappels et pénalités de retard suite à un suivi négligent de vos obligations fiscales."
    }
  },
  "card-life-30": {
    "en-GB": {
      "name": "Missed Opportunity",
      "description": "A personal commitment causes you to miss an important development opportunity."
    },
    "es-ES": {
      "name": "Oportunidad Desaprovechada",
      "description": "Llegas tarde a una reunión comercial relevante por quedarte dormido."
    },
    "es-AR": {
      "name": "Reunión Comercial Perdida",
      "description": "Te dormiste y te perdiste una charla con una marca que quería poner plata en vos."
    },
    "pt-BR": {
      "name": "Reunião Perdida",
      "description": "Chegada atrasada a um compromisso comercial importante prejudica um ótimo acordo."
    },
    "fr-FR": {
      "name": "Rendez-vous Manqué",
      "description": "Un réveil tardif vous fait manquer une opportunité de partenariat commercial majeure."
    }
  },
  "card-life-31": {
    "en-GB": {
      "name": "Exhausting Lifestyle",
      "description": "Your personal life begins interfering with your recovery."
    },
    "es-ES": {
      "name": "Ritmo de Vida Agotador",
      "description": "Demasiados compromisos sociales y eventos que te dejan sin tiempo de descanso."
    },
    "es-AR": {
      "name": "Agenda Sobrecargada",
      "description": "Eventos, salidas y compromisos sociales que te dejan las piernas sin fuerza para jugar."
    },
    "pt-BR": {
      "name": "Agenda Exaustiva",
      "description": "Excesso de eventos e viagens sociais deixando você sem energia física para atuar."
    },
    "fr-FR": {
      "name": "Vie Sociale Épuisante",
      "description": "Trop d'obligations mondaines qui entament votre temps de récupération physique."
    }
  },
  "card-life-32": {
    "en-GB": {
      "name": "Social Media Disaster",
      "description": "You post something you immediately regret."
    },
    "es-ES": {
      "name": "Metedura de Pata en Redes",
      "description": "Un comentario desafortunado en redes sociales incendia las críticas de la afición."
    },
    "es-AR": {
      "name": "Patinazo en Redes Sociales",
      "description": "Escribís un tweet en caliente que cae pésimo en los hinchas y el club."
    },
    "pt-BR": {
      "name": "Polêmica na Internet",
      "description": "Postagem infeliz nas redes sociais gerando repercussão negativa com os torcedores."
    },
    "fr-FR": {
      "name": "Dérapage Numérique",
      "description": "Une publication imprudente sur les réseaux sociaux déclenche la bronca des supporters."
    }
  },
  "card-life-33": {
    "en-GB": {
      "name": "Unwanted Attention",
      "description": "Your growing fame attracts unwanted attention."
    },
    "es-ES": {
      "name": "Acoso de la Prensa Rosa",
      "description": "Periodistas del corazón hacen guardia frente a tu vivienda buscando polémicas."
    },
    "es-AR": {
      "name": "Paparazzis en la Puerta",
      "description": "Periodistas de farándula te montan guardia en la vereda buscando sacarte de quicio."
    },
    "pt-BR": {
      "name": "Assédio dos Fotógrafos",
      "description": "Paparazzis de plantão na porta da sua residência invadindo sua privacidade."
    },
    "fr-FR": {
      "name": "Harcèlement Médiatique",
      "description": "Des photographes people font le pied de grue devant chez vous, perturbant votre quiétude."
    }
  },
  "card-life-34": {
    "en-GB": {
      "name": "Bad Investment",
      "description": "An investment loses money."
    },
    "es-ES": {
      "name": "Negocio Ruinoso",
      "description": "Prestas dinero a un conocido para un negocio sin garantías que acaba quebrando."
    },
    "es-AR": {
      "name": "Negocio Fallido",
      "description": "Le prestás plata a un conocido para un proyecto que termina en la nada y no ves un peso."
    },
    "pt-BR": {
      "name": "Investimento Furado",
      "description": "Empréstimo a um conhecido para um negócio frágil que vai à falência rapidamente."
    },
    "fr-FR": {
      "name": "Investissement Bancal",
      "description": "Argent prêté à une connaissance pour une affaire fumeuse qui s'avère un fiasco total."
    }
  },
  "card-life-35": {
    "en-GB": {
      "name": "Family Disagreement",
      "description": "A serious disagreement affects your personal stability."
    },
    "es-ES": {
      "name": "Disputa Familiar",
      "description": "Diferencias de criterio económico con allegados generan momentos de tensión."
    },
    "es-AR": {
      "name": "Tensión Familiar por Plata",
      "description": "Discusiones en la familia por pedidos de plata que calientan los ánimos."
    },
    "pt-BR": {
      "name": "Divergência Familiar",
      "description": "Desentendimentos por questões financeiras gerando estresse e clima pesado em casa."
    },
    "fr-FR": {
      "name": "Conflit d'Ordre Financier",
      "description": "Désaccords d'argent avec des proches provoquant des tensions familiales désagréables."
    }
  },
  "card-life-36": {
    "en-GB": {
      "name": "Burnout",
      "description": "You have pushed yourself too hard outside football."
    },
    "es-ES": {
      "name": "Agotamiento Emocional",
      "description": "La exigencia constante del entorno profesional provoca fatiga mental acusada."
    },
    "es-AR": {
      "name": "Saturación Mental",
      "description": "Tanta presión mediática y deportiva te satura la cabeza y te deja sin ganas de entrenar."
    },
    "pt-BR": {
      "name": "Esgotamento Psicológico",
      "description": "A cobrança diária da profissão provoca estresse elevado e cansaço psicológico."
    },
    "fr-FR": {
      "name": "Burnout Émotionnel",
      "description": "La pression continue et les sollicitations incessantes génèrent une fatigue mentale profonde."
    }
  },
  "card-life-37": {
    "en-GB": {
      "name": "Reckless Purchase",
      "description": "You buy an expensive luxury item you cannot really afford."
    },
    "es-ES": {
      "name": "Compra Precipitada",
      "description": "Adquieres un vehículo o propiedad con sobreprecio y costes de mantenimiento desorbitados."
    },
    "es-AR": {
      "name": "Compra Caliente",
      "description": "Comprás un auto deportivo carísimo cuyos gastos de mantenimiento te sangran la cuenta."
    },
    "pt-BR": {
      "name": "Compra Impensada",
      "description": "Compra impulsiva de um veículo caro com custos de manutenção exorbitantes."
    },
    "fr-FR": {
      "name": "Acquisition Hors de Prix",
      "description": "Achat coup de tête d'un bolide dont les coûts d'entretien se révèlent prohibitifs."
    }
  },
  "card-life-38": {
    "en-GB": {
      "name": "Public Argument",
      "description": "You are involved in an argument that becomes public."
    },
    "es-ES": {
      "name": "Discusión en Lugar Público",
      "description": "Un desencuentro acalorado en un restaurante trasciende a los medios de comunicación."
    },
    "es-AR": {
      "name": "Escándalo en un Restaurante",
      "description": "Te cruzás mal con alguien en un restaurante y los comensales lo filman con el celular."
    },
    "pt-BR": {
      "name": "Bate-boca em Público",
      "description": "Discussão acalorada em local público filmada por clientes e repercutida na imprensa."
    },
    "fr-FR": {
      "name": "Altercation Publique",
      "description": "Une prise de bec animée dans un restaurant attire les regards et fait la une de la presse."
    }
  },
  "card-life-39": {
    "en-GB": {
      "name": "Lifestyle Spiral",
      "description": "Several small bad decisions begin accumulating."
    },
    "es-ES": {
      "name": "Espiral de Descontrol",
      "description": "Una sucesión de salidas nocturnas perjudica seriamente tu rendimiento los domingos."
    },
    "es-AR": {
      "name": "Bucle de Descontrol",
      "description": "Una seguidilla de salidas y joda te pasa factura cuando tenés que picar en el partido."
    },
    "pt-BR": {
      "name": "Descontrole na Rotina",
      "description": "Sucessão de noitadas e descuidos físicos prejudicando o rendimento nas partidas."
    },
    "fr-FR": {
      "name": "Spirale Négative",
      "description": "Une série de sorties festives nuit gravement à votre fraîcheur lors des matchs du dimanche."
    }
  },
  "card-life-40": {
    "en-GB": {
      "name": "Luxury Lifestyle",
      "description": "You embrace the celebrity lifestyle."
    },
    "es-ES": {
      "name": "Vida de Lujo y Glamour",
      "description": "Te codeas con la alta sociedad aumentando tu prestigio pero disparando tus gastos."
    },
    "es-AR": {
      "name": "Vida de Estrella y Lujos",
      "description": "Te codeás con los famosos y la alta sociedad, ganando nombre pero gastando fortuna."
    },
    "pt-BR": {
      "name": "Vida de Luxo e Glamour",
      "description": "Círculo social de alto padrão ampliando seu status com gastos muito elevados."
    },
    "fr-FR": {
      "name": "Fastes et Glamour",
      "description": "Fréquentation de cercles huppés rehaussant votre prestige au prix de dépenses somptuaires."
    }
  },
  "card-life-41": {
    "en-GB": {
      "name": "Nightlife King",
      "description": "You become one of the biggest personalities in the city's nightlife."
    },
    "es-ES": {
      "name": "Rey de la Noche",
      "description": "Celebraciones espectaculares que te hacen popular entre amigos pero pasan factura física."
    },
    "es-AR": {
      "name": "Dueño de la Noche",
      "description": "Sos el alma de cada fiesta privada, ganando popularidad pero perdiendo frescura física."
    },
    "pt-BR": {
      "name": "Rei da Noite",
      "description": "Festas animadas onde você é o centro das atenções, cobrando o preço no treino matinal."
    },
    "fr-FR": {
      "name": "Roi de la Nuit",
      "description": "Des nuits endiablées qui forgent votre réputation festive mais entament votre capital physique."
    }
  },
  "card-life-42": {
    "en-GB": {
      "name": "Risky Investment",
      "description": "You invest a large portion of your money into a speculative opportunity."
    },
    "es-ES": {
      "name": "Inversión Arriesgada",
      "description": "Apuestas fuerte por una empresa emergente con potencial millonario o riesgo de quiebra."
    },
    "es-AR": {
      "name": "Inversión de Alto Riesgo",
      "description": "Metés buena guita en una startup que puede darte millones o esfumarse."
    },
    "pt-BR": {
      "name": "Aposta de Alto Risco",
      "description": "Investimento vultoso em projeto audacioso com enorme potencial de retorno ou perda total."
    },
    "fr-FR": {
      "name": "Pari Financier Audacieux",
      "description": "Mise d'une somme rondelette dans une jeune pousse à très haut rendement potentiel ou risque de perte."
    }
  },
  "card-life-43": {
    "en-GB": {
      "name": "Celebrity Relationship",
      "description": "You begin a highly public relationship with another famous person."
    },
    "es-ES": {
      "name": "Romance Mediático",
      "description": "Inicias una relación con una celebridad de la moda atrayendo focos y comentarios diarios."
    },
    "es-AR": {
      "name": "Noviazgo con Modelo Famosa",
      "description": "Te ponés de novio con una famosa: las tapas de revistas explotan de fotos de ustedes."
    },
    "pt-BR": {
      "name": "Romance com Celebridade",
      "description": "Namoro com figura pública famosa atraindo holofotes da mídia e opiniões de terceiros."
    },
    "fr-FR": {
      "name": "Idylle Sous les Projecteurs",
      "description": "Une relation amoureuse avec une personnalité en vue focalise l'attention constante des médias."
    }
  },
  "card-life-44": {
    "en-GB": {
      "name": "Extreme Training Camp",
      "description": "You pay for an elite private training camp."
    },
    "es-ES": {
      "name": "Campo de Entrenamiento Extremo",
      "description": "Contratas un preparador militar en tus vacaciones: fortaleza de hierro pero fatiga límite."
    },
    "es-AR": {
      "name": "Pretemporada Militar Privada",
      "description": "Te encerrás en vacaciones con un profe durísimo: te hacés una roca pero terminás exhausto."
    },
    "pt-BR": {
      "name": "Treinamento Extremo nas Férias",
      "description": "Rotina militar nas férias forjando físico de aço com desgaste de energia considerável."
    },
    "fr-FR": {
      "name": "Stage Extrême Hors Saison",
      "description": "Stage physique façon commando durant les vacances: musculature d'acier au prix d'un épuisement latent."
    }
  },
  "card-life-45": {
    "en-GB": {
      "name": "Luxury Car",
      "description": "You purchase an extremely expensive sports car."
    },
    "es-ES": {
      "name": "Superdeportivo de Alta Gama",
      "description": "Comprar el deportivo de tus sueños te da estatus pero atrae miradas de recelo."
    },
    "es-AR": {
      "name": "Fierro Deportivo de Colección",
      "description": "Te comprás una máquina deportiva impresionante: fachero en la calle pero foco de envidias."
    },
    "pt-BR": {
      "name": "Supercarro Esportivo",
      "description": "Comprar um supercarro dos sonhos impõe respeito estético, mas atrai inveja nos bastidores."
    },
    "fr-FR": {
      "name": "Bolide de Prestige",
      "description": "Acquisition d'une supercar rutilante affirmant votre statut tout en attirant jalousies et curiosité."
    }
  },
  "card-life-46": {
    "en-GB": {
      "name": "Social Media Empire",
      "description": "You aggressively build your personal media presence."
    },
    "es-ES": {
      "name": "Imperio en Redes Sociales",
      "description": "Monetizas millones de seguidores en plataformas digitales dedicando horas al contenido."
    },
    "es-AR": {
      "name": "Imperio en Redes",
      "description": "Facturás millones con tus redes sociales pero pasás horas grabando contenido con el teléfono."
    },
    "pt-BR": {
      "name": "Império nas Redes Sociais",
      "description": "Milhões de seguidores monetizados nas redes exigindo dedicação contínua à produção de vídeos."
    },
    "fr-FR": {
      "name": "Empire Numérique",
      "description": "Exploitation commerciale de millions d'abonnés exigeant une présence numérique quasi-quotidienne."
    }
  },
  "card-life-47": {
    "en-GB": {
      "name": "High-Stakes Investment",
      "description": "You put a substantial amount of money into a volatile investment."
    },
    "es-ES": {
      "name": "Negocio Inmobiliario Ambicioso",
      "description": "Compras un complejo de apartamentos con apalancamiento bancario importante."
    },
    "es-AR": {
      "name": "Jugada Inmobiliaria Fuerte",
      "description": "Te metés en un fideicomiso inmobiliario grande con crédito bancario que exige no fallar."
    },
    "pt-BR": {
      "name": "Empreendimento Imobiliário",
      "description": "Compra de edifício de apartamentos com financiamento bancário de vulto."
    },
    "fr-FR": {
      "name": "Promotion Immobilière d'Envergure",
      "description": "Acquisition d'un complexe résidentiel sous emprunt bancaire requérant une gestion rigoureuse."
    }
  },
  "card-life-48": {
    "en-GB": {
      "name": "Party Until Dawn",
      "description": "You become the center of a legendary nightlife story."
    },
    "es-ES": {
      "name": "Fiesta Hasta el Amanecer",
      "description": "Una noche épica con compañeros de profesión que estrecha lazos pero hipoteca el descanso."
    },
    "es-AR": {
      "name": "Festejo Hasta el Mediodía",
      "description": "Un asado interminable con colegas que forja amistad de fierro pero te deja destrozado."
    },
    "pt-BR": {
      "name": "Comemoração até o Amanhecer",
      "description": "Festa histórica com amigos fortalecendo laços de amizade com cansaço corporal visível."
    },
    "fr-FR": {
      "name": "Fête Jusqu'à l'Aube",
      "description": "Célébration mémorable resserrant les amitiés dans le vestiaire au détriment du sommeil."
    }
  },
  "card-life-49": {
    "en-GB": {
      "name": "Live Like a Superstar",
      "description": "You decide to fully embrace the lifestyle of a football superstar."
    },
    "es-ES": {
      "name": "Vida de Estrella Mundial",
      "description": "Vuelos en jet privado y suites presidenciales: estatus absoluto con costes millonarios."
    },
    "es-AR": {
      "name": "Vida de Megaestrella",
      "description": "Vuelos privados y hoteles cinco estrellas: vivís como un rey con gastos de jeque."
    },
    "pt-BR": {
      "name": "Vida de Astro Mundial",
      "description": "Jatinhos particulares e hotéis cinco estrelas: glamour total com despesas estratosféricas."
    },
    "fr-FR": {
      "name": "Train de Vie Planétaire",
      "description": "Jets privés et palaces: un prestige international indiscutable assorti de frais monumentaux."
    }
  },
  "card-life-temp-positive-1": {
    "en-GB": {
      "name": "Paris Fashion Week Ambassador",
      "description": "A 1-year global luxury brand ambassadorship propels your worldwide recognition into the stratosphere."
    },
    "es-ES": {
      "name": "Embajador de la Moda en París",
      "description": "Representas a una firma de alta costura durante 6 meses con prestigio internacional indiscutible."
    },
    "es-AR": {
      "name": "Embajador de la Moda en París",
      "description": "Representás a una marca de lujo en París por 6 meses con presencia en las mejores revistas."
    },
    "pt-BR": {
      "name": "Embaixador da Alta Moda em Paris",
      "description": "Rosto de grife de alta costura em Paris por 6 meses gerando prestígio e receitas volumosas."
    },
    "fr-FR": {
      "name": "Ambassadeur de la Fashion Week",
      "description": "Égérie d'une grande maison de haute couture parisienne pendant 6 mois avec retombées mondiales."
    }
  },
  "card-life-temp-negative-1": {
    "en-GB": {
      "name": "Tabloid Paparazzi Siege",
      "description": "Relentless paparazzi hounding and private life leaks shatter your daily focus for 6 grueling months."
    },
    "es-ES": {
      "name": "Acoso de Paparazzis y Tabloides",
      "description": "Persecución constante de la prensa sensacionalista durante 6 meses que vulnera tu intimidad."
    },
    "es-AR": {
      "name": "Asedio de la Prensa Amarilla",
      "description": "Seis meses con fotógrafos persiguiéndote hasta para comprar el pan, volviéndote loco."
    },
    "pt-BR": {
      "name": "Cerco da Imprensa Sensacionalista",
      "description": "Perseguição incessante de fotógrafos e tabloides durante 6 meses abalando sua tranquilidade."
    },
    "fr-FR": {
      "name": "Siège des Tabloïds et Paparazzis",
      "description": "Traque incessante par la presse à scandale durant 6 mois, perturbant l'intimité de votre foyer."
    }
  },
  "card-life-temp-double-1": {
    "en-GB": {
      "name": "VIP Celebrity Nightlife Circuit",
      "description": "Partying with music stars and supermodels brings immense global clout, but drains your physical reserves."
    },
    "es-ES": {
      "name": "Circuito VIP Nocturno",
      "description": "Inmersión durante 1 año en las salas más exclusivas del planeta: contactos de oro y energía al límite."
    },
    "es-AR": {
      "name": "Circuito Nocturno de Celebridades",
      "description": "Un año metido en los reservados VIP más exclusivos del mundo: contactos millonarios y poco descanso."
    },
    "pt-BR": {
      "name": "Circuito VIP Noturno Internacional",
      "description": "Um ano de noitadas exclusivas pelo mundo: agenda cheia de contatos vips com desgaste evidente."
    },
    "fr-FR": {
      "name": "Circuit VIP des Nuits Branchées",
      "description": "Une année entière au cœur des cercles festifs internationaux les plus sélects: carnet d'adresses doré et sommeil écourté."
    }
  },
  "card-sponsor-0": {
    "en-GB": {
      "name": "KickFuel",
      "description": "A tiny fictional sports-drink company looking for a young player to promote its first product."
    },
    "es-ES": {
      "name": "KickFuel Bebida Energética",
      "description": "Una pequeña marca de bebidas isotónicas busca un futbolista joven para sus carteles."
    },
    "es-AR": {
      "name": "KickFuel Bebida Isotónica",
      "description": "Una marca emergente de bebidas para deportistas te elige como cara para sus botellas."
    },
    "pt-BR": {
      "name": "KickFuel Energético",
      "description": "Uma pequena marca de bebidas energéticas busca um jovem jogador para estampar cartazes."
    },
    "fr-FR": {
      "name": "KickFuel Boisson Énergisante",
      "description": "Une jeune marque de boissons énergisantes recherche un joueur prometteur pour sa campagne d'affichage."
    }
  },
  "card-sponsor-1": {
    "en-GB": {
      "name": "GoalSnap",
      "description": "A football photography app wants the player to appear in a promotional campaign."
    },
    "es-ES": {
      "name": "GoalSnap App",
      "description": "Una aplicación de fotografía de partidos quiere que poses con su logotipo."
    },
    "es-AR": {
      "name": "GoalSnap App",
      "description": "Una app de fotos de fútbol te paga por subir historias posando con su logo."
    },
    "pt-BR": {
      "name": "GoalSnap App",
      "description": "Um aplicativo de fotos de futebol quer sua imagem em postagens promocionais."
    },
    "fr-FR": {
      "name": "GoalSnap App",
      "description": "Une application mobile de photographie sportive sollicite votre présence dans une campagne photo."
    }
  },
  "card-sponsor-2": {
    "en-GB": {
      "name": "BootBarn",
      "description": "A small football equipment retailer offers a promotional partnership."
    },
    "es-ES": {
      "name": "BootBarn Equipamiento",
      "description": "Una tienda especializada de material deportivo te ofrece un patrocinio de botas y espinilleras."
    },
    "es-AR": {
      "name": "BootBarn Tienda de Fútbol",
      "description": "Una casa de deportes de la zona te regala botines y canilleras a cambio de menciones."
    },
    "pt-BR": {
      "name": "BootBarn Artigos Esportivos",
      "description": "Uma loja tradicional de chuteiras e materiais esportivos fecha parceria de fornecimento."
    },
    "fr-FR": {
      "name": "BootBarn Équipements",
      "description": "Une enseigne spécialisée en équipements de football vous propose un contrat de partenariat matériel."
    }
  },
  "card-sponsor-3": {
    "en-GB": {
      "name": "HydraHydrate",
      "description": "A regional hydration brand wants the player in social-media advertising."
    },
    "es-ES": {
      "name": "HydraHydrate",
      "description": "Una firma regional de hidratación deportiva te incluye en sus campañas de redes sociales."
    },
    "es-AR": {
      "name": "HydraHydrate",
      "description": "Una marca de agua e isotónicos te suma a sus publicaciones patrocinadas."
    },
    "pt-BR": {
      "name": "HydraHydrate",
      "description": "Uma marca regional de hidratação esportiva inclui você em vídeos institucionais."
    },
    "fr-FR": {
      "name": "HydraHydrate",
      "description": "Une marque régionale d'hydratation sportive vous intègre dans sa communication digitale."
    }
  },
  "card-sponsor-4": {
    "en-GB": {
      "name": "Adidash",
      "description": "A major sportswear parody brand wants a young professional as part of its next campaign."
    },
    "es-ES": {
      "name": "Adidash Moda Urbana",
      "description": "Una marca emergente de ropa casual inspirada en el fútbol te viste para eventos públicos."
    },
    "es-AR": {
      "name": "Adidash Ropa Urbana",
      "description": "Una marca de indumentaria urbana con onda futbolera te manda ropa para que te muestres."
    },
    "pt-BR": {
      "name": "Adidash Estilo Urbano",
      "description": "Uma marca jovem de roupas urbanas veste você com peças exclusivas em eventos."
    },
    "fr-FR": {
      "name": "Adidash Vêtements Urbains",
      "description": "Une marque de prêt-à-porter urbain inspirée du ballon rond vous habille lors de vos sorties."
    }
  },
  "card-sponsor-5": {
    "en-GB": {
      "name": "Pumah",
      "description": "A global sportswear company wants the player wearing its products during promotional appearances."
    },
    "es-ES": {
      "name": "Pumah Sportswear",
      "description": "Un contrato de patrocinio con material técnico de primera calidad para tus entrenamientos."
    },
    "es-AR": {
      "name": "Pumah Ropa Deportiva",
      "description": "Convenio con una marca copada que te provee buzos, térmicas y bolsos para entrenar."
    },
    "pt-BR": {
      "name": "Pumah Esportes",
      "description": "Patrocínio fornecendo material esportivo de primeira linha para a sua rotina."
    },
    "fr-FR": {
      "name": "Pumah Vêtements de Sport",
      "description": "Contrat de sponsoring fournissant des tenues d'entraînement de qualité supérieure."
    }
  },
  "card-sponsor-6": {
    "en-GB": {
      "name": "FastFood FC",
      "description": "A massive fast-food chain wants the player as a regional ambassador."
    },
    "es-ES": {
      "name": "FastFood FC",
      "description": "Una cadena de hamburgueserías local financia tus apariciones en sus anuncios televisivos."
    },
    "es-AR": {
      "name": "FastFood FC",
      "description": "Una hamburguesería conocida te paga una buena suma por filmar un spot publicitario."
    },
    "pt-BR": {
      "name": "FastFood FC",
      "description": "Uma rede local de lanches paga cachê substancial para você estrelar comerciais de TV."
    },
    "fr-FR": {
      "name": "FastFood FC",
      "description": "Une chaîne locale de restauration rapide finance votre apparition dans ses spots publicitaires."
    }
  },
  "card-sponsor-7": {
    "en-GB": {
      "name": "PlayStationary",
      "description": "A gaming company wants the player to appear in a football-game promotional campaign."
    },
    "es-ES": {
      "name": "PlayStationary Gaming",
      "description": "Una conocida compañía de videojuegos te envía sus últimas consolas y accesorios exclusivos."
    },
    "es-AR": {
      "name": "PlayStationary Consolas",
      "description": "Una firma de consolas de videojuegos te llena de consolas y juegos para que streamees."
    },
    "pt-BR": {
      "name": "PlayStationary Games",
      "description": "Uma empresa de videogames envia os últimos lançamentos e consoles para você jogar."
    },
    "fr-FR": {
      "name": "PlayStationary Jeux Vidéo",
      "description": "Un grand éditeur de jeux vidéo vous offre ses dernières consoles et titres en avant-première."
    }
  },
  "card-sponsor-8": {
    "en-GB": {
      "name": "Nikele",
      "description": "A global sportswear giant offers a serious endorsement deal."
    },
    "es-ES": {
      "name": "Nikele Elite",
      "description": "Patrocinio técnico con una prestigiosa multinacional de calzado deportivo de competición."
    },
    "es-AR": {
      "name": "Nikele Élite",
      "description": "Contrato formal con una de las mayores marcas deportivas del mundo para usar sus botines."
    },
    "pt-BR": {
      "name": "Nikele Elite",
      "description": "Contrato oficial de patrocínio com calçados de elite de uma grande multinacional."
    },
    "fr-FR": {
      "name": "Nikele Élite",
      "description": "Contrat officiel avec un équipementier mondial fournissant des crampons de haute compétition."
    }
  },
  "card-sponsor-9": {
    "en-GB": {
      "name": "Adibas Elite",
      "description": "The company's premium division wants the player as one of its international faces."
    },
    "es-ES": {
      "name": "Adibas Elite Pro",
      "description": "Acuerdo millonario de representación deportiva con lanzamiento de tu propia línea de botas."
    },
    "es-AR": {
      "name": "Adibas Elite Pro",
      "description": "Contrato millonario con lanzamiento exclusivo de botines personalizados con tus iniciales."
    },
    "pt-BR": {
      "name": "Adibas Linha Pro",
      "description": "Acordo milionário com desenvolvimento de uma linha de chuteiras com seu nome."
    },
    "fr-FR": {
      "name": "Adibas Élite Pro",
      "description": "Partenariat d'envergure prévoyant la création d'une gamme de chaussures signature."
    }
  },
  "card-sponsor-10": {
    "en-GB": {
      "name": "Coca-Colder",
      "description": "A global beverage company wants the player in a worldwide football campaign."
    },
    "es-ES": {
      "name": "Coca-Colder Refrescos",
      "description": "Campaña global de refrescos con tu rostro presente en marquesinas de medio mundo."
    },
    "es-AR": {
      "name": "Coca-Colder Gaseosas",
      "description": "Campaña mundial de gaseosas con afiches gigantes con tu cara en las grandes capitales."
    },
    "pt-BR": {
      "name": "Coca-Colder Refrigerantes",
      "description": "Campanha global de refrigerantes com sua foto em outdoors e comerciais de televisão."
    },
    "fr-FR": {
      "name": "Coca-Colder Sodas",
      "description": "Campagne publicitaire planétaire diffusée sur tous les écrans du monde entier."
    }
  },
  "card-sponsor-11": {
    "en-GB": {
      "name": "McRonald's",
      "description": "The world's largest burger chain wants the player for an international campaign."
    },
    "es-ES": {
      "name": "McRonald's Burger",
      "description": "Firma comercial con la mayor cadena de restaurantes del planeta para promocionar su menú estrella."
    },
    "es-AR": {
      "name": "McRonald's Hamburguesas",
      "description": "Contrato publicitario gigante con la cadena de comidas rápidas número uno del mundo."
    },
    "pt-BR": {
      "name": "McRonald's Fast-Food",
      "description": "Parceria publicitária de peso com a maior rede de lanchonetes do planeta."
    },
    "fr-FR": {
      "name": "McRonald's Restaurants",
      "description": "Partenariat de premier ordre avec le géant mondial de la restauration rapide."
    }
  },
  "card-sponsor-12": {
    "en-GB": {
      "name": "Gooch",
      "description": "A fictional technology giant wants the player to become the face of its global sports division."
    },
    "es-ES": {
      "name": "Gooch Alta Costura",
      "description": "La célebre casa de moda italiana te viste con trajes a medida en las alfombras rojas."
    },
    "es-AR": {
      "name": "Gooch Alta Costura",
      "description": "Una casa de lujo europea te diseña ambos y trajes a medida para galas y entregas de premios."
    },
    "pt-BR": {
      "name": "Gooch Alta Costura",
      "description": "Uma renomada grife italiana fornece ternos e figurinos sob medida para suas viagens."
    },
    "fr-FR": {
      "name": "Gooch Haute Couture",
      "description": "La prestigieuse maison de couture italienne crée vos costumes sur-mesure pour les galas."
    }
  },
  "card-sponsor-13": {
    "en-GB": {
      "name": "HyperSport International",
      "description": "A fictional multinational sports conglomerate offers an elite global ambassador contract."
    },
    "es-ES": {
      "name": "HyperSport International",
      "description": "Contrato integral como icono internacional de una corporación deportiva global."
    },
    "es-AR": {
      "name": "HyperSport International",
      "description": "Contrato de patrocinio global como cara visible del deporte mundial con ingresos millonarios."
    },
    "pt-BR": {
      "name": "HyperSport Global",
      "description": "Contrato astronômico como embaixador internacional de um conglomerado esportivo líder."
    },
    "fr-FR": {
      "name": "HyperSport International",
      "description": "Contrat colossal faisant de vous l'un des ambassadeurs mondiaux de la marque."
    }
  },
  "card-sponsor-14": {
    "en-GB": {
      "name": "Amazoff",
      "description": "A global technology and commerce empire wants exclusive promotional rights to the player image."
    },
    "es-ES": {
      "name": "Amazoff Streaming",
      "description": "Acuerdo millonario para ser la imagen del nuevo servicio global de retransmisiones deportivas."
    },
    "es-AR": {
      "name": "Amazoff Streaming",
      "description": "Acuerdo descomunal para promocionar la plataforma de transmisiones de fútbol en vivo."
    },
    "pt-BR": {
      "name": "Amazoff Transmissões",
      "description": "Parceria milionária para ser o rosto de uma plataforma global de streaming esportivo."
    },
    "fr-FR": {
      "name": "Amazoff Plateforme Vidéo",
      "description": "Contrat d'image majeur pour le lancement mondial d'une plateforme de diffusion sportive."
    }
  },
  "card-sponsor-15": {
    "en-GB": {
      "name": "ScamBank",
      "description": "A suspicious financial app offers the player a small promotional payment."
    },
    "es-ES": {
      "name": "ScamBank Financiera",
      "description": "Prestas tu imagen a un banco en línea sospechoso que termina intervenido judicialmente."
    },
    "es-AR": {
      "name": "ScamBank Banco Trucho",
      "description": "Ponés la cara para un banco digital turbio que a los meses quiebra y deja un escándalo."
    },
    "pt-BR": {
      "name": "ScamBank Banco Suspeito",
      "description": "Você empresta sua imagem a um banco digital duvidoso que acaba sofrendo intervenção judicial."
    },
    "fr-FR": {
      "name": "ScamBank Banque Douteuse",
      "description": "Vous prêtez votre image à un organisme financier douteux mis sous tutelle judiciaire."
    }
  },
  "card-sponsor-16": {
    "en-GB": {
      "name": "CryptoBro Finance",
      "description": "A questionable financial startup wants the player to promote its investment platform."
    },
    "es-ES": {
      "name": "CryptoBro Finance",
      "description": "Promocionas una moneda digital que se desploma un 90% enfureciendo a tus seguidores."
    },
    "es-AR": {
      "name": "CryptoBro Finance",
      "description": "Publicitás una criptomoneda fantasma que se viene a pique y los hinchas te llenan de reclamos."
    },
    "pt-BR": {
      "name": "CryptoBro Moedas Virtuais",
      "description": "Divulgação de criptomoeda que desaba de valor deixando seguidores lesados e revoltados."
    },
    "fr-FR": {
      "name": "CryptoBro Finance",
      "description": "Promotion d'un crypto-actif qui s'effondre en quelques jours, s'attirant la rancœur des fans."
    }
  },
  "card-sponsor-17": {
    "en-GB": {
      "name": "ClickBet",
      "description": "A suspicious betting website offers a small promotional deal."
    },
    "es-ES": {
      "name": "ClickBet Apuestas",
      "description": "Anuncias una casa de apuestas agresiva recibiendo un aluvión de críticas sociales."
    },
    "es-AR": {
      "name": "ClickBet Casa de Apuestas",
      "description": "Aceptás publicitar una casa de apuestas clandestina y te llueven críticas de todos lados."
    },
    "pt-BR": {
      "name": "ClickBet Apostas Online",
      "description": "Campanha com site agressivo de apostas esportivas gerando forte desgaste público."
    },
    "fr-FR": {
      "name": "ClickBet Paris en Ligne",
      "description": "Publicité pour un site de paris risqués provoquant de vives réactions négatives du public."
    }
  },
  "card-sponsor-18": {
    "en-GB": {
      "name": "GetRichFast™",
      "description": "A dubious investment company offers the player a short promotional contract."
    },
    "es-ES": {
      "name": "GetRichFast™ Chollos",
      "description": "Asocias tu nombre a un curso de enriquecimiento rápido que resulta ser una estafa piramidal."
    },
    "es-AR": {
      "name": "GetRichFast™ Cursos Mágicos",
      "description": "Te vinculan con unos cursos truchos para hacerse rico y quedás pegado a una estafa piramidal."
    },
    "pt-BR": {
      "name": "GetRichFast™ Promessas Fáceis",
      "description": "Vínculo com cursos duvidosos de enriquecimento fácil que mancham sua credibilidade pública."
    },
    "fr-FR": {
      "name": "GetRichFast™ Méthode Miracle",
      "description": "Association de votre image à des formations financières trompeuses ternissant votre honneur."
    }
  },
  "card-sponsor-19": {
    "en-GB": {
      "name": "NFTiger",
      "description": "An NFT company wants the player to promote its latest collection."
    },
    "es-ES": {
      "name": "NFTiger Coleccionables",
      "description": "Lanzas una colección de cromos virtuales que pierde todo su valor comercial al instante."
    },
    "es-AR": {
      "name": "NFTiger Dibujos Digitales",
      "description": "Sacás una colección de dibujos digitales que a los tres días no vale ni un peso."
    },
    "pt-BR": {
      "name": "NFTiger Colecionáveis Virtuais",
      "description": "Lançamento de figuras digitais colecionáveis que viram pó e revoltam os compradores."
    },
    "fr-FR": {
      "name": "NFTiger Actifs Numériques",
      "description": "Lancement d'une collection numérique sans lendemain laissant un goût amer aux acheteurs."
    }
  },
  "card-sponsor-20": {
    "en-GB": {
      "name": "ShadyCoin",
      "description": "A cryptocurrency exchange with an extremely questionable reputation wants the player as its public face."
    },
    "es-ES": {
      "name": "ShadyCoin Cripto",
      "description": "Una criptomoneda de dudosa procedencia utiliza tu fotografía sin tu consentimiento expreso."
    },
    "es-AR": {
      "name": "ShadyCoin Moneda Rara",
      "description": "Unos tipos usan tu foto para vender una moneda turbia y te meten en un lío legal."
    },
    "pt-BR": {
      "name": "ShadyCoin Moeda Clandestina",
      "description": "Uso indevido da sua foto por uma moeda virtual obscura gerando dor de cabeça na justiça."
    },
    "fr-FR": {
      "name": "ShadyCoin Jeton Obscur",
      "description": "Utilisation non autorisée de votre image par une cryptomonnaie occulte causant des litiges."
    }
  },
  "card-sponsor-21": {
    "en-GB": {
      "name": "DebtNow",
      "description": "A financial company offers an unusually large promotional advance."
    },
    "es-ES": {
      "name": "DebtNow Créditos",
      "description": "Aceptas publicitar una firma de microcréditos con intereses desorbitados que daña tu imagen."
    },
    "es-AR": {
      "name": "DebtNow Préstamos Usureros",
      "description": "Hacés publicidad para una financiera usurera y en las tribunas te bajan de un hondazo."
    },
    "pt-BR": {
      "name": "DebtNow Crédito Fácil",
      "description": "Propaganda para empresa de empréstimos com juros abusivos afetando sua imagem moral."
    },
    "fr-FR": {
      "name": "DebtNow Crédits Toxiques",
      "description": "Promotion d'une société de microcrédits usuraires portant gravement atteinte à votre image."
    }
  },
  "card-sponsor-22": {
    "en-GB": {
      "name": "PonziPro",
      "description": "A supposedly revolutionary investment company offers an enormous endorsement payment. Company collapses later."
    },
    "es-ES": {
      "name": "PonziPro Inversiones",
      "description": "Te ves involuntariamente implicado en la publicidad de un esquema financiero fraudulento."
    },
    "es-AR": {
      "name": "PonziPro Esquema Piramidal",
      "description": "Quedás pegado a un esquema Ponzi que estafa a miles de personas y sale en todos los noticieros."
    },
    "pt-BR": {
      "name": "PonziPro Pirâmide Financeira",
      "description": "Envolvimento involuntário na divulgação de uma pirâmide financeira desmascarada na polícia."
    },
    "fr-FR": {
      "name": "PonziPro Schéma Frauduleux",
      "description": "Implication involontaire dans la promotion d'une pyramide de Ponzi relayée par les médias."
    }
  },
  "card-sponsor-23": {
    "en-GB": {
      "name": "Scamazon",
      "description": "A mysterious international corporation offers the player a huge endorsement contract."
    },
    "es-ES": {
      "name": "Scamazon Tienda",
      "description": "Una web de venta de artículos falsificados utiliza tu imagen para vender camisetas truchas."
    },
    "es-AR": {
      "name": "Scamazon Ropa Trucha",
      "description": "Una página trucha usa tu nombre para vender camisetas truchas de mala calidad."
    },
    "pt-BR": {
      "name": "Scamazon Produtos Falsos",
      "description": "Um site de produtos falsificados usa seu nome para comercializar uniformes de baixa qualidade."
    },
    "fr-FR": {
      "name": "Scamazon Contrefaçons",
      "description": "Un site de contrefaçon utilise frauduleusement votre nom pour écouler des maillots illicites."
    }
  },
  "card-sponsor-24": {
    "en-GB": {
      "name": "BankruptBet",
      "description": "A gambling corporation offers the player an enormous promotional deal."
    },
    "es-ES": {
      "name": "BankruptBet Quiebra",
      "description": "La casa de apuestas que patrocinaba tu contrato quiebra dejándote con facturas impagadas."
    },
    "es-AR": {
      "name": "BankruptBet Quiebra Total",
      "description": "La empresa de apuestas que te prometió fortunas se declara en quiebra y no te paga ni un centavo."
    },
    "pt-BR": {
      "name": "BankruptBet Calote Geral",
      "description": "A casa de apostas parceira entra em falência repentina deixando pagamentos em aberto."
    },
    "fr-FR": {
      "name": "BankruptBet Faillite",
      "description": "Le sponsor de paris fait faillite du jour au lendemain en laissant d'importants impayés."
    }
  },
  "card-sponsor-25": {
    "en-GB": {
      "name": "Debt King",
      "description": "Offers +€500,000 cash immediately, but requires €1,000,000 repayment 1 year later through Accounting."
    },
    "es-ES": {
      "name": "Rey de las Deudas",
      "description": "Problemas contractuales con patrocinadores pasados derivan en demandas y reclamaciones judiciales."
    },
    "es-AR": {
      "name": "El Rey de las Deudas",
      "description": "Firmaste contratos sin leer y ahora te llueven cartas documento de patrocinadores pasados."
    },
    "pt-BR": {
      "name": "Rei das Dívidas",
      "description": "Contratos mal redigidos no passado viram disputas judiciais e cobranças na justiça."
    },
    "fr-FR": {
      "name": "Le Roi des Litiges",
      "description": "Des contrats mal ficelés par le passé débouchent sur des réclamations judiciaires embarrassantes."
    }
  },
  "card-sponsor-26": {
    "en-GB": {
      "name": "CoinKick",
      "description": "A tiny crypto startup offers a sponsorship partly paid in its own token. Outcome varies."
    },
    "es-ES": {
      "name": "CoinKick Cripto-Fan",
      "description": "Emiten tokens para aficionados con cuantiosos beneficios pero fluctuaciones salvajes."
    },
    "es-AR": {
      "name": "CoinKick Fichas de Hinchas",
      "description": "Lanzan una moneda para hinchas: ganás buena guita pero las quejas no paran cuando baja."
    },
    "pt-BR": {
      "name": "CoinKick Fan Tokens",
      "description": "Lançamento de moedas para torcedores com lucros polpudos, mas volatilidade de mercado."
    },
    "fr-FR": {
      "name": "CoinKick Jetons Supporters",
      "description": "Émission de jetons pour supporters générant de beaux gains mais soumis aux humeurs des cours."
    }
  },
  "card-sponsor-27": {
    "en-GB": {
      "name": "MysteryBox FC",
      "description": "A sportswear company offers a mystery sponsorship package containing money, equipment, or bad rep."
    },
    "es-ES": {
      "name": "MysteryBox FC",
      "description": "Patrocinio con cajas sorpresa de cromos: ingresos astronómicos pero críticas éticas."
    },
    "es-AR": {
      "name": "MysteryBox FC Cajas Sorpresa",
      "description": "Convenio con cajas sorpresa de apuestas para pibes: paga una locura pero te critican."
    },
    "pt-BR": {
      "name": "MysteryBox FC Caixas Surpresa",
      "description": "Patrocínio de caixas virtuais de colecionador: receita muito alta sob críticas éticas."
    },
    "fr-FR": {
      "name": "MysteryBox FC Coffres Mystères",
      "description": "Sponsoring de coffres numériques: pactole financier compensé par des réserves éthiques."
    }
  },
  "card-sponsor-28": {
    "en-GB": {
      "name": "NFT United",
      "description": "A fashionable NFT company offers a large endorsement deal."
    },
    "es-ES": {
      "name": "NFT United Metaverso",
      "description": "Lanzamiento de tu avatar virtual en un videojuego: ganancias inmediatas pero pérdida de intimidad."
    },
    "es-AR": {
      "name": "NFT United Metaverso",
      "description": "Meten tu avatar en un videojuego virtual: cobrás millones pero usan tu cara para todo."
    },
    "pt-BR": {
      "name": "NFT United Metaverso",
      "description": "Criação de avatar virtual próprio gerando lucros expressivos com superexposição comercial."
    },
    "fr-FR": {
      "name": "NFT United Métavers",
      "description": "Création de votre avatar virtuel: bénéfices immédiats assortis d'une surexploitation commerciale."
    }
  },
  "card-sponsor-29": {
    "en-GB": {
      "name": "CryptoBall",
      "description": "A cryptocurrency platform offers a percentage of promotional revenue."
    },
    "es-ES": {
      "name": "CryptoBall Liga Privada",
      "description": "Torneo de exhibición privado en Dubái con premios millonarios pero sobrecarga física."
    },
    "es-AR": {
      "name": "CryptoBall Desafío Dubái",
      "description": "Picado de exhibición en los Emiratos por millones de dólares pero viajás en medio del torneo."
    },
    "pt-BR": {
      "name": "CryptoBall Torneio em Dubai",
      "description": "Torneio amistoso milionário em Dubai com premiação farta, mas desgaste de fuso horário."
    },
    "fr-FR": {
      "name": "CryptoBall Tournoi Privé",
      "description": "Match de gala très lucratif dans le Golfe provoquant fatigue de voyage en pleine saison."
    }
  },
  "card-sponsor-30": {
    "en-GB": {
      "name": "MoonShot Capital",
      "description": "A mysterious investment company offers a massive endorsement package."
    },
    "es-ES": {
      "name": "MoonShot Capital Fondo",
      "description": "Entras como socio en un fondo de capital riesgo: beneficios potenciales enormes con capital retenido."
    },
    "es-AR": {
      "name": "MoonShot Capital Fondo",
      "description": "Invertís en un fondo de riesgo tecnológico: podés multiplicar por diez o esperar años."
    },
    "pt-BR": {
      "name": "MoonShot Capital Fundo de Risco",
      "description": "Entrada em fundo de investimento agressivo com alta rentabilidade e dinheiro travado."
    },
    "fr-FR": {
      "name": "MoonShot Capital Fonds Risqué",
      "description": "Entrée dans un fonds spéculatif offrant des gains potentiels géants mais des fonds bloqués."
    }
  },
  "card-sponsor-31": {
    "en-GB": {
      "name": "InfluenceX",
      "description": "A controversial social-media company offers an enormous ambassador deal."
    },
    "es-ES": {
      "name": "InfluenceX Agencia",
      "description": "Una agencia de marketing masivo cuadruplica tus contratos a cambio de un control rígido de tu agenda."
    },
    "es-AR": {
      "name": "InfluenceX Manejo Total",
      "description": "Una agencia de marketing te llena de plata los bolsillos pero te maneja hasta el corte de pelo."
    },
    "pt-BR": {
      "name": "InfluenceX Agência de Imagem",
      "description": "Agência de marketing que quadruplica seus contratos cobrando controle rígido do seu tempo."
    },
    "fr-FR": {
      "name": "InfluenceX Agence Marketing",
      "description": "Une agence multiplie vos revenus publicitaires tout en imposant un emploi du temps draconien."
    }
  },
  "card-sponsor-32": {
    "en-GB": {
      "name": "CryptoMoon",
      "description": "A mysterious cryptocurrency empire offers a life-changing sponsorship."
    },
    "es-ES": {
      "name": "CryptoMoon Minería",
      "description": "Granjas de minería de servidores: dividendos continuos con cuestionamientos ecológicos."
    },
    "es-AR": {
      "name": "CryptoMoon Granjas Digitales",
      "description": "Ponés servidores a minar monedas: ingresa plata sola pero te cuestionan por el consumo eléctrico."
    },
    "pt-BR": {
      "name": "CryptoMoon Fazendas de Mineração",
      "description": "Investimento em data centers gerando dividendos expressivos com debate ambiental."
    },
    "fr-FR": {
      "name": "CryptoMoon Fermes de Serveurs",
      "description": "Participation dans des centres de calculs générant de gros rendements sous critique écologique."
    }
  },
  "card-sponsor-33": {
    "en-GB": {
      "name": "NFT Emperor",
      "description": "A bizarre billionaire wants the player to become face of world's largest virtual football collection."
    },
    "es-ES": {
      "name": "NFT Emperor Colección Oro",
      "description": "Edición limitada de lujo para jeques y coleccionistas con ventas récord y revuelo en prensa."
    },
    "es-AR": {
      "name": "NFT Emperor Edición Dorada",
      "description": "Venta exclusiva de piezas digitales para jeques árabes que te deja millones al instante."
    },
    "pt-BR": {
      "name": "NFT Emperor Coleção Exclusiva",
      "description": "Série limitadíssima de arte digital vendida a milionários com repercussão extravagante."
    },
    "fr-FR": {
      "name": "NFT Emperor Série Or",
      "description": "Édition numérique d'ultra-luxe pour collectionneurs fortunés suscitant la curiosité générale."
    }
  },
  "card-sponsor-34": {
    "en-GB": {
      "name": "North Korea FC",
      "description": "A fictional state-backed football organization offers an absurdly lucrative sponsorship."
    },
    "es-ES": {
      "name": "Amistoso Estatal en Asia",
      "description": "Viajas a jugar un partido promocional con un combinado asiático con pago desmedido y fatiga extrema."
    },
    "es-AR": {
      "name": "Amistoso en el Lejano Oriente",
      "description": "Viajás a Asia a jugar un amistoso promocional: cobrás un fangote de dólares pero volvés fusilado."
    },
    "pt-BR": {
      "name": "Amistoso Internacional na Ásia",
      "description": "Viagem promocional para disputar amistoso no Oriente com cachê farto e jet lag pesado."
    },
    "fr-FR": {
      "name": "Match de Gala en Asie",
      "description": "Déplacement lointain pour un match promotionnel très rémunérateur au prix d'un épuisant décalage horaire."
    }
  },
  "card-sponsor-35": {
    "en-GB": {
      "name": "The Golden Gamble",
      "description": "A mysterious international conglomerate offers €50,000,000 for exclusive 1-year global ambassador rights."
    },
    "es-ES": {
      "name": "La Gran Apuesta Dorada",
      "description": "Inviertes parte de tu ficha en un proyecto minero o energético de rentabilidad colosal."
    },
    "es-AR": {
      "name": "La Gran Apuesta Dorada",
      "description": "Metés una parte brava de tu sueldo en un yacimiento energético que puede asegurar a tus bisnietos."
    },
    "pt-BR": {
      "name": "A Grande Aposta Dourada",
      "description": "Aporte substancial em consórcio de energia e mineração com retorno histórico ou burocracia."
    },
    "fr-FR": {
      "name": "Le Grand Pari Minier",
      "description": "Investissement lourd dans un projet énergétique pouvant assurer la fortune de vos descendants."
    }
  },
  "card-sponsor-temp-positive-1": {
    "en-GB": {
      "name": "Global Energy Drink Headliner",
      "description": "A 1-year flagship commercial endorsement contract with immense bonus payouts and TV ad blitz."
    },
    "es-ES": {
      "name": "Campaña Mundial de Bebida Energética",
      "description": "Campaña publicitaria de 6 meses con presencia en todos los medios globales e ingresos récord."
    },
    "es-AR": {
      "name": "Campaña Mundial de Energizante",
      "description": "Seis meses como la cara mundial de una bebida deportiva con ingresos récord de imagen."
    },
    "pt-BR": {
      "name": "Campanha Mundial de Energético",
      "description": "Contrato de 6 meses estrelando a campanha global de um energético com faturamento recorde."
    },
    "fr-FR": {
      "name": "Tête d'Affiche Mondiale Boisson Énergisante",
      "description": "Contrat de 6 mois comme égérie mondiale d'une boisson énergisante rapportant des droits records."
    }
  },
  "card-sponsor-temp-negative-1": {
    "en-GB": {
      "name": "Contractual Dispute & Frozen Royalties",
      "description": "Legal conflict with an apparel supplier freezes commercial endorsements and stains your reputation."
    },
    "es-ES": {
      "name": "Disputa Contractual y Fondos Congelados",
      "description": "Litigio comercial durante 6 meses que bloquea el cobro de tus derechos de imagen."
    },
    "es-AR": {
      "name": "Conflicto de Contratos y Fondos Congelados",
      "description": "Seis meses con los pagos comerciales frenados por una disputa entre patrocinadores."
    },
    "pt-BR": {
      "name": "Disputa de Contratos e Verbas Bloqueadas",
      "description": "Batalha jurídica comercial de 6 meses congelando recebimentos de direitos de imagem."
    },
    "fr-FR": {
      "name": "Litige Contractuel et Droits Gelés",
      "description": "Bataille juridique de 6 mois gelant le versement de vos droits d'image commerciaux."
    }
  },
  "card-sponsor-temp-double-1": {
    "en-GB": {
      "name": "Worldwide Promo Tour Blitz",
      "description": "Astronomical sponsorship revenue (+€750,000) that demands grueling intercontinental flights all year."
    },
    "es-ES": {
      "name": "Gira Promocional Relámpago",
      "description": "Gira frenética de 1 año por los 5 continentes: recaudación estratosférica y desgaste de viajes permanente."
    },
    "es-AR": {
      "name": "Gira Mundial Relámpago",
      "description": "Un año recorriendo el mundo para actos publicitarios: recaudación brutal a cambio de vivir arriba de aviones."
    },
    "pt-BR": {
      "name": "Turnê Promocional Mundial",
      "description": "Um ano de compromissos publicitários pelos 5 continentes: faturamento astronômico e viagens sem fim."
    },
    "fr-FR": {
      "name": "Tournée Promotionnelle Planétaire",
      "description": "Un an de tournées commerciales sur les 5 continents: recettes exceptionnelles et fatigue des vols."
    }
  },
  "card-agent-pro-mendez": {
    "en-GB": {
      "name": "Tier 1 Super-Agent (Jorge Style)",
      "description": "World-class agency connection unlocking elite club doors, astronomical transfer leverage and commercial empire."
    },
    "es-ES": {
      "name": "Superagente de Élite (Estilo Jorge)",
      "description": "El representante más poderoso del fútbol mundial: abre las puertas de los clubes más grandes de Europa."
    },
    "es-AR": {
      "name": "Superagente de Élite (Estilo Jorge)",
      "description": "El empresario más pesado del fútbol mundial: te mete en los clubes más grandes de Europa sin dudar."
    },
    "pt-BR": {
      "name": "Superagente de Elite (Estilo Jorge)",
      "description": "O empresário mais influente do futebol mundial: abre portas nos gigantes da Europa num piscar de olhos."
    },
    "fr-FR": {
      "name": "Super-Agent d'Élite (Style Jorge)",
      "description": "Le représentant le plus influent du football mondial: ouvre en grand les portes des géants d'Europe."
    }
  },
  "card-agent-ruthless-shark": {
    "en-GB": {
      "name": "The Cutthroat Contract Master",
      "description": "Relentless wage negotiator who squeezes every last euro from club chairmen with ice in his veins."
    },
    "es-ES": {
      "name": "Tiburón de las Negociaciones",
      "description": "Negociador despiadado que exprime hasta el último céntimo en cada contrato sin importar las formas."
    },
    "es-AR": {
      "name": "El Tiburón de los Contratos",
      "description": "Un negociador a cara de perro que le saca hasta el último euro a los dirigentes en cada renovación."
    },
    "pt-BR": {
      "name": "O Tubarão dos Contratos",
      "description": "Negociador implacável que arranca até o último centavo dos clubes nas renovações contratuais."
    },
    "fr-FR": {
      "name": "Le Négociateur Impitoyable",
      "description": "Un requin des affaires qui tire le maximum financier de chaque négociation sans aucun état d'âme."
    }
  },
  "card-agent-trusted-mentor": {
    "en-GB": {
      "name": "The Honest Career Mentor",
      "description": "Prioritizes playing time and mental stability over quick cash commissions. Solid network and steady guidance."
    },
    "es-ES": {
      "name": "El Mentor Honesto",
      "description": "Prioriza tu progresión deportiva y estabilidad mental por encima de comisiones rápidas."
    },
    "es-AR": {
      "name": "El Consejero Honesto",
      "description": "Un hombre íntegro de fútbol que prioriza que juegues de titular y crezcas antes que llenarse los bolsillos."
    },
    "pt-BR": {
      "name": "O Mentor Íntegro",
      "description": "Prioriza sua evolução técnica e saúde mental acima de comissões imediatas e transferências precipitadas."
    },
    "fr-FR": {
      "name": "Le Mentor Loyal",
      "description": "Privilégie votre temps de jeu et votre bien-être psychologique avant les commissions rapides."
    }
  },
  "card-agent-scrap-amateur": {
    "en-GB": {
      "name": "Unregistered Local Fixer",
      "description": "Amateur representative with zero European contacts who leaks false rumors to cheap tabloids."
    },
    "es-ES": {
      "name": "Intermediario de Barrio",
      "description": "Un representante sin contactos internacionales que filtra información confidencial a la prensa."
    },
    "es-AR": {
      "name": "Intermediario Improvisado",
      "description": "Un conocido del barrio que se hace el representante, no conoce a nadie y habla de más con los periodistas."
    },
    "pt-BR": {
      "name": "Intermediário Amador",
      "description": "Representante sem contatos no exterior que vaza bastidores para jornalistas e cria confusão."
    },
    "fr-FR": {
      "name": "Intermédiaire de Quartier",
      "description": "Un représentant novice dépourvu de carnet d'adresses qui fait fuiter des rumeurs maladroites."
    }
  },
  "card-agent-rust-embezzler": {
    "en-GB": {
      "name": "Greedy Commission Squeezer",
      "description": "Demands hidden agent fees that scare away prospective suitors during transfer windows."
    },
    "es-ES": {
      "name": "Comisionista Codicioso",
      "description": "Exige comisiones abusivas a los clubes entorpeciendo tus renovaciones de contrato."
    },
    "es-AR": {
      "name": "El Comisionista Hambriento",
      "description": "Pide comisiones descomunales a espaldas tuyas y casi te traba una renovación clave."
    },
    "pt-BR": {
      "name": "Empresário Ganancioso",
      "description": "Exige porcentagens astronômicas dos clubes emperrando renovações que seriam simples."
    },
    "fr-FR": {
      "name": "Courtier Cupidité",
      "description": "Exige des commissions démesurées en coulisses, compliquant vos prolongations de contrat."
    }
  },
  "card-agent-ash-rebellion": {
    "en-GB": {
      "name": "The Rogue Media Leaker",
      "description": "Burns bridges with your head coach by openly complaining about tactics on national radio."
    },
    "es-ES": {
      "name": "El Filtrador Rebelde",
      "description": "Utiliza a periodistas afines para presionar públicamente al club generando tensión interna."
    },
    "es-AR": {
      "name": "El Filtrador a la Prensa",
      "description": "Usa a sus periodistas amigos para apretar a la dirigencia y te deja en el medio del fuego cruzado."
    },
    "pt-BR": {
      "name": "O Vazador Rebelde",
      "description": "Usa repórteres amigos para plantar notícias e pressionar a diretoria criando atrito."
    },
    "fr-FR": {
      "name": "La Taupe des Médias",
      "description": "Alimente sciemment la presse en indiscrétions pour mettre la pression sur les dirigeants."
    }
  },
  "card-agent-disaster-mob": {
    "en-GB": {
      "name": "Banned Third-Party Extortionist",
      "description": "Under FIFA investigation for illegal third-party ownership. Sullies your reputation across world football."
    },
    "es-ES": {
      "name": "Extorsionista Inhabilitado",
      "description": "Un personaje turbio sin licencia federativa que amenaza con llevar tu traspaso a los tribunales."
    },
    "es-AR": {
      "name": "El Gestor Turbio",
      "description": "Un intermediario con causas judiciales que te complica la carrera con reclamos truchos."
    },
    "pt-BR": {
      "name": "Extorquista Banido",
      "description": "Figura obscura sem licença da FIFA criando litígios e ameaçando ir à justiça desportiva."
    },
    "fr-FR": {
      "name": "L'Intermédiaire Suspendu",
      "description": "Un intermédiaire sans licence exerçant des pressions judiciaires embarrassantes autour de votre contrat."
    }
  },
  "card-agent-de-obsidian": {
    "en-GB": {
      "name": "Obsidian Knife: Aggressive Wage Demands",
      "description": "Forces massive weekly wage spikes, but creates friction with club board."
    },
    "es-ES": {
      "name": "Cuchillo de Obsidiana: Sueldos de Élite",
      "description": "Exigencias salariales feroces que multiplican tu sueldo pero irritan a la directiva."
    },
    "es-AR": {
      "name": "Puñal de Obsidiana: Sueldos de Oro",
      "description": "Exigencias salariales feroces que te consiguen un contrato bárbaro pero cansan a los dirigentes."
    },
    "pt-BR": {
      "name": "Punhal de Obsidiana: Salários de Topo",
      "description": "Cobranças salariais duras que multiplicam seus vencimentos, gerando atritos na diretoria."
    },
    "fr-FR": {
      "name": "Lame d'Obsidienne: Exigences Salariales",
      "description": "Négociations salariales féroces vous offrant des émoluments princiers mais crispant les dirigeants."
    }
  },
  "card-agent-de-muramasa": {
    "en-GB": {
      "name": "Muramasa Blade: Hostile Buyout King",
      "description": "Triggers nuclear buyout release clauses. Massive fame and millions in commissions, but despised by club supporters."
    },
    "es-ES": {
      "name": "Espada Muramasa: Rescisión Hostil",
      "description": "Fuerza tu salida del club activando tu cláusula de rescisión con máxima tensión deportiva."
    },
    "es-AR": {
      "name": "Espada Muramasa: Cláusula Hostil",
      "description": "Ejecuta la cláusula de rescisión para sacarte del club en un clima de guerra con los hinchas."
    },
    "pt-BR": {
      "name": "Lâmina Muramasa: Rescisão Hostil",
      "description": "Força sua saída do clube executando a multa rescisória em clima de tensão aberta com a torcida."
    },
    "fr-FR": {
      "name": "Lame Muramasa: Rupture Agressive",
      "description": "Déclenche le paiement de la clause libératoire dans un climat d'extrême hostilité sportive."
    }
  },
  "card-agent-temp-positive-1": {
    "en-GB": {
      "name": "Super-Agent Transfer Window Blitz",
      "description": "Your agent deploys their absolute highest-level international connections for a 1-year career breakthrough."
    },
    "es-ES": {
      "name": "Operación Relámpago de Mercado",
      "description": "Tu agente maniobra durante 6 meses con contactos de primer orden para asegurarte el mejor traspaso posible."
    },
    "es-AR": {
      "name": "Blitz Relámpago de Traspasos",
      "description": "Seis meses de maniobras magistrales de tu agente para ubicarte en el club ideal para dar el salto."
    },
    "pt-BR": {
      "name": "Operação Relâmpago de Mercado",
      "description": "Manobras brilhantes do seu empresário durante 6 meses garantindo propostas de alto nível."
    },
    "fr-FR": {
      "name": "Offensive Éclair du Mercato",
      "description": "Votre agent orchestre un mercato magistral pendant 6 mois pour vous décrocher le contrat idéal."
    }
  },
  "card-agent-temp-negative-1": {
    "en-GB": {
      "name": "Agent Audit & Legal Injunction",
      "description": "Agency accounts frozen during tax audit, stalling all contract talks for 6 months."
    },
    "es-ES": {
      "name": "Auditoría Judicial al Representante",
      "description": "Investigación fiscal a tu agencia durante 6 meses que paraliza temporalmente cualquier negociación de fichaje."
    },
    "es-AR": {
      "name": "Auditoría y Trabas Legales",
      "description": "Seis meses de intervención judicial a tu agencia que frenan cualquier firma o mejora de contrato."
    },
    "pt-BR": {
      "name": "Auditoria e Bloqueio Jurídico",
      "description": "Investigação contra a empresa do seu empresário durante 6 meses travando negociações de contrato."
    },
    "fr-FR": {
      "name": "Enquête Judiciaire sur l'Agence",
      "description": "Audit fiscal visant votre représentant durant 6 mois suspendant toute signature de transfert."
    }
  },
  "card-match-derby-fever": {
    "en-GB": {
      "name": "Derby Day Adrenaline",
      "description": "The stadium is roaring. Your heart races as raw passion fuels every sprint and tackle."
    },
    "es-ES": {
      "name": "Adrenalina de Clásico",
      "description": "El estadio ruge. La pasión del derbi enciende tu corazón para protagonizar una actuación legendaria."
    },
    "es-AR": {
      "name": "Adrenalina de Clásico",
      "description": "La cancha es una caldera. La pasión del clásico te enciende el pecho para jugar el partido de tu vida."
    },
    "pt-BR": {
      "name": "Adrenalina de Clássico",
      "description": "O estádio ferve. A vibração do clássico incendeia sua alma para uma atuação inesquecible."
    },
    "fr-FR": {
      "name": "Fièvre du Derby",
      "description": "Le stade est en ébullition. La ferveur du grand derby enflamme votre cœur pour un match d'anthologie."
    }
  },
  "card-match-clutch-winner": {
    "en-GB": {
      "name": "Injury-Time Miracle",
      "description": "90+4 minutes on the clock. You demand the ball and unleash a thunderous strike into the top corner."
    },
    "es-ES": {
      "name": "Milagro en el Descuento",
      "description": "Minuto 94 en el marcador. Pides el balón y te vistes de héroe con un gol antológico en el último suspiro."
    },
    "es-AR": {
      "name": "Golazo en la Hora",
      "description": "Minuto 94 en el reloj. Pedís la pelota con personalidad y clavás un gol agónico que hace delirar a la hinchada."
    },
    "pt-BR": {
      "name": "Milagre nos Acréscimos",
      "description": "Minuto 94 no placar. Você assume a responsabilidade e marca um gol de placa no último lance."
    },
    "fr-FR": {
      "name": "Miracle du Temps Additionnel",
      "description": "90+4e minute au chrono. Vous réclamez le cuir et délivrez tout un peuple d'un chef-d'œuvre salvateur."
    }
  },
  "card-interview-good-gold": {
    "en-GB": {
      "name": "Gold: Humble Team First Leader",
      "description": "Gives full credit to teammates and coaching staff, displaying mature leadership."
    },
    "es-ES": {
      "name": "Líder Humilde al Servicio del Equipo",
      "description": "Elogias públicamente a tus compañeros y al cuerpo técnico en rueda de prensa forjando una unión ejemplar."
    },
    "es-AR": {
      "name": "Declaración de Caudillo Humilde",
      "description": "Le das todo el mérito a tus compañeros y al DT en la conferencia, ganándote el respeto del vestuario."
    },
    "pt-BR": {
      "name": "Líder Humilde e Exemplar",
      "description": "Em entrevista coletiva você valoriza o esforço coletivo e o trabalho da comissão, unindo o elenco."
    },
    "fr-FR": {
      "name": "Leader Humble et Fédérateur",
      "description": "Vous rendez hommage à vos partenaires et au staff technique en conférence, renforçant l'union sacrée."
    }
  },
  "card-interview-bad-ash": {
    "en-GB": {
      "name": "Ash: Scorched Earth Dressing Room Rant",
      "description": "Publicly attacks teammates work rate, triggering severe locker room unrest."
    },
    "es-ES": {
      "name": "Declaraciones Explosivas en Prensa",
      "description": "Criticas públicamente la actitud y el trabajo de tus compañeros ante los micrófonos, dinamitando el vestuario."
    },
    "es-AR": {
      "name": "Prender Fuego el Vestuario",
      "description": "Declarás caliente contra tus propios compañeros en la tele y prendés fuego la armonía del plantel."
    },
    "pt-BR": {
      "name": "Declarações Explosivas na Mídia",
      "description": "Críticas públicas aos companheiros de time diante dos microfones rachando o vestiário."
    },
    "fr-FR": {
      "name": "Sortie Fracassante dans la Presse",
      "description": "Attaque virulente contre le niveau de vos coéquipiers au micro, fracturant l'harmonie du vestiaire."
    }
  }
};

import { generateOverhauledTranslations } from '../data/overhauledCardTranslations';

// Register overhauled positive stat progression cards (Street, Youth, Career) across all 5 languages
Object.assign(ALL_CARD_TRANSLATIONS, generateOverhauledTranslations());

/**
 * Get localized name and description for any card ID in the specified language.
 * Falls back to es-ES if es-AR is missing, or en-GB if other languages are missing.
 */
export function getCardTranslation(cardId: string, lang: string): CardLocalizedText | undefined {
  const cardEntry = ALL_CARD_TRANSLATIONS[cardId];
  if (!cardEntry) return undefined;

  if (cardEntry[lang]) return cardEntry[lang];
  if (lang === 'es-AR' && cardEntry['es-ES']) return cardEntry['es-ES'];
  if (cardEntry['en-GB']) return cardEntry['en-GB'];
  return undefined;
}

/**
 * Attaches the complete dictionary of translations to a CustomCard object
 * so it is persisted in the Option File and available offline/cross-platform.
 */
export function attachCardTranslations<T extends CustomCard>(card: T): T {
  const trans = ALL_CARD_TRANSLATIONS[card.id];
  if (!trans) return card;

  return {
    ...card,
    translations: {
      ...(card.translations || {}),
      'en-GB': trans['en-GB'],
      'es-ES': trans['es-ES'],
      'es-AR': trans['es-AR'],
      'pt-BR': trans['pt-BR'],
      'fr-FR': trans['fr-FR'],
    },
  };
}

// Build fast inverted index by English description and English name for fallback resolution
const DESCRIPTION_INDEX: Map<string, Record<string, CardLocalizedText>> = new Map();
const NAME_INDEX: Map<string, Record<string, CardLocalizedText>> = new Map();

for (const entry of Object.values(ALL_CARD_TRANSLATIONS)) {
  const en = entry['en-GB'];
  if (en) {
    if (en.description) {
      DESCRIPTION_INDEX.set(en.description.trim().toLowerCase(), entry);
    }
    if (en.name) {
      NAME_INDEX.set(en.name.trim().toLowerCase(), entry);
    }
  }
}

/**
 * Universal Card Translation Resolver
 * Attempts lookup by:
 * 1. Exact ID
 * 2. Card prefixes (card-street-, card-youth-, default-parent-)
 * 3. Card object translations
 * 4. English description reverse lookup
 * 5. English name reverse lookup
 */
export function getUniversalCardTranslation(
  cardOrIdOrText: any,
  lang: string = 'en-GB'
): CardLocalizedText | null {
  if (!cardOrIdOrText) return null;

  // 1. If passed an ID string directly
  if (typeof cardOrIdOrText === 'string') {
    const directTrans = getCardTranslation(cardOrIdOrText, lang);
    if (directTrans) return directTrans;

    // Check variations
    const streetTrans = getCardTranslation(`card-street-${cardOrIdOrText}`, lang);
    if (streetTrans) return streetTrans;

    const youthTrans = getCardTranslation(`card-youth-${cardOrIdOrText}`, lang);
    if (youthTrans) return youthTrans;

    // Check by description index
    const lower = cardOrIdOrText.trim().toLowerCase();
    const byDesc = DESCRIPTION_INDEX.get(lower);
    if (byDesc) {
      return byDesc[lang] || byDesc['es-ES'] || byDesc['en-GB'] || null;
    }

    // Check by name index
    const byName = NAME_INDEX.get(lower);
    if (byName) {
      return byName[lang] || byName['es-ES'] || byName['en-GB'] || null;
    }

    return null;
  }

  // 2. If passed a card object
  const card = cardOrIdOrText;

  // Check card.translations
  if (card.translations && card.translations[lang]) {
    return card.translations[lang];
  }

  // Check card.id
  if (card.id) {
    const normId = card.id.toString().trim().toLowerCase();
    const byId = getCardTranslation(normId, lang);
    if (byId) return byId;

    const streetTrans = getCardTranslation(`card-street-${normId}`, lang);
    if (streetTrans) return streetTrans;

    const youthTrans = getCardTranslation(`card-youth-${normId}`, lang);
    if (youthTrans) return youthTrans;

    if (normId.startsWith('default-parent-')) {
      const parentTrans = getCardTranslation(normId, lang);
      if (parentTrans) return parentTrans;
    }
  }

  // Check parent card pattern
  if (card.typeId) {
    const rarityLower = (card.rarity || 'bronze').toString().toLowerCase();
    const parentId = `default-parent-${card.typeId}-${rarityLower}`;
    const byParent = getCardTranslation(parentId, lang);
    if (byParent) return byParent;

    // Check with bronze fallback
    const byBronzeParent = getCardTranslation(`default-parent-${card.typeId}-bronze`, lang);
    if (byBronzeParent) return byBronzeParent;
  }

  // Reverse lookup by description
  if (card.description) {
    const lowerDesc = card.description.trim().toLowerCase();
    const byDesc = DESCRIPTION_INDEX.get(lowerDesc);
    if (byDesc) {
      return byDesc[lang] || byDesc['es-ES'] || byDesc['en-GB'] || null;
    }
  }

  // Reverse lookup by name
  if (card.name) {
    const lowerName = card.name.trim().toLowerCase();
    const byName = NAME_INDEX.get(lowerName);
    if (byName) {
      return byName[lang] || byName['es-ES'] || byName['en-GB'] || null;
    }
  }

  return null;
}

/**
 * Returns a clone of the card with its name and description localized to the target language.
 */
export function getLocalizedCard<T extends CustomCard>(card: T, lang: string): T {
  const trans = getUniversalCardTranslation(card, lang);
  if (!trans) return card;

  return {
    ...card,
    name: trans.name || card.name,
    description: trans.description || card.description,
  };
}

/**
 * Returns the localized description for a card or raw description string
 */
export function getLocalizedCardDescription(description?: string, cardOrId?: any, lang: string = 'en-GB'): string {
  if (!description && !cardOrId) return '';
  const trans = getUniversalCardTranslation(cardOrId || description, lang);
  if (trans && trans.description) return trans.description;
  if (description) {
    const byDesc = getUniversalCardTranslation(description, lang);
    if (byDesc && byDesc.description) return byDesc.description;
  }
  return description || '';
}

/**
 * Returns the localized name for a card or raw name string
 */
export function getLocalizedCardName(name?: string, cardOrId?: any, lang: string = 'en-GB'): string {
  if (!name && !cardOrId) return '';
  const trans = getUniversalCardTranslation(cardOrId || name, lang);
  if (trans && trans.name) return trans.name;
  if (name) {
    const byName = getUniversalCardTranslation(name, lang);
    if (byName && byName.name) return byName.name;
  }
  return name || '';
}
