
import { doc, updateDoc } from "firebase/firestore";
import { db, updateUserRole } from "@/lib/firebase";
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
import { Shield, Building, Briefcase } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserManagementSettingsProps {
  viewingUser: UserProfile;
  role: string;
  setRole: (role: string) => void;
}

const UserManagementSettings = ({ viewingUser, role, setRole }: UserManagementSettingsProps) => {
  const { toast } = useToast();

  const handleRoleChange = async (newRole: string) => {
    try {
      await updateUserRole(viewingUser.uid, newRole as "admin" | "owner" | "worker");
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
  };

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
            <div className="w-[180px]">
              <Select value={role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin" className="flex items-center">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="owner">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Owner
                    </div>
                  </SelectItem>
                  <SelectItem value="worker">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Worker
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
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
