# Dashboard Login Instructions

## How the Login System Works

This dashboard uses Firebase Authentication with email and password for user authentication. Here's how it works:

1. **Firebase Configuration**: The Firebase configuration is set up in `src/firebase/firebase.js`
2. **Login Page**: The login form is located at `/dashboard/login`
3. **Authentication Check**: The dashboard layout (`src/components/layout/DashboardLayout.tsx`) checks if a user is authenticated using `onAuthStateChanged`
4. **Protected Routes**: If a user is not authenticated, they are redirected to the login page

## Default Placeholder Credentials

The login form has a placeholder email of `admin@example.com`. This is just a placeholder and not an actual account.

## How to Create an Admin Account

Since there are no default credentials provided in the code, you'll need to create an admin account. Here are your options:

### Option 1: Create an Account Through the Firebase Console

1. Go to the Firebase Console (https://console.firebase.google.com/)
2. Select your project (followerscrape)
3. Navigate to the "Authentication" section
4. Click on the "Users" tab
5. Click "Add user" and enter an email and password
6. Use these credentials to log in to the dashboard

### Option 2: Add Account Creation Functionality to the Login Page

You can modify the login page to include a "Create Account" button that uses `createUserWithEmailAndPassword` from Firebase Auth.

### Option 3: Use the Firebase CLI to Create a User

If you have the Firebase CLI installed, you can create a user from the command line:

```bash
firebase auth:export users.json --project your-project-id
```

## Testing Credentials

For development purposes, you can use:
- Email: `admin@example.com`
- Password: Any password (you'll need to create the account first)

## Troubleshooting

If you're having trouble logging in:

1. Make sure you've created an account in Firebase Authentication
2. Check that the email and password are correct
3. Ensure your Firebase project is properly configured
4. Check the browser console for any error messages