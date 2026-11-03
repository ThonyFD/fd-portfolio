import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Service {
  icon: string;
  title: string;
  description: string;
  tags: string[];
}

interface Differentiator {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-fd-systems',
  templateUrl: 'fd-systems.page.html',
  styleUrl: 'fd-systems.page.scss',
  imports: [RouterLink]
})
export class FdSystemsPage {

  currentYear = new Date().getFullYear();

  constructor() {
    inject(DOCUMENT).documentElement.setAttribute('lang', 'es');
  }

  services: Service[] = [
    {
      icon: 'code-slash',
      title: 'Desarrollo Web',
      description: 'Aplicaciones web modernas, rápidas y escalables usando las últimas tecnologías: Angular, React, Node.js y más.',
      tags: ['Angular', 'React', 'Node.js']
    },
    {
      icon: 'phone-portrait',
      title: 'Apps Móviles',
      description: 'Desarrollo de aplicaciones móviles nativas e híbridas para iOS y Android con experiencia de usuario premium.',
      tags: ['Ionic', 'React Native', 'Capacitor']
    },
    {
      icon: 'hardware-chip',
      title: 'Automatización con IA',
      description: 'Integramos inteligencia artificial en tus procesos para automatizar tareas repetitivas y optimizar tu operación.',
      tags: ['Agentes IA', 'LLMs', 'API Claude/GPT']
    },
    {
      icon: 'analytics',
      title: 'Análisis de Datos',
      description: 'Dashboards interactivos, reportes automatizados y pipelines de datos para tomar decisiones informadas.',
      tags: ['Dashboards', 'ETL', 'Visualización']
    },
    {
      icon: 'cloud-outline',
      title: 'Cloud & DevOps',
      description: 'Infraestructura en la nube, CI/CD, contenedores y despliegues automatizados para equipos ágiles.',
      tags: ['AWS', 'GCP', 'Firebase', 'Docker']
    },
    {
      icon: 'server',
      title: 'APIs & Integraciones',
      description: 'Diseño e implementación de APIs REST y GraphQL. Integramos sistemas legados con plataformas modernas.',
      tags: ['REST', 'GraphQL', 'Webhooks']
    }
  ];

  differentiators: Differentiator[] = [
    {
      icon: 'sparkles',
      title: 'IA como ventaja competitiva',
      description: 'No solo desarrollamos software, lo hacemos inteligente. Incorporamos IA donde realmente genera valor.'
    },
    {
      icon: 'shield-checkmark',
      title: 'Código de calidad',
      description: 'Buenas prácticas, testing automatizado y arquitecturas limpias que escalan con tu negocio.'
    },
    {
      icon: 'checkmark-circle',
      title: 'Entrega ágil',
      description: 'Iteraciones cortas, entregas frecuentes y comunicación transparente en cada etapa del proyecto.'
    }
  ];

  techStack: string[] = ['Angular', 'React', 'Node.js', 'TypeScript', 'Python', 'Firebase', 'AWS', 'Docker', 'PostgreSQL'];

  scrollTo(sectionId: string, event?: Event): void {
    const el = document.getElementById(sectionId);
    if (!el) return;
    event?.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
