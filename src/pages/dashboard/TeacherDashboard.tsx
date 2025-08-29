import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, LogOut, Search, Plus, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface Course {
  id: string;
  name: string;
  code: string;
  access_code: string;
  created_at: string;
}

const createCourseSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  code: z.string().optional(),
  access_code: z.string().min(1, "Access code is required"),
});

const TeacherDashboard = () => {
  const { user, userProfile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const createCourseForm = useForm({
    resolver: zodResolver(createCourseSchema),
    defaultValues: { name: "", code: "", access_code: "" },
  });

  useEffect(() => {
    if (!loading && (!user || !userProfile)) {
      navigate("/login");
      return;
    }

    if (userProfile && userProfile.role !== 'teacher') {
      navigate(`/dashboard/${userProfile.role}`);
      return;
    }

    if (user && userProfile?.role === 'teacher') {
      fetchTeacherCourses();
    }
  }, [user, userProfile, loading, navigate]);

  const fetchTeacherCourses = async () => {
    try {
      setIsLoadingData(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load courses.",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleCreateCourse = async (data: z.infer<typeof createCourseSchema>) => {
    try {
      // First, check if the access code exists and is valid
      const { data: existingCourse, error: checkError } = await supabase
        .from('courses')
        .select('id, teacher_id, access_code')
        .eq('access_code', data.access_code)
        .maybeSingle();

      if (checkError) throw checkError;

      if (!existingCourse) {
        toast({
          variant: "destructive",
          title: "Invalid Access Code",
          description: "Invalid or already-claimed access code.",
        });
        return;
      }

      if (existingCourse.teacher_id && existingCourse.teacher_id !== user?.id) {
        toast({
          variant: "destructive",
          title: "Invalid Access Code",
          description: "Invalid or already-claimed access code.",
        });
        return;
      }

      // If access code is valid, create/claim the course
      if (existingCourse.teacher_id === null) {
        // Claim existing course
        const { error: updateError } = await supabase
          .from('courses')
          .update({
            name: data.name,
            code: data.code || null,
            teacher_id: user?.id,
          })
          .eq('id', existingCourse.id);

        if (updateError) throw updateError;
      } else {
        // Update existing course (teacher is modifying their own course)
        const { error: updateError } = await supabase
          .from('courses')
          .update({
            name: data.name,
            code: data.code || null,
          })
          .eq('id', existingCourse.id);

        if (updateError) throw updateError;
      }

      // Log the action
      await supabase
        .from('audit_logs')
        .insert({
          actor_id: user?.id,
          action: existingCourse.teacher_id ? 'UPDATE_COURSE' : 'CLAIM_COURSE',
          entity: 'Course',
          entity_id: existingCourse.id,
          details: { name: data.name, code: data.code },
        });

      toast({
        title: "Success",
        description: existingCourse.teacher_id ? "Course updated successfully." : "Course claimed successfully.",
      });

      setIsCreateDialogOpen(false);
      createCourseForm.reset();
      fetchTeacherCourses();
    } catch (error) {
      console.error('Error creating/claiming course:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create/claim course.",
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, code')
        .eq('teacher_id', user?.id)
        .or(`name.ilike.%${searchQuery}%,code.ilike.%${searchQuery}%`);

      if (error) throw error;

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
                  TEACHER
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="border-white/30 text-white hover:bg-white/10"
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
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Teacher Dashboard</h2>
            <p className="text-muted-foreground">Manage your courses and students</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create/Claim Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create/Claim Course</DialogTitle>
              </DialogHeader>
              <Form {...createCourseForm}>
                <form onSubmit={createCourseForm.handleSubmit(handleCreateCourse)} className="space-y-4">
                  <FormField
                    control={createCourseForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter course name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createCourseForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Code (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., CSC-101" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createCourseForm.control}
                    name="access_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter access code provided by admin" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create/Claim Course</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Card */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">Total courses managed</p>
          </CardContent>
        </Card>

        {/* Courses List */}
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No courses yet.</p>
                <p className="text-sm text-muted-foreground">
                  Create or claim a course using the access code provided by the admin.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell>{course.code || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(course.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
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

export default TeacherDashboard;