
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationModal from '../notifications/NotificationModal';
import { Notification } from '@/contexts/NotificationContext';

const NotificationsDropdown = () => {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    unreadCount 
  } = useNotifications();
  
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setSelectedNotification(notification);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedNotification(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] text-xs flex items-center justify-center"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <h2 className="font-semibold text-sm">Notifications</h2>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-8" 
                onClick={() => markAllAsRead()}
              >
                Mark all as read
              </Button>
            )}
          </div>
          
          {notifications.length > 0 ? (
            <ScrollArea className="h-[300px]">
              {notifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id}
                  className={`flex flex-col items-start p-3 cursor-pointer border-b last:border-b-0 ${
                    notification.unread ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start w-full">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                    {notification.unread && (
                      <Badge variant="default" className="ml-2 h-2 w-2 rounded-full p-0" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              No notifications
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <NotificationModal
        notification={selectedNotification}
        isOpen={modalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default NotificationsDropdown;
