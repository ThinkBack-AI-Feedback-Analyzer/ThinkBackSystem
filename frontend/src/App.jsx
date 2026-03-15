import { Route, Routes, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import CourseCreatePage from './pages/CourseCreatePage'
import CreateCourseIntroPage from './pages/CreateCourseIntroPage'
import LoginPage from "./pages/LoginPage";
import InstitutionRegisterPage from "./pages/InstitutionRegisterPage";
import InstitutionDashboardPage from "./pages/InstitutionDashboardPage";
import StudentPortal from "./pages/StudentPortal";
import FormCreatePage from "./pages/FormCreatePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/create-course-intro"
        element={<CreateCourseIntroPage />}
      />
      <Route path="/course-create" element={<CourseCreatePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<InstitutionRegisterPage />} />
      <Route path="/institution-dashboard" element={<InstitutionDashboardPage />} />
      <Route path="/portal" element={<StudentPortal />} />
      <Route path="/feedbackForm" element={<FormCreatePage />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
