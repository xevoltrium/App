
'use client';

import { useState, useEffect } from 'react';
import { UserProfile, WorkoutPlan } from '@/lib/types';

const USERS_KEY = 'vigour_users_v1';
const CURRENT_USER_KEY = 'vigour_active_session';

// Globaler Status, der über alle Instanzen des Hooks geteilt wird
interface StoreState {
  currentUser: string | null;
  userProfile: UserProfile | null;
  plans: WorkoutPlan[];
  loading: boolean;
}

let globalState: StoreState = {
  currentUser: null,
  userProfile: null,
  plans: [],
  loading: true
};

const listeners = new Set<(s: StoreState) => void>();

function notify() {
  const stateCopy = { ...globalState };
  listeners.forEach(l => l(stateCopy));
}

export function useVigourStore() {
  const [state, setState] = useState<StoreState>(globalState);

  useEffect(() => {
    const listener = (s: StoreState) => setState(s);
    listeners.add(listener);
    
    // Initialer Ladevorgang aus dem localStorage beim ersten Mounten
    if (globalState.loading) {
      try {
        const session = localStorage.getItem(CURRENT_USER_KEY);
        if (session) {
          const cleanNick = session.toLowerCase();
          const allUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
          const userData = allUsers[cleanNick];
          
          if (userData) {
            globalState = {
              ...globalState,
              currentUser: cleanNick,
              userProfile: userData.profile,
              plans: userData.plans || [],
              loading: false
            };
          } else {
            globalState.loading = false;
          }
        } else {
          globalState.loading = false;
        }
      } catch (e) {
        console.error("Fehler beim Laden der Daten:", e);
        globalState.loading = false;
      }
      notify();
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const saveToDisk = (nickname: string, profile: UserProfile, updatedPlans: WorkoutPlan[]) => {
    try {
      const allUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
      if (!allUsers[nickname.toLowerCase()]) return;
      
      allUsers[nickname.toLowerCase()] = {
        ...allUsers[nickname.toLowerCase()],
        profile,
        plans: updatedPlans
      };
      localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
    } catch (e) {
      console.error("Fehler beim Speichern auf Disk:", e);
    }
  };

  const loginWithNickname = async (nickname: string, pass: string) => {
    const cleanNick = nickname.trim().toLowerCase();
    const allUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    
    let profile: UserProfile;
    let userPlans: WorkoutPlan[] = [];

    if (allUsers[cleanNick]) {
      if (allUsers[cleanNick].passwordHash !== pass) {
        throw new Error("Falsches Passwort für diesen Nickname.");
      }
      profile = allUsers[cleanNick].profile;
      userPlans = allUsers[cleanNick].plans || [];
    } else {
      profile = {
        name: nickname,
        fitnessGoal: 'schlank werden',
        bmiLevel: 'normal',
        availableEquipment: [],
        isBoarded: false,
        role: nickname.toLowerCase() === 'admin' ? 'admin' : 'user'
      };
      allUsers[cleanNick] = {
        nickname,
        passwordHash: pass,
        profile,
        plans: []
      };
      localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
    }

    localStorage.setItem(CURRENT_USER_KEY, cleanNick);
    
    globalState = {
      ...globalState,
      currentUser: cleanNick,
      userProfile: profile,
      plans: userPlans,
      loading: false
    };
    notify();
  };

  const logout = async () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    globalState = {
      currentUser: null,
      userProfile: null,
      plans: [],
      loading: false
    };
    notify();
  };

  const saveUser = async (profileData: UserProfile) => {
    if (!globalState.currentUser) return;
    globalState.userProfile = profileData;
    saveToDisk(globalState.currentUser, profileData, globalState.plans);
    notify();
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!globalState.currentUser || !globalState.userProfile) return;
    const updated = { ...globalState.userProfile, ...updates };
    globalState.userProfile = updated;
    saveToDisk(globalState.currentUser, updated, globalState.plans);
    notify();
  };

  const savePlan = async (plan: WorkoutPlan) => {
    if (!globalState.currentUser || !globalState.userProfile) return;
    const updatedPlans = [plan, ...globalState.plans];
    globalState.plans = updatedPlans;
    saveToDisk(globalState.currentUser, globalState.userProfile, updatedPlans);
    notify();
  };

  const deletePlan = async (planId: string) => {
    if (!globalState.currentUser || !globalState.userProfile) return;
    const updatedPlans = globalState.plans.filter(p => p.id !== planId);
    globalState.plans = updatedPlans;
    saveToDisk(globalState.currentUser, globalState.userProfile, updatedPlans);
    notify();
  };

  const markWorkoutComplete = async (planId: string, dayIndex: number) => {
    if (!globalState.currentUser || !globalState.userProfile) return;
    const updatedPlans = globalState.plans.map(p => {
      if (p.id === planId) {
        const daily = [...p.dailyWorkouts];
        daily[dayIndex] = { ...daily[dayIndex], isCompleted: true };
        return { ...p, dailyWorkouts: daily };
      }
      return p;
    });
    globalState.plans = updatedPlans;
    saveToDisk(globalState.currentUser, globalState.userProfile, updatedPlans);
    notify();
  };

  const adminUpdatePlans = (updatedPlans: WorkoutPlan[]) => {
    if (!globalState.currentUser || !globalState.userProfile) return;
    globalState.plans = updatedPlans;
    saveToDisk(globalState.currentUser, globalState.userProfile, updatedPlans);
    notify();
  };

  return {
    user: state.userProfile,
    authUser: state.currentUser ? { uid: state.currentUser, displayName: state.currentUser } : null,
    plans: state.plans,
    loading: state.loading,
    saveUser,
    updateUser,
    savePlan,
    deletePlan,
    loginWithNickname,
    logout,
    markWorkoutComplete,
    adminUpdatePlans
  };
}
