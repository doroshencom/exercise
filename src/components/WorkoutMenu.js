import React, { useState, useEffect } from 'react';
import WorkoutModal from './WorkoutModal';
import { collection, addDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';
import './WorkoutMenu.css';

// Importamos los fondos según el grupo muscular
import pechoYTricepsBackground from '../assets/background/pecho_y_triceps.png';
import espaldaYBicepsBackground from '../assets/background/espalda_y_biceps.png';
import piernasYGluteosBackground from '../assets/background/piernas_y_gluteos.png';
import hombrosYAbdomenBackground from '../assets/background/hombros_y_abdomen.png';
import fullBodyBackground from '../assets/background/full_body.png';

const WorkoutMenu = ({ workout, onCompleteWorkout, onGoBack }) => {
  const workoutsByDay = {
    'Pecho y Tríceps': [
      { name: 'Flexiones', series: 4, repeticiones: 12, isBodyWeight: true },
      { name: 'Flexiones diamante', series: 4, repeticiones: 12, isBodyWeight: true },
      { name: 'Press de banca con mancuernas', series: 4, repeticiones: 10 },
      { name: 'Press militar con mancuernas', series: 4, repeticiones: 10 },
      { name: 'Fondos de tríceps en silla', series: 3, repeticiones: 15, isBodyWeight: true },
      { name: 'Aperturas con mancuernas', series: 3, repeticiones: 12 }
    ],
    'Espalda y Bíceps': [
      { name: 'Dominadas', series: 3, repeticiones: 10, isBodyWeight: true },
      { name: 'Remo con mancuernas', series: 4, repeticiones: 12 },
      { name: 'Curl de bíceps con mancuernas', series: 4, repeticiones: 10 },
      { name: 'Pull over con mancuernas', series: 3, repeticiones: 12 },
      { name: 'Curl concentrado', series: 3, repeticiones: 10 }
    ],
    'Piernas y Glúteos': [
      { name: 'Sentadillas', series: 4, repeticiones: 12, isBodyWeight: true },
      { name: 'Peso muerto', series: 4, repeticiones: 10 },
      { name: 'Zancadas', series: 3, repeticiones: 12, isBodyWeight: true },
      { name: 'Hip thrust', series: 4, repeticiones: 12 },
      { name: 'Sentadilla búlgara', series: 3, repeticiones: 10 }
    ],
    'Hombros y Abdomen': [
      { name: 'Press militar con mancuernas', series: 4, repeticiones: 10 },
      { name: 'Elevaciones laterales', series: 3, repeticiones: 12 },
      { name: 'Plancha', series: 3, repeticiones: 30, isBodyWeight: true },
      { name: 'Elevaciones frontales', series: 3, repeticiones: 12 },
      { name: 'Encogimientos con mancuernas', series: 3, repeticiones: 15 }
    ],
    'Full Body': [
      { name: 'Flexiones', series: 4, repeticiones: 12, isBodyWeight: true },
      { name: 'Sentadillas', series: 4, repeticiones: 12, isBodyWeight: true },
      { name: 'Dominadas', series: 3, repeticiones: 10, isBodyWeight: true },
      { name: 'Peso muerto rumano', series: 3, repeticiones: 10 },
      { name: 'Press de hombros con mancuernas', series: 3, repeticiones: 10 }
    ]
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [totalTime, setTotalTime] = useState(0);
  const [maxWeight, setMaxWeight] = useState(null);

  const userId = "user_123"; // Reemplaza con el id real del usuario

  useEffect(() => {
    const loadTrainedDays = async () => {
      const docRef = doc(db, "diasEntrenados", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTrainedDays(docSnap.data().days || []);
      } else {
        await setDoc(docRef, { days: [] });
        setTrainedDays([]);
      }
    };
    loadTrainedDays();
  }, [userId]);

  const exercises = workoutsByDay[workout] || [];

  const getBackgroundImage = (workout) => {
    switch (workout) {
      case 'Pecho y Tríceps':
        return pechoYTricepsBackground;
      case 'Espalda y Bíceps':
        return espaldaYBicepsBackground;
      case 'Piernas y Glúteos':
        return piernasYGluteosBackground;
      case 'Hombros y Abdomen':
        return hombrosYAbdomenBackground;
      case 'Full Body':
        return fullBodyBackground;
      default:
        return null;
    }
  };

  const handleExerciseClick = async (exercise) => {
    setSelectedExercise(exercise);

    const docRef = doc(db, "pesosMaximos", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const maxWeights = docSnap.data();
      setMaxWeight(maxWeights[exercise.name] || 0);
    } else {
      setMaxWeight(null);
    }

    setModalOpen(true);
  };

  const handleCompleteExercise = (exercise, timeSpent) => {
    console.log("Tiempo pasado:", timeSpent); // Verificar el valor de timeSpent
    if (!timeSpent || isNaN(timeSpent)) {
      console.error("Tiempo inválido pasado a la función handleCompleteExercise.");
      return;
    }

    setTotalTime((prevTime) => prevTime + timeSpent); // Acumula el tiempo
    setCompletedExercises([...completedExercises, { ...exercise, timeSpent }]);
    setModalOpen(false);
  };

  useEffect(() => {
    const total = completedExercises.reduce((acc, exercise) => acc + (exercise.timeSpent || 0), 0);
    setTotalTime(total);
  }, [completedExercises]);

  const handleCompleteWorkout = async () => {
    try {
      if (!workout) {
        console.error("Datos incompletos: grupo muscular faltante.");
        return;
      }

      // Guardar el entrenamiento, incluso si no se han completado ejercicios
      await addDoc(collection(db, "entrenamientos"), {
        fecha: new Date().toISOString(),
        grupoMuscular: workout,
        ejercicios: completedExercises.map(e => ({
          nombre: e.name,
          peso: e.peso || 0, // Valor predeterminado si falta peso
          series: e.series || 0,
          repeticiones: e.repeticiones || 0,
          timeSpent: e.timeSpent || 0
        })),
        tiempoTotal: totalTime || 0 // Asegurarse de que el tiempo total no sea undefined
      });

      console.log("Entrenamiento guardado con éxito.");
      onCompleteWorkout();
    } catch (error) {
      console.error("Error al guardar el entrenamiento:", error);
    }
  };

  const isExerciseCompleted = (exercise) => {
    return completedExercises.some(e => e.name === exercise.name);
  };

  return (
    <div
      className="workout-menu"
      style={{
        backgroundImage: `url(${getBackgroundImage(workout)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="content-overlay">
        <div className="header">
          <button className="back-btn" onClick={onGoBack}>←</button>
          <h2 className="group-muscle">{workout}</h2>
        </div>
        <div className="exercise-list">
          {exercises.map((exercise, index) => (
            <button
              key={index}
              className={`exercise-btn ${isExerciseCompleted(exercise) ? 'completed' : ''}`}
              onClick={() => handleExerciseClick(exercise)}
            >
              {exercise.name}
              {isExerciseCompleted(exercise) && <span className="checkmark">✔</span>}
            </button>
          ))}
        </div>

        <button className="complete-button" onClick={handleCompleteWorkout}>
          COMPLETAR
        </button>
        {modalOpen && (
          <WorkoutModal
            exercise={selectedExercise}
            maxWeight={maxWeight}
            onClose={() => setModalOpen(false)}
            onComplete={handleCompleteExercise}
            isBodyWeight={selectedExercise.isBodyWeight}
            workout={workout}
          />
        )}
        <footer className="footer-logo">
          <p>designed & developed by <a href='https://shenko.es/'>shenko.es</a></p>
        </footer>
      </div>
    </div>
  );
};

export default WorkoutMenu;
