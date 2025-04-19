
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus, Settings, Shield, UserPlus, UserX, Building, Briefcase } from "lucide-react";
import { useUser } from "@/components/auth/RequireAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAllUsers, updateUserRole } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  createUserWithEmailAndPassword,
  getAuth
} from "firebase/auth";
import { createUserProfile } from "@/lib/firebase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: "admin" | "owner" | "worker";
  status?: "Active" | "Invited" | "Inactive";
  invitedUsers: string[];
  invitedBy?: string;
  photoURL?: string;
}

const UsersPage = () => {
  const { user: currentUser, isAdmin, isOwner } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<"worker" | "owner">("worker");
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const userList = await getAllUsers();
      setUsers(userList as User[]);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error loading users",
        description: "Could not fetch user list",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const canInviteMoreUsers = () => {
    if (!currentUser) return false;
    if (isAdmin) return true;
    if (isOwner) return currentUser.invitedUsers?.length < 5;
    
    // Workers can only invite up to 2 users
    return currentUser.invitedUsers?.length < 2;
  };

  const getInviteLimit = () => {
    if (isAdmin) return "∞";
    if (isOwner) return "5";
    return "2";
  };

  const handleInviteUser = async () => {
    if (!canInviteMoreUsers()) {
      toast({
        variant: "destructive",
        title: "Invitation limit reached",
        description: `You can only invite up to ${getInviteLimit()} users based on your role.`,
      });
      return;
    }

    setIsInviting(true);
    try {
      // Create new user account
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUserEmail,
        newUserPassword
      );
      
      const newUser = userCredential.user;

      // Create user profile
      await createUserProfile(newUser.uid, {
        email: newUserEmail,
        displayName: newUserName || newUserEmail.split("@")[0],
        role: newUserRole,
        invitedBy: currentUser?.uid,
        status: "Active",
        invitedUsers: []
      });

      toast({
        title: "User invited successfully",
        description: "New user has been added to the system",
      });

      // Reset form and refetch users
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserName("");
      setNewUserRole("worker");
      fetchUsers();
    } catch (error: any) {
      console.error("Error inviting user:", error);
      toast({
        variant: "destructive",
        title: "Failed to invite user",
        description: error.message || "An error occurred",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const changeUserRole = async (userId: string, newRole: "admin" | "owner" | "worker") => {
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "Only admins can change user roles",
      });
      return;
    }

    try {
      await updateUserRole(userId, newRole);
      
      toast({
        title: "Role updated",
        description: `User role has been changed to ${newRole}`,
      });
      
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        variant: "destructive",
        title: "Failed to update role",
        description: "An error occurred while updating user role",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'admin': return <Shield className="h-3 w-3" />;
      case 'owner': return <Building className="h-3 w-3" />;
      case 'worker': return <Briefcase className="h-3 w-3" />;
      default: return <Briefcase className="h-3 w-3" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch(role) {
      case 'admin': return "destructive";
      case 'owner': return "secondary";
      case 'worker': return "default";
      default: return "default";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              {isAdmin 
                ? "Manage all user accounts and permissions" 
                : isOwner
                  ? `You can invite up to 5 users (${currentUser?.invitedUsers?.length || 0}/5 used)`
                  : `You can invite up to 2 users (${currentUser?.invitedUsers?.length || 0}/2 used)`}
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" disabled={!canInviteMoreUsers()}>
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Invite new user</DialogTitle>
                <DialogDescription>
                  Create a new user account. They'll receive credentials to log in.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="col-span-3"
                    placeholder="John Doe"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email" 
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="col-span-3"
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="col-span-3"
                    placeholder="••••••••"
                    required
                  />
                </div>
                {(isAdmin || isOwner) && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      Role
                    </Label>
                    <Select 
                      value={newUserRole}
                      onValueChange={(value: "worker" | "owner") => setNewUserRole(value)}
                    >
                      <SelectTrigger id="role" className="col-span-3">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="worker">Worker</SelectItem>
                        {isAdmin && <SelectItem value="owner">Owner</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleInviteUser} disabled={isInviting}>
                  {isInviting ? "Adding user..." : "Add user"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Invited Users</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.photoURL || `https://i.pravatar.cc/150?u=${user.email}`} />
                          <AvatarFallback>
                            {user.displayName?.charAt(0) || user.email?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.displayName || user.email.split('@')[0]}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 w-fit capitalize">
                        {getRoleIcon(user.role)}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.invitedUsers?.length || 0}/{user.role === "admin" ? "∞" : user.role === "owner" ? "5" : "2"}
                    </TableCell>
                    <TableCell className="text-right">
                      {isAdmin && user.uid !== currentUser?.uid && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {user.role !== "admin" && (
                              <DropdownMenuItem onClick={() => changeUserRole(user.uid, "admin")}>
                                <Shield className="mr-2 h-4 w-4" />
                                Make admin
                              </DropdownMenuItem>
                            )}
                            {user.role !== "owner" && user.role !== "admin" && (
                              <DropdownMenuItem onClick={() => changeUserRole(user.uid, "owner")}>
                                <Building className="mr-2 h-4 w-4" />
                                Make owner
                              </DropdownMenuItem>
                            )}
                            {user.role !== "worker" && (
                              <DropdownMenuItem onClick={() => changeUserRole(user.uid, "worker")}>
                                <Briefcase className="mr-2 h-4 w-4" />
                                Make worker
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => {
                              // View user profile
                              window.location.href = `/settings?uid=${user.uid}`;
                            }}>
                              <Settings className="mr-2 h-4 w-4" />
                              View profile
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default UsersPage;
