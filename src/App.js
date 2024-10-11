import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import WorkoutMenu from './components/WorkoutMenu';
import WeeklyRecord from './components/WeeklyRecord';
import DataOverview from './components/DataOverview';  // Importamos la nueva página
import './App.css'; // Añade estilos para la Home

// Importamos los fondos según el grupo muscular
import pechoYTricepsBackground from './assets/background/pecho_y_triceps.png';
import espaldaYBicepsBackground from './assets/background/espalda_y_biceps.png';
import piernasYGluteosBackground from './assets/background/piernas_y_gluteos.png';
import hombrosYAbdomenBackground from './assets/background/hombros_y_abdomen.png';
import fullBodyBackground from './assets/background/full_body.png';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);

  // Mapeo de los días de la semana a los grupos musculares
  const workouts = {
    lunes: 'Pecho y Tríceps',
    martes: 'Espalda y Bíceps',
    miércoles: 'Piernas y Glúteos',
    jueves: 'Hombros y Abdomen',
    viernes: 'Full Body',
  };

  useEffect(() => {
    // Obtener el día actual en formato español
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
    const todayWorkout = workouts[today] || 'Descanso';  // Si es fin de semana, mostramos "Descanso"

    // Establecer el fondo según el grupo muscular del día
    switch (todayWorkout) {
      case 'Pecho y Tríceps':
        setBackgroundImage(pechoYTricepsBackground);
        break;
      case 'Espalda y Bíceps':
        setBackgroundImage(espaldaYBicepsBackground);
        break;
      case 'Piernas y Glúteos':
        setBackgroundImage(piernasYGluteosBackground);
        break;
      case 'Hombros y Abdomen':
        setBackgroundImage(hombrosYAbdomenBackground);
        break;
      case 'Full Body':
        setBackgroundImage(fullBodyBackground);
        break;
      default:
        setBackgroundImage(null);  // Fondo vacío para los días de descanso
        break;
    }
  }, []);  // Este useEffect se ejecuta solo al cargar la app

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
    <div
      className="App"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        width: '100%',
      }}
    >
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
