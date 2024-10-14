import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig'; // Importa el auth de Firebase
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import appLogo from '../assets/btn/logo.png';  // Importa el logo de la app
import pechoYTricepsBackground from '../assets/background/pecho_y_triceps.png';
import espaldaYBicepsBackground from '../assets/background/espalda_y_biceps.png';
import piernasYGluteosBackground from '../assets/background/piernas_y_gluteos.png';
import hombrosYAbdomenBackground from '../assets/background/hombros_y_abdomen.png';
import fullBodyBackground from '../assets/background/full_body.png';
import './Login.css';  // Importa los estilos de WorkoutMenu

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Alterna entre Login y Registro
  const [error, setError] = useState('');
  const [time, setTime] = useState(new Date());

  // Mapeo de los días de la semana a los grupos musculares
  const workouts = {
    lunes: 'Pecho y Tríceps',
    martes: 'Espalda y Bíceps',
    miércoles: 'Piernas y Glúteos',
    jueves: 'Hombros y Abdomen',
    viernes: 'Full Body',
  };

  // Manejar registro
  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user); // Guardar usuario autenticado en estado global o contexto
    } catch (error) {
      setError(error.message);
    }
  };

  // Manejar login
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (error) {
      setError(error.message);
    }
  };

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 10);
    return () => clearInterval(timer); // Limpiar intervalo cuando se desmonte el componente
  }, []);

  // Obtener el día actual y el entrenamiento correspondiente
  const day = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
  const todayWorkout = workouts[day.toLowerCase()];

  // Obtener el background según el grupo muscular
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

  return (
    <div
      className="login-container"
      style={{
        backgroundImage: `url(${getBackgroundImage(todayWorkout)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        width: '100%',
      }}
    >
      {/* Logo de la app */}
      <div className="logo-box">
        <img src={appLogo} alt="Shenko logo" />
      </div>

      {/* Formulario de login/registro */}
      <h2 className="login-title">{isLogin ? 'Login' : 'Registro'}</h2>
      <input
        className="login-input"
        type="email"
        placeholder="Correo Electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="login-input"
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="login-button" onClick={isLogin ? handleLogin : handleSignup}>
        {isLogin ? 'Entrar' : 'Registrarme'}
      </button>
      {error && <p className="login-error">{error}</p>}
      <p className="login-toggle" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? '¿No tienes una cuenta? Regístrate' : '¿Ya tienes una cuenta? Inicia sesión'}
      </p>
    </div>
  );
};

export default Login;
