
import { RunningPlan, RunningWorkoutData } from '../types';

export const RUNNING_PROTOCOLS: RunningWorkoutData[] = [
  // NÍVEL 1: INICIANTE
  { type: 'Caminhada Rápida', warmup: '5min Alongamento dinâmico', main: '30-40min Caminhada Ritmo Acelerado', cooldown: '5min Relaxamento', zone: 'Z1-Z2' },
  { type: 'CA-CO (Caminhada-Corrida)', warmup: '5min Caminhada', main: '1min Trote + 2min Caminhada (Repetir 8-10x)', cooldown: '5min Caminhada', zone: 'Z2' },
  { type: 'Trote Contínuo', warmup: '5min Caminhada', main: '20min Trote Leve constante', cooldown: '5min Caminhada', zone: 'Z2' },
  
  // NÍVEL 2: INTERMEDIÁRIO
  { type: 'Rodagem (Easy Run)', warmup: '10min Trote leve', main: '40-50min Ritmo estável e confortável', cooldown: '5min Caminhada', zone: 'Z2-Z3' },
  { type: 'Fartlek', warmup: '10min Trote', main: '1min Forte / 1min Leve (Repetir 10x)', cooldown: '10min Trote leve', zone: 'Z3-Z5' },
  { type: 'Progressivo', warmup: '10min Trote', main: '5km Leve + 3km Moderado + 2km Forte', cooldown: '5min Caminhada', zone: 'Z2 a Z4' },

  // NÍVEL 3: AVANÇADO
  { type: 'Tempo Run', warmup: '15min Trote + Educativos', main: '20-30min no Limiar (Confortavelmente difícil)', cooldown: '10min Trote', zone: 'Z4' },
  { type: 'Tiros Curtos', warmup: '20min Trote + 4x Acelerações', main: '10x 400m Forte (Intervalo 1min parado)', cooldown: '10min Trote', zone: 'Z5' },
  { type: 'Tiros Longos', warmup: '15min Trote', main: '4x 1000m Forte (Intervalo 2min trote)', cooldown: '10min Trote', zone: 'Z4-Z5' },
  { type: 'Longão', warmup: '10min Trote leve', main: 'Distância longa progressiva (Ritmo de conversa)', cooldown: 'Alongamento', zone: 'Z2' },

  // COMPLEMENTAR
  { type: 'Regenerativo', warmup: 'N/A', main: '20-30min Trote extremamente leve', cooldown: 'Alongamento', zone: 'Z1' },
];

export const HALF_MARATHON_BEGINNER_PLAN: RunningPlan = {
  id: 'meia_maratona_iniciante_12_semanas',
  name: 'Meia Maratona (Iniciante - 12 Semanas)',
  weeks: [
    { 
      id: 'w1', weekLabel: 'Semana 1', 
      days: { 
        tuesday: { type: 'Tiros Curtos', warmup: '15min Trote', main: '5x 400m Z4 (Intervalo: 400m trote)', cooldown: '5min Trote', zone: 'Z4' }, 
        thursday: { type: 'Rodagem', warmup: '5min Caminhada', main: '4km Rodagem Leve', cooldown: '5min Caminhada', zone: 'Z2' }, 
        saturday: { type: 'Longão', warmup: '5min Caminhada', main: '8km Longão confortável', cooldown: 'Alongamento', zone: 'Z2' } 
      } 
    },
    { 
      id: 'w2', weekLabel: 'Semana 2', 
      days: { 
        tuesday: { type: 'Tiros Curtos', warmup: '15min Trote', main: '6x 400m Z4 (Intervalo: 400m trote)', cooldown: '5min Trote', zone: 'Z4' }, 
        thursday: { type: 'Rodagem', warmup: '5min Caminhada', main: '4km Rodagem Leve', cooldown: '5min Caminhada', zone: 'Z2' }, 
        saturday: { type: 'Longão', warmup: '5min Caminhada', main: '10km Longão confortável', cooldown: 'Alongamento', zone: 'Z2' } 
      } 
    },
    { 
      id: 'w3', weekLabel: 'Semana 3', 
      days: { 
        tuesday: { type: 'Tiros Longos', warmup: '15min Trote', main: '4x 800m Z4 (Intervalo: 400m trote)', cooldown: '5min Trote', zone: 'Z4' }, 
        thursday: { type: 'Rodagem', warmup: '5min Caminhada', main: '5km Rodagem Leve', cooldown: '5min Caminhada', zone: 'Z2' }, 
        saturday: { type: 'Longão', warmup: '5min Caminhada', main: '12km Longão confortável', cooldown: 'Alongamento', zone: 'Z2' } 
      } 
    },
  ],
};

export const SEED_RUNNING_PLANS: RunningPlan[] = [
  HALF_MARATHON_BEGINNER_PLAN,
];
