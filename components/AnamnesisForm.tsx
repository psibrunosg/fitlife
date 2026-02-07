import React, { useState } from 'react';
import { User, Anamnesis } from '../types';
import { db, addDoc, collection, doc, updateDoc } from '../firebase';

interface AnamnesisFormProps {
  user: User;
  onComplete: () => void;
}

const initialAnamnesisState: Anamnesis = {
  evaluationDate: new Date().toISOString().split('T')[0],
  profession: '',
  maritalStatus: '',
  goals: { hypertrophy: false, fatLoss: false, conditioning: false, qualityOfLife: false, rehabilitation: false },
  clinicalHistory: { cardiovascular: '', metabolic: '', respiratory: '', osteoarticular: '', medications: '', others: '' },
  lifestyle: { smoking: '', alcohol: '', physicalActivityLevel: '', sleepHours: '', stressLevel: '', hydration: '' }
};

export default function AnamnesisForm({ user, onComplete }: AnamnesisFormProps) {
  const [formData, setFormData] = useState<Anamnesis>(initialAnamnesisState);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (section: keyof Anamnesis, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as object),
        [field]: value,
      },
    }));
  };
  
  const handleDirectChange = (field: keyof Anamnesis, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'anamnesis'), formData);
      await updateDoc(doc(db, 'users', user.uid), { hasCompletedAnamnesis: true });
      onComplete();
    } catch (error) {
      console.error("Error saving anamnesis:", error);
      alert("Ocorreu um erro ao salvar suas informações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl h-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-2xl font-bold text-white">Questionário Inicial</h1>
          <p className="text-zinc-400 text-sm">Olá, {user.name}! Por favor, preencha este formulário para começarmos.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <FormFieldset legend="Informações Pessoais">
            <div className="grid md:grid-cols-2 gap-4">
              <FormInput label="Data da Avaliação" type="date" value={formData.evaluationDate} onChange={e => handleDirectChange('evaluationDate', e.target.value)} />
              <FormInput label="Profissão" value={formData.profession} onChange={e => handleDirectChange('profession', e.target.value)} />
              <FormInput label="Estado Civil" value={formData.maritalStatus} onChange={e => handleDirectChange('maritalStatus', e.target.value)} />
            </div>
          </FormFieldset>

          <FormFieldset legend="Seus Objetivos">
             <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <FormCheckbox label="Hipertrofia" checked={formData.goals.hypertrophy} onChange={e => handleInputChange('goals', 'hypertrophy', e.target.checked)} />
                <FormCheckbox label="Emagrecimento" checked={formData.goals.fatLoss} onChange={e => handleInputChange('goals', 'fatLoss', e.target.checked)} />
                <FormCheckbox label="Condicionamento" checked={formData.goals.conditioning} onChange={e => handleInputChange('goals', 'conditioning', e.target.checked)} />
                <FormCheckbox label="Qualidade de Vida" checked={formData.goals.qualityOfLife} onChange={e => handleInputChange('goals', 'qualityOfLife', e.target.checked)} />
                <FormCheckbox label="Reabilitação" checked={formData.goals.rehabilitation} onChange={e => handleInputChange('goals', 'rehabilitation', e.target.checked)} />
             </div>
          </FormFieldset>
          
          <FormFieldset legend="Histórico Clínico">
              <FormTextarea label="Problemas Cardiovasculares (Pessoal e Familiar)" value={formData.clinicalHistory.cardiovascular} onChange={e => handleInputChange('clinicalHistory', 'cardiovascular', e.target.value)} />
              <FormTextarea label="Problemas Metabólicos (Diabetes, Colesterol)" value={formData.clinicalHistory.metabolic} onChange={e => handleInputChange('clinicalHistory', 'metabolic', e.target.value)} />
              <FormTextarea label="Problemas Respiratórios" value={formData.clinicalHistory.respiratory} onChange={e => handleInputChange('clinicalHistory', 'respiratory', e.target.value)} />
              <FormTextarea label="Lesões ou Dores Osteoarticulares" value={formData.clinicalHistory.osteoarticular} onChange={e => handleInputChange('clinicalHistory', 'osteoarticular', e.target.value)} />
              <FormTextarea label="Medicamentos em Uso Contínuo" value={formData.clinicalHistory.medications} onChange={e => handleInputChange('clinicalHistory', 'medications', e.target.value)} />
              <FormTextarea label="Outras Condições (Labirintite, Alergias, etc.)" value={formData.clinicalHistory.others} onChange={e => handleInputChange('clinicalHistory', 'others', e.target.value)} />
          </FormFieldset>
          
          <FormFieldset legend="Estilo de Vida e Hábitos">
              <div className="grid md:grid-cols-2 gap-4">
                <FormSelect label="Tabagismo" value={formData.lifestyle.smoking} onChange={e => handleInputChange('lifestyle', 'smoking', e.target.value)}>
                    <option value="">Selecione...</option><option value="non-smoker">Não fumante</option><option value="ex-smoker">Ex-fumante</option><option value="smoker">Fumante</option>
                </FormSelect>
                <FormInput label="Consumo de Álcool (frequência)" value={formData.lifestyle.alcohol} onChange={e => handleInputChange('lifestyle', 'alcohol', e.target.value)} />
                <FormSelect label="Nível de Atividade Física" value={formData.lifestyle.physicalActivityLevel} onChange={e => handleInputChange('lifestyle', 'physicalActivityLevel', e.target.value)}>
                    <option value="">Selecione...</option><option value="sedentary">Sedentário</option><option value="moderately_active">Moderadamente Ativo</option><option value="active">Ativo</option>
                </FormSelect>
                <FormInput label="Horas de Sono por noite" value={formData.lifestyle.sleepHours} onChange={e => handleInputChange('lifestyle', 'sleepHours', e.target.value)} />
                <FormSelect label="Nível de Estresse" value={formData.lifestyle.stressLevel} onChange={e => handleInputChange('lifestyle', 'stressLevel', e.target.value)}>
                    <option value="">Selecione...</option><option value="low">Baixo</option><option value="medium">Médio</option><option value="high">Alto</option>
                </FormSelect>
                 <FormInput label="Consumo diário de água (litros)" value={formData.lifestyle.hydration} onChange={e => handleInputChange('lifestyle', 'hydration', e.target.value)} />
              </div>
          </FormFieldset>

        </form>
        <div className="p-6 border-t border-zinc-800">
           <button onClick={handleSubmit} disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-lg transition-all active:scale-95 disabled:opacity-50">
             {loading ? 'SALVANDO...' : 'SALVAR E CONTINUAR'}
           </button>
        </div>
      </div>
    </div>
  );
}

const FormFieldset: React.FC<{ legend: string; children: React.ReactNode }> = ({ legend, children }) => (
    <fieldset className="border border-zinc-800 p-4 rounded-lg">
      <legend className="px-2 text-sm font-medium text-emerald-400">{legend}</legend>
      <div className="space-y-4">{children}</div>
    </fieldset>
);
  
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
      <label className="block text-xs font-medium text-zinc-400 mb-1">{label}</label>
      <input {...props} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" />
    </div>
);

const FormTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
    <div>
      <label className="block text-xs font-medium text-zinc-400 mb-1">{label}</label>
      <textarea {...props} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm resize-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" />
    </div>
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, ...props }) => (
    <div>
      <label className="block text-xs font-medium text-zinc-400 mb-1">{label}</label>
      <select {...props} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none">
        {children}
      </select>
    </div>
);
  
const FormCheckbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800 border border-transparent has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-900/50 cursor-pointer">
      <input type="checkbox" {...props} className="w-4 h-4 rounded bg-zinc-700 border-zinc-600 text-emerald-500 focus:ring-emerald-600" />
      <span className="text-sm font-medium">{label}</span>
    </label>
);
