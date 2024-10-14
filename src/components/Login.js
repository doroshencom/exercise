// src/components/Login.js
import React, { useState } from 'react';
import { auth } from '../firebaseConfig'; // Importa el auth de Firebase
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import './WorkoutMenu.css';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Alterna entre Login y Registro
  const [error, setError] = useState('');

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

  return (
    <div className="login-container">
      <h2 className="login-title">{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>
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
        {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
      </button>
      {error && <p className="login-error">{error}</p>}
      <p className="login-toggle" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? '¿No tienes una cuenta? Regístrate' : '¿Ya tienes una cuenta? Inicia sesión'}
      </p>
    </div>
  );
};

export default Login;
