import { db } from './src/lib/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

async function checkPackages() {
  try {
    const querySnapshot = await getDocs(collection(db, 'packages'));
    querySnapshot.forEach((doc) => {
      console.log(doc.id, ' => ', doc.data());
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
  }
}

checkPackages();