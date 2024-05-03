import  { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

function UserList({ token }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch('http://localhost:3000/users', {
        headers: {
          'token': `${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    };

    fetchUsers();
  }, [token]);

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <ul className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        {users.map(user => (
          <li key={user._id} className="border-b border-gray-200 py-2">{user.contactInfo.email} - {user.status}</li>
        ))}
      </ul>
    </div>
  );
}

UserList.propTypes = {
    token: PropTypes.string.isRequired
  };

export default UserList;
