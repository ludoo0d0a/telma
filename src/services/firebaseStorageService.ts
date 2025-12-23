import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCredential, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { firebaseConfig } from '../firebase';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

class FirebaseStorageService {
  private user: User | null = null;

  constructor() {
    onAuthStateChanged(auth, (user) => {
      this.user = user;
    });
  }

  async signInWithGoogle(accessToken: string) {
    const credential = GoogleAuthProvider.credential(accessToken);
    const userCredential = await signInWithCredential(auth, credential);
    this.user = userCredential.user;
  }

  signOut() {
    auth.signOut();
    this.user = null;
  }

  async uploadFile(fileName: string, content: object) {
    if (!this.user) {
      throw new Error('User not authenticated');
    }
    const storageRef = ref(storage, `${this.user.uid}/${fileName}`);
    await uploadString(storageRef, JSON.stringify(content));
  }

  async readFile(fileName: string) {
    if (!this.user) {
      throw new Error('User not authenticated');
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
    if (!this.user) {
      throw new Error('User not authenticated');
    }
    const storageRef = ref(storage, `${this.user.uid}/${fileName}`);
    await deleteObject(storageRef);
  }
}

export default new FirebaseStorageService();
