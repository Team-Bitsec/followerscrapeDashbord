// Script to create an admin user for the dashboard
// Run this script with: node create_admin_user.js

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Firebase configuration (same as in src/firebase/firebase.js)
const firebaseConfig = {
  apiKey: "AIzaSyBe5YKOECMQINkOWVgJOrMKh3Tv7QmAjDM",
  authDomain: "followerscrape.firebaseapp.com",
  projectId: "followerscrape",
  storageBucket: "followerscrape.firebasestorage.app",
  messagingSenderId: "25973194513",
  appId: "1:25973194513:web:18859f09fd3ccaa0f5d6b0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Function to create an admin user
async function createAdminUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Admin user created successfully!');
    console.log('User ID:', userCredential.user.uid);
    console.log('Email:', userCredential.user.email);
    console.log('\nYou can now use these credentials to log in to the dashboard:');
    console.log('Email:', email);
    console.log('Password:', password);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    
    // Handle specific errors
    switch (error.code) {
      case 'auth/email-already-in-use':
        console.log('This email is already in use. Please use a different email.');
        break;
      case 'auth/invalid-email':
        console.log('The email address is not valid.');
        break;
      case 'auth/operation-not-allowed':
        console.log('Email/password accounts are not enabled.');
        break;
      case 'auth/weak-password':
        console.log('The password is too weak. Please use a stronger password.');
        break;
      default:
        console.log('An unknown error occurred.');
    }
  }
}

// Check if the script is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Default credentials (you can change these)
  const defaultEmail = 'admin@example.com';
  const defaultPassword = 'admin123';
  
  console.log('Creating admin user for the dashboard...');
  console.log('Default credentials:');
  console.log('Email:', defaultEmail);
  console.log('Password:', defaultPassword);
  console.log('\nTo use custom credentials, run the script with: node create_admin_user.js <email> <password>');
  console.log('\nCreating user...\n');
  
  // Get email and password from command line arguments or use defaults
  const email = process.argv[2] || defaultEmail;
  const password = process.argv[3] || defaultPassword;
  
  await createAdminUser(email, password);
}

// Export the function for use in other modules
export { createAdminUser };