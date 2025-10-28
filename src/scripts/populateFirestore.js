import { db } from '@/lib/firebase';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';

// Package data
const packages = [
  {
    id: 'seed',
    name: 'Seed Package',
    title: 'Pargati Seed',
    description: 'Get started with essential digital skills',
    price: 199,
    thumbnail_url: 'https://i.ibb.co/hxF0cSCz/seed-package.jpg' // Added the thumbnail URL
  },
  {
    id: 'basic',
    name: 'Basic Package',
    title: 'Pargati Basic',
    description: 'Essential skills for beginners',
    price: 376
  },
  {
    id: 'elite', 
    name: 'Elite Package',
    title: 'Pargati Elite',
    description: 'Advanced skills for serious learners',
    price: 532
  },
  {
    id: 'warriors',
    name: 'Warriors Package',
    title: 'Pargati Warriors', 
    description: 'Elite training for digital champions',
    price: 1032
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
      console.log(`Added package: ${pkg.title}`);
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