import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const SetupAdmin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { createAdminAccount, showToast } = useAppContext();
    const navigate = useNavigate();

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createAdminAccount(email, password);
            showToast('Admin account created successfully!', 'success');
            navigate('/admin');
        } catch (err: any) {
            console.error(err);
            showToast('Error creating admin account: ' + err.message, 'error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-black text-gray-900 mb-6 text-center">Setup Admin</h2>
                <form onSubmit={handleSetup} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Admin Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                    >
                        Create Admin
                    </button>
                </form>
            </div>
        </div>
    );
};
