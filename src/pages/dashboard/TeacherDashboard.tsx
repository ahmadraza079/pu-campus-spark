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
import { GraduationCap, LogOut, Plus, Users, BookOpen, Upload, FileText, Image, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface Course {
  id: string;
  name: string;
  code?: string;
  access_code: string;
  teacher_id?: string;
  claimed_by?: string;
  created_at: string;
}

interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  grade?: string;
  student: {
    email: string;
    phone?: string;
  };
}

interface CourseMaterial {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  created_at: string;
  uploaded_by: string;
}

const claimCourseSchema = z.object({
  access_code: z.string().min(1, "Access code is required"),
});

const addStudentSchema = z.object({
  student_email: z.string().email("Valid email is required"),
});

const uploadMaterialSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

const TeacherDashboard = () => {
  const { user, userProfile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courseMaterials, setCourseMaterials] = useState<CourseMaterial[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isClaimCourseDialogOpen, setIsClaimCourseDialogOpen] = useState(false);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isUploadMaterialDialogOpen, setIsUploadMaterialDialogOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const claimCourseForm = useForm({
    resolver: zodResolver(claimCourseSchema),
    defaultValues: { access_code: "" },
  });

  const addStudentForm = useForm({
    resolver: zodResolver(addStudentSchema),
    defaultValues: { student_email: "" },
  });

  const uploadMaterialForm = useForm({
    resolver: zodResolver(uploadMaterialSchema),
    defaultValues: { title: "", description: "" },
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
      fetchTeacherData();
    }
  }, [user, userProfile, loading, navigate]);

  const fetchTeacherData = async () => {
    try {
      setIsLoadingData(true);
      
      // Fetch courses claimed by this teacher
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('claimed_by', user?.id)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      setCourses(coursesData || []);
      
      if (coursesData && coursesData.length > 0 && !selectedCourse) {
        setSelectedCourse(coursesData[0]);
        await fetchCourseData(coursesData[0].id);
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data.",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchCourseData = async (courseId: string) => {
    try {
      // Fetch enrollments for the course
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          *,
          student:profiles!enrollments_student_id_fkey (
            email,
            phone
          )
        `)
        .eq('course_id', courseId);

      if (enrollmentsError) throw enrollmentsError;

      // Fetch course materials
      const { data: materialsData, error: materialsError } = await supabase
        .from('course_materials')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (materialsError) throw materialsError;

      setEnrollments(enrollmentsData || []);
      setCourseMaterials(materialsData || []);
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load course data.",
      });
    }
  };

  const handleClaimCourse = async (data: z.infer<typeof claimCourseSchema>) => {
    try {
      // First check if course exists with this access code
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('access_code', data.access_code)
        .is('claimed_by', null)
        .single();

      if (courseError || !courseData) {
        throw new Error("Invalid access code or course already claimed");
      }

      // Claim the course
      const { error: updateError } = await supabase
        .from('courses')
        .update({ claimed_by: user?.id })
        .eq('id', courseData.id);

      if (updateError) throw updateError;

      // Record the claim
      await supabase
        .from('course_claims')
        .insert({
          course_id: courseData.id,
          teacher_id: user?.id,
          access_code: data.access_code,
        });

      toast({
        title: "Success",
        description: `Successfully claimed course: ${courseData.name}`,
      });

      setIsClaimCourseDialogOpen(false);
      claimCourseForm.reset();
      fetchTeacherData();
    } catch (error) {
      console.error('Error claiming course:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to claim course.",
      });
    }
  };

  const handleAddStudent = async (data: z.infer<typeof addStudentSchema>) => {
    if (!selectedCourse) return;

    try {
      // Find student by email
      const { data: studentData, error: studentError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('email', data.student_email)
        .eq('role', 'student')
        .single();

      if (studentError || !studentData) {
        throw new Error("Student not found with this email");
      }

      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', selectedCourse.id)
        .eq('student_id', studentData.id)
        .single();

      if (existingEnrollment) {
        throw new Error("Student is already enrolled in this course");
      }

      // Enroll student
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          course_id: selectedCourse.id,
          student_id: studentData.id,
        });

      if (enrollError) throw enrollError;

      toast({
        title: "Success",
        description: `Student ${data.student_email} enrolled successfully`,
      });

      setIsAddStudentDialogOpen(false);
      addStudentForm.reset();
      fetchCourseData(selectedCourse.id);
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add student.",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, formData: any) => {
    const file = event.target.files?.[0];
    if (!file || !selectedCourse) return;

    try {
      setUploadingFile(true);

      // Create file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${selectedCourse.id}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('course-materials')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-materials')
        .getPublicUrl(fileName);

      // Save material record
      const { error: materialError } = await supabase
        .from('course_materials')
        .insert({
          course_id: selectedCourse.id,
          title: formData.title,
          description: formData.description,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: user?.id,
        });

      if (materialError) throw materialError;

      toast({
        title: "Success",
        description: "Material uploaded successfully",
      });

      setIsUploadMaterialDialogOpen(false);
      uploadMaterialForm.reset();
      fetchCourseData(selectedCourse.id);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload material.",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
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

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium">Welcome, {userProfile.username || userProfile.email}</p>
                <Badge variant="secondary" className="text-xs">
                  TEACHER
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
              <div className="text-2xl font-bold">{courses.length}</div>
              <p className="text-xs text-muted-foreground">Claimed courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrollments.length}</div>
              <p className="text-xs text-muted-foreground">Total enrolled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Materials</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courseMaterials.length}</div>
              <p className="text-xs text-muted-foreground">Course materials</p>
            </CardContent>
          </Card>
        </div>

        {/* Course Selection */}
        {courses.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Course</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {courses.map((course) => (
                  <Button
                    key={course.id}
                    variant={selectedCourse?.id === course.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedCourse(course);
                      fetchCourseData(course.id);
                    }}
                  >
                    {course.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {courses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Courses Claimed</h3>
              <p className="text-muted-foreground text-center mb-4">
                Claim a course using an access code provided by the admin.
              </p>
              <Dialog open={isClaimCourseDialogOpen} onOpenChange={setIsClaimCourseDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Claim Course
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Claim Course</DialogTitle>
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
                              <Input placeholder="Enter access code provided by admin" {...field} />
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
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="students" className="space-y-6">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="materials">Materials</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Dialog open={isClaimCourseDialogOpen} onOpenChange={setIsClaimCourseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Claim Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Claim Course</DialogTitle>
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
                                <Input placeholder="Enter access code provided by admin" {...field} />
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

            {/* Students Tab */}
            <TabsContent value="students">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    {selectedCourse ? `Students in ${selectedCourse.name}` : 'Course Students'}
                  </CardTitle>
                  {selectedCourse && (
                    <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Student
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Student to {selectedCourse.name}</DialogTitle>
                        </DialogHeader>
                        <Form {...addStudentForm}>
                          <form onSubmit={addStudentForm.handleSubmit(handleAddStudent)} className="space-y-4">
                            <FormField
                              control={addStudentForm.control}
                              name="student_email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Student Email</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter student email" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="submit" className="w-full">
                              Add Student
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardHeader>
                <CardContent>
                  {enrollments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrollments.map((enrollment) => (
                          <TableRow key={enrollment.id}>
                            <TableCell>{enrollment.student.email}</TableCell>
                            <TableCell>{enrollment.student.phone || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {enrollment.grade || 'Not Graded'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No students enrolled in this course yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Materials Tab */}
            <TabsContent value="materials">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    {selectedCourse ? `Materials for ${selectedCourse.name}` : 'Course Materials'}
                  </CardTitle>
                  {selectedCourse && (
                    <Dialog open={isUploadMaterialDialogOpen} onOpenChange={setIsUploadMaterialDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Material
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Upload Material to {selectedCourse.name}</DialogTitle>
                        </DialogHeader>
                        <Form {...uploadMaterialForm}>
                          <form 
                            onSubmit={uploadMaterialForm.handleSubmit((data) => {
                              const fileInput = document.getElementById('material-file') as HTMLInputElement;
                              if (fileInput?.files?.[0]) {
                                handleFileUpload({ target: { files: [fileInput.files[0]] } } as any, data);
                              }
                            })} 
                            className="space-y-4"
                          >
                            <FormField
                              control={uploadMaterialForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter material title" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={uploadMaterialForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter description" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div>
                              <label htmlFor="material-file" className="text-sm font-medium">File</label>
                              <Input
                                id="material-file"
                                type="file"
                                accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png,.gif"
                                required
                              />
                            </div>
                            <Button type="submit" className="w-full" disabled={uploadingFile}>
                              {uploadingFile ? "Uploading..." : "Upload Material"}
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardHeader>
                <CardContent>
                  {courseMaterials.length > 0 ? (
                    <div className="space-y-4">
                      {courseMaterials.map((material) => (
                        <div
                          key={material.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            {getFileIcon(material.file_type)}
                            <div>
                              <h4 className="font-medium">{material.title}</h4>
                              {material.description && (
                                <p className="text-sm text-muted-foreground">{material.description}</p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {new Date(material.created_at).toLocaleDateString()}
                                {material.file_size && ` • ${Math.round(material.file_size / 1024)} KB`}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(material.file_url, '_blank')}
                          >
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No materials uploaded for this course yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;