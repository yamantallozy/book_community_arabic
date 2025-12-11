import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const ShelfControl = ({ bookId }) => {
    const { user } = useContext(AuthContext);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);

    const STATUS_LABELS = {
        'None': 'None',
        'WantToRead': 'Want to Read',
        'CurrentlyReading': 'Currently Reading',
        'Read': 'Read'
    };

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchStatus = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/shelves/book/${bookId}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setStatus(res.data.status || 'None');
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch shelf status', err);
                setLoading(false);
            }
        };

        fetchStatus();
    }, [bookId, user]);

    const handleChange = async (e) => {
        const newStatus = e.target.value;
        if (!user) return alert('Please login to shelve books');

        try {
            await axios.post('http://localhost:5000/api/shelves', {
                bookId,
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setStatus(newStatus);
        } catch (err) {
            console.error('Failed to update shelf', err);
            alert('Failed to update shelf');
        }
    };

    if (loading) return <div>Loading...</div>;

    if (!user) return null;

    return (
        <div className="mt-6">
            <select
                value={status}
                onChange={handleChange}
                className="w-full md:w-auto bg-slate-50 border border-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer shadow-sm"
            >
                <option value="" disabled>Select Shelf Status</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                ))}
            </select>
        </div>
    );
};

export default ShelfControl;
