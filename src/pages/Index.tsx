import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const Index = () => {
  const { user, userProfile, session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect non-authenticated users to landing page
        navigate("/landing");
      } else if (userProfile) {
        // Redirect authenticated users to their dashboard
        const role = userProfile.role;
        navigate(`/dashboard/${role}`);
      } else {
        // Fallback: use JWT role to avoid redirect stall if profile read fails
        const jwtRole = (session?.user?.user_metadata as any)?.role;
        if (jwtRole) {
          navigate(`/dashboard/${jwtRole}`);
        }
      }
    }
  }, [user, userProfile, session, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p>Redirecting...</p>
      </div>
    </div>
  );
};

export default Index;