import React from 'react';
import Link from 'next/link';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Analytics', href: '/dashboard/analytics' },
    { name: 'All Messages', href: '/dashboard/messages' },
    { name: 'Settings', href: '/dashboard/settings' },
    { name: 'Profile', href: '/dashboard/profile' },
  ];

  return (
    <aside className="bg-gray-800 text-white h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Dashboard</h1>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
        © 2023 Dashboard
      </div>
    </aside>
  );
};

export default Sidebar;