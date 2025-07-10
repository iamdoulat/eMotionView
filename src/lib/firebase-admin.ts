
import { config } from 'dotenv';
config();

import * as admin from 'firebase-admin';

export const initializeAdminApp = () => {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
    const projectId = serviceAccount.project_id;

    return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${projectId}.appspot.com`,
    });
};
