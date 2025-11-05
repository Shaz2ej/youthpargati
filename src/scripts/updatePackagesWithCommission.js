import { db } from '../lib/firebase.js';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Package commission data
const packageCommissions = {
  'seed': 80,
  'basic': 150,
  'elite': 200,
  'warriors': 300
};

const updatePackagesWithCommission = async () => {
  try {
    console.log('Updating packages with commission data...');
    
    // Get all packages
    const packagesSnapshot = await getDocs(collection(db, 'packages'));
    
    for (const packageDoc of packagesSnapshot.docs) {
      const packageId = packageDoc.id;
      const commission = packageCommissions[packageId] || 0;
      
      // Update package with commission data
      await updateDoc(doc(db, 'packages', packageId), {
        commission: commission
      });
      
      console.log(`Updated package ${packageId} with commission: ₹${commission}`);
    }

    console.log('Package commission update completed successfully!');
  } catch (error) {
    console.error('Error updating packages with commission data:', error);
  }
};

// Run the update script
updatePackagesWithCommission();