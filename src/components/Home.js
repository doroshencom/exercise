import React from 'react';

const Home = ({ workouts, onStartWorkout, onViewRecord, onViewData }) => {
  const day = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
  const todayWorkout = workouts[day.toLowerCase()];

  return (
    <div className="home">
      <div className="logo-box">
        <p>logo</p>
      </div>
      <p>Hoy es <strong>{day}</strong>, toca</p>
      <button className="group-muscle-btn">{todayWorkout}</button>
      <div className="buttons">
        <button className="start-btn" onClick={() => onStartWorkout(todayWorkout)}>ENTRENAR</button>
        <button className="record-btn" onClick={onViewData}>VER DATOS</button>
      </div>
      <footer>
        <p>designed & developed by shenko.es</p>
      </footer>
    </div>
  );
};

export default Home;
