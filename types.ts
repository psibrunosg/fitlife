
export interface User {
  uid: string; // Firebase Auth UID
  email: string;
  name: string;
  workoutType: string;
  avatar?: string;
  trainerId?: string;
  hasCompletedAnamnesis?: boolean;
  // Subcollection data, loaded on demand
  workouts?: Workout[]; 
  customWorkout?: WorkoutExercise[];
  history?: WorkoutHistoryEntry[];
  assessments?: AssessmentEntry[];
  templates?: Template[];
  runningPlans?: RunningPlan[];
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  type?: 'strength' | 'cardio' | 'crossfit' | 'mobilidade';
  img?: string;
  instructions?: string;
  target?: string;
}

export interface WorkoutExercise {
  type: 'exercise'; // Differentiator
  id: string;
  exercise: string;
  target: string;
  img?: string;
  instructions?: string;
  displayString: string;
  val1?: string; // sets or distance
  val2?: string; // reps or time
  timerValue?: number; // Time in seconds (increment of 15)
  completed?: boolean;
  notes?: string; 
  rest?: string; 
  supersetGroup?: string; 
  // Expanded to allow flexible strings for custom techniques defined in Admin
  technique?: 'drop-set' | 'rest-pause' | 'slow-cadence' | 'bi-set' | 'tri-set' | 'giant-set' | 'exaustao' | 'pico-contracao' | string;
}

export interface BlockHeader {
  type: 'header';
  id: string; // Unique ID for key prop
  label: string; // e.g., "Aquecimento", "Bloco 1"
}

export type WorkoutItem = WorkoutExercise | BlockHeader;

export interface Workout {
  id: string; 
  items: WorkoutItem[];
}

export interface Template {
  id: string; 
  name: string;
  exercises: WorkoutItem[]; 
}

export interface WorkoutHistory {
  date: string;
  workoutName: string;
  duration: string;
  rpe: number;
  comment: string;
}

export type WorkoutHistoryEntry = WorkoutHistory & { id: string };

export interface Anamnesis {
  id?: string;
  evaluationDate: string;
  profession: string;
  maritalStatus: string;
  goals: {
    hypertrophy: boolean;
    fatLoss: boolean;
    conditioning: boolean;
    qualityOfLife: boolean;
    rehabilitation: boolean;
  };
  clinicalHistory: {
    cardiovascular: string;
    metabolic: string;
    respiratory: string;
    osteoarticular: string;
    medications: string;
    others: string;
  };
  lifestyle: {
    smoking: 'smoker' | 'ex-smoker' | 'non-smoker' | '';
    alcohol: string;
    physicalActivityLevel: 'sedentary' | 'moderately_active' | 'active' | '';
    sleepHours: string;
    stressLevel: 'high' | 'medium' | 'low' | '';
    hydration: string;
  };
}


export interface Assessment {
  date: string;
  vitals?: {
    systolicBP?: number;
    diastolicBP?: number;
    restingHR?: number;
  };
  anthropometry?: {
    weight?: number;
    height?: number;
    bmi?: number;
    waistToHipRatio?: number;
  };
  perimetry?: {
    neck?: number;
    shoulders?: number;
    chest?: number;
    waist?: number;
    abdomen?: number;
    hip?: number;
    armRelaxedR?: number;
    armRelaxedL?: number;
    armContractedR?: number;
    armContractedL?: number;
    forearmR?: number;
    forearmL?: number;
    wrist?: number;
    thighProximalR?: number;
    thighProximalL?: number;
    thighMedialR?: number;
    thighMedialL?: number;
    calfR?: number;
    calfL?: number;
  };
  skinfolds?: {
    subscapular?: number;
    triceps?: number;
    biceps?: number;
    midaxillary?: number;
    chest?: number;
    suprailiac?: number;
    abdominal?: number;
    thigh?: number;
    calf?: number;
  };
  postural?: {
    headTiltR?: boolean; headTiltL?: boolean;
    shoulderElevationR?: boolean; shoulderElevationL?: boolean;
    hipElevationR?: boolean; hipElevationL?: boolean;
    kneesValgus?: boolean; kneesVarus?: boolean;
    feetFlat?: boolean; feetCavus?: boolean; feetPronated?: boolean; feetSupinated?: boolean;
    headProtrusion?: boolean;
    cervicalLordosis?: boolean; cervicalRectification?: boolean;
    thoracicKyphosis?: boolean; thoracicRectification?: boolean;
    lumbarHyperlordosis?: boolean; lumbarRectification?: boolean;

    abdomenProtrusion?: boolean;
    scapulaWinging?: boolean; scapulaAbducted?: boolean;
    scoliosisS?: boolean; scoliosisC?: boolean;
  };
  neuroMotor?: {
    flexibility?: number;
    abdominalResistance?: number;
    upperLimbResistance?: number;
    vo2max?: number;
  };
}

export type AssessmentEntry = Assessment & { id: string };

export interface RunningSet {
  id: string;
  exercise: string;
  detail: string;
}

export interface RunningWorkoutData {
  type: string; // Ex: "Rodagem", "Tiros", "Longão"
  warmup: string; // Ex: "10min Trote"
  main: string; // Ex: "5km Z2"
  cooldown: string; // Ex: "5min Caminhada"
  zone?: string; // Ex: "Z2-Z3"
}

// Union type to support legacy string data if necessary, though we will migrate to object
export type RunningWorkout = RunningWorkoutData | string;

export interface RunningPlan {
  id: string;
  name: string;
  weeks: RunningWeek[];
}

export interface RunningWeek {
  id: string;
  weekLabel: string;
  days: {
    monday?: RunningWorkout;
    tuesday?: RunningWorkout;
    wednesday?: RunningWorkout;
    thursday?: RunningWorkout;
    friday?: RunningWorkout;
    saturday?: RunningWorkout;
    sunday?: RunningWorkout;
  }
}

export interface TechniqueDetail {
  title: string;
  description: string;
  properties?: Record<string, string>; 
}

export interface TrainingTechnique {
  id: string;
  name: string;
  description: string;
  details: TechniqueDetail[];
}
