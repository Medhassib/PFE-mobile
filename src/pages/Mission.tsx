// imports
import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { star, starOutline, checkmarkCircle } from "ionicons/icons";
import Details from "../components/Details";
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
  IonButton,
  IonModal,
  IonIcon,
  IonButtons,
  useIonToast,
  IonAlert,
} from "@ionic/react";

interface Incident {
  id: number;
  titre: string;
  description: string;
  date_insertion: string;
  adresse: string;
  id_incident: number;
  telephone: string;
  accepted_by: boolean;
  status: string;
  date_acceptation?: string;
}

const Mission: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [present] = useIonToast();
  const [showAlert, setShowAlert] = useState(false);
  const [incidentToAccept, setIncidentToAccept] = useState<number | null>(null);

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );
  const [favoris, setFavoris] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchFavoris();
    fetchIncidents();
  }, []);

  const fetchFavoris = async () => {
    try {
      const response = await api.get("/techniciens/favoris/reload");
      const favorisIds = response.data.favoris;
      const favorisMap: { [key: number]: boolean } = {};
      favorisIds.forEach((id: number) => {
        favorisMap[id] = true;
      });

      setFavoris(favorisMap);
    } catch (error) {
      console.error("Erreur de chargement des favoris :", error);
    }
  };

  const fetchIncidents = async () => {
    try {
      const response = await api.get("/techniciens/incident/lister");
      // Ne pas filtrer les incidents acceptés, les garder tous dans la liste
      setIncidents(response.data.incidents);
    } catch (error) {
      console.error("Erreur de chargement :", error);
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
  const toggleFavori = async (id_incident: number) => {
    if (favoris[id_incident]) {
      // Si déjà favori => Supprimer
      try {
        await api.delete(`/techniciens/favoris/${id_incident}`);

        setFavoris((prev) => {
          const updated = { ...prev };
          delete updated[id_incident];
          return updated;
        });
        present({
          message: " Mission supprimeé  avec succès",
          duration: 2000,
          color: "warning",
        });
      } catch (error) {
        console.error("Erreur suppression favori :", error);
      }
    } else {
      // Sinon => Ajouter
      try {
        await api.post("/techniciens/favoris", { id_incident });

        setFavoris((prev) => ({
          ...prev,
          [id_incident]: true,
        }));
        present({
          message: "Mission ajouteé avec succès",
          duration: 2000,
          color: "success",
        });
      } catch (error) {
        console.error("Erreur ajout favori :", error);
      }
    }
  };

  // Fonction pour ouvrir l'alerte de confirmation
  const confirmAcceptIncident = (incidentId: number) => {
    setIncidentToAccept(incidentId);
    setShowAlert(true);
  };

  const acceptIncident = async (incidentId: number) => {
    try {
      // Mettre à jour l'état localement AVANT l'appel API pour une réponse immédiate de l'UI
      setSelectedIncident((prev) => {
        if (prev && prev.id === incidentId) {
          return {
            ...prev,
            accepted_by: true,
            status: "IN_PROGRESS",
            date_acceptation: new Date().toISOString(),
          };
        }
        return prev;
      });

      // Mettre également à jour la liste des incidents sans supprimer l'incident accepté
      setIncidents((prevIncidents) =>
        prevIncidents.map((incident) =>
          incident.id === incidentId
            ? {
                ...incident,
                accepted_by: true,
                status: "IN_PROGRESS",
                date_acceptation: new Date().toISOString(),
              }
            : incident
        )
      );

      // Ensuite, faire l'appel API avec le statut "IN_PROGRESS"
      await api.put(`/techniciens/incident/${incidentId}/accept`, {
        status: "IN_PROGRESS"
      });

      // Afficher un message de confirmation
      present({
        message: "Mission acceptée avec succès",
        duration: 2000,
        color: "success",
      });

      // Ne pas fermer le modal automatiquement pour que l'utilisateur puisse voir le changement
      // L'utilisateur fermera le modal manuellement
    } catch (error) {
      console.error("Erreur acceptation :", error);

      // En cas d'erreur, annuler les changements locaux
      setSelectedIncident((prev) => {
        if (prev && prev.id === incidentId) {
          return {
            ...prev,
            accepted_by: false,
            status: "PENDING",
            date_acceptation: "",
          };
        }
        return prev;
      });

      setIncidents((prevIncidents) =>
        prevIncidents.map((incident) =>
          incident.id === incidentId
            ? {
                ...incident,
                accepted_by: false,
                status: "PENDING",
                date_acceptation: "",
              }
            : incident
        )
      );

      present({
        message: "Erreur lors de l'acceptation de la mission",
        duration: 2000,
        color: "danger",
      });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Missions</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {loading ? (
          <IonSpinner name="crescent" />
        ) : (
          <IonList>
            {incidents.map((incident) => {
              const isAccepted =
                incident.accepted_by === true ||
                incident.status === "IN_PROGRESS";

              return (
                <IonItem
                  key={incident.id}
                  className={isAccepted ? "accepted-mission" : ""}
                >
                  <IonLabel>
                    <h2>{incident.titre}</h2>
                    <p>{incident.description}</p>
                    <p>
                      <strong>Date :</strong>{" "}
                      {new Date(incident.date_insertion).toLocaleDateString()}
                    </p>
                    {isAccepted && (
                      <p className="status-tag">
                        <IonIcon icon={checkmarkCircle} color="success" />{" "}
                        Acceptée
                      </p>
                    )}
                  </IonLabel>
                  <IonButton
                    onClick={() => openModal(incident)}
                    color="primary"
                  >
                    Voir Détails
                  </IonButton>
                </IonItem>
              );
            })}
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
            <Details
              incident={selectedIncident}
              onClose={closeModal}
              isFavorite={favoris[selectedIncident.id]}
              onToggleFavorite={toggleFavori}
              onAccept={acceptIncident}
              confirmAccept={confirmAcceptIncident}
              showAcceptButton={true}
            />
          )}
        </IonModal>
      </IonContent>
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        cssClass="accept-alert custom-alert"
        header="Confirmation"
        message="Êtes-vous sûr de vouloir accepter cette mission ?"
        buttons={[
          {
            text: "Annuler",
            role: "cancel",
            cssClass: "alert-button-cancel",
            handler: () => {
              setIncidentToAccept(null);
            },
          },
          {
            text: "Accepter",
            cssClass: "alert-button-confirm",
            handler: () => {
              if (incidentToAccept !== null) {
                acceptIncident(incidentToAccept);
                setIncidentToAccept(null);
              }
            },
          },
        ]}
      />
    </IonPage>
  );
};

export default Mission;
