
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserProfile } from "@/components/auth/RequireAuth";

interface UserSettingsProps {
  user: UserProfile;
}

const UserSettings = ({ user }: UserSettingsProps) => {
  const invitedUsers = user?.invitedUsers || [];

  return (
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
                {invitedUsers.length}/2 invitations used
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/users"}
              disabled={invitedUsers.length >= 2}
            >
              Invite User
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSettings;
