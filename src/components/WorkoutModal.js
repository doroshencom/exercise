import React, { useState, useEffect } from 'react';

const WorkoutModal = ({ exercise, onClose, onComplete, isExtra }) => {
  const [weights, setWeights] = useState(Array(4).fill(''));
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const handleWeightChange = (index, value) => {
    const newWeights = [...weights];
    newWeights[index] = value;
    setWeights(newWeights);
  };

  const startTimer = () => setTimerActive(true);
  const pauseTimer = () => setTimerActive(false);
  const resetTimer = () => {
    setTimerActive(false);
    setTime(0);
  };

  const handleComplete = () => {
    onComplete(exercise, time); // Sumamos el tiempo del ejercicio
    resetTimer();
    onClose(); // Cerrar el modal
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{exercise}</h3>
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
            <p>{new Date(time * 1000).toISOString().substr(11, 8)}</p>
            <button onClick={startTimer}>Empezar</button>
            <button onClick={pauseTimer}>⏸</button>
          </div>
          <button className="complete-btn" onClick={handleComplete}>Terminar</button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutModal;
