import React, { useState } from 'react';
import WorkoutModal from './WorkoutModal';

const WorkoutMenu = ({ workout, onCompleteWorkout, onGoBack }) => {
  const exercises = [
    { name: 'Flexiones', completed: false },
    { name: 'Flexiones diamante', completed: false },
    { name: 'Press de banca con mancuernas', completed: false },
    { name: 'Press militar con mancuernas', completed: false },
    { name: 'Fondos de tríceps en silla', completed: false }
  ];

  const extraExercise = { name: 'Plancha lateral', completed: false };

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [totalTime, setTotalTime] = useState(0);

  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
    setModalOpen(true);
  };

  const handleCompleteExercise = (exercise, timeSpent) => {
    setCompletedExercises([...completedExercises, exercise]);
    setTotalTime(totalTime + timeSpent);
    setModalOpen(false);
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
      <div className="extra-section">
        <p>Extra</p>
        <button
          className={`exercise-btn ${isExerciseCompleted(extraExercise.name) ? 'completed' : ''}`}
          onClick={() => handleExerciseClick(extraExercise.name)}
        >
          {extraExercise.name}
          {isExerciseCompleted(extraExercise.name) && <span className="checkmark">✔</span>}
        </button>
      </div>
      <div className="total-time">
        <p>Tiempo total</p>
        <p>{new Date(totalTime * 1000).toISOString().substr(11, 8)}</p>
      </div>
      <button className="complete-btn" onClick={onCompleteWorkout}>
        COMPLETAR
      </button>
      {modalOpen && (
        <WorkoutModal
          exercise={selectedExercise}
          onClose={() => setModalOpen(false)}
          onComplete={handleCompleteExercise}
          isExtra={selectedExercise === extraExercise.name}
        />
      )}
      <footer>
        <p>designed & developed by shenko.es</p>
      </footer>
    </div>
  );
};

export default WorkoutMenu;
