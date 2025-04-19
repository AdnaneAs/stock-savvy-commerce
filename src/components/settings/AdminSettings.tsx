
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Users, Lock } from "lucide-react";

const AdminSettings = () => {
  const { toast } = useToast();

  return (
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
  );
};

export default AdminSettings;
