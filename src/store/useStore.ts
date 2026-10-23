import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type Priority = 'URGENT' | 'PRIORITY' | 'ROUTINE';

export interface Patient {
  id: string;
  name?: string;
  age?: string;
  phone?: string;
  priority: Priority;
  priorityScore: number;
  complaint: string;
  arrivalTime: string;
  status: 'WAITING' | 'BEING_SEEN' | 'COMPLETED';
  aiConfidence: 'Low' | 'Moderate' | 'High';
  missingInfo: string[];
  keyAnswers: string[];
  contradictions: string[];
  aiNotes: string;
}

interface AppState {
  patients: Patient[];
  userRole: 'ADMIN' | 'DOCTOR' | null;
  isLoading: boolean;
  setUserRole: (role: 'ADMIN' | 'DOCTOR' | null) => void;
  fetchPatients: () => Promise<void>;
  addPatient: (patient: Patient) => Promise<void>;
  updatePatientStatus: (id: string, status: Patient['status']) => Promise<void>;
  updatePatientPriority: (id: string, priority: Priority) => Promise<void>;
  subscribeToPatients: () => (() => void);
}

// Convert DB snake_case to frontend camelCase
const mapPatientFromDB = (dbPatient: any): Patient => ({
  id: dbPatient.id,
  name: dbPatient.name || undefined,
  age: dbPatient.age || undefined,
  phone: dbPatient.phone || undefined,
  priority: dbPatient.priority,
  priorityScore: dbPatient.priority_score,
  complaint: dbPatient.complaint,
  arrivalTime: dbPatient.arrival_time,
  status: dbPatient.status,
  aiConfidence: dbPatient.ai_confidence,
  missingInfo: dbPatient.missing_info || [],
  keyAnswers: dbPatient.key_answers || [],
  contradictions: dbPatient.contradictions || [],
  aiNotes: dbPatient.ai_notes,
});

export const useStore = create<AppState>()((set, get) => ({
  patients: [],
  userRole: null,
  isLoading: true,
  
  setUserRole: (role) => set({ userRole: role }),

  fetchPatients: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('arrival_time', { ascending: true });
      
    if (error) {
      console.error('Error fetching patients:', error);
    } else if (data) {
      set({ patients: data.map(mapPatientFromDB) });
    }
    set({ isLoading: false });
  },

  addPatient: async (patient) => {
    // Optimistic update
    set((state) => ({ patients: [...state.patients, patient] }));
    
    const dbPatient = {
      id: patient.id,
      name: patient.name,
      age: patient.age,
      phone: patient.phone,
      priority: patient.priority,
      priority_score: patient.priorityScore,
      complaint: patient.complaint,
      arrival_time: patient.arrivalTime,
      status: patient.status,
      ai_confidence: patient.aiConfidence,
      missing_info: patient.missingInfo,
      key_answers: patient.keyAnswers,
      contradictions: patient.contradictions,
      ai_notes: patient.aiNotes,
    };
    
    const { error } = await supabase.from('patients').insert(dbPatient);
    if (error) {
      console.error('Error adding patient:', error);
      // Revert if error
      get().fetchPatients();
    }
  },

  updatePatientStatus: async (id, status) => {
    // Optimistic update
    set((state) => ({
      patients: state.patients.map(p => p.id === id ? { ...p, status } : p)
    }));
    
    const { error } = await supabase
      .from('patients')
      .update({ status })
      .eq('id', id);
      
    if (error) {
      console.error('Error updating patient status:', error);
      get().fetchPatients();
    }
  },

  updatePatientPriority: async (id, priority) => {
    // Optimistic update
    set((state) => ({
      patients: state.patients.map(p => p.id === id ? { ...p, priority } : p)
    }));
    
    const { error } = await supabase
      .from('patients')
      .update({ priority })
      .eq('id', id);
      
    if (error) {
      console.error('Error updating patient priority:', error);
      get().fetchPatients();
    }
  },

  subscribeToPatients: () => {
    const channel = supabase
      .channel('patients_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'patients' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
             const newPatient = mapPatientFromDB(payload.new);
             set((state) => {
                if (state.patients.some(p => p.id === newPatient.id)) return state;
                return { patients: [...state.patients, newPatient] };
             });
          } else if (payload.eventType === 'UPDATE') {
             const updated = mapPatientFromDB(payload.new);
             set((state) => ({
               patients: state.patients.map(p => p.id === updated.id ? updated : p)
             }));
          } else if (payload.eventType === 'DELETE') {
             set((state) => ({
               patients: state.patients.filter(p => p.id !== payload.old.id)
             }));
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }
}));
