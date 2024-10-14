
import React from 'react';
import './WorkoutMenu.css'; // Usamos los estilos de WorkoutMenu

const LogoutModal = ({ onConfirm, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>¿Estás seguro de que quieres cerrar sesión?</h3>
        <div className="modal-footer">
          <button className="modal-btn" onClick={onConfirm}>Sí</button>
          <button className="modal-btn" onClick={onClose}>No</button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
