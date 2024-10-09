import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';

const DataOverview = ({ onGoBack }) => {
  const [trainings, setTrainings] = useState([]);
  const [maxWeights, setMaxWeights] = useState({});
  const [trainedDays, setTrainedDays] = useState([]);  // Para días entrenados
  const [liftedKilos, setLiftedKilos] = useState({ weekly: 0, monthly: 0, total: 0 }); // Estado para los kilos levantados
  const [totalExercises, setTotalExercises] = useState(0); // Estado para ejercicios completados
  const [activeIndex, setActiveIndex] = useState(null); // Estado para el acordeón

  const userId = "user_123"; // Identificación del usuario (ajusta según tu implementación)

  useEffect(() => {
    // Función para obtener los entrenamientos desde Firebase
    const fetchTrainings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "entrenamientos"));
        const trainingData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setTrainings(trainingData);
        calculateLiftedKilos(trainingData);
        calculateTotalExercises(trainingData);
      } catch (error) {
        console.error("Error al obtener entrenamientos:", error);
      }
    };

    // Función para obtener los días entrenados desde Firebase
    const fetchTrainedDays = async () => {
      try {
        const docRef = doc(db, "diasEntrenados", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const daysData = docSnap.data().days || [];
          setTrainedDays(daysData);
        } else {
          console.log("No se encontraron días entrenados.");
          setTrainedDays([]);
        }
      } catch (error) {
        console.error("Error al obtener los días entrenados:", error);
      }
    };

    const fetchMaxWeights = async () => {
      try {
        const docRef = collection(db, "pesosMaximos");
        const docSnap = await getDocs(docRef);

        if (!docSnap.empty) {
          let maxWeightsData = {};
          docSnap.forEach((doc) => {
            maxWeightsData = { ...maxWeightsData, ...doc.data() };
          });
          setMaxWeights(maxWeightsData);
        } else {
          console.log("No se encontraron pesos máximos.");
        }
      } catch (error) {
        console.error("Error al obtener los pesos máximos:", error);
      }
    };

    // Función para calcular los kilos levantados (semana, mes y total)
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

    // Función para calcular el total de ejercicios completados
    const calculateTotalExercises = (trainingData) => {
      let totalExercisesCount = 0;
      trainingData.forEach(training => {
        totalExercisesCount += training.ejercicios.length;
      });
      setTotalExercises(totalExercisesCount);
    };

    fetchTrainings();
    fetchTrainedDays();  // Asegurarse de que los días entrenados se obtienen correctamente
    fetchMaxWeights();
  }, []);

  // Función para formatear los días entrenados en el formato "Día, DD:MM:AAAA"
  const formatDateWithDay = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' };
    let formattedDate = date.toLocaleDateString('es-ES', options).replace(',', '');
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    return formattedDate;
  };

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index); // Si se hace clic en el mismo, colapsa. Si es otro, expande
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

      {/* Sección de seguimiento con acordeón */}
      <section>
        <h2>Seguimiento</h2>
        {trainings.length > 0 ? (
          <ul>
            {trainings.map((training, index) => (
              <li key={training.id}>
                <div onClick={() => toggleAccordion(index)} style={{ cursor: 'pointer' }}>
                  <strong>{formatDateWithDay(training.fecha)}</strong> - {training.grupoMuscular}
                </div>
                {activeIndex === index && ( // Solo muestra los detalles si el acordeón está activo
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
    </div>
  );
};

// Función auxiliar para obtener la semana actual del año
Date.prototype.getWeek = function() {
  const firstDayOfYear = new Date(this.getFullYear(), 0, 1);
  const pastDaysOfYear = (this - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export default DataOverview;
