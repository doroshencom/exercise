import React, { useState, useEffect, useRef } from 'react';
import playIcon from '../assets/btn/play.svg';
import pauseIcon from '../assets/btn/pause.svg';
import resetIcon from '../assets/btn/reset.svg';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';

const WorkoutModal = ({ exercise, onClose, onComplete, isBodyWeight, userId = "user_123" }) => {
  const [weights, setWeights] = useState(Array(exercise.series).fill(''));
  const [extraWeights, setExtraWeights] = useState(Array(exercise.series).fill(''));
  const [bodyWeight, setBodyWeight] = useState(90);  // Peso corporal predeterminado
  const [maxWeight, setMaxWeight] = useState(0);  // Peso máximo para este ejercicio
  const [time, setTime] = useState(0);  // Tiempo total en milisegundos
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchBodyWeight = async () => {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setBodyWeight(userData.bodyWeight || 90);
      }
    };

    const fetchMaxWeight = async () => {
      const docRef = doc(db, "pesosMaximos", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const maxWeights = docSnap.data();
        setMaxWeight(maxWeights[exercise.name] || 0); // Obtener el peso máximo para el ejercicio
      }
    };

    fetchBodyWeight();
    fetchMaxWeight();
  }, [userId, exercise.name]);

  const handleSaveBodyWeight = async () => {
    const docRef = doc(db, "users", userId);
    await setDoc(docRef, { bodyWeight }, { merge: true });
  };

  const updateMaxWeight = async (newMaxWeight) => {
    const docRef = doc(db, "pesosMaximos", userId);
    const docSnap = await getDoc(docRef);

    let maxWeights = {};
    if (docSnap.exists()) {
      maxWeights = docSnap.data();
    }

    if (newMaxWeight > (maxWeights[exercise.name] || 0)) {
      maxWeights[exercise.name] = newMaxWeight; // Actualizar el peso máximo solo si es mayor
      await setDoc(docRef, maxWeights, { merge: true });
      setMaxWeight(newMaxWeight); // Actualizar el estado con el nuevo peso máximo
    }
  };

  const getExerciseImage = (exerciseName) => {
    try {
      // Asegúrate de que las imágenes tengan nombres válidos y estén en la carpeta correcta
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

  const handleExtraWeightChange = (index, value) => {
    const newExtraWeights = [...extraWeights];
    newExtraWeights[index] = value;
    setExtraWeights(newExtraWeights);
  };

  const handleComplete = () => {
    const maxSeriesWeight = Math.max(...weights.map(w => parseFloat(w) || 0));  // Peso máximo en una serie
    const totalWeight = maxSeriesWeight;  // Solo el peso de la serie, sin el peso corporal

    updateMaxWeight(maxSeriesWeight); // Actualizamos el peso máximo si es necesario

    onComplete({
      ...exercise,
      peso: totalWeight,  // Guardamos el peso máximo de la serie
      series: exercise.series,
      repeticiones: exercise.repeticiones,
      timeSpent: time,
    });

    if (isBodyWeight) {
      handleSaveBodyWeight();  // Guardamos el peso corporal si es un ejercicio de peso corporal
    }

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
              <span className="pill">{exercise.series} series</span>
              <span className="pill">{exercise.repeticiones} reps</span>
              <span className="pill">Peso Máximo: {maxWeight} kg</span>  {/* Mostrar el peso máximo actual */}
            </div>
          </div>
          {isBodyWeight && (
            <div className="body-weight-input">
              <label>Peso Corporal</label>
              <input
                type="number"
                value={bodyWeight}
                onChange={(e) => setBodyWeight(e.target.value)}
                placeholder="Introduce tu peso corporal"
              />
            </div>
          )}
          {!isBodyWeight && (
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
          {isBodyWeight && (
            <div className="weights-input">
              {extraWeights.map((extraWeight, index) => (
                <input
                  key={index}
                  type="number"
                  placeholder={`Peso extra serie ${index + 1}`}
                  value={extraWeight}
                  onChange={(e) => handleExtraWeightChange(index, e.target.value)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <div className="time-and-complete">
            <p className="timer-display">{formatTime(time)}</p>
            <button className="complete-button test-complete" onClick={handleComplete}>Terminar</button>
          </div>
          <div className="control-buttons test-buttons">
            <button className="test-reset" onClick={resetTimer}>
              <img src={resetIcon} alt="Reset Timer" />
            </button>
            <button className="test-pause" onClick={pauseTimer}>
              <img src={pauseIcon} alt="Pause Timer" />
            </button>
            <button className="test-play" onClick={startTimer}>
              <img src={playIcon} alt="Start Timer" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutModal;
