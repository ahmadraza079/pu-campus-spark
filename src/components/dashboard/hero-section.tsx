import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  Award,
  ArrowRight 
} from "lucide-react";
import heroImage from "@/assets/punjab-university-hero.jpg";

interface HeroSectionProps {
  userName: string;
  userRole: 'STUDENT' | 'TEACHER' | 'ADMIN';
  stats: {
    coursesEnrolled?: number;
    coursesTeaching?: number;
    totalStudents?: number;
    completionRate?: number;
    upcomingClasses: number;
  };
}

const HeroSection = ({ userName, userRole, stats }: HeroSectionProps) => {
  const getRoleGreeting = () => {
    switch (userRole) {
      case 'TEACHER':
        return 'Welcome back, Professor';
      case 'ADMIN':
        return 'Welcome back, Administrator';
      default:
        return 'Welcome back';
    }
  };

  const getMainStat = () => {
    switch (userRole) {
      case 'TEACHER':
        return {
          label: 'Courses Teaching',
          value: stats.coursesTeaching || 0,
          icon: BookOpen
        };
      case 'ADMIN':
        return {
          label: 'Total Students',
          value: stats.totalStudents || 0,
          icon: TrendingUp
        };
      default:
        return {
          label: 'Courses Enrolled',
          value: stats.coursesEnrolled || 0,
          icon: BookOpen
        };
    }
  };

  const mainStat = getMainStat();

  return (
    <div className="relative overflow-hidden bg-gradient-hero rounded-2xl shadow-elegant">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Content Overlay */}
      <div className="relative p-8 md:p-12">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Punjab University - Skill Development Center
            </Badge>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  {getRoleGreeting()},
                  <span className="block text-secondary">
                    {userName}
                  </span>
                </h1>
                <p className="text-lg text-white/90 leading-relaxed">
                  {userRole === 'STUDENT' && "Continue your learning journey and unlock new opportunities."}
                  {userRole === 'TEACHER' && "Inspire minds and shape the future of education."}
                  {userRole === 'ADMIN' && "Manage and monitor the academic excellence of our institution."}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="secondary"
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-button transition-smooth"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  {userRole === 'STUDENT' ? 'Browse Courses' : 'Manage Courses'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 transition-smooth"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  View Schedule
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="space-y-4">
              <Card className="bg-white/15 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm font-medium">
                        {mainStat.label}
                      </p>
                      <p className="text-3xl font-bold text-white">
                        {mainStat.value}
                      </p>
                    </div>
                    <mainStat.icon className="h-8 w-8 text-secondary" />
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white/15 backdrop-blur-sm border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-6 w-6 text-secondary" />
                      <div>
                        <p className="text-xs text-white/80">Upcoming</p>
                        <p className="text-lg font-bold text-white">
                          {stats.upcomingClasses}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/15 backdrop-blur-sm border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Award className="h-6 w-6 text-secondary" />
                      <div>
                        <p className="text-xs text-white/80">Completion</p>
                        <p className="text-lg font-bold text-white">
                          {stats.completionRate || 0}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;