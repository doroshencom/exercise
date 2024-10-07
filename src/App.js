import React, { useState } from 'react';
import Home from './components/Home';
import WorkoutMenu from './components/WorkoutMenu';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const workouts = {
    lunes: 'Pecho y Tríceps',
    martes: 'Espalda y Bíceps',
    miércoles: 'Piernas y Glúteos',
    jueves: 'Hombros y Abdomen',
    viernes: 'Full Body',
  };

  const handleStartWorkout = (workout) => {
    setSelectedWorkout(workout);
    setCurrentScreen('workoutMenu');
  };

  const handleGoBack = () => {
    setCurrentScreen('home');
  };

  return (
    <div className="App">
      {currentScreen === 'home' && <Home workouts={workouts} onStartWorkout={handleStartWorkout} />}
      {currentScreen === 'workoutMenu' && (
        <WorkoutMenu workout={selectedWorkout} onCompleteWorkout={handleGoBack} onGoBack={handleGoBack} />
      )}
    </div>
  );
}

export default App;
