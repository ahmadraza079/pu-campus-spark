import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Calendar, 
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: 'course' | 'assignment' | 'discussion' | 'schedule' | 'achievement';
  title: string;
  description: string;
  time: string;
  status?: 'completed' | 'pending' | 'overdue';
  user?: string;
}

interface RecentActivityProps {
  userRole: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

const RecentActivity = ({ userRole }: RecentActivityProps) => {
  // Sample data - in real app this would come from API
  const studentActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'assignment',
      title: 'Web Development Assignment',
      description: 'HTML/CSS Project submitted successfully',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      id: '2',
      type: 'course',
      title: 'React Fundamentals',
      description: 'Completed Chapter 3: State Management',
      time: '1 day ago',
      status: 'completed'
    },
    {
      id: '3',
      type: 'discussion',
      title: 'JavaScript Best Practices',
      description: 'New reply from Dr. Ahmed Khan',
      time: '2 days ago',
      status: 'pending'
    },
    {
      id: '4',
      type: 'schedule',
      title: 'Database Design Class',
      description: 'Upcoming class at 2:00 PM tomorrow',
      time: 'Tomorrow',
      status: 'pending'
    }
  ];

  const teacherActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'assignment',
      title: 'Grade Submissions',
      description: '12 new assignments to review',
      time: '1 hour ago',
      status: 'pending'
    },
    {
      id: '2',
      type: 'course',
      title: 'Mobile Development',
      description: 'Course materials updated',
      time: '3 hours ago',
      status: 'completed'
    },
    {
      id: '3',
      type: 'discussion',
      title: 'Student Query',
      description: 'New question in React course forum',
      time: '5 hours ago',
      status: 'pending'
    },
    {
      id: '4',
      type: 'schedule',
      title: 'Faculty Meeting',
      description: 'Department meeting scheduled for Friday',
      time: 'This Friday',
      status: 'pending'
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'course':
        return BookOpen;
      case 'assignment':
        return FileText;
      case 'discussion':
        return MessageSquare;
      case 'schedule':
        return Calendar;
      case 'achievement':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-success/10 text-success border-success/20">Completed</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-warning/20 text-warning">Pending</Badge>;
      default:
        return null;
    }
  };

  const activities = userRole === 'TEACHER' ? teacherActivities : studentActivities;

  return (
    <Card className="bg-gradient-card shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const IconComponent = getIcon(activity.type);
          
          return (
            <div 
              key={activity.id}
              className="flex items-start space-x-4 p-3 rounded-lg hover:bg-accent/50 transition-smooth cursor-pointer"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10">
                  <IconComponent className="h-5 w-5 text-primary" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    {activity.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(activity.status)}
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
                
                {activity.status && (
                  <div className="pt-1">
                    {getStatusBadge(activity.status)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        <div className="pt-4 border-t border-border">
          <button className="text-sm text-primary hover:text-primary/80 font-medium transition-smooth">
            View all activity →
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;