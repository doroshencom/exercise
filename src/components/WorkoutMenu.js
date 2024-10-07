import React, { useState } from 'react';
import WorkoutModal from './WorkoutModal';
import { collection, addDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';  // Importamos Firestore

const WorkoutMenu = ({ workout, onCompleteWorkout, onGoBack }) => {
  const workoutsByDay = {
    'Pecho y Tríceps': [
      { name: 'Flexiones', completed: false },
      { name: 'Flexiones diamante', completed: false },
      { name: 'Press de banca con mancuernas', completed: false },
      { name: 'Press militar con mancuernas', completed: false },
      { name: 'Fondos de tríceps en silla', completed: false }
    ],
    'Espalda y Bíceps': [
      { name: 'Dominadas', completed: false },
      { name: 'Remo con mancuernas', completed: false },
      { name: 'Curl de bíceps con mancuernas', completed: false }
    ],
    'Piernas y Glúteos': [
      { name: 'Sentadillas', completed: false },
      { name: 'Peso muerto', completed: false },
      { name: 'Zancadas', completed: false }
    ],
    'Hombros y Abdomen': [
      { name: 'Press militar con mancuernas', completed: false },
      { name: 'Elevaciones laterales', completed: false },
      { name: 'Plancha', completed: false }
    ],
    'Full Body': [
      { name: 'Flexiones', completed: false },
      { name: 'Sentadillas', completed: false },
      { name: 'Dominadas', completed: false }
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

  const handleCompleteExercise = (exercise, timeSpent) => {
    setCompletedExercises([...completedExercises, exercise]);
    setTotalTime(totalTime + timeSpent);
    setModalOpen(false);
  };

  const handleCompleteWorkout = async () => {
    try {
      await addDoc(collection(db, "entrenamientos"), {
        fecha: new Date().toISOString(),
        grupoMuscular: workout,
        ejercicios: completedExercises.map(e => ({
          nombre: e.name,
          peso: e.peso,  // Peso usado en cada ejercicio
          series: e.series,
          repeticiones: e.repeticiones
        }))
      });
      onCompleteWorkout();
    } catch (error) {
      console.error("Error al guardar el entrenamiento:", error);
    }
  };

  const isExerciseCompleted = (exercise) => completedExercises.includes(exercise);

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
            className={`exercise-btn ${isExerciseCompleted(exercise.name) ? 'completed' : ''}`}
            onClick={() => handleExerciseClick(exercise.name)}
          >
            {exercise.name}
            {isExerciseCompleted(exercise.name) && <span className="checkmark">✔</span>}
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
