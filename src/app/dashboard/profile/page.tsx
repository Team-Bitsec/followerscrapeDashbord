'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { auth } from '../../../firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function ProfilePage() {
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdmin(user);
      } else {
        setAdmin(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p>Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!admin) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p>You must be logged in to view this page.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile</h1>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                <span className="text-3xl text-gray-600 font-semibold">
                  {admin.email?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-bold text-gray-800">
                  {admin.displayName || 'Administrator'}
                </h2>
                <p className="text-gray-600 mt-1">{admin.email}</p>
                <p className="text-gray-500 mt-2">Administrator</p>
                <button
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">Personal Details</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{admin.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                  <p className="text-gray-900">{admin.uid}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Created</label>
                  <p className="text-gray-900">
                    {admin.metadata?.creationTime || 'Unknown'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Sign In</label>
                  <p className="text-gray-900">
                    {admin.metadata?.lastSignInTime || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}