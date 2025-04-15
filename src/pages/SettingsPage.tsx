
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/components/auth/RequireAuth";
import { db, auth, getUserProfile } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
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
import { Badge } from "@/components/ui/badge";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Shield, User, Users, Lock } from "lucide-react";
import { UserProfile } from "@/components/auth/RequireAuth";

const SettingsPage = () => {
  const { user, isAdmin } = useUser();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const viewingUserId = searchParams.get("uid");
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);
  const [isViewingOtherUser, setIsViewingOtherUser] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);

  useEffect(() => {
    const loadUserProfile = async () => {
      // Check if admin is viewing another user's profile
      if (viewingUserId && isAdmin && viewingUserId !== user?.uid) {
        try {
          const otherUserProfile = await getUserProfile(viewingUserId);
          if (otherUserProfile) {
            setViewingUser(otherUserProfile as UserProfile);
            setDisplayName(otherUserProfile.displayName || "");
            setPhotoURL(otherUserProfile.photoURL || "");
            setEmail(otherUserProfile.email || "");
            setRole(otherUserProfile.role || "user");
            setInvitedUsers(otherUserProfile.invitedUsers || []);
            setIsViewingOtherUser(true);
          } else {
            toast({
              variant: "destructive",
              title: "User not found",
              description: "The requested user profile could not be found",
            });
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
          toast({
            variant: "destructive",
            title: "Error loading profile",
            description: "There was a problem loading the user profile",
          });
        }
      } else if (user) {
        // Loading current user's profile
        setDisplayName(user.displayName || "");
        setPhotoURL(user.photoURL || "");
        setEmail(user.email || "");
        setRole(user.role || "user");
        setInvitedUsers(user.invitedUsers || []);
        setIsViewingOtherUser(false);
      }
    };

    loadUserProfile();
  }, [user, viewingUserId, isAdmin, toast]);

  const handleUpdateProfile = async () => {
    const targetUser = isViewingOtherUser ? viewingUser : user;
    if (!targetUser) return;
    
    setIsSubmitting(true);
    try {
      // Update in Firestore
      const userRef = doc(db, "users", targetUser.uid);
      await updateDoc(userRef, {
        displayName,
        photoURL
      });
      
      // Update in Firebase Auth if user is updating their own profile
      if (!isViewingOtherUser && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName,
          photoURL
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
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isViewingOtherUser 
              ? `User Settings: ${displayName || email}` 
              : "Settings"}
          </h1>
          <p className="text-muted-foreground">
            {isViewingOtherUser 
              ? "Manage user account settings" 
              : "Manage your account settings"}
          </p>
        </div>
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
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
                  <AvatarImage src={photoURL || `https://i.pravatar.cc/150?u=${email}`} />
                  <AvatarFallback className="text-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                    {displayName?.charAt(0) || email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
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
          
          {(isAdmin && !isViewingOtherUser) ? (
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
                      <Users className="mr-2 h-4 w-4" />
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
                      <Lock className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : isViewingOtherUser ? (
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage this user's account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  As an administrator, you can manage this user's permissions and access.
                </p>
                <Separator />
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">User Role</h3>
                      <p className="text-sm text-muted-foreground">
                        Change user role and permissions
                      </p>
                    </div>
                    <Button
                      variant={role === "admin" ? "destructive" : "outline"}
                      onClick={async () => {
                        if (!viewingUser) return;
                        
                        try {
                          const newRole = role === "admin" ? "user" : "admin";
                          const userRef = doc(db, "users", viewingUser.uid);
                          await updateDoc(userRef, { role: newRole });
                          setRole(newRole);
                          
                          toast({
                            title: "Role updated",
                            description: `User role has been changed to ${newRole}`,
                          });
                        } catch (error) {
                          console.error("Error updating user role:", error);
                          toast({
                            variant: "destructive",
                            title: "Failed to update role",
                            description: "An error occurred while updating user role",
                          });
                        }
                      }}
                    >
                      {role === "admin" ? (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Remove Admin Role
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Make Admin
                        </>
                      )}
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">User Products</h3>
                      <p className="text-sm text-muted-foreground">
                        View this user's products
                      </p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "User products",
                          description: "This feature is coming soon",
                        });
                      }}
                    >
                      View Products
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Customize your account settings and preferences.
                </p>
                <Separator />
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Your Products</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage your inventory items
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = "/products"}
                    >
                      Manage
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">User Invitations</h3>
                      <p className="text-sm text-muted-foreground">
                        {invitedUsers?.length || 0}/2 invitations used
                      </p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = "/users"}
                      disabled={invitedUsers?.length >= 2}
                    >
                      Invite User
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
