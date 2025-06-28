// src/lib/firebaseUtils.js
import { db } from "./firebaseConfig"; // Adjust path as needed
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";

// Fetches meal plan for a specific user and date
export const getMealPlanFromFirestore = async (userId, date) => {
  if (!userId || !date) return null;
  const mealPlanRef = doc(db, "users", userId, "mealPlans", date);
  const docSnap = await getDoc(mealPlanRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
};

// Saves or updates meal plan for a specific user and date
export const saveMealPlanToFirestore = async (userId, date, meals) => {
  if (!userId || !date || !meals) return;
  const mealPlanRef = doc(db, "users", userId, "mealPlans", date);

  const docSnap = await getDoc(mealPlanRef);

  if (docSnap.exists()) {
    // Update existing document
    await updateDoc(mealPlanRef, {
      ...meals,
      updatedAt: serverTimestamp(),
    });
  } else {
    // Create new document
    await setDoc(mealPlanRef, {
      ...meals,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
};

// utils/firebaseUtils.js

// Function to fetch a single blog post by its slug
export async function getBlogPostBySlug(slug) {
  if (!slug) return null; // Handle cases where slug might be undefined or null

  const postsCollection = collection(db, "blogPosts");
  const q = query(postsCollection, where("slug", "==", slug)); // Query by slug
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    // Assuming slugs are unique, return the first match
    const docData = querySnapshot.docs[0].data();
    return { id: querySnapshot.docs[0].id, ...docData };
  }
  return null; // No post found with that slug
}

// You might also have getAllBlogPosts in this file for your main blog page
export async function getAllBlogPosts() {
  const postsCollection = collection(db, "blogPosts");
  const q = query(postsCollection, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
