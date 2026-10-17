import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

/**
 * Diagnostic Error State for Visualizations
 * Strictly shows real technical error details without replacing with fake charts.
 */
export const ChartErrorState = ({
  error,
  height = 360,
  onRetry = null
}) => {
  const errorObj = typeof error === 'object' && error !== null ? error : { message: String(error) };
  const errMsg = errorObj.message || errorObj.error || String(error);
  const errStage = errorObj.stage || errorObj.errorStage || 'Visualization Engine';
  const errType = errorObj.type || errorObj.errorType || 'render_error';

  let errorTitle = 'Visualization Rendering Issue';
  if (errType === 'configuration_error' || errStage.includes('Configuration')) {
    errorTitle = 'Groq Configuration Error';
  } else if (errType === 'authentication_error' || errMsg.toLowerCase().includes('api key')) {
    errorTitle = 'Groq Authentication Failed';
  } else if (errType === 'rate_limit_error' || errMsg.toLowerCase().includes('rate limit')) {
    errorTitle = 'Groq Rate Limit Exceeded';
  } else if (errType === 'network_error' || errMsg.toLowerCase().includes('network')) {
    errorTitle = 'Network Connection Failed';
  } else if (errType === 'timeout_error' || errMsg.toLowerCase().includes('timed out')) {
    errorTitle = 'Request Timed Out';
  } else if (errType === 'parsing_error' || errStage.includes('Parsing')) {
    errorTitle = 'AI Response Parsing Error';
  } else if (errType === 'validation_error' || errStage.includes('Specification')) {
    errorTitle = 'Specification Validation Error';
  } else if (errType === 'data_retrieval_error' || errStage.includes('Data')) {
    errorTitle = 'Data Retrieval Error';
  }

  return (
    <div
      style={{
        minHeight: height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff1f2',
        borderRadius: '12px',
        border: '1px solid #fecdd3',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(225, 29, 72, 0.05)'
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: '#ffe4e6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          border: '1px solid #fecdd3'
        }}
      >
        <AlertTriangle size={28} color="#e11d48" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <h4 style={{ color: '#9f1239', fontWeight: 700, margin: 0, fontSize: '1.05rem' }}>
          {errorTitle}
        </h4>
        <span
          style={{
            background: '#ffe4e6',
            color: '#be123c',
            border: '1px solid #fecdd3',
            padding: '0.2rem 0.65rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 600
          }}
        >
          Stage: {errStage}
        </span>
      </div>

      <div
        style={{
          background: '#ffffff',
          border: '1px solid #fecdd3',
          borderRadius: '8px',
          padding: '0.85rem 1.25rem',
          color: '#be123c',
          fontSize: '0.825rem',
          maxWidth: 620,
          width: '100%',
          textAlign: 'left',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          lineHeight: 1.5,
          marginTop: '0.75rem',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
        }}
      >
        {errMsg}
      </div>

      <div
        style={{
          marginTop: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#be123c', fontSize: '0.78rem', fontWeight: 500 }}>
          <ShieldAlert size={14} color="#e11d48" />
          <span>Real output requirement active. No fake or mock data was generated.</span>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{
              background: '#be123c',
              color: '#ffffff',
              border: 'none',
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Retry Query
          </button>
        )}
      </div>
    </div>
  );
};

export default ChartErrorState;
