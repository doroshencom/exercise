import React, { useState } from 'react';
import WorkoutModal from './WorkoutModal';
import { collection, addDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';  // Importamos Firestore

const WorkoutMenu = ({ workout, onCompleteWorkout, onGoBack }) => {
  const workoutsByDay = {
    'Pecho y Tríceps': [
      { name: 'Flexiones', series: 4, repeticiones: 12 },
      { name: 'Flexiones diamante', series: 4, repeticiones: 12 },
      { name: 'Press de banca con mancuernas', series: 4, repeticiones: 10 },
      { name: 'Press militar con mancuernas', series: 4, repeticiones: 10 },
      { name: 'Fondos de tríceps en silla', series: 3, repeticiones: 15 }
    ],
    'Espalda y Bíceps': [
      { name: 'Dominadas', series: 3, repeticiones: 10 },
      { name: 'Remo con mancuernas', series: 4, repeticiones: 12 },
      { name: 'Curl de bíceps con mancuernas', series: 4, repeticiones: 10 }
    ],
    'Piernas y Glúteos': [
      { name: 'Sentadillas', series: 4, repeticiones: 12 },
      { name: 'Peso muerto', series: 4, repeticiones: 10 },
      { name: 'Zancadas', series: 3, repeticiones: 12 }
    ],
    'Hombros y Abdomen': [
      { name: 'Press militar con mancuernas', series: 4, repeticiones: 10 },
      { name: 'Elevaciones laterales', series: 3, repeticiones: 12 },
      { name: 'Plancha', series: 3, repeticiones: 30 }
    ],
    'Full Body': [
      { name: 'Flexiones', series: 4, repeticiones: 12 },
      { name: 'Sentadillas', series: 4, repeticiones: 12 },
      { name: 'Dominadas', series: 3, repeticiones: 10 }
    ]
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [totalTime, setTotalTime] = useState(0);

  const exercises = workoutsByDay[workout] || [];

  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
    setModalOpen(true);
  };

  const handleCompleteExercise = (exercise) => {
    setCompletedExercises([...completedExercises, exercise]); // Agregamos los datos completos del ejercicio
    setModalOpen(false);
  };

  const handleCompleteWorkout = async () => {
    console.log("Guardando entrenamiento...");
    console.log("Ejercicios completados:", completedExercises);

    try {
      await addDoc(collection(db, "entrenamientos"), {
        fecha: new Date().toISOString(),
        grupoMuscular: workout,
        ejercicios: completedExercises.map(e => ({
          nombre: e.name,
          peso: e.peso || null,  // Guardamos el peso máximo
          series: e.series || 0,  // Guardamos el número de series
          repeticiones: e.repeticiones || 0  // Guardamos el número de repeticiones
        }))
      });
      console.log("Entrenamiento guardado con éxito");
      onCompleteWorkout();
    } catch (error) {
      console.error("Error al guardar el entrenamiento:", error);
    }
  };

  const isExerciseCompleted = (exercise) => {
    return completedExercises.some(e => e.name === exercise.name);
  };

  return (
    <div className="workout-menu">
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
      <div className="total-time">
        <p>Tiempo total</p>
        <p>{new Date(totalTime * 1000).toISOString().substr(11, 8)}</p>
      </div>
      <button className="complete-btn" onClick={handleCompleteWorkout}>
        COMPLETAR
      </button>
      {modalOpen && (
        <WorkoutModal
          exercise={selectedExercise}
          onClose={() => setModalOpen(false)}
          onComplete={handleCompleteExercise}
          isExtra={selectedExercise === 'Plancha'}
        />
      )}
      <footer>
        <p>designed & developed by shenko.es</p>
      </footer>
    </div>
  );
};

export default WorkoutMenu;
