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
import { GraduationCap, LogOut, Search, Plus, BookOpen, Key } from "lucide-react";
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
});

const claimCourseSchema = z.object({
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
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);

  const createCourseForm = useForm({
    resolver: zodResolver(createCourseSchema),
    defaultValues: { name: "", code: "" },
  });

  const claimCourseForm = useForm({
    resolver: zodResolver(claimCourseSchema),
    defaultValues: { access_code: "" },
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
      // Generate a unique access code
      const accessCode = `AC-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      const { error } = await supabase
        .from('courses')
        .insert({
          name: data.name,
          code: data.code || null,
          access_code: accessCode,
          teacher_id: user?.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Course created with access code: ${accessCode}`,
      });

      setIsCreateDialogOpen(false);
      createCourseForm.reset();
      fetchTeacherCourses();
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create course.",
      });
    }
  };

  const handleClaimCourse = async (data: z.infer<typeof claimCourseSchema>) => {
    try {
      // First, check if the access code exists and is unclaimed
      const { data: course, error: findError } = await supabase
        .from('courses')
        .select('*')
        .eq('access_code', data.access_code)
        .maybeSingle();

      if (findError) throw findError;

      if (!course) {
        toast({
          variant: "destructive",
          title: "Invalid Access Code",
          description: "The access code you entered does not exist.",
        });
        return;
      }

      if (course.teacher_id) {
        toast({
          variant: "destructive",
          title: "Course Already Claimed",
          description: "This course has already been claimed by another teacher.",
        });
        return;
      }

      // Claim the course by setting teacher_id
      const { error: updateError } = await supabase
        .from('courses')
        .update({ teacher_id: user?.id })
        .eq('id', course.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: `Successfully claimed course: ${course.name}`,
      });

      setIsClaimDialogOpen(false);
      claimCourseForm.reset();
      fetchTeacherCourses();
    } catch (error) {
      console.error('Error claiming course:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to claim course.",
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
          
          <div className="flex space-x-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Course</DialogTitle>
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
                    <Button type="submit" className="w-full">
                      Create Course
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Claim Course
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Claim Course with Access Code</DialogTitle>
                </DialogHeader>
                <Form {...claimCourseForm}>
                  <form onSubmit={claimCourseForm.handleSubmit(handleClaimCourse)} className="space-y-4">
                    <FormField
                      control={claimCourseForm.control}
                      name="access_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter access code (e.g., AC-1234567890-ABCD)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Claim Course
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
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
                  Create a new course or claim an existing one using an access code from the admin.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Access Code</TableHead>
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
                        <code className="text-xs bg-muted px-2 py-1 rounded">{course.access_code}</code>
                      </TableCell>
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