
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
import { Badge } from "@/components/ui/badge";

interface UserSettingsProps {
  user: UserProfile;
}

const UserSettings = ({ user }: UserSettingsProps) => {
  const invitedUsers = user?.invitedUsers || [];
  const role = user?.role || "worker";

  // Determine invitation limit based on role
  const invitationLimit = role === 'admin' ? '∞' : role === 'owner' ? '5' : '2';
  const currentInvites = invitedUsers.length;
  
  // Determine if user can invite more users
  const canInvite = role === 'admin' || 
                   (role === 'owner' && currentInvites < 5) || 
                   (role === 'worker' && currentInvites < 2);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Manage your account preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <p className="text-sm">Your role:</p>
          <Badge className="capitalize">{role}</Badge>
        </div>
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
                {currentInvites}/{invitationLimit} invitations used
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/users"}
              disabled={!canInvite}
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
