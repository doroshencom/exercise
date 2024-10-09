import React, { useState, useEffect } from 'react';
import WorkoutModal from './WorkoutModal';
import { collection, doc, getDoc, setDoc, addDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';

const WorkoutMenu = ({ workout, onCompleteWorkout, onGoBack }) => {
  const workoutsByDay = {
    'Pecho y Tríceps': [
      { name: 'Flexiones', series: 4, repeticiones: 12 },
      { name: 'Flexiones diamante', series: 4, repeticiones: 12 },
      { name: 'Press de banca con mancuernas', series: 4, repeticiones: 10 },
      { name: 'Press militar con mancuernas', series: 4, repeticiones: 10 },
      { name: 'Fondos de tríceps en silla', series: 3, repeticiones: 15 }
    ],
    'Espalda y Bíceps': [
      { name: 'Dominadas', series: 3, repeticiones: 10 },
      { name: 'Remo con mancuernas', series: 4, repeticiones: 12 },
      { name: 'Curl de bíceps con mancuernas', series: 4, repeticiones: 10 }
    ],
    'Piernas y Glúteos': [
      { name: 'Sentadillas', series: 4, repeticiones: 12 },
      { name: 'Peso muerto', series: 4, repeticiones: 10 },
      { name: 'Zancadas', series: 3, repeticiones: 12 }
    ],
    'Hombros y Abdomen': [
      { name: 'Press militar con mancuernas', series: 4, repeticiones: 10 },
      { name: 'Elevaciones laterales', series: 3, repeticiones: 12 },
      { name: 'Plancha', series: 3, repeticiones: 30 }
    ],
    'Full Body': [
      { name: 'Flexiones', series: 4, repeticiones: 12 },
      { name: 'Sentadillas', series: 4, repeticiones: 12 },
      { name: 'Dominadas', series: 3, repeticiones: 10 }
    ]
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [totalTime, setTotalTime] = useState(0); // Tiempo total acumulado de todos los ejercicios
  const [trainedDays, setTrainedDays] = useState([]);

  const userId = "user_123"; // Reemplaza con el id real del usuario

  useEffect(() => {
    // Cargamos los días entrenados al cargar el componente
    const loadTrainedDays = async () => {
      const docRef = doc(db, "diasEntrenados", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTrainedDays(docSnap.data().days || []);
      } else {
        // Si no existen días entrenados, inicializamos el documento
        await setDoc(docRef, { days: [] });
        setTrainedDays([]);
        console.log("Documento 'diasEntrenados' creado.");
      }
    };
    loadTrainedDays();
  }, [userId]);

  const exercises = workoutsByDay[workout] || [];

  // Actualizamos los pesos máximos en Firebase
  const updateMaxWeight = async (exercise) => {
    const maxWeightDocRef = doc(db, "pesosMaximos", userId);
    const docSnap = await getDoc(maxWeightDocRef);

    let maxWeights = {};
    if (docSnap.exists()) {
      maxWeights = docSnap.data();
    } else {
      // Si no existe el documento, lo creamos
      await setDoc(maxWeightDocRef, {});
      console.log("Documento 'pesosMaximos' creado.");
    }

    const currentMaxWeight = maxWeights[exercise.name] || 0;
    if (exercise.peso > currentMaxWeight) {
      maxWeights[exercise.name] = exercise.peso;
      try {
        await setDoc(maxWeightDocRef, maxWeights, { merge: true });
        console.log("Peso máximo actualizado:", exercise.peso);
      } catch (error) {
        console.error("Error al actualizar el peso máximo:", error);
      }
    }
  };

  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
    setModalOpen(true);
  };

  const handleCompleteExercise = async (exercise) => {
    await updateMaxWeight(exercise);
    setTotalTime((prevTime) => prevTime + exercise.timeSpent);
    setCompletedExercises([...completedExercises, exercise]);
    setModalOpen(false);
  };

  const updateTrainingDays = async () => {
    const today = new Date().toISOString().split('T')[0];
    const docRef = doc(db, "diasEntrenados", userId);

    const docSnap = await getDoc(docRef);
    let newTrainedDays = [];

    if (docSnap.exists()) {
      const currentDays = docSnap.data().days || [];
      if (!currentDays.includes(today)) {
        newTrainedDays = [...currentDays, today];
      } else {
        newTrainedDays = currentDays;
      }
    } else {
      newTrainedDays = [today];
      await setDoc(docRef, { days: newTrainedDays }, { merge: true });
    }

    await setDoc(docRef, { days: newTrainedDays }, { merge: true });
    setTrainedDays(newTrainedDays);
    console.log("Días entrenados actualizados:", newTrainedDays);
  };

  const handleCompleteWorkout = async () => {
    console.log("Guardando entrenamiento...");
    console.log("Ejercicios completados:", completedExercises);

    try {
      // Guardamos los ejercicios completados
      await addDoc(collection(db, "entrenamientos"), {
        fecha: new Date().toISOString(),
        grupoMuscular: workout,
        ejercicios: completedExercises.map(e => ({
          nombre: e.name,
          peso: e.peso || null,
          series: e.series || 0,
          repeticiones: e.repeticiones || 0,
          timeSpent: e.timeSpent || 0
        })),
        tiempoTotal: totalTime
      });

      // Actualizamos los días entrenados
      await updateTrainingDays();

      console.log("Entrenamiento guardado con éxito");
      onCompleteWorkout();
    } catch (error) {
      console.error("Error al guardar el entrenamiento:", error);
    }
  };

  const isExerciseCompleted = (exercise) => {
    return completedExercises.some(e => e.name === exercise.name);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = (time % 1000) / 10;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="workout-menu">
      <div className="header">
        <button className="back-btn" onClick={onGoBack}>←</button>
        <h2 className="group-muscle">{workout}</h2>
      </div>
      <div className="exercise-list">
        {exercises.map((exercise, index) => (
          <button
            key={index}
            className={`exercise-btn ${isExerciseCompleted(exercise) ? 'completed' : ''}`}
            onClick={() => handleExerciseClick(exercise)}
          >
            {exercise.name}
            {isExerciseCompleted(exercise) && <span className="checkmark">✔</span>}
          </button>
        ))}
      </div>
      <div className="total-time">
        <p>Tiempo total</p>
        <p>{formatTime(totalTime)}</p>
      </div>
      <button className="complete-btn" onClick={handleCompleteWorkout}>
        COMPLETAR
      </button>
      {modalOpen && (
        <WorkoutModal
          exercise={selectedExercise}
          onClose={() => setModalOpen(false)}
          onComplete={handleCompleteExercise}
          isExtra={selectedExercise === 'Plancha'}
        />
      )}
      <footer>
        <p>designed & developed by shenko.es</p>
      </footer>
    </div>
  );
};

export default WorkoutMenu;
