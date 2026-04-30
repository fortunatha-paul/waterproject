import React from 'react';

const STAGES = ['Submitted', 'Reviewed', 'Assigned', 'In Progress', 'Completed'];

export default function ProgressBar({ currentStage }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%', margin: '24px 0' }}>
      {STAGES.map((stage, i) => {
        const isCompleted = i <= currentStage;
        const isCurrent = i === currentStage;
        return (
          <React.Fragment key={stage}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: isCompleted ? '#3B82F6' : '#E5E7EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isCompleted ? '#fff' : '#9CA3AF',
                fontSize: 14, fontWeight: 700,
                border: isCurrent ? '3px solid #1D4ED8' : '3px solid transparent',
                transition: 'all 0.3s',
              }}>
                {isCompleted && i < currentStage ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: 11, marginTop: 6,
                color: isCompleted ? '#1E40AF' : '#9CA3AF',
                fontWeight: isCurrent ? 700 : 400,
                textAlign: 'center',
              }}>
                {stage}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div style={{
                height: 3, flex: 1,
                background: i < currentStage ? '#3B82F6' : '#E5E7EB',
                borderRadius: 2, margin: '0 -4px', marginBottom: 20,
                transition: 'background 0.3s',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
