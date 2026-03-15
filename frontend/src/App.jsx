import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import InstitutionRegisterPage from './pages/InstitutionRegisterPage'
import CourseCreatePage from './pages/CourseCreatePage'
import CreateCourseIntroPage from './pages/CreateCourseIntroPage'
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/institutions/register"
          element={<InstitutionRegisterPage />}
        />

        <Route
          path="/create-course-intro"
          element={<CreateCourseIntroPage />}
        />

        <Route path="/course-create" element={<CourseCreatePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App