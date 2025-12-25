import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithCredential, GoogleAuthProvider, onAuthStateChanged, User, Auth } from 'firebase/auth';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from '../firebase';

// Initialize Firebase with error handling
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let isFirebaseInitialized = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  storage = getStorage(app);
  isFirebaseInitialized = true;
} catch (error) {
  console.error('Firebase initialization failed:', error);
  console.warn('Firebase features will be disabled. Please check your Firebase configuration.');
  isFirebaseInitialized = false;
}

class FirebaseStorageService {
  private user: User | null = null;

  constructor() {
    if (isFirebaseInitialized && auth) {
      onAuthStateChanged(auth, (user) => {
        this.user = user;
      });
    }
  }

  private checkFirebaseInitialized(): void {
    if (!isFirebaseInitialized || !auth || !storage) {
      throw new Error('Firebase is not properly initialized. Please check your Firebase configuration.');
    }
  }

  async signInWithGoogle(accessToken: string) {
    this.checkFirebaseInitialized();
    if (!auth) {
      throw new Error('Firebase Auth is not available');
    }
    const credential = GoogleAuthProvider.credential(accessToken);
    const userCredential = await signInWithCredential(auth, credential);
    this.user = userCredential.user;
  }

  signOut() {
    if (!auth) {
      return;
    }
    auth.signOut();
    this.user = null;
  }

  async uploadFile(fileName: string, content: object) {
    this.checkFirebaseInitialized();
    if (!this.user) {
      throw new Error('User not authenticated');
    }
    if (!storage) {
      throw new Error('Firebase Storage is not available');
    }
    const storageRef = ref(storage, `${this.user.uid}/${fileName}`);
    await uploadString(storageRef, JSON.stringify(content));
  }

  async readFile(fileName: string) {
    this.checkFirebaseInitialized();
    if (!this.user) {
      throw new Error('User not authenticated');
    }
    if (!storage) {
      throw new Error('Firebase Storage is not available');
    }
    const storageRef = ref(storage, `${this.user.uid}/${fileName}`);
    try {
      const url = await getDownloadURL(storageRef);
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Error reading file from Firebase Storage:', error);
      return null;
    }
  }

  async deleteFile(fileName: string) {
    this.checkFirebaseInitialized();
    if (!this.user) {
      throw new Error('User not authenticated');
    }
    if (!storage) {
      throw new Error('Firebase Storage is not available');
    }
    const storageRef = ref(storage, `${this.user.uid}/${fileName}`);
    await deleteObject(storageRef);
  }
}

export default new FirebaseStorageService();
