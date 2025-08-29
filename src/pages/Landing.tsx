import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, BookOpen, Users, Award } from "lucide-react";

const Landing = () => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && userProfile) {
      // Redirect authenticated users to appropriate dashboard
      const role = userProfile.role;
      navigate(`/dashboard/${role}`);
    }
  }, [user, userProfile, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/80 to-primary/60">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-white" />
              <div>
                <h1 className="text-xl font-bold text-white">
                  Skill Development Centre
                </h1>
                <p className="text-white/80 text-sm">University of the Punjab</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="border-white/30 text-white hover:bg-white/10"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate("/register")}
                className="bg-white text-primary hover:bg-white/90"
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Learn. Grow. Succeed.
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Join the premier Learning Management System of University of the Punjab. 
            Access world-class courses, track your progress, and achieve your academic goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/register")}
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-4"
            >
              Get Started Today
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/login")}
              className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Comprehensive Courses
              </h3>
              <p className="text-white/80">
                Access a wide range of courses designed by expert faculty members
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Expert Instructors
              </h3>
              <p className="text-white/80">
                Learn from qualified teachers and industry professionals
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6 text-center">
              <Award className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Track Progress
              </h3>
              <p className="text-white/80">
                Monitor your learning journey with detailed progress tracking
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Contact Us</h3>
            <p className="text-white/80 mb-2">Need help getting started?</p>
            <p className="text-white font-semibold">+92 330 5409555</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Landing;