import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link
} from 'react-router-dom';
import Login from './components/Login';
import AddUser from './components/AddUser';
import UserList from './components/UserList';

function App() {
  const [token, setToken] = useState('');

  useEffect(() => {
    // Optionally, you could retrieve an existing token from localStorage if needed
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleLogin = (token) => {
    setToken(token);
    localStorage.setItem('token', token);  // Save token to localStorage for session persistence
  };

  return (
    <Router>
      <div>
        <nav className="bg-gray-800 p-3 text-white">
          <ul className="flex space-x-4 justify-center">
            {!token && (
              <li>
                <Link to="/login">Login</Link>
              </li>
            )}
            {token && (
              <>
                <li>
                  <Link to="/add-user">Add User</Link>
                </li>
                <li>
                  <Link to="/users">User List</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
        
        <Routes>
          <Route path="/" element={!token ? <Navigate to="/login" /> : <Navigate to="/users" />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/add-user" element={token ? <AddUser token={token} /> : <Navigate to="/login" />} />
          <Route path="/users" element={token ? <UserList token={token} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
