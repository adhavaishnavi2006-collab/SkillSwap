/**
 * Server-Side Firebase Admin Role Assignment Script
 * 
 * Securely assigns the Admin custom claim { admin: true } to a specific Firebase Authentication user
 * and registers their UID in the Firestore /admins collection.
 *
 * Usage:
 *   node scripts/setAdminRole.js [optional_email]
 *   npm run set-admin
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Target Admin Email
const TARGET_ADMIN_EMAIL = process.argv[2] || 'adhavaishnavi2006@gmail.com';
const PROJECT_ID = 'skillswap-39167';

// Candidate paths for service account key JSON
const candidateKeyPaths = [
  path.join(rootDir, 'serviceAccountKey.json'),
  path.join(rootDir, 'service-account.json'),
  process.env.GOOGLE_APPLICATION_CREDENTIALS,
].filter(Boolean);

async function main() {
  console.log('================================================================');
  console.log('SkillSwap Server-Side Admin Role Assignment');
  console.log(`Target User Email: ${TARGET_ADMIN_EMAIL}`);
  console.log(`Firebase Project:   ${PROJECT_ID}`);
  console.log('================================================================\n');

  let serviceAccountPath = null;
  for (const p of candidateKeyPaths) {
    if (fs.existsSync(p)) {
      serviceAccountPath = p;
      break;
    }
  }

  if (!serviceAccountPath) {
    console.warn('⚠️  Service Account Key file not found in root directory.');
    console.log('\nTo assign custom claims using the Firebase Admin SDK:');
    console.log('1. Go to Firebase Console:');
    console.log(`   https://console.firebase.google.com/project/${PROJECT_ID}/settings/serviceaccounts/adminsdk`);
    console.log('2. Click "Generate new private key" to download your serviceAccountKey.json.');
    console.log('3. Place the file in the project root as "serviceAccountKey.json" (it is safely ignored by .gitignore).');
    console.log('4. Run this script again:');
    console.log(`   npm run set-admin\n`);
    console.log('Note: Security Rules in firestore.rules and AuthContext already authorize');
    console.log(`"${TARGET_ADMIN_EMAIL}" via Google-signed token claims.`);
    process.exit(0);
  }

  console.log(`Found service account key at: ${serviceAccountPath}`);

  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    const app = getApps().length === 0
      ? initializeApp({
          credential: cert(serviceAccount),
          projectId: PROJECT_ID,
        })
      : getApps()[0];

    const adminAuth = getAuth(app);
    const adminDb = getFirestore(app);

    console.log(`Looking up user by email: ${TARGET_ADMIN_EMAIL}...`);
    let user;
    try {
      user = await adminAuth.getUserByEmail(TARGET_ADMIN_EMAIL);
    } catch (lookupErr) {
      if (lookupErr.code === 'auth/user-not-found') {
        console.error(`\n❌ User "${TARGET_ADMIN_EMAIL}" does not exist in Firebase Authentication yet.`);
        console.log('How to create:');
        console.log('1. Open SkillSwap and click "Create Account".');
        console.log(`2. Register with email: ${TARGET_ADMIN_EMAIL}.`);
        console.log('3. Re-run this script to assign the admin role.\n');
        process.exit(1);
      }
      throw lookupErr;
    }

    console.log(`Found user: UID = ${user.uid}`);

    // 1. Set custom claim { admin: true } on Firebase ID token
    console.log('Setting custom claim { admin: true } on Firebase Authentication token...');
    await adminAuth.setCustomUserClaims(user.uid, { admin: true });

    // 2. Register UID in Firestore /admins collection
    console.log(`Writing record to Firestore at /admins/${user.uid}...`);
    await adminDb.collection('admins').doc(user.uid).set({
      email: TARGET_ADMIN_EMAIL,
      role: 'admin',
      assignedAt: new Date().toISOString(),
      assignedBy: 'SkillSwap Server-Side CLI',
    }, { merge: true });

    // 3. Update /users/{uid} document role to 'admin'
    console.log(`Updating student profile role to "admin" at /users/${user.uid}...`);
    await adminDb.collection('users').doc(user.uid).set({
      role: 'admin',
    }, { merge: true });

    // 4. Verify custom claims
    const verifiedUser = await adminAuth.getUser(user.uid);
    console.log('\n================================================================');
    console.log('✅ SUCCESS: Admin Role Assigned Successfully!');
    console.log(`User:         ${verifiedUser.email}`);
    console.log(`UID:          ${verifiedUser.uid}`);
    console.log(`CustomClaims: ${JSON.stringify(verifiedUser.customClaims)}`);
    console.log('================================================================');
    console.log('\nNext steps for the user:');
    console.log('1. Log out and log back in (or refresh the page in SkillSwap).');
    console.log('2. The Firebase ID token will contain { admin: true }.');
    console.log('3. The user can access the Admin Dashboard at /admin.\n');

  } catch (err) {
    console.error('Error assigning admin role:', err);
    process.exit(1);
  }
}

main();
