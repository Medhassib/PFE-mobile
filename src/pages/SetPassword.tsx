import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
  useIonToast,
  IonLoading,
  IonIcon,
} from "@ionic/react";
import { useHistory, useLocation } from "react-router-dom";
import { eyeOffOutline, eyeOutline } from "ionicons/icons";
import axios from "axios";
import "./SetPassword.css";
import api from "../utils/api";

const SetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [present] = useIonToast();
  const history = useHistory();
  const location = useLocation();

  // Récupérer le token depuis l'URL
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      present({
        message: "Token invalide ou manquant",
        duration: 3000,
        color: "danger",
      });
      return;
    }

    if (password.length < 8) {
      present({
        message: "Le mot de passe doit contenir au moins 8 caractères",
        duration: 3000,
        color: "danger",
      });
      return;
    }

    if (password !== confirmPassword) {
      present({
        message: "Les mots de passe ne correspondent pas",
        duration: 3000,
        color: "danger",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("auth/technicien/set-password", {
        token,
        password,
      });

      if (response.status === 200) {
        present({
          message:
            "Mot de passe défini avec succès. Vous pouvez maintenant vous connecter.",
          duration: 3000,
          color: "success",
        });
        history.push("/login");
      }
    } catch (error) {
      let errorMessage = "Erreur lors de la mise à jour du mot de passe";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      present({
        message: errorMessage,
        duration: 3000,
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Définir votre mot de passe</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="password-container">
          <IonText color="medium">
            <h2 className="welcome-text">Bienvenue</h2>
            <p className="instruction-text">
              Veuillez définir votre mot de passe pour activer votre compte.
            </p>
          </IonText>

          <form onSubmit={handleSubmit}>
            <IonItem className="password-input" lines="full">
              <IonLabel position="floating">Nouveau mot de passe</IonLabel>
              <IonInput
                type={showPassword ? "text" : "password"}
                value={password}
                onIonChange={(e) => setPassword(e.detail.value!)}
                required
                minlength={8}
              />
              <IonButton
                fill="clear"
                slot="end"
                onClick={() => setShowPassword(!showPassword)}
              >
                <IonIcon
                  icon={showPassword ? eyeOutline : eyeOffOutline}
                  slot="icon-only"
                />
              </IonButton>
            </IonItem>

            <IonItem className="password-input" lines="full">
              <IonLabel position="floating">Confirmer le mot de passe</IonLabel>
              <IonInput
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onIonChange={(e) => setConfirmPassword(e.detail.value!)}
                required
                minlength={8}
              />
              <IonButton
                fill="clear"
                slot="end"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <IonIcon
                  icon={showPassword ? eyeOutline : eyeOffOutline}
                  slot="icon-only"
                />
              </IonButton>
            </IonItem>

            <div className="password-requirements">
              <IonText color="medium">
                <p>Le mot de passe doit contenir au moins 8 caractères.</p>
              </IonText>
            </div>

            <IonButton
              expand="block"
              type="submit"
              className="submit-button"
              disabled={loading || !password || !confirmPassword}
            >
              Définir le mot de passe
            </IonButton>
          </form>
        </div>
      </IonContent>
      <IonLoading isOpen={loading} message="Mise à jour du mot de passe..." />
    </IonPage>
  );
};

export default SetPassword;
