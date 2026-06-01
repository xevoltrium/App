"use client"

import { useState, useEffect } from 'react';
import { UserProfile, WorkoutPlan } from '@/lib/types';

const STORAGE_KEY_USER = 'vigour_user_profile';
const STORAGE_KEY_PLANS = 'vigour_workout_plans';

export function useVigourStore() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    const savedPlans = localStorage.getItem(STORAGE_KEY_PLANS);

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedPlans) {
      setPlans(JSON.parse(savedPlans));
    }
    setLoading(false);
  }, []);

  const saveUser = (newUser: UserProfile) => {
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
  };

  const savePlans = (newPlans: WorkoutPlan[]) => {
    setPlans(newPlans);
    localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(newPlans));
  };

  const deletePlan = (planId: string) => {
    const updated = plans.filter(p => p.id !== planId);
    savePlans(updated);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_PLANS);
    setUser(null);
    setPlans([]);
  };

  const markWorkoutComplete = (planId: string, dayIndex: number) => {
    const updatedPlans = plans.map(p => {
      if (p.id === planId) {
        const updatedDaily = [...p.dailyWorkouts];
        updatedDaily[dayIndex] = { ...updatedDaily[dayIndex], isCompleted: true };
        return { ...p, dailyWorkouts: updatedDaily };
      }
      return p;
    });
    savePlans(updatedPlans);
  };

  return {
    user,
    plans,
    loading,
    saveUser,
    savePlans,
    deletePlan,
    logout,
    markWorkoutComplete
  };
}
