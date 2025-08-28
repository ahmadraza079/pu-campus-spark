import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserCircle, GraduationCap, Shield } from "lucide-react";

// Validation schemas
const studentLoginSchema = z.object({
  nationalId: z.string().length(13, "National ID must be exactly 13 digits").regex(/^\d+$/, "Only numbers allowed"),
});

const studentRegisterSchema = z.object({
  nationalId: z.string().length(13, "National ID must be exactly 13 digits").regex(/^\d+$/, "Only numbers allowed"),
  fullName: z.string().min(2, "Full name is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
});

const teacherLoginSchema = z.object({
  teacherId: z.string().min(3, "Teacher ID is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const teacherRegisterSchema = z.object({
  teacherId: z.string().min(3, "Teacher ID is required"),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const adminLoginSchema = z.object({
  name: z.string().min(1, "Name is required"),
  password: z.string().min(1, "Password is required"),
});

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<"student" | "teacher" | "admin">("student");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const { toast } = useToast();

  // Student forms
  const studentLoginForm = useForm({
    resolver: zodResolver(studentLoginSchema),
    defaultValues: { nationalId: "" },
  });

  const studentRegisterForm = useForm({
    resolver: zodResolver(studentRegisterSchema),
    defaultValues: { nationalId: "", fullName: "", phoneNumber: "" },
  });

  // Teacher forms
  const teacherLoginForm = useForm({
    resolver: zodResolver(teacherLoginSchema),
    defaultValues: { teacherId: "", password: "" },
  });

  const teacherRegisterForm = useForm({
    resolver: zodResolver(teacherRegisterSchema),
    defaultValues: { teacherId: "", fullName: "", email: "", phoneNumber: "", password: "" },
  });

  // Admin form
  const adminLoginForm = useForm({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { name: "", password: "" },
  });

  const onStudentLogin = async (data: z.infer<typeof studentLoginSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: `student${data.nationalId}@gmail.com`,
        password: data.nationalId,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid National ID or you haven't registered yet.",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in as student.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onStudentRegister = async (data: z.infer<typeof studentRegisterSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: `student${data.nationalId}@gmail.com`,
        password: data.nationalId,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            role: "student",
            full_name: data.fullName,
            national_id: data.nationalId,
            phone_number: data.phoneNumber,
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.message,
        });
      } else {
        toast({
          title: "Registration successful!",
          description: "Your account has been created. You can now login.",
        });
        setAuthMode("login");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onTeacherLogin = async (data: z.infer<typeof teacherLoginSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: `teacher${data.teacherId}@gmail.com`,
        password: data.password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid Teacher ID or password.",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in as teacher.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onTeacherRegister = async (data: z.infer<typeof teacherRegisterSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: `teacher${data.teacherId}@gmail.com`,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            role: "teacher",
            full_name: data.fullName,
            teacher_id: data.teacherId,
            phone_number: data.phoneNumber,
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.message,
        });
      } else {
        toast({
          title: "Registration successful!",
          description: "Your account has been created. You can now login.",
        });
        setAuthMode("login");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onAdminLogin = async (data: z.infer<typeof adminLoginSchema>) => {
    setIsLoading(true);
    try {
      if (data.name === "ADMIN" && data.password === "ADMIN789") {
        const { error } = await supabase.auth.signInWithPassword({
          email: "admin@gmail.com",
          password: "ADMIN789",
        });

        if (error) {
          // Try to create admin account if it doesn't exist
          const { error: signUpError } = await supabase.auth.signUp({
            email: "admin@gmail.com",
            password: "ADMIN789",
            options: {
              emailRedirectTo: `${window.location.origin}/`,
              data: {
                role: "admin",
                full_name: "System Administrator",
              },
            },
          });

          if (signUpError) {
            toast({
              variant: "destructive",
              title: "Login failed",
              description: "Unable to authenticate admin account.",
            });
          } else {
            toast({
              title: "Admin account created!",
              description: "Please login again with your credentials.",
            });
          }
        } else {
          toast({
            title: "Welcome Administrator!",
            description: "Successfully logged in as admin.",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Invalid credentials",
          description: "Invalid admin name or password.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">University of the Punjab</CardTitle>
        <CardDescription>Skill Development Center - LMS</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeRole} onValueChange={(value) => setActiveRole(value as typeof activeRole)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="student" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              Student
            </TabsTrigger>
            <TabsTrigger value="teacher" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Teacher
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </TabsTrigger>
          </TabsList>

          {/* Student Tab */}
          <TabsContent value="student" className="space-y-4">
            <div className="flex justify-center gap-4">
              <Button
                variant={authMode === "login" ? "default" : "outline"}
                onClick={() => setAuthMode("login")}
              >
                Login
              </Button>
              <Button
                variant={authMode === "register" ? "default" : "outline"}
                onClick={() => setAuthMode("register")}
              >
                Register
              </Button>
            </div>

            {authMode === "login" ? (
              <Form {...studentLoginForm}>
                <form onSubmit={studentLoginForm.handleSubmit(onStudentLogin)} className="space-y-4">
                  <FormField
                    control={studentLoginForm.control}
                    name="nationalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>National ID (CNIC)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter 13-digit National ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login as Student
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...studentRegisterForm}>
                <form onSubmit={studentRegisterForm.handleSubmit(onStudentRegister)} className="space-y-4">
                  <FormField
                    control={studentRegisterForm.control}
                    name="nationalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>National ID (CNIC)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter 13-digit National ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={studentRegisterForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={studentRegisterForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Register as Student
                  </Button>
                </form>
              </Form>
            )}
          </TabsContent>

          {/* Teacher Tab */}
          <TabsContent value="teacher" className="space-y-4">
            <div className="flex justify-center gap-4">
              <Button
                variant={authMode === "login" ? "default" : "outline"}
                onClick={() => setAuthMode("login")}
              >
                Login
              </Button>
              <Button
                variant={authMode === "register" ? "default" : "outline"}
                onClick={() => setAuthMode("register")}
              >
                Register
              </Button>
            </div>

            {authMode === "login" ? (
              <Form {...teacherLoginForm}>
                <form onSubmit={teacherLoginForm.handleSubmit(onTeacherLogin)} className="space-y-4">
                  <FormField
                    control={teacherLoginForm.control}
                    name="teacherId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your Teacher ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={teacherLoginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login as Teacher
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...teacherRegisterForm}>
                <form onSubmit={teacherRegisterForm.handleSubmit(onTeacherRegister)} className="space-y-4">
                  <FormField
                    control={teacherRegisterForm.control}
                    name="teacherId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your Teacher ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={teacherRegisterForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={teacherRegisterForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={teacherRegisterForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={teacherRegisterForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Create a password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Register as Teacher
                  </Button>
                </form>
              </Form>
            )}
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent value="admin" className="space-y-4">
            <Form {...adminLoginForm}>
              <form onSubmit={adminLoginForm.handleSubmit(onAdminLogin)} className="space-y-4">
                <FormField
                  control={adminLoginForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter admin name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={adminLoginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter admin password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login as Admin
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}