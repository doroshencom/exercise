import React, { useState, useEffect, useRef } from 'react';
import playIcon from '../assets/btn/play.svg'; // Importa el SVG del botón play
import pauseIcon from '../assets/btn/pause.svg'; // Importa el SVG del botón pausa
import resetIcon from '../assets/btn/reset.svg'; // Importa el SVG del botón reset

const WorkoutModal = ({ exercise, onClose, onComplete, isExtra }) => {
  const [weights, setWeights] = useState(Array(4).fill(''));  // Cada ejercicio puede tener hasta 4 series
  const [time, setTime] = useState(0);  // Tiempo total en milisegundos
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  // Función para cargar las imágenes dinámicamente
  const getExerciseImage = (exerciseName) => {
    try {
      return require(`../assets/images/${exerciseName.toLowerCase().replace(/\s+/g, '_')}.png`);
    } catch (error) {
      console.error(`Imagen no encontrada para el ejercicio: ${exerciseName}`);
      return require('../assets/images/default.png');  // Imagen por defecto si no se encuentra la del ejercicio
    }
  };

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
    const maxWeight = Math.max(...weights.map(w => parseFloat(w) || 0));
    const series = 4; // Ajustar según el ejercicio
    const repeticiones = 12; // Ajustar según el ejercicio

    onComplete({
      ...exercise,
      peso: maxWeight,
      series: series,
      repeticiones: repeticiones,
      timeSpent: time,
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
          <h3 className="exercise-title">{exercise.name}</h3>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>
        <div className="modal-body">
          <div className="exercise-image-container">
            <div className="exercise-image">
              <img src={getExerciseImage(exercise.name)} alt={exercise.name} />
            </div>
            <div className="pill-container">
              <span className="pill">4 series</span>
              <span className="pill">12 reps</span>
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
          <div className="time-and-complete">
            <p className="timer-display">{formatTime(time)}</p>
            <button className="complete-button" onClick={handleComplete}>Terminar</button>
          </div>
          <div className="control-buttons">
            <button onClick={resetTimer}>
              <img src={resetIcon} alt="Reset Timer" />
            </button>
            <button onClick={pauseTimer}>
              <img src={pauseIcon} alt="Pause Timer" />
            </button>
            <button onClick={startTimer}>
              <img src={playIcon} alt="Start Timer" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutModal;
