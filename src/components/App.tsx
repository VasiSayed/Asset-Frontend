import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Helpdesk from './pages/Helpdesk';
import SolutionManagent from './pages/SolutionManagent';
import Announcement from './pages/Announcement';
import AdditionalFileds from './pages/AdditionalFields';
import CheckLists from './pages/CheckLists';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/helpdesk" element={<Helpdesk />} />
          <Route path="/soulution-management" element={<SolutionManagent />} />
          <Route path="/announcements" element={<Announcement />} />
          <Route path="/additional-fields" element={<AdditionalFileds/>} />
          <Route path="/checklists" element={<CheckLists/>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

