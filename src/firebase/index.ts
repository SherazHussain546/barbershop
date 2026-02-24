'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return {
      firebaseApp: null as any,
      auth: null as any,
      firestore: null as any
    };
  }

  if (!getApps().length) {
    let firebaseApp;
    const isConfigValid = !!firebaseConfig.apiKey;

    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      firebaseApp = initializeApp();
    } catch (e) {
      if (isConfigValid) {
        firebaseApp = initializeApp(firebaseConfig);
      } else {
        // Return null SDKs to avoid immediate crash, hooks will handle the null case during SSR
        return {
          firebaseApp: null as any,
          auth: null as any,
          firestore: null as any
        };
      }
    }

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  if (!firebaseApp) {
    return {
      firebaseApp: null as any,
      auth: null as any,
      firestore: null as any
    };
  }
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';