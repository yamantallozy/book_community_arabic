import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const UserProfile = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Editing state
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/users/${id}`);
                setProfile(res.data);
                setBio(res.data.bio || '');
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append('bio', bio);
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            await axios.put('http://localhost:5000/api/users/profile', formData, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setIsEditing(false);
            // Refresh to show new avatar immediately
            const res = await axios.get(`http://localhost:5000/api/users/${id}`);
            setProfile(res.data);
            alert('Profile updated!');
        } catch (err) {
            console.error(err);
            alert('Failed to update profile');
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading profile...</div>;
    if (!profile) return <div style={{ padding: '20px' }}>User not found</div>;

    const isOwnProfile = user && Number(user.id) === Number(profile.id);

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', color: '#fff' }}>
            <div style={{ background: '#222', padding: '30px', borderRadius: '12px', textAlign: 'center' }}>
                <img
                    src={profile.avatar || 'https://via.placeholder.com/150'}
                    alt="Avatar"
                    style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #444', marginBottom: '20px' }}
                />

                {isEditing ? (
                    <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Upload Avatar (Image):</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => setAvatarFile(e.target.files[0])}
                                style={{ width: '100%', padding: '8px', background: '#333', border: '1px solid #555', color: '#fff' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Bio:</label>
                            <textarea
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                style={{ width: '100%', height: '100px', padding: '8px', background: '#333', border: '1px solid #555', color: '#fff' }}
                            />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <button onClick={handleSave} style={{ padding: '8px 20px', background: '#646cff', border: 'none', color: '#fff', borderRadius: '4px', marginRight: '10px', cursor: 'pointer' }}>Save</button>
                            <button onClick={() => setIsEditing(false)} style={{ padding: '8px 20px', background: '#555', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 style={{ margin: '0 0 10px 0' }}>{profile.username}</h2>
                        {profile.isAdmin && <span style={{ background: 'red', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8em' }}>ADMIN</span>}
                        <p style={{ color: '#aaa', fontStyle: 'italic' }}>Joined {new Date(profile.createdAt).toLocaleDateString()}</p>

                        <div style={{ textAlign: 'left', background: '#333', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
                            <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #444', paddingBottom: '5px' }}>About</h4>
                            <p style={{ lineHeight: '1.6' }}>{profile.bio || 'No bio yet.'}</p>
                        </div>

                        {isOwnProfile && (
                            <button
                                onClick={() => setIsEditing(true)}
                                style={{ marginTop: '20px', padding: '10px 20px', background: '#444', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Edit Profile
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
