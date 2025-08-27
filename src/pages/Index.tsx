import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import Navigation from "@/components/ui/navigation";
import HeroSection from "@/components/dashboard/hero-section";
import StatsCard from "@/components/ui/stats-card";
import CourseCard from "@/components/ui/course-card";
import QuickActions from "@/components/dashboard/quick-actions";
import RecentActivity from "@/components/dashboard/recent-activity";
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Award,
  TrendingUp,
  Clock
} from "lucide-react";

const Index = () => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect non-authenticated users to auth page
    if (!user && !loading) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-punjab-primary via-punjab-secondary to-punjab-accent flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  // Get user data from auth context
  const currentUser = {
    name: userProfile?.full_name || "User",
    role: (userProfile?.role?.toUpperCase() || 'STUDENT') as 'STUDENT' | 'TEACHER' | 'ADMIN',
    stats: {
      coursesEnrolled: 5,
      upcomingClasses: 3,
      completionRate: 78
    }
  };

  // Mock courses data
  const enrolledCourses = [
    {
      title: "Advanced Web Development with React",
      instructor: "Dr. Sarah Khan",
      description: "Master modern React concepts including hooks, context, and performance optimization.",
      progress: 65,
      duration: "12 weeks",
      startDate: "Sep 15, 2024",
      category: "Web Development",
      status: 'ACTIVE' as const
    },
    {
      title: "Database Design and Management",
      instructor: "Prof. Ahmed Ali",
      description: "Learn database design principles, SQL, and modern database management systems.",
      progress: 30,
      duration: "10 weeks",
      startDate: "Oct 1, 2024",
      category: "Database",
      status: 'ACTIVE' as const
    },
    {
      title: "Mobile App Development with Flutter",
      instructor: "Dr. Fatima Shah",
      description: "Build cross-platform mobile applications using Flutter and Dart.",
      progress: 0,
      duration: "14 weeks",
      startDate: "Nov 5, 2024",
      category: "Mobile Development",
      status: 'UPCOMING' as const
    },
    {
      title: "Digital Marketing Fundamentals",
      instructor: "Ms. Ayesha Malik",
      description: "Comprehensive introduction to digital marketing strategies and tools.",
      progress: 100,
      duration: "8 weeks",
      startDate: "Aug 1, 2024",
      category: "Marketing",
      status: 'COMPLETED' as const
    }
  ];

  const stats = [
    {
      title: "Total Courses",
      value: currentUser.stats.coursesEnrolled,
      description: "Currently enrolled",
      icon: BookOpen,
      trend: { value: 12, isPositive: true }
    },
    {
      title: "Upcoming Classes",
      value: currentUser.stats.upcomingClasses,
      description: "This week",
      icon: Calendar
    },
    {
      title: "Completion Rate",
      value: `${currentUser.stats.completionRate}%`,
      description: "Average progress",
      icon: TrendingUp,
      trend: { value: 8, isPositive: true }
    },
    {
      title: "Study Hours",
      value: "42h",
      description: "This month",
      icon: Clock,
      trend: { value: 15, isPositive: true }
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        userRole={currentUser.role} 
        userName={currentUser.name}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <HeroSection
          userName={currentUser.name}
          userRole={currentUser.role}
          stats={currentUser.stats}
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              trend={stat.trend}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Courses */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">My Courses</h2>
              <button className="text-primary hover:text-primary/80 text-sm font-medium transition-smooth">
                View all courses →
              </button>
            </div>
            
            <div className="grid gap-6">
              {enrolledCourses.slice(0, 3).map((course, index) => (
                <CourseCard
                  key={index}
                  title={course.title}
                  instructor={course.instructor}
                  description={course.description}
                  progress={course.progress}
                  duration={course.duration}
                  startDate={course.startDate}
                  category={course.category}
                  status={course.status}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Quick Actions & Activity */}
          <div className="space-y-6">
            <QuickActions userRole={currentUser.role} />
            <RecentActivity userRole={currentUser.role} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
