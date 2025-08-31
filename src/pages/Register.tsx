import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { GraduationCap } from "lucide-react";

// Form schemas
const studentRegisterSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Valid phone number is required"),
  voucher_number: z.string().min(1, "Voucher number is required"),
});

const teacherRegisterSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Valid phone number is required"),
  teacher_id: z.string().min(1, "Teacher ID is required"),
});

const adminRegisterSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Valid phone number is required"),
  username: z.string().min(1, "Username is required"),
});

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already authenticated
  if (user) {
    navigate("/");
    return null;
  }

  // Form instances
  const studentForm = useForm({
    resolver: zodResolver(studentRegisterSchema),
    defaultValues: { email: "", password: "", phone: "", voucher_number: "" },
  });

  const teacherForm = useForm({
    resolver: zodResolver(teacherRegisterSchema),
    defaultValues: { email: "", password: "", phone: "", teacher_id: "" },
  });

  const adminForm = useForm({
    resolver: zodResolver(adminRegisterSchema),
    defaultValues: { email: "", password: "", phone: "", username: "" },
  });

  // Student registration
  const onStudentRegister = async (data: z.infer<typeof studentRegisterSchema>) => {
    setIsLoading(true);
    try {
      // Check if email or voucher already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email, voucher_number')
        .or(`email.eq.${data.email},voucher_number.eq.${data.voucher_number}`)
        .maybeSingle();

      if (existingProfile) {
        if (existingProfile.email === data.email) {
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: "Email already registered.",
          });
          return;
        }
        if (existingProfile.voucher_number === data.voucher_number) {
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: "Voucher number already used.",
          });
          return;
        }
      }

      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            role: 'student',
            phone: data.phone,
            voucher_number: data.voucher_number,
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
        setRegistrationSuccess(true);
        toast({
          title: "Registration successful!",
          description: "Please check your email to verify your account.",
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

  // Teacher registration
  const onTeacherRegister = async (data: z.infer<typeof teacherRegisterSchema>) => {
    setIsLoading(true);
    try {
      // Check if email or teacher_id already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email, teacher_id')
        .or(`email.eq.${data.email},teacher_id.eq.${data.teacher_id}`)
        .maybeSingle();

      if (existingProfile) {
        if (existingProfile.email === data.email) {
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: "Email already registered.",
          });
          return;
        }
        if (existingProfile.teacher_id === data.teacher_id) {
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: "Teacher ID already registered.",
          });
          return;
        }
      }

      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            role: 'teacher',
            phone: data.phone,
            teacher_id: data.teacher_id,
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
        setRegistrationSuccess(true);
        toast({
          title: "Registration successful!",
          description: "Please check your email to verify your account.",
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

  // Admin registration
  const onAdminRegister = async (data: z.infer<typeof adminRegisterSchema>) => {
    setIsLoading(true);
    try {
      // Check if email or username already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email, username')
        .or(`email.eq.${data.email},username.eq.${data.username}`)
        .maybeSingle();

      if (existingProfile) {
        if (existingProfile.email === data.email) {
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: "Email already registered.",
          });
          return;
        }
        if (existingProfile.username === data.username) {
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: "Username already taken.",
          });
          return;
        }
      }

      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            role: 'admin',
            phone: data.phone,
            username: data.username,
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
        setRegistrationSuccess(true);
        toast({
          title: "Registration successful!",
          description: "Please check your email to verify your account.",
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
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <GraduationCap className="h-10 w-10 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">
                Skill Development Centre
              </h1>
              <p className="text-white/80 text-sm">University of the Punjab</p>
            </div>
          </div>
        </div>

        <Card className="bg-white/95 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Register to get started with your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            {registrationSuccess ? (
              <div className="text-center p-6">
                <h3 className="text-lg font-semibold mb-2">Registration Successful!</h3>
                <p className="text-muted-foreground mb-4">
                  Please check your email to verify your account before signing in.
                </p>
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full"
                >
                  Go to Login
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="student" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="student">Student</TabsTrigger>
                  <TabsTrigger value="teacher">Teacher</TabsTrigger>
                </TabsList>

                {/* Student Registration Tab */}
                <TabsContent value="student">
                  <Form {...studentForm}>
                    <form onSubmit={studentForm.handleSubmit(onStudentRegister)} className="space-y-4">
                      <FormField
                        control={studentForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="Enter your email"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={studentForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Create a password"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={studentForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your phone number"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={studentForm.control}
                        name="voucher_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Voucher Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your voucher number"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating account..." : "Register"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* Teacher Registration Tab */}
                <TabsContent value="teacher">
                  <Form {...teacherForm}>
                    <form onSubmit={teacherForm.handleSubmit(onTeacherRegister)} className="space-y-4">
                      <FormField
                        control={teacherForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="Enter your email"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={teacherForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Create a password"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={teacherForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your phone number"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={teacherForm.control}
                        name="teacher_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teacher ID</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your teacher ID"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating account..." : "Register"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

              </Tabs>
            )}

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-primary hover:underline"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;