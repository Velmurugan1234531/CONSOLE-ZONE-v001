import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim(),
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim(),
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim()
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Debug Log for Cloud Environment Verification
if (typeof window !== "undefined") {
    console.log("🚀 Firebase Initialized:", {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain,
        hasApiKey: !!firebaseConfig.apiKey
    });
}

// Initialize Analytics conditionally (only in client-side)
const analytics = typeof window !== "undefined"
    ? isSupported().then((yes) => (yes ? getAnalytics(app) : null))
    : null;

export { app, auth, analytics };
