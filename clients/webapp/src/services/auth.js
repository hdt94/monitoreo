import { initializeApp, FirebaseError } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  getIdTokenResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  useDeviceLanguage as setDeviceLanguage,
} from 'firebase/auth';


const firebaseApp = initializeApp({
  apiKey: process.env.REACT_APP_IDENTITY_API_KEY,
  authDomain: process.env.REACT_APP_IDENTITY_AUTH_DOMAIN,
});
const auth = getAuth(firebaseApp);
setDeviceLanguage(auth);

const googleProvider = new GoogleAuthProvider();

function messageFromCode({ code }) {
  switch (code) {
    case 'auth/invalid-email':
      return "Invalid email";
    case 'auth/wrong-password':
      return "Invalid password";
    default:
      return null;
  }
}

export async function createAccount(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    // onAuthStateChanged event is triggered before resolving userCredential promise
    const { user } = userCredential;

    if (user) {
      // TODO Role assignment
    }

    return user;
  } catch (error) {
    // TODO
    // Error if account already exists
    // Error if password is too weak
    throw error;
  }
}

export async function authWithGoogle() {
  try {
    const response = await signInWithPopup(auth, googleProvider);

    if (response?.code === "auth/popup-closed-by-user") {
      return { error: response };
    }

    return response;
  } catch (error) {
    if (error?.code === 'auth/popup-blocked') {
      return await authWithGoogleRedirect();
    }

    return { error };
  }
}

async function authWithGoogleRedirect() {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    return { error };
  }
}

export async function login({ email, pass }) {
  try {
    const response = await signInWithEmailAndPassword(auth, email, pass);
    // const { user } = response;

    return response;
  } catch (err) {
    if (err instanceof FirebaseError) {
      const message = messageFromCode({ code: err.code })

      return message ? { error: { message } } : err;
    } else {
      return err;
    }
  }
}

export async function logout() {
  await signOut(auth);
}

export function setupAuthSubscription({ callback }) {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    // this is triggered with subscription setup as it verifies current auth state
    if (!user) {
      callback(null);
      return;
    }

    try {
      const { claims } = await getIdTokenResult(user, true);
      callback({ ...user, ...claims });
    } catch (error) {
      callback({ errors: [error] });
    }
  });

  return unsubscribe;
}
