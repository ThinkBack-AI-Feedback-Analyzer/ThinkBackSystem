import { Route, Routes, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'

import LandingPage              from './pages/landing/LandingPage'
import AboutPage                from './pages/landing/AboutPage'
import ContactPage              from './pages/landing/ContactPage'

import LoginPage                from './pages/auth/LoginPage'
import InstitutionRegisterPage  from './pages/auth/InstitutionRegisterPage'
import InstitutionRegistrationSuccessPage from './pages/auth/InstitutionRegistrationSuccessPage'
import SetPasswordPage          from './pages/auth/SetPasswordPage'

import InstitutionDashboardPage from './pages/dashboard/InstitutionDashboardPage'
import StaffDashboardPage       from './pages/dashboard/StaffDashboardPage'

import CoursesPage              from './pages/courses/CoursesPage'
import CourseCreatePage         from './pages/courses/CourseCreatePage'

import ManageUsersPage          from './pages/staff/ManageUsersPage'

import FeedbackFormsPage        from './pages/feedback/FeedbackFormsPage'
import FormCreatePage           from './pages/feedback/FormCreatePage'
import StaffFormCreatePage      from './pages/feedback/StaffFormCreatePage'
import FeedbackRespondPage      from './pages/feedback/FeedbackRespondPage'
import FeedbackAnalysisPage     from './pages/feedback/FeedbackAnalysisPage'

import StudentPortal            from './pages/student/StudentPortal'
import StudentManagement        from './pages/student/StudentManagementPage'
import StudentsPage             from './pages/student/StudentsPage'

import ReportsPage              from './pages/reports/ReportsPage'
import SettingsPage             from './pages/settings/SettingsPage'

import SuperAdminDashboardPage  from './pages/superadmin/SuperAdminDashboardPage'
import InstitutionsPage         from './pages/superadmin/InstitutionsPage'
import InstitutionDetailsPage   from './pages/superadmin/InstitutionDetailsPage'
import PendingApprovalsPage     from './pages/superadmin/PendingApprovalsPage'
import AdminsPage               from './pages/superadmin/AdminsPage'
import UsersPage                from './pages/superadmin/UsersPage'
import AuditLogPage             from './pages/superadmin/AuditLogPage'
import ProfilePage              from './pages/superadmin/ProfilePage'

function App() {
  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/"                      element={<LandingPage />} />
        <Route path="/about"                 element={<AboutPage />} />
        <Route path="/contact"               element={<ContactPage />} />

        <Route path="/login"                 element={<LoginPage />} />
        <Route path="/institutions/register" element={<InstitutionRegisterPage />} />
        <Route path="/institutions/registration-success" element={<InstitutionRegistrationSuccessPage />} />
        <Route path="/register"              element={<Navigate to="/institutions/register" replace />} />
        <Route path="/set-password"          element={<SetPasswordPage />} />

        <Route path="/institution-dashboard" element={<InstitutionDashboardPage />} />
        <Route path="/staff-dashboard"       element={<StaffDashboardPage />} />

        <Route path="/courses"               element={<CoursesPage />} />
        <Route path="/course-create"         element={<CourseCreatePage />} />

        <Route path="/manage-users"          element={<ManageUsersPage />} />

        <Route path="/feedback-forms"        element={<FeedbackFormsPage />} />
        <Route path="/feedbackForm"          element={<FormCreatePage />} />
        <Route path="/feedback-analysis"     element={<FeedbackAnalysisPage />} />
        <Route path="/staff-form-create"     element={<StaffFormCreatePage />} />

        <Route path="/feedback/respond"      element={<FeedbackRespondPage />} />

        <Route path="/portal"                element={<StudentPortal />} />
        <Route path="/student-management"    element={<StudentManagement />} />
        <Route path="/students"              element={<StudentsPage />} />

        <Route path="/reports"               element={<ReportsPage />} />
        <Route path="/settings"              element={<SettingsPage />} />

        <Route path="/superadmin"            element={<SuperAdminDashboardPage />} />
        <Route path="/superadmin/approvals"  element={<PendingApprovalsPage />} />
        <Route path="/superadmin/institutions" element={<InstitutionsPage />} />
        <Route path="/superadmin/institutions/:id" element={<InstitutionDetailsPage />} />
        <Route path="/superadmin/admins"     element={<AdminsPage />} />
        <Route path="/superadmin/users"      element={<UsersPage />} />
        <Route path="/superadmin/audit"      element={<AuditLogPage />} />
        <Route path="/superadmin/profile"    element={<ProfilePage />} />

        <Route path="*"                      element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
