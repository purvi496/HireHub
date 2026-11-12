
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import MyApplications from "./pages/MyApplications";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import PostJob from "./pages/PostJob";
import EditJob from "./pages/EditJob";
import Applicants from "./pages/Applicants";
import SavedJobs from "./pages/SavedJobs";
import Profile from "./pages/Profile";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetails />} />
      <Route path="/my-applications" element={<MyApplications />} />
      <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
      <Route path="/post-job" element={<PostJob />} />
      <Route path="/edit-job/:id" element={<EditJob />} />
      <Route path="/applicants/:jobId" element={<Applicants />} />
      <Route path="/saved-jobs" element={<SavedJobs />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;
