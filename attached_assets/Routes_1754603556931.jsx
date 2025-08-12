import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import KanbanBoardView from './pages/kanban-board-view';
import TicketCreationForm from './pages/ticket-creation-form';
import SupportAgentDashboard from './pages/support-agent-dashboard';
import LoginAndAuthentication from './pages/login-and-authentication';
import SLAMonitoringCenter from './pages/sla-monitoring-center';
import UserManagementConsole from './pages/user-management-console';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<KanbanBoardView />} />
        <Route path="/kanban-board-view" element={<KanbanBoardView />} />
        <Route path="/ticket-creation-form" element={<TicketCreationForm />} />
        <Route path="/support-agent-dashboard" element={<SupportAgentDashboard />} />
        <Route path="/login-and-authentication" element={<LoginAndAuthentication />} />
        <Route path="/sla-monitoring-center" element={<SLAMonitoringCenter />} />
        <Route path="/user-management-console" element={<UserManagementConsole />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
