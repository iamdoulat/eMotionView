
import * as admin from 'firebase-admin';

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!admin.apps.length && serviceAccountKey) {
  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Error parsing Firebase Admin SDK service account key:', error);
  }
}

const auth = admin.apps.length > 0 ? admin.auth() : ({} as admin.auth.Auth);
const dbAdmin = admin.apps.length > 0 ? admin.firestore() : ({} as admin.firestore.Firestore);

export { auth, dbAdmin };
