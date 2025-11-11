import { db } from '../lib/firebase.js';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Package commission data
// commission: for users who have already purchased the package (owned)
// commission_unowned: for users who have not purchased the package (unowned)
const packageCommissions = {
  'seed': { commission: 80, commission_unowned: 40 },
  'basic': { commission: 150, commission_unowned: 75 },
  'elite': { commission: 200, commission_unowned: 100 },
  'warriors': { commission: 300, commission_unowned: 150 }
};

const updatePackagesWithCommission = async () => {
  try {
    console.log('Updating packages with commission data...');
    
    // Get all packages
    const packagesSnapshot = await getDocs(collection(db, 'packages'));
    
    for (const packageDoc of packagesSnapshot.docs) {
      const packageId = packageDoc.id;
      const commissions = packageCommissions[packageId] || { commission: 0, commission_unowned: 0 };
      
      // Update package with both commission fields
      await updateDoc(doc(db, 'packages', packageId), {
        commission: commissions.commission,
        commission_unowned: commissions.commission_unowned
      });
      
      console.log(`Updated package ${packageId} with commission: ₹${commissions.commission}, commission_unowned: ₹${commissions.commission_unowned}`);
    }

    console.log('Package commission update completed successfully!');
  } catch (error) {
    console.error('Error updating packages with commission data:', error);
  }
};

// Run the update script
updatePackagesWithCommission();