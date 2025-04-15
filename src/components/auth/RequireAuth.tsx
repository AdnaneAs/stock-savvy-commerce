
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, getUserProfile } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RequireAuthProps {
  children: React.ReactNode;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: "admin" | "user";
  invitedUsers: string[];
  products: string[];
  photoURL?: string;
  createdAt: Date;
}

// Create a context to store and access user data globally
import { createContext, useContext } from "react";

export const UserContext = createContext<{
  user: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
}>({
  user: null,
  isAdmin: false,
  loading: true
});

export const useUser = () => useContext(UserContext);

const RequireAuth = ({ children }: RequireAuthProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setIsAuthenticated(true);
        
        try {
          // Fetch user profile from Firestore
          const userProfile = await getUserProfile(authUser.uid);
          if (userProfile) {
            setUser(userProfile as UserProfile);
          } else {
            // This shouldn't happen unless there's a database inconsistency
            toast({
              variant: "destructive",
              title: "User profile not found",
              description: "There was an issue loading your profile",
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast({
            variant: "destructive",
            title: "Error loading profile",
            description: "Please try again later",
          });
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <UserContext.Provider value={{ 
      user, 
      isAdmin: user?.role === "admin",
      loading: isLoading 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export default RequireAuth;
