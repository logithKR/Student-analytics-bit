import React from 'react';
import { X, Download, FileText, RefreshCw } from 'lucide-react';
import ReportComponentItem from './ReportComponentItem';

export const ReportPreviewModal = ({
  isOpen,
  onClose,
  onExportPDF,
  isExporting,
  reportTitle,
  pages = [],
  canvasComponents = [],
  scope = 'student',
  dataset = null
}) => {
  if (!isOpen) return null;

  const studentInfo = dataset?.studentInfo;
  const cohortInfo = dataset?.cohortInfo;

  const entityName = scope === 'student'
    ? `${studentInfo?.name || 'Student'} (${studentInfo?.registerNumber || ''})`
    : `${cohortInfo?.departmentLabel || 'Department'} - Sem ${cohortInfo?.semesterLabel || ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Document Print & PDF Preview</h3>
              <p className="text-xs text-slate-500">
                Official Institutional Academic Evaluation Dossier • {entityName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExportPDF}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Official PDF
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Scroll Canvas (Displays A4 Physical Sheets @ 794px min-height 1123px) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center gap-8 bg-slate-700">
          {pages.map((p) => {
            const isP1 = p.pageNumber === 1;
            const pComps = p.components || [];

            return (
              <div
                key={p.id}
                className="w-full max-w-[794px] bg-white shadow-2xl rounded-sm p-8 sm:p-10 flex flex-col justify-between"
                style={{
                  minHeight: '1123px',
                  boxSizing: 'border-box'
                }}
              >
                {/* ── Top Header Area ── */}
                <div>
                  {isP1 ? (
                    <div className="border-b-2 border-slate-900 pb-4 mb-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                            BANNARI AMMAN INSTITUTE OF TECHNOLOGY
                          </h1>
                          <p className="text-[11px] text-slate-600 font-medium">
                            Autonomous Institution Affiliated to Anna University • Accredited by NAAC with &quot;A+&quot; Grade
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Sathyamangalam, Erode District, Tamil Nadu – 638401
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                            OFFICIAL ACADEMIC DOSSIER
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                            Ref: BIT/ACAD/2026 • {new Date().toLocaleDateString('en-GB')}
                          </span>
                        </div>
                      </div>

                      {/* Student Identity Card */}
                      {scope === 'student' && studentInfo && (
                        <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                              {(studentInfo.name || 'S').charAt(0)}
                            </div>
                            <div>
                              <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                                <span>{studentInfo.name}</span>
                                <span className="text-[11px] font-mono text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded border border-blue-200">
                                  {studentInfo.registerNumber}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Department of {studentInfo.department} • Semester {studentInfo.currentSemester} ({studentInfo.totalSemesters} terms evaluated)
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-4 text-right items-center">
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">CGPA</div>
                              <div className="text-base font-black text-blue-600">
                                {studentInfo.cgpa} <span className="text-xs text-slate-400 font-normal">/ 10</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Arrears</div>
                              <div className={`text-base font-black ${studentInfo.totalArrears > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                {studentInfo.totalArrears}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Standing</div>
                              <span
                                className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded ${
                                  studentInfo.standing?.includes('Green')
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                              >
                                {studentInfo.standing || 'Optimal'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cohort Identity Bar */}
                      {scope === 'cohort' && cohortInfo && (
                        <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                          <div>
                            <div className="font-extrabold text-sm text-slate-900">{cohortInfo.departmentLabel}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Academic Semester: {cohortInfo.semesterLabel} • Cohort Quality Evaluation
                            </div>
                          </div>
                          <div className="flex gap-4 text-right items-center">
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Students</div>
                              <div className="text-base font-black text-blue-600">{cohortInfo.totalStudents}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pass %</div>
                              <div className="text-base font-black text-emerald-600">{cohortInfo.passPercentage}%</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Page 2+ Running Header */
                    <div className="border-b border-slate-300 pb-2.5 mb-5 flex justify-between items-center text-xs text-slate-600">
                      <span className="font-bold uppercase tracking-wider text-slate-800">
                        BANNARI AMMAN INSTITUTE OF TECHNOLOGY • ACADEMIC DOSSIER
                      </span>
                      <span className="text-slate-400 font-medium">
                        {entityName} • Page {p.pageNumber}
                      </span>
                    </div>
                  )}

                  {/* ── Real Visual Report Components Flow (Actual Charts, KPIs & Tables) ── */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      alignContent: 'flex-start',
                      width: '100%'
                    }}
                  >
                    {pComps.length === 0 ? (
                      <div className="w-full p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        No components placed on Page {p.pageNumber}.
                      </div>
                    ) : (
                      pComps.map((comp, idx) => (
                        <ReportComponentItem
                          key={comp.instanceId || idx}
                          component={comp}
                          index={idx}
                          totalCount={pComps.length}
                          currentPageNumber={p.pageNumber}
                          totalPages={pages.length}
                          isSelected={false}
                          isPreview={true}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* ── Page Footer ── */}
                <div className="pt-4 mt-6 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>CONFIDENTIAL & PROPRIETARY • BANNARI AMMAN INSTITUTE OF TECHNOLOGY</span>
                  <span>Page {p.pageNumber} of {pages.length}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-slate-200">
          <span className="text-xs text-slate-500">
            PDF will be generated with high-DPI vector charts, selectable text, and official layout.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Back to Canvas
            </button>
            <button
              type="button"
              onClick={onExportPDF}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Download Official PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPreviewModal;
