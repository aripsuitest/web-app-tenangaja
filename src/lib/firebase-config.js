import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyAiHZ1jx1JMoSGHG4FNyrNlT28OLVbFpqw",
  authDomain: "tugasakhirtenangaja.firebaseapp.com",
  databaseURL: "https://tugasakhirtenangaja-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tugasakhirtenangaja",
  storageBucket: "tugasakhirtenangaja.firebasestorage.app",
  messagingSenderId: "1003289910746",
  appId: "1:1003289910746:web:2b3ce8d577a2b602e6b4e3",
  measurementId: "G-42RDSB5VFJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { db, auth };