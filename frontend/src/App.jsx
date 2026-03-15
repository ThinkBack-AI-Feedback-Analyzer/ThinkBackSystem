import { Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import InstitutionRegisterPage from './pages/InstitutionRegisterPage'
import CourseCreatePage from './pages/CourseCreatePage'
import CreateCourseIntroPage from './pages/CreateCourseIntroPage'
import LoginPage from './pages/LoginPage'

function App() {
  return (
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
