import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import AdminNavbar from '../../components/admin/AdminNavbar';
import '../../styles/admin/homepage.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface StudentResult {
    _id: string;
    teacherId: string;
    courseId: string;
    co_no: string;
    assessmentType: string;
    passMark: number;
    po_no: string;
    session: string;
    obtainedMark: number | string;
    studentName: string;
}

interface CourseObjective {
    bloomsTaxonomy?: string[];
    fundamentalProfile?: string[];
    socialProfile?: string[];
    thinkingProfile?: string[];
    personalProfile?: string[];
}

interface ProfileAchievement {
    bloomsTotal: number;
    bloomsAchieved: number;
    fundamentalTotal: number;
    fundamentalAchieved: number;
    socialTotal: number;
    socialAchieved: number;
    thinkingTotal: number;
    thinkingAchieved: number;
    personalTotal: number;
    personalAchieved: number;
}

const StudentInfoPage = () => {
    const [studentId, setStudentId] = useState('');
    const [studentData, setStudentData] = useState<StudentResult[]>([]);
    const [studentName, setStudentName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [profileAchievement, setProfileAchievement] = useState<ProfileAchievement | null>(null);
    const chartRef = useRef<ChartJS<"bar">>(null);

    useEffect(() => {
        document.body.classList.add('admin-homepage');
        return () => {
            document.body.classList.remove('admin-homepage');
        }
    }, []);

    const calculateProfileAchievement = async (results: StudentResult[]) => {
        const achievement: ProfileAchievement = {
            bloomsTotal: 0,
            bloomsAchieved: 0,
            fundamentalTotal: 0,
            fundamentalAchieved: 0,
            socialTotal: 0,
            socialAchieved: 0,
            thinkingTotal: 0,
            thinkingAchieved: 0,
            personalTotal: 0,
            personalAchieved: 0,
        };

        // Group by courseId and session to fetch objectives
        const courseGroups = results.reduce((acc, result) => {
            const key = `${result.courseId}-${result.session}-${result.teacherId}`;
            if (!acc[key]) {
                acc[key] = { courseId: result.courseId, session: result.session, teacherId: result.teacherId, results: [] };
            }
            acc[key].results.push(result);
            return acc;
        }, {} as Record<string, { courseId: string; session: string; teacherId: string; results: StudentResult[] }>);

        // Fetch objectives for each course
        for (const group of Object.values(courseGroups)) {
            try {
                const res = await fetch(
                    `/api/getCourseObjectives?teacherId=${group.teacherId}&courseId=${group.courseId}&session=${group.session}`
                );
                if (res.ok) {
                    const objectives: CourseObjective[] = await res.json();
                    
                    // Match each result with its objective
                    for (const result of group.results) {
                        const coIndex = parseInt(result.co_no.replace('CO', '')) - 1;
                        const objective = objectives[coIndex];
                        
                        if (objective) {
                            const passed = typeof result.obtainedMark === 'number' && result.obtainedMark >= result.passMark;
                            
                            // Count Bloom's
                            if (objective.bloomsTaxonomy && objective.bloomsTaxonomy.length > 0) {
                                achievement.bloomsTotal += objective.bloomsTaxonomy.length;
                                if (passed) achievement.bloomsAchieved += objective.bloomsTaxonomy.length;
                            }
                            
                            // Count Fundamental
                            if (objective.fundamentalProfile && objective.fundamentalProfile.length > 0) {
                                achievement.fundamentalTotal += objective.fundamentalProfile.length;
                                if (passed) achievement.fundamentalAchieved += objective.fundamentalProfile.length;
                            }
                            
                            // Count Social
                            if (objective.socialProfile && objective.socialProfile.length > 0) {
                                achievement.socialTotal += objective.socialProfile.length;
                                if (passed) achievement.socialAchieved += objective.socialProfile.length;
                            }
                            
                            // Count Thinking
                            if (objective.thinkingProfile && objective.thinkingProfile.length > 0) {
                                achievement.thinkingTotal += objective.thinkingProfile.length;
                                if (passed) achievement.thinkingAchieved += objective.thinkingProfile.length;
                            }
                            
                            // Count Personal
                            if (objective.personalProfile && objective.personalProfile.length > 0) {
                                achievement.personalTotal += objective.personalProfile.length;
                                if (passed) achievement.personalAchieved += objective.personalProfile.length;
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching objectives:', err);
            }
        }

        return achievement;
    };

    const handleFetchData = async () => {
        if (!studentId) {
            setError('Please enter a Student ID.');
            return;
        }
        setLoading(true);
        setError('');
        setStudentData([]);
        setStudentName('');
        setProfileAchievement(null);

        try {
            const res = await fetch(`/api/admin/student?studentId=${studentId}`, { cache: 'no-store' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to fetch student data');
            }
            const data: StudentResult[] = await res.json();
            setStudentData(data);
            if (data.length > 0) {
                setStudentName(data[0].studentName);
                // Calculate profile achievements
                const achievements = await calculateProfileAchievement(data);
                setProfileAchievement(achievements);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePdf = () => {
        if (studentData.length === 0 || !studentId) return;
    
        const doc = new jsPDF({ orientation: 'landscape' });
    
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Student Assessment Report', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Student: ${studentName} (${studentId})`, 14, 35);
    
        const generationDate = new Date().toLocaleString();
        doc.text(`Generated on: ${generationDate}`, doc.internal.pageSize.getWidth() - 14, 35, { align: 'right' });
    
        const groupedData = studentData.reduce((acc, entry) => {
            if (!acc[entry.courseId]) {
                acc[entry.courseId] = [];
            }
            acc[entry.courseId].push(entry);
            return acc;
        }, {} as Record<string, StudentResult[]>);
    
        let startY = 45;
    
        Object.keys(groupedData).sort().forEach(courseId => {
            const courseEntries = groupedData[courseId];
            
            if (startY > 45) {
                startY += 8;
            }
            
            const tableHeight = 15 + courseEntries.length * 8; 
            if (startY + tableHeight > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                startY = 20;
            }

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(courseId, 14, startY);
    
            const tableBody = courseEntries.map(entry => {
                const verdict = typeof entry.obtainedMark === 'number'
                    ? (entry.obtainedMark >= entry.passMark ? 'Pass' : 'Fail')
                    : 'Absent';
                return [
                    entry.co_no,
                    entry.assessmentType,
                    entry.session,
                    entry.teacherId,
                    entry.po_no,
                    entry.passMark.toString(),
                    String(entry.obtainedMark),
                    verdict,
                ];
            });
    
            autoTable(doc, {
                startY: startY + 5,
                head: [['CO', 'Assessment', 'Session', 'Teacher', 'PO', 'Pass Mark', 'Obtained', 'Verdict']],
                body: tableBody,
                theme: 'grid',
                headStyles: { fillColor: [39, 174, 96] },
                styles: { fontSize: 9, cellPadding: 2 },
                didDrawPage: (data) => {
                    if (data.pageNumber > 1) {
                        doc.setFontSize(12);
                        doc.setFont('helvetica', 'bold');
                        doc.text('Student Assessment Report (Continued)', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
                    }
                }
            });
    
            startY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
        });
    
        doc.save(`student-report-${studentId}-${new Date().toISOString().slice(0,10)}.pdf`);
    };

    return (
        <>
            <Head>
                <title>Student Information - BICE Course Outcome</title>
            </Head>
            <AdminNavbar page="student" />
            <div className="admin-container">
                <main>
                    <div className="card">
                        <div className="select-group">
                            <label htmlFor="student-id-input" className="select-label">Enter Student ID</label>
                            <div className="input-with-btn">
                            <input
                                type="text"
                                id="student-id-input"
                                    className="search-input"
                                value={studentId}
                                onChange={e => setStudentId(e.target.value)}
                                placeholder="e.g., 2254901027"
                            />
                                <button onClick={handleFetchData} className="btn-inside" disabled={loading}>
                                    {loading ? 'Loading...' : 'Get Data'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && <p className="message error-message">{error}</p>}
                    
                    {studentData.length > 0 && (
                        <>
                            <div className="results-header">
                                <div>
                                    <h2 className="po-title">Showing results for: {studentName} ({studentId})</h2>
                                    <p className="po-name">Found {studentData.length} assessment records.</p>
                                </div>
                                <button onClick={handleGeneratePdf} className="btn-primary" disabled={loading}>
                                    Generate PDF
                                </button>
                            </div>

                            {profileAchievement && (
                                <div className="card" style={{ marginBottom: '1.5rem' }}>
                                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                                        Profile Achievement Overview
                                    </h3>
                                    <div style={{ height: '300px' }}>
                                        <Bar
                                            ref={chartRef}
                                            data={{
                                                labels: ["Bloom's", 'Fundamental', 'Social', 'Thinking', 'Personal'],
                                                datasets: [
                                                    {
                                                        label: 'Achieved',
                                                        data: [
                                                            profileAchievement.bloomsTotal > 0 
                                                                ? (profileAchievement.bloomsAchieved / profileAchievement.bloomsTotal) * 100 
                                                                : 0,
                                                            profileAchievement.fundamentalTotal > 0 
                                                                ? (profileAchievement.fundamentalAchieved / profileAchievement.fundamentalTotal) * 100 
                                                                : 0,
                                                            profileAchievement.socialTotal > 0 
                                                                ? (profileAchievement.socialAchieved / profileAchievement.socialTotal) * 100 
                                                                : 0,
                                                            profileAchievement.thinkingTotal > 0 
                                                                ? (profileAchievement.thinkingAchieved / profileAchievement.thinkingTotal) * 100 
                                                                : 0,
                                                            profileAchievement.personalTotal > 0 
                                                                ? (profileAchievement.personalAchieved / profileAchievement.personalTotal) * 100 
                                                                : 0,
                                                        ],
                                                        backgroundColor: [
                                                            'rgba(59, 130, 246, 0.8)',
                                                            'rgba(16, 185, 129, 0.8)',
                                                            'rgba(245, 158, 11, 0.8)',
                                                            'rgba(139, 92, 246, 0.8)',
                                                            'rgba(236, 72, 153, 0.8)',
                                                        ],
                                                        borderColor: [
                                                            'rgb(59, 130, 246)',
                                                            'rgb(16, 185, 129)',
                                                            'rgb(245, 158, 11)',
                                                            'rgb(139, 92, 246)',
                                                            'rgb(236, 72, 153)',
                                                        ],
                                                        borderWidth: 2,
                                                    },
                                                ],
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        max: 100,
                                                        ticks: {
                                                            callback: (value) => `${value}%`,
                                                        },
                                                    },
                                                },
                                                plugins: {
                                                    legend: {
                                                        display: false,
                                                    },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: (context) => {
                                                                const profileNames = ["Bloom's", 'Fundamental', 'Social', 'Thinking', 'Personal'];
                                                                const index = context.dataIndex;
                                                                const totals = [
                                                                    profileAchievement.bloomsTotal,
                                                                    profileAchievement.fundamentalTotal,
                                                                    profileAchievement.socialTotal,
                                                                    profileAchievement.thinkingTotal,
                                                                    profileAchievement.personalTotal,
                                                                ];
                                                                const achieved = [
                                                                    profileAchievement.bloomsAchieved,
                                                                    profileAchievement.fundamentalAchieved,
                                                                    profileAchievement.socialAchieved,
                                                                    profileAchievement.thinkingAchieved,
                                                                    profileAchievement.personalAchieved,
                                                                ];
                                                                return `${profileNames[index]}: ${achieved[index]}/${totals[index]} (${context.parsed.y.toFixed(1)}%)`;
                                                            },
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                    <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', fontSize: '0.875rem' }}>
                                        <div style={{ padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
                                            <strong>Bloom's:</strong> {profileAchievement.bloomsAchieved}/{profileAchievement.bloomsTotal}
                                        </div>
                                        <div style={{ padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
                                            <strong>Fundamental:</strong> {profileAchievement.fundamentalAchieved}/{profileAchievement.fundamentalTotal}
                                        </div>
                                        <div style={{ padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
                                            <strong>Social:</strong> {profileAchievement.socialAchieved}/{profileAchievement.socialTotal}
                                        </div>
                                        <div style={{ padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
                                            <strong>Thinking:</strong> {profileAchievement.thinkingAchieved}/{profileAchievement.thinkingTotal}
                                        </div>
                                        <div style={{ padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
                                            <strong>Personal:</strong> {profileAchievement.personalAchieved}/{profileAchievement.personalTotal}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {loading && <p className="message">Loading data...</p>}

                    {!loading && studentData.length > 0 && (
                         <div className="results-grid">
                            {studentData.map(entry => (
                                <div key={entry._id} className="result-card">
                                    <div className="card-header">
                                        <h3 className="course-id">{entry.courseId} - {entry.co_no}</h3>
                                        <div className="card-details">
                                            <span className="detail-pill">Teacher: <strong>{entry.teacherId}</strong></span>
                                            <span className="detail-pill">Assessment: <strong>{entry.assessmentType}</strong></span>
                                            <span className="detail-pill">Session: <strong>{entry.session}</strong></span>
                                            <span className="detail-pill">PO: <strong>{entry.po_no}</strong></span>
                                        </div>
                                    </div>
                                    <div className="student-result-details">
                                        <p>Mark Obtained: 
                                            <strong className={`score-badge ${
                                                typeof entry.obtainedMark === 'number' 
                                                    ? (entry.obtainedMark >= entry.passMark ? 'score-pass' : 'score-fail')
                                                    : 'score-absent'
                                            }`}>
                                                {String(entry.obtainedMark)}
                                            </strong>
                                        </p>
                                        <p>Pass Mark: <strong>{entry.passMark}</strong></p>
                                        <p>Verdict: 
                                            <strong className={
                                                typeof entry.obtainedMark === 'number' 
                                                    ? (entry.obtainedMark >= entry.passMark ? 'text-green-600' : 'text-red-600')
                                                    : 'text-gray-500'
                                            }>
                                                {typeof entry.obtainedMark === 'number' 
                                                    ? (entry.obtainedMark >= entry.passMark ? 'Pass' : 'Fail')
                                                    : 'Absent'
                                                }
                                            </strong>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && studentData.length === 0 && !error && studentId.length > 0 && (
                         <div className="card message">
                            <p>No data found for the student ID: {studentId}</p>
                        </div>
                    )}

                    {!loading && studentData.length === 0 && !error && studentId.length === 0 && (
                        <div className="card message">
                            <p>Enter a student ID to see their assessment results.</p>
                        </div>
                    )}
                </main>
            </div>
            <style jsx>{`
                .input-with-btn {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .search-input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    font-size: 1rem;
                    box-sizing: border-box;
                    padding-right: 120px;
                }
                .search-input:focus {
                    outline: none;
                    border-color: #10b981;
                    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
                }
                .btn-inside {
                    position: absolute;
                    right: 5px;
                    top: 50%;
                    transform: translateY(-50%);
                    background-color: #10b981;
                    color: white;
                    border: none;
                    padding: 0.5rem 1.2rem;
                    border-radius: 0.375rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .btn-inside:hover:not(:disabled) {
                    background-color: #059669;
                }
                .btn-inside:disabled {
                    background-color: #6ee7b7;
                    cursor: not-allowed;
                }
                .student-result-details {
                    padding: 15px;
                    border-top: 1px solid #eee;
                }
                .student-result-details p {
                    margin: 0 0 8px 0;
                    display: flex;
                    justify-content: space-between;
                }
                .score-badge {
                    padding: 3px 8px;
                    border-radius: 12px;
                    color: white;
                    font-weight: bold;
                }
                .score-pass {
                    background-color: #28a745;
                }
                .score-fail {
                    background-color: #dc3545;
                }
                .score-absent {
                    background-color: #6c757d;
                }
                .text-green-600 { color: #28a745; }
                .text-red-600 { color: #dc3545; }
                .text-gray-500 { color: #6c757d; }
                .results-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .btn-primary {
                    background-color: #10b981;
                    color: white;
                    border: none;
                    padding: 0.6rem 1.2rem;
                    border-radius: 0.375rem;
                    font-weight: 600;
                    cursor: pointer;
                    height: fit-content;
                    transition: background-color 0.2s;
                }
                .btn-primary:hover:not(:disabled) {
                    background-color: #059669;
                }
                .btn-primary:disabled {
                    background-color: #d1d5db;
                    cursor: not-allowed;
                }
            `}</style>
        </>
    );
};

export default StudentInfoPage; 