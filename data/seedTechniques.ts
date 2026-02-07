import { TrainingTechnique } from '../types';

export const SEED_TECHNIQUES: TrainingTechnique[] = [
  {
    id: 'progressao_intensidade_variavel',
    name: 'Sistema Progressão e Intensidade Variável',
    description: 'Este sistema utiliza uma metodologia baseada em Progressão de Carga e tabelas de Intensidade Variável para cada exercício. O objetivo é atingir a falha dentro de um intervalo de repetições (mínimo e máximo). Quando atingir o teto máximo de repetições, aumenta-se a carga e volta-se ao mínimo de repetições.',
    details: [
      {
        title: 'Intensidade 1 (Explosão)',
        description: 'Foco em força máxima com execução explosiva na fase positiva do movimento.',
        properties: {
          'Repetições': '5 a 7 (com 1-2 reps na reserva)',
          'Cadência': '3s negativa, explosão na positiva',
          'Descanso': '2 a 4 minutos',
        },
      },
      {
        title: 'Intensidade 2 (Alongamento)',
        description: 'Maximiza a tensão sob alongamento para hipertrofia.',
        properties: {
          'Repetições': '8 a 12 (até a falha total)',
          'Cadência': '3s negativa, 1s isometria na fase alongada, 2s positiva controlada',
          'Descanso': '2 minutos',
        },
      },
      {
        title: 'Intensidade 3 (Pump)',
        description: 'Busca o máximo de estresse metabólico e "pump" muscular.',
        properties: {
          'Repetições': '15 a 20 (até a falha total)',
          'Cadência': 'Contínua (2s negativa / 2s positiva), "apertando" o músculo',
          'Descanso': '1 minuto e 30 segundos',
        },
      },
      {
        title: 'Protocolo de Deload',
        description: 'Reduzir os pesos para cerca de 60% nas séries válidas para recuperação.',
        properties: {
          'Frequência (Feminino)': 'A cada 4-6 semanas',
          'Frequência (Upper/Lower)': 'A cada 6-8 semanas',
        },
      },
    ],
  },
  {
    id: 'treino_abcd_tecnicas_avancadas',
    name: 'Sistema Treino ABCD (Técnicas Avançadas)',
    description: 'Este protocolo foca em variar os estímulos através de técnicas específicas aplicadas a exercícios selecionados para quebrar platôs de treino.',
    details: [
      {
        title: 'Técnica "SLOW"',
        description: 'Consiste em 4 repetições com 5 segundos de fase concêntrica (subida), 4 repetições com 5 segundos de fase excêntrica (descida), e 4 repetições em velocidade normal.',
      },
      {
        title: 'Técnica "BI-SET" (Super Série)',
        description: 'Realizar dois exercícios, geralmente para o mesmo grupo muscular ou músculos antagonistas, seguidos sem descanso entre eles.',
      },
      {
        title: 'Técnica "EXAUSTÃO"',
        description: 'Levar o músculo até a falha concêntrica total em todas as séries de um determinado exercício.',
      },
      {
        title: 'Técnica "REST PAUSE"',
        description: 'Após atingir a falha, fazer um descanso curto (10-15 segundos) e continuar a série com a mesma carga. Repetir o processo até conseguir fazer apenas 1 repetição.',
      },
    ],
  },
  {
    id: 'sistema_funcional',
    name: 'Sistema Funcional (50 Treinos Prontos)',
    description: 'Este protocolo segue uma estrutura de circuito funcional, focada em não repetir treinos e alta intensidade metabólica para condicionamento geral.',
    details: [
      {
        title: 'Estrutura Padrão',
        description: 'Sempre inicia com uma fase de Aquecimento, incluindo Mobilidade e Estabilidade articular.',
      },
      {
        title: 'Blocos de Exercícios',
        description: 'O treino é dividido em exercícios contínuos ou em Blocos (ex: Bloco 1, Bloco 2) para organizar o fluxo da sessão.',
      },
      {
        title: 'Protocolos de Tempo/Intervalo',
        description: 'A maioria dos treinos é baseada em tempo de execução fixo (ex: 3x50s, 4x40s) em vez de contagem de repetições. Os intervalos variam de 40s a 1 minuto, aplicados ao final da série ou do exercício.',
      },
    ],
  },
  {
    id: 'mobilidade_e_estabilidade',
    name: 'Sistema Mobilidade e Estabilidade (Treinador Elite)',
    description: 'Protocolo corretivo focado na função articular específica para alívio de dores e melhora da performance, baseado na lógica "Joint-by-Joint".',
    details: [
      {
        title: 'Lógica Articular ("Joint-by-Joint")',
        description: 'O corpo é uma pilha de articulações com necessidades alternadas de mobilidade e estabilidade. O problema em uma articulação geralmente é causado por disfunção na articulação acima ou abaixo.',
      },
      {
        title: 'Dores na Lombar',
        description: 'Foco em Estabilidade Lombar + Mobilidade de Quadril e Torácica.',
      },
      {
        title: 'Dores nos Joelhos',
        description: 'Foco em Estabilidade de Joelho + Mobilidade de Tornozelo e Fortalecimento do Arco Plantar.',
      },
      {
        title: 'Dores nos Ombros',
        description: 'Foco em Mobilidade de Ombro + Estabilidade Escapular e Mobilidade Torácica.',
      },
    ],
  },
];
