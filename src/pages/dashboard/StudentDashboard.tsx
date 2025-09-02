import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, LogOut, Search, BookOpen, Calendar, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  name: string;
  code: string;
  claimed_teacher?: {
    email: string;
  }[];
}

interface Enrollment {
  id: string;
  grade: string;
  course: Course;
}

interface AttendanceRecord {
  id: string;
  class_date: string;
  status: 'Present' | 'Absent';
  course: {
    name: string;
    code: string;
  };
}

const StudentDashboard = () => {
  const { user, userProfile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !userProfile)) {
      navigate("/login");
      return;
    }

    if (userProfile && userProfile.role !== 'student') {
      navigate(`/dashboard/${userProfile.role}`);
      return;
    }

    if (user && userProfile?.role === 'student') {
      fetchStudentData();
    }
  }, [user, userProfile, loading, navigate]);

  const fetchStudentData = async () => {
    try {
      setIsLoadingData(true);

      // Fetch enrollments with course and teacher info
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select(`
          id,
          grade,
          course:courses (
            id,
            name,
            code,
            claimed_teacher:profiles!courses_claimed_by_fkey (
              email
            )
          )
        `)
        .eq('student_id', user?.id);

      if (enrollmentError) throw enrollmentError;

      // Fetch attendance records
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          id,
          class_date,
          status,
          course:courses (
            name,
            code
          )
        `)
        .eq('student_id', user?.id)
        .order('class_date', { ascending: false });

      if (attendanceError) throw attendanceError;

      setEnrollments(enrollmentData || []);
      setAttendance(attendanceData || []);
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data.",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, code')
        .or(`name.ilike.%${searchQuery}%,code.ilike.%${searchQuery}%`);

      if (error) throw error;

      // Show search results
      if (data && data.length > 0) {
        toast({
          title: "Search Results",
          description: `Found ${data.length} course(s) matching "${searchQuery}".`,
        });
      } else {
        toast({
          title: "No Results",
          description: `No courses found matching "${searchQuery}".`,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        variant: "destructive",
        title: "Search Error",
        description: "Failed to search courses.",
      });
    }
  };

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const totalClasses = attendance.length;
  const attendancePercentage = totalClasses > 0 ? (presentCount / totalClasses * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">Skill Development Centre</h1>
                <p className="text-primary-foreground/80 text-sm">University of the Punjab</p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="flex items-center space-x-4 flex-1 max-w-md mx-8">
              <div className="relative flex-1">
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
                <Button
                  size="sm"
                  onClick={handleSearch}
                  className="absolute right-0 top-0 h-full px-3 bg-white/20 hover:bg-white/30 border-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium">Welcome, {userProfile.email}</p>
                <Badge variant="secondary" className="text-xs">
                  STUDENT
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrollments.length}</div>
              <p className="text-xs text-muted-foreground">Currently enrolled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendancePercentage}%</div>
              <p className="text-xs text-muted-foreground">
                {presentCount} of {totalClasses} classes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Grades</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {enrollments.filter(e => e.grade).length}
              </div>
              <p className="text-xs text-muted-foreground">Courses graded</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* My Courses */}
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No courses enrolled yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Teacher</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">
                          {enrollment.course.name}
                        </TableCell>
                        <TableCell>{enrollment.course.code || 'N/A'}</TableCell>
                        <TableCell>{enrollment.course.claimed_teacher?.[0]?.email || 'Unassigned'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Grades */}
          <Card>
            <CardHeader>
              <CardTitle>Grades</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollments.filter(e => e.grade).length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No grades assigned yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments
                      .filter(e => e.grade)
                      .map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">
                            {enrollment.course.name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                enrollment.grade === 'A' ? 'default' :
                                enrollment.grade === 'B' ? 'secondary' :
                                enrollment.grade === 'C' ? 'outline' :
                                'destructive'
                              }
                            >
                              {enrollment.grade}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Attendance Records */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {attendance.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No attendance records yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.slice(0, 10).map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {new Date(record.class_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{record.course.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={record.status === 'Present' ? 'default' : 'destructive'}
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
            <p className="text-muted-foreground mb-2">Need help or support?</p>
            <p className="font-semibold">+92 330 5409555</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StudentDashboard;