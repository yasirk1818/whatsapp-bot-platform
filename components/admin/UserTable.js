import React, { useState, useEffect } from 'react';
import API from '../../api';

const UserTable = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        API.get('/admin/users')
            .then(res => setUsers(res.data))
            .catch(err => console.error("Failed to fetch users", err));
    }, []);

    const handleDeleteUser = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            API.delete(`/admin/users/${userId}`)
                .then(() => setUsers(users.filter(u => u._id !== userId)));
        }
    };
    
    const handleBlockUser = (userId, isBlocked) => {
        API.put(`/admin/users/${userId}/block`, { isBlocked: !isBlocked })
           .then(res => {
               setUsers(users.map(u => u._id === userId ? res.data : u));
           });
    };

    return (
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>WhatsApp Connected</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{user.isBlocked ? 'Blocked' : 'Active'}</td>
                        <td>{user.isWhatsAppConnected ? 'Yes' : 'No'}</td>
                        <td>
                            <button onClick={() => handleBlockUser(user._id, user.isBlocked)}>
                                {user.isBlocked ? 'Unblock' : 'Block'}
                            </button>
                            <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
                            {/* Edit button would open a modal */}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default UserTable;
