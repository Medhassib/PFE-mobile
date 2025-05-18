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
  useIonToast,
} from "@ionic/react";
import api from "../utils/api";
import Details from "../components/Details";
interface Incident {
  id: number;
  titre: string;
  description: string;
  date_insertion: string;
  adresse: string;
  id_incident?: number; // Ajouté pour correspondre à Mission.tsx
  telephone: string;
  nom: string;
  code_postal: string;
  date_acceptation: string;
}

const Favoris: React.FC = () => {
  const [favoris, setFavoris] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );
  const [favorisMap, setFavorisMap] = useState<{ [key: number]: boolean }>({});
  const [present] = useIonToast();

  useEffect(() => {
    fetchFavorisMap();
    fetchFavoris();
  }, []);

  const fetchFavorisMap = async () => {
    try {
      const response = await api.get("/techniciens/favoris/reload");
      const favorisIds = response.data.favoris;
      const favorisMap: { [key: number]: boolean } = {};
      favorisIds.forEach((id: number) => {
        favorisMap[id] = true;
      });

      setFavorisMap(favorisMap);
    } catch (error) {
      console.error("Erreur de chargement des favoris :", error);
    }
  };

  const fetchFavoris = async () => {
    try {
      const response = await api.get("/techniciens/favoris/afficher");
      setFavoris(response.data.favoris);
    } catch (error) {
      console.error("Erreur chargement favoris :", error);
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
    try {
      // Supprimer des favoris
      await api.delete(`/techniciens/favoris/${id_incident}`);

      // Mettre à jour la liste des favoris en retirant l'incident
      setFavoris((prev) =>
        prev.filter((incident) => incident.id !== id_incident)
      );

      // Mettre à jour la map des favoris
      setFavorisMap((prev) => {
        const updated = { ...prev };
        delete updated[id_incident];
        return updated;
      });

      // Fermer le modal si l'incident affiché est celui qui vient d'être supprimé
      closeModal();
    } catch (error) {
      console.error("Erreur suppression favori :", error);
    }
    present({
      message: " Mission supprimeé  avec succès",
      duration: 2000,
      color: "warning",
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mes Favoris</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {loading ? (
          <IonSpinner name="crescent" />
        ) : favoris.length === 0 ? (
          <div className="ion-padding ion-text-center">
            <p>Aucun favori pour le moment</p>
          </div>
        ) : (
          <IonList>
            {favoris.map((incident) => (
              <IonItem key={incident.id}>
                <IonLabel>
                  <h2>{incident.titre}</h2>
                  <p>{incident.description}</p>
                  <p>
                    <strong>Date :</strong>{" "}
                    {new Date(incident.date_insertion).toLocaleDateString()}
                  </p>
                </IonLabel>
                <IonButton onClick={() => openModal(incident)} color="primary">
                  Voir Détails
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
            <Details
              incident={selectedIncident}
              onClose={closeModal}
              isFavorite={true}
              onToggleFavorite={toggleFavori}
              showAcceptButton={false}
            />
          )}
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Favoris;
function present(arg0: { message: string; duration: number; color: string }) {
  throw new Error("Function not implemented.");
}
