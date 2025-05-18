import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonAvatar,
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonIcon,
  IonImg,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonBackButton,
} from "@ionic/react";
import {
  mailOutline,
  callOutline,
  personCircleOutline,
  logoTwitter,
  globeOutline,
  logoFacebook,
  settingsOutline,
  chevronBackOutline,
} from "ionicons/icons";
import api from "../utils/api";
import "./profil.css";

const TechnicienProfile: React.FC = () => {
  const [profile, setProfile] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    file: null as string | null,
    role: "Technicien",
  });
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("auth/technicien/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        let imageUrl = response.data.file;

        if (response.data.file && typeof response.data.file === "object") {
          imageUrl = URL.createObjectURL(new Blob([response.data.file]));
        }

        setProfile({
          ...response.data,
          role: "Technicien",
          file: imageUrl,
        });
      } catch (err) {
        console.error("Erreur de chargement:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();

    return () => {
      if (profile.file) {
        URL.revokeObjectURL(profile.file);
      }
    };
  }, []);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <IonPage>
      <IonHeader className="profile-header-nav">
        <IonToolbar>
          <IonButtons slot="end"></IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="profile-content">
        {/* Header avec avatar et statistiques */}
        <div className="profile-header-new">
          <div className="profile-avatar-container">
            <IonAvatar className="profile-avatar-new">
              {profile.file && !imageError ? (
                <IonImg
                  src={profile.file}
                  alt={`${profile.prenom} ${profile.nom}`}
                  onIonError={handleImageError}
                />
              ) : (
                <div className="default-avatar">
                  <IonIcon icon={personCircleOutline} />
                </div>
              )}
            </IonAvatar>

            <div className="profile-info">
              <h2 className="profile-name-new">
                {profile.prenom} {profile.nom}
              </h2>
              <p className="profile-role">{profile.role}</p>
            </div>

            <div className="profile-stats-new">
              <div className="stat-item-new"></div>
              <div className="stat-item-new"></div>
            </div>
          </div>
        </div>

        {/* Liste des informations de contact */}
        <div className="profile-details-new">
          <IonList lines="full">
            <IonItem className="contact-item">
              <IonIcon
                icon={mailOutline}
                slot="start"
                className="contact-icon"
              />
              <IonLabel>
                <p className="contact-label">Email</p>
                <h3 className="contact-value">{profile.email}</h3>
              </IonLabel>
            </IonItem>

            <IonItem className="contact-item">
              <IonIcon
                icon={callOutline}
                slot="start"
                className="contact-icon"
              />
              <IonLabel>
                <p className="contact-label">Téléphone</p>
                <h3 className="contact-value">{profile.telephone}</h3>
              </IonLabel>
            </IonItem>

            <IonItem className="contact-item"></IonItem>
          </IonList>
        </div>

        <IonLoading isOpen={loading} message={"Chargement..."} />
      </IonContent>
    </IonPage>
  );
};

export default TechnicienProfile;
