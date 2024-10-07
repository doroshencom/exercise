import React from 'react';

const Home = ({ workouts, onStartWorkout }) => {
  const day = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
  const todayWorkout = workouts[day.toLowerCase()];

  return (
    <div className="home">
      <h1>Hoy es {day}, toca {todayWorkout}</h1>
      <button onClick={() => onStartWorkout(todayWorkout)}>Entrenar</button>
    </div>
  );
};

export default Home;
