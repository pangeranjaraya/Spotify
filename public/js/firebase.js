import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, collection, addDoc, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyA24TkIzQAEXB_umg4ILguyykFpGK7FSc",
    authDomain: "project-chat-bot-ai.firebaseapp.com",
    projectId: "project-chat-bot-ai",
    storageBucket: "project-chat-bot-ai.firebasestorage.app",
    messagingSenderId: "74561829228",
    appId: "1:74561829228:web:32c62292e90b543a27db49"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc, updateDoc, deleteDoc, collection, addDoc, query, where, getDocs };
