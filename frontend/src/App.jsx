<<<<<<< HEAD
import { Route, Routes } from 'react-router-dom'
=======



import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'


>>>>>>> 92f859b8ae2463a9b976b061a0b40779948a93a6
import LandingPage from './pages/LandingPage'
import CourseCreatePage from './pages/CourseCreatePage'
import CreateCourseIntroPage from './pages/CreateCourseIntroPage'
<<<<<<< HEAD
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import InstitutionDashboardPage from "./pages/InstitutionDashboardPage";
=======



import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import InstitutionDashboardPage from "./pages/InstitutionDashboardPage"
import StudentPortal from "./pages/StudentPortal"
import FormCreatePage from "./pages/FormCreatePage"

>>>>>>> 92f859b8ae2463a9b976b061a0b40779948a93a6

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
<<<<<<< HEAD
      <Route path="/course-create" element={<CourseCreatePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/institution-dashboard" element={<InstitutionDashboardPage />} />
=======



        <Route path="/course-create" element={<CourseCreatePage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/institution-dashboard" element={<InstitutionDashboardPage />} />

        <Route path="/portal" element={<StudentPortal />} />

        <Route path="/feedbackForm" element={<FormCreatePage />} />


      <Route path="*" element={<Navigate to="/" replace />} />
>>>>>>> 92f859b8ae2463a9b976b061a0b40779948a93a6
    </Routes>
  )
}

export default App
