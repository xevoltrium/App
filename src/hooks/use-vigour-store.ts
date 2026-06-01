
'use client';

import { useMemo } from 'react';
import { doc, setDoc, updateDoc, deleteDoc, collection, query, orderBy } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useUser, useFirestore, useAuth, useDoc, useCollection } from '@/firebase';
import { UserProfile, WorkoutPlan } from '@/lib/types';

export function useVigourStore() {
  const { user: authUser, loading: authLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();

  // Profile Doc
  const profileRef = useMemo(() => 
    (db && authUser) ? doc(db, 'users', authUser.uid) : null
  , [db, authUser]);
  
  const { data: profile, loading: profileLoading } = useDoc<UserProfile>(profileRef as any);

  // Plans Collection
  const plansQuery = useMemo(() => 
    (db && authUser) ? query(collection(db, 'users', authUser.uid, 'plans'), orderBy('createdAt', 'desc')) : null
  , [db, authUser]);

  const { data: plans, loading: plansLoading } = useCollection<WorkoutPlan>(plansQuery as any);

  const loginWithGoogle = async () => {
    if (!auth) return;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error", error);
    }
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  const saveUser = async (profileData: UserProfile) => {
    if (!profileRef) return;
    await setDoc(profileRef, {
      ...profileData,
      updatedAt: Date.now()
    }, { merge: true });
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!profileRef) return;
    await updateDoc(profileRef, updates);
  };

  const savePlan = async (plan: WorkoutPlan) => {
    if (!db || !authUser) return;
    const planRef = doc(collection(db, 'users', authUser.uid, 'plans'), plan.id);
    await setDoc(planRef, {
      ...plan,
      userId: authUser.uid,
      createdAt: Date.now()
    });
  };

  const deletePlan = async (planId: string) => {
    if (!db || !authUser) return;
    const planRef = doc(db, 'users', authUser.uid, 'plans', planId);
    await deleteDoc(planRef);
  };

  const markWorkoutComplete = async (planId: string, dayIndex: number) => {
    if (!db || !authUser || !plans) return;
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const updatedDaily = [...plan.dailyWorkouts];
    updatedDaily[dayIndex] = { ...updatedDaily[dayIndex], isCompleted: true };
    
    const planRef = doc(db, 'users', authUser.uid, 'plans', planId);
    await updateDoc(planRef, { dailyWorkouts: updatedDaily });
  };

  return {
    user: profile,
    authUser,
    plans: plans || [],
    loading: authLoading || profileLoading || plansLoading,
    saveUser,
    updateUser,
    savePlan,
    deletePlan,
    loginWithGoogle,
    logout,
    markWorkoutComplete
  };
}
