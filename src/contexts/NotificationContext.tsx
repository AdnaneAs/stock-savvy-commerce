
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Notification {
  id: number;
  message: string;
  time: string;
  unread: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  clearNotifications: () => void;
  unreadCount: number;
  showNotificationDetails: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const savedNotifications = localStorage.getItem('notifications');
    return savedNotifications 
      ? JSON.parse(savedNotifications) 
      : [
          { id: 1, message: "Low stock alert: USB Flash Drive 32GB", time: "10 min ago", unread: true },
          { id: 2, message: "New order received", time: "1 hour ago", unread: true },
          { id: 3, message: "Inventory update completed", time: "3 hours ago", unread: false },
        ];
  });

  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // Calculate unread count
  const unreadCount = notifications.filter(notification => notification.unread).length;

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, unread: false } 
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, unread: false }))
    );
  };

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newId = notifications.length > 0 
      ? Math.max(...notifications.map(n => n.id)) + 1 
      : 1;
    
    setNotifications(prev => [
      { ...notification, id: newId, unread: true },
      ...prev
    ]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };
  
  const showNotificationDetails = (id: number) => {
    // Mark notification as read
    markAsRead(id);
    
    // Find the notification to show details
    const notification = notifications.find(n => n.id === id);
    
    if (notification) {
      setSelectedNotification(notification);
      // Implement any other logic needed when showing notification details
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      markAsRead,
      markAllAsRead,
      addNotification,
      clearNotifications,
      unreadCount,
      showNotificationDetails
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
