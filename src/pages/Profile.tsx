
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useUser } from "@/components/auth/RequireAuth";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import useAvatarUpload from "@/hooks/useAvatarUpload";
import { userApi } from "@/services/api";

const Profile = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { avatarUrl, uploading, handleAvatarUpload } = useAvatarUpload(
    user?.photoURL || `https://i.pravatar.cc/150?u=${user?.email}`
  );

  const handleUpdateProfile = async () => {
    if (!user || !auth.currentUser) return;
    
    setIsSubmitting(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: displayName,
      });

      // Update profile in our backend
      await userApi.updateProfile({ 
        name: displayName 
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Profile update failed",
        description: "There was an error updating your profile",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            View and update your account information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Manage your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} alt={user?.displayName || user?.email || ""} />
                  <AvatarFallback>
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2">
                  <label htmlFor="avatar" className="rounded-full bg-primary p-1.5 text-white shadow-sm cursor-pointer hover:bg-primary/90">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
                      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                    </svg>
                    <span className="sr-only">Change avatar</span>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-lg font-medium">{user?.displayName || "User"}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="flex justify-center sm:justify-start">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    user?.role === "admin" 
                      ? "bg-destructive/10 text-destructive" 
                      : "bg-primary/10 text-primary"
                  }`}>
                    {user?.role === "admin" 
                      ? "Administrator" 
                      : user?.role === "owner" 
                        ? "Owner" 
                        : "Worker"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Account Information</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditing(!isEditing)} 
                  disabled={isSubmitting}
                >
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="displayName" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <Button 
                    onClick={handleUpdateProfile} 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium">Full Name</div>
                    <div className="col-span-2 text-sm">{user?.displayName || "Not specified"}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium">Email</div>
                    <div className="col-span-2 text-sm">{user?.email}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium">Member since</div>
                    <div className="col-span-2 text-sm">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "Unknown"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
