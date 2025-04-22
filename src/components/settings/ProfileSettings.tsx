
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/components/auth/RequireAuth";
import { updateProfile } from "firebase/auth";
import { auth, updateUser } from "@/lib/firebase";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, User, Loader2, Upload } from "lucide-react";
import useAvatarUpload from "@/hooks/useAvatarUpload";

interface ProfileSettingsProps {
  user: UserProfile;
  isViewingOtherUser: boolean;
  viewingUser: UserProfile | null;
}

const ProfileSettings = ({ user, isViewingOtherUser, viewingUser }: ProfileSettingsProps) => {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(isViewingOtherUser ? viewingUser?.displayName || "" : user?.displayName || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const email = isViewingOtherUser ? viewingUser?.email : user?.email;
  const role = isViewingOtherUser ? viewingUser?.role : user?.role;
  const invitedUsers = isViewingOtherUser ? viewingUser?.invitedUsers || [] : user?.invitedUsers || [];

  // Avatar Upload Logic
  const initialPhotoURL = isViewingOtherUser 
    ? viewingUser?.photoURL || `https://i.pravatar.cc/150?u=${email}` 
    : user?.photoURL || `https://i.pravatar.cc/150?u=${email}`;
  const { avatarUrl, uploading, handleAvatarUpload, setAvatarUrl } = useAvatarUpload(initialPhotoURL);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync avatar with user prop changes (if necessary)
  useEffect(() => {
    setAvatarUrl(initialPhotoURL);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.photoURL, viewingUser?.photoURL]);

  const handleUpdateProfile = async () => {
    const targetUser = isViewingOtherUser ? viewingUser : user;
    if (!targetUser) return;
    
    setIsSubmitting(true);
    try {
      await updateUser(targetUser.uid, {
        displayName,
        photoURL: avatarUrl
      });

      // If updating current user, also update Auth profile
      if (!isViewingOtherUser && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName,
          photoURL: avatarUrl
        });
      }
      
      toast({
        title: "Profile updated",
        description: isViewingOtherUser 
          ? "User profile has been updated successfully" 
          : "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating the profile",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          {isViewingOtherUser 
            ? "Update user profile information" 
            : "Update your personal information"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              {displayName?.charAt(0) || email?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="relative">
            <Input
              id="avatar-settings"
              type="file"
              accept="image/jpeg, image/png, image/gif"
              className="hidden"
              onChange={handleAvatarUpload}
              ref={fileInputRef}
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Change Avatar
            </Button>
          </div>
          <Badge variant={role === "admin" ? "destructive" : "default"} className="flex items-center gap-1">
            {role === "admin" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
            {role === "admin" ? "Administrator" : "User"}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              disabled
              className="bg-gray-50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={role === "admin" ? "Administrator" : "User"}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label>Invited Users</Label>
            <div className="p-2 border rounded-md bg-gray-50">
              {invitedUsers && invitedUsers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {invitedUsers.map((userId, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Invited User {index + 1}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No users invited yet</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleUpdateProfile}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileSettings;
