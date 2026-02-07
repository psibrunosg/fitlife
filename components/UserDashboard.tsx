import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Workout, WorkoutHistoryEntry, WorkoutItem, RunningPlan, RunningWeek, RunningWorkout, WorkoutExercise, AssessmentEntry, RunningWorkoutData
} from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  db, addDoc, collection, onSnapshot, doc, updateDoc, query, orderBy, getDocs
} from '../firebase';
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from '../firebase';
import AnamnesisForm from './AnamnesisForm';

interface UserDashProps {
  user: User;
  onLogout: () => void;
}

// --- HELPER COMPONENTS ---

const NavButton = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-emerald-400' : 'text-zinc-500 hover:text-white'}`}>
        <i className={`ph ${active ? 'ph-fill' : 'ph'} ph-${icon} text-2xl`}></i>
        <span className="text-xs font-medium">{label}</span>
    </button>
);

const DataCard = ({title, data}: {title: string, data: any}) => (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <h3 className="font-bold text-emerald-400 mb-2">{title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
            {Object.entries(data).map(([key, value]) => (
                <div key={key}>
                    <span className="text-zinc-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                    <span className="font-semibold text-white">{String(value)}</span>
                </div>
            ))}
        </div>
    </div>
);

// --- MODALS ---

const LogWorkoutModal = ({ onSave, onClose, duration }: { onSave: (rpe: number, comment: string) => void, onClose: () => void, duration: string }) => {
  const [rpe, setRpe] = useState(5);
  const [comment, setComment] = useState('');
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-1">Registrar Treino</h2>
        <p className="text-zinc-400 text-sm mb-4">Duração total: <span className="font-bold text-emerald-400">{duration}</span></p>
        <div className="space-y-4">
            <div><label className="block text-xs font-medium text-zinc-400 mb-1">Percepção de Esforço (RPE 1-10)</label><input type="range" min="1" max="10" value={rpe} onChange={e => setRpe(Number(e.target.value))} className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"/><div className="text-center font-bold text-emerald-400 mt-1">{rpe}</div></div>
            <div><label className="block text-xs font-medium text-zinc-400 mb-1">Comentários (opcional)</label><textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm" /></div>
            <div className="flex gap-2"><button onClick={onClose} className="flex-1 bg-zinc-700 hover:bg-zinc-600 font-bold py-3 rounded-lg">Cancelar</button><button onClick={() => onSave(rpe, comment)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-3 rounded-lg">Salvar</button></div>
        </div>
      </div>
    </div>
  );
};

const LogRunModal = ({ onSave, onClose, logData }: { onSave: (rpe: number, comment: string, duration: string) => void, onClose: () => void, logData: any }) => {
  const [rpe, setRpe] = useState(5);
  const [comment, setComment] = useState('');
  const [duration, setDuration] = useState('');
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-1">Registrar Corrida</h2>
        <p className="text-zinc-400 text-sm mb-4">{logData.day}: <span className="text-white">{logData.workout}</span></p>
        <div className="space-y-4">
            <div><label className="block text-xs font-medium text-zinc-400 mb-1">Duração (HH:MM:SS)</label><input type="text" value={duration} onChange={e => setDuration(e.target.value)} placeholder="00:45:30" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm" /></div>
            <div><label className="block text-xs font-medium text-zinc-400 mb-1">Percepção de Esforço (RPE 1-10)</label><input type="range" min="1" max="10" value={rpe} onChange={e => setRpe(Number(e.target.value))} className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"/><div className="text-center font-bold text-emerald-400 mt-1">{rpe}</div></div>
            <div><label className="block text-xs font-medium text-zinc-400 mb-1">Comentários (opcional)</label><textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm" /></div>
            <div className="flex gap-2"><button onClick={onClose} className="flex-1 bg-zinc-700 hover:bg-zinc-600 font-bold py-3 rounded-lg">Cancelar</button><button onClick={() => onSave(rpe, comment, duration)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-3 rounded-lg">Salvar</button></div>
        </div>
      </div>
    </div>
  );
};

// --- WORKOUT SESSION COMPONENTS ---

type SetData = {
    weight: string;
    completed: boolean;
};

type SessionData = Record<string, SetData[]>;

const RestTimerOverlay = ({ 
    isActive, 
    duration, 
    onAdd, 
    onSkip, 
    onComplete 
}: { 
    isActive: boolean, 
    duration: number, 
    onAdd: (seconds: number) => void, 
    onSkip: () => void,
    onComplete: () => void 
}) => {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        setTimeLeft(duration);
    }, [duration, isActive]);

    useEffect(() => {
        let interval: any;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        onComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, onComplete]);

    if (!isActive) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-zinc-900 to-zinc-900/95 backdrop-blur-lg border-t border-emerald-500/30 p-6 pb-8 z-[60] shadow-[0_-5px_20px_rgba(0,0,0,0.5)] animate-slide-up">
            <div className="max-w-md mx-auto flex flex-col items-center">
                <div className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-2">Descanso</div>
                <div className="text-5xl font-mono font-bold text-white mb-6 tabular-nums tracking-tighter">
                    {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{Math.floor(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                
                <div className="flex gap-3 w-full">
                    <button onClick={() => onAdd(15)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-bold text-sm transition-colors border border-zinc-700">+15s</button>
                    <button onClick={() => onAdd(30)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-bold text-sm transition-colors border border-zinc-700">+30s</button>
                    <button onClick={onSkip} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-black py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-900/20">Pular</button>
                </div>
            </div>
        </div>
    );
};

interface ExerciseSetTrackerProps {
  item: WorkoutExercise;
  sessionData: SessionData;
  onUpdateSet: (exerciseId: string, setIndex: number, data: Partial<SetData>) => void;
}

const ExerciseSetTracker: React.FC<ExerciseSetTrackerProps> = ({ 
    item, 
    sessionData, 
    onUpdateSet 
}) => {
    // Determine number of sets from displayString (e.g., "4 x 10")
    const numSets = parseInt(item.displayString.split('x')[0]) || 3;
    const sets = sessionData[item.id] || Array(numSets).fill({ weight: '', completed: false });

    // Progress bar calculation
    const completedCount = sets.filter(s => s.completed).length;
    const progressPercent = (completedCount / numSets) * 100;

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-4 shadow-lg">
            {/* Header with Image and Title */}
            <div className="flex p-4 gap-4 bg-zinc-950/30">
                {item.img ? (
                    <img src={item.img} className="w-20 h-20 rounded-lg object-cover bg-black border border-zinc-800" alt={item.exercise} />
                ) : (
                    <div className="w-20 h-20 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-600">
                        <i className="ph-fill ph-barbell text-3xl"></i>
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="text-xs text-emerald-500 font-bold uppercase tracking-wider mb-1">{item.target}</div>
                    <h3 className="font-bold text-lg leading-tight text-white mb-1 truncate">{item.exercise}</h3>
                    <div className="text-zinc-400 text-sm">{item.displayString}</div>
                    {item.notes && <div className="text-xs text-zinc-500 mt-1 italic line-clamp-2">{item.notes}</div>}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 w-full bg-zinc-800">
                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
            </div>

            {/* Sets Inputs */}
            <div className="p-4 space-y-2">
                <div className="flex text-xs text-zinc-500 font-medium px-2 mb-1">
                    <div className="w-10 text-center">Série</div>
                    <div className="flex-1 text-center">Carga (kg)</div>
                    <div className="w-16 text-center">Status</div>
                </div>
                {sets.map((set, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${set.completed ? 'bg-emerald-900/10 border border-emerald-500/20' : 'bg-zinc-950 border border-zinc-800'}`}>
                        <div className="w-10 text-center font-bold text-zinc-400">{idx + 1}</div>
                        <input 
                            type="number" 
                            placeholder="kg" 
                            value={set.weight}
                            onChange={(e) => onUpdateSet(item.id, idx, { weight: e.target.value })}
                            className={`flex-1 bg-transparent text-center font-bold outline-none ${set.completed ? 'text-emerald-400' : 'text-white'}`}
                            disabled={set.completed}
                        />
                        <button 
                            onClick={() => onUpdateSet(item.id, idx, { completed: !set.completed })}
                            className={`w-16 h-8 rounded-md flex items-center justify-center transition-all ${
                                set.completed 
                                ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                                : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                            }`}
                        >
                            {set.completed ? <i className="ph-fill ph-check-circle text-xl"></i> : <i className="ph ph-circle text-xl"></i>}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const WorkoutSession = ({ userUid, workout, onClose }: { userUid: string, workout: Workout, onClose: () => void }) => {
   const [sessionData, setSessionData] = useState<SessionData>({});
   const [startTime] = useState(Date.now());
   const [elapsedTime, setElapsedTime] = useState('00:00:00');
   const [logModalOpen, setLogModalOpen] = useState(false);
   
   // Timer State
   const [restTimer, setRestTimer] = useState<{ active: boolean, duration: number }>({ active: false, duration: 60 });

   // Initialize session data based on workout items
   useEffect(() => {
       const initialData: SessionData = {};
       workout.items.forEach(item => {
           if (item.type === 'exercise') {
               const numSets = parseInt(item.displayString.split('x')[0]) || 3;
               initialData[item.id] = Array(numSets).fill({ weight: '', completed: false });
           }
       });
       setSessionData(initialData);
   }, [workout]);

   useEffect(() => {
     const timer = setInterval(() => setElapsedTime(new Date(Math.floor((Date.now() - startTime) / 1000) * 1000).toISOString().substr(11, 8)), 1000);
     return () => clearInterval(timer);
   }, [startTime]);

   const handleUpdateSet = (exerciseId: string, setIndex: number, data: Partial<SetData>) => {
       setSessionData(prev => {
           const currentSets = [...(prev[exerciseId] || [])];
           const wasCompleted = currentSets[setIndex].completed;
           
           currentSets[setIndex] = { ...currentSets[setIndex], ...data };
           
           // Trigger Timer if completing a set (and it wasn't already completed)
           if (data.completed === true && !wasCompleted) {
               const exercise = workout.items.find(i => i.id === exerciseId) as WorkoutExercise;
               const timerValue = exercise?.timerValue || 60;
               setRestTimer({ active: true, duration: timerValue });
           }

           return { ...prev, [exerciseId]: currentSets };
       });
   };

   const handleFinishWorkout = async (rpe: number, comment: string) => {
      // Build a detailed summary of loads used
      let detailedLog = `${comment}\n\nResumo de Cargas:\n`;
      workout.items.forEach(item => {
          if (item.type === 'exercise' && sessionData[item.id]) {
              const sets = sessionData[item.id];
              const loads = sets.map((s, i) => s.weight ? `S${i+1}:${s.weight}kg` : null).filter(Boolean).join(', ');
              if (loads) detailedLog += `- ${item.exercise}: [${loads}]\n`;
          }
      });

      try { 
          await addDoc(collection(db, 'users', userUid, 'history'), { 
              date: new Date().toISOString(), 
              workoutName: workout.id, 
              duration: elapsedTime, 
              rpe, 
              comment: detailedLog 
          }); 
          onClose(); 
      }
      catch (e) { console.error(e); alert("Erro ao salvar treino."); }
   };

   return (
    <div className="animate-fade-in relative">
      {logModalOpen && <LogWorkoutModal onClose={() => setLogModalOpen(false)} onSave={handleFinishWorkout} duration={elapsedTime} />}
      
      <div className="sticky top-16 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 pb-4 pt-2 mb-4 px-1">
          <div className="flex justify-between items-center">
              <div>
                  <h2 className="text-xl font-bold text-white">{workout.id}</h2>
                  <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm">
                      <i className="ph-fill ph-timer"></i>
                      {elapsedTime}
                  </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <i className="ph ph-x text-xl"></i>
              </button>
          </div>
      </div>

      <div className="space-y-6 pb-32 px-1">
        {workout.items.map(item => item.type === 'header' ? (
            <div key={item.id} className="relative py-4">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-zinc-950 px-4 text-sm font-bold text-emerald-500 uppercase tracking-widest">{item.label}</span>
                </div>
            </div>
        ) : (
            <ExerciseSetTracker 
                key={item.id} 
                item={item as WorkoutExercise} 
                sessionData={sessionData} 
                onUpdateSet={handleUpdateSet} 
            />
        ))}
      </div>

      {/* Floating Action Button for Finish */}
      <div className="fixed bottom-20 right-4 z-40">
          <button 
            onClick={() => setLogModalOpen(true)} 
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-6 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2 transition-transform active:scale-95"
          >
              <i className="ph-fill ph-check-circle text-xl"></i>
              Finalizar
          </button>
      </div>

      {/* Rest Timer Overlay */}
      <RestTimerOverlay 
          isActive={restTimer.active} 
          duration={restTimer.duration}
          onAdd={(seconds) => setRestTimer(prev => ({ ...prev, duration: prev.duration + seconds }))}
          onSkip={() => setRestTimer(prev => ({ ...prev, active: false }))}
          onComplete={() => setRestTimer(prev => ({ ...prev, active: false }))}
      />
    </div>
   );
};

// --- RUNNING PLAN COMPONENTS ---

const RunningPlanView = ({ userUid, plan, onClose }: { userUid: string, plan: RunningPlan, onClose: () => void }) => {
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
    const [logModalOpen, setLogModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<{ week: string, day: string, workout: string } | null>(null);
    
    // Day Selection State
    const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayIndex = new Date().getDay(); // 0 is Sunday
    const [selectedDayKey, setSelectedDayKey] = useState(daysMap[todayIndex]);

    const handleOpenLogModal = (weekLabel: string, day: string, workout: RunningWorkout) => { 
        const workoutName = typeof workout === 'string' ? workout : workout.type;
        setSelectedLog({ week: weekLabel, day, workout: workoutName || 'Corrida Livre' }); 
        setLogModalOpen(true); 
    };
    
    const handleLogRun = async (rpe: number, comment: string, duration: string) => {
        if (!selectedLog) return;
        try { await addDoc(collection(db, 'users', userUid, 'history'), { date: new Date().toISOString(), workoutName: `Corrida: ${selectedLog.day}`, duration, rpe, comment }); setLogModalOpen(false); setSelectedLog(null); }
        catch (e) { console.error(e); alert("Erro ao salvar corrida."); }
    }

    const currentWeek = plan.weeks[currentWeekIndex];
    const dayLabels: { [key: string]: string } = { monday: 'Segunda', tuesday: 'Terça', wednesday: 'Quarta', thursday: 'Quinta', friday: 'Sexta', saturday: 'Sábado', sunday: 'Domingo' };
    const dayShortLabels: { [key: string]: string } = { monday: 'SEG', tuesday: 'TER', wednesday: 'QUA', thursday: 'QUI', friday: 'SEX', saturday: 'SAB', sunday: 'DOM' };

    const activeWorkout = currentWeek.days[selectedDayKey as keyof typeof currentWeek.days];

    return (
        <div className="animate-fade-in pb-20">
             {logModalOpen && <LogRunModal onSave={handleLogRun} onClose={() => setLogModalOpen(false)} logData={selectedLog} />}
             
             {/* Header */}
             <div className="flex justify-between items-center mb-6 sticky top-16 bg-zinc-950 z-20 pt-2 pb-2 border-b border-zinc-800">
                 <div>
                     <h2 className="text-xl font-bold">{plan.name}</h2>
                     <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <button disabled={currentWeekIndex === 0} onClick={() => setCurrentWeekIndex(i => i - 1)} className="hover:text-white disabled:opacity-30"><i className="ph ph-caret-left"></i></button>
                        <span>{currentWeek.weekLabel}</span>
                        <button disabled={currentWeekIndex === plan.weeks.length - 1} onClick={() => setCurrentWeekIndex(i => i + 1)} className="hover:text-white disabled:opacity-30"><i className="ph ph-caret-right"></i></button>
                     </div>
                 </div>
                 <button onClick={onClose} className="text-zinc-400 hover:text-white bg-zinc-900 w-10 h-10 rounded-full flex items-center justify-center border border-zinc-800"><i className="ph ph-x text-xl"></i></button>
             </div>

            {/* Day Selector */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
                {daysMap.map((key, index) => {
                    const isToday = index === todayIndex;
                    const isActive = key === selectedDayKey;
                    const hasWorkout = !!currentWeek.days[key as keyof typeof currentWeek.days];
                    
                    return (
                        <button 
                            key={key} 
                            onClick={() => setSelectedDayKey(key)}
                            className={`flex flex-col items-center justify-center min-w-[3.5rem] h-14 rounded-xl border transition-all ${isActive ? 'bg-emerald-500 text-black border-emerald-500 font-bold' : 'bg-zinc-900 text-zinc-500 border-zinc-800'} ${hasWorkout && !isActive ? 'border-zinc-600 text-zinc-300' : ''}`}
                        >
                            <span className="text-[10px] uppercase">{dayShortLabels[key]}</span>
                            {hasWorkout && <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isActive ? 'bg-black' : 'bg-emerald-500'}`}></div>}
                        </button>
                    )
                })}
            </div>

            {/* Content Area */}
            <div className="min-h-[300px]">
                {activeWorkout ? (
                    <RunningChecklistCard 
                        dayLabel={dayLabels[selectedDayKey]} 
                        workout={activeWorkout} 
                        onLog={() => handleOpenLogModal(currentWeek.weekLabel, dayLabels[selectedDayKey], activeWorkout)} 
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-zinc-500 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
                        <i className="ph ph-coffee text-4xl mb-3"></i>
                        <p className="text-lg font-medium">Dia de Descanso</p>
                        <p className="text-sm">Aproveite para recuperar as energias.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// New Component: Parses running workout text into a checklist
const RunningChecklistCard = ({ dayLabel, workout, onLog }: { dayLabel: string, workout: RunningWorkout, onLog: () => void }) => {
    const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
    const [tasks, setTasks] = useState<string[]>([]);
    
    // Parse workout into tasks
    useEffect(() => {
        let textToParse = '';
        if (typeof workout === 'string') {
            textToParse = workout;
        } else {
            // Structured workout: Create a combined string or parse fields individually
            const parts = [];
            if (workout.warmup) parts.push(`Aquecimento: ${workout.warmup}`);
            if (workout.main) parts.push(`Principal: ${workout.main}`);
            if (workout.cooldown) parts.push(`Desaquecimento: ${workout.cooldown}`);
            textToParse = parts.join(' + ');
        }

        // Split logic: splits by +, /, or " e " surrounded by spaces, or new lines
        // Regex looks for: 
        // 1. Newline (\n)
        // 2. The char '+' or '/'
        // 3. The word ' e ' surrounded by spaces (case insensitive)
        const splitRegex = /\n|[+\/]|(?:\s+e\s+)/i;
        
        const rawTasks = textToParse.split(splitRegex)
            .map(t => t.trim())
            .filter(t => t.length > 0);
            
        setTasks(rawTasks);
        setCheckedItems(new Array(rawTasks.length).fill(false));
    }, [workout]);

    const toggleTask = (index: number) => {
        const newChecked = [...checkedItems];
        newChecked[index] = !newChecked[index];
        setCheckedItems(newChecked);
    };

    const isStructured = typeof workout !== 'string';
    const title = isStructured ? (workout as RunningWorkoutData).type : 'Treino do Dia';
    const progress = Math.round((checkedItems.filter(Boolean).length / tasks.length) * 100) || 0;

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg animate-slide-up">
            <div className="p-6 pb-4 bg-gradient-to-br from-zinc-800 to-zinc-900 border-b border-zinc-700">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-1">{dayLabel}</div>
                        <h3 className="text-2xl font-bold text-white leading-tight">{title}</h3>
                        {isStructured && (workout as RunningWorkoutData).zone && (
                            <span className="inline-block mt-2 text-xs font-mono bg-black/40 text-zinc-300 px-2 py-1 rounded">
                                Zona Alvo: <span className="text-emerald-400 font-bold">{(workout as RunningWorkoutData).zone}</span>
                            </span>
                        )}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <i className="ph-fill ph-person-simple-run text-2xl"></i>
                    </div>
                </div>
            </div>
            
            <div className="p-2 bg-zinc-950">
                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <div className="p-4 space-y-3">
                {tasks.map((task, idx) => (
                    <button 
                        key={idx}
                        onClick={() => toggleTask(idx)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${checkedItems[idx] ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}
                    >
                        <div className={`mt-0.5 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${checkedItems[idx] ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-600 text-transparent'}`}>
                            <i className="ph-bold ph-check text-sm"></i>
                        </div>
                        <span className={`text-sm leading-relaxed ${checkedItems[idx] ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                            {task}
                        </span>
                    </button>
                ))}
            </div>

            <div className="p-4 pt-2">
                <button 
                    onClick={onLog} 
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                    <i className="ph-bold ph-check-circle text-xl"></i>
                    Concluir Treino
                </button>
            </div>
        </div>
    );
};


// --- VIEW COMPONENTS ---

const AssessmentsView = ({ assessments, onClose }: { assessments: AssessmentEntry[], onClose: () => void }) => {
    const [selected, setSelected] = useState<AssessmentEntry | null>(null);

    if (selected) {
        return (
            <div className="animate-fade-in">
                 <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 mb-4"><i className="ph ph-arrow-left"></i> Voltar</button>
                 <h2 className="text-xl font-bold mb-4">Avaliação de {new Date(selected.date).toLocaleDateString('pt-BR')}</h2>
                 <div className="space-y-4">
                     {selected.anthropometry && <DataCard title="Antropometria" data={{'Peso': `${selected.anthropometry.weight} kg`, 'Altura': `${selected.anthropometry.height} m`, 'IMC': selected.anthropometry.bmi?.toFixed(2)}} />}
                     {selected.perimetry && <DataCard title="Perímetros (cm)" data={selected.perimetry} />}
                     {selected.skinfolds && <DataCard title="Dobras Cutâneas (mm)" data={selected.skinfolds} />}
                 </div>
            </div>
        );
    }
    
    return (
        <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Suas Avaliações</h2>
            {assessments.length === 0 && <p className="text-zinc-500">Nenhuma avaliação física registrada.</p>}
            <div className="space-y-3">
                {assessments.map(a => (
                    <button key={a.id} onClick={() => setSelected(a)} className="w-full text-left bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center hover:border-emerald-500">
                        <span className="font-bold">Avaliação de {new Date(a.date).toLocaleDateString('pt-BR')}</span>
                        <i className="ph ph-caret-right"></i>
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- MAIN DASHBOARD EXPORT ---

export default function UserDashboard({ user, onLogout }: UserDashProps) {
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [showAnamnesis, setShowAnamnesis] = useState(!user.hasCompletedAnamnesis);

  if (showAnamnesis) {
    return <AnamnesisForm user={currentUser} onComplete={() => {
        setShowAnamnesis(false);
        setCurrentUser(prev => ({...prev, hasCompletedAnamnesis: true}));
    }} />;
  }
  
  return <Dashboard Shelluser={currentUser} onLogout={onLogout} />;
}

const Dashboard = ({ Shelluser, onLogout }: { Shelluser: User, onLogout: () => void }) => {
  const [user, setUser] = useState<User>(Shelluser);
  const [activeView, setActiveView] = useState<'main' | 'workout' | 'plan' | 'assessments'>('main');

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [runningPlans, setRunningPlans] = useState<RunningPlan[]>([]);
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [assessments, setAssessments] = useState<AssessmentEntry[]>([]);
  
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [activePlan, setActivePlan] = useState<RunningPlan | null>(null);
  const [notification, setNotification] = useState<{title: string, body: string} | null>(null);
  
  useEffect(() => {
    if (!user.uid) return;
    
    const unsubDoc = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists) setUser({ uid: doc.id, ...doc.data() } as User);
    }, (error) => console.error("Error fetching user document:", error));
    
    const unsubWorkouts = onSnapshot(collection(db, "users", user.uid, "workouts"), (s) => setWorkouts(s.docs.map(d => ({ id: d.id, ...d.data() } as Workout))), (error) => console.error("Error fetching workouts:", error));
    
    const unsubPlans = onSnapshot(collection(db, "users", user.uid, "runningPlans"), (s) => setRunningPlans(s.docs.map(d => ({ id: d.id, ...d.data() } as RunningPlan))), (error) => console.error("Error fetching running plans:", error));
    
    const unsubHistory = onSnapshot(query(collection(db, "users", user.uid, "history"), orderBy("date", "desc")), (s) => setHistory(s.docs.map(d => ({ id: d.id, ...d.data() } as WorkoutHistoryEntry))), (error) => console.error("Error fetching history:", error));
    
    const unsubAssessments = onSnapshot(query(collection(db, "users", user.uid, "assessments"), orderBy("date", "desc")), (s) => setAssessments(s.docs.map(d => ({ id: d.id, ...d.data() } as AssessmentEntry))), (error) => console.error("Error fetching assessments:", error));
    
    return () => { unsubDoc(); unsubWorkouts(); unsubPlans(); unsubHistory(); unsubAssessments(); };
  }, [user.uid]);

  useEffect(() => {
    if (!messaging) return;
    const requestPermission = async () => {
      try {
        if (!('Notification' in window)) {
            console.log("Desktop notifications not supported in this browser/environment");
            return;
        }
        
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messaging).catch(() => null);
          if (token) await updateDoc(doc(db, "users", user.uid), { fcmToken: token });
        }
      } catch (error) { console.error("Error with notifications", error); }
    };
    requestPermission();
    
    const unsubscribe = onMessage(messaging, (payload) => {
      if (payload.notification) {
        setNotification({
          title: payload.notification.title || 'Nova Mensagem',
          body: payload.notification.body || ''
        });
        setTimeout(() => setNotification(null), 5000);
      }
    });
    return () => unsubscribe();
  }, [user.uid]);

  const chartData = [...history]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7)
    .map(item => {
       const durationVal = item.duration?.includes(':') ? item.duration.split(':').map(Number).reduce((acc, time) => (60 * acc) + time, 0) / 60 : parseFloat(item.duration) || 0;
       return {
          date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          rpe: Number(item.rpe) || 0,
          duration: parseFloat(durationVal.toFixed(1)),
       };
    });

  const renderContent = () => {
    if (activeView === 'workout' && activeWorkout) return <WorkoutSession userUid={user.uid} workout={activeWorkout} onClose={() => setActiveView('main')} />;
    if (activeView === 'plan' && activePlan) return <RunningPlanView userUid={user.uid} plan={activePlan} onClose={() => setActiveView('main')} />;
    if (activeView === 'assessments') return <AssessmentsView assessments={assessments} onClose={() => setActiveView('main')} />;

    return (
        <>
          <div className="mb-6">
            <h1 className="text-xl font-bold">Olá, <span className="text-emerald-400">{user.name?.split(" ")[0] || user.email}</span>!</h1>
            <p className="text-zinc-500 text-sm">Selecione sua atividade de hoje.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {workouts.map(w => <button key={w.id} onClick={() => { setActiveWorkout(w); setActiveView('workout'); }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors"><i className="ph ph-barbell text-2xl text-emerald-400"></i><div className="font-semibold text-white mt-2">{w.id}</div><div className="text-xs text-zinc-500">{w.items.filter(i => i.type === 'exercise').length} Exercícios</div></button>)}
            {runningPlans.map(p => <button key={p.id} onClick={() => { setActivePlan(p); setActiveView('plan'); }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors"><i className="ph ph-person-simple-run text-2xl text-emerald-400"></i><div className="font-semibold text-white mt-2">{p.name}</div><div className="text-xs text-zinc-500">{p.weeks.length} Semanas</div></button>)}
            {workouts.length === 0 && runningPlans.length === 0 && <div className="col-span-2 text-center text-zinc-500 py-10">Nenhum treino disponível.</div>}
          </div>
          {chartData.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold">Sua Evolução Recente</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#27272a" /><XAxis dataKey="date" stroke="#71717a" fontSize={10} /><YAxis stroke="#71717a" fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} /><Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }}/><Area type="monotone" dataKey="rpe" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="RPE" /></AreaChart></ResponsiveContainer>
              </div>
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold">Histórico</h2>
            {history.slice(0, 5).map(item => <div key={item.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl my-2 flex justify-between items-center"><div><div className="font-semibold">{item.workoutName}</div><div className="text-xs text-zinc-500">{new Date(item.date).toLocaleDateString('pt-BR', {weekday: 'long', day: '2-digit', month: 'short'})}</div></div><div className="text-right"><div className="text-emerald-400">{item.duration}</div><div className="text-xs text-zinc-500">RPE {item.rpe}</div></div></div>)}
            {history.length === 0 && <p className="text-zinc-500 text-sm">Nenhum treino registrado.</p>}
          </div>
        </>
    );
  };
  
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <header className="fixed top-0 left-0 right-0 h-16 bg-zinc-900/80 backdrop-blur border-b border-zinc-800 flex items-center justify-between px-4 z-50">
        <div className="font-bold text-lg">Fit<span className="text-emerald-400">Life</span></div>
        <div className="flex items-center gap-3">
          <img src={user.avatar} className="w-8 h-8 rounded-full border border-emerald-500" alt="" />
          <button onClick={onLogout} className="text-zinc-400 hover:text-white"><i className="ph ph-sign-out text-xl"></i></button>
        </div>
      </header>

      <main className="flex-1 pt-20 p-4 pb-24">{renderContent()}</main>

      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-zinc-900 border-t border-zinc-800 flex justify-around items-center z-40">
        <NavButton icon="house" label="Início" active={activeView === 'main'} onClick={() => setActiveView('main')} />
        <NavButton icon="ruler" label="Avaliações" active={activeView === 'assessments'} onClick={() => setActiveView('assessments')} />
        <NavButton icon="user" label="Perfil" active={false} onClick={() => {}} />
      </nav>
    </div>
  );
}
