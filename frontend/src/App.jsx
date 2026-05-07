import { Route, Routes, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'

import LandingPage              from './pages/landing/LandingPage'
import AboutPage                from './pages/landing/AboutPage'
import ContactPage              from './pages/landing/ContactPage'

import LoginPage                from './pages/auth/LoginPage'
import InstitutionRegisterPage  from './pages/auth/InstitutionRegisterPage'
import SetPasswordPage          from './pages/auth/SetPasswordPage'

import InstitutionDashboardPage from './pages/dashboard/InstitutionDashboardPage'
import StaffDashboardPage       from './pages/dashboard/StaffDashboardPage'

import CoursesPage              from './pages/courses/CoursesPage'
import CourseCreatePage         from './pages/courses/CourseCreatePage'

import ManageUsersPage          from './pages/staff/ManageUsersPage'

import FeedbackFormsPage        from './pages/feedback/FeedbackFormsPage'
import FormCreatePage           from './pages/feedback/FormCreatePage'
import StaffFormCreatePage      from './pages/feedback/StaffFormCreatePage'

import StudentPortal            from './pages/student/StudentPortal'
import StudentManagement        from './pages/student/StudentManagementPage'
import StudentsPage             from './pages/student/StudentsPage'

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
        <Route path="/register"              element={<Navigate to="/institutions/register" replace />} />
        <Route path="/set-password"          element={<SetPasswordPage />} />

        <Route path="/institution-dashboard" element={<InstitutionDashboardPage />} />
        <Route path="/staff-dashboard"       element={<StaffDashboardPage />} />

        <Route path="/courses"               element={<CoursesPage />} />
        <Route path="/course-create"         element={<CourseCreatePage />} />

        <Route path="/manage-users"          element={<ManageUsersPage />} />

        <Route path="/feedback-forms"        element={<FeedbackFormsPage />} />
        <Route path="/feedbackForm"          element={<FormCreatePage />} />
        <Route path="/staff-form-create"     element={<StaffFormCreatePage />} />

        <Route path="/portal"                element={<StudentPortal />} />
        <Route path="/student-management"    element={<StudentManagement />} />
        <Route path="/students"              element={<StudentsPage />} />

        <Route path="*"                      element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
