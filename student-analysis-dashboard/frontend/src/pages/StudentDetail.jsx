import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentDetails } from '../services/api';
import { exportStudentReportPDF } from '../services/pdfReportService';
import { ArrowLeft, Download, CheckCircle, GraduationCap, AlertTriangle, Lightbulb, BookOpen, Calendar, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

import ChartContainer from '../components/charts/ChartContainer';
import AreaChartComponent from '../components/charts/AreaChartComponent';
import BarChartComponent from '../components/charts/BarChartComponent';
import { getSemanticColor } from '../components/charts/colorSystem';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getStudentDetails(id);
        setStudent(data);
      } catch (error) {
        console.error("Error fetching student details", error);
      }
      setLoading(false);
    };
    fetchDetail();
  }, [id]);

  const handleDownloadReport = async () => {
    if (isExporting || !student) return;
    setIsExporting(true);
    try {
      await exportStudentReportPDF(student);
    } catch (err) {
      console.error('Failed to export student PDF report:', err);
      alert('Unable to generate PDF report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <div className="loading-spinner">Loading Profile...</div>;
  if (!student || student.error || !student.records || student.records.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Student records not found.</div>;
  }

  const gpaData = student.records.map(r => ({
    semester: `Sem ${r.semester}`,
    gpa: r.gpa
  }));

  const latestRecord = student.records[student.records.length - 1];
  const totalArrears = student.records.reduce((sum, r) => sum + (r.failCount || 0), 0);
  const isOptimal = latestRecord.gpa >= 6.0 && (latestRecord.result ? (latestRecord.result.toUpperCase() === 'P' || latestRecord.result.toUpperCase() === 'PASS') : (latestRecord.failCount === 0));

  // Grade distribution across all semesters for this student
  const gradeCount = {};
  student.records.forEach(r => {
    r.subjects.forEach(s => {
      gradeCount[s.grd] = (gradeCount[s.grd] || 0) + 1;
    });
  });
  const gradeData = Object.entries(gradeCount).map(([grade, count]) => ({ grade, count }));

  // Subject performance for the latest semester bar chart
  const latestSubjects = latestRecord.subjects.map(s => ({
    code: s.code,
    total: s.tot,
    color: s.tot >= 50 ? '#2563eb' : '#ef4444'
  }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
          <ArrowLeft size={18} /> Back to Directory
        </button>
        <button 
          onClick={handleDownloadReport}
          disabled={isExporting}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.55rem 1.15rem', 
            background: isExporting ? '#f1f5f9' : '#ffffff', 
            border: '1px solid var(--panel-border)', 
            borderRadius: '8px', 
            cursor: isExporting ? 'not-allowed' : 'pointer', 
            color: isExporting ? '#94a3b8' : '#2563eb', 
            fontWeight: 600, 
            fontSize: '0.875rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease'
          }}
          title="Download full 2-page institutional dossier PDF with graphs and academic ledger"
        >
          {isExporting ? (
            <>
              <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #94a3b8', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Generating PDF Report...
            </>
          ) : (
            <>
              <Download size={16} /> Download Official PDF Report
            </>
          )}
        </button>
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">{student.name.charAt(0)}</div>
        <div className="profile-meta" style={{ flex: 1 }}>
          <h2>{student.name}</h2>
          <p>{student.registerNumber} | B.E. Computer Science and Engineering</p>
        </div>
        <div style={{ display: 'flex', gap: '2.5rem', paddingLeft: '2rem', borderLeft: '1px solid var(--panel-border)' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Current Semester</div>
            <div style={{ fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} color="#64748b" /> Semester {latestRecord.semester}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Semesters</div>
            <div style={{ fontWeight: 600, fontSize: '1rem' }}>{student.records.length}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Arrears</div>
            <div style={{ fontWeight: 600, fontSize: '1rem', color: totalArrears > 0 ? 'var(--danger)' : 'var(--success)' }}>{totalArrears}</div>
          </div>
        </div>
      </div>

      {/* Row 1: GPA Chart + CGPA + Risk */}
      <div className="charts-grid-2-1">
        <ChartContainer
          title="SGPA Progression"
          subtitle="Semester GPA trajectory"
          badge="Actual SGPA"
          height={340}
        >
          <AreaChartComponent
            data={gpaData}
            xField="semester"
            yField="gpa"
            height={230}
            domain={[0, 10]}
            color="#2563eb"
          />
          <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', marginTop: '0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--panel-border)' }}>
            <Lightbulb size={16} color="#2563eb" />
            <span style={{ fontWeight: 600, color: '#0f172a' }}>Insight:</span>
            {isOptimal
              ? ` Student has maintained a consistent performance. Current GPA: ${latestRecord.gpa}`
              : ` Student needs academic support. Current GPA: ${latestRecord.gpa}. ${totalArrears} total arrears across semesters.`
            }
          </div>
        </ChartContainer>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* CGPA Card */}
          <div className="kpi-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <GraduationCap size={28} color="#2563eb" style={{ margin: '0 auto 0.75rem auto' }} />
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>Current CGPA</div>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: '#2563eb', margin: '0.25rem 0' }}>{latestRecord.gpa}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>out of 10.00</div>
          </div>
          
          {/* Risk Card */}
          <div className="kpi-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.75rem' }}>Risk Status Indicator</div>
            <div style={{ 
              background: isOptimal ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              color: isOptimal ? 'var(--success)' : 'var(--danger)',
              padding: '0.875rem', borderRadius: '8px', fontWeight: 700, fontSize: '1.125rem',
              display: 'flex', flexDirection: 'column', gap: '0.375rem', alignItems: 'center'
            }}>
              {isOptimal ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
              {isOptimal ? 'Green (Optimal)' : 'Red (At-Risk)'}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.75rem' }}>
              {isOptimal ? 'No immediate academic risk detected.' : 'Requires immediate attention and counseling.'}
            </div>
          </div>

          {/* Grade Distribution Mini Donut */}
          <div className="kpi-card" style={{ padding: '1.25rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.75rem', textAlign: 'center' }}>Grade Distribution</div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100px', height: '100px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={gradeData} cx="50%" cy="50%" innerRadius={30} outerRadius={45} paddingAngle={2} dataKey="count" stroke="none">
                      {gradeData.map((entry, index) => <Cell key={index} fill={getSemanticColor(entry.grade, index)} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, paddingLeft: '0.75rem', fontSize: '0.7rem' }}>
                {gradeData.map((g, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: getSemanticColor(g.grade, i) }}>● {g.grade}</span>
                    <span style={{ fontWeight: 600 }}>{g.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Latest Semester Subject Marks Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <ChartContainer
          title={`Latest Semester Subject-wise Marks (Semester ${latestRecord.semester})`}
          subtitle="Individual course performance (Pass threshold: 50)"
          badge="Total Marks"
          height={320}
        >
          <BarChartComponent
            data={latestSubjects}
            xField="code"
            yField="total"
            height={250}
            domain={[0, 100]}
          />
        </ChartContainer>
      </div>

      {/* Row 3: Detailed Academic Records */}
      <h2 style={{ marginBottom: '1.25rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <BookOpen size={20} /> Detailed Academic Records
      </h2>
      
      {student.records.map((record, idx) => (
        <div key={idx} className="chart-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '1.5rem', minHeight: 'auto' }}>
          <div style={{ padding: '1.25rem', background: '#f8fafc', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Semester {record.semester}</h3>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>SGPA</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>{record.gpa}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Result</span>
                <div style={{ marginTop: '0.25rem' }}>
                  <span className={`badge ${(record.result || '').toUpperCase() === 'P' || (record.result || '').toUpperCase() === 'PASS' || record.failCount === 0 ? 'pass' : 'fail'}`}>
                    {record.result || (record.failCount === 0 ? 'PASS' : 'FAIL')}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Grade</th>
                  <th>Total Marks</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {record.subjects.map((sub, sIdx) => (
                  <tr key={sIdx}>
                    <td style={{ fontWeight: 600, color: '#2563eb' }}>{sub.code}</td>
                    <td style={{ fontWeight: 500 }}>{sub.title}</td>
                    <td>
                      <span className={`badge ${sub.grd === 'U' || sub.grd === 'RA' ? 'fail' : 'pass'}`}>
                        {sub.grd}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{sub.tot}</td>
                    <td>
                      {(() => {
                        const isSubPass = (sub.res && (sub.res.toUpperCase() === 'P' || sub.res.toUpperCase() === 'PASS')) || (sub.tot >= 50 && sub.grd !== 'U' && sub.grd !== 'RA');
                        return (
                          <span className={`badge ${isSubPass ? 'pass' : 'fail'}`}>
                            {sub.res || (isSubPass ? 'PASS' : 'FAIL')}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentDetail;
