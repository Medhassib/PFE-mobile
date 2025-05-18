import {
  IonContent,
  IonPage,
  IonInput,
  IonButton,
  IonIcon,
  IonText,
} from "@ionic/react";
import { personOutline, lockClosedOutline } from "ionicons/icons";
import "./Login.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import api from "../../utils/api";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const history = useHistory();

  const validateForm = () => {
    let valid = true;

    if (!email) {
      setEmailError("Veuillez entrer votre email.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Veuillez entrer votre mot de passe.");
      valid = false;
    } else {
      setPasswordError("");
    }

    return valid;
  };
  useEffect(() => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }, []);

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const response = await api.post("auth/technicien/login", {
        email,
        password,
      });

      const { token } = response.data;
      localStorage.setItem("token", token);
      history.push("/profil");
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 401) {
          setError("Identifiants incorrects.");
        } else if (err.response.status === 403) {
          setError("Compte en attente de validation.");
        } else {
          setError("Erreur inconnue.");
        }
      } else {
        setError("Erreur de connexion au serveur.");
      }
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="login-content">
        <div className="wave-container">
          <div className="login-container">
            <h1 className="login-title">Log In</h1>

            <div className="input-group">
              <IonIcon icon={personOutline} className="input-icon" />

              <IonInput
                placeholder="Email"
                className="custom-input"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value!)}
              />
            </div>
            {emailError && (
              <IonText color="danger" className="error-text">
                {emailError}
              </IonText>
            )}

            <div className="input-group2">
              <IonIcon icon={lockClosedOutline} className="input-icon" />
              <IonInput
                type="password"
                placeholder="Mot de passe"
                className="custom-input"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value!)}
              />
            </div>
            {passwordError && (
              <IonText color="danger" className="error-text">
                {passwordError}
              </IonText>
            )}
            <IonText
              className="forgot-password"
              onClick={() => history.push("/forgot-password")}
            >
              <a href="/forgot-password" className="forgot">
                Mot de passe oublié ?
              </a>
            </IonText>

            {error && (
              <IonText color="danger" className="error-text">
                {error}
              </IonText>
            )}

            <IonButton
              expand="block"
              className="login-buttonS"
              onClick={handleLogin}
              fill="clear" // Désactive le style rempli par défaut
              style={{}}
            >
              Se Connecter
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
