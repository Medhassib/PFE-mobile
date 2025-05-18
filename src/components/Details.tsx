import React, { useState } from "react";
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonLabel,
  IonItem,
  IonList,
  IonModal,
} from "@ionic/react";
import { star, starOutline } from "ionicons/icons";
import "./Details.css";
import Feedback from "./Feedback";

interface Incident {
  id: number;
  titre: string;
  description?: string;
  details?: string;
  date_insertion: string;
  adresse?: string;
  telephone?: string;
  nom?: string;
  code_postal?: string;
  date_acceptation?: string;
  accepted_by?: boolean;
  status?: string;
}

interface DetailsProps {
  incident: Incident;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
  onAccept?: (id: number) => void;
  showAcceptButton?: boolean;
  confirmAccept?: (id: number) => void;
}

const Details: React.FC<DetailsProps> = ({
  incident,
  onClose,
  isFavorite,
  onToggleFavorite,
  onAccept,
  showAcceptButton = false,
  confirmAccept,
}) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  const detailsText = incident.details || incident.description;

  const isAccepted =
    incident.accepted_by === true || incident.status === "IN_PROGRESS";

  const handleFeedbackSuccess = () => {
    // Fermer le modal après soumission réussie
    setShowFeedbackModal(false);
  };

  return (
    <IonContent className="ion-padding">
      <IonHeader>
        <IonToolbar>
          <IonTitle>{incident.titre}</IonTitle>
          <IonButtons slot="end">
            {onToggleFavorite && (
              <IonButton
                fill="clear"
                onClick={() => onToggleFavorite(incident.id)}
              >
                <IonIcon
                  icon={isFavorite ? star : starOutline}
                  color={isFavorite ? "medium" : "warning"}
                  slot="icon-only"
                  style={{
                    fontSize: "24px",
                    transform: isFavorite ? "rotate(45deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                  }}
                />
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonList lines="none">
        <IonItem>
          <IonLabel>
            <h2>Description</h2>
            <p>{detailsText}</p>
          </IonLabel>
        </IonItem>

        <IonItem>
          <IonLabel>
            <h2>Date</h2>
            <p>{new Date(incident.date_insertion).toLocaleDateString()}</p>
          </IonLabel>
        </IonItem>

        {incident.adresse && (
          <IonItem>
            <IonLabel>
              <h2>Adresse</h2>
              <p>{incident.adresse}</p>
            </IonLabel>
          </IonItem>
        )}

        {incident.telephone && (
          <IonItem>
            <IonLabel>
              <h2>Téléphone</h2>
              <p>{incident.telephone}</p>
            </IonLabel>
          </IonItem>
        )}

        {incident.date_acceptation && (
          <IonItem>
            <IonLabel>
              <h2>Date d'acceptation</h2>
              <p>{new Date(incident.date_acceptation).toLocaleDateString()}</p>
            </IonLabel>
          </IonItem>
        )}

        {incident.status && (
          <IonItem>
            <IonLabel>
              <h2>Statut</h2>
              <p>
                {incident.status === "IN_PROGRESS"
                  ? "En cours"
                  : incident.status}
              </p>
            </IonLabel>
          </IonItem>
        )}
      </IonList>

      <div className="button-container">
        {showAcceptButton && confirmAccept && (
          <IonButton
            onClick={() => confirmAccept(incident.id)}
            color={isAccepted ? "medium" : "success"}
            expand="block"
            disabled={isAccepted}
            className="action-button"
          >
            {isAccepted ? "Mission déjà acceptée" : "Accepter"}
          </IonButton>
        )}

        {isAccepted && (
          <IonButton
            onClick={() => setShowFeedbackModal(true)}
            color="primary"
            expand="block"
            className="action-button"
          >
            Feedback
          </IonButton>
        )}

        <IonButton
          onClick={onClose}
          color="medium"
          expand="block"
          className="action-button"
        >
          Fermer
        </IonButton>
      </div>

      {/* Modal pour le feedback */}
      <IonModal
        isOpen={showFeedbackModal}
        onDidDismiss={() => setShowFeedbackModal(false)}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Feedback de mission</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowFeedbackModal(false)}>
                Fermer
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <h2>Mission: {incident.titre}</h2>
          
          {/* Utilisation du composant Feedback */}
          <Feedback 
            incidentId={incident.id} 
            onSubmitSuccess={handleFeedbackSuccess} 
          />
        </IonContent>
      </IonModal>
    </IonContent>
  );
};

export default Details;

