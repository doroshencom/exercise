import React, { useState } from 'react';
import Home from './components/Home';
import WorkoutMenu from './components/WorkoutMenu';
import WeeklyRecord from './components/WeeklyRecord';
import DataOverview from './components/DataOverview';  // Importamos la nueva página

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

  const handleViewRecord = () => {
    setCurrentScreen('weeklyRecord');
  };

  const handleViewData = () => {
    setCurrentScreen('dataOverview');
  };

  const handleGoBack = () => {
    setCurrentScreen('home');
  };

  return (
    <div className="App">
      {currentScreen === 'home' && (
        <Home
          workouts={workouts}
          onStartWorkout={handleStartWorkout}
          onViewRecord={handleViewRecord}
          onViewData={handleViewData}  // Agregamos la opción para ver los datos
        />
      )}
      {currentScreen === 'workoutMenu' && (
        <WorkoutMenu workout={selectedWorkout} onCompleteWorkout={handleGoBack} onGoBack={handleGoBack} />
      )}
      {currentScreen === 'weeklyRecord' && <WeeklyRecord onGoBack={handleGoBack} />}
      {currentScreen === 'dataOverview' && <DataOverview onGoBack={handleGoBack} />}  {/* Agregamos la página de consulta */}
    </div>
  );
}

export default App;
