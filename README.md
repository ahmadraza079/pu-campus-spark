# Punjab University - Learning Management System (LMS)

## 📚 Project Overview

This is a comprehensive Learning Management System (LMS) developed for the **Skill Development Centre** at the **University of the Punjab**. The system provides a modern, web-based platform for managing academic courses, student enrollments, teacher assignments, and administrative oversight.

## 🎯 Project Objectives

- **Digital Learning Platform**: Create a centralized system for course management and student learning
- **Role-Based Access Control**: Implement secure authentication with different user roles (Student, Teacher, Admin)
- **Course Management**: Enable teachers to claim courses, manage students, and upload materials
- **Student Tracking**: Allow students to view their courses, grades, and attendance records
- **Administrative Control**: Provide admins with comprehensive user and course management capabilities

## 🏗️ System Architecture

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with custom design system for Punjab University branding
- **shadcn/ui** components for consistent, accessible UI elements
- **React Router** for client-side navigation
- **React Hook Form** with Zod validation for form management

### Backend & Database
- **Supabase** as Backend-as-a-Service (BaaS)
- **PostgreSQL** database with Row Level Security (RLS)
- **Supabase Auth** for user authentication and authorization
- **Supabase Storage** for file uploads (course materials)
- **Edge Functions** for server-side operations

### Key Features
- **Multi-Role Authentication** (Student, Teacher, Admin)
- **Course Claiming System** with access codes
- **Student Enrollment Management**
- **File Upload & Material Sharing**
- **Attendance Tracking**
- **Grade Management**
- **Audit Logging**
- **Responsive Design** for all devices

## 👥 User Roles & Capabilities

### 🎓 Student
- **Authentication**: Login with email/password or National ID
- **Course Access**: View enrolled courses and materials
- **Progress Tracking**: Monitor grades and attendance
- **Material Download**: Access course materials uploaded by teachers

### 👨‍🏫 Teacher
- **Course Management**: Claim courses using access codes provided by admin
- **Student Management**: Add students to courses and manage enrollments
- **Material Upload**: Upload and share course materials (PDFs, presentations, images)
- **Grade Assignment**: Assign grades to enrolled students
- **Attendance Tracking**: Mark student attendance for classes

### 🛡️ Admin
- **User Management**: Create and manage student and teacher accounts
- **Course Creation**: Create new courses with unique access codes
- **System Oversight**: Monitor all users, courses, and activities
- **Access Code Management**: Generate and manage course access codes
- **Audit Logs**: Track all system activities for security and compliance

## 🗄️ Database Schema

### Core Tables

#### `profiles`
- User profile information linked to Supabase Auth
- Stores role, contact information, and unique identifiers
- Supports students (voucher numbers), teachers (teacher IDs), and admins (usernames)

#### `courses`
- Course information with unique access codes
- Links to teachers through claiming mechanism
- Supports course codes and descriptions

#### `enrollments`
- Student-course relationships
- Stores grades and enrollment status
- Unique constraint prevents duplicate enrollments

#### `attendance`
- Daily attendance records for students
- Links to courses and marking teachers
- Supports Present/Absent status tracking

#### `course_materials`
- File storage metadata for course materials
- Links to Supabase Storage for actual files
- Tracks upload information and file details

#### `audit_logs`
- System activity logging for security and compliance
- Tracks user actions, entity changes, and timestamps

### Security Features
- **Row Level Security (RLS)** enabled on all tables
- **Role-based policies** ensuring users can only access appropriate data
- **Audit logging** for all critical operations
- **Secure file storage** with access controls

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd punjab-university-lms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - The project is pre-configured with Supabase
   - Environment variables are automatically managed

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open your browser and navigate to `http://localhost:8080`
   - The application will automatically redirect to the landing page

## 🔐 Authentication System

### Student Authentication
- **Login**: Email/password or National ID (CNIC)
- **Registration**: Requires email, phone, and voucher number
- **Password**: Uses National ID as default password for simplicity

### Teacher Authentication
- **Login**: Email/password or Teacher ID
- **Registration**: Requires email, phone, Teacher ID, and custom password
- **Course Access**: Must claim courses using admin-provided access codes

### Admin Authentication
- **Login**: Username/password system
- **Default Credentials**: Username: `ADMIN`, Password: `ADMIN789`
- **Full System Access**: Can manage all users and courses

## 📱 User Interface Design

### Design System
- **Punjab University Branding**: Custom color scheme with university colors
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: WCAG compliant with proper contrast ratios and keyboard navigation
- **Modern UI**: Clean, professional interface with smooth animations

### Key Design Elements
- **Gradient Backgrounds**: Beautiful gradients reflecting university branding
- **Card-Based Layout**: Clean, organized information presentation
- **Interactive Elements**: Hover states, transitions, and micro-interactions
- **Consistent Typography**: Professional font hierarchy and spacing

## 🔧 Technical Implementation

### State Management
- **React Context**: For authentication state management
- **React Query**: For server state management and caching
- **Local State**: Component-level state for UI interactions

### Form Handling
- **React Hook Form**: Efficient form state management
- **Zod Validation**: Type-safe form validation schemas
- **Error Handling**: Comprehensive error messages and user feedback

### File Management
- **Supabase Storage**: Secure file storage for course materials
- **File Type Support**: PDFs, presentations, images, and documents
- **Upload Progress**: Real-time upload status and error handling

### Security Measures
- **Row Level Security**: Database-level access controls
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Client and server-side validation
- **CORS Protection**: Proper cross-origin request handling

## 📊 Key Features Demonstration

### Course Management Workflow
1. **Admin** creates courses with unique access codes
2. **Teachers** claim courses using provided access codes
3. **Teachers** add students to their claimed courses
4. **Students** access course materials and track progress

### Material Sharing System
1. **Teachers** upload course materials (PDFs, presentations, etc.)
2. **Files** are securely stored in Supabase Storage
3. **Students** can download materials from their enrolled courses
4. **Access Control** ensures only enrolled students can access materials

### Attendance & Grading
1. **Teachers** mark daily attendance for students
2. **Grades** are assigned and tracked per course
3. **Students** can view their attendance percentage and grades
4. **Progress Tracking** provides insights into academic performance

## 🛠️ Development Tools & Technologies

### Core Technologies
- **React 18.3.1**: Modern React with hooks and concurrent features
- **TypeScript 5.8.3**: Type-safe development with enhanced IDE support
- **Vite 5.4.19**: Fast build tool with hot module replacement
- **Tailwind CSS 3.4.17**: Utility-first CSS framework

### UI Components
- **shadcn/ui**: High-quality, accessible React components
- **Radix UI**: Unstyled, accessible UI primitives
- **Lucide React**: Beautiful, customizable icons
- **React Hook Form**: Performant forms with easy validation

### Backend Services
- **Supabase**: Complete backend platform
- **PostgreSQL**: Robust relational database
- **Edge Functions**: Serverless functions for custom logic
- **Real-time Subscriptions**: Live data updates

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── auth/           # Authentication components
│   └── dashboard/      # Dashboard-specific components
├── pages/              # Route components
│   ├── dashboard/      # Role-specific dashboards
│   ├── Login.tsx       # Authentication page
│   ├── Register.tsx    # User registration
│   └── Landing.tsx     # Public landing page
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── integrations/       # External service integrations
└── assets/            # Static assets

supabase/
├── functions/          # Edge functions
├── migrations/         # Database migrations
└── config.toml        # Supabase configuration
```

## 🔄 Data Flow

### Authentication Flow
1. User selects role (Student/Teacher/Admin)
2. Provides credentials based on role requirements
3. Supabase Auth validates credentials
4. User profile is fetched from database
5. User is redirected to appropriate dashboard

### Course Management Flow
1. Admin creates course with access code
2. Teacher claims course using access code
3. Teacher adds students to course
4. Students access course materials and track progress

### File Upload Flow
1. Teacher selects file and provides metadata
2. File is uploaded to Supabase Storage
3. Metadata is stored in course_materials table
4. Students can download files from their courses

## 🔒 Security Implementation

### Database Security
- **Row Level Security (RLS)** policies on all tables
- **Role-based access control** ensuring data isolation
- **Foreign key constraints** maintaining data integrity
- **Unique constraints** preventing duplicate entries

### Authentication Security
- **JWT tokens** for secure session management
- **Password hashing** handled by Supabase Auth
- **Email verification** for account activation
- **Session management** with automatic token refresh

### File Security
- **Authenticated access** to uploaded materials
- **Course-based permissions** for file access
- **Secure URLs** with proper access controls

## 📈 Performance Optimizations

### Frontend Optimizations
- **Code splitting** with React.lazy for route-based splitting
- **Memoization** of expensive computations
- **Optimized re-renders** with proper dependency arrays
- **Image optimization** with proper loading strategies

### Backend Optimizations
- **Database indexing** on frequently queried columns
- **Query optimization** with proper joins and filters
- **Caching strategies** with React Query
- **Connection pooling** handled by Supabase

## 🧪 Testing & Quality Assurance

### Code Quality
- **TypeScript** for compile-time error detection
- **ESLint** for code style consistency
- **Prettier** for code formatting
- **Strict mode** enabled for better error catching

### Error Handling
- **Comprehensive error boundaries** for React components
- **Database error handling** with user-friendly messages
- **Network error recovery** with retry mechanisms
- **Form validation** with clear error messages

## 📱 Responsive Design

### Mobile-First Approach
- **Responsive breakpoints** for all screen sizes
- **Touch-friendly interfaces** for mobile devices
- **Optimized navigation** for small screens
- **Performance optimization** for mobile networks

### Cross-Browser Compatibility
- **Modern browser support** (Chrome, Firefox, Safari, Edge)
- **Progressive enhancement** for older browsers
- **CSS Grid and Flexbox** for layout consistency

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deployment Options
- **Vercel**: Optimized for React applications
- **Netlify**: Static site hosting with serverless functions
- **Supabase Hosting**: Integrated hosting solution

## 📞 Contact Information

**University of the Punjab**  
**Skill Development Centre**  
**Phone**: +92 330 5409555

## 🎓 Educational Value

This project demonstrates:

### Technical Skills
- **Full-stack development** with modern technologies
- **Database design** and management
- **Authentication and authorization** implementation
- **File handling** and storage solutions
- **Responsive web design** principles

### Software Engineering Practices
- **Component-based architecture** for maintainability
- **Type safety** with TypeScript
- **Error handling** and user experience
- **Security best practices** implementation
- **Code organization** and modularity

### Real-World Application
- **Educational domain** understanding
- **User role management** in enterprise applications
- **File management systems** implementation
- **Audit logging** for compliance and security
- **Scalable architecture** design

## 🔮 Future Enhancements

### Planned Features
- **Video conferencing** integration for live classes
- **Assignment submission** system with plagiarism detection
- **Discussion forums** for course-specific conversations
- **Mobile application** for iOS and Android
- **Advanced analytics** and reporting dashboard
- **Email notifications** for important events
- **Calendar integration** for scheduling
- **Multi-language support** (Urdu/English)

### Technical Improvements
- **Real-time notifications** using WebSockets
- **Offline support** with service workers
- **Advanced search** with full-text search capabilities
- **Data export** functionality for reports
- **API rate limiting** for better performance
- **Automated testing** suite implementation

## 📝 Conclusion

This Learning Management System represents a complete, production-ready application that addresses the real-world needs of educational institutions. It demonstrates modern web development practices, secure authentication systems, and scalable architecture design.

The project showcases proficiency in:
- **Frontend Development**: React, TypeScript, and modern UI frameworks
- **Backend Integration**: Database design, API integration, and file management
- **Security Implementation**: Authentication, authorization, and data protection
- **User Experience Design**: Responsive design and accessibility considerations
- **Project Management**: Code organization, documentation, and deployment strategies

The system is designed to be maintainable, scalable, and user-friendly, making it suitable for real-world deployment in educational institutions.

---

**Developed by**: [Your Name]  
**Institution**: University of the Punjab  
**Course**: [Your Course Name]  
**Submission Date**: [Current Date]