import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';

const DataOverview = ({ onGoBack }) => {
  const [trainings, setTrainings] = useState([]);
  const [maxWeights, setMaxWeights] = useState({});
  const [trainedDays, setTrainedDays] = useState([]);
  const [liftedKilos, setLiftedKilos] = useState({ weekly: 0, monthly: 0, total: 0 });
  const [totalTime, setTotalTime] = useState({ weekly: 0, monthly: 0, total: 0 });
  const [totalExercises, setTotalExercises] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null);
  const [bodyWeight, setBodyWeight] = useState(90); 
  const [isEditingWeight, setIsEditingWeight] = useState(false); 
  const [weightHistory, setWeightHistory] = useState([]); 
  const [showSnackbar, setShowSnackbar] = useState(false);

  const userId = "user_123"; 

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "entrenamientos"));
        const trainingData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setTrainings(trainingData);
        calculateLiftedKilos(trainingData);
        calculateTotalTime(trainingData);
        calculateTotalExercises(trainingData);
      } catch (error) {
        console.error("Error al obtener entrenamientos:", error);
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

    const fetchTrainedDays = async () => {
      try {
        const docRef = collection(db, "diasEntrenados");
        const docSnap = await getDocs(docRef);

        if (!docSnap.empty) {
          const daysData = docSnap.docs[0].data().days || [];
          setTrainedDays(daysData);
        } else {
          setTrainedDays([]);
        }
      } catch (error) {
        console.error("Error al obtener los días entrenados:", error);
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

    fetchTrainings();
    fetchMaxWeights();
    fetchTrainedDays();
    fetchBodyWeight();
  }, [userId]);

  const calculateLiftedKilos = (trainingData) => {
    const currentWeek = new Date().getWeek();
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    let weeklyTotal = 0;
    let monthlyTotal = 0;
    let total = 0;

    trainingData.forEach(training => {
      const trainingDate = new Date(training.fecha);
      const week = trainingDate.getWeek();
      const month = trainingDate.getMonth() + 1;
      const year = trainingDate.getFullYear();

      training.ejercicios.forEach(ejercicio => {
        const kilos = (ejercicio.peso || 0) * (ejercicio.series || 0) * (ejercicio.repeticiones || 0);
        total += kilos;

        if (year === currentYear && month === currentMonth) {
          monthlyTotal += kilos;
        }

        if (year === currentYear && week === currentWeek) {
          weeklyTotal += kilos;
        }
      });
    });

    setLiftedKilos({ weekly: weeklyTotal, monthly: monthlyTotal, total });
  };

  const calculateTotalTime = (trainingData) => {
    const currentWeek = new Date().getWeek();
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    let weeklyTotal = 0;
    let monthlyTotal = 0;
    let total = 0;

    trainingData.forEach(training => {
      const trainingDate = new Date(training.fecha);
      const week = trainingDate.getWeek();
      const month = trainingDate.getMonth() + 1;
      const year = trainingDate.getFullYear();

      total += training.tiempoTotal || 0;

      if (year === currentYear && month === currentMonth) {
        monthlyTotal += training.tiempoTotal || 0;
      }

      if (year === currentYear && week === currentWeek) {
        weeklyTotal += training.tiempoTotal || 0;
      }
    });

    setTotalTime({ weekly: weeklyTotal, monthly: monthlyTotal, total });
  };

  const calculateTotalExercises = (trainingData) => {
    let totalExercisesCount = 0;
    trainingData.forEach(training => {
      totalExercisesCount += training.ejercicios.length;
    });
    setTotalExercises(totalExercisesCount);
  };

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

      {/* Sección de días entrenados y ejercicios completados */}
      <section>
        <h2>Días entrenados</h2>
        <p><strong>Días entrenados:</strong> {trainedDays.length} días</p>
        <p><strong>Ejercicios completados:</strong> {totalExercises} ejercicios</p>
      </section>

      {/* Sección de peso corporal */}
      <section>
        <h2>Peso Corporal</h2>
        {isEditingWeight ? (
          <div>
            <input
              type="number"
              value={bodyWeight}
              onChange={(e) => setBodyWeight(e.target.value)}
              placeholder="Introduce tu peso corporal"
            />
            <button onClick={handleSaveBodyWeight}>Guardar</button>
          </div>
        ) : (
          <div>
            <p><strong>Peso Corporal Actual:</strong> {bodyWeight} kg</p>
            <button onClick={() => setIsEditingWeight(true)}>Editar</button>
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

      {/* Sección de kilos levantados */}
      <section>
        <h2>Kilos levantados</h2>
        <p><strong>Esta semana:</strong> {liftedKilos.weekly || 0} kg</p>
        <p><strong>Este mes:</strong> {liftedKilos.monthly || 0} kg</p>
        <p><strong>Total:</strong> {liftedKilos.total || 0} kg</p>
      </section>

      {/* Sección de tiempo de ejercicio */}
      <section>
        <h2>Tiempo de ejercicio</h2>
        <p><strong>Esta semana:</strong> {formatTime(totalTime.weekly)}</p>
        <p><strong>Este mes:</strong> {formatTime(totalTime.monthly)}</p>
        <p><strong>Total:</strong> {formatTime(totalTime.total)}</p>
      </section>

      {/* Sección de seguimiento con acordeón */}
      <section>
        <h2>Seguimiento</h2>
        {trainings.length > 0 ? (
          <ul>
            {trainings.map((training, index) => (
              <li key={training.id}>
                <div onClick={() => setActiveIndex(activeIndex === index ? null : index)} style={{ cursor: 'pointer' }}>
                  <strong>{new Date(training.fecha).toLocaleDateString()} - {training.grupoMuscular}</strong>
                </div>
                {activeIndex === index && (
                  <ul>
                    {training.ejercicios.map((ejercicio, i) => (
                      <li key={i}>
                        {ejercicio.nombre} - {ejercicio.series} series x {ejercicio.repeticiones} reps
                        {ejercicio.peso && `, Peso: ${ejercicio.peso} kg`}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay entrenamientos registrados.</p>
        )}
      </section>

      {/* Snackbar de confirmación */}
      {showSnackbar && <div className="snackbar">¡Peso guardado correctamente!</div>}
    </div>
  );
};

// Función auxiliar para obtener la semana actual del año
Date.prototype.getWeek = function () {
  const firstDayOfYear = new Date(this.getFullYear(), 0, 1);
  const pastDaysOfYear = (this - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export default DataOverview;
