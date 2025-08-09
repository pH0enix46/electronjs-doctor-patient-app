import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import PatientForm from "./components/PatientForm";
import DoctorPage from "./pages/DoctorPage";
import Prescription from "./pages/Prescription";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<PatientForm />} />
          <Route path="doctors" element={<DoctorPage />} />
          <Route path="prescriptions" element={<Prescription />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
