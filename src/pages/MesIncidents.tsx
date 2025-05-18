import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonModal,
  IonButton,
  IonIcon,
  IonAlert,
  useIonToast,
} from "@ionic/react";
import { trash } from "ionicons/icons";
import api from "../utils/api";
import Details from "../components/Details";

interface Incident {
  id: number;
  titre: string;
  details: string;
  description?: string;
  adresse: string;
  telephone: string;
  date_insertion: string;
  nom: string;
  code_postal: string;
  date_acceptation: string;
}

const MesIncidents: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );
  const [showAlert, setShowAlert] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState<number | null>(null);
  const [present] = useIonToast();

  useEffect(() => {
    fetchMesIncidents();
  }, []);

  const fetchMesIncidents = async () => {
    try {
      const response = await api.get("/techniciens/incidents/acceptes");
      setIncidents(response.data.incidents);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des incidents acceptés :",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const openModal = (incident: Incident) => {
    setSelectedIncident(incident);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedIncident(null);
  };

  const confirmDelete = (incidentId: number, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setIncidentToDelete(incidentId);
    setShowAlert(true);
  };

  const deleteIncident = async (incidentId: number) => {
    try {
      console.log("Suppression de l'incident:", incidentId);
      const response = await api.delete(
        `/techniciens/incidents/accepte/${incidentId}`
      );
      console.log("Réponse de suppression:", response);

      // Mettre à jour l'état local pour refléter la suppression
      setIncidents((prevIncidents) =>
        prevIncidents.filter((incident) => incident.id !== incidentId)
      );

      // Afficher un message de confirmation
      present({
        message: "Mission supprimée avec succès",
        duration: 2000,
        color: "success",
      });

      // Fermer le modal si ouvert
      if (modalIsOpen) {
        closeModal();
      }
    } catch (error) {
      console.error("Erreur lors de la suppressions :", error);
      present({
        message: "Erreur lors de la suppression de la mission",
        duration: 2000,
        color: "danger",
      });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mes Incidents Acceptés</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "50%",
            }}
          >
            <IonSpinner name="crescent" />
          </div>
        ) : incidents.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <p>Aucun incident accepté pour l'instant.</p>
          </div>
        ) : (
          <IonList>
            {incidents.map((incident) => (
              <IonItem key={incident.id}>
                <IonLabel>
                  <h2>{incident.titre}</h2>
                  <p>
                    <strong>Date :</strong>{" "}
                    {new Date(incident.date_insertion).toLocaleDateString()}
                  </p>
                </IonLabel>
                <IonButton onClick={() => openModal(incident)} color="primary">
                  Voir Détails
                </IonButton>
                <IonButton
                  onClick={(e) => confirmDelete(incident.id, e)}
                  color="danger"
                  fill="clear"
                >
                  <IonIcon slot="icon-only" icon={trash} />
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonModal
          isOpen={modalIsOpen}
          onDidDismiss={closeModal}
          initialBreakpoint={0.5}
          breakpoints={[0, 0.5, 0.9]}
          handleBehavior="cycle"
        >
          {selectedIncident && (
            <IonContent className="ion-padding">
              <Details
                incident={selectedIncident}
                onClose={closeModal}
                showAcceptButton={false}
              />
              <IonButton
                onClick={() => confirmDelete(selectedIncident.id)}
                color="danger"
                expand="block"
                style={{ marginTop: "16px" }}
              >
                Supprimer cette mission
              </IonButton>
            </IonContent>
          )}
        </IonModal>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Confirmation"
          message="Êtes-vous sûr de vouloir supprimer votre mission ?"
          buttons={[
            {
              text: "Annuler",
              role: "cancel",
              handler: () => {
                setIncidentToDelete(null);
              },
            },
            {
              text: "Supprimer",
              role: "confirm",
              handler: () => {
                if (incidentToDelete !== null) {
                  deleteIncident(incidentToDelete);
                  setIncidentToDelete(null);
                }
              },
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default MesIncidents;
