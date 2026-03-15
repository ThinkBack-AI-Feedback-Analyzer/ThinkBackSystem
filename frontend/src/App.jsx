import { Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import CourseCreatePage from './pages/CourseCreatePage'
import CreateCourseIntroPage from './pages/CreateCourseIntroPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/create-course-intro"
        element={<CreateCourseIntroPage />}
      />
      <Route path="/course-create" element={<CourseCreatePage />} />
    </Routes>
  )
}

export default App
