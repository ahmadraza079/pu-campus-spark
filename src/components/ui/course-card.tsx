import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Calendar,
  ChevronRight,
  User
} from "lucide-react";

interface CourseCardProps {
  title: string;
  instructor: string;
  description: string;
  progress?: number;
  totalStudents?: number;
  duration: string;
  startDate: string;
  category: string;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  className?: string;
}

const CourseCard = ({ 
  title, 
  instructor, 
  description, 
  progress = 0, 
  totalStudents, 
  duration, 
  startDate,
  category,
  status,
  className 
}: CourseCardProps) => {
  const statusConfig = {
    ACTIVE: { color: 'bg-success', text: 'Active' },
    UPCOMING: { color: 'bg-warning', text: 'Upcoming' },
    COMPLETED: { color: 'bg-muted', text: 'Completed' }
  };

  return (
    <Card className={cn(
      "bg-gradient-card hover:shadow-elegant transition-smooth cursor-pointer group border-border/50 overflow-hidden",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge 
            variant="secondary" 
            className="text-xs font-medium bg-secondary/10 text-secondary"
          >
            {category}
          </Badge>
          <Badge 
            className={cn(
              "text-xs text-white border-0",
              statusConfig[status].color
            )}
          >
            {statusConfig[status].text}
          </Badge>
        </div>
        
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-smooth line-clamp-2">
          {title}
        </h3>
        
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <User className="h-3 w-3 mr-1" />
          <span className="font-medium">{instructor}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        {progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progress}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{startDate}</span>
          </div>
        </div>

        {totalStudents && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Users className="h-3 w-3 mr-1" />
            <span>{totalStudents} students enrolled</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-primary hover:text-primary-foreground hover:bg-primary transition-smooth"
          >
            <BookOpen className="h-3 w-3 mr-1" />
            View Course
          </Button>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-smooth" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;