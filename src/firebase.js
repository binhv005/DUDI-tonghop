// Firebase Configuration and Firestore Realtime Service for DUDI Leads Center
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';

const FIREBASE_CONFIG_STORAGE_KEY = 'dudi_firebase_custom_config_v1';

// Default / Environment Firebase Config
export const getActiveFirebaseConfig = () => {
  try {
    const savedCustom = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (savedCustom) {
      const parsed = JSON.parse(savedCustom);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading custom firebase config', e);
  }

  // Fallback to Vite Environment Variables or project config
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBv2l4OH6dtaBqCx5D_rxtDT2HkMPfZ3kA',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'dudi-leads.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'dudi-leads',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'dudi-leads.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '229246187028',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:229246187028:web:b47ba4d17c6f8dc6d11901'
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig;
  }

  return null;
};

// Check if Firebase is ready and configured
export const isFirebaseConfigured = () => {
  const config = getActiveFirebaseConfig();
  return Boolean(config && config.apiKey && config.projectId);
};

// Initialize Firebase App & Firestore
let app = null;
let db = null;

export const initFirebase = (customConfig = null) => {
  const config = customConfig || getActiveFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    app = getApps().length === 0 ? initializeApp(config) : getApp();
    db = getFirestore(app);
    return db;
  } catch (err) {
    console.error('Failed to initialize Firebase:', err);
    return null;
  }
};

// Get Firestore DB instance
export const getDb = () => {
  if (!db) {
    initFirebase();
  }
  return db;
};

// Save custom Firebase config from UI Modal
export const saveCustomFirebaseConfig = (config) => {
  if (!config) {
    localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
    return;
  }
  localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
  initFirebase(config);
};

// ================= FIRESTORE CRUD & REALTIME HELPERS =================

/**
 * Realtime subscribe to leads collection
 * @param {Function} onLeadsReceived - Callback when leads data updates
 * @param {Function} onError - Callback when error occurs
 * @returns {Function} Unsubscribe function
 */
export const subscribeToLeads = (onLeadsReceived, onError) => {
  const firestoreDb = getDb();
  if (!firestoreDb) {
    return () => {};
  }

  try {
    const leadsRef = collection(firestoreDb, 'leads');

    const unsubscribe = onSnapshot(
      leadsRef,
      (snapshot) => {
        const leadsData = [];
        snapshot.forEach((docSnap) => {
          leadsData.push({
            id: docSnap.id,
            ...docSnap.data()
          });
        });
        // Sort newest first in JS safely
        leadsData.sort((a, b) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });
        onLeadsReceived(leadsData);
      },
      (error) => {
        console.error('Firestore onSnapshot error:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('Failed to subscribe to Firestore leads:', err);
    if (onError) onError(err);
    return () => {};
  }
};

/**
 * Add a new lead to Firebase Firestore
 */
export const addLeadToFirebase = async (leadData) => {
  const firestoreDb = getDb();
  if (!firestoreDb) {
    throw new Error('Firebase chưa được cấu hình');
  }

  const docId = leadData.id || `FORM-${Math.floor(1000 + Math.random() * 9000)}`;
  const leadDocRef = doc(firestoreDb, 'leads', docId);

  const payload = {
    ...leadData,
    id: docId,
    createdAt: leadData.createdAt || new Date().toISOString(),
    serverTimestamp: serverTimestamp()
  };

  await setDoc(leadDocRef, payload, { merge: true });
  return payload;
};

/**
 * Update lead status in Firebase Firestore
 */
export const updateLeadStatusInFirebase = async (leadId, newStatus, noteText) => {
  const firestoreDb = getDb();
  if (!firestoreDb) return;

  const leadDocRef = doc(firestoreDb, 'leads', leadId);
  const updateData = {
    status: newStatus,
    updatedAt: new Date().toISOString()
  };

  if (noteText) {
    updateData.notes = arrayUnion({
      id: Date.now(),
      author: 'Quản trị viên',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      text: noteText
    });
  }

  await updateDoc(leadDocRef, updateData);
};

/**
 * Update lead assignee in Firebase Firestore
 */
export const updateLeadAssigneeInFirebase = async (leadId, assigneeName) => {
  const firestoreDb = getDb();
  if (!firestoreDb) return;

  const leadDocRef = doc(firestoreDb, 'leads', leadId);
  await updateDoc(leadDocRef, {
    assignedTo: assigneeName,
    updatedAt: new Date().toISOString()
  });
};

/**
 * Add internal note to lead in Firebase Firestore
 */
export const addNoteToFirebaseLead = async (leadId, noteObj) => {
  const firestoreDb = getDb();
  if (!firestoreDb) return;

  const leadDocRef = doc(firestoreDb, 'leads', leadId);
  await updateDoc(leadDocRef, {
    notes: arrayUnion(noteObj),
    updatedAt: new Date().toISOString()
  });
};

/**
 * Delete a lead from Firebase Firestore
 */
export const deleteLeadFromFirebase = async (leadId) => {
  const firestoreDb = getDb();
  if (!firestoreDb) return;

  const leadDocRef = doc(firestoreDb, 'leads', leadId);
  await deleteDoc(leadDocRef);
};
