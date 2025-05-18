import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonFooter,
  IonSpinner,
  useIonToast,
  IonBackButton,
  IonButtons,
  IonIcon,
} from "@ionic/react";
import { paperPlane } from "ionicons/icons";
import { useEffect, useState, useRef } from "react";
import api from "../utils/api";
import "./Message.css";

interface Message {
  id: number;
  content: string;
  sender_type: "admin" | "technicien";
  sender_id: number;
  discussion_id: number;
  created_at: string;
  status: "sent" | "delivered" | "read";
}

const MessagePage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [discussionId, setDiscussionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [present] = useIonToast();

  const recipientId = 66; // ID de l'admin par défaut
  const contentRef = useRef<HTMLIonContentElement>(null);

  // Fonction pour récupérer les messages d'une discussion
  const fetchMessages = async (id: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/techniciens/messages/${id}`);

      if (res.data.success) {
        setMessages(res.data.messages || []);
      }
    } catch (error) {
      console.error("Erreur chargement messages:", error);
      present({
        message: "Erreur lors du chargement des messages",
        duration: 2000,
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour envoyer un message (crée la discussion si besoin)
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const res = await api.post("/techniciens/send-message", {
        content: newMessage,
        recipient_id: recipientId,
        sender_role: "technicien",
      });

      if (res.data.success) {
        const sentMessage = res.data.data.message;
        const discId = res.data.data.discussion_id;

        // Si c'est la première fois qu'on obtient un ID de discussion, on le sauvegarde
        if (discussionId === null) {
          setDiscussionId(discId);
          // Charger tous les messages après avoir obtenu l'ID de discussion
          fetchMessages(discId);
        } else if (discId !== discussionId) {
          // Si l'ID de discussion a changé, on met à jour et on charge les messages
          setDiscussionId(discId);
          fetchMessages(discId);
        } else {
          // Sinon on ajoute simplement le message à la liste existante
          setMessages((prev) => [...prev, sentMessage]);
        }

        setNewMessage("");

        // Scroll to bottom after sending
        setTimeout(() => {
          contentRef.current?.scrollToBottom(300);
        }, 100);
      }
    } catch (error: any) {
      console.error("Erreur envoi message:", error);
      present({
        message:
          error.response?.data?.message || "Erreur lors de l'envoi du message",
        duration: 2000,
        color: "danger",
      });
    } finally {
      setSending(false);
    }
  };

  // Au chargement de la page, vérifier s'il existe une discussion avec l'admin
  useEffect(() => {
    const checkExistingDiscussion = async () => {
      try {
        // Vérifier s'il existe une discussion avec l'admin
        const res = await api.get(
          `/techniciens/discussions/admin/${recipientId}`
        );

        if (res.data.success && res.data.discussion) {
          // Si une discussion existe, définir l'ID et charger les messages
          setDiscussionId(res.data.discussion.id);
        } else {
          // Si aucune discussion n'existe, définir loading à false
          setLoading(false);
        }
      } catch (error) {
        console.error("Erreur vérification discussion:", error);
        setLoading(false);
      }
    };

    checkExistingDiscussion();
  }, [recipientId]);

  // Au chargement, si discussionId connu, on charge les messages
  useEffect(() => {
    if (discussionId !== null) {
      fetchMessages(discussionId);
    }
  }, [discussionId]);

  // Scroll automatique en bas à chaque nouveau message
  useEffect(() => {
    if (contentRef.current && messages.length > 0) {
      contentRef.current.scrollToBottom(300);
    }
  }, [messages]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start"></IonButtons>
          <IonTitle>Discussion avec Admin</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent ref={contentRef} className="ion-padding">
        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Chargement des messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-message-container">
            <p>Aucun message. Commencez la conversation!</p>
          </div>
        ) : (
          <IonList>
            {messages.map((msg) => (
              <IonItem
                key={msg.id}
                className={
                  msg.sender_type === "technicien"
                    ? "my-message"
                    : "their-message"
                }
                lines="none"
              >
                <IonLabel className="message-bubble">
                  <p className="sender-name">
                    {msg.sender_type === "technicien" ? "Vous" : "Admin"}
                  </p>
                  <p className="message-content">{msg.content}</p>
                  <p className="message-time">
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <div className="message-input-container">
            <IonInput
              placeholder="Votre message..."
              value={newMessage}
              onIonChange={(e) => setNewMessage(e.detail.value!)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="message-input"
              disabled={sending}
            />
            <IonButton
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              className="send-button"
            >
              {sending ? (
                <IonSpinner name="dots" />
              ) : (
                <IonIcon icon={paperPlane} />
              )}
            </IonButton>
          </div>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default MessagePage;
