// Package commission data
// This mapping defines the fixed commission each referrer earns based on their purchased package
export const packageCommissions = {
  'seed': 80,      // Seed package referrers earn ₹80
  'basic': 150,    // Basic package referrers earn ₹150
  'elite': 200,    // Elite package referrers earn ₹200
  'warriors': 300  // Warriors package referrers earn ₹300
};

/**
 * Get the commission amount for a given package ID
 * @param {string} packageId - The package ID
 * @returns {number} - The commission amount
 */
export const getPackageCommission = (packageId) => {
  return packageCommissions[packageId] || 0;
};

/**
 * Get package details including commission
 * @param {string} packageId - The package ID
 * @returns {Object} - Package details with commission
 */
export const getPackageDetailsWithCommission = async (packageId) => {
  // In a real implementation, this would fetch from Firestore
  // For now, we'll return the commission data we know about
  const commissions = {
    'seed': { id: 'seed', name: 'Seed Package', commission: 80 },
    'basic': { id: 'basic', name: 'Basic Package', commission: 150 },
    'elite': { id: 'elite', name: 'Elite Package', commission: 200 },
    'warriors': { id: 'warriors', name: 'Warriors Package', commission: 300 }
  };
  
  return commissions[packageId] || { id: packageId, name: 'Unknown Package', commission: 0 };
};