import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, signInAnonymously, type User } from "firebase/auth";
import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isConfigured = Boolean(config.apiKey && config.projectId && config.appId);
const app = isConfigured ? (getApps().length ? getApp() : initializeApp(config)) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

let anonymousUserPromise: Promise<User> | null = null;

async function getAnonymousUser(): Promise<User> {
  if (!auth) throw new Error("Firebase is not configured. Add the VITE_FIREBASE_* values to your .env file.");
  if (auth.currentUser) return auth.currentUser;
  if (!anonymousUserPromise) {
    anonymousUserPromise = signInAnonymously(auth).then((credential) => credential.user).catch((error) => {
      anonymousUserPromise = null;
      throw error;
    });
  }
  return anonymousUserPromise;
}

export type SavedAssessment = {
  sport: string;
  filename?: string;
  status: string;
  talent_score?: number;
  assessment?: string;
  report?: unknown;
  actionable_feedback?: string[];
  feedback?: string[];
  error?: string;
};

/** Saves the analysis summary/report, not the raw video. Video files remain on the API's temporary disk. */
export async function saveAssessment(result: SavedAssessment): Promise<string | null> {
  if (!isConfigured || !db || !auth) return null;
  const user = await getAnonymousUser();
  const docRef = await addDoc(collection(db, "assessments"), {
    ...result,
    userId: user.uid,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export function firebaseIsConfigured(): boolean {
  return isConfigured;
}
