import React, { useState, useEffect } from 'react';
import { 
  db, collection, collectionGroup, getDocs, onSnapshot, doc, addDoc, setDoc, deleteDoc, updateDoc, query, where, orderBy 
} from '../firebase';
import { 
  User, WorkoutExercise, Assessment, AssessmentEntry, Template, WorkoutItem, BlockHeader, RunningPlan, 
  RunningWeek, Workout, Exercise, TrainingTechnique, RunningWorkout, RunningWorkoutData
} from '../types';
import { SEED_EXERCISES } from '../data/seedExercises';
import { SEED_TECHNIQUES } from '../data/seedTechniques';
import { SEED_RUNNING_PLANS, RUNNING_PROTOCOLS } from '../data/seedRunningPlans';
import { GoogleGenAI, Type } from "@google/genai";

interface AdminProps {
  user: User;
  onLogout: () => void;
}

type Tab = 'overview' | 'workouts' | 'running' | 'assessment' | 'manage' | 'techniques' | 'settings';

/* --- NEW PROTOCOLS --- */
const PROTOCOL_ABCD_HYPERTROPHY: Template = {
  id: "protocol_abcd_hypertrophy",
  name: "Protocolo ABCD (Hipertrofia Clássica)",
  exercises: [
    { type: 'header', id: 'h_a', label: 'Treino A (Peito e Costas)' },
    { type: 'exercise', id: 'p_abcd_1', exercise: 'Supino Reto com Barra', target: 'Peitoral', displayString: '4 x 8-12' },
    { type: 'exercise', id: 'p_abcd_2', exercise: 'Barra Fixa', target: 'Costas', displayString: '4 x Falha' },
    { type: 'exercise', id: 'p_abcd_3', exercise: 'Supino Inclinado com Halteres', target: 'Peitoral', displayString: '3 x 10-12' },
    { type: 'exercise', id: 'p_abcd_4', exercise: 'Crucifixo Declinado', target: 'Peitoral', displayString: '3 x 12' },
    { type: 'exercise', id: 'p_abcd_5', exercise: 'Pull Over com Halter', target: 'Peitoral', displayString: '3 x 12' },
    { type: 'exercise', id: 'p_abcd_6', exercise: 'Remada Cavalinho', target: 'Costas', displayString: '4 x 10' },
    { type: 'exercise', id: 'p_abcd_7', exercise: 'Remada Curvada com Barra', target: 'Costas', displayString: '3 x 12' },
    { type: 'exercise', id: 'p_abcd_8', exercise: 'Remada Unilateral (Serrote)', target: 'Costas', displayString: '3 x 12' },
    { type: 'exercise', id: 'p_abcd_9', exercise: 'Pull Down', target: 'Costas', displayString: '3 x 15' },

    { type: 'header', id: 'h_b', label: 'Treino B (Bíceps e Tríceps)' },
    { type: 'exercise', id: 'p_abcd_10', exercise: 'Rosca Direta com Barra', target: 'Bíceps', displayString: '4 x 10' },
    { type: 'exercise', id: 'p_abcd_11', exercise: 'Tríceps Testa com Barra', target: 'Tríceps', displayString: '4 x 10' },
    { type: 'exercise', id: 'p_abcd_12', exercise: 'Rosca Alternada com Halteres', target: 'Bíceps', displayString: '3 x 12' },
    { type: 'exercise', id: 'p_abcd_13', exercise: 'Tríceps Corda', target: 'Tríceps', displayString: '3 x 15' },
    { type: 'exercise', id: 'p_abcd_14', exercise: 'Rosca Martelo', target: 'Bíceps', displayString: '3 x 12' },
    { type: 'exercise', id: 'p_abcd_15', exercise: 'Tríceps Francês Unilateral', target: 'Tríceps', displayString: '3 x 12' },
    { type: 'exercise', id: 'p_abcd_16', exercise: 'Rosca 21', target: 'Bíceps', displayString: '2 Séries' },

    { type: 'header', id: 'h_c', label: 'Treino C (Ombro, Trapézio, Abd)' },
    { type: 'exercise', id: 'p_abcd_17', exercise: 'Desenvolvimento com Halteres', target: 'Ombros', displayString: '4 x 10' },
    { type: 'exercise', id: 'p_abcd_18', exercise: 'Elevação Lateral com Halteres', target: 'Ombros', displayString: '4 x 12-15' },
    { type: 'exercise', id: 'p_abcd_19', exercise: 'Elevação Frontal com Halteres', target: 'Ombros', displayString: '3 x 12' },
    { type: 'exercise', id: 'p_abcd_20', exercise: 'Desenvolvimento Arnold', target: 'Ombros', displayString: '3 x 10' },
    { type: 'exercise', id: 'p_abcd_21', exercise: 'Encolhimento com Halteres', target: 'Ombros', displayString: '4 x 15' },
    { type: 'exercise', id: 'p_abcd_22', exercise: 'Remada Alta', target: 'Ombros', displayString: '3 x 12' },
    { type: 'exercise', id: 'p_abcd_23', exercise: 'Abdominal Canivete', target: 'Abdômen', displayString: '4 x 20' },
    { type: 'exercise', id: 'p_abcd_24', exercise: 'Prancha Frontal', target: 'Abdômen', displayString: '3 x Falha' },

    { type: 'header', id: 'h_d', label: 'Treino D (Pernas Completas)' },
    { type: 'exercise', id: 'p_abcd_25', exercise: 'Leg Press 45°', target: 'Pernas', displayString: '4 x 12' },
    { type: 'exercise', id: 'p_abcd_26', exercise: 'Agachamento Livre com Barra', target: 'Pernas', displayString: '4 x 10' },
    { type: 'exercise', id: 'p_abcd_27', exercise: 'Cadeira Extensora', target: 'Pernas', displayString: '3 x 15' },
    { type: 'exercise', id: 'p_abcd_28', exercise: 'Mesa Flexora', target: 'Pernas', displayString: '4 x 12' },
    { type: 'exercise', id: 'p_abcd_29', exercise: 'Avanço (Passada)', target: 'Pernas', displayString: '3 x 20 passos' },
    { type: 'exercise', id: 'p_abcd_30', exercise: 'Stiff no Smith', target: 'Pernas', displayString: '3 x 12' },
    { type: 'exercise', id: 'p_abcd_31', exercise: 'Cadeira Adutora', target: 'Pernas', displayString: '3 x 15' },
    { type: 'exercise', id: 'p_abcd_32', exercise: 'Panturrilha em Pé', target: 'Pernas', displayString: '4 x 20' },
    { type: 'exercise', id: 'p_abcd_33', exercise: 'Elevação de Gêmeos (Sentado)', target: 'Pernas', displayString: '4 x 15' }
  ]
};

const PROTOCOL_UPPER_LOWER: Template = {
    id: "protocol_upper_lower",
    name: "Protocolo Upper / Lower (Força e Base)",
    exercises: [
        { type: 'header', id: 'h_ul_1', label: 'Upper A (Força/Base)' },
        { type: 'exercise', id: 'ul_1', exercise: 'Remada Curvada com Barra', target: 'Costas', displayString: '4 x 6-8', notes: 'Pegada Pronada' },
        { type: 'exercise', id: 'ul_2', exercise: 'Remada Cavalinho Máquina', target: 'Costas', displayString: '3 x 10' },
        { type: 'exercise', id: 'ul_3', exercise: 'Supino Reto com Barra', target: 'Peitoral', displayString: '4 x 6-8' },
        { type: 'exercise', id: 'ul_4', exercise: 'Crucifixo Inclinado com Halteres', target: 'Peitoral', displayString: '3 x 10' },
        { type: 'exercise', id: 'ul_5', exercise: 'Desenvolvimento no Smith', target: 'Ombros', displayString: '3 x 8-10' },
        { type: 'exercise', id: 'ul_6', exercise: 'Elevação Lateral com Halteres', target: 'Ombros', displayString: '3 x 12', notes: 'Bi-set com Desenvolvimento' },
        { type: 'exercise', id: 'ul_7', exercise: 'Remada Alta com Barra', target: 'Ombros', displayString: '3 x 12' },

        { type: 'header', id: 'h_ul_2', label: 'Lower A (Quadríceps/Geral)' },
        { type: 'exercise', id: 'ul_8', exercise: 'Hack Machine', target: 'Pernas', displayString: '4 x 8-10' },
        { type: 'exercise', id: 'ul_9', exercise: 'Cadeira Extensora', target: 'Pernas', displayString: '3 x 12-15' },
        { type: 'exercise', id: 'ul_10', exercise: 'Mesa Flexora', target: 'Pernas', displayString: '4 x 12' },
        { type: 'exercise', id: 'ul_11', exercise: 'Stiff com Barra', target: 'Pernas', displayString: '3 x 10' },
        { type: 'exercise', id: 'ul_12', exercise: 'Panturrilha Sentado', target: 'Pernas', displayString: '4 x 15' },
        { type: 'exercise', id: 'ul_13', exercise: 'Rosca Direta com Barra', target: 'Bíceps', displayString: '3 x 10' },
        { type: 'exercise', id: 'ul_14', exercise: 'Tríceps Corda', target: 'Tríceps', displayString: '3 x 10' },

        { type: 'header', id: 'h_ul_3', label: 'Upper B (Hipertrofia/Máquinas)' },
        { type: 'exercise', id: 'ul_15', exercise: 'Remada Articulada (Pegada Neutra)', target: 'Costas', displayString: '4 x 10' },
        { type: 'exercise', id: 'ul_16', exercise: 'Pulldown Unilateral', target: 'Costas', displayString: '3 x 12' },
        { type: 'exercise', id: 'ul_17', exercise: 'Supino Inclinado Hammer', target: 'Peitoral', displayString: '4 x 10' },
        { type: 'exercise', id: 'ul_18', exercise: 'Crucifixo na Máquina (Peck Deck)', target: 'Peitoral', displayString: '3 x 15' },
        { type: 'exercise', id: 'ul_19', exercise: 'Encolhimento no Smith', target: 'Ombros', displayString: '4 x 15' },
        { type: 'exercise', id: 'ul_20', exercise: 'Crucifixo Inverso com Halteres', target: 'Costas', displayString: '3 x 15' },

        { type: 'header', id: 'h_ul_4', label: 'Lower B (Posterior/Glúteo)' },
        { type: 'exercise', id: 'ul_21', exercise: 'Levantamento Terra Convencional', target: 'Pernas', displayString: '3 x 6-8' },
        { type: 'exercise', id: 'ul_22', exercise: 'Cadeira Flexora', target: 'Pernas', displayString: '4 x 12' },
        { type: 'exercise', id: 'ul_23', exercise: 'Cadeira Extensora', target: 'Pernas', displayString: '3 x 15' },
        { type: 'exercise', id: 'ul_24', exercise: 'Leg Press 45°', target: 'Pernas', displayString: '4 x 10' },
        { type: 'exercise', id: 'ul_25', exercise: 'Panturrilha Sentado', target: 'Pernas', displayString: '4 x 15' },
        { type: 'exercise', id: 'ul_26', exercise: 'Rosca Alternada com Halteres', target: 'Bíceps', displayString: '3 x 12' },
        { type: 'exercise', id: 'ul_27', exercise: 'Tríceps Testa com Halteres', target: 'Tríceps', displayString: '3 x 12' }
    ]
};

const PROTOCOL_FEMALE_GLUTE: Template = {
    id: "protocol_female_glute",
    name: "Protocolo Feminino (Foco Glúteos 3x)",
    exercises: [
        { type: 'header', id: 'h_f_1', label: 'Segunda (Quadríceps e Glúteos)' },
        { type: 'exercise', id: 'f_1', exercise: 'Hack Machine', target: 'Pernas', displayString: '4 x 10' },
        { type: 'exercise', id: 'f_2', exercise: 'Cadeira Extensora', target: 'Pernas', displayString: '3 x 15' },
        { type: 'exercise', id: 'f_3', exercise: 'Afundo no Smith', target: 'Pernas', displayString: '3 x 12 (cada)' },
        { type: 'exercise', id: 'f_4', exercise: 'Elevação Pélvica com Barra', target: 'Pernas', displayString: '4 x 10-12', notes: 'Pico de contração 2s' },
        { type: 'exercise', id: 'f_5', exercise: 'Glúteo Coice na Polia', target: 'Pernas', displayString: '3 x 15' },
        { type: 'exercise', id: 'f_6', exercise: 'Cadeira Abdutora', target: 'Pernas', displayString: '3 x 20' },
        { type: 'exercise', id: 'f_7', exercise: 'Panturrilha Sentado', target: 'Pernas', displayString: '4 x 15' },

        { type: 'header', id: 'h_f_2', label: 'Terça (Dorsais e Panturrilhas)' },
        { type: 'exercise', id: 'f_8', exercise: 'Puxada Aberta Pronada', target: 'Costas', displayString: '4 x 12' },
        { type: 'exercise', id: 'f_9', exercise: 'Remada Unilateral (Serrote)', target: 'Costas', displayString: '3 x 12' },
        { type: 'exercise', id: 'f_10', exercise: 'Remada Articulada (Pegada Pronada)', target: 'Costas', displayString: '3 x 12' },
        { type: 'exercise', id: 'f_11', exercise: 'Encolhimento com Halteres', target: 'Ombros', displayString: '3 x 15' },
        { type: 'exercise', id: 'f_12', exercise: 'Rosca Direta com Barra', target: 'Bíceps', displayString: '3 x 12' },
        { type: 'exercise', id: 'f_13', exercise: 'Rosca Alternada com Halteres', target: 'Bíceps', displayString: '3 x 12' },

        { type: 'header', id: 'h_f_3', label: 'Quarta (Glúteos e Posteriores)' },
        { type: 'exercise', id: 'f_14', exercise: 'Stiff com Barra', target: 'Pernas', displayString: '4 x 10' },
        { type: 'exercise', id: 'f_15', exercise: 'Mesa Flexora', target: 'Pernas', displayString: '4 x 12' },
        { type: 'exercise', id: 'f_16', exercise: 'Cadeira Flexora', target: 'Pernas', displayString: '3 x 15' },
        { type: 'exercise', id: 'f_17', exercise: 'Elevação Pélvica na Máquina', target: 'Pernas', displayString: '4 x 12' },
        { type: 'exercise', id: 'f_18', exercise: 'Extensão de Quadril', target: 'Pernas', displayString: '3 x 15' },
        { type: 'exercise', id: 'f_19', exercise: 'Abdução de Quadril na Polia', target: 'Pernas', displayString: '3 x 15' },

        { type: 'header', id: 'h_f_4', label: 'Quinta (Ombros e Braços)' },
        { type: 'exercise', id: 'f_20', exercise: 'Desenvolvimento com Halteres', target: 'Ombros', displayString: '4 x 10' },
        { type: 'exercise', id: 'f_21', exercise: 'Elevação Lateral com Halteres', target: 'Ombros', displayString: '4 x 12' },
        { type: 'exercise', id: 'f_22', exercise: 'Supino Reto na Máquina', target: 'Peitoral', displayString: '3 x 12' },
        { type: 'exercise', id: 'f_23', exercise: 'Tríceps Corda', target: 'Tríceps', displayString: '3 x 12' },
        { type: 'exercise', id: 'f_24', exercise: 'Tríceps Testa com Halteres', target: 'Tríceps', displayString: '3 x 12' },
        { type: 'exercise', id: 'f_25', exercise: 'Rosca Direta na Polia', target: 'Bíceps', displayString: '3 x 12' },

        { type: 'header', id: 'h_f_5', label: 'Sábado (Inferiores Completo)' },
        { type: 'exercise', id: 'f_26', exercise: 'Levantamento Terra Sumô', target: 'Pernas', displayString: '4 x 8' },
        { type: 'exercise', id: 'f_27', exercise: 'Glúteo Coice na Polia', target: 'Pernas', displayString: '3 x 12' },
        { type: 'exercise', id: 'f_28', exercise: 'Agachamento Búlgaro', target: 'Pernas', displayString: '3 x 10 (cada)' },
        { type: 'exercise', id: 'f_29', exercise: 'Cadeira Extensora', target: 'Pernas', displayString: '3 x 15' },
        { type: 'exercise', id: 'f_30', exercise: 'Mesa Flexora', target: 'Pernas', displayString: '3 x 12' },
        { type: 'exercise', id: 'f_31', exercise: 'Cadeira Flexora', target: 'Pernas', displayString: '3 x 15' },
    ]
};

const PROTOCOL_FUNCTIONAL_METABOLIC: Template = {
    id: "protocol_functional",
    name: "Treino Funcional Metabólico (50 Treinos)",
    exercises: [
        { type: 'header', id: 'h_fun_1', label: 'Cardio e Agilidade' },
        { type: 'exercise', id: 'fun_1', exercise: 'Corrida Suicídio', target: 'Cardio', displayString: '3 x 1 min' },
        { type: 'exercise', id: 'fun_2', exercise: 'Deslocamento Lateral', target: 'Cardio', displayString: '3 x 45s' },
        { type: 'exercise', id: 'fun_3', exercise: 'Escalada (Mountain Climber)', target: 'Cardio', displayString: '3 x 40s' },
        { type: 'exercise', id: 'fun_4', exercise: 'Polichinelo Frontal', target: 'Cardio', displayString: '3 x 1 min' },
        { type: 'exercise', id: 'fun_5', exercise: 'Zigue-Zague entre Cones', target: 'Cardio', displayString: '3 voltas' },
        { type: 'exercise', id: 'fun_6', exercise: 'Corda Naval', target: 'Cardio', displayString: '3 x 30s' },
        { type: 'exercise', id: 'fun_7', exercise: 'Skipping Alto', target: 'Cardio', displayString: '3 x 30s' },
        
        { type: 'header', id: 'h_fun_2', label: 'Pliometria e Potência' },
        { type: 'exercise', id: 'fun_8', exercise: 'Salto Vertical caindo no Step', target: 'Cardio', displayString: '3 x 10' },
        { type: 'exercise', id: 'fun_9', exercise: 'Burpee', target: 'Cardio', displayString: '3 x 10' },
        { type: 'exercise', id: 'fun_10', exercise: 'Agachamento com Salto (Jump Squat)', target: 'Pernas', displayString: '3 x 15' },
        { type: 'exercise', id: 'fun_11', exercise: 'Tiro Explosão (Sprint curto)', target: 'Cardio', displayString: '5 x 20m' },
        { type: 'exercise', id: 'fun_12', exercise: 'Sobe/Desce no Step (Rápido)', target: 'Cardio', displayString: '3 x 1 min' },

        { type: 'header', id: 'h_fun_3', label: 'Força Funcional e Core' },
        { type: 'exercise', id: 'fun_13', exercise: 'Flexão de Braço', target: 'Peitoral', displayString: '3 x Falha' },
        { type: 'exercise', id: 'fun_14', exercise: 'Prancha Frontal', target: 'Abdômen', displayString: '3 x 45s' },
        { type: 'exercise', id: 'fun_15', exercise: 'Prancha Lateral', target: 'Abdômen', displayString: '3 x 30s (lado)' },
        { type: 'exercise', id: 'fun_16', exercise: 'Abdominal Remador', target: 'Abdômen', displayString: '3 x 20' },
        { type: 'exercise', id: 'fun_17', exercise: 'Abdominal Infra (Solo)', target: 'Abdômen', displayString: '3 x 15' },
        { type: 'exercise', id: 'fun_18', exercise: 'Meio Burpee (Sprawl)', target: 'Cardio', displayString: '3 x 12' }
    ]
};

const PROTOCOL_MOBILITY_STABILITY: Template = {
    id: "protocol_mobility",
    name: "Protocolo Mobilidade e Estabilidade (Joint-by-Joint)",
    exercises: [
        { type: 'header', id: 'h_mob_1', label: 'Lombar e Core' },
        { type: 'exercise', id: 'mob_1', exercise: 'Ponte Isométrica + Anti-rotação', target: 'Abdômen', displayString: '3 x 30s' },
        { type: 'exercise', id: 'mob_2', exercise: 'Prancha Frontal', target: 'Abdômen', displayString: '3 x 45s' },
        { type: 'exercise', id: 'mob_3', exercise: 'Anti-rotação Ajoelhado (Pallof Press)', target: 'Abdômen', displayString: '3 x 12 (lado)' },
        { type: 'exercise', id: 'mob_4', exercise: 'Prancha Lateral', target: 'Abdômen', displayString: '3 x 30s' },
        
        { type: 'header', id: 'h_mob_2', label: 'Quadril' },
        { type: 'exercise', id: 'mob_5', exercise: 'Banco com Rotação', target: 'Mobilidade', displayString: '2 x 10' },
        { type: 'exercise', id: 'mob_6', exercise: 'Glúteo Deitado (Piriforme)', target: 'Mobilidade', displayString: '30s cada' },
        { type: 'exercise', id: 'mob_7', exercise: 'Quadril Chão (Posição 90/90)', target: 'Mobilidade', displayString: '1 min trocando' },
        { type: 'exercise', id: 'mob_8', exercise: 'Anti e Retroversão Pélvica com Super Band', target: 'Mobilidade', displayString: '2 x 15' },

        { type: 'header', id: 'h_mob_3', label: 'Joelhos e Pés' },
        { type: 'exercise', id: 'mob_9', exercise: 'Pé Garra (Short Foot)', target: 'Mobilidade', displayString: '3 x 10s isometria' },
        { type: 'exercise', id: 'mob_10', exercise: 'Agachamento Isométrico com Duas Borrachas', target: 'Pernas', displayString: '3 x 30s' },
        { type: 'exercise', id: 'mob_11', exercise: 'Aviãozinho Alternando (Stiff Unilateral s/ peso)', target: 'Pernas', displayString: '2 x 10 (lado)' },
        { type: 'exercise', id: 'mob_12', exercise: 'Abdução com Mini Band (Pé na parede)', target: 'Pernas', displayString: '2 x 15' },

        { type: 'header', id: 'h_mob_4', label: 'Ombros e Torácica' },
        { type: 'exercise', id: 'mob_13', exercise: 'Apoio Escapular (Push-up Plus)', target: 'Peitoral', displayString: '2 x 15' },
        { type: 'exercise', id: 'mob_14', exercise: 'Rotação Interna em Decúbito Lateral (Sleeper Stretch)', target: 'Mobilidade', displayString: '30s cada' },
        { type: 'exercise', id: 'mob_15', exercise: 'Gato-Camelo', target: 'Mobilidade', displayString: '10 reps' },
        { type: 'exercise', id: 'mob_16', exercise: 'Mobilidade Torácica (Livro Aberto)', target: 'Mobilidade', displayString: '10 reps cada' }
    ]
};

const PRESET_STRENGTH_FOR_RUNNERS_TEMPLATE: Template = {
  id: "preset_strength_runners",
  name: "Fortalecimento para Corredores",
  exercises: [
    { type: 'header', id: 'h_run_1', label: 'Aquecimento / Mobilidade' },
    { type: 'exercise', id: 'run_1', exercise: 'Mobilidade de Tornozelo', target: 'Mobilidade', displayString: '2 x 10 cada' },
    { type: 'exercise', id: 'run_2', exercise: 'Ponte Unilateral', target: 'Pernas', displayString: '3 x 12 cada' },
    { type: 'exercise', id: 'run_3', exercise: 'Ostra (Clam Shell)', target: 'Pernas', displayString: '3 x 15 cada' },
    { type: 'header', id: 'h_run_2', label: 'Força Principal' },
    { type: 'exercise', id: 'run_4', exercise: 'Agachamento Unilateral (Búlgaro)', target: 'Pernas', displayString: '3 x 10 cada' },
    { type: 'exercise', id: 'run_5', exercise: 'Stiff Unilateral', target: 'Pernas', displayString: '3 x 10 cada' },
    { type: 'exercise', id: 'run_6', exercise: 'Panturrilha Unilateral em Pé', target: 'Pernas', displayString: '3 x 15 cada' },
    { type: 'exercise', id: 'run_7', exercise: 'Prancha Frontal', target: 'Abdômen', displayString: '3 x 45s' },
  ]
};

const PRESET_WORKOUT_TEMPLATES: Template[] = [
  PRESET_STRENGTH_FOR_RUNNERS_TEMPLATE,
  PROTOCOL_ABCD_HYPERTROPHY,
  PROTOCOL_UPPER_LOWER,
  PROTOCOL_FEMALE_GLUTE,
  PROTOCOL_FUNCTIONAL_METABOLIC,
  PROTOCOL_MOBILITY_STABILITY
];

export default function AdminDashboard({ user, onLogout }: AdminProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [students, setStudents] = useState<User[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [allTechniques, setAllTechniques] = useState<TrainingTechnique[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  // State used to pass data from "Manage" tab to "Workouts" tab for editing
  const [workoutToEdit, setWorkoutToEdit] = useState<{studentId: string, workoutId: string, items: WorkoutItem[]} | null>(null);

  useEffect(() => {
    setLoading(true);
    let isMounted = true;

    const q = query(collection(db, 'users'), where('workoutType', 'not-in', ['admin', 'trainer']));
    const unsubStudents = onSnapshot(q, (querySnapshot) => {
      if (!isMounted) return;
      const fetchedStudents: User[] = [];
      querySnapshot.forEach((doc) => {
        fetchedStudents.push({ uid: doc.id, ...doc.data() } as User);
      });
      setStudents(fetchedStudents);
    }, (error) => console.error("Error fetching students:", error));

    const fetchData = async () => {
        try {
            const exercisesCol = collection(db, 'exercises');
            const exercisesSnap = await getDocs(query(exercisesCol, orderBy('name', 'asc')));
            const exercisesList = exercisesSnap.docs.map(doc => doc.data() as Exercise);

            const techniquesCol = collection(db, 'trainingTechniques');
            const techniquesSnap = await getDocs(query(techniquesCol, orderBy('name', 'asc')));
            const techniquesList = techniquesSnap.docs.map(doc => doc.data() as TrainingTechnique);
            
            if (isMounted) {
                setAllExercises(exercisesList);
                setAllTechniques(techniquesList);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            if (isMounted) setLoading(false);
        }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
      unsubStudents();
    };
  }, []);
  
  useEffect(() => {
    if (notification) {
        const timer = setTimeout(() => setNotification(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [notification]);

  const refetchData = async (type: 'exercises' | 'techniques' | 'runningPlans') => {
      try {
          if (type === 'exercises') {
              const exercisesSnap = await getDocs(query(collection(db, 'exercises'), orderBy('name', 'asc')));
              setAllExercises(exercisesSnap.docs.map(doc => doc.data() as Exercise));
              setNotification('Lista de exercícios atualizada.');
          } else if (type === 'techniques') {
              const techniquesSnap = await getDocs(query(collection(db, 'trainingTechniques'), orderBy('name', 'asc')));
              setAllTechniques(techniquesSnap.docs.map(doc => doc.data() as TrainingTechnique));
              setNotification('Lista de técnicas atualizada.');
          }
      } catch (error) {
          console.error(`Error refetching ${type}:`, error);
          setNotification(`Erro ao atualizar lista de ${type}.`);
      }
  };

  const handleEditWorkoutRequest = (studentId: string, workoutId: string, items: WorkoutItem[]) => {
      setWorkoutToEdit({ studentId, workoutId, items });
      setActiveTab('workouts');
  };

  const colors = {
      bg: darkMode ? 'bg-zinc-950' : 'bg-gray-50',
      card: darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm',
      text: darkMode ? 'text-white' : 'text-zinc-900',
      textSec: darkMode ? 'text-zinc-400' : 'text-zinc-500',
      border: darkMode ? 'border-zinc-800' : 'border-gray-200',
      input: darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-100 border-gray-300',
      hover: darkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-100',
      sidebar: darkMode ? 'bg-zinc-900 border-r border-zinc-800' : 'bg-white border-r border-gray-200',
  };

  return (
    <div className={`flex flex-col md:flex-row min-h-screen transition-colors duration-300 ${colors.bg} ${colors.text}`}>
      {notification && (
          <div className="fixed top-6 right-6 z-[100] bg-zinc-800 border border-emerald-500/50 rounded-lg shadow-2xl p-4 max-w-sm animate-slide-up flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <i className="ph-fill ph-check-circle text-xl"></i>
              </div>
              <p className="text-white text-sm font-medium">{notification}</p>
          </div>
      )}
      
      <aside className={`w-full md:w-64 ${colors.sidebar} p-6 flex flex-col`}>
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Fit<span className="text-emerald-500">Manager</span></h2>
        </div>
        
        <nav className="flex-1 space-y-2">
          <SidebarLink darkMode={darkMode} icon="squares-four" label="Visão Geral" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarLink darkMode={darkMode} icon="user-gear" label="Gerenciar Alunos" active={activeTab === 'manage'} onClick={() => setActiveTab('manage')} />
          <SidebarLink darkMode={darkMode} icon="barbell" label="Criar Treinos" active={activeTab === 'workouts'} onClick={() => setActiveTab('workouts')} />
          <SidebarLink darkMode={darkMode} icon="person-simple-run" label="Planos de Corrida" active={activeTab === 'running'} onClick={() => setActiveTab('running')} />
          <SidebarLink darkMode={darkMode} icon="ruler" label="Avaliação Física" active={activeTab === 'assessment'} onClick={() => setActiveTab('assessment')} />
          <SidebarLink darkMode={darkMode} icon="atom" label="Técnicas de Treino" active={activeTab === 'techniques'} onClick={() => setActiveTab('techniques')} />
          <SidebarLink darkMode={darkMode} icon="gear" label="Configurações" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className={`mt-auto pt-6 border-t ${colors.border}`}>
          <div className="flex items-center gap-3 mb-4">
             <img src={user.avatar} className="w-10 h-10 rounded-full border border-emerald-500" alt="Admin" />
             <div className="text-sm">
                <div className="font-semibold">{user.name?.split(" ")[0] || user.email}</div>
                <div className={`${colors.textSec} text-xs capitalize`}>{user.workoutType}</div>
             </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors w-full p-2 rounded-lg hover:bg-red-400/10">
            <i className="ph ph-sign-out text-lg"></i> Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">
            {activeTab === 'overview' && 'Painel de Controle'}
            {activeTab === 'manage' && 'Gerenciamento de Alunos'}
            {activeTab === 'workouts' && 'Construtor de Treinos'}
            {activeTab === 'running' && 'Construtor de Planilhas de Corrida'}
            {activeTab === 'assessment' && 'Avaliação Física'}
            {activeTab === 'techniques' && 'Metodologias de Treino'}
            {activeTab === 'settings' && 'Configurações do Sistema'}
          </h1>
        </header>

        {loading ? <div className="text-emerald-500">Carregando dados...</div> : (
          <>
            {activeTab === 'overview' && <OverviewTab user={user} students={students} darkMode={darkMode} />}
            {activeTab === 'manage' && <ManageStudentTab students={students} setNotification={setNotification} onEditWorkout={handleEditWorkoutRequest} darkMode={darkMode} />}
            {activeTab === 'workouts' && <WorkoutsTab students={students} allExercises={allExercises} adminUid={user.uid} setNotification={setNotification} onRefreshExercises={() => refetchData('exercises')} workoutToEdit={workoutToEdit} clearWorkoutToEdit={() => setWorkoutToEdit(null)} darkMode={darkMode} />}
            {activeTab === 'running' && <RunningTab students={students} setNotification={setNotification} darkMode={darkMode} />}
            {activeTab === 'assessment' && <AssessmentTab students={students} setNotification={setNotification} darkMode={darkMode} />}
            {activeTab === 'techniques' && <TechniquesTab techniques={allTechniques} darkMode={darkMode} />}
            {activeTab === 'settings' && <SettingsTab user={user} darkMode={darkMode} setDarkMode={setDarkMode} setNotification={setNotification} onDataUpdated={refetchData} />}
          </>
        )}
      </main>
    </div>
  );
}

const SidebarLink = ({ icon, label, active, onClick, darkMode }: { icon: string, label: string, active: boolean, onClick: () => void, darkMode: boolean }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active ? 'bg-emerald-500/10 text-emerald-500' : `${darkMode ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white' : 'text-zinc-500 hover:bg-gray-100 hover:text-zinc-900'}`}`}
  >
    <i className={`ph ph-${icon} text-xl`}></i>
    <span className="font-medium">{label}</span>
  </button>
);

const OverviewTab = ({ user, students, darkMode }: { user: User, students: User[], darkMode: boolean }) => {
  const [totalWorkouts, setTotalWorkouts] = useState(0);

  useEffect(() => {
    const fetchHistoryStats = async () => {
        try {
            const querySnapshot = await getDocs(collectionGroup(db, 'history'));
            setTotalWorkouts(querySnapshot.size);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };
    fetchHistoryStats();
  }, []);

  const cardClass = darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm';
  const textSec = darkMode ? 'text-zinc-400' : 'text-zinc-500';

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon="users" label="Total de Alunos" value={students.length} darkMode={darkMode} />
        <StatCard icon="barbell" label="Alunos Ativos" value={students.filter(s => s.workoutType !== 'iniciante' || s.hasCompletedAnamnesis).length} darkMode={darkMode} />
        <StatCard icon="chart-line" label="Treinos Realizados" value={totalWorkouts} darkMode={darkMode} />
      </div>

      <div className={`${cardClass} border rounded-xl overflow-hidden`}>
        <div className={`p-6 border-b ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}><h3 className="font-bold text-lg">Base de Alunos Recente</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={`${darkMode ? 'bg-zinc-950/50' : 'bg-gray-50'} ${textSec} text-sm uppercase`}>
              <tr><th className="p-4 font-medium">Aluno</th><th className="p-4 font-medium">Email</th><th className="p-4 font-medium">Status</th></tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-zinc-800' : 'divide-gray-200'}`}>
              {students.slice(0, 5).map(student => (
                <tr key={student.uid} className={`${darkMode ? 'hover:bg-zinc-800/50' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className="p-4 flex items-center gap-3">
                    <img src={student.avatar} className="w-8 h-8 rounded-full" alt="" />
                    <span className="font-medium">{student.name}</span>
                  </td>
                  <td className={`p-4 ${textSec}`}>{student.email}</td>
                  <td className="p-4">
                    {student.hasCompletedAnamnesis ? 
                        <span className="bg-emerald-500/10 text-emerald-500 text-xs px-2 py-1 rounded-full">Ativo</span> : 
                        <span className="bg-yellow-500/10 text-yellow-500 text-xs px-2 py-1 rounded-full">Pendente</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SettingsTab = ({ user, darkMode, setDarkMode, setNotification, onDataUpdated }: { user: User, darkMode: boolean, setDarkMode: (v: boolean) => void, setNotification: (msg: string) => void, onDataUpdated: (type: any) => void }) => {
    const [isSeeding, setIsSeeding] = useState<string | false>(false);
    const [diagnosticLog, setDiagnosticLog] = useState<string[]>([]);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    
    // Profile Edit State
    const [name, setName] = useState(user.name);
    const [avatar, setAvatar] = useState(user.avatar || '');
    const [savingProfile, setSavingProfile] = useState(false);

    const handleUpdateProfile = async () => {
        setSavingProfile(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                name,
                avatar
            });
            setNotification("Perfil atualizado com sucesso!");
        } catch (e) {
            console.error(e);
            setNotification("Erro ao atualizar perfil.");
        } finally {
            setSavingProfile(false);
        }
    };

    const addLog = (msg: string) => {
        setDiagnosticLog(prev => [msg, ...prev]);
    }

    const runDiagnostic = async () => {
      setDiagnosticLog([]);
      addLog("--- INICIANDO DIAGNÓSTICO ---");
      addLog(`Usuário Autenticado: ${user.email} (${user.uid})`);
      try {
          addLog("Tentando escrever documento de teste...");
          const testRef = doc(db, '_diagnostics', 'connectivity_check');
          await setDoc(testRef, { timestamp: new Date().toISOString(), status: 'ok' }, {});
          addLog("SUCESSO: Escrita básica funcionou. Conexão OK.");
          await deleteDoc(testRef);
      } catch (e: any) {
          addLog(`ERRO DE ESCRITA: ${e.code} - ${e.message}`);
          return;
      }
      addLog("--- FIM DO DIAGNÓSTICO ---");
  };

  const handleSeed = async (type: 'exercises' | 'techniques' | 'runningPlans') => {
      addLog(`[UI] Acionado botão para popular ${type}...`);
      try {
          const data = type === 'exercises' ? SEED_EXERCISES : type === 'techniques' ? SEED_TECHNIQUES : SEED_RUNNING_PLANS;
          const collectionName = type === 'exercises' ? 'exercises' : type === 'techniques' ? 'trainingTechniques' : 'runningPlanTemplates';
          
          setIsSeeding(type);
          setProgress({ current: 0, total: data.length });
          
          let successCount = 0;
          for (let i = 0; i < data.length; i++) {
              const item = data[i];
              // Using any to bypass strict type checking on the generic seed object vs specific interfaces
              const cleanItem = JSON.parse(JSON.stringify(item));
              await setDoc(doc(db, collectionName, item.id), cleanItem, {});
              successCount++;
              setProgress({ current: successCount, total: data.length });
              if (i % 10 === 0) await new Promise(r => setTimeout(r, 10)); // tiny throttle
          }
          
          addLog(`CONCLUÍDO: ${successCount} salvos.`);
          setNotification(`${successCount} de ${data.length} importados.`);
          onDataUpdated(type);
      } catch (error: any) {
          addLog(`ERRO GERAL NO SEED: ${error.message}`);
      } finally {
          setIsSeeding(false);
          setProgress({ current: 0, total: 0 });
      }
  };

    const cardClass = darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm';
    const inputClass = darkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-900';

    return (
        <div className="space-y-6">
            {/* Theme & Profile Section */}
            <div className={`grid md:grid-cols-2 gap-6`}>
                <div className={`${cardClass} border rounded-xl p-6`}>
                    <h3 className="font-bold text-lg mb-4">Aparência</h3>
                    <div className="flex items-center justify-between">
                        <span>Modo Escuro</span>
                        <button 
                            onClick={() => setDarkMode(!darkMode)}
                            className={`w-14 h-8 rounded-full p-1 transition-colors ${darkMode ? 'bg-emerald-600' : 'bg-gray-300'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>

                <div className={`${cardClass} border rounded-xl p-6`}>
                    <h3 className="font-bold text-lg mb-4">Perfil do Treinador</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium opacity-70 mb-1">Nome de Exibição</label>
                            <input value={name} onChange={e => setName(e.target.value)} className={`w-full ${inputClass} rounded-lg p-2 text-sm outline-none`} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium opacity-70 mb-1">URL do Avatar</label>
                            <input value={avatar} onChange={e => setAvatar(e.target.value)} className={`w-full ${inputClass} rounded-lg p-2 text-sm outline-none`} />
                        </div>
                        <button 
                            onClick={handleUpdateProfile} 
                            disabled={savingProfile}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-sm disabled:opacity-50"
                        >
                            {savingProfile ? 'Salvando...' : 'Atualizar Perfil'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Database Tools */}
            {user.workoutType === 'admin' && (
                <div className={`${cardClass} border rounded-xl p-6 relative overflow-hidden`}>
                <h3 className="font-bold text-lg mb-4">Ferramentas de Banco de Dados</h3>
                
                <div className="flex flex-wrap gap-4 mb-6">
                    <button onClick={() => handleSeed('exercises')} disabled={!!isSeeding} className={`bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-5 rounded-lg border border-zinc-700 disabled:opacity-50 transition-all active:scale-95`}>
                        {isSeeding === 'exercises' ? <i className="ph ph-spinner animate-spin"></i> : <i className="ph ph-barbell"></i>} Popular Exercícios
                    </button>
                    <button onClick={() => handleSeed('techniques')} disabled={!!isSeeding} className={`bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-5 rounded-lg border border-zinc-700 disabled:opacity-50 transition-all active:scale-95`}>
                        {isSeeding === 'techniques' ? <i className="ph ph-spinner animate-spin"></i> : <i className="ph ph-atom"></i>} Popular Técnicas
                    </button>
                    <button onClick={() => handleSeed('runningPlans')} disabled={!!isSeeding} className={`bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-5 rounded-lg border border-zinc-700 disabled:opacity-50 transition-all active:scale-95`}>
                        {isSeeding === 'runningPlans' ? <i className="ph ph-spinner animate-spin"></i> : <i className="ph ph-person-simple-run"></i>} Popular Planos Corrida
                    </button>
                    <button onClick={runDiagnostic} className="bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-500 font-medium py-3 px-5 rounded-lg border border-yellow-600/50 flex items-center gap-2 ml-auto">
                        <i className="ph ph-warning"></i> RODAR DIAGNÓSTICO
                    </button>
                </div>

                <div className="bg-black rounded-lg p-4 font-mono text-xs text-zinc-400 h-64 overflow-y-auto border border-zinc-800 shadow-inner">
                    <div className="text-zinc-500 mb-2 border-b border-zinc-800 pb-1">SYSTEM LOG</div>
                    {diagnosticLog.length === 0 && <span className="opacity-50">Aguardando ação...</span>}
                    {diagnosticLog.map((log, i) => (
                        <div key={i} className={`mb-1 ${log.includes("ERRO") ? "text-red-400 font-bold" : log.includes("SUCESSO") ? "text-emerald-400" : ""}`}>{`> ${log}`}</div>
                    ))}
                </div>

                {isSeeding && (
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-emerald-500 mb-1 font-bold uppercase">
                            <span>Progresso</span><span>{Math.round((progress.current / progress.total) * 100)}%</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-1">
                            <div className="bg-emerald-500 h-1 rounded-full transition-all duration-300" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                        </div>
                    </div>
                )}
                </div>
            )}
        </div>
    );
};

const StatCard = ({ icon, label, value, darkMode }: { icon: string, label: string, value: any, darkMode: boolean }) => (
  <div className={`${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'} border p-6 rounded-xl flex items-center gap-4`}>
    <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 text-2xl"><i className={`ph ph-${icon}`}></i></div>
    <div><div className={`${darkMode ? 'text-zinc-500' : 'text-zinc-400'} text-sm`}>{label}</div><div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{value}</div></div>
  </div>
);

const TechniquesTab = ({ techniques, darkMode }: { techniques: TrainingTechnique[], darkMode: boolean }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {techniques.length === 0 && (
      <p className="opacity-50 col-span-full">Nenhuma técnica de treino encontrada. Vá em Configurações para popular o banco.</p>
    )}
    {techniques.map(tech => (
      <div key={tech.id} className={`${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'} border rounded-xl p-6 animate-fade-in`}>
        <h3 className="font-bold text-xl text-emerald-500 mb-2">{tech.name}</h3>
        <p className={`${darkMode ? 'text-zinc-400' : 'text-zinc-600'} text-sm mb-4 border-b ${darkMode ? 'border-zinc-800' : 'border-gray-100'} pb-4`}>{tech.description}</p>
        <div className="space-y-4">
          {tech.details.map((detail, index) => (
            <div key={index}>
              <h4 className="font-semibold">{detail.title}</h4>
              <p className={`${darkMode ? 'text-zinc-500' : 'text-zinc-600'} text-sm`}>{detail.description}</p>
              {detail.properties && (
                <div className="mt-2 text-xs space-y-1">
                  {Object.entries(detail.properties).map(([key, value]) => (
                    <div key={key} className="flex">
                      <span className={`font-medium ${darkMode ? 'text-zinc-400' : 'text-zinc-500'} w-28 shrink-0`}>{key}:</span>
                      <span className={darkMode ? 'text-zinc-300' : 'text-zinc-700'}>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const WorkoutsTab = ({ students, allExercises, adminUid, setNotification, onRefreshExercises, workoutToEdit, clearWorkoutToEdit, darkMode }: { students: User[], allExercises: Exercise[], adminUid: string, setNotification: (msg: string) => void, onRefreshExercises: () => void, workoutToEdit: any, clearWorkoutToEdit: () => void, darkMode: boolean }) => {
  const [workoutName, setWorkoutName] = useState('');
  const [buildList, setBuildList] = useState<WorkoutItem[]>([]);
  const [selectedStudentUid, setSelectedStudentUid] = useState('');
  const [studentWorkouts, setStudentWorkouts] = useState<Workout[]>([]);
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [editingTemplateId, setEditingTemplateId] = useState('');
  
  // Builder States
  const [selectedMuscle, setSelectedMuscle] = useState('Peitoral');
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('12');
  const [timerValue, setTimerValue] = useState('');
  const [notes, setNotes] = useState('');
  const [headerLabel, setHeaderLabel] = useState('');
  const [generatingImgFor, setGeneratingImgFor] = useState<string | null>(null);

  // Grouping State
  const [selectedItemsForGrouping, setSelectedItemsForGrouping] = useState<string[]>([]);

  // AI Suggestion State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiContext, setAiContext] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Manual Creation Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState('Peitoral');
  const [newExType, setNewExType] = useState('strength');
  const [creatingEx, setCreatingEx] = useState(false);
  
  const muscleGroups = Array.from(new Set(allExercises.map(ex => ex.muscleGroup))).sort();
  const filteredExercises = allExercises.filter(ex => ex.muscleGroup === selectedMuscle);

  const cardClass = darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm';
  const inputClass = darkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-900';

  useEffect(() => {
      if (workoutToEdit) {
          setSelectedStudentUid(workoutToEdit.studentId);
          setWorkoutName(workoutToEdit.workoutId);
          setBuildList(workoutToEdit.items);
      }
  }, [workoutToEdit]);

  useEffect(() => {
    const templatesColRef = collection(db, 'users', adminUid, 'templates');
    const unsubscribe = onSnapshot(templatesColRef, (snapshot) => {
      const fetchedTemplates: Template[] = [];
      snapshot.forEach(doc => fetchedTemplates.push({ id: doc.id, ...doc.data() } as Template));
      setCustomTemplates(fetchedTemplates);
    }, (error) => console.error("Error fetching templates:", error));
    return () => unsubscribe();
  }, [adminUid]);

  useEffect(() => {
    if (!selectedStudentUid) {
      setStudentWorkouts([]);
      return;
    }
    const fetchWorkouts = async () => {
        const workoutsColRef = collection(db, 'users', selectedStudentUid, 'workouts');
        const snapshot = await getDocs(workoutsColRef);
        const fetchedWorkouts: Workout[] = [];
        snapshot.forEach(doc => fetchedWorkouts.push({ id: doc.id, items: doc.data().items }));
        setStudentWorkouts(fetchedWorkouts);
    }
    fetchWorkouts();
  }, [selectedStudentUid]);

  const loadTemplate = (templateName: string) => {
    if (!templateName) return;
    const allTemplates = [...PRESET_WORKOUT_TEMPLATES, ...customTemplates];
    const template = allTemplates.find(t => t.name === templateName);
    if (template) {
      setBuildList([...template.exercises]);
      setWorkoutName(template.name);
      setEditingTemplateId(customTemplates.some(t => t.id === template.id) ? template.id : '');
    }
  };

  const handleAddExercise = async () => {
    const exerciseDef = allExercises.find(e => e.id === selectedExerciseId);
    if (!exerciseDef) return;

    let finalImg = exerciseDef.img;

    if (!finalImg) {
        setGeneratingImgFor(exerciseDef.id);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Create a clean, minimalist, flat vector illustration of a fitness exercise: "${exerciseDef.name}". Target muscle group: ${exerciseDef.muscleGroup}. Style: technical manual drawing, white background, black lines, neutral colors for the person. No text.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: prompt }] },
                config: {
                    imageConfig: { aspectRatio: '1:1' }
                }
            });

            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        finalImg = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                        await updateDoc(doc(db, 'exercises', exerciseDef.id), { img: finalImg });
                        onRefreshExercises();
                        break;
                    }
                }
            }
        } catch (error) {
            console.error("Failed to generate image:", error);
            setNotification("Erro ao gerar imagem automática. O exercício será adicionado sem imagem.");
        } finally {
            setGeneratingImgFor(null);
        }
    }

    const newItem: WorkoutExercise = {
        type: 'exercise',
        id: `${exerciseDef.id}_${Date.now()}`,
        exercise: exerciseDef.name,
        target: exerciseDef.muscleGroup,
        displayString: `${sets} x ${reps}`,
        notes: notes,
        img: finalImg, 
        timerValue: timerValue ? parseInt(timerValue) : undefined
    };
    setBuildList([...buildList, newItem]);
    setNotes('');
    setTimerValue('');
  };

  // Grouping Logic
  const toggleSelection = (id: string) => {
      if (selectedItemsForGrouping.includes(id)) {
          setSelectedItemsForGrouping(prev => prev.filter(i => i !== id));
      } else {
          setSelectedItemsForGrouping(prev => [...prev, id]);
      }
  };

  const applyTechniqueToGroup = (technique: string) => {
      const selectedCount = selectedItemsForGrouping.length;
      if (selectedCount === 0) return;

      const isGroupingAction = ['Agrupar', 'Bi-set', 'Tri-set', 'Giant-set'].includes(technique);
      // Generate a unique group ID if it's a grouping action or if we are applying a technique to multiple items that implies grouping
      const groupId = isGroupingAction || selectedCount > 1 ? `group_${Date.now()}` : undefined;
      
      // Determine technique label
      let techniqueLabel = technique;
      if (technique === 'Agrupar') {
          if (selectedCount === 2) techniqueLabel = 'Bi-set';
          else if (selectedCount === 3) techniqueLabel = 'Tri-set';
          else if (selectedCount > 3) techniqueLabel = 'Giant-set';
      }

      const updatedList = buildList.map(item => {
          if (item.type === 'exercise' && selectedItemsForGrouping.includes(item.id)) {
              return { 
                  ...item, 
                  supersetGroup: groupId || item.supersetGroup, // Preserve existing group if taking single action, or new group if grouping
                  technique: techniqueLabel 
              };
          }
          return item;
      });

      setBuildList(updatedList);
      setSelectedItemsForGrouping([]);
      setNotification(`Técnica "${techniqueLabel}" aplicada!`);
  };

  const ungroupSelected = () => {
      const updatedList = buildList.map(item => {
          if (item.type === 'exercise' && selectedItemsForGrouping.includes(item.id)) {
              const { supersetGroup, technique, ...rest } = item;
              return rest;
          }
          return item;
      });
      setBuildList(updatedList);
      setSelectedItemsForGrouping([]);
      setNotification("Itens desagrupados.");
  };

  // ... (AI logic remains)
  const generateAiSuggestions = async () => {
    setIsAiLoading(true);
    setAiSuggestions([]);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const contextString = aiContext ? `com foco em: ${aiContext}` : `com foco em hipertrofia ou condicionamento geral`;
        const prompt = `Sugira 5 exercícios para o grupo muscular "${selectedMuscle}" ${contextString}. Para cada exercício, recomende séries (sets) e repetições (reps) e uma breve razão (reason) para a escolha. Retorne em JSON.`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { name: { type: Type.STRING }, sets: { type: Type.STRING }, reps: { type: Type.STRING }, reason: { type: Type.STRING } },
                        required: ["name", "sets", "reps"],
                    },
                },
            },
        });
        if (response.text) setAiSuggestions(JSON.parse(response.text));
    } catch (e) { console.error(e); setNotification("Erro ao gerar sugestões."); } finally { setIsAiLoading(false); }
  };

  const addAiSuggestion = async (suggestion: any) => {
      let existingExercise = allExercises.find(e => e.name.toLowerCase() === suggestion.name.toLowerCase());
      let finalId = existingExercise?.id || suggestion.name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]+/g, '');
      const newItem: WorkoutExercise = {
          type: 'exercise',
          id: `${finalId}_${Date.now()}`,
          exercise: suggestion.name,
          target: selectedMuscle,
          displayString: `${suggestion.sets} x ${suggestion.reps}`,
          notes: suggestion.reason,
          img: existingExercise?.img
      };
      setBuildList([...buildList, newItem]);
      setNotification("Sugestão adicionada!");
  };

  // ... (Manual creation logic remains)
  const handleCreateExercise = async () => {
      if (!newExName || !newExMuscle) return;
      setCreatingEx(true);
      try {
          const id = newExName.toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]+/g, '');
          await setDoc(doc(db, 'exercises', id), { id, name: newExName, muscleGroup: newExMuscle, type: newExType }, {});
          setNotification(`Exercício "${newExName}" criado!`);
          setNewExName(''); setShowCreateModal(false); onRefreshExercises(); 
      } catch (e: any) { console.error(e); alert(`Erro: ${e.message}`); } finally { setCreatingEx(false); }
  };

  const handleAddHeader = () => {
      if (!headerLabel) return;
      setBuildList([...buildList, { type: 'header', id: `h_${Date.now()}`, label: headerLabel }]);
      setHeaderLabel('');
  };

  const removeFromList = (index: number) => {
      const newList = [...buildList];
      newList.splice(index, 1);
      setBuildList(newList);
  };
  
  const moveItem = (index: number, direction: 'up' | 'down') => {
      const newList = [...buildList];
      if (direction === 'up' && index > 0) {
          [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
      } else if (direction === 'down' && index < newList.length - 1) {
          [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
      }
      setBuildList(newList);
  };

  const handleSaveTemplate = async (mode: 'create' | 'update') => {
    if (!workoutName || buildList.length === 0) {
      setNotification("Defina um nome e adicione exercícios.");
      return;
    }

    const templateData = { name: workoutName, exercises: buildList };

    try {
      if (mode === 'update' && editingTemplateId) {
        await setDoc(doc(db, 'users', adminUid, 'templates', editingTemplateId), templateData, {});
        setNotification("Modelo atualizado com sucesso!");
      } else {
        // Create new
        const docRef = await addDoc(collection(db, 'users', adminUid, 'templates'), templateData);
        setEditingTemplateId(docRef.id); // Set the new ID as current
        setNotification("Novo modelo criado com sucesso!");
      }
    } catch (e) {
      console.error(e);
      setNotification("Erro ao salvar modelo.");
    }
  };

  const deleteTemplate = async () => {
    if (!editingTemplateId) return;
    await deleteDoc(doc(db, 'users', adminUid, 'templates', editingTemplateId));
    setNotification("Modelo excluído.");
    setWorkoutName(''); setBuildList([]); setEditingTemplateId('');
  };

  const saveWorkoutToStudent = async () => {
    if (!selectedStudentUid || !workoutName || buildList.length === 0) return;
    try {
      await setDoc(doc(db, 'users', selectedStudentUid, 'workouts', workoutName), { items: buildList }, {});
      await addDoc(collection(db, 'users', selectedStudentUid, 'notifications'), { title: 'Treino Atualizado 🏋️', body: `Treino "${workoutName}" atualizado.`, timestamp: Date.now() });
      setNotification("Treino salvo!");
      setStudentWorkouts(prev => [...prev.filter(w => w.id !== workoutName), { id: workoutName, items: buildList }]);
      if(workoutToEdit) clearWorkoutToEdit();
    } catch (e) { console.error(e); setNotification("Erro ao salvar."); }
  };
  
  const studentWorkoutExists = studentWorkouts.some(w => w.id === workoutName);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
        {/* Modals ... */}
        {showCreateModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className={`${cardClass} border rounded-xl p-6 w-full max-w-sm`}>
                    <h3 className="text-lg font-bold mb-4">Novo Exercício</h3>
                    <div className="space-y-4">
                        <input value={newExName} onChange={e => setNewExName(e.target.value)} className={`w-full ${inputClass} rounded-lg p-2 text-sm`} placeholder="Nome" />
                        <input value={newExMuscle} onChange={e => setNewExMuscle(e.target.value)} className={`w-full ${inputClass} rounded-lg p-2 text-sm`} placeholder="Grupo Muscular" />
                        <select value={newExType} onChange={e => setNewExType(e.target.value)} className={`w-full ${inputClass} rounded-lg p-2 text-sm`}>
                            <option value="strength">Musculação</option><option value="cardio">Cardio</option><option value="mobilidade">Mobilidade</option>
                        </select>
                        <div className="flex gap-2 pt-2">
                            <button onClick={() => setShowCreateModal(false)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 rounded-lg text-sm">Cancelar</button>
                            <button onClick={handleCreateExercise} disabled={!newExName || !newExMuscle || creatingEx} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-sm disabled:opacity-50">Salvar</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {showAiModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
                <div className={`${cardClass} border rounded-xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col`}>
                    <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                        <h3 className="text-lg font-bold text-emerald-500 flex items-center gap-2"><i className="ph-fill ph-magic-wand"></i> Assistente IA</h3>
                        <button onClick={() => setShowAiModal(false)} className="text-zinc-400 hover:text-white"><i className="ph ph-x text-lg"></i></button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4">
                        <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 text-sm">
                            <p className="font-bold text-emerald-400 mb-1">Gerando sugestões para: {selectedMuscle}</p>
                            <input value={aiContext} onChange={e => setAiContext(e.target.value)} placeholder="Foco (ex: Hipertrofia)" className={`w-full ${inputClass} mt-2 rounded-lg p-2 text-sm`} />
                            <button onClick={generateAiSuggestions} disabled={isAiLoading} className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-sm disabled:opacity-50 flex items-center justify-center gap-2">{isAiLoading ? <><i className="ph ph-spinner animate-spin"></i> Pensando...</> : 'Gerar Sugestões'}</button>
                        </div>
                        <div className="space-y-2">
                            {aiSuggestions.map((sug, idx) => (
                                <div key={idx} className={`p-3 border rounded-lg ${darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-gray-50 border-gray-200'} flex justify-between items-start gap-3`}>
                                    <div><div className="font-bold text-emerald-400">{sug.name}</div><div className="text-xs text-white mt-1">{sug.sets} x {sug.reps}</div><div className="text-xs text-zinc-500 mt-1 italic">"{sug.reason}"</div></div>
                                    <button onClick={() => addAiSuggestion(sug)} className="bg-zinc-800 hover:bg-emerald-500 hover:text-black text-white p-2 rounded-lg text-xs font-bold shrink-0">Adicionar</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        <div className={`lg:col-span-1 ${cardClass} border rounded-xl p-4 flex flex-col gap-4 overflow-y-auto`}>
            {/* ... Configuration and Add Exercise Inputs (Same as before) ... */}
            <div className={`font-bold border-b ${darkMode ? 'border-zinc-800' : 'border-gray-200'} pb-2 flex justify-between`}>
                <h3>1. Configuração</h3>
                {workoutToEdit && <button onClick={clearWorkoutToEdit} className="text-xs text-red-500 hover:underline">Cancelar Edição</button>}
            </div>
            <div className="space-y-3">
                <select value={selectedStudentUid} onChange={e => setSelectedStudentUid(e.target.value)} disabled={!!workoutToEdit} className={`w-full ${inputClass} rounded-lg p-2 text-sm`}>
                    <option value="">Selecione um aluno...</option>{students.map(s => <option key={s.uid} value={s.uid}>{s.name}</option>)}
                </select>
                <div className="flex gap-2">
                    <select onChange={(e) => loadTemplate(e.target.value)} className={`flex-1 ${inputClass} rounded-lg p-2 text-sm`}><option value="">Carregar Modelo...</option><optgroup label="Padrão">{PRESET_WORKOUT_TEMPLATES.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}</optgroup><optgroup label="Meus">{customTemplates.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}</optgroup></select>
                    {editingTemplateId && <button onClick={deleteTemplate} className="bg-red-500/10 text-red-400 p-2 rounded-lg"><i className="ph ph-trash"></i></button>}
                </div>
                <input value={workoutName} onChange={e => setWorkoutName(e.target.value)} placeholder="Nome do Treino (ex: Treino A)" className={`w-full ${inputClass} rounded-lg p-2 text-sm`} />
            </div>

            <div className={`flex items-center justify-between border-b ${darkMode ? 'border-zinc-800' : 'border-gray-200'} pb-2 pt-2`}><h3 className="font-bold">2. Adicionar Itens</h3><button onClick={() => setShowCreateModal(true)} className="text-xs text-emerald-500 hover:text-emerald-600 flex items-center gap-1 font-bold"><i className="ph ph-plus-circle"></i> Novo Exercício</button></div>
            <div className={`flex gap-2 items-center ${darkMode ? 'bg-zinc-950/50' : 'bg-gray-50'} p-3 rounded-lg border border-dashed ${darkMode ? 'border-zinc-800' : 'border-gray-300'}`}>
                <input value={headerLabel} onChange={e => setHeaderLabel(e.target.value)} placeholder="Título de Bloco (ex: Aquecimento)" className="flex-1 bg-transparent text-sm outline-none" />
                <button onClick={handleAddHeader} disabled={!headerLabel} className="text-emerald-500 text-sm font-bold disabled:opacity-50">ADD</button>
            </div>
            <div className={`space-y-3 ${darkMode ? 'bg-zinc-950/50' : 'bg-gray-50'} p-3 rounded-lg border ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
                <div className="flex gap-2 items-center">
                    <div className="w-1/3 relative"><select value={selectedMuscle} onChange={e => setSelectedMuscle(e.target.value)} className={`w-full ${inputClass} rounded-lg p-2 text-xs`}>{muscleGroups.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                    <button onClick={() => setShowAiModal(true)} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 p-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1"><i className="ph-fill ph-magic-wand"></i> IA</button>
                    <select value={selectedExerciseId} onChange={e => setSelectedExerciseId(e.target.value)} className={`flex-1 ${inputClass} rounded-lg p-2 text-xs`}><option value="">Selecione...</option>{filteredExercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}</select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <input value={sets} onChange={e => setSets(e.target.value)} placeholder="Séries" className={`${inputClass} rounded-lg p-2 text-xs`} />
                    <input value={reps} onChange={e => setReps(e.target.value)} placeholder="Reps / Tempo" className={`${inputClass} rounded-lg p-2 text-xs`} />
                </div>
                <div className="flex items-center gap-2"><input type="number" step="15" value={timerValue} onChange={e => setTimerValue(e.target.value)} placeholder="Tempo (s)" className={`w-full ${inputClass} rounded-lg p-2 text-xs`} /></div>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observações (opcional)" rows={2} className={`w-full ${inputClass} rounded-lg p-2 text-xs resize-none`} />
                <button onClick={handleAddExercise} disabled={!selectedExerciseId || !!generatingImgFor} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">{generatingImgFor ? <><i className="ph ph-spinner animate-spin"></i> Gerando...</> : 'Adicionar Exercício'}</button>
            </div>
            
            <div className="mt-auto space-y-2 pt-4 border-t border-zinc-800">
                 {/* If editing an existing template, show Update button */}
                 {editingTemplateId && (
                     <button
                        onClick={() => handleSaveTemplate('update')}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold text-sm transition-colors"
                     >
                        Atualizar Modelo Existente
                     </button>
                 )}

                 {/* Always show Save as New */}
                 <button
                    onClick={() => handleSaveTemplate('create')}
                    className={`w-full ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'} text-white py-3 rounded-lg font-bold text-sm transition-colors disabled:opacity-50`}
                 >
                    {editingTemplateId ? 'Salvar como Novo Modelo' : 'Salvar como Modelo'}
                 </button>

                 <button onClick={saveWorkoutToStudent} disabled={!selectedStudentUid || !workoutName || buildList.length === 0} className="w-full bg-emerald-500 hover:bg-emerald-500 text-white py-3 rounded-lg font-bold text-sm transition-colors disabled:opacity-50">{studentWorkoutExists ? 'Atualizar Treino' : 'Enviar para Aluno'}</button>
            </div>
        </div>

        <div className={`lg:col-span-2 ${cardClass} border rounded-xl p-6 overflow-y-auto relative`}>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold">{workoutName || 'Novo Treino'}</h2>
                 <span className={`${darkMode ? 'text-zinc-500' : 'text-zinc-400'} text-sm`}>{buildList.length} itens</span>
            </div>

            {/* Batch Actions Bar */}
            {selectedItemsForGrouping.length > 0 && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-zinc-800 border border-zinc-700 shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 z-50 animate-slide-up">
                    <span className="text-sm font-bold text-white whitespace-nowrap">{selectedItemsForGrouping.length} selecionados</span>
                    <div className="h-6 w-px bg-zinc-600"></div>
                    <button onClick={() => applyTechniqueToGroup('Agrupar')} className="text-emerald-400 hover:text-white text-xs font-bold flex flex-col items-center gap-1"><i className="ph-fill ph-link text-lg"></i> Agrupar</button>
                    <button onClick={() => applyTechniqueToGroup('Drop-set')} className="text-purple-400 hover:text-white text-xs font-bold flex flex-col items-center gap-1"><i className="ph-fill ph-trend-down text-lg"></i> Drop-set</button>
                    <button onClick={() => applyTechniqueToGroup('Rest-pause')} className="text-blue-400 hover:text-white text-xs font-bold flex flex-col items-center gap-1"><i className="ph-fill ph-timer text-lg"></i> Rest-P</button>
                    <button onClick={() => applyTechniqueToGroup('Slow')} className="text-yellow-400 hover:text-white text-xs font-bold flex flex-col items-center gap-1"><i className="ph-fill ph-tortoise text-lg"></i> Slow</button>
                    <div className="h-6 w-px bg-zinc-600"></div>
                    <button onClick={ungroupSelected} className="text-red-400 hover:text-white text-xs font-bold flex flex-col items-center gap-1"><i className="ph-fill ph-link-break text-lg"></i> Desagrupar</button>
                </div>
            )}
            
            {buildList.length === 0 ? (
                <div className={`h-64 flex flex-col items-center justify-center ${darkMode ? 'text-zinc-600' : 'text-zinc-400'} border-2 border-dashed ${darkMode ? 'border-zinc-800' : 'border-gray-200'} rounded-xl`}>
                    <i className="ph ph-barbell text-4xl mb-2"></i>
                    <p>Adicione exercícios para começar</p>
                </div>
            ) : (
                <div className="space-y-3 pb-20">
                    {buildList.map((item, idx) => {
                        const isHeader = item.type === 'header';
                        const isSelected = selectedItemsForGrouping.includes(item.id);
                        // Grouping Logic for visuals
                        const currentGroup = !isHeader && (item as WorkoutExercise).supersetGroup;
                        const prevGroup = idx > 0 && buildList[idx-1].type === 'exercise' && (buildList[idx-1] as WorkoutExercise).supersetGroup;
                        const isStartOfGroup = currentGroup && currentGroup !== prevGroup;
                        const isPartOfGroup = !!currentGroup;
                        
                        return (
                        <div key={item.id} className="group relative animate-fade-in flex gap-2">
                            {/* Checkbox for grouping (Only for exercises) */}
                            {!isHeader && (
                                <div className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        checked={isSelected}
                                        onChange={() => toggleSelection(item.id)}
                                        className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                                    />
                                </div>
                            )}

                            <div className="flex-1">
                                {isHeader ? (
                                    <div className={`${darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-gray-50 border-gray-200'} border-b p-3 mt-4 flex justify-between items-center`}>
                                        <h3 className="font-bold text-emerald-500">{item.label}</h3>
                                        <div className="flex gap-2">
                                            <button onClick={() => moveItem(idx, 'up')} disabled={idx === 0} className="text-zinc-500 hover:text-white disabled:opacity-30"><i className="ph ph-caret-up"></i></button>
                                            <button onClick={() => moveItem(idx, 'down')} disabled={idx === buildList.length - 1} className="text-zinc-500 hover:text-white disabled:opacity-30"><i className="ph ph-caret-down"></i></button>
                                            <button onClick={() => removeFromList(idx)} className="text-zinc-500 hover:text-red-500 ml-2"><i className="ph ph-trash"></i></button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`relative ${darkMode ? 'bg-zinc-800/50 border-zinc-800 hover:border-zinc-700' : 'bg-gray-50 border-gray-200 hover:border-emerald-200'} border p-3 rounded-lg flex justify-between items-center transition-all ${isSelected ? 'ring-2 ring-emerald-500/50 bg-emerald-900/10' : ''} ${isPartOfGroup ? 'border-l-4 border-l-indigo-500 rounded-l-sm' : ''}`}>
                                        
                                        {/* Group Connector Visuals */}
                                        {isStartOfGroup && (item as WorkoutExercise).technique && (
                                            <div className="absolute -top-3 left-0 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-t-md rounded-br-md shadow-sm z-10 uppercase tracking-wider">
                                                {(item as WorkoutExercise).technique}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3">
                                            {(item as WorkoutExercise).img && <img src={(item as WorkoutExercise).img} className="w-10 h-10 rounded bg-black object-cover border border-zinc-700" alt="" />}
                                            <div>
                                                <div className="font-bold">{(item as WorkoutExercise).exercise}</div>
                                                <div className="text-sm text-emerald-500">{(item as WorkoutExercise).displayString}</div>
                                                <div className="flex gap-2 mt-1 flex-wrap">
                                                    {(item as WorkoutExercise).notes && <div className={`text-xs ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{(item as WorkoutExercise).notes}</div>}
                                                    {(item as WorkoutExercise).timerValue && <div className="text-xs bg-emerald-500/10 text-emerald-400 px-1.5 rounded border border-emerald-500/20"><i className="ph-fill ph-timer"></i> {(item as WorkoutExercise).timerValue}s</div>}
                                                    {/* Individual Technique Tag if not grouped but has technique */}
                                                    {!(item as WorkoutExercise).supersetGroup && (item as WorkoutExercise).technique && (
                                                        <div className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 rounded border border-purple-500/30 uppercase">{(item as WorkoutExercise).technique}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="flex flex-col mr-2">
                                                <button onClick={() => moveItem(idx, 'up')} disabled={idx === 0} className="text-zinc-500 hover:text-white disabled:opacity-30"><i className="ph ph-caret-up"></i></button>
                                                <button onClick={() => moveItem(idx, 'down')} disabled={idx === buildList.length - 1} className="text-zinc-500 hover:text-white disabled:opacity-30"><i className="ph ph-caret-down"></i></button>
                                            </div>
                                            <button onClick={() => removeFromList(idx)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><i className="ph ph-trash-simple text-lg"></i></button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )})}
                </div>
            )}
        </div>
    </div>
  );
};

const ManageStudentTab = ({ students, setNotification, onEditWorkout, darkMode }: { students: User[], setNotification: (msg: string) => void, onEditWorkout: (sid: string, wid: string, items: WorkoutItem[]) => void, darkMode: boolean }) => {
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [studentWorkouts, setStudentWorkouts] = useState<any[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);

  const handleSelectStudent = async (student: User) => {
    setSelectedStudent(student);
    setLoadingWorkouts(true);
    try {
      const q = collection(db, 'users', student.uid, 'workouts');
      const snap = await getDocs(q);
      setStudentWorkouts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      setNotification("Erro ao carregar treinos.");
    } finally {
      setLoadingWorkouts(false);
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if(!selectedStudent) return;
    if(confirm(`Tem certeza que deseja excluir o treino "${workoutId}"?`)) {
        try {
            await deleteDoc(doc(db, 'users', selectedStudent.uid, 'workouts', workoutId));
            setStudentWorkouts(prev => prev.filter(w => w.id !== workoutId));
            setNotification("Treino excluído.");
        } catch(e) {
            setNotification("Erro ao excluir.");
        }
    }
  };

  const cardClass = darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm';
  const textSec = darkMode ? 'text-zinc-400' : 'text-zinc-500';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className={`lg:col-span-1 ${cardClass} border rounded-xl overflow-hidden flex flex-col h-[calc(100vh-140px)]`}>
          <div className="p-4 border-b border-zinc-800 font-bold">Alunos</div>
          <div className="overflow-y-auto flex-1">
              {students.map(student => (
                  <button 
                    key={student.uid} 
                    onClick={() => handleSelectStudent(student)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50 ${selectedStudent?.uid === student.uid ? 'bg-emerald-500/10' : ''}`}
                  >
                      <img src={student.avatar} className="w-10 h-10 rounded-full bg-zinc-800" alt="" />
                      <div className="text-left">
                          <div className={`font-medium ${selectedStudent?.uid === student.uid ? 'text-emerald-400' : (darkMode ? 'text-white' : 'text-zinc-900')}`}>{student.name}</div>
                          <div className="text-xs text-zinc-500">{student.email}</div>
                      </div>
                  </button>
              ))}
          </div>
      </div>

      <div className={`lg:col-span-2 ${cardClass} border rounded-xl p-6 h-[calc(100vh-140px)] overflow-y-auto`}>
          {!selectedStudent ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                  <i className="ph ph-user text-4xl mb-2"></i>
                  <p>Selecione um aluno para gerenciar</p>
              </div>
          ) : (
              <div>
                  <div className="flex items-center gap-4 mb-6 border-b border-zinc-800 pb-6">
                      <img src={selectedStudent.avatar} className="w-16 h-16 rounded-full border-2 border-emerald-500" alt="" />
                      <div>
                          <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                          <p className="text-zinc-500">{selectedStudent.email}</p>
                          <div className="flex gap-2 mt-2">
                             <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 capitalize">{selectedStudent.workoutType || 'Iniciante'}</span>
                             {selectedStudent.hasCompletedAnamnesis && <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">Anamnese OK</span>}
                          </div>
                      </div>
                  </div>

                  <h3 className="font-bold text-lg mb-4">Treinos Atribuídos</h3>
                  {loadingWorkouts ? (
                      <div className="text-emerald-500">Carregando treinos...</div>
                  ) : studentWorkouts.length === 0 ? (
                      <p className="text-zinc-500">Nenhum treino encontrado para este aluno.</p>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {studentWorkouts.map(workout => (
                              <div key={workout.id} className="bg-zinc-950/50 border border-zinc-800 p-4 rounded-lg hover:border-emerald-500/50 transition-colors">
                                  <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-bold text-white">{workout.id}</h4>
                                      <div className="flex gap-2">
                                          <button onClick={() => onEditWorkout(selectedStudent.uid, workout.id, workout.items)} className="text-blue-400 hover:text-blue-300 p-1"><i className="ph ph-pencil-simple"></i></button>
                                          <button onClick={() => handleDeleteWorkout(workout.id)} className="text-red-400 hover:text-red-300 p-1"><i className="ph ph-trash"></i></button>
                                      </div>
                                  </div>
                                  <p className="text-xs text-zinc-500">{workout.items?.length || 0} exercícios</p>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          )}
      </div>
    </div>
  );
};

const AssessmentTab = ({ students, setNotification, darkMode }: { students: User[], setNotification: (msg: string) => void, darkMode: boolean }) => {
    const [selectedStudentUid, setSelectedStudentUid] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    // Simple state for demonstration. In a real app, bind all fields.
    const [notes, setNotes] = useState('');

    const handleSave = async () => {
        if (!selectedStudentUid) { setNotification("Selecione um aluno."); return; }
        try {
            const assessmentData: AssessmentEntry = {
                id: `av_${Date.now()}`,
                date,
                anthropometry: {
                    weight: parseFloat(weight),
                    height: parseFloat(height),
                    bmi: (parseFloat(weight) / (parseFloat(height) * parseFloat(height))) || 0
                }
            };
            await addDoc(collection(db, 'users', selectedStudentUid, 'assessments'), assessmentData);
            setNotification("Avaliação salva com sucesso!");
            setWeight(''); setHeight(''); setNotes('');
        } catch (e) {
            console.error(e);
            setNotification("Erro ao salvar avaliação.");
        }
    };
    
    const inputClass = darkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-900';
    const cardClass = darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm';

    return (
        <div className={`max-w-2xl mx-auto ${cardClass} border rounded-xl p-8`}>
             <div className="space-y-4">
                 <div>
                     <label className="block text-sm font-medium mb-1 opacity-70">Aluno</label>
                     <select value={selectedStudentUid} onChange={e => setSelectedStudentUid(e.target.value)} className={`w-full ${inputClass} rounded-lg p-3 outline-none`}>
                         <option value="">Selecione...</option>
                         {students.map(s => <option key={s.uid} value={s.uid}>{s.name}</option>)}
                     </select>
                 </div>
                 <div>
                     <label className="block text-sm font-medium mb-1 opacity-70">Data</label>
                     <input type="date" value={date} onChange={e => setDate(e.target.value)} className={`w-full ${inputClass} rounded-lg p-3 outline-none`} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label className="block text-sm font-medium mb-1 opacity-70">Peso (kg)</label>
                         <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={`w-full ${inputClass} rounded-lg p-3 outline-none`} placeholder="0.00" />
                     </div>
                     <div>
                         <label className="block text-sm font-medium mb-1 opacity-70">Altura (m)</label>
                         <input type="number" value={height} onChange={e => setHeight(e.target.value)} className={`w-full ${inputClass} rounded-lg p-3 outline-none`} placeholder="0.00" />
                     </div>
                 </div>
                 <button onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg mt-4">
                     Salvar Avaliação
                 </button>
             </div>
        </div>
    );
};

const RunningTab = ({ students, setNotification, darkMode }: { students: User[], setNotification: (msg: string) => void, darkMode: boolean }) => {
    const [selectedStudentUid, setSelectedStudentUid] = useState('');
    const [planName, setPlanName] = useState('');
    const [weeks, setWeeks] = useState<number>(4);
    const [selectedTemplate, setSelectedTemplate] = useState<RunningPlan | null>(null);
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiGoal, setAiGoal] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    const handleCreatePlan = async () => {
        if (!selectedStudentUid || (!planName && !selectedTemplate)) { setNotification("Preencha os campos."); return; }
        
        let newPlan: RunningPlan;

        if (selectedTemplate) {
            // Use Template
            newPlan = {
                ...selectedTemplate,
                id: `plan_${Date.now()}`,
                name: planName || selectedTemplate.name
            };
        } else {
             // Create basic dummy structure
             newPlan = {
                id: `plan_${Date.now()}`,
                name: planName,
                weeks: Array.from({length: weeks}).map((_, i) => ({
                    id: `w_${i}`,
                    weekLabel: `Semana ${i+1}`,
                    days: {}
                }))
            };
        }

        try {
            await setDoc(doc(db, 'users', selectedStudentUid, 'runningPlans', newPlan.id), newPlan, {});
            setNotification("Plano de corrida criado!");
            setPlanName('');
            setSelectedTemplate(null);
        } catch (e) {
            console.error(e);
            setNotification("Erro ao criar plano.");
        }
    };

    const generateAiPlan = async () => {
        if (!aiGoal) return;
        setIsAiLoading(true);
        try {
             const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
             const prompt = `Crie uma planilha de corrida completa de 4 semanas para o objetivo: "${aiGoal}". Retorne APENAS um JSON seguindo estritamente esta estrutura: { "name": "Nome do Plano", "weeks": [ { "id": "w1", "weekLabel": "Semana 1", "days": { "monday": { "type": "Trote", "warmup": "5min", "main": "30min leve", "cooldown": "5min" }, "wednesday": ..., "saturday": ... } } ] }. Use 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' como chaves dos dias. O objeto do dia deve ter type, warmup, main, cooldown, zone.`;
             
             const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt,
                config: { responseMimeType: "application/json" }
             });

             if (response.text) {
                 const generatedPlan = JSON.parse(response.text);
                 setSelectedTemplate({ ...generatedPlan, id: 'ai_generated' });
                 setPlanName(generatedPlan.name);
                 setShowAiModal(false);
                 setNotification("Plano gerado com sucesso! Revise e salve.");
             }
        } catch (e) {
            console.error(e);
            setNotification("Erro ao gerar plano com IA.");
        } finally {
            setIsAiLoading(false);
        }
    };
    
    const inputClass = darkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-900';
    const cardClass = darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
            {/* AI Modal */}
            {showAiModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className={`${cardClass} border rounded-xl p-6 w-full max-w-md`}>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-500"><i className="ph-fill ph-magic-wand"></i> Gerador IA</h3>
                        <p className="text-sm text-zinc-400 mb-4">Descreva o objetivo do aluno (ex: "Correr 5km em 25min", "Maratona sub 4h", "Começar a correr do zero").</p>
                        <textarea 
                            value={aiGoal} 
                            onChange={e => setAiGoal(e.target.value)} 
                            className={`w-full ${inputClass} rounded-lg p-3 text-sm h-32 resize-none mb-4`} 
                            placeholder="Ex: Treino para meia maratona focado em velocidade..."
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setShowAiModal(false)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-lg">Cancelar</button>
                            <button onClick={generateAiPlan} disabled={isAiLoading || !aiGoal} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg disabled:opacity-50 flex justify-center items-center gap-2">
                                {isAiLoading ? <><i className="ph ph-spinner animate-spin"></i> Gerando...</> : 'Gerar Plano'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`${cardClass} border rounded-xl p-8`}>
                <h3 className="text-xl font-bold mb-6">Criar / Atribuir Plano</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 opacity-70">Aluno</label>
                        <select value={selectedStudentUid} onChange={e => setSelectedStudentUid(e.target.value)} className={`w-full ${inputClass} rounded-lg p-3 outline-none`}>
                            <option value="">Selecione...</option>
                            {students.map(s => <option key={s.uid} value={s.uid}>{s.name}</option>)}
                        </select>
                    </div>

                    <div className="p-4 border border-zinc-700 rounded-xl bg-zinc-950/30">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium opacity-70">Usar Modelo (Opcional)</label>
                            <button onClick={() => setShowAiModal(true)} className="text-xs bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 px-2 py-1 rounded border border-emerald-500/20 flex items-center gap-1 font-bold transition-colors">
                                <i className="ph-fill ph-magic-wand"></i> Gerar com IA
                            </button>
                        </div>
                        <select 
                            value={selectedTemplate ? selectedTemplate.id : ""} 
                            onChange={e => {
                                const t = SEED_RUNNING_PLANS.find(p => p.id === e.target.value);
                                setSelectedTemplate(t || null);
                                if (t) setPlanName(t.name);
                            }} 
                            className={`w-full ${inputClass} rounded-lg p-3 outline-none`}
                        >
                            <option value="">Nenhum (Criar do zero)</option>
                            {selectedTemplate?.id === 'ai_generated' && <option value="ai_generated">✨ Plano Gerado por IA</option>}
                            {SEED_RUNNING_PLANS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 opacity-70">Nome do Plano</label>
                        <input value={planName} onChange={e => setPlanName(e.target.value)} className={`w-full ${inputClass} rounded-lg p-3 outline-none`} placeholder="Ex: Meia Maratona" />
                    </div>
                    
                    {!selectedTemplate && (
                        <div>
                            <label className="block text-sm font-medium mb-1 opacity-70">Duração (Semanas)</label>
                            <input type="number" value={weeks} onChange={e => setWeeks(Number(e.target.value))} className={`w-full ${inputClass} rounded-lg p-3 outline-none`} min="1" max="24" />
                        </div>
                    )}

                    <button onClick={handleCreatePlan} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg mt-4 shadow-lg shadow-emerald-900/20">
                        {selectedTemplate ? 'Atribuir Plano ao Aluno' : 'Criar Estrutura Vazia'}
                    </button>
                </div>
            </div>

            <div className={`${cardClass} border rounded-xl p-8 overflow-y-auto`}>
                <h3 className="text-xl font-bold mb-4">Sugestões de Treinos</h3>
                <p className="text-sm opacity-60 mb-6">Copie e cole estas estruturas ao editar os dias do plano.</p>
                <div className="space-y-3">
                    {RUNNING_PROTOCOLS.map((proto, i) => (
                        <div key={i} className={`p-4 rounded-lg border ${darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-gray-50 border-gray-200'} text-sm`}>
                            <div className="flex justify-between mb-1">
                                <span className="font-bold text-emerald-500">{proto.type}</span>
                                <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">{proto.zone}</span>
                            </div>
                            <div className="grid grid-cols-1 gap-1 opacity-80">
                                <div><span className="text-xs uppercase tracking-wider opacity-50">Aquecimento:</span> {proto.warmup}</div>
                                <div><span className="text-xs uppercase tracking-wider opacity-50">Principal:</span> {proto.main}</div>
                                <div><span className="text-xs uppercase tracking-wider opacity-50">Desaquecimento:</span> {proto.cooldown}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}