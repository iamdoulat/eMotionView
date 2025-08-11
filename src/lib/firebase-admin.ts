
import * as admin from 'firebase-admin';

// Directly use process.env and provide a fallback to avoid parsing undefined
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}';

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    // Check if the service account has the necessary properties before initializing
    if (serviceAccount.project_id) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } else {
        console.warn("Firebase Admin SDK service account key is missing or invalid. Skipping initialization.");
    }
  } catch (error) {
      console.error("Error parsing Firebase Admin SDK service account key:", error);
  }
}

export const auth = admin.apps.length > 0 ? admin.auth() : {} as admin.auth.Auth;
export const dbAdmin = admin.apps.length > 0 ? admin.firestore() : {} as admin.firestore.Firestore;
