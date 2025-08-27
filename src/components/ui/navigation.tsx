import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  Calendar, 
  Settings, 
  Bell,
  Search,
  User
} from "lucide-react";

interface NavigationProps {
  userRole?: 'STUDENT' | 'TEACHER' | 'ADMIN';
  userName?: string;
}

const Navigation = ({ userRole = 'STUDENT', userName = 'Student' }: NavigationProps) => {
  const navItems = [
    { icon: BookOpen, label: "Courses", href: "/courses" },
    { icon: Calendar, label: "Schedule", href: "/schedule" },
    { icon: Users, label: "Community", href: "/community" },
  ];

  if (userRole === 'TEACHER' || userRole === 'ADMIN') {
    navItems.push(
      { icon: GraduationCap, label: "Teaching", href: "/teaching" },
      { icon: Settings, label: "Management", href: "/admin" }
    );
  }

  return (
    <nav className="bg-gradient-primary shadow-elegant border-b border-border/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
              <div className="text-primary-foreground">
                <h1 className="text-xl font-bold">Punjab University</h1>
                <p className="text-xs opacity-90">Learning Management System</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-white/10 hover:text-white transition-smooth"
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-white/10"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-white/10"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2 pl-3 border-l border-white/20">
              <User className="h-5 w-5 text-primary-foreground" />
              <span className="text-sm text-primary-foreground font-medium">
                {userName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;