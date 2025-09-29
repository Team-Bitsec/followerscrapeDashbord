"use client";

import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  where,
  limit,
  Timestamp,
} from "firebase/firestore";

interface User {
  uid: string;
  displayName: string;
  lastActive: Timestamp;
  isActive: boolean;
}

interface Message {
  id: string;
  text: string;
  uid: string;
  displayName: string;
  timestamp: Timestamp;
  isRead: boolean;
  isAdmin?: boolean;
  recipientId?: string;
}

interface Notification {
  id: string;
  message: string;
  userId: string;
  userName: string;
  timestamp: Timestamp;
  isRead: boolean;
}

export default function AllMessagesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch users from chatbot conversations and also from existing userStatus
  useEffect(() => {
    // Listen to userStatus collection
    const statusQuery = query(
      collection(db, "userStatus"),
      orderBy("lastActive", "desc")
    );

    const unsubscribeStatus = onSnapshot(statusQuery, (querySnapshot) => {
      const statusUsers: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        statusUsers.push({
          uid: data.uid,
          displayName: data.displayName,
          lastActive: data.lastActive,
          isActive: data.isActive,
        } as User);
      });

      // Listen to chats collection to find users who have sent messages
      const chatsQuery = query(collection(db, "chats"));
      const unsubscribeChats = onSnapshot(chatsQuery, (chatsSnapshot) => {
        const chatUsers = new Map();

        chatsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.uid && data.uid !== "admin" && !data.isAdmin) {
            chatUsers.set(data.uid, {
              uid: data.uid,
              displayName: data.displayName || "Anonymous",
              lastActive: data.timestamp,
              isActive: false, // will be overridden if in statusUsers
            });
          }
        });

        // Merge users from both sources
        const allUsers = new Map();

        // Add users from status first
        statusUsers.forEach((user) => {
          allUsers.set(user.uid, user);
        });

        // Add users from chats if not already present
        chatUsers.forEach((user, uid) => {
          if (!allUsers.has(uid)) {
            allUsers.set(uid, user);
          }
        });

        setUsers(Array.from(allUsers.values()));
      });

      return () => unsubscribeChats();
    });

    return () => unsubscribeStatus();
  }, []);

  // Fetch all messages
  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData: Message[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messagesData.push({
          id: doc.id,
          text: data.text,
          uid: data.uid,
          displayName: data.displayName,
          timestamp: data.timestamp,
          isRead: data.isRead,
          isAdmin: data.isAdmin || false,
          recipientId: data.recipientId,
        } as Message);
      });
      setMessages(messagesData);

      // Mark user messages as read when admin views them
      if (selectedUser) {
        const userMessages = messagesData.filter(
          (msg) => msg.uid === selectedUser.uid && !msg.isRead && !msg.isAdmin
        );
        userMessages.forEach(async (msg) => {
          await updateDoc(doc(db, "chats", msg.id), { isRead: true });
        });
      }
    });

    return () => unsubscribe();
  }, [selectedUser]);

  // Count unread messages
  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      where("isRead", "==", false)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setUnreadCount(querySnapshot.size);

      // Mark notifications as read when viewing messages
      querySnapshot.forEach((doc) => {
        updateDoc(doc.ref, { isRead: true });
      });
    });

    return () => unsubscribe();
  }, []);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
  };

  const handleSendMessage = async () => {
    if (!selectedUser || !newMessage.trim()) return;

    try {
      // Send message to both collections for compatibility

      // 1. Send to the admin dashboard format (chats collection)
      await addDoc(collection(db, "chats"), {
        text: newMessage,
        uid: "admin",
        displayName: "Admin",
        timestamp: serverTimestamp(),
        isRead: false,
        recipientId: selectedUser.uid,
        isAdmin: true,
      });

      // 2. Send to the user's conversation collection (for chatbot)
      await addDoc(
        collection(db, "conversations", selectedUser.uid, "messages"),
        {
          sender: "admin",
          content: newMessage,
          createdAt: serverTimestamp(),
          userId: "admin",
        }
      );

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTimeAgo = (timestamp: Timestamp | null) => {
    if (!timestamp) return "Unknown";

    const date = timestamp.toDate ? timestamp.toDate() : new Date();
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const getUserMessages = () => {
    if (!selectedUser) return [];
    return messages
      .filter(
        (msg) =>
          (msg.uid === selectedUser.uid && !msg.isAdmin) ||
          (msg.recipientId === selectedUser.uid && msg.isAdmin) ||
          (msg.uid === "admin" && msg.recipientId === selectedUser.uid)
      )
      .reverse();
  };

  const getUnreadCountForUser = (userId: string) => {
    return messages.filter(
      (msg) => msg.uid === userId && !msg.isRead && !msg.isAdmin
    ).length;
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Manage conversations with your users</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Users List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                  Users
                </h2>
                {users.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {users.length} user{users.length > 1 ? "s" : ""} available
                  </p>
                )}
              </div>
              <div className="p-4">
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {users.length > 0 ? (
                    users.map((user) => {
                      const unreadCount = getUnreadCountForUser(user.uid);
                      return (
                        <div
                          key={user.uid}
                          className={`group p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                            selectedUser?.uid === user.uid
                              ? "bg-blue-50 border-blue-200 shadow-md ring-2 ring-blue-100"
                              : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm"
                          }`}
                          onClick={() => handleSelectUser(user)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="relative">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                                    selectedUser?.uid === user.uid
                                      ? "bg-blue-500"
                                      : "bg-gradient-to-br from-indigo-500 to-purple-600"
                                  }`}
                                >
                                  {(user.displayName || "A")
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                                {user.isActive && (
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full">
                                    <div className="w-full h-full bg-green-500 rounded-full animate-pulse"></div>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3
                                  className={`font-medium truncate ${
                                    selectedUser?.uid === user.uid
                                      ? "text-blue-900"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {user.displayName || "Anonymous User"}
                                </h3>
                                <p
                                  className={`text-xs truncate ${
                                    selectedUser?.uid === user.uid
                                      ? "text-blue-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {user.isActive ? (
                                    <span className="flex items-center">
                                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                                      Online now
                                    </span>
                                  ) : (
                                    `Last seen ${formatTimeAgo(
                                      user.lastActive
                                    )}`
                                  )}
                                </p>
                              </div>
                            </div>
                            {unreadCount > 0 && (
                              <div className="flex items-center">
                                <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-bounce">
                                  {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">
                        No users available
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Users will appear here when they send messages
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[600px] flex flex-col">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {(selectedUser.displayName || "A")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        {selectedUser.isActive && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full">
                            <div className="w-full h-full bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {selectedUser.displayName || "Anonymous User"}
                        </h2>
                        <p className="text-sm text-gray-600 flex items-center">
                          {selectedUser.isActive ? (
                            <>
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                              Online now
                            </>
                          ) : (
                            `Last seen ${formatTimeAgo(
                              selectedUser.lastActive
                            )}`
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages Container */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {getUserMessages().map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.isAdmin ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl p-4 rounded-2xl shadow-sm ${
                            msg.isAdmin
                              ? "bg-blue-500 text-white ml-auto"
                              : "bg-white border border-gray-200 text-gray-900"
                          }`}
                        >
                          <div
                            className={`font-medium text-sm mb-1 ${
                              msg.isAdmin ? "text-blue-100" : "text-gray-600"
                            }`}
                          >
                            {msg.isAdmin
                              ? "Admin"
                              : msg.displayName || "Anonymous"}
                          </div>
                          <div className="text-sm leading-relaxed break-words">
                            {msg.text}
                          </div>
                          <div
                            className={`text-xs mt-2 ${
                              msg.isAdmin ? "text-blue-200" : "text-gray-500"
                            }`}
                          >
                            {msg.timestamp && formatTimeAgo(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-gray-900 transition-all duration-200"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                      />
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                        <span>Send</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9 8a9.013 9.013 0 01-5-1.484l-4.47 1.47a.865.865 0 01-1.06-1.07l1.47-4.47A9 9 0 1021 12z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-500">
                      Choose a user from the list to start chatting
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
