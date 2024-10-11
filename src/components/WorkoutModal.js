import React, { useState, useEffect, useRef } from 'react';
import playIcon from '../assets/btn/play.svg';
import pauseIcon from '../assets/btn/pause.svg';
import resetIcon from '../assets/btn/reset.svg';
import { doc, getDoc, setDoc, collection, addDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';

const WorkoutModal = ({ exercise, onClose, onComplete, isBodyWeight, userId = "user_123", workoutGroup }) => {
  const [weights, setWeights] = useState(Array(exercise.series).fill(''));
  const [bodyWeight, setBodyWeight] = useState(90);  
  const [maxWeight, setMaxWeight] = useState(0);  
  const [time, setTime] = useState(0);  
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
        setMaxWeight(maxWeights[exercise.name] || 0); 
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
      maxWeights[exercise.name] = newMaxWeight;
      await setDoc(docRef, maxWeights, { merge: true });
      setMaxWeight(newMaxWeight);  
    }
  };

  const handleComplete = async () => {
    const maxSeriesWeight = Math.max(...weights.map(w => parseFloat(w) || 0));  
    const totalWeight = maxSeriesWeight;

    await updateMaxWeight(maxSeriesWeight);

    const newTraining = {
      nombre: exercise.name,
      series: exercise.series,
      repeticiones: exercise.repeticiones,
      peso: totalWeight,
      timeSpent: time,
      fecha: new Date().toISOString(),  
      grupoMuscular: workoutGroup  // Aseguramos que el grupo muscular se guarde correctamente
    };

    try {
      const docRef = collection(db, "entrenamientos");
      await addDoc(docRef, {
        fecha: new Date().toISOString(),
        grupoMuscular: workoutGroup,
        ejercicios: [newTraining],  // Guardamos como parte de un array de ejercicios
        tiempoTotal: time
      });

      const today = new Date().toLocaleDateString();
      const daysRef = doc(db, "diasEntrenados", userId);
      const daysSnap = await getDoc(daysRef);

      if (daysSnap.exists()) {
        const daysData = daysSnap.data();
        if (!daysData.days.includes(today)) {
          await setDoc(daysRef, { days: [...daysData.days, today] }, { merge: true });
        }
      } else {
        await setDoc(daysRef, { days: [today] });
      }
    } catch (error) {
      console.error("Error al guardar el entrenamiento:", error);
    }

    if (isBodyWeight) {
      await handleSaveBodyWeight();
    }

    resetTimer();
    onClose();
  };

  const getExerciseImage = (exerciseName) => {
    try {
      return require(`../assets/images/${exerciseName.toLowerCase().replace(/\s+/g, '_')}.png`);
    } catch (error) {
      console.error(`Imagen no encontrada para el ejercicio: ${exerciseName}`);
      return require('../assets/images/default.png');
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
              <span className="pill">Peso Máximo: {maxWeight} kg</span>
            </div>
          </div>
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
