import React, { useState, useEffect } from "react";
import api from "../utils/api";
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonFooter,
  IonMenu,
  IonList,
  IonItem,
  IonLabel,
  IonMenuButton,
  useIonRouter,
  IonAvatar,
} from "@ionic/react";
import {
  home,
  search,
  add,
  notifications,
  mail,
  person,
  settings,
  logOut,
  star,
  chatboxEllipses,
} from "ionicons/icons";
import "./Layout.css";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ionRouter = useIonRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState({
    nom: "",
    prenom: "",
    file: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("auth/technicien/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (error) {
        console.error("Erreur chargement profil:", error);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleRouteChange = () => setIsMenuOpen(false);
    window.addEventListener("ionRouteDidChange", handleRouteChange);
    return () => {
      window.removeEventListener("ionRouteDidChange", handleRouteChange);
    };
  }, []);

  return (
    <>
      <IonMenu
        contentId="main"
        side="start"
        type="overlay"
        style={{ "--background": "#ffffff" }}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="profile-section">
            <IonAvatar className="menu-avatar">
              {profile.file ? (
                <img src={profile.file} alt="Profil" />
              ) : (
                <div className="avatar-placeholder">
                  {profile.prenom.charAt(0)}
                  {profile.nom.charAt(0)}
                </div>
              )}
            </IonAvatar>
            <p className="menu-name">
              {profile.prenom} {profile.nom}
            </p>
          </div>

          <IonList lines="none" className="ion-no-padding">
            <IonItem button routerLink="/profil" routerDirection="root">
              <IonIcon slot="start" icon={person} />
              <IonLabel>Profil</IonLabel>
            </IonItem>

            <IonItem button routerLink="/message" routerDirection="root">
              <IonIcon slot="start" icon={chatboxEllipses} />
              <IonLabel>Messages</IonLabel>
            </IonItem>
            <IonItem button routerLink="/mission" routerDirection="root">
              <IonIcon slot="start" icon={settings} />
              <IonLabel>Missions</IonLabel>
            </IonItem>
            <IonItem button routerLink="/Mesincidents" routerDirection="root">
              <IonIcon slot="start" icon={settings} />
              <IonLabel>Mes Missions</IonLabel>
            </IonItem>
            <IonItem button routerLink="/favoris" routerDirection="root">
              <IonIcon slot="start" icon={star} />
              <IonLabel>Favoris</IonLabel>
            </IonItem>
            <IonItem
              button
              onClick={() => {
                document.querySelector("ion-menu")?.close();
                localStorage.clear(); // Vide complètement le localStorage
                ionRouter.push("/login", "root");
              }}
            >
              <IonIcon slot="start" icon={logOut} />
              <IonLabel>Déconnexion</IonLabel>
            </IonItem>
          </IonList>
        </IonContent>
      </IonMenu>

      <div id="main" className="main-container">
        <IonHeader className="ion-no-border">
          <IonToolbar
            style={{ height: "56px", padding: "0px 40px" }}
            color="light"
          >
            <IonButtons slot="start">
              <IonMenuButton
                autoHide={false}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              />
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="main-content">{children}</IonContent>
      </div>
    </>
  );
};

export default Layout;
