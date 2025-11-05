import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, query, where, documentId } from 'firebase/firestore';

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
    // Validate input
    if (!packageId) {
      console.warn('fetchPackageById: Missing packageId');
      return null;
    }
    
    console.log('Fetching package with ID:', packageId);
    const packageDoc = await getDoc(doc(db, 'packages', packageId));
    if (packageDoc.exists()) {
      const packageData = { id: packageDoc.id, ...packageDoc.data() };
      console.log('Successfully fetched package:', packageData);
      return packageData;
    }
    console.warn('Package not found with ID:', packageId);
    return null;
  } catch (error) {
    console.error(`Error fetching package ${packageId} from Firestore:`, error);
    throw error;
  }
};

/**
 * Fetch courses for a specific package from Firestore (using packageId field)
 * @param {string} packageId - The ID of the package
 * @returns {Promise<Array>} Array of course objects
 */
export const fetchCoursesByPackageId = async (packageId) => {
  try {
    // Validate input
    if (!packageId) {
      console.warn('fetchCoursesByPackageId: Missing packageId');
      return [];
    }
    
    console.log('Fetching courses for package ID:', packageId);
    const q = query(collection(db, 'courses'), where('packageId', '==', packageId));
    const querySnapshot = await getDocs(q);
    const courses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`Found ${courses.length} courses for package ${packageId}:`, courses);
    return courses;
  } catch (error) {
    console.error(`Error fetching courses for package ${packageId} from Firestore:`, error);
    throw error;
  }
};

/**
 * Fetch courses by array of course IDs (new implementation for array-based approach)
 * @param {Array} courseIds - Array of course IDs
 * @returns {Promise<Array>} Array of course objects
 */
export const fetchCoursesByIds = async (courseIds) => {
  try {
    // Task 3: Log selected package
    console.log("Selected course IDs:", courseIds);
    
    // Task 9: Handle duplicates in courseIds
    const uniqueCourseIds = courseIds ? [...new Set(courseIds)] : [];
    
    // Validate input
    if (!uniqueCourseIds.length) {
      console.warn("No course IDs provided");
      return [];
    }
    
    // Task 4: Modify Firestore query to fetch all valid courses
    let allCourses = [];
    
    // Handle Firestore 'in' query limit of 10 items (Task 10)
    if (uniqueCourseIds.length <= 10) {
      const q = query(
        collection(db, "courses"),
        where(documentId(), "in", uniqueCourseIds)
      );
      const querySnapshot = await getDocs(q);
      allCourses = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
    } else {
      // For larger arrays, split into batches of 10
      const batches = [];
      for (let i = 0; i < uniqueCourseIds.length; i += 10) {
        batches.push(uniqueCourseIds.slice(i, i + 10));
      }
      
      const batchPromises = batches.map(async (batch) => {
        const q = query(
          collection(db, "courses"),
          where(documentId(), "in", batch)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
      });
      
      const batchResults = await Promise.all(batchPromises);
      allCourses = batchResults.flat();
    }
    
    // Task 5: Log invalid course IDs
    const fetchedCourseIds = allCourses.map(course => course.id);
    const invalidCourseIds = uniqueCourseIds.filter(id => !fetchedCourseIds.includes(id));
    invalidCourseIds.forEach(id => {
      console.warn("Invalid course ID:", id);
    });
    
    // Task 6: Log fetched courses
    console.log("Fetched courses:", allCourses);
    
    return allCourses;
  } catch (error) {
    console.error("Error fetching courses by IDs:", error);
    return [];
  }
};

/**
 * Fetch videos for a specific course
 * @param {string} courseId - The ID of the course
 * @returns {Promise<Array>} Array of video objects
 */
export const fetchVideosByCourseId = async (courseId) => {
  try {
    // ✅ Fetch chapters from subcollection under each course
    // WARNING: Database may use lowercase 'chapters' - verify with actual database structure
    const chaptersRef = collection(db, "courses", courseId, "chapters"); // use exact case as in Firestore

    console.log("Fetching path:", `courses/${courseId}/chapters`);

    const chaptersSnapshot = await getDocs(chaptersRef);
    const fetchedChapters = chaptersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Videos for course", courseId, ":", fetchedChapters);
    return fetchedChapters;
  } catch (error) {
    console.error("Error fetching videos for course:", courseId, error);
    return [];
  }
};

/**
 * Fetch courses with videos for a package
 * @param {Object} selectedPackage - The package object containing course IDs
 * @returns {Promise<Array>} Array of course objects with videos
 */
export const fetchPackageCoursesWithVideos = async (selectedPackage) => {
  try {
    // Get courses by IDs
    const courses = await fetchCoursesByIds(selectedPackage.courses || []);
    
    // Task 7: For each fetched course, fetch its related videos
    const coursesWithVideos = await Promise.all(
      courses.map(async (course) => {
        try {
          const videos = await fetchVideosByCourseId(course.id);
          return {
            ...course,
            videos: videos
          };
        } catch (videoError) {
          console.error("Error fetching videos for course", course.id, ":", videoError);
          return {
            ...course,
            videos: []
          };
        }
      })
    );
    
    return coursesWithVideos;
  } catch (error) {
    console.error("Error fetching package courses with videos:", error);
    return [];
  }
};

/**
 * Fetch package commission amount by package ID from Firestore
 * @param {string} packageId - The ID of the package
 * @returns {Promise<number>} Commission amount for the package
 */
export const fetchPackageCommission = async (packageId) => {
  try {
    // Validate input
    if (!packageId) {
      console.warn('fetchPackageCommission: Missing packageId');
      return 0;
    }
    
    console.log('Fetching commission for package ID:', packageId);
    const packageDoc = await getDoc(doc(db, 'packages', packageId));
    if (packageDoc.exists()) {
      const packageData = packageDoc.data();
      const commission = packageData.commission || 0;
      console.log(`Commission for package ${packageId}: ₹${commission}`);
      return commission;
    }
    console.warn('Package not found with ID:', packageId);
    return 0;
  } catch (error) {
    console.error(`Error fetching commission for package ${packageId} from Firestore:`, error);
    return 0;
  }
};

/**
 * Check if a user has purchased a specific package
 * @param {string} packageId - The ID of the package
 * @param {string} userId - The user ID
 * @returns {Promise<boolean>} Whether the user has purchased the package
 */
export const checkUserPurchase = async (packageId, userId) => {
  try {
    // Validate inputs
    if (!packageId || !userId) {
      console.warn('checkUserPurchase: Missing packageId or userId', { packageId, userId });
      return false;
    }

    console.log('Checking purchase status for package:', packageId, 'user:', userId);
    
    // Check localStorage first for quick response
    const localStorageKey = `purchase_${packageId}_${userId}`;
    const cachedResult = localStorage.getItem(localStorageKey);
    if (cachedResult !== null) {
      const result = cachedResult === 'true';
      console.log('Purchase status (from cache) for package', packageId, 'user', userId, ':', result);
      return result;
    }

    const q = query(
      collection(db, 'purchases'),
      where('package_id', '==', packageId),
      where('student_uid', '==', userId),
      where('payment_status', '==', 'success')
    );
    
    const querySnapshot = await getDocs(q);
    const hasPurchased = !querySnapshot.empty;
    
    console.log('Purchase status (from DB) for package', packageId, 'user', userId, ':', hasPurchased);
    
    // Cache the result in localStorage
    localStorage.setItem(localStorageKey, hasPurchased.toString());
    
    return hasPurchased;
  } catch (error) {
    console.error('Error checking user purchase for package', packageId, 'user', userId, ':', error);
    return false;
  }
};

/**
 * Fetch all purchases for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of purchase objects
 */
export const fetchUserPurchases = async (userId) => {
  try {
    // Validate input
    if (!userId) {
      console.warn('fetchUserPurchases: Missing userId');
      return [];
    }
    
    console.log('Fetching purchases for user:', userId);
    const q = query(
      collection(db, 'purchases'),
      where('student_uid', '==', userId),
      where('payment_status', '==', 'success')
    );
    
    const querySnapshot = await getDocs(q);
    const purchases = querySnapshot.docs.map(doc => {
      const purchaseData = {
        id: doc.id,
        ...doc.data()
      };
      console.log('Found purchase:', purchaseData.id, 'package_id:', purchaseData.package_id);
      return purchaseData;
    });
    
    console.log('Total purchases found for user', userId, ':', purchases.length);
    return purchases;
  } catch (error) {
    console.error('Error fetching user purchases for user', userId, ':', error);
    return [];
  }
};