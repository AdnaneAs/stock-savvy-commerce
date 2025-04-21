
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Notification } from '@/contexts/NotificationContext';

interface NotificationModalProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
}

const NotificationModal = ({ notification, isOpen, onClose }: NotificationModalProps) => {
  if (!notification) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">Notification</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {notification.time}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4">
          <p className="text-base">{notification.message}</p>
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationModal;
