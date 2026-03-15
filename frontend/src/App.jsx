import { Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import CourseCreatePage from './pages/CourseCreatePage'
import CreateCourseIntroPage from './pages/CreateCourseIntroPage'
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import InstitutionDashboardPage from "./pages/InstitutionDashboardPage";

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
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/institution-dashboard" element={<InstitutionDashboardPage />} />
    </Routes>
    
  )
}

export default App
