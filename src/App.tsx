import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AppLayout from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import PostApplyPage from "./pages/PostApplyPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CompanyRegisterPage from "./pages/CompanyRegisterPage";
import PostJobPage from "./pages/PostJobPage";
import CompanyDashboard from "./pages/CompanyDashboard";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminCompaniesPage from "./pages/admin/AdminCompaniesPage";
import AdminJobsPage from "./pages/admin/AdminJobsPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <AdminLayout>{children}</AdminLayout>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary">
        <div className="animate-fade-in flex flex-col items-center gap-3">
          <div className="h-20 w-20 rounded-2xl bg-primary-foreground/15 flex items-center justify-center">
            <span className="text-4xl font-extrabold text-primary-foreground">JG</span>
          </div>
          <h1 className="text-display text-primary-foreground">Job Giver SL</h1>
          <p className="text-body text-primary-foreground/70">Find jobs in Sierra Leone</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignupPage />} />
      
      {/* Main app routes */}
      <Route path="/" element={<ProtectedRoute><AppLayout><HomePage /></AppLayout></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute><AppLayout><JobsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/jobs/:id" element={<ProtectedRoute><AppLayout><JobDetailPage /></AppLayout></ProtectedRoute>} />
      <Route path="/post" element={<ProtectedRoute><AppLayout><PostApplyPage /></AppLayout></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute><AppLayout><ApplicationsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
      <Route path="/company/register" element={<ProtectedRoute><CompanyRegisterPage /></ProtectedRoute>} />
      <Route path="/company/dashboard" element={<ProtectedRoute><CompanyDashboard /></ProtectedRoute>} />
      <Route path="/post-job" element={<ProtectedRoute><PostJobPage /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
      <Route path="/admin/companies" element={<AdminRoute><AdminCompaniesPage /></AdminRoute>} />
      <Route path="/admin/jobs" element={<AdminRoute><AdminJobsPage /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
