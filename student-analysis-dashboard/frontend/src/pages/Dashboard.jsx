import React, { useState, useEffect } from 'react';
import {
  getDepartments, getDashboardSummary, getSemesterTrends, getSubjectAnalytics,
  getTopPerformers, getClassDivision, getGradeDistribution,
  getBatchComparison, getAtRiskStudents
} from '../services/api';
import {
  TrendingUp, AlertTriangle, GraduationCap, Users, UserCheck,
  BookOpen, Trophy, Medal, Award, ShieldAlert, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import ChartContainer from '../components/charts/ChartContainer';
import AreaChartComponent from '../components/charts/AreaChartComponent';
import BarChartComponent from '../components/charts/BarChartComponent';
import PieChartComponent from '../components/charts/PieChartComponent';
import RadarChartComponent from '../components/charts/RadarChartComponent';
import StackedBarChartComponent from '../components/charts/StackedBarChartComponent';

const Dashboard = () => {
  const [department, setDepartment] = useState('All');
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [semester, setSemester] = useState('All');
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [classDivision, setClassDivision] = useState([]);
  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [batchComparison, setBatchComparison] = useState([]);
  const [atRisk, setAtRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { 
    const loadDepts = async () => {
      try {
        const depts = await getDepartments();
        setAvailableDepartments(depts);
      } catch (e) {
        console.error("Error fetching departments", e);
      }
    };
    loadDepts();
  }, []);

  useEffect(() => { fetchData(); }, [department, semester]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumData, trendData, subData, topData, divData, gradeData, batchData, riskData] = await Promise.all([
        getDashboardSummary(department, semester),
        getSemesterTrends(department),
        getSubjectAnalytics(department, semester),
        getTopPerformers(department, semester, 5),
        getClassDivision(department, semester),
        getGradeDistribution(department, semester),
        getBatchComparison(department),
        getAtRiskStudents(department, semester)
      ]);
      setSummary(sumData);
      setTrends(trendData);
      setSubjects(subData.sort((a, b) => b.failCount - a.failCount).slice(0, 5));
      setTopPerformers(topData);
      setClassDivision(divData);
      setGradeDistribution(gradeData);
      setBatchComparison(batchData);
      setAtRisk(riskData);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    }
    setLoading(false);
  };

  if (loading || !summary) {
    return <div className="loading-spinner">Loading Analytics...</div>;
  }

  const rankIcons = [
    <Trophy key="1" size={18} color="#f59e0b" />,
    <Medal key="2" size={18} color="#94a3b8" />,
    <Award key="3" size={18} color="#b45309" />,
    <span key="4" style={{ fontWeight: 700, color: '#64748b' }}>4</span>,
    <span key="5" style={{ fontWeight: 700, color: '#64748b' }}>5</span>
  ];

  // Prepare radar data from subjects
  const radarData = subjects.map(s => ({
    subject: s.subject,
    average: s.average,
    fullMark: 100
  }));

  return (
    <div>
      {/* Filters */}
      <div className="semester-filters" style={{ display: 'flex', gap: '1rem' }}>
        <div className="semester-selector">
          <select value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="All">All Departments</option>
            {availableDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        <div className="semester-selector">
          <select value={semester} onChange={(e) => setSemester(e.target.value)}>
            <option value="All">All Semesters</option>
            <option value="I">Semester I</option>
            <option value="III">Semester III</option>
            <option value="V">Semester V</option>
            <option value="VII">Semester VII</option>
          </select>
        </div>
      </div>

      {/* ── ROW 1: KPI Cards ── */}
      <div className="cards-grid">
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="kpi-title">Total Students</span>
            <div className="kpi-icon blue"><Users size={20} /></div>
          </div>
          <span className="kpi-value">{summary.totalStudents}</span>
        </div>
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="kpi-title">Overall Pass Percentage</span>
            <div className="kpi-icon green"><TrendingUp size={20} /></div>
          </div>
          <span className="kpi-value green">{summary.passPercentage}%</span>
          <span className="kpi-trend up">↑ vs Last Semester</span>
        </div>
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="kpi-title">Total At-Risk Students</span>
            <div className="kpi-icon red"><AlertTriangle size={20} /></div>
          </div>
          <span className="kpi-value red">{atRisk ? atRisk.totalAtRisk : 0}</span>
          <span className="kpi-trend down">
            {atRisk ? `${atRisk.highRiskCount} Critical · ${atRisk.moderateRiskCount} Warning` : ''}
          </span>
        </div>
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="kpi-title">Average Departmental SGPA</span>
            <div className="kpi-icon blue"><GraduationCap size={20} /></div>
          </div>
          <span className="kpi-value">{summary.averageGpa}</span>
          <span className="kpi-trend up">Highest: {summary.highestGpa} · Lowest: {summary.lowestGpa}</span>
        </div>
      </div>

      {/* ── ROW 2: SGPA Trend + Top Performers ── */}
      <div className="charts-grid-2-1">
        <ChartContainer
          title="SGPA Trend (Department Average)"
          subtitle="Semester-by-semester GPA trajectory"
          badge="Academic Performance"
          height={320}
        >
          <AreaChartComponent
            data={trends}
            xField="semester"
            yField="averageGpa"
            height={260}
            domain={[0, 10]}
            color="#2563eb"
          />
        </ChartContainer>

        <div className="chart-card" style={{ minHeight: 'auto' }}>
          <div className="chart-card-header">
            <h3 className="chart-header" style={{ marginBottom: 0 }}>🏆 Top Performers</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {topPerformers.map((s, i) => (
              <div key={i} className="leaderboard-item" onClick={() => navigate(`/student/${s.registerNumber}`)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className={`rank-badge rank-${i + 1}`}>{rankIcons[i]}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.registerNumber}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: '#2563eb', fontSize: '1.125rem' }}>{s.gpa}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 3: Grade Distribution + Class Division + Radar ── */}
      <div className="charts-grid-3">
        <ChartContainer
          title="Grade Distribution"
          subtitle="Cohort grade breakdown across courses"
          badge="Grades"
          height={340}
        >
          <BarChartComponent
            data={gradeDistribution}
            xField="grade"
            yField="percentage"
            height={270}
            unit="%"
          />
        </ChartContainer>

        <ChartContainer
          title="Class Division Breakdown"
          subtitle="Standing classification across cohort"
          badge="Divisions"
          height={340}
        >
          <PieChartComponent
            data={classDivision}
            xField="name"
            yField="value"
            isDoughnut={true}
            height={270}
            centerLabel="Students"
          />
        </ChartContainer>

        <ChartContainer
          title="Subject Difficulty Radar"
          subtitle="Average marks across top challenging courses"
          badge="Mean Score"
          height={340}
        >
          <RadarChartComponent
            data={radarData}
            xField="subject"
            yField="average"
            height={270}
            maxDomain={100}
          />
        </ChartContainer>
      </div>

      {/* ── ROW 4: Batch Comparison + At-Risk Courses ── */}
      <div className="charts-grid-3-2">
        <ChartContainer
          title="Grade Distribution by Batch (Semester)"
          subtitle="Relative grade comparison by academic semester"
          badge="Batch Trends"
          height={340}
        >
          <StackedBarChartComponent
            data={batchComparison}
            xField="semester"
            series={['S', 'A+', 'A', 'B+', 'B', 'C', 'U']}
            layout="vertical"
            height={270}
            unit="%"
          />
        </ChartContainer>

        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-header" style={{ marginBottom: 0 }}>Top At-Risk Courses</h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Fail %</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '0.5rem' }}>
            {subjects.map((sub, index) => {
              const total = sub.passCount + sub.failCount;
              const failPercent = total > 0 ? Math.round((sub.failCount / total) * 100) : 0;
              const barColors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6'];
              return (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '120px', fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.subject}</div>
                  <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${failPercent}%`, height: '100%', background: barColors[index % barColors.length], borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
                  </div>
                  <div style={{ width: '40px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600 }}>{failPercent}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── ROW 5: At-Risk Students Table ── */}
      {atRisk && atRisk.totalAtRisk > 0 && (
        <div className="chart-card" style={{ minHeight: 'auto', marginBottom: '2rem' }}>
          <div className="chart-card-header" style={{ marginBottom: '1rem' }}>
            <h3 className="chart-header" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} color="#ef4444" /> At-Risk Students
            </h3>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
                Critical: {atRisk.highRiskCount}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
                Warning: {atRisk.moderateRiskCount}
              </span>
            </div>
          </div>
          <div className="table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Register Number</th>
                  <th>Name</th>
                  <th>Semester</th>
                  <th>GPA</th>
                  <th>Arrears</th>
                  <th>Risk Level</th>
                  <th>Reason</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {[...atRisk.highRisk, ...atRisk.moderateRisk].slice(0, 10).map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: '#2563eb' }}>{s.registerNumber}</td>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td>{s.semester}</td>
                    <td style={{ fontWeight: 600 }}>{s.gpa}</td>
                    <td>{s.failCount}</td>
                    <td>
                      <span className={`badge ${s.riskLevel === 'critical' ? 'fail' : 'warning'}`}>
                        {s.riskLevel === 'critical' ? '🔴 Critical' : '🟡 Warning'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '200px' }}>{s.reason}</td>
                    <td>
                      <button className="icon-btn" onClick={() => navigate(`/student/${s.registerNumber}`)}>
                        <ArrowRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ROW 6: Performance Summary + Quick Stats ── */}
      <div className="charts-grid-2">
        <div className="chart-card" style={{ minHeight: 'auto' }}>
          <h3 className="chart-header">Performance Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: <Users size={18} color="#64748b" />, label: 'Total Students', value: summary.totalStudents },
              { icon: <UserCheck size={18} color="#10b981" />, label: 'Students Passed', value: summary.passCount },
              { icon: <AlertTriangle size={18} color="#ef4444" />, label: 'Students Failed', value: summary.failCount },
              { icon: <BookOpen size={18} color="#2563eb" />, label: 'Highest GPA', value: summary.highestGpa },
              { icon: <GraduationCap size={18} color="#8b5cf6" />, label: 'Lowest GPA', value: summary.lowestGpa },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: i < 4 ? '1px solid var(--panel-border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {item.icon}
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <ChartContainer
          title="Subject-wise Average Marks"
          subtitle="Cohort mean performance per subject"
          badge="Mean Mark"
          height={340}
        >
          <BarChartComponent
            data={subjects}
            xField="subject"
            yField="average"
            height={270}
            domain={[0, 100]}
            barColor="#2563eb"
          />
        </ChartContainer>
      </div>
    </div>
  );
};

export default Dashboard;
