import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import WorkoutMenu from './components/WorkoutMenu';
import WeeklyRecord from './components/WeeklyRecord';
import DataOverview from './components/DataOverview';
import Login from './components/Login';  // Componente de autenticación
import { signOut, onAuthStateChanged } from 'firebase/auth';  // Importa correctamente signOut y onAuthStateChanged
import { auth } from './firebaseConfig';  // Importa auth desde firebaseConfig
import './App.css'; 

// Importamos los fondos según el grupo muscular
import pechoYTricepsBackground from './assets/background/pecho_y_triceps.png';
import espaldaYBicepsBackground from './assets/background/espalda_y_biceps.png';
import piernasYGluteosBackground from './assets/background/piernas_y_gluteos.png';
import hombrosYAbdomenBackground from './assets/background/hombros_y_abdomen.png';
import fullBodyBackground from './assets/background/full_body.png';
import LogoutModal from './components/LogoutModal';  // Modal para confirmar logout

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');  // Inicia en 'login' en lugar de 'home'
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [user, setUser] = useState(null);  // Estado para el usuario autenticado
  const [showLogoutModal, setShowLogoutModal] = useState(false);  // Controla la visibilidad de la modal de logout

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
        setCurrentScreen('home');  // Cambiar a 'home' después de iniciar sesión
      } else {
        setUser(null);  // Reinicia el usuario si no está autenticado
        setCurrentScreen('login');  // Llevar a la pantalla de login si no hay usuario autenticado
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
  }, []);  // Eliminamos 'workouts' como dependencia innecesaria

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

  // Abrir la modal de logout
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // Cerrar la modal de logout
  const handleCloseLogoutModal = () => {
    setShowLogoutModal(false);
  };

  // Confirmar el logout
  const handleConfirmLogout = async () => {
    try {
      await signOut(auth);  // Ejecuta la función signOut
      setShowLogoutModal(false);
      setCurrentScreen('login');
    } catch (error) {
      console.error("Error al cerrar sesión: ", error);
    }
  };

  // Si no hay usuario autenticado y estamos en la pantalla de login, renderiza la pantalla de login
  if (!user && currentScreen === 'login') {
    return <Login setUser={setUser} />;
  }

  // Si el usuario está autenticado, renderiza el resto de la aplicación
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
          onLogout={handleLogoutClick}  // Añadimos el botón de logout en la home
        />
      )}
      {currentScreen === 'workoutMenu' && (
        <WorkoutMenu 
          workout={selectedWorkout} 
          onCompleteWorkout={handleGoBack} 
          onGoBack={handleGoBack} 
          userId={user.uid}  // Aquí pasamos correctamente el userId
          onLogout={handleLogoutClick}  // Añadimos el botón de logout en el workout menu
        />
      )}
      {currentScreen === 'weeklyRecord' && <WeeklyRecord onGoBack={handleGoBack} />}
      {currentScreen === 'dataOverview' && <DataOverview onGoBack={handleGoBack} userId={user.uid} />}

      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleConfirmLogout}
          onClose={handleCloseLogoutModal}
        />
      )}
    </div>
  );
}

export default App;
