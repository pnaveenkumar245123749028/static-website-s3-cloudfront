import { useState, useEffect } from 'react';
import Sidebar from './Sidebar.js';
import Header from './Header.js';
import NotificationsDrawer from './NotificationsDrawer.js';
import { useAuthStore } from '../../store/authStore.js';
import { useNotificationStore } from '../../store/notificationStore.js';

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { token } = useAuthStore();
  const { setupSocketListener, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    if (token) {
      setupSocketListener(token);
      fetchNotifications();
    }
  }, [token, setupSocketListener, fetchNotifications]);

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Container */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationsDrawer />
    </div>
  );
}
