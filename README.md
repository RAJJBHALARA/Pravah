# Pravah Perfumes - E-commerce Storefront

A modern e-commerce platform for Pravah featuring a sleek user interface, secure admin dashboard, and a scalable backend powered by Firebase.

## Features
- **Frontend**: Responsive, modern design with custom CSS animations and liquid glass aesthetics.
- **Backend**: Firebase Firestore (NoSQL Database).
- **Authentication**: Firebase Auth (Email/Password) for both regular users and admins.
- **Admin Panel**: Secure, backend-verified admin interface with real-time product management. Access via `/admin.html`.

## Setup & Configuration

### 1. Firebase Project Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database** and **Authentication** (specifically the Email/Password sign-in method).
3. Replace the configuration object in `js/firebase-config.js` with your project's credentials.

### 2. Admin Account Setup
To restrict access to the Admin Dashboard, we rely on Firebase Authentication and specific Firestore Security Rules. 
1. Go to Firebase Console -> Authentication -> Users.
2. Manually add a user with the exact email address **`admin@pravah.com`** and a strong password.
   *(Note: If you change this email, you must update the `isAdmin()` function in `firestore.rules`!)*

### 3. Database Security Rules
To ensure the public cannot tamper with your products or contact messages, deploy the strict security rules. You can run this command to deploy them to your live database:
```bash
firebase deploy --only firestore:rules
```
Or paste the contents of `firestore.rules` directly into the Rules tab of your Firestore Database console.

## Deployment
This project uses GitHub Actions for continuous deployment to Firebase Hosting.
- Any push to the `main` branch automatically deploys the frontend web app.

### Manual Deployment
If you prefer to deploy manually via the CLI, run the following from the project root:
```bash
firebase deploy
```
