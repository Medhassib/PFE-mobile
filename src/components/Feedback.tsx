import React, { useState, useRef } from "react";
import {
  IonButton,
  IonIcon,
  IonLabel,
  IonItem,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonImg,
  IonGrid,
  IonRow,
  IonCol,
  useIonToast,
} from "@ionic/react";
import { trash, camera } from "ionicons/icons";
import SignatureCanvas from "react-signature-canvas";
import "./Feedback.css";
import api from "../utils/api";

interface FeedbackProps {
  incidentId: number;
  onSubmitSuccess: () => void;
}

const Feedback: React.FC<FeedbackProps> = ({ incidentId, onSubmitSuccess }) => {
  const [feedback, setFeedback] = useState("");
  const [statusFeedback, setStatusFeedback] = useState<string>("en_cours");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null); // ✅ pour le fichier brut
  const [signature, setSignature] = useState<string | null>(null);
  const [present] = useIonToast();

  const sigCanvas = useRef<SignatureCanvas>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPhotoFile(file); // ✅ sauvegarde pour FormData

      // Juste pour affichage
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setPhoto(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setSignature(null);
    }
  };

  const saveSignature = () => {
    if (sigCanvas.current) {
      const dataURL = sigCanvas.current.toDataURL("image/png");
      setSignature(dataURL);
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("description", feedback);
      formData.append("statut_mission", statusFeedback);

      if (photoFile) {
        formData.append("file", photoFile); // ✅ photo en fichier brut
      }
      console.log(photoFile);
      if (signature) {
        formData.append("signature", signature); // ✅ signature en base64
      }

      await api.post(`/techniciens/incident/${incidentId}/feedback`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Réinitialisation
      setFeedback("");
      setStatusFeedback("en_cours");
      setPhoto(null);
      setPhotoFile(null);
      setSignature(null);
      onSubmitSuccess();
    } catch (error) {
      console.error("Erreur lors de l'envoi du feedback:", error);
    }
    present({
      message: " le feedback est envoyé avec succès",
      duration: 2000,
      color: "success",
    });
  };

  return (
    <div className="feedback-container">
      <IonItem>
        <IonLabel position="stacked">Statut de la mission</IonLabel>
        <IonSelect
          value={statusFeedback}
          onIonChange={(e) => setStatusFeedback(e.detail.value)}
          interface="action-sheet"
        >
          <IonSelectOption value="en_cours">En cours</IonSelectOption>
          <IonSelectOption value="terminee">Terminée</IonSelectOption>
          <IonSelectOption value="probleme">Problème rencontré</IonSelectOption>
        </IonSelect>
      </IonItem>

      <IonItem>
        <IonLabel position="stacked">Commentaires</IonLabel>
        <IonTextarea
          value={feedback}
          onIonChange={(e) => setFeedback(e.detail.value!)}
          rows={4}
          placeholder="Décrivez votre expérience avec cette mission..."
        />
      </IonItem>

      {/* Section Photo */}
      <IonCard className="photo-section">
        <IonCardHeader>
          <IonCardTitle>Photo</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {photo ? (
            <div className="photo-container">
              <IonImg src={photo} alt="Photo de la mission" />
              <IonButton
                fill="clear"
                color="danger"
                onClick={() => {
                  setPhoto(null);
                  setPhotoFile(null);
                }}
              >
                <IonIcon icon={trash} slot="icon-only" />
              </IonButton>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept="image/*"
                id="file-input"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <IonButton
                expand="block"
                onClick={() => document.getElementById("file-input")?.click()}
                color="secondary"
              >
                <IonIcon icon={camera} slot="start" />
                Ajouter une photo
              </IonButton>
            </div>
          )}
        </IonCardContent>
      </IonCard>

      {/* Section Signature */}
      <IonCard className="signature-section">
        <IonCardHeader>
          <IonCardTitle>Signature</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div className="signature-container">
            {signature ? (
              <div className="saved-signature">
                <IonImg src={signature} alt="Signature" />
                <IonButton
                  fill="clear"
                  color="danger"
                  onClick={() => setSignature(null)}
                >
                  <IonIcon icon={trash} slot="icon-only" />
                </IonButton>
              </div>
            ) : (
              <>
                <div className="signature-pad-container">
                  <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{
                      className: "signature-pad",
                      width: 300,
                      height: 150,
                    }}
                  />
                </div>
                <IonGrid>
                  <IonRow>
                    <IonCol>
                      <IonButton
                        expand="block"
                        color="medium"
                        onClick={clearSignature}
                      >
                        Effacer
                      </IonButton>
                    </IonCol>
                    <IonCol>
                      <IonButton
                        expand="block"
                        color="primary"
                        onClick={saveSignature}
                      >
                        Sauvegarder
                      </IonButton>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </>
            )}
          </div>
        </IonCardContent>
      </IonCard>

      <IonButton
        expand="block"
        onClick={handleFeedbackSubmit}
        className="submit-feedback-button"
        color="primary"
        style={{ marginTop: "20px" }}
      >
        Soumettre
      </IonButton>
    </div>
  );
};

export default Feedback;
function present(arg0: { message: string; duration: number; color: string }) {
  throw new Error("Function not implemented.");
}
