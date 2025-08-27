import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Calendar, 
  Users, 
  MessageSquare, 
  FileText, 
  BarChart3,
  Plus,
  Upload
} from "lucide-react";

interface QuickActionsProps {
  userRole: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

const QuickActions = ({ userRole }: QuickActionsProps) => {
  const studentActions = [
    {
      title: "Join Live Class",
      description: "Connect to ongoing sessions",
      icon: Users,
      color: "bg-tertiary",
      action: "join-class"
    },
    {
      title: "Submit Assignment",
      description: "Upload your completed work",
      icon: Upload,
      color: "bg-secondary",
      action: "submit-assignment"
    },
    {
      title: "View Grades",
      description: "Check your performance",
      icon: BarChart3,
      color: "bg-info",
      action: "view-grades"
    },
    {
      title: "Discussion Forum",
      description: "Ask questions and collaborate",
      icon: MessageSquare,
      color: "bg-warning",
      action: "forum"
    }
  ];

  const teacherActions = [
    {
      title: "Create Course",
      description: "Start a new course",
      icon: Plus,
      color: "bg-tertiary",
      action: "create-course"
    },
    {
      title: "Schedule Class",
      description: "Plan your next session",
      icon: Calendar,
      color: "bg-secondary",
      action: "schedule-class"
    },
    {
      title: "Grade Assignments",
      description: "Review student submissions",
      icon: FileText,
      color: "bg-info",
      action: "grade-assignments"
    },
    {
      title: "View Analytics",
      description: "Track student progress",
      icon: BarChart3,
      color: "bg-warning",
      action: "analytics"
    }
  ];

  const adminActions = [
    {
      title: "Manage Users",
      description: "Add or modify user accounts",
      icon: Users,
      color: "bg-tertiary",
      action: "manage-users"
    },
    {
      title: "System Reports",
      description: "View platform analytics",
      icon: BarChart3,
      color: "bg-secondary",
      action: "system-reports"
    },
    {
      title: "Course Oversight",
      description: "Monitor all courses",
      icon: BookOpen,
      color: "bg-info",
      action: "course-oversight"
    },
    {
      title: "Announcements",
      description: "Broadcast important messages",
      icon: MessageSquare,
      color: "bg-warning",
      action: "announcements"
    }
  ];

  const getActions = () => {
    switch (userRole) {
      case 'TEACHER':
        return teacherActions;
      case 'ADMIN':
        return adminActions;
      default:
        return studentActions;
    }
  };

  const actions = getActions();

  return (
    <Card className="bg-gradient-card shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className="h-auto p-4 justify-start hover:bg-accent transition-smooth group"
            >
              <div className="flex items-center space-x-4 w-full">
                <div className={`p-2 rounded-lg ${action.color} text-white`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-foreground group-hover:text-primary transition-smooth">
                    {action.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;