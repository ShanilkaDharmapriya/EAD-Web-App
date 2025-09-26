import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Shell from './components/layout/Shell';
import Dashboard from './pages/Dashboard';
import Owners from './pages/Owners';
import Stations from './pages/Stations';
import Bookings from './pages/Bookings';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Shell />}>
          <Route index element={<Dashboard />} />
          <Route path="owners" element={<Owners />} />
          <Route path="stations" element={<Stations />} />
          <Route path="bookings" element={<Bookings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;


