import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { queryClient } from "./lib/queryClient";
import { store } from "./store";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import AllTickets from "@/pages/AllTickets";
import KanbanBoard from "@/pages/KanbanBoard";
import Analytics from "@/pages/Analytics";
import Team from "@/pages/Team";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import LoginPage from "@/pages/LoginPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import SLA from "@/pages/SLA";
import CreateTicket from "@/pages/CreateTicket";
import UserManagement from "@/pages/UserManagement";
import Categories from "@/pages/Categories";
import CustomFields from "@/pages/CustomFields";
import PermissionsConfig from "@/pages/PermissionsConfig";
import FunctionConfig from "@/pages/FunctionConfig";
import CustomFieldsManager from "@/pages/CustomFieldsManager";
import DepartmentManager from "@/pages/DepartmentManager";
import WorkflowApprovals from "@/pages/WorkflowApprovals";
import Approvals from "@/pages/Approvals";
import ReportsNew from "@/pages/ReportsNew";
import Departments from "@/pages/Departments";
import NotFound from "@/pages/NotFound";
import UserProfiles from "@/pages/UserProfiles";
import SLAConfiguration from "@/pages/SLAConfiguration";
import ConfigurationPage from "@/pages/ConfigurationPage";
import PermissionSettings from "@/pages/PermissionSettings";
import HierarchyManagement from "@/pages/HierarchyManagement";
import RolesManagement from "@/pages/RoleManagementSimple";
import Subcategories from "@/pages/Subcategories";
import HierarchyDemo from "@/components/HierarchyDemo";

import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useWebSocket } from "./hooks/useWebSocket";

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) => {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setLocation('/login');
        return;
      }
      if (requiredRole && !hasPermission(requiredRole)) {
        setLocation('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, isLoading, requiredRole, setLocation, hasPermission]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || (requiredRole && !hasPermission(requiredRole))) {
    return null;
  }

  return <>{children}</>;
};

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  useWebSocket(); // Initialize WebSocket connection

  // Redirect logic - run after auth state is determined
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = window.location.pathname;
      if (currentPath === '/' || currentPath === '/dashboard') {
        setLocation('/login');
      }
    }
  }, [isAuthenticated, isLoading, setLocation]);

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/unauthorized" component={UnauthorizedPage} />
      
      <Route>
        <ProtectedRoute>
          <Layout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/all-tickets" component={AllTickets} />
              <Route path="/kanban" component={KanbanBoard} />
              <Route path="/create-ticket" component={CreateTicket} />
              
              <Route path="/analytics">
                <ProtectedRoute requiredRole="system_admin">
                  <Analytics />
                </ProtectedRoute>
              </Route>
              
              <Route path="/team" component={Team} />
              <Route path="/sla" component={SLA} />
              
              <Route path="/user-management">
                <ProtectedRoute requiredRole="users_view">
                  <UserManagement />
                </ProtectedRoute>
              </Route>
              
              <Route path="/departments">
                <ProtectedRoute requiredRole="departamentos_visualizar">
                  <DepartmentManager />
                </ProtectedRoute>
              </Route>
              
              <Route path="/categories">
                <ProtectedRoute requiredRole="system_admin">
                  <Categories />
                </ProtectedRoute>
              </Route>

              <Route path="/subcategories">
                <ProtectedRoute requiredRole="system_admin">
                  <Subcategories />
                </ProtectedRoute>
              </Route>

              <Route path="/fields">
                <ProtectedRoute requiredRole="system_admin">
                  <CustomFieldsManager />
                </ProtectedRoute>
              </Route>
              
              <Route path="/approvals" component={Approvals} />
              <Route path="/workflow-approvals" component={WorkflowApprovals} />
              
              <Route path="/reports">
                <ProtectedRoute requiredRole="reports_view">
                  <ReportsNew />
                </ProtectedRoute>
              </Route>
              
              <Route path="/user-profiles" component={UserProfiles} />
              
              <Route path="/sla-config">
                <ProtectedRoute requiredRole="sistema_gerenciar_sla">
                  <SLAConfiguration />
                </ProtectedRoute>
              </Route>
              
              <Route path="/config">
                <ProtectedRoute requiredRole="sistema_gerenciar_configuracoes">
                  <ConfigurationPage />
                </ProtectedRoute>
              </Route>
              
              <Route path="/permissions">
                <ProtectedRoute requiredRole="sistema_gerenciar_funcoes">
                  <FunctionConfig />
                </ProtectedRoute>
              </Route>
              
              <Route path="/permissions-old">
                <ProtectedRoute requiredRole="sistema_gerenciar_funcoes">
                  <PermissionsConfig />
                </ProtectedRoute>
              </Route>
              
              <Route path="/settings" component={Settings} />
              <Route path="/profile" component={Profile} />

              <Route component={NotFound} />
            </Switch>
          </Layout>
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <AppRouter />
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </Provider>
    </QueryClientProvider>
  );
}