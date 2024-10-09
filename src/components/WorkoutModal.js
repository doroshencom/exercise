import React, { useState, useEffect, useRef } from 'react';

const WorkoutModal = ({ exercise, onClose, onComplete, isExtra }) => {
  const [weights, setWeights] = useState(Array(4).fill(''));  // Cada ejercicio puede tener hasta 4 series
  const [time, setTime] = useState(0);  // Tiempo total en milisegundos
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  const startTimer = () => setTimerActive(true);
  const pauseTimer = () => setTimerActive(false);
  const resetTimer = () => {
    setTimerActive(false);
    setTime(0);
  };

  const handleWeightChange = (index, value) => {
    const newWeights = [...weights];
    newWeights[index] = value;
    setWeights(newWeights);
  };

  const handleComplete = () => {
    // Tomamos el peso máximo introducido en todas las series y lo calculamos
    const maxWeight = Math.max(...weights.map(w => parseFloat(w) || 0));
    
    // Incluimos las series y repeticiones dependiendo del ejercicio
    const series = 4; // Asegúrate de ajustar este valor según el ejercicio
    const repeticiones = 12; // Asegúrate de ajustar este valor según el ejercicio

    onComplete({
      ...exercise, // Incluimos el nombre del ejercicio
      peso: maxWeight, // Peso máximo usado
      series: series, // Series realizadas
      repeticiones: repeticiones, // Repeticiones realizadas
      timeSpent: time, // Tiempo total del ejercicio
    });
    resetTimer();
    onClose();
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = (time % 1000) / 10;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{exercise.name}</h3>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>
        <div className="modal-body">
          <div className="exercise-info">
            <div className="info-series">
              <button className="series-btn">4 series</button>
              <button className="reps-btn">12 reps</button>
            </div>
            <div className="exercise-image">
              <img src="exercise-placeholder.png" alt="Ejercicio" />
            </div>
          </div>
          {!isExtra && (
            <div className="weights-input">
              {weights.map((weight, index) => (
                <input 
                  key={index} 
                  type="number" 
                  placeholder={`Introduce el peso serie ${index + 1}`} 
                  value={weight} 
                  onChange={(e) => handleWeightChange(index, e.target.value)} 
                />
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <div className="timer">
            <p>{formatTime(time)}</p>
            <button onClick={startTimer}>Empezar</button>
            <button onClick={pauseTimer}>⏸</button>
            <button onClick={resetTimer}>🔄</button>
          </div>
          <button className="complete-btn" onClick={handleComplete}>Terminar</button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutModal;
