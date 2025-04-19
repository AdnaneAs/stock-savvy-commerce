
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/components/auth/RequireAuth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield } from "lucide-react";

interface UserManagementSettingsProps {
  viewingUser: UserProfile;
  role: string;
  setRole: (role: string) => void;
}

const UserManagementSettings = ({ viewingUser, role, setRole }: UserManagementSettingsProps) => {
  const { toast } = useToast();

  return (
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
  );
};

export default UserManagementSettings;
