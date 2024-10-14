import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import WorkoutMenu from './components/WorkoutMenu';
import WeeklyRecord from './components/WeeklyRecord';
import DataOverview from './components/DataOverview';
import Login from './components/Login';  // Componente de autenticación
import { auth } from './firebaseConfig';  // Importamos la autenticación de Firebase
import { onAuthStateChanged } from 'firebase/auth';
import './App.css'; 

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
  const [user, setUser] = useState(null);  // Estado para el usuario autenticado

  // Mapeo de los días de la semana a los grupos musculares
  const workouts = {
    lunes: 'Pecho y Tríceps',
    martes: 'Espalda y Bíceps',
    miércoles: 'Piernas y Glúteos',
    jueves: 'Hombros y Abdomen',
    viernes: 'Full Body',
  };

  // Listener para los cambios en la autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log('Usuario autenticado: ', currentUser.uid);
        setUser(currentUser);  // Asegura que el usuario esté definido
      } else {
        setUser(null);  // Reinicia el usuario si no está autenticado
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
    const todayWorkout = workouts[today] || 'Descanso'; 

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
        setBackgroundImage(null); 
        break;
    }
  }, [workouts]);

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

  // Asegúrate de que el usuario esté autenticado antes de renderizar la pantalla
  if (!user) {
    return <Login setUser={setUser} />;
  }

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
          onViewData={handleViewData}
        />
      )}
      {currentScreen === 'workoutMenu' && (
        <WorkoutMenu 
          workout={selectedWorkout} 
          onCompleteWorkout={handleGoBack} 
          onGoBack={handleGoBack} 
          userId={user.uid}  // Aquí pasamos correctamente el userId
        />
      )}
      {currentScreen === 'weeklyRecord' && <WeeklyRecord onGoBack={handleGoBack} />}
      {currentScreen === 'dataOverview' && <DataOverview onGoBack={handleGoBack} userId={user.uid} />}
    </div>
  );
}

export default App;
