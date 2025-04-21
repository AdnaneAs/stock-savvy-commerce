
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
  role: "admin" | "owner" | "worker";
  invitedUsers: string[];
  products?: string[];
  photoURL?: string;
  createdAt: Date | string;
}

// Create a context to store and access user data globally
import { createContext, useContext } from "react";

export const UserContext = createContext<{
  user: UserProfile | null;
  isAdmin: boolean;
  isOwner: boolean;
  loading: boolean;
  firebaseInitialized: boolean;
}>({
  user: null,
  isAdmin: false,
  isOwner: false,
  loading: true,
  firebaseInitialized: false
});

export const useUser = () => useContext(UserContext);

const RequireAuth = ({ children }: RequireAuthProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    console.log("RequireAuth component mounted");
    
    const firebasePromise = import("../../lib/firebase").then(() => {
      console.log("Firebase initialized in RequireAuth");
      setFirebaseInitialized(true);
    });
    
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      console.log("Auth state changed:", authUser ? "User logged in" : "No user");
      
      // Ensure Firebase is initialized before proceeding
      await firebasePromise;
      
      if (authUser) {
        setIsAuthenticated(true);
        
        try {
          // Fetch user profile from database
          const userProfile = await getUserProfile(authUser.uid);
          console.log("User profile retrieved:", userProfile);
          
          if (userProfile) {
            setUser(userProfile as UserProfile);
          } else {
            // This shouldn't happen unless there's a database inconsistency
            console.error("User authenticated but profile not found in database");
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
    
    return () => {
      console.log("RequireAuth component unmounting");
      unsubscribe();
    };
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  return (
    <UserContext.Provider value={{ 
      user, 
      isAdmin: user?.role === "admin",
      isOwner: user?.role === "owner",
      loading: isLoading,
      firebaseInitialized
    }}>
      {children}
    </UserContext.Provider>
  );
};

export default RequireAuth;
