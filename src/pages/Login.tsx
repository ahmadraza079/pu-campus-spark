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
const studentLoginSchema = z.object({
  email: z.string().email("Valid email is required"),
});

const teacherLoginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
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
    resolver: zodResolver(studentLoginSchema),
    defaultValues: { email: "" },
  });

  const teacherForm = useForm({
    resolver: zodResolver(teacherLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const adminForm = useForm({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { username: "", password: "" },
  });

  // Student login with OTP
  const onStudentLogin = async (data: z.infer<typeof studentLoginSchema>) => {
    setIsLoading(true);
    try {
      // Check if student exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, role')
        .eq('email', data.email)
        .eq('role', 'student')
        .maybeSingle();

      if (!profile) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "No student found with this email.",
        });
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message,
        });
      } else {
        setOtpSent(true);
        toast({
          title: "Check your email",
          description: "We've sent you a magic link to sign in.",
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

  // Teacher login with email/password
  const onTeacherLogin = async (data: z.infer<typeof teacherLoginSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid email or password.",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in as teacher.",
        });
        navigate("/");
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

  // Admin login with username/password mapping
  const onAdminLogin = async (data: z.infer<typeof adminLoginSchema>) => {
    setIsLoading(true);
    try {
      // Find admin profile by username
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', data.username)
        .eq('role', 'admin')
        .maybeSingle();

      if (!profile) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid admin credentials.",
        });
        return;
      }

      // Sign in with the mapped email
      const { error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: data.password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid admin credentials.",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in as admin.",
        });
        navigate("/");
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
            <CardTitle className="text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="student">Student Login</TabsTrigger>
                <TabsTrigger value="teacher">Teacher Login</TabsTrigger>
                <TabsTrigger value="admin">Admin Login</TabsTrigger>
              </TabsList>

              {/* Student Login Tab */}
              <TabsContent value="student">
                {otpSent ? (
                  <div className="text-center p-6">
                    <h3 className="text-lg font-semibold mb-2">Check your email</h3>
                    <p className="text-muted-foreground mb-4">
                      We've sent you a magic link. Click the link in your email to sign in.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setOtpSent(false)}
                    >
                      Back to login
                    </Button>
                  </div>
                ) : (
                  <Form {...studentForm}>
                    <form onSubmit={studentForm.handleSubmit(onStudentLogin)} className="space-y-4">
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
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isLoading}
                      >
                        {isLoading ? "Sending..." : "Send Magic Link"}
                      </Button>
                    </form>
                  </Form>
                )}
              </TabsContent>

              {/* Teacher Login Tab */}
              <TabsContent value="teacher">
                <Form {...teacherForm}>
                  <form onSubmit={teacherForm.handleSubmit(onTeacherLogin)} className="space-y-4">
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
                              placeholder="Enter your password"
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
                      {isLoading ? "Signing in..." : "Login"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* Admin Login Tab */}
              <TabsContent value="admin">
                <Form {...adminForm}>
                  <form onSubmit={adminForm.handleSubmit(onAdminLogin)} className="space-y-4">
                    <FormField
                      control={adminForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter admin username"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={adminForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter admin password"
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
                      {isLoading ? "Signing in..." : "Login"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-primary hover:underline"
                >
                  Register here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;