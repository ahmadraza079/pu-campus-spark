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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, LogOut, Search, Plus, Users, BookOpen, Key, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface Profile {
  id: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  phone?: string;
  teacher_id?: string;
  voucher_number?: string;
  username?: string;
  created_at: string;
}

interface Course {
  id: string;
  name: string;
  code?: string;
  access_code: string;
  teacher_id?: string;
  created_at: string;
  teacher?: {
    email: string;
  };
}

const createUserSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['student', 'teacher']),
  phone: z.string().optional(),
  teacher_id: z.string().optional(),
  voucher_number: z.string().optional(),
});

const createCourseSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  code: z.string().optional(),
});

const AdminDashboard = () => {
  const { user, userProfile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isCreateCourseDialogOpen, setIsCreateCourseDialogOpen] = useState(false);

  const createUserForm = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: "", password: "", role: "student" as const, phone: "", teacher_id: "", voucher_number: "" },
  });

  const createCourseForm = useForm({
    resolver: zodResolver(createCourseSchema),
    defaultValues: { name: "", code: "" },
  });

  useEffect(() => {
    if (!loading && (!user || !userProfile)) {
      navigate("/login");
      return;
    }

    if (userProfile && userProfile.role !== 'admin') {
      navigate(`/dashboard/${userProfile.role}`);
      return;
    }

    if (user && userProfile?.role === 'admin') {
      fetchAdminData();
    }
  }, [user, userProfile, loading, navigate]);

  const fetchAdminData = async () => {
    try {
      setIsLoadingData(true);
      
      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all courses with teacher info
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          teacher:profiles!courses_teacher_id_fkey (
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      setProfiles(profilesData || []);
      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data.",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleCreateUser = async (data: z.infer<typeof createUserSchema>) => {
    try {
      const response = await supabase.functions.invoke('create-user', {
        body: {
          email: data.email,
          password: data.password,
          role: data.role,
          phone: data.phone,
          teacher_id: data.teacher_id,
          voucher_number: data.voucher_number,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Success",
        description: "User created successfully.",
      });

      setIsCreateUserDialogOpen(false);
      createUserForm.reset();
      fetchAdminData();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create user.",
      });
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
        });

      if (error) throw error;

      // Log the action
      await supabase
        .from('audit_logs')
        .insert({
          actor_id: user?.id,
          action: 'CREATE_COURSE',
          entity: 'Course',
          details: { name: data.name, code: data.code, access_code: accessCode },
        });

      toast({
        title: "Success",
        description: `Course created with access code: ${accessCode}`,
      });

      setIsCreateCourseDialogOpen(false);
      createCourseForm.reset();
      fetchAdminData();
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create course.",
      });
    }
  };

  const generateNewAccessCode = async (courseId: string) => {
    try {
      const newAccessCode = `AC-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const { error } = await supabase
        .from('courses')
        .update({ access_code: newAccessCode })
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `New access code generated: ${newAccessCode}`,
      });

      fetchAdminData();
    } catch (error) {
      console.error('Error generating access code:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate new access code.",
      });
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

  const students = profiles.filter(p => p.role === 'student');
  const teachers = profiles.filter(p => p.role === 'teacher');

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
                <p className="font-medium">Welcome, {userProfile.username || userProfile.email}</p>
                <Badge variant="secondary" className="text-xs">
                  ADMIN
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profiles.length}</div>
              <p className="text-xs text-muted-foreground">All registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">Registered students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers.length}</div>
              <p className="text-xs text-muted-foreground">Registered teachers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
              <p className="text-xs text-muted-foreground">Total courses</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="access-codes">Access Codes</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                    </DialogHeader>
                    <Form {...createUserForm}>
                      <form onSubmit={createUserForm.handleSubmit(handleCreateUser)} className="space-y-4">
                        <FormField
                          control={createUserForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createUserForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createUserForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="student">Student</SelectItem>
                                  <SelectItem value="teacher">Teacher</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createUserForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {createUserForm.watch('role') === 'teacher' && (
                          <FormField
                            control={createUserForm.control}
                            name="teacher_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Teacher ID</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter teacher ID" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        {createUserForm.watch('role') === 'student' && (
                          <FormField
                            control={createUserForm.control}
                            name="voucher_number"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Voucher Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter voucher number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreateUserDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Create User</Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>
                          <Badge variant={
                            profile.role === 'admin' ? 'destructive' :
                            profile.role === 'teacher' ? 'default' : 'secondary'
                          }>
                            {profile.role.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{profile.phone || 'N/A'}</TableCell>
                        <TableCell>
                          {new Date(profile.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Course Management</CardTitle>
                <Dialog open={isCreateCourseDialogOpen} onOpenChange={setIsCreateCourseDialogOpen}>
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
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreateCourseDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Create Course</Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Access Code</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.name}</TableCell>
                        <TableCell>{course.code || 'N/A'}</TableCell>
                        <TableCell>{course.teacher?.email || 'Unassigned'}</TableCell>
                        <TableCell className="font-mono text-sm">{course.access_code}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateNewAccessCode(course.id)}
                          >
                            <Key className="h-4 w-4 mr-1" />
                            New Code
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Access Codes Tab */}
          <TabsContent value="access-codes">
            <Card>
              <CardHeader>
                <CardTitle>Access Code Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Access codes are automatically generated when creating courses. 
                    Teachers use these codes to claim and manage courses.
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Access Code</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-mono text-sm">{course.access_code}</TableCell>
                          <TableCell>{course.name}</TableCell>
                          <TableCell>
                            <Badge variant={course.teacher_id ? 'default' : 'secondary'}>
                              {course.teacher_id ? 'Claimed' : 'Available'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateNewAccessCode(course.id)}
                            >
                              Generate New Code
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Admin Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Admin settings and configurations will be available here.
                  </p>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Current Admin</h4>
                    <p className="text-sm text-muted-foreground">
                      Username: {userProfile.username || 'Not set'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Email: {userProfile.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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

export default AdminDashboard;