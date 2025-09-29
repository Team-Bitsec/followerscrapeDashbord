# Dashboard Login Guide

## How to Login to the Dashboard

This guide will help you login to the dashboard application. The dashboard uses Firebase Authentication with email and password for user authentication.

## Default Placeholder Credentials

The login form has a placeholder email of `admin@example.com`. This is just a placeholder and not an actual account. You'll need to create your own account to login.

## Creating an Admin Account

You have several options to create an admin account:

### Option 1: Use the Provided Utility Script

A utility script `create_admin_user.mjs` has been provided to help you create an admin account:

1. Open a terminal in the project directory
2. Run the script with:
   ```
   node create_admin_user.mjs
   ```
   
3. This will create an account with the default credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
   
4. You can also specify custom credentials:
   ```
   node create_admin_user.mjs your-email@example.com your-password
   ```

### Option 2: Create an Account Through the Firebase Console

1. Go to the Firebase Console (https://console.firebase.google.com/)
2. Select your project (followerscrape)
3. Navigate to the "Authentication" section
4. Click on the "Users" tab
5. Click "Add user" and enter an email and password
6. Use these credentials to log in to the dashboard

### Option 3: Modify the Login Page to Include Account Creation

You can modify the login page (`src/app/dashboard/login/page.tsx`) to include a "Create Account" button that uses `createUserWithEmailAndPassword` from Firebase Auth.

## Logging In

Once you've created an account, you can log in to the dashboard:

1. Navigate to `/dashboard/login` in your browser
2. Enter your email and password
3. Click "Sign In"

## Troubleshooting

If you're having trouble logging in:

1. Make sure you've created an account in Firebase Authentication
2. Check that the email and password are correct
3. Ensure your Firebase project is properly configured
4. Check the browser console for any error messages

## Security Note

For production use, make sure to:
1. Use strong passwords
2. Enable email verification
3. Set up proper security rules in Firebase
4. Consider implementing multi-factor authentication