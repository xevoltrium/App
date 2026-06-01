
'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProfile, WorkoutPlan } from '@/lib/types';

const USERS_KEY = 'vigour_users_v1';
const CURRENT_USER_KEY = 'vigour_active_session';

interface LocalUser {
  nickname: string;
  passwordHash: string;
  profile: UserProfile;
  plans: WorkoutPlan[];
}

export function useVigourStore() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    const session = localStorage.getItem(CURRENT_USER_KEY);
    if (session) {
      setCurrentUser(session);
      loadUserData(session);
    }
    setLoading(false);
  }, []);

  const loadUserData = (nickname: string) => {
    const allUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    const userData = allUsers[nickname.toLowerCase()];
    if (userData) {
      setUserProfile(userData.profile);
      setPlans(userData.plans || []);
    }
  };

  const saveToDisk = (nickname: string, profile: UserProfile, updatedPlans: WorkoutPlan[]) => {
    const allUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    allUsers[nickname.toLowerCase()] = {
      ...allUsers[nickname.toLowerCase()],
      profile,
      plans: updatedPlans
    };
    localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
  };

  const loginWithNickname = async (nickname: string, pass: string) => {
    const cleanNick = nickname.trim().toLowerCase();
    const allUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    
    if (allUsers[cleanNick]) {
      // Existing user: check password (simple mock)
      if (allUsers[cleanNick].passwordHash !== pass) {
        throw new Error("Falsches Passwort für diesen Nickname.");
      }
    } else {
      // New user: Create
      const newProfile: UserProfile = {
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
        profile: newProfile,
        plans: []
      };
      localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
    }

    localStorage.setItem(CURRENT_USER_KEY, cleanNick);
    setCurrentUser(cleanNick);
    loadUserData(cleanNick);
  };

  const logout = async () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
    setUserProfile(null);
    setPlans([]);
  };

  const saveUser = async (profileData: UserProfile) => {
    if (!currentUser) return;
    setUserProfile(profileData);
    saveToDisk(currentUser, profileData, plans);
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) return;
    const updated = { ...userProfile, ...updates };
    setUserProfile(updated);
    saveToDisk(currentUser, updated, plans);
  };

  const savePlan = async (plan: WorkoutPlan) => {
    if (!currentUser || !userProfile) return;
    const updatedPlans = [plan, ...plans];
    setPlans(updatedPlans);
    saveToDisk(currentUser, userProfile, updatedPlans);
  };

  const deletePlan = async (planId: string) => {
    if (!currentUser || !userProfile) return;
    const updatedPlans = plans.filter(p => p.id !== planId);
    setPlans(updatedPlans);
    saveToDisk(currentUser, userProfile, updatedPlans);
  };

  const markWorkoutComplete = async (planId: string, dayIndex: number) => {
    if (!currentUser || !userProfile) return;
    const updatedPlans = plans.map(p => {
      if (p.id === planId) {
        const daily = [...p.dailyWorkouts];
        daily[dayIndex] = { ...daily[dayIndex], isCompleted: true };
        return { ...p, dailyWorkouts: daily };
      }
      return p;
    });
    setPlans(updatedPlans);
    saveToDisk(currentUser, userProfile, updatedPlans);
  };

  return {
    user: userProfile,
    authUser: currentUser ? { uid: currentUser, displayName: currentUser } : null,
    plans,
    loading,
    saveUser,
    updateUser,
    savePlan,
    deletePlan,
    loginWithNickname,
    logout,
    markWorkoutComplete
  };
}
