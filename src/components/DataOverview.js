import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';

const DataOverview = ({ onGoBack }) => {
  const [trainedDays, setTrainedDays] = useState([]);
  const [totalExercises, setTotalExercises] = useState(0);
  const [totalTrainingTime, setTotalTrainingTime] = useState(0);
  const [trainings, setTrainings] = useState([]);
  const [maxWeights, setMaxWeights] = useState({});
  const [bodyWeight, setBodyWeight] = useState(90);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weightHistory, setWeightHistory] = useState([]);
  const [showSnackbar, setShowSnackbar] = useState(false);

  const userId = "user_123";

  useEffect(() => {
    const fetchData = async () => {
      await fetchTrainedDays();
      await fetchBodyWeight();
      await fetchMaxWeights();
      await fetchTrainings();
      await calculateTotalExercises();
    };
    fetchData();
  }, [userId]);

  const fetchTrainedDays = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "entrenamientos"));
      const trainingData = querySnapshot.docs.map((doc) => doc.data());

      const uniqueDays = [...new Set(trainingData.map((training) => new Date(training.fecha).toLocaleDateString()))];
      setTrainedDays(uniqueDays);
    } catch (error) {
      console.error("Error al obtener los días entrenados:", error);
    }
  };

  const fetchMaxWeights = async () => {
    try {
      const docRef = doc(db, "pesosMaximos", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMaxWeights(docSnap.data());
      }
    } catch (error) {
      console.error("Error al obtener pesos máximos:", error);
    }
  };

  const fetchBodyWeight = async () => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setBodyWeight(userData.bodyWeight || 90);
        setWeightHistory(userData.weightHistory || []);
      }
    } catch (error) {
      console.error("Error al obtener peso corporal:", error);
    }
  };

  const fetchTrainings = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "entrenamientos"));
      const trainingData = querySnapshot.docs.map((doc) => doc.data());
      setTrainings(trainingData || []);

      const totalTime = trainingData.reduce((acc, training) => acc + (training.tiempoTotal || 0), 0);
      setTotalTrainingTime(totalTime);
    } catch (error) {
      console.error("Error al obtener entrenamientos:", error);
    }
  };

  const calculateTotalExercises = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "entrenamientos"));
      let totalExercisesCount = 0;

      querySnapshot.forEach((doc) => {
        const training = doc.data();
        totalExercisesCount += (training.ejercicios || []).length;
      });

      setTotalExercises(totalExercisesCount);
    } catch (error) {
      console.error("Error al calcular el total de ejercicios:", error);
    }
  };

  // Función para guardar el peso corporal en Firebase
  const handleSaveBodyWeight = async () => {
    try {
      const docRef = doc(db, "users", userId);
      const updatedHistory = [...weightHistory, { date: new Date().toISOString(), weight: bodyWeight }];
      await setDoc(docRef, { bodyWeight, weightHistory: updatedHistory }, { merge: true });
      setWeightHistory(updatedHistory);
      setIsEditingWeight(false);
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    } catch (error) {
      console.error("Error al guardar peso corporal:", error);
    }
  };

  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    return `${hours} horas ${minutes} minutos`;
  };

  return (
    <div className="data-overview">
      <div className="header">
        <button className="back-btn" onClick={onGoBack}>←</button>
        <h1>Datos Guardados</h1>
      </div>

      {/* Sección de días entrenados */}
      <section>
        <h2>Días entrenados</h2>
        <p><strong>Días entrenados:</strong> {trainedDays.length} días</p>
        <p><strong>Ejercicios completados:</strong> {totalExercises} ejercicios</p>
      </section>

      {/* Sección de tiempo total de entrenamiento */}
      <section>
        <h2>Tiempo Total de Entrenamiento</h2>
        <p><strong>Tiempo Total:</strong> {formatTime(totalTrainingTime)}</p>
      </section>

      {/* Sección de seguimiento con acordeones expandibles */}
      <section>
        <h2>Seguimiento</h2>
        {trainings.length > 0 ? (
          trainings.map((training, index) => (
            <details key={index}>
              <summary>{new Date(training.fecha).toLocaleDateString()} - {training.grupoMuscular}</summary>
              <p><strong>Tiempo Total:</strong> {formatTime(training.tiempoTotal)}</p>
              <ul>
                {(training.ejercicios || []).map((ejercicio, i) => (
                  <li key={i}>
                    {ejercicio.nombre}: {ejercicio.series} series x {ejercicio.repeticiones} reps, Peso: {ejercicio.peso} kg
                  </li>
                ))}
              </ul>
            </details>
          ))
        ) : (
          <p>No hay entrenamientos registrados.</p>
        )}
      </section>

      {/* Sección de peso corporal */}
      <section>
      <h2>Peso Corporal</h2>
{isEditingWeight ? (
  <div className="pesoCorporal-editar">
    <input
      className="input-peso"
      type="number"
      value={bodyWeight}
      onChange={(e) => setBodyWeight(e.target.value)}
      placeholder="Introduce tu peso corporal"
    />
    <button className="guardar-btn" onClick={handleSaveBodyWeight}>Guardar</button>
  </div>
) : (
  <div className='pesoCorporal'>
    <p>Peso Corporal Actual: {bodyWeight} kg</p>
    <button className="pesoCorporal-btn" onClick={() => setIsEditingWeight(true)}>Editar</button>
  </div>
)}

      </section>

      {/* Historial de peso corporal */}
      <section>
        <h2>Historial de Peso Corporal</h2>
        {weightHistory.length > 0 ? (
          <ul>
            {weightHistory.map((entry, index) => (
              <li key={index}>
                {new Date(entry.date).toLocaleDateString()}: {entry.weight} kg
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay historial de cambios de peso corporal.</p>
        )}
      </section>

      {/* Sección de pesos máximos */}
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

      {/* Snackbar de confirmación */}
      {showSnackbar && <div className="snackbar">¡Peso guardado correctamente!</div>}
    </div>
  );
};

export default DataOverview;
