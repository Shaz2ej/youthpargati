import { db } from '../lib/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

const verifyFirestoreData = async () => {
  try {
    console.log('Verifying Firestore packages data...');
    const querySnapshot = await getDocs(collection(db, 'packages'));
    
    console.log(`Found ${querySnapshot.size} packages:`);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\nPackage ID: ${doc.id}`);
      console.log(`  Name: ${data.name || 'MISSING'}`);
      console.log(`  Title: ${data.title || 'MISSING'}`);
      console.log(`  Description: ${data.description || 'MISSING'}`);
      console.log(`  Price: ${data.price || 'MISSING'}`);
      console.log(`  Thumbnail: ${data.thumbnail || 'MISSING'}`);
      console.log(`  All fields:`, data);
    });
    
    console.log('\nVerification completed!');
  } catch (error) {
    console.error('Error verifying Firestore data:', error);
  }
};

// Run the verification script
verifyFirestoreData();