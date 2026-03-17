import { Route, Routes, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import CourseCreatePage from './pages/CourseCreatePage'
import LoginPage from "./pages/LoginPage";
import InstitutionRegisterPage from "./pages/InstitutionRegisterPage";
import InstitutionDashboardPage from "./pages/InstitutionDashboardPage";
import StudentPortal from "./pages/StudentPortal";
import FormCreatePage from "./pages/FormCreatePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/course-create" element={<CourseCreatePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/institutions/register" element={<InstitutionRegisterPage />} />
      <Route
        path="/register"
        element={<Navigate to="/institutions/register" replace />}
      />
      <Route path="/institution-dashboard" element={<InstitutionDashboardPage />} />
      <Route path="/portal" element={<StudentPortal />} />
      <Route path="/feedbackForm" element={<FormCreatePage />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />

      <Route path="/about" element={<AboutPage />} />
<Route path="/contact" element={<ContactPage />} />
    </Routes>
  )
}

export default App
