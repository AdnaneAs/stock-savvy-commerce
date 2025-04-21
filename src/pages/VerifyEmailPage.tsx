
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-stocksavvy-700 to-teal-700 p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg space-y-6">
        <h1 className="text-2xl font-bold text-center">Verify your email</h1>
        <p className="text-muted-foreground text-center">
          A verification email has been sent to your email address.<br />
          Please check your inbox and click the link to verify your account before accessing the dashboard.
        </p>
        <Button className="w-full mt-4" onClick={() => navigate("/")}>Go to Dashboard</Button>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
