'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { db } from '../../../firebase/firebase';
import { collection, query, onSnapshot, orderBy, limit, where } from 'firebase/firestore';

interface UserActivity {
  id: string;
  uid: string;
  displayName: string;
  lastActive: any;
  isActive: boolean;
}

interface Message {
  id: string;
  text: string;
  uid: string;
  displayName: string;
  timestamp: any;
  isRead: boolean;
}

export default function AnalyticsPage() {
  const [users, setUsers] = useState<UserActivity[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);

  useEffect(() => {
    // Fetch user activity data
    const usersQuery = query(collection(db, 'userStatus'));
    const unsubscribeUsers = onSnapshot(usersQuery, (querySnapshot) => {
      const usersData: UserActivity[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          id: doc.id,
          uid: data.uid,
          displayName: data.displayName,
          lastActive: data.lastActive,
          isActive: data.isActive
        } as UserActivity);
      });
      setUsers(usersData);
      setTotalUsers(querySnapshot.size);
      setActiveUsers(querySnapshot.docs.filter(doc => doc.data().isActive).length);
    });

    // Fetch message data
    const messagesQuery = query(
      collection(db, 'chats'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const unsubscribeMessages = onSnapshot(messagesQuery, (querySnapshot) => {
      const messagesData: Message[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messagesData.push({
          id: doc.id,
          text: data.text,
          uid: data.uid,
          displayName: data.displayName,
          timestamp: data.timestamp,
          isRead: data.isRead
        } as Message);
      });
      setMessages(messagesData);
      setTotalMessages(querySnapshot.size);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeMessages();
    };
  }, []);

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Analytics</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Users</h2>
            <p className="text-3xl font-bold text-blue-600">{totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Active Users</h2>
            <p className="text-3xl font-bold text-green-600">{activeUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Messages</h2>
            <p className="text-3xl font-bold text-purple-600">{totalMessages}</p>
          </div>
        </div>
        
        {/* User Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">User Activity</h2>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">User</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.uid} className="border-b">
                      <td className="py-3">
                        <div className="font-medium">{user.displayName || 'Anonymous'}</div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.isActive ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {user.lastActive ? formatTimeAgo(user.lastActive) : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Recent Messages */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Recent Messages</h2>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">User</th>
                    <th className="text-left py-2">Message</th>
                    <th className="text-left py-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg.id} className="border-b">
                      <td className="py-3">
                        <div className="font-medium">{msg.displayName || 'Anonymous'}</div>
                      </td>
                      <td className="py-3">
                        <div className="text-sm max-w-xs truncate">{msg.text}</div>
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {msg.timestamp ? formatTimeAgo(msg.timestamp) : 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Additional Insights */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">User Engagement</h3>
              <p className="text-sm text-gray-700">
                {activeUsers > 0
                  ? `${Math.round((activeUsers / totalUsers) * 100)}% of users are currently active`
                  : 'No active users at the moment'}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-800 mb-2">Message Volume</h3>
              <p className="text-sm text-gray-700">
                {totalMessages > 0
                  ? `Average of ${Math.round(totalMessages / totalUsers)} messages per user`
                  : 'No messages yet'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}