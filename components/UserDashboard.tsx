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
        // Check if Notification API is available to avoid "Can't find variable: Notification"
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

      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-zinc-900 border-t border-zinc-800 flex justify-around items-center">
        <NavButton icon="house" label="Início" active={activeView === 'main'} onClick={() => setActiveView('main')} />
        <NavButton icon="ruler" label="Avaliações" active={activeView === 'assessments'} onClick={() => setActiveView('assessments')} />
        <NavButton icon="user" label="Perfil" active={false} onClick={() => {}} />
      </nav>
    </div>
  );
}
const NavButton = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-emerald-400' : 'text-zinc-500 hover:text-white'}`}>
        <i className={`ph ${active ? 'ph-fill' : 'ph'} ph-${icon} text-2xl`}></i>
        <span className="text-xs font-medium">{label}</span>
    </button>
);

const AssessmentsView = ({ assessments, onClose }: { assessments: AssessmentEntry[], onClose: () => void }) => {
    const [selected, setSelected] = useState<AssessmentEntry | null>(null);

    if (selected) {
        return (
            <div className="animate-fade-in">
                 <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 mb-4"><i className="ph ph-arrow-left"></i> Voltar</button>
                 <h2 className="text-xl font-bold mb-4">Avaliação de {new Date(selected.date).toLocaleDateString('pt-BR')}</h2>
                 <div className="space-y-4">
                     {selected.anthropometry && <DataCard title="Antropometria" data={{'Peso': `${selected.anthropometry.weight} kg`, 'Altura': `${selected.anthropometry.height} m`, 'IMC': selected.anthropometry.bmi}} />}
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
)


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

const ExerciseTimer = ({ seconds }: { seconds: number }) => {
    const [timeLeft, setTimeLeft] = useState(seconds);
    const [isActive, setIsActive] = useState(false);
    
    useEffect(() => {
        let interval: any = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (timeLeft === 0) {
            setTimeLeft(seconds);
            setIsActive(false);
        } else {
            setIsActive(!isActive);
        }
    };

    const isFinished = timeLeft === 0;

    return (
        <button 
            onClick={toggle}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isFinished 
                ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                : isActive 
                    ? 'bg-emerald-500 text-black animate-pulse' 
                    : 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
            }`}
        >
            <i className={`ph-fill ${isFinished ? 'ph-alarm' : 'ph-timer'}`}></i>
            {isFinished ? 'Fim!' : `${timeLeft}s`}
        </button>
    );
}

const WorkoutSession = ({ userUid, workout, onClose }: { userUid: string, workout: Workout, onClose: () => void }) => {
   const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
   const [startTime] = useState(Date.now());
   const [elapsedTime, setElapsedTime] = useState('00:00:00');
   const [logModalOpen, setLogModalOpen] = useState(false);
   
   useEffect(() => {
     const timer = setInterval(() => setElapsedTime(new Date(Math.floor((Date.now() - startTime) / 1000) * 1000).toISOString().substr(11, 8)), 1000);
     return () => clearInterval(timer);
   }, [startTime]);

   const handleFinishWorkout = async (rpe: number, comment: string) => {
      try { await addDoc(collection(db, 'users', userUid, 'history'), { date: new Date().toISOString(), workoutName: workout.id, duration: elapsedTime, rpe, comment }); onClose(); }
      catch (e) { console.error(e); alert("Erro ao salvar treino."); }
   };

   return (
    <div className="animate-fade-in">
      {logModalOpen && <LogWorkoutModal onClose={() => setLogModalOpen(false)} onSave={handleFinishWorkout} duration={elapsedTime} />}
      <div className="flex justify-between items-center mb-4"><div><h2 className="text-xl font-bold">{workout.id}</h2><div className="font-mono text-emerald-400">{elapsedTime}</div></div><button onClick={onClose} className="text-zinc-400 hover:text-white"><i className="ph ph-x text-2xl"></i></button></div>
      <div className="space-y-3 pb-24">
        {workout.items.map(item => item.type === 'header' ? (
            <h3 key={item.id} className="font-bold text-lg text-emerald-400 pt-4 pb-1 border-b border-zinc-800">{item.label}</h3> 
        ) : (
            <div key={item.id} className={`p-4 rounded-xl transition-all ${checkedItems[item.id] ? 'bg-emerald-900/50 border-emerald-800' : 'bg-zinc-900 border-zinc-800'} border`}>
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <div className={`font-bold ${checkedItems[item.id] ? 'line-through text-zinc-400' : ''}`}>{item.exercise}</div>
                        <div className={`text-2xl font-bold ${checkedItems[item.id] ? 'text-emerald-600' : 'text-emerald-400'}`}>{item.displayString}</div>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                            {item.notes && <div className="text-xs text-zinc-400 flex items-center bg-zinc-800 px-2 py-1 rounded"><i className="ph ph-info mr-1"></i>{item.notes}</div>}
                            {item.timerValue && <ExerciseTimer seconds={item.timerValue} />}
                        </div>
                    </div>
                    <input type="checkbox" checked={!!checkedItems[item.id]} onChange={() => setCheckedItems(p => ({...p, [item.id]:!p[item.id]}))} className="w-6 h-6 rounded-md bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-emerald-600 shrink-0 mt-1" />
                </div>
            </div>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/80 backdrop-blur border-t border-zinc-800"><button onClick={() => setLogModalOpen(true)} className="w-full bg-emerald-500 text-black font-bold py-4 rounded-xl">Finalizar Treino</button></div>
    </div>
   );
};

const RunningPlanView = ({ userUid, plan, onClose }: { userUid: string, plan: RunningPlan, onClose: () => void }) => {
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
    const [logModalOpen, setLogModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<{ week: string, day: string, workout: string } | null>(null);

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
    const daysOfWeek: (keyof RunningWeek['days'])[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayLabels: { [key: string]: string } = { monday: 'Segunda', tuesday: 'Terça', wednesday: 'Quarta', thursday: 'Quinta', friday: 'Sexta', saturday: 'Sábado', sunday: 'Domingo' };

    return (
        <div className="animate-fade-in pb-20">
             {logModalOpen && <LogRunModal onSave={handleLogRun} onClose={() => setLogModalOpen(false)} logData={selectedLog} />}
             <div className="flex justify-between items-center mb-4"><div><h2 className="text-xl font-bold">{plan.name}</h2><p className="text-zinc-400">{currentWeek.weekLabel}</p></div><button onClick={onClose} className="text-zinc-400 hover:text-white"><i className="ph ph-x text-2xl"></i></button></div>
            <div className="flex justify-between items-center my-4"><button disabled={currentWeekIndex === 0} onClick={() => setCurrentWeekIndex(i => i - 1)} className="bg-zinc-800 p-2 rounded-lg disabled:opacity-50">&lt; Ant</button><span className="font-bold">{currentWeekIndex + 1} / {plan.weeks.length}</span><button disabled={currentWeekIndex === plan.weeks.length - 1} onClick={() => setCurrentWeekIndex(i => i + 1)} className="bg-zinc-800 p-2 rounded-lg disabled:opacity-50">Próx &gt;</button></div>
            <div className="space-y-4">
                {daysOfWeek.map(day => { 
                    const workout = currentWeek.days[day];
                    if (!workout) return null;

                    const isStructured = typeof workout !== 'string';
                    const title = isStructured ? (workout as RunningWorkoutData).type : workout as string;
                    
                    return (
                        <div key={day} className={`p-4 rounded-xl bg-zinc-900 border border-zinc-800`}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="text-sm font-bold text-zinc-400">{dayLabels[day]}</div>
                                    <div className="text-lg font-bold text-white">{title}</div>
                                </div>
                                <button onClick={() => handleOpenLogModal(currentWeek.weekLabel, dayLabels[day], workout)} className="bg-emerald-500/10 text-emerald-400 text-xs font-bold py-1 px-3 rounded-full">Registrar</button>
                            </div>
                            
                            {isStructured && (
                                <div className="space-y-2 mt-3 text-sm">
                                    <div className="grid grid-cols-[20px_1fr] gap-2">
                                        <i className="ph-fill ph-fire text-blue-400 mt-0.5"></i>
                                        <span className="text-zinc-300">{(workout as RunningWorkoutData).warmup || '-'}</span>
                                    </div>
                                    <div className="grid grid-cols-[20px_1fr] gap-2">
                                        <i className="ph-fill ph-person-simple-run text-emerald-500 mt-0.5"></i>
                                        <span className="text-white font-medium">{(workout as RunningWorkoutData).main}</span>
                                    </div>
                                    <div className="grid grid-cols-[20px_1fr] gap-2">
                                        <i className="ph-fill ph-snowflake text-orange-400 mt-0.5"></i>
                                        <span className="text-zinc-300">{(workout as RunningWorkoutData).cooldown || '-'}</span>
                                    </div>
                                    {(workout as RunningWorkoutData).zone && (
                                        <div className="mt-2 inline-block bg-zinc-800 px-2 py-1 rounded text-xs text-zinc-400 font-mono">
                                            Alvo: {(workout as RunningWorkoutData).zone}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ); 
                })}
                {!Object.values(currentWeek.days).some(d => !!d) && <div className="text-center text-zinc-500 py-10">Descanso total nesta semana!</div>}
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