// frontend/src/pages/AttendancePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowLeft, FaArrowRight, FaSearch, FaUserPlus, FaQrcode } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:5000/api'; // يجب أن يكون هذا عنوان الـ API الخاص بك

const AttendancePage = ({ eventId }) => {
    const [absentMembers, setAbsentMembers] = useState([]);
    const [presentMembers, setPresentMembers] = useState([]);
    const [counts, setCounts] = useState({ total: 0, present: 0, absent: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchAttendance = async () => {
        setIsLoading(true);
        // *************************************************************
        // ملاحظة: يجب إرسال الرمز المميز (Token) في رأس الطلب (Headers)
        // *************************************************************
        const token = localStorage.getItem('token'); 
        
        try {
            const { data } = await axios.get(`${API_BASE_URL}/events/${eventId}/attendance`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setAbsentMembers(data.absentMembers.map(item => ({
                ...item.memberId,
                attendanceId: item._id,
            })));
            setPresentMembers(data.presentMembers.map(item => ({
                ...item.memberId,
                attendanceId: item._id,
            })));
            setCounts({ total: data.total, present: data.presentCount, absent: data.absentCount });
        } catch (error) {
            console.error("Error fetching attendance:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [eventId]);

    // *************************************************************
    // وظيفة تسجيل الحضور/الغياب (الضغط على السهم)
    // *************************************************************
    const handleToggleAttendance = async (memberId, currentStatus) => {
        const token = localStorage.getItem('token');

        try {
            // الطلب يرسل دائماً لتسجيل الحضور (الـ Backend يتولى التبديل إذا كان موجوداً)
            await axios.post(`${API_BASE_URL}/events/${eventId}/attend`, 
            { memberId },
            {
                headers: { Authorization: `Bearer ${token}` }
            });

            // تحديث الواجهة بدون إعادة تحميل كاملة للبيانات
            // هذه الآلية أبسط وتؤدي الغرض
            fetchAttendance(); 

        } catch (error) {
            alert('Failed to update attendance.');
            console.error(error);
        }
    };

    // *************************************************************
    // وظيفة البحث
    // *************************************************************
    const handleSearch = (e) => {
        // يمكنك إما تصفية القائمة محلياً (إذا كانت القائمة صغيرة) 
        // أو إرسال طلب للـ API كما هو موضح في الـ Backend
        setSearchTerm(e.target.value);
        // لتبسيط المثال، لن نطبق وظيفة البحث هنا، لكنها ستعتمد على الـ API الذي صممناه
    };
    
    // *************************************************************
    // وظيفة مسح QR Code (مجرد واجهة هنا)
    // *************************************************************
    const handleQrScan = () => {
        alert("فتح الكاميرا لمسح رمز QR");
        // هنا يتم دمج مكتبة قارئ QR مثل react-qr-reader، ثم إرسال البيانات للـ API /scan
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="attendance-container" style={{ direction: 'rtl', padding: '20px' }}>
            <h1 style={{ textAlign: 'center' }}>إدارة الحضور للحدث: {eventId}</h1>
            
            {/* الأقسام الثلاثة العلوية */}
            <div className="status-bars" style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                <div className="tab" style={{ borderBottom: '3px solid blue', padding: '5px' }}>
                    **الكل** ({counts.total})
                </div>
                <div className="tab" style={{ borderBottom: counts.absent > 0 ? '3px solid red' : 'none', padding: '5px' }}>
                    **الغائبون** ({counts.absent})
                </div>
                <div className="tab" style={{ borderBottom: counts.present > 0 ? '3px solid green' : 'none', padding: '5px' }}>
                    **الحاضرون** ({counts.present})
                </div>
            </div>

            {/* شريط الأدوات (بحث، QR، إضافة) */}
            <div className="toolbar" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <div className="search-bar" style={{ flexGrow: 1, display: 'flex', alignItems: 'center', border: '1px solid #ccc', padding: '5px', borderRadius: '4px' }}>
                    <FaSearch style={{ marginLeft: '10px' }} />
                    <input
                        type="text"
                        placeholder="ابحث بالاسم أو رقم الهاتف..."
                        value={searchTerm}
                        onChange={handleSearch}
                        style={{ border: 'none', outline: 'none', width: '100%', padding: '5px' }}
                    />
                </div>
                <button onClick={handleQrScan} style={{ background: 'darkblue', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}>
                    <FaQrcode /> QR Scan
                </button>
                <button style={{ background: 'green', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}>
                    <FaUserPlus /> إضافة شخص جديد
                </button>
            </div>

            {/* تقسيم القائمة بين الغائبين والحاضرين */}
            <div className="lists-container" style={{ display: 'flex', gap: '20px' }}>
                
                {/* قائمة الغائبين */}
                <div className="absent-list" style={{ flex: 1, border: '1px solid #f00', padding: '10px', borderRadius: '8px' }}>
                    <h3>الغائبون ({absentMembers.length})</h3>
                    {absentMembers.map(member => (
                        <div key={member._id} className="member-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', padding: '10px 0' }}>
                            <div style={{ fontWeight: 'bold' }}>{member.name}</div>
                            <button onClick={() => handleToggleAttendance(member._id, 'Absent')} style={{ background: 'none', border: '1px solid green', color: 'green', padding: '5px', cursor: 'pointer', borderRadius: '50%' }}>
                                <FaArrowLeft /> {/* السهم الذي ينقله للحاضرين */}
                            </button>
                        </div>
                    ))}
                </div>

                {/* قائمة الحاضرين */}
                <div className="present-list" style={{ flex: 1, border: '1px solid #0f0', padding: '10px', borderRadius: '8px' }}>
                    <h3>الحاضرون ({presentMembers.length})</h3>
                    {presentMembers.map(member => (
                        <div key={member._id} className="member-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', padding: '10px 0' }}>
                            <button onClick={() => handleToggleAttendance(member._id, 'Present')} style={{ background: 'none', border: '1px solid red', color: 'red', padding: '5px', cursor: 'pointer', borderRadius: '50%' }}>
                                <FaArrowRight /> {/* السهم الذي يعيده للغائبين (لإلغاء الحضور) */}
                            </button>
                            <div style={{ fontWeight: 'bold', color: 'green' }}>{member.name}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AttendancePage;