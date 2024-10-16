import React, { useState, useEffect, useRef } from 'react';
import playIcon from '../assets/btn/play.svg';
import pauseIcon from '../assets/btn/pause.svg';
import resetIcon from '../assets/btn/reset.svg';
import { doc, getDoc, setDoc, collection, addDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';
import './WorkoutModal.css';

const WorkoutModal = ({ exercise, onClose, onComplete, isBodyWeight, userId, workout }) => {
  const [weights, setWeights] = useState(Array(exercise.series).fill(''));
  const [bodyWeight, setBodyWeight] = useState(90);
  const [maxWeight, setMaxWeight] = useState(0);
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  // Verificación de userId antes de ejecutar las funciones de Firebase
  useEffect(() => {
    if (!userId) {
      console.error("Error: El userId es undefined. Asegúrate de que el usuario esté autenticado.");
      return;
    }

    const fetchBodyWeight = async () => {
      const docRef = doc(db, `users/${userId}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setBodyWeight(userData.bodyWeight || 90);
      }
    };

    const fetchMaxWeight = async () => {
      const docRef = doc(db, `users/${userId}/pesosMaximos/${exercise.name}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const maxWeights = docSnap.data();
        setMaxWeight(maxWeights.maxWeight || 0);
      }
    };

    fetchBodyWeight();
    fetchMaxWeight();
  }, [userId, exercise.name]);

  const handleSaveBodyWeight = async () => {
    if (!userId) {
      console.error("Error: No se puede guardar el peso corporal porque el userId es undefined.");
      return;
    }

    const docRef = doc(db, `users/${userId}`);
    await setDoc(docRef, { bodyWeight }, { merge: true });
  };

  const updateMaxWeight = async (newMaxWeight) => {
    if (!userId) {
      console.error("Error: No se puede actualizar el peso máximo porque el userId es undefined.");
      return;
    }

    const docRef = doc(db, `users/${userId}/pesosMaximos/${exercise.name}`);
    await setDoc(docRef, { maxWeight: newMaxWeight }, { merge: true });
    setMaxWeight(newMaxWeight);
  };

  const handleComplete = async () => {
    if (!userId) {
      console.error("Error: No se puede completar el entrenamiento porque el userId es undefined.");
      return;
    }

    const maxSeriesWeight = Math.max(...weights.map(w => parseFloat(w) || 0));
    const totalWeight = maxSeriesWeight || 0;

    await updateMaxWeight(totalWeight);

    const newTraining = {
      nombre: exercise.name,
      series: exercise.series,
      repeticiones: exercise.repeticiones,
      peso: totalWeight,
      timeSpent: time || 0,
      fecha: new Date().toISOString(),
      grupoMuscular: workout
    };

    try {
      const docRef = collection(db, `users/${userId}/entrenamientos`);
      await addDoc(docRef, {
        fecha: new Date().toISOString(),
        grupoMuscular: workout,
        ejercicios: [newTraining],
        tiempoTotal: time || 0
      });

      const today = new Date().toLocaleDateString();
      const daysRef = doc(db, `users/${userId}/diasEntrenados/${today}`);
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
              <span className="pill">PR: {maxWeight} kg</span>
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
