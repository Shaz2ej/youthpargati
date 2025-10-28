# Moving Packages to Firestore

This document explains how to move your hardcoded packages to Firebase Firestore.

## Implementation Summary

The following changes have been made to your codebase:

1. **Created utility functions** in `src/lib/utils.js` for Firestore operations:
   - `fetchPackages()` - Fetch all packages from Firestore
   - `fetchPackageById(packageId)` - Fetch a single package by ID
   - `fetchCoursesByPackageId(packageId)` - Fetch courses for a specific package

2. **Updated Home.jsx** to fetch packages from Firestore instead of using hardcoded data

3. **Updated PackageCourses.jsx** to fetch package and course data from Firestore

4. **Created a population script** to add your existing packages and courses to Firestore

## Data Structure

### Packages Collection
```
/packages
  - id: string (e.g., 'basic', 'elite', 'warriors')
  - title: string
  - description: string
  - price: number
```

### Courses Collection
```
/courses
  - id: string (e.g., 'course-1', 'course-2', 'course-3')
  - title: string
  - description: string
  - packageId: string (reference to package)
```

## How to Populate Firestore

1. **Open the populate page**:
   - Start your development server: `npm run dev`
   - Visit: http://localhost:5174/populate.html
   - Click the "Populate Firestore" button

2. **Alternative method using Node.js script**:
   - Run: `node src/scripts/populateFirestore.js`

## Fallback Mechanism

If Firestore is unavailable, the application will automatically fall back to the hardcoded data:
- Packages will show the default "Pargati Basic", "Pargati Elite", and "Pargati Warriors"
- Courses will show sample data

## Verification

After populating Firestore:
1. Visit your homepage to see packages loaded from Firestore
2. Click on any package to view its courses
3. Check the browser console for any errors

## Troubleshooting

If you encounter issues:
1. Check that your Firebase configuration in `src/lib/firebase.js` is correct
2. Verify that your Firestore rules allow read access
3. Check the browser console for error messages
4. Ensure you have an active internet connection

## Future Enhancements

With this implementation, you can now:
- Easily update package information without changing code
- Add new packages and courses through the Firebase Console
- Modify prices, descriptions, and other details in real-time
- Expand to include package thumbnails, course durations, etc.