import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Fetch all packages from Firestore
 * @returns {Promise<Array>} Array of package objects
 */
export const fetchPackages = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'packages'));
    const packages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return packages;
  } catch (error) {
    console.error('Error fetching packages from Firestore:', error);
    throw error;
  }
};

/**
 * Fetch a single package by ID from Firestore
 * @param {string} packageId - The ID of the package to fetch
 * @returns {Promise<Object|null>} Package object or null if not found
 */
export const fetchPackageById = async (packageId) => {
  try {
    const packageDoc = await getDoc(doc(db, 'packages', packageId));
    if (packageDoc.exists()) {
      return { id: packageDoc.id, ...packageDoc.data() };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching package ${packageId} from Firestore:`, error);
    throw error;
  }
};

/**
 * Fetch courses for a specific package from Firestore
 * @param {string} packageId - The ID of the package
 * @returns {Promise<Array>} Array of course objects
 */
export const fetchCoursesByPackageId = async (packageId) => {
  try {
    const q = query(collection(db, 'courses'), where('packageId', '==', packageId));
    const querySnapshot = await getDocs(q);
    const courses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return courses;
  } catch (error) {
    console.error(`Error fetching courses for package ${packageId} from Firestore:`, error);
    throw error;
  }
};