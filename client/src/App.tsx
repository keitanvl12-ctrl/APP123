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

import HierarchyDemo from "@/components/HierarchyDemo";
import { PermissionGuard, AdminOnly, SupervisorOnly } from "@/components/PermissionGuard";
import { useEffect, useState } from "react";
import { useWebSocket } from "./hooks/useWebSocket";

// Import the proper auth hook and provider
import { useAuth, AuthProvider } from "./hooks/useAuth.tsx";

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
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/unauthorized" component={UnauthorizedPage} />
      
      <Route>
        <ProtectedRoute>
          <Layout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/tickets" component={KanbanBoard} />
              <Route path="/create-ticket" component={CreateTicket} />
              
              <Route path="/analytics">
                <ProtectedRoute requiredRole="supervisor">
                  <Analytics />
                </ProtectedRoute>
              </Route>
              
              <Route path="/sla" component={SLA} />
              
              <Route path="/users">
                <ProtectedRoute requiredRole="supervisor">
                  <UserManagement />
                </ProtectedRoute>
              </Route>
              
              <Route path="/team">
                <ProtectedRoute requiredRole="supervisor">
                  <Team />
                </ProtectedRoute>
              </Route>
              
              <Route path="/departments">
                <ProtectedRoute requiredRole="administrador">
                  <DepartmentManager />
                </ProtectedRoute>
              </Route>
              
              <Route path="/roles">
                <ProtectedRoute requiredRole="administrador">
                  <RolesManagement />
                </ProtectedRoute>
              </Route>
              
              <Route path="/hierarchy-demo" component={() => <HierarchyDemo />} />
              
              <Route path="/categories">
                <ProtectedRoute requiredRole="supervisor">
                  <Categories />
                </ProtectedRoute>
              </Route>

              <Route path="/fields">
                <ProtectedRoute requiredRole="supervisor">
                  <CustomFieldsManager />
                </ProtectedRoute>
              </Route>
              
              <Route path="/approvals" component={Approvals} />
              <Route path="/workflow-approvals" component={WorkflowApprovals} />
              
              <Route path="/reports">
                <ProtectedRoute requiredRole="supervisor">
                  <ReportsNew />
                </ProtectedRoute>
              </Route>
              
              <Route path="/user-profiles" component={UserProfiles} />
              
              <Route path="/sla-config">
                <ProtectedRoute requiredRole="supervisor">
                  <SLAConfiguration />
                </ProtectedRoute>
              </Route>
              
              <Route path="/config">
                <ProtectedRoute requiredRole="administrador">
                  <ConfigurationPage />
                </ProtectedRoute>
              </Route>
              
              <Route path="/permissions">
                <ProtectedRoute requiredRole="administrador">
                  <FunctionConfig />
                </ProtectedRoute>
              </Route>
              
              <Route path="/permissions-old">
                <ProtectedRoute requiredRole="administrador">
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
        <AuthProvider>
          <ThemeProvider>
            <TooltipProvider>
              <AppRouter />
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </Provider>
    </QueryClientProvider>
  );
}