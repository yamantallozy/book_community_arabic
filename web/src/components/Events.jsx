import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Events = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Admin Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [zoomLink, setZoomLink] = useState('');
    const [showForm, setShowForm] = useState(false);

    const fetchEvents = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/events');
            setEvents(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (!user || !user.isAdmin) return;

        try {
            await axios.post('http://localhost:5000/api/events', {
                title, description, eventDate, zoomLink
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setShowForm(false);
            setTitle('');
            setDescription('');
            setEventDate('');
            setZoomLink('');
            fetchEvents();
        } catch (err) {
            console.error(err);
            alert('فشل إنشاء الفعالية');
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه الفعالية؟')) return;
        try {
            await axios.delete(`http://localhost:5000/api/events/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchEvents();
        } catch (err) {
            console.error(err);
            alert('فشل حذف الفعالية');
        }
    };

    if (loading) return <div className="text-center py-10">جاري التحميل...</div>;

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800">فعاليات المجتمع</h1>
                {user && user.isAdmin && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-primary hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition"
                    >
                        {showForm ? 'إلغاء' : 'إضافة فعالية جديدة'}
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-slate-200">
                    <h2 className="text-xl font-bold mb-4">تفاصيل الفعالية</h2>
                    <form onSubmit={handleCreateEvent} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">عنوان الفعالية</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">الوصف</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded-lg" rows="3"></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">التاريخ والوقت</label>
                                <input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} required className="w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">رابط Zoom (اختياري)</label>
                                <input type="text" value={zoomLink} onChange={e => setZoomLink(e.target.value)} className="w-full p-2 border rounded-lg" />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg">نشر الفعالية</button>
                    </form>
                </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.length === 0 ? (
                    <p className="text-slate-500 col-span-3 text-center">لا توجد فعاليات قادمة حالياً.</p>
                ) : (
                    events.map(event => (
                        <div key={event.EventID} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
                            <div className="bg-indigo-50 p-4 border-b border-indigo-100">
                                <h3 className="text-xl font-bold text-indigo-900">{event.Title}</h3>
                                <p className="text-sm text-indigo-600 font-medium mt-1">
                                    {new Date(event.EventDate).toLocaleDateString()} • {new Date(event.EventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <div className="p-5">
                                <p className="text-slate-600 mb-4 whitespace-pre-line">{event.Description || 'لا يوجد وصف.'}</p>

                                {event.ZoomLink && (
                                    <a href={event.ZoomLink} target="_blank" rel="noopener noreferrer" className="block text-center bg-blue-50 text-blue-600 py-2 rounded-lg font-bold hover:bg-blue-100 transition mb-3">
                                        انضمام عبر Zoom
                                    </a>
                                )}

                                {user && user.isAdmin && (
                                    <button onClick={() => handleDeleteEvent(event.EventID)} className="w-full text-red-500 text-sm hover:text-red-700 border border-red-200 py-1 rounded hover:bg-red-50 transition">
                                        حذف الفعالية
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Events;
