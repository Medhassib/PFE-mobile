import React, { useState } from "react";
import api from "../utils/api";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonButton,
  IonText,
  useIonToast,
  IonLoading,
  IonButtons,
  IonBackButton,
  IonIcon,
} from "@ionic/react";
import { arrowBack } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import axios from "axios";
import "./ForgotPassword.css";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [present] = useIonToast();
  const history = useHistory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      present({
        message: "Veuillez entrer votre adresse e-mail",
        duration: 3000,
        color: "danger",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("auth/reset-password-technicien", {
        email,
      });

      present({
        message: response.data.message || "Lien envoyé avec succès",
        duration: 3000,
        color: "success",
      });
    } catch (error) {
      let errorMessage = "Erreur lors de l'envoi de l'email";

      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data;
        errorMessage = data.message || data.errors?.[0]?.msg || errorMessage;
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

  const goBack = () => {
    history.goBack();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton
              defaultHref="/login"
              className="forgot-back-button"
              text=""
            />
          </IonButtons>
          <IonTitle>Mot de passe oublié</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding forgot-password-container">
        <form onSubmit={handleSubmit} className="forgot-form">
          <IonText>
            <h2 className="forgot-title">Réinitialisation</h2>
            <p className="forgot-description">
              Entrez votre adresse e-mail pour recevoir un lien de
              réinitialisation.
            </p>
          </IonText>

          <IonItem lines="full" className="forgot-input-item">
            <IonLabel position="floating" className="forgot-input-label">
              Adresse e-mail
            </IonLabel>
            <IonInput
              type="email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
              required
              className="forgot-input"
              placeholder="email"
            />
          </IonItem>

          <IonButton
            expand="block"
            type="submit"
            className="forgot-submit-button"
            disabled={loading}
          >
            Envoyer le lien
          </IonButton>
        </form>

        <IonLoading
          isOpen={loading}
          message="Envoi en cours..."
          className="forgot-loading"
        />
      </IonContent>
    </IonPage>
  );
};

export default ForgotPassword;
