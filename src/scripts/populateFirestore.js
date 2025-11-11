import { db } from '../lib/firebase.js';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';

// Package data with commission information
const packages = [
  {
    id: 'seed',
    name: 'Seed Package',
    title: 'Pargati Seed',
    description: 'Get started with essential digital skills',
    price: 199,
    commission: 80, // ₹80 commission for Seed package referrers (owned)
    commission_unowned: 40, // ₹40 commission for Seed package referrers (unowned)
    thumbnail_url: 'https://i.ibb.co/hxF0cSCz/seed-package.jpg'
  },
  {
    id: 'basic',
    name: 'Basic Package',
    title: 'Pargati Basic',
    description: 'Essential skills for beginners',
    price: 376,
    commission: 150, // ₹150 commission for Basic package referrers (owned)
    commission_unowned: 75 // ₹75 commission for Basic package referrers (unowned)
  },
  {
    id: 'elite', 
    name: 'Elite Package',
    title: 'Pargati Elite',
    description: 'Advanced skills for serious learners',
    price: 532,
    commission: 200, // ₹200 commission for Elite package referrers (owned)
    commission_unowned: 100 // ₹100 commission for Elite package referrers (unowned)
  },
  {
    id: 'warriors',
    name: 'Warriors Package',
    title: 'Pargati Warriors', 
    description: 'Elite training for digital champions',
    price: 1032,
    commission: 300, // ₹300 commission for Warriors package referrers (owned)
    commission_unowned: 150 // ₹150 commission for Warriors package referrers (unowned)
  }
];

// Course data
const courses = [
  {
    id: 'course-0',
    title: 'Digital Literacy Fundamentals',
    description: 'Learn the basics of digital tools and online safety',
    packageId: 'seed'
  },
  {
    id: 'course-1',
    title: 'Introduction to Digital Marketing',
    description: 'Learn the basics of digital marketing and online advertising',
    packageId: 'basic'
  },
  {
    id: 'course-2', 
    title: 'Advanced SEO Techniques',
    description: 'Master search engine optimization for better website rankings',
    packageId: 'elite'
  },
  {
    id: 'course-3',
    title: 'Social Media Strategy', 
    description: 'Create effective social media campaigns that drive engagement',
    packageId: 'warriors'
  }
];

const populateFirestore = async () => {
  try {
    console.log('Populating packages...');
    for (const pkg of packages) {
      await setDoc(doc(db, 'packages', pkg.id), pkg);
      console.log(`Added package: ${pkg.title} with commission: ₹${pkg.commission}, commission_unowned: ₹${pkg.commission_unowned}`);
    }

    console.log('Populating courses...');
    for (const course of courses) {
      await setDoc(doc(db, 'courses', course.id), course);
      console.log(`Added course: ${course.title}`);
    }

    console.log('Firestore population completed successfully!');
  } catch (error) {
    console.error('Error populating Firestore:', error);
  }
};

// Run the population script
populateFirestore();