import React from 'react';
import '../App.css'; // Añade estilos para la Home
import appLogo from '../assets/btn/logo.png';

const Home = ({ workouts, onStartWorkout, onViewRecord, onViewData }) => {
  const day = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
  const todayWorkout = workouts[day.toLowerCase()];

  return (
    <div className="home">
      <div className="logo-box">
        <img src={appLogo} alt="Shenko logo"/>
      </div>
      <div className="muscle-group">
        <p className='paragraph'>Hoy es <strong>{day}</strong>, toca</p>
        <button className="group-muscle-btn">{todayWorkout}</button>
      </div>
      <div className="buttons">
        <button className="start-btn" onClick={() => onStartWorkout(todayWorkout)}>ENTRENAR</button>
        <button className="record-btn" onClick={onViewData}>VER DATOS</button>
      </div>
      <footer className="footer-logo">
        <p>designed & developed by <a href='https://shenko.es/'>shenko.es</a></p>
      </footer>
    </div>
  );
};

export default Home;
