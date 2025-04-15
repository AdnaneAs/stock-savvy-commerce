
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/components/auth/RequireAuth";
import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SettingsPage = () => {
  const { user, isAdmin } = useUser();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Update in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName,
        photoURL
      });
      
      // Update in Firebase Auth if user is currently signed in
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, {
          displayName,
          photoURL
        });
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
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
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings
          </p>
        </div>
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={photoURL || `https://i.pravatar.cc/150?u=${user?.email}`} />
                  <AvatarFallback className="text-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
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
                  <Label htmlFor="photoURL">Profile Picture URL</Label>
                  <Input
                    id="photoURL"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={isAdmin ? "Administrator" : "User"}
                    disabled
                    className="bg-gray-50"
                  />
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
          
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
                <CardDescription>Platform configuration options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  As an administrator, you have access to all user accounts and system settings.
                </p>
                <Separator />
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">User Management</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage all user accounts on the platform
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = "/users"}
                    >
                      Manage
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">System Settings</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure global platform settings
                      </p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "System settings",
                          description: "This feature is coming soon",
                        });
                      }}
                    >
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
