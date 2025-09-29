'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    // Listen for unread notifications
    const q = query(
      collection(db, 'notifications'),
      where('isRead', '==', false),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setNotifications(querySnapshot.size);
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <header className="bg-white shadow">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="md:hidden mr-4"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <span className="block w-full h-0.5 bg-gray-600"></span>
              <span className="block w-full h-0.5 bg-gray-600"></span>
              <span className="block w-full h-0.5 bg-gray-600"></span>
            </div>
          </button>
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Notifications">
            <div className="w-6 h-6 relative">
              <span className="block w-full h-full rounded-full border-2 border-gray-600"></span>
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </div>
          </button>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 font-semibold">A</span>
            </div>
            <span className="ml-2 text-gray-600 hidden md:inline">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;