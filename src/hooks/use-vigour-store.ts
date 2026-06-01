'use client';

import { useState, useEffect } from 'react';
import { UserProfile, WorkoutPlan } from '@/lib/types';

const USERS_KEY = 'vigour_users_local_v3';
const CURRENT_USER_KEY = 'vigour_active_nick_v3';

// Shared state Singleton to prevent multiple stores fighting
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
    
    // Initial data hydration from localStorage
    if (globalState.loading) {
      try {
        const sessionNick = localStorage.getItem(CURRENT_USER_KEY);
        if (sessionNick) {
          const cleanNick = sessionNick.toLowerCase();
          const allData = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
          const userData = allData[cleanNick];
          
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
        console.error("Store loading error:", e);
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
      const allData = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
      allData[nickname.toLowerCase()] = {
        ...allData[nickname.toLowerCase()],
        profile,
        plans: updatedPlans
      };
      localStorage.setItem(USERS_KEY, JSON.stringify(allData));
    } catch (e) {
      console.error("Store save error:", e);
    }
  };

  const loginWithNickname = async (nickname: string, pass: string) => {
    const cleanNick = nickname.trim().toLowerCase();
    if (!cleanNick || !pass) throw new Error("Bitte Namen und Passwort eingeben.");

    const allData = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    
    let profile: UserProfile;
    let userPlans: WorkoutPlan[] = [];

    if (allData[cleanNick]) {
      if (allData[cleanNick].passwordHash !== pass) {
        throw new Error("Passwort ist nicht korrekt.");
      }
      profile = allData[cleanNick].profile;
      userPlans = allData[cleanNick].plans || [];
    } else {
      // Create new local user
      profile = {
        name: nickname,
        fitnessGoal: 'Allgemeine Fitness',
        bmiLevel: 'normal',
        availableEquipment: [],
        isBoarded: false,
        role: nickname.toLowerCase().includes('admin') ? 'admin' : 'user'
      };
      allData[cleanNick] = {
        nickname,
        passwordHash: pass,
        profile,
        plans: []
      };
      localStorage.setItem(USERS_KEY, JSON.stringify(allData));
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

  const logout = () => {
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

  return {
    user: state.userProfile,
    authUser: state.currentUser ? { uid: state.currentUser, displayName: state.currentUser } : null,
    plans: state.plans,
    loading: state.loading,
    saveUser,
    updateUser,
    savePlan,
    loginWithNickname,
    logout,
    markWorkoutComplete
  };
}
