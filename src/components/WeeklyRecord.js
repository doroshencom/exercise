
import React from 'react';

const WeeklyRecord = ({ record, onBack }) => {
  return (
    <div className="weekly-record">
      <h2>Registro Semanal</h2>
      <ul>
        {record.map((workout, index) => (
          <li key={index}>{workout} - Completado</li>
        ))}
      </ul>
      <button onClick={onBack}>Volver</button>
    </div>
  );
};

export default WeeklyRecord;
