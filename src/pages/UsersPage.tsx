
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus, Settings, Shield, UserPlus, UserX, Lock, Key } from "lucide-react";
import { useUser } from "@/components/auth/RequireAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db, createUserProfile } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  createUserWithEmailAndPassword,
  getAuth
} from "firebase/auth";

interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: "admin" | "user";
  status?: "Active" | "Invited" | "Inactive";
  invitedUsers: string[];
  invitedBy?: string;
  photoURL?: string;
}

const UsersPage = () => {
  const { user: currentUser, isAdmin } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersCol = collection(db, "users");
      const userSnapshot = await getDocs(usersCol);
      const userList: User[] = [];
      userSnapshot.forEach(doc => {
        userList.push(doc.data() as User);
      });
      setUsers(userList);
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
    
    // Regular users can only invite up to 2 users
    return currentUser.invitedUsers?.length < 2;
  };

  const handleInviteUser = async () => {
    if (!canInviteMoreUsers()) {
      toast({
        variant: "destructive",
        title: "Invitation limit reached",
        description: "You can only invite up to 2 users. Contact admin for more.",
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

      // Create user profile in Firestore
      await createUserProfile(newUser.uid, {
        email: newUserEmail,
        displayName: newUserName || newUserEmail.split("@")[0],
        role: "user",
        invitedBy: currentUser?.uid,
        status: "Active",
        invitedUsers: []
      });

      // Update inviter's invited users list
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
          invitedUsers: [...(currentUser.invitedUsers || []), newUser.uid]
        });
      }

      toast({
        title: "User invited successfully",
        description: "New user has been added to the system",
      });

      // Reset form and refetch users
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserName("");
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

  const changeUserRole = async (userId: string, newRole: "admin" | "user") => {
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "Only admins can change user roles",
      });
      return;
    }

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              {isAdmin 
                ? "Manage all user accounts and permissions" 
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
                      <Badge variant={user.role === "admin" ? "destructive" : "default"} className="flex items-center gap-1 w-fit">
                        {user.role === "admin" && <Shield className="h-3 w-3" />}
                        {user.role === "admin" ? "Admin" : "User"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.invitedUsers?.length || 0}/{user.role === "admin" ? "∞" : "2"}
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
                            <DropdownMenuItem onClick={() => changeUserRole(user.uid, user.role === "admin" ? "user" : "admin")}>
                              {user.role === "admin" ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Remove admin role
                                </>
                              ) : (
                                <>
                                  <Shield className="mr-2 h-4 w-4" />
                                  Make admin
                                </>
                              )}
                            </DropdownMenuItem>
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
