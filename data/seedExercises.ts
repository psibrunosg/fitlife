
import { Exercise } from '../types';

// Helper to create exercises with consistent IDs
const createExercise = (
  name: string, 
  muscleGroup: string, 
  instructions: string = "",
  type: 'strength' | 'cardio' | 'crossfit' | 'mobilidade' = 'strength',
  manualId?: string
): Exercise => {
  const slug = manualId || name.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w-]+/g, '')
    .replace(/_{2,}/g, '_');
  return {
    id: slug,
    name,
    muscleGroup,
    type,
    instructions
  };
};

export const SEED_EXERCISES: Exercise[] = [
  // --- 1. PEITORAL ---
  createExercise('Supino Reto com Barra', 'Peitoral', 'O clássico construtor de massa para o peitoral maior como um todo.'),
  createExercise('Supino Inclinado com Barra', 'Peitoral', 'Foca na porção clavicular (parte superior do peitoral). Ângulos ideais variam entre 15° a 30°.'),
  createExercise('Supino Declinado com Barra', 'Peitoral', 'Enfatiza a porção inferior (esternocostal) e o tríceps.'),
  createExercise('Supino Guilhotina (Neck Press)', 'Peitoral', 'A barra desce em direção ao pescoço com cotovelos abertos para isolar o peitoral. Requer cuidado e cargas leves.'),
  createExercise('Supino Pegada Inversa', 'Peitoral', 'Excelente para a parte superior do peitoral, aliviando a tensão nos ombros.'),
  createExercise('Supino Reto com Halteres', 'Peitoral', 'Permite uma convergência no topo, contraindo mais o miolo do peito e maior amplitude.'),
  createExercise('Supino Inclinado com Halteres', 'Peitoral', 'Foco superior com maior alongamento que a barra.'),
  createExercise('Supino Declinado com Halteres', 'Peitoral', 'Foco inferior com maior liberdade de movimento.'),
  createExercise('Supino Neutro (Pegada Martelo)', 'Peitoral', 'Foca na parte interna ("miolo") e reduz estresse no ombro.'),
  createExercise('Crucifixo Reto (Fly)', 'Peitoral', 'Isolamento total, foco no alongamento das fibras.'),
  createExercise('Crucifixo Inclinado', 'Peitoral', 'Isolamento da parte superior com foco no alongamento.'),
  createExercise('Pullover com Halter', 'Peitoral', 'Trabalha a caixa torácica e a porção inferior do peitoral (também atinge o dorsal).'),
  createExercise('Svend Press', 'Peitoral', 'Apertar um halter ou anilha contra o outro em frente ao peito, mantendo tensão isométrica constante.'),
  createExercise('Crossover Polia Alta', 'Peitoral', 'Movimento de cima para baixo. Foca na parte inferior e no contorno do peitoral.'),
  createExercise('Crossover Polia Média (Fly em Pé)', 'Peitoral', 'Foco na parte esternal (geral) do peitoral.'),
  createExercise('Crossover Polia Baixa', 'Peitoral', 'Movimento de baixo para cima. Foco intenso na parte superior (clavicular).'),
  createExercise('Crucifixo no Banco (com Cabos)', 'Peitoral', 'Oferece tensão contínua que os halteres perdem no topo do movimento.'),
  createExercise('Press com Cabos (Cable Press)', 'Peitoral', 'Simula um supino, mas feito em pé ou sentado na polia, exigindo estabilização do core.'),
  createExercise('Supino Vertical (Máquina Sentada)', 'Peitoral', 'Ótimo para iniciantes ou para dropsets no final do treino.'),
  createExercise('Peck Deck (Voador)', 'Peitoral', 'Isolador clássico. Mantém os braços flexionados para isolar o peitoral.'),
  createExercise('Supino Articulado (Hammer Strength)', 'Peitoral', 'Máquinas que simulam o movimento de peso livre mas com trajetória fixa.'),
  createExercise('Chest Press Convergente', 'Peitoral', 'Máquinas onde as manoplas se aproximam no final do movimento, aumentando a contração central.'),
  createExercise('Flexão de Braço', 'Peitoral', 'O básico eficiente com peso do corpo.'),
  createExercise('Flexão Inclinada', 'Peitoral', 'Mãos em superfície elevada. Foca na parte inferior (mais fácil).'),
  createExercise('Flexão Declinada', 'Peitoral', 'Pés elevados. Foca na parte superior (mais difícil).'),
  createExercise('Flexão Diamante', 'Peitoral', 'Mãos juntas. Foca no tríceps e na parte central interna do peitoral.'),
  createExercise('Flexão Aberta', 'Peitoral', 'Tira o foco do tríceps e coloca mais no peitoral externo.'),
  createExercise('Flexão Archer', 'Peitoral', 'Desce o corpo para um lado enquanto estica o outro braço.'),
  createExercise('Dips (Mergulho nas Paralelas)', 'Peitoral', 'Incline o tronco para frente para focar na parte inferior e externa do peitoral.'),

  // --- 2. PERNAS (Quadríceps, Posteriores, Glúteos, Panturrilhas) ---
  // Quadríceps
  createExercise('Agachamento Livre (Back Squat)', 'Pernas', 'O rei dos exercícios. Trabalha a perna inteira com ênfase no quadríceps.'),
  createExercise('Agachamento Frontal', 'Pernas', 'Barra apoiada nos ombros à frente. Isola mais o quadríceps e exige postura.'),
  createExercise('Agachamento Hack', 'Pernas', 'Feito na máquina inclinada. Excelente para focar no quadríceps com segurança nas costas.'),
  createExercise('Leg Press 45°', 'Pernas', 'Permite muita carga. Pés mais baixos focam quadríceps; pés mais altos focam glúteo/posterior.'),
  createExercise('Agachamento Búlgaro', 'Pernas', 'Unilateral, pé de trás apoiado. Construtor brutal de massa e equilíbrio.'),
  createExercise('Afundo (Lunge)', 'Pernas', 'Passada estacionária.'),
  createExercise('Avanço (Walking Lunge)', 'Pernas', 'Passada caminhando (dinâmica).'),
  createExercise('Cadeira Extensora', 'Pernas', 'O principal exercício isolador. Fundamental para detalhes e cortes na coxa.'),
  createExercise('Sissy Squat', 'Pernas', 'Projeta os joelhos para frente e tronco para trás. Foco extremo no reto femoral.'),
  createExercise('Agachamento Goblet', 'Pernas', 'Segurando halter na frente do peito. Ótimo para postura e profundidade.'),
  createExercise('Step-Up (Subida no Banco)', 'Pernas', 'Foca muito no quadríceps da perna que está subindo.'),
  
  // Posteriores
  createExercise('Mesa Flexora', 'Pernas', 'Trabalha o posterior em uma posição alongada no quadril.'),
  createExercise('Cadeira Flexora', 'Pernas', 'Gera maior hipertrofia por manter o músculo sob maior tensão alongada.'),
  createExercise('Flexão Nórdica', 'Pernas', 'Exercício com peso do corpo travando calcanhares. Eficiente para força excêntrica.'),
  createExercise('Flexão em Pé Unilateral', 'Pernas', 'Ótimo para corrigir assimetrias.'),
  createExercise('Stiff', 'Pernas', 'Pernas semiflexionadas, coluna reta. Foco total no alongamento do posterior.'),
  createExercise('RDL (Romanian Deadlift)', 'Pernas', 'Similar ao Stiff, mas com um pouco mais de flexão de joelho, permitindo mais carga.'),
  createExercise('Good Morning', 'Pernas', 'Barra nas costas, flexionando o tronco à frente. Exige muito da lombar e posteriores.'),

  // Glúteos
  createExercise('Elevação Pélvica (Hip Thrust)', 'Pernas', 'O melhor exercício isolado para glúteo máximo.'),
  createExercise('Agachamento Sumô', 'Pernas', 'Pés afastados, pontas para fora. Enfatiza glúteos e adutores.'),
  createExercise('Levantamento Terra Clássico', 'Pernas', 'Exercício de força total, com grande ativação de glúteo e costas.'),
  createExercise('Cadeira Abdutora', 'Pernas', 'Foca no glúteo médio (lateral), essencial para estabilidade.'),
  createExercise('Glúteo na Polia (Coice)', 'Pernas', 'Extensão de quadril com cabo. Excelente para finalizar o treino.'),
  createExercise('Adução de Coxa (Cadeira Adutora)', 'Pernas', 'Foca na parte interna da coxa (adutores).'),

  // Panturrilhas
  createExercise('Panturrilha em Pé', 'Pernas', 'Foca no Gastrocnêmio (porção maior/externa). Joelhos esticados.'),
  createExercise('Panturrilha no Leg Press', 'Pernas', 'Variação com joelhos esticados para Gastrocnêmio.'),
  createExercise('Burrinho (Donkey Calf Raise)', 'Pernas', 'Tronco inclinado à frente, foco no Gastrocnêmio.'),
  createExercise('Panturrilha Sentado', 'Pernas', 'Foca no Sóleo (porção profunda/lateral). Joelhos flexionados.'),
  createExercise('Elevação de Ponta de Pé', 'Pernas', 'Para Tibial Anterior (frente da canela).'),

  // --- 3. TRÍCEPS ---
  createExercise('Supino Fechado', 'Tríceps', 'O melhor construtor de massa para o tríceps. Mãos na largura dos ombros.'),
  createExercise('Mergulho nas Paralelas (Dips) - Tríceps', 'Tríceps', 'Tronco reto foca totalmente no tríceps.'),
  createExercise('Mergulho no Banco', 'Tríceps', 'Ótimo para finalizar o treino. Cuidado com os ombros.'),
  createExercise('Tríceps Testa', 'Tríceps', 'Com barra W ou halteres. Trabalha muito a cabeça longa e medial.'),
  createExercise('Tríceps Francês', 'Tríceps', 'Único movimento que alonga totalmente a cabeça longa do tríceps.'),
  createExercise('Tríceps Pulley/Corda', 'Tríceps', 'Foca na cabeça lateral. A corda permite maior contração.'),
  createExercise('Tríceps Coice', 'Tríceps', 'Excelente para pico de contração. Mantenha o cotovelo alto e imóvel.'),
  createExercise('Tríceps Testa na Polia Alta', 'Tríceps', 'Trazendo a barra da polia alta por cima da cabeça com tensão constante.'),

  // --- 4. BÍCEPS ---
  createExercise('Rosca Direta', 'Bíceps', 'O clássico. Barra reta ou W.'),
  createExercise('Rosca Alternada com Halteres', 'Bíceps', 'Permite girar o punho (supinação) no topo, ativando mais fibras.'),
  createExercise('Rosca Inclinada', 'Bíceps', 'Braço para trás do tronco, alongando a cabeça longa desde a origem.'),
  createExercise('Rosca Bayesian', 'Bíceps', 'Na polia, de costas para a máquina. Tensão máxima no alongamento.'),
  createExercise('Rosca Scott', 'Bíceps', 'Braços à frente. Foca na parte de baixo e cabeça curta.'),
  createExercise('Rosca Concentrada', 'Bíceps', 'Isolamento máximo para o pico do bíceps.'),
  createExercise('Rosca Spider', 'Bíceps', 'Peito apoiado no banco inclinado, braços verticais. Isola completamente.'),
  createExercise('Rosca 21', 'Bíceps', '7 repetições inferiores, 7 superiores e 7 completas.'),
  createExercise('Rosca Martelo', 'Bíceps', 'Pegada neutra. Trabalha braquial (largura) e antebraço.'),
  createExercise('Rosca Martelo na Corda', 'Bíceps', 'Variação com tensão contínua.'),
  createExercise('Rosca Zottman', 'Bíceps', 'Sobe supinada, desce pronada. Trabalha bíceps e antebraço.'),

  // --- 5. ANTEBRAÇOS ---
  createExercise('Rosca Inversa', 'Antebraço', 'Palmas para baixo. Foca nos extensores e braquiorradial.'),
  createExercise('Rosca de Punho', 'Antebraço', 'Palmas para cima. Foca nos flexores (parte interna).'),
  createExercise('Rosca de Punho Inversa', 'Antebraço', 'Palmas para baixo. Foca nos extensores (parte externa).'),
  createExercise('Farmer\'s Walk (Caminhada do Fazendeiro)', 'Antebraço', 'Segurar halteres pesados e caminhar. Constrói trapézio e antebraços.'),
  createExercise('Pendurar na Barra (Dead Hang)', 'Antebraço', 'Segurar o peso do corpo na barra fixa pelo máximo de tempo.'),

  // --- 6. OMBROS ---
  // Desenvolvimento
  createExercise('Desenvolvimento Militar', 'Ombros', 'Em pé com barra. Teste de força, exige core e glúteos.'),
  createExercise('Desenvolvimento com Halteres', 'Ombros', 'Permite movimento mais natural e corrige desequilíbrios.'),
  createExercise('Desenvolvimento Arnold', 'Ombros', 'Gira as palmas ao subir. Atinge as três cabeças do deltoide.'),
  createExercise('Desenvolvimento Máquina', 'Ombros', 'Excelente para dropsets e segurança.'),
  createExercise('Desenvolvimento Nuca', 'Ombros', 'Cuidado: Requer ótima mobilidade. Foca na porção lateral.'),
  createExercise('Push Press', 'Ombros', 'Usa impulso das pernas para cargas supramáximas na negativa.'),
  
  // Lateral
  createExercise('Elevação Lateral com Halteres', 'Ombros', 'Jogue o peso "para longe". Foca na largura.'),
  createExercise('Elevação Lateral na Polia', 'Ombros', 'Mantém tensão constante desde o início.'),
  createExercise('Elevação Lateral Inclinada', 'Ombros', 'Inclinando o corpo para o lado para aumentar a amplitude.'),
  createExercise('Elevação Lateral Sentado', 'Ombros', 'Elimina o balanço do corpo.'),
  createExercise('Remada Alta', 'Ombros', 'Pegada aberta foca no deltoide lateral.'),
  createExercise('Máquina de Elevação Lateral', 'Ombros', 'Tensão no topo sem depender da pegada.'),

  // Posterior
  createExercise('Crucifixo Inverso', 'Ombros', 'Com halteres. Essencial para postura e o aspecto "3D" do ombro.'),
  createExercise('Crucifixo Inverso na Máquina', 'Ombros', 'Peck Deck Invertido. Isola a parte de trás sem cansar a lombar.'),
  createExercise('Face Pull', 'Ombros', 'Puxe a corda em direção à testa. Obrigatório para saúde do ombro.'),
  createExercise('Crucifixo Inverso no Cabo', 'Ombros', 'Em X. Tensão brutal no pico de contração.'),
  createExercise('Skiier', 'Ombros', 'No cabo alto, puxando para baixo e para trás.'),

  // Anterior
  createExercise('Elevação Frontal com Halteres', 'Ombros', 'Pode ser alternada ou simultânea.'),
  createExercise('Elevação Frontal com Barra', 'Ombros', 'Permite mais carga.'),
  createExercise('Elevação Frontal com Anilha', 'Ombros', 'Variação isométrica "Bus Driver" no topo.'),
  createExercise('Elevação Frontal na Polia', 'Ombros', 'Garante tensão contínua.'),

  // Trapézio
  createExercise('Encolhimento com Barra', 'Ombros', 'Pela frente ou por trás. Cargas altas funcionam bem.'),
  createExercise('Encolhimento com Halteres', 'Ombros', 'Permite pegada neutra e maior amplitude.'),
  createExercise('Encolhimento no Smith', 'Ombros', 'Foco na contração sem se preocupar com equilíbrio.'),

  // --- 7. COSTAS ---
  // Puxadas
  createExercise('Barra Fixa', 'Costas', 'O exercício mais eficiente. Pegada pronada e aberta.'),
  createExercise('Puxada Alta (Lat Pulldown)', 'Costas', 'Versão na máquina da barra fixa.'),
  createExercise('Puxada Alta Supinada', 'Costas', 'Envolve bíceps, excelente para parte inferior do dorsal.'),
  createExercise('Puxada Alta Neutra (Triângulo)', 'Costas', 'Permite mais carga e foca fibras baixas.'),
  createExercise('Puxada Unilateral no Cabo (Ilíaca)', 'Costas', 'Puxa de cima ao quadril. Melhor para isolar a "asa".'),

  // Remadas
  createExercise('Remada Curvada', 'Costas', 'Construtor de massa bruta. Tronco inclinado.'),
  createExercise('Remada Cavalinho', 'Costas', 'Permite muita carga com segurança.'),
  createExercise('Remada Unilateral (Serrote)', 'Costas', 'Corrige assimetrias e permite maior amplitude.'),
  createExercise('Remada Baixa (Triângulo)', 'Costas', 'Foca no miolo das costas e dorsal baixo.'),
  createExercise('Remada Baixa (Barra Aberta)', 'Costas', 'Foca na parte alta e romboides.'),
  createExercise('Remada Máquina', 'Costas', 'Ótima para dropsets e falha com segurança.'),

  // Isoladores & Lombar
  createExercise('Pullover na Polia', 'Costas', 'Braços esticados. Mantém tensão constante no dorsal.'),
  createExercise('Pullover com Halter (Banco)', 'Costas', 'Alonga a caixa torácica e trabalha dorsal em extensão máxima.'),
  createExercise('Depressão Sagital', 'Costas', 'Focado na contração final perto do quadril.'),
  createExercise('Levantamento Terra (Deadlift)', 'Costas', 'Exercício completo. Força principal na cadeia posterior.'),
  createExercise('Meio-Terra (Rack Pull)', 'Costas', 'Saindo do joelho. Foca brutalmente na espessura das costas.'),
  createExercise('Hiperextensão Lombar', 'Costas', 'Banco Romano. Foca nos eretores da espinha.'),
  createExercise('Superman', 'Costas', 'Deitado no chão, elevando membros. Fortalecimento sem carga.'),

  // --- 8. ALONGAMENTOS (MOBILIDADE) ---
  createExercise('Inclinação Lateral (Pescoço)', 'Mobilidade', 'Puxe suavemente a cabeça tentando encostar a orelha no ombro. Empurre o ombro oposto para baixo.', 'mobilidade'),
  createExercise('Cheiro no Sovaco', 'Mobilidade', 'Gire a cabeça 45 graus e puxe para baixo. Sente atrás do pescoço até a escápula.', 'mobilidade'),
  createExercise('Peitoral no Batente', 'Mobilidade', 'Apoie antebraço no batente (90 graus) e gire o tronco para o lado oposto.', 'mobilidade'),
  createExercise('Mãos Entrelaçadas Atrás', 'Mobilidade', 'Entrelace dedos atrás, estique cotovelos e suba os braços sem curvar o tronco.', 'mobilidade'),
  createExercise('Posição da Criança', 'Mobilidade', 'Ajoelhado, estique braços à frente e quadril para trás. Alivia lombar e dorsal.', 'mobilidade'),
  createExercise('Gato e Vaca', 'Mobilidade', 'Em 4 apoios, alterne entre arquear as costas (olhar p/ cima) e arredondar (olhar p/ umbigo).', 'mobilidade'),
  createExercise('Dorsal Lateral (Pilar)', 'Mobilidade', 'Segure num pilar, cruze a perna de fora por trás e incline o corpo para o lado.', 'mobilidade'),
  createExercise('Ilio-Psoas', 'Mobilidade', 'Posição de proposta. Contraia o glúteo de trás e empurre o quadril levemente à frente.', 'mobilidade'),
  createExercise('Posterior de Coxa Sentado', 'Mobilidade', 'Tente encostar o umbigo na coxa, mantendo a coluna reta (dobradiça de quadril).', 'mobilidade'),
  createExercise('Glúteo (Figura 4)', 'Mobilidade', 'Deitado, cruze tornozelo sobre joelho oposto e puxe a coxa em direção ao peito.', 'mobilidade'),
  createExercise('Quadríceps Em Pé', 'Mobilidade', 'Segure o pé atrás. Mantenha joelhos colados e contraia o abdômen.', 'mobilidade'),
  createExercise('Panturrilha na Parede', 'Mobilidade', 'Perna de trás esticada, calcanhar no chão. Empurre a parede.', 'mobilidade'),
];
