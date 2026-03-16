// src/firebase/firestore.js
import {
  doc, setDoc, getDoc, updateDoc, addDoc, getDocs,
  collection, query, where, orderBy, limit, serverTimestamp, deleteDoc
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// ── USER ──────────────────────────────────────────────
export async function createUserDocument(user, extraData) {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || extraData.displayName || '',
      photoURL: user.photoURL || '',
      ecoPoints: 0,
      totalEmission: 0,
      treesPlanted: 0,
      createdAt: serverTimestamp(),
      ...extraData
    });
  }
}

export async function getUserDocument(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserDocument(uid, data) {
  await updateDoc(doc(db, 'users', uid), data);
}

// ── ACTIVITIES ────────────────────────────────────────
export async function addActivity(uid, activity) {
  return addDoc(collection(db, 'activities'), {
    uid, ...activity, createdAt: serverTimestamp()
  });
}

export async function getUserActivities(uid, limitCount = 20) {
  const q = query(
    collection(db, 'activities'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── ELECTRICITY BILLS ─────────────────────────────────
export async function saveBill(uid, billData) {
  return addDoc(collection(db, 'electricity_bills'), {
    uid, ...billData, createdAt: serverTimestamp()
  });
}

export async function getUserBills(uid) {
  const q = query(
    collection(db, 'electricity_bills'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── GREEN HABITS ──────────────────────────────────────
export async function addHabit(uid, habitData) {
  return addDoc(collection(db, 'green_habits'), {
    uid, ...habitData, createdAt: serverTimestamp()
  });
}

export async function getUserHabits(uid) {
  const q = query(
    collection(db, 'green_habits'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── PRODUCTS ──────────────────────────────────────────
export async function saveProductScan(uid, productData) {
  return addDoc(collection(db, 'products'), {
    uid, ...productData, createdAt: serverTimestamp()
  });
}

export async function getUserProducts(uid) {
  const q = query(
    collection(db, 'products'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(30)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── LEADERBOARD ───────────────────────────────────────
export async function getLeaderboard() {
  const q = query(
    collection(db, 'users'),
    orderBy('ecoPoints', 'desc'),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}