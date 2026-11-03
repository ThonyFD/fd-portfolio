import { Locale } from '../content/content.types';

export interface UiStrings {
  skip: string;
  role: string;
  sentence: string;
  emailMe: string;
  emailSubject: string;
  nav: { ai: string; experience: string; resume: string; otherLocale: string; otherLocaleHref: string; otherLocaleLang: Locale };
  place: string;
  bandCaption: string;
  bandAlt: string;
  aiHeading: string;
  aiNote: string;
  sendEvent: string;
  stageOf: (i: number, n: number, name: string) => string;
  delivered: string;
  experienceHeading: string;
  experienceIntro: string;
  facts: { basedIn: string; basedInValue: string; works: string; worksValue: string; reach: string };
  projectsHeading: string;
  earlierWork: string;
  skillsHeading: string;
  educationHeading: string;
  coursesHeading: string;
  contactHeading: string;
  contactInvite: string;
  credits: string;
}

const CREDITS =
  'Photographs, all public domain via Wikimedia Commons: "Panama Canal Gatun Locks 1913" by the Isthmian Historical Society; ' +
  '"Testing the Emergency Dam, Gatun Locks" by Ernest Hallen; "Gatun locks looking toward Atlantic entrance of canal" by the Byron Company.';

export const STRINGS: Record<Locale, UiStrings> = {
  en: {
    skip: 'Skip to content',
    role: 'Solutions Architect and AI Systems Engineer',
    sentence: 'I design AI agent systems and run them in production. Open to remote roles.',
    emailMe: 'Email me',
    emailSubject: 'Role for Anthony Mosquera',
    nav: { ai: 'AI work', experience: 'Experience', resume: 'Resume', otherLocale: 'Español', otherLocaleHref: '/es', otherLocaleLang: 'es' },
    place: 'Panama City · GMT-5 · English and Spanish',
    bandCaption: 'Gatun Locks, Panama Canal, about 1913. Ships rise and fall through one chamber at a time; so do the events below.',
    bandAlt: 'Panorama of the Gatun Locks under construction, Panama Canal, about 1913',
    aiHeading: 'AI experience',
    aiNote: 'Systems built in 2026. Pick one and send a test event through its stages.',
    sendEvent: 'Send a test event',
    stageOf: (i, n, name) => `Stage ${i} of ${n}: ${name}`,
    delivered: 'Delivered.',
    experienceHeading: 'Seventeen years of systems',
    experienceIntro:
      'From Telefónica and Banistmo to Banca Móvil, the most used banking app in Panama, and Yappy, then Tigo, Cox and Banco Aliado. Today I am Solutions Architect at ASSA.',
    facts: { basedIn: 'Based in', basedInValue: 'Panama City, GMT-5', works: 'Works', worksValue: 'Remote, English and Spanish', reach: 'Reach me' },
    projectsHeading: 'Selected projects',
    earlierWork: 'Earlier work',
    skillsHeading: 'Skills',
    educationHeading: 'Education',
    coursesHeading: 'Courses',
    contactHeading: 'Contact',
    contactInvite: 'Hiring for AI systems, remote? Write to me.',
    credits: CREDITS,
  },
  es: {
    skip: 'Ir al contenido',
    role: 'Arquitecto de Soluciones e Ingeniero de Sistemas con IA',
    sentence: 'Diseño sistemas de agentes de IA y los opero en producción. Disponible para trabajo remoto.',
    emailMe: 'Escríbeme',
    emailSubject: 'Oportunidad para Anthony Mosquera',
    nav: { ai: 'IA', experience: 'Experiencia', resume: 'CV', otherLocale: 'English', otherLocaleHref: '/', otherLocaleLang: 'en' },
    place: 'Ciudad de Panamá · GMT-5 · Inglés y español',
    bandCaption: 'Esclusas de Gatún, Canal de Panamá, hacia 1913. Los barcos suben y bajan una cámara a la vez; los eventos de abajo también.',
    bandAlt: 'Panorámica de las esclusas de Gatún en construcción, Canal de Panamá, hacia 1913',
    aiHeading: 'Experiencia con IA',
    aiNote: 'Sistemas construidos en 2026. Elige uno y envía un evento de prueba por sus etapas.',
    sendEvent: 'Enviar evento de prueba',
    stageOf: (i, n, name) => `Etapa ${i} de ${n}: ${name}`,
    delivered: 'Entregado.',
    experienceHeading: 'Diecisiete años de sistemas',
    experienceIntro:
      'De Telefónica y Banistmo a Banca Móvil, la app bancaria más usada de Panamá, y Yappy; luego Tigo, Cox y Banco Aliado. Hoy soy Arquitecto de Soluciones en ASSA.',
    facts: { basedIn: 'Ubicación', basedInValue: 'Ciudad de Panamá, GMT-5', works: 'Modalidad', worksValue: 'Remoto, inglés y español', reach: 'Contacto' },
    projectsHeading: 'Proyectos destacados',
    earlierWork: 'Trabajo anterior',
    skillsHeading: 'Habilidades',
    educationHeading: 'Educación',
    coursesHeading: 'Cursos',
    contactHeading: 'Contacto',
    contactInvite: '¿Buscas a alguien para sistemas con IA, en remoto? Escríbeme.',
    credits:
      'Fotografías de dominio público vía Wikimedia Commons: "Panama Canal Gatun Locks 1913", Isthmian Historical Society; ' +
      '"Testing the Emergency Dam, Gatun Locks", Ernest Hallen; "Gatun locks looking toward Atlantic entrance of canal", Byron Company.',
  },
};
