'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { db } from '../../firebase/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';

export default function DashboardPage() {
  const [users, setUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [messages, setMessages] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    // Fetch user count and active users
    const usersQuery = query(collection(db, 'userStatus'));
    const unsubscribeUsers = onSnapshot(usersQuery, (querySnapshot) => {
      setUsers(querySnapshot.size);
      const activeCount = querySnapshot.docs.filter(doc => doc.data().isActive).length;
      setActiveUsers(activeCount);
    });

    // Fetch message count
    const messagesQuery = query(collection(db, 'chats'));
    const unsubscribeMessages = onSnapshot(messagesQuery, (querySnapshot) => {
      setMessages(querySnapshot.size);
    });

    // Fetch unread messages count
    const unreadQuery = query(
      collection(db, 'notifications'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const unsubscribeUnread = onSnapshot(unreadQuery, (querySnapshot) => {
      const unreadCount = querySnapshot.docs.filter(doc => !doc.data().isRead).length;
      setUnreadMessages(unreadCount);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeMessages();
      unsubscribeUnread();
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Users</h2>
            <p className="text-3xl font-bold text-blue-600">{users}</p>
            <p className="text-sm text-gray-500 mt-2">Registered users</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Active Users</h2>
            <p className="text-3xl font-bold text-green-600">{activeUsers}</p>
            <p className="text-sm text-gray-500 mt-2">Currently online</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Messages</h2>
            <p className="text-3xl font-bold text-purple-600">{messages}</p>
            <p className="text-sm text-gray-500 mt-2">All conversations</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Unread Messages</h2>
            <p className="text-3xl font-bold text-yellow-600">{unreadMessages}</p>
            <p className="text-sm text-gray-500 mt-2">Need attention</p>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Messages</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-800 font-semibold">JD</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">John Doe</div>
                        <div className="text-sm text-gray-500">john@example.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Hello, I need help with my account setup.
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2 hours ago
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-800 font-semibold">AS</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Alice Smith</div>
                        <div className="text-sm text-gray-500">alice@example.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    How can I upgrade my subscription plan?
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    5 hours ago
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}