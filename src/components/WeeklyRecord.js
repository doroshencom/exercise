import React, { useEffect, useState } from 'react';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';  // Importamos Firestore

const WeeklyRecord = ({ onGoBack }) => {
  const [trainedDays, setTrainedDays] = useState([]);
  const [maxWeights, setMaxWeights] = useState({});

  const userId = "user_123"; // Reemplaza esto con el ID del usuario actual

  useEffect(() => {
    const fetchTrainedDays = async () => {
      const docRef = doc(db, "diasEntrenados", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setTrainedDays(docSnap.data().days || []);
      }
    };

    const fetchMaxWeights = async () => {
      const docRef = doc(db, "pesosMaximos", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setMaxWeights(docSnap.data().maxWeights || {});
      }
    };

    fetchTrainedDays();
    fetchMaxWeights();
  }, []);

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const renderDays = () => {
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(today.getFullYear(), today.getMonth(), i);
      const dayString = day.toISOString().split('T')[0];
      days.push(
        <div key={i} className="calendar-day">
          {i}
          {trainedDays.includes(dayString) && <span>✔</span>}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="weekly-record">
      <div className="header">
        <button className="back-btn" onClick={onGoBack}>←</button>
        <h2>Registro Semanal</h2>
      </div>
      <div className="calendar">{renderDays()}</div>
      <div className="max-weights">
        <h3>Pesos máximos</h3>
        <ul>
          {Object.entries(maxWeights).map(([exercise, weight]) => (
            <li key={exercise}>
              {exercise}: {weight} kg
            </li>
          ))}
        </ul>
      </div>
      <footer>
        <p>designed & developed by shenko.es</p>
      </footer>
    </div>
  );
};

export default WeeklyRecord;
