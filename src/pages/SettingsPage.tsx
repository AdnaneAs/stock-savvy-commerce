
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const SettingsPage = () => {
  const { user, isAdmin, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const viewingUserId = searchParams.get("uid");
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);
  const [isViewingOtherUser, setIsViewingOtherUser] = useState(false);
  const [role, setRole] = useState("worker");
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userLoading && user) {
        try {
          if (viewingUserId && isAdmin && viewingUserId !== user?.uid) {
            const otherUserProfile = await getUserProfile(viewingUserId);
            if (otherUserProfile) {
              setViewingUser(otherUserProfile as UserProfile);
              setRole(otherUserProfile.role || "worker");
              setIsViewingOtherUser(true);
            } else {
              toast({
                variant: "destructive",
                title: "User not found",
                description: "The requested user profile could not be found",
              });
              setError("User profile not found");
            }
          } else {
            setRole(user?.role || "worker");
            setIsViewingOtherUser(false);
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
          toast({
            variant: "destructive",
            title: "Error loading profile",
            description: "There was a problem loading the user profile",
          });
          setError("Error loading user profile");
        } finally {
          setLoading(false);
        }
      } else if (!userLoading && !user) {
        setLoading(false);
        setError("You need to be logged in to view settings");
      }
    };

    loadUserProfile();
  }, [user, viewingUserId, isAdmin, toast, userLoading]);

  // Render loading state while user authentication is being checked
  if (userLoading || loading) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Display error if there is one
  if (error || !user) {
    return (
      <Layout>
        <div className="h-full flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading Settings</h2>
          <p className="text-muted-foreground">{error || "Authentication required"}</p>
        </div>
      </Layout>
    );
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isViewingOtherUser 
              ? `User Settings: ${viewingUser?.displayName || viewingUser?.email}` 
              : "Settings"}
          </h1>
          <p className="text-muted-foreground">
            {isViewingOtherUser 
              ? "Manage user account settings" 
              : "Manage your account settings and preferences"}
          </p>
        </div>
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-3 md:grid-cols-none h-auto md:h-10 mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="localization">Localization</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4 w-full">
            <div className="max-w-2xl">
              <ProfileSettings 
                user={user} 
                isViewingOtherUser={isViewingOtherUser} 
                viewingUser={viewingUser} 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="account" className="space-y-4 w-full">
            <div className="max-w-2xl">
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
            </div>
          </TabsContent>
          
          <TabsContent value="localization" className="space-y-4 w-full">
            <div className="max-w-2xl">
              <LocalizationSettings />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;
