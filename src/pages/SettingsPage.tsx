
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/components/auth/RequireAuth";
import { getUserProfile } from "@/lib/firebase";
import { UserProfile } from "@/components/auth/RequireAuth";
import ProfileSettings from "@/components/settings/ProfileSettings";
import AdminSettings from "@/components/settings/AdminSettings";
import UserManagementSettings from "@/components/settings/UserManagementSettings";
import UserSettings from "@/components/settings/UserSettings";
import LocalizationSettings from "@/components/settings/LocalizationSettings";

const SettingsPage = () => {
  const { user, isAdmin } = useUser();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const viewingUserId = searchParams.get("uid");
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);
  const [isViewingOtherUser, setIsViewingOtherUser] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    const loadUserProfile = async () => {
      if (viewingUserId && isAdmin && viewingUserId !== user?.uid) {
        try {
          const otherUserProfile = await getUserProfile(viewingUserId);
          if (otherUserProfile) {
            setViewingUser(otherUserProfile as UserProfile);
            setRole(otherUserProfile.role || "user");
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
      } else {
        setRole(user?.role || "user");
        setIsViewingOtherUser(false);
      }
    };

    loadUserProfile();
  }, [user, viewingUserId, isAdmin, toast]);

  if (!user) return null;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isViewingOtherUser 
              ? `User Settings: ${viewingUser?.displayName || viewingUser?.email}` 
              : "Settings"}
          </h1>
          <p className="text-muted-foreground">
            {isViewingOtherUser 
              ? "Manage user account settings" 
              : "Manage your account settings"}
          </p>
        </div>
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <ProfileSettings 
            user={user} 
            isViewingOtherUser={isViewingOtherUser} 
            viewingUser={viewingUser} 
          />

          {(isAdmin && !isViewingOtherUser) ? (
            <AdminSettings />
          ) : isViewingOtherUser ? (
            <UserManagementSettings 
              viewingUser={viewingUser!} 
              role={role} 
              setRole={setRole}
            />
          ) : (
            <UserSettings user={user} />
          )}
          
          <LocalizationSettings />
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
