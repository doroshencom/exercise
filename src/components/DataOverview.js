import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';  // Asegúrate de que esto apunta a la configuración de Firebase

const DataOverview = ({ onGoBack }) => {
  const [trainings, setTrainings] = useState([]);
  const [maxWeights, setMaxWeights] = useState({});
  const [trainedDays, setTrainedDays] = useState([]);

  const userId = "user_123"; // Identificación del usuario (ajusta esto según tu implementación)

  useEffect(() => {
    // Función para obtener los entrenamientos desde Firebase
    const fetchTrainings = async () => {
      const querySnapshot = await getDocs(collection(db, "entrenamientos"));
      const trainingData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setTrainings(trainingData);
    };

    // Función para obtener los pesos máximos desde Firebase
    const fetchMaxWeights = async () => {
      const docRef = doc(db, "pesosMaximos", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setMaxWeights(docSnap.data().maxWeights || {});
      } else {
        console.log("No se encontraron pesos máximos");
      }
    };

    // Función para obtener los días entrenados desde Firebase
    const fetchTrainedDays = async () => {
      const docRef = doc(db, "diasEntrenados", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setTrainedDays(docSnap.data().days || []);
      } else {
        console.log("No se encontraron días entrenados");
      }
    };

    fetchTrainings();
    fetchMaxWeights();
    fetchTrainedDays();
  }, []);

  return (
    <div className="data-overview">
      <div className="header">
        <button className="back-btn" onClick={onGoBack}>←</button>
        <h1>Datos Guardados</h1>
      </div>

      <section>
        <h2>Entrenamientos</h2>
        {trainings.length > 0 ? (
          <ul>
            {trainings.map((training) => (
              <li key={training.id}>
                <strong>Fecha:</strong> {training.fecha} <br />
                <strong>Grupo muscular:</strong> {training.grupoMuscular} <br />
                <strong>Ejercicios:</strong>
                <ul>
                  {training.ejercicios.map((ejercicio, index) => (
                    <li key={index}>
                      {ejercicio.nombre} - {ejercicio.series} series x {ejercicio.repeticiones} reps
                      {ejercicio.peso && `, Peso: ${ejercicio.peso} kg`}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay entrenamientos registrados.</p>
        )}
      </section>

      <section>
        <h2>Pesos Máximos</h2>
        {Object.keys(maxWeights).length > 0 ? (
          <ul>
            {Object.entries(maxWeights).map(([exercise, weight]) => (
              <li key={exercise}>
                {exercise}: {weight} kg
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay registros de pesos máximos.</p>
        )}
      </section>

      <section>
        <h2>Días Entrenados</h2>
        {trainedDays.length > 0 ? (
          <ul>
            {trainedDays.map((day, index) => (
              <li key={index}>{day}</li>
            ))}
          </ul>
        ) : (
          <p>No hay días entrenados registrados.</p>
        )}
      </section>
    </div>
  );
};

export default DataOverview;
