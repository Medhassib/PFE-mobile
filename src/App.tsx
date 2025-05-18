import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

import Splash from "./pages/Splash"; // ← import Splash
import Login from "./pages/auth/Login";
import SetPassword from "./pages/SetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import TechnicienProfile from "./components/profil";
import PrivateRoute from "./pages/auth/PrivateRoute";
import Layout from "./components/Layout";
import RouteTechnicien from "./routes/routesTechnicien";

/* Ionic core + CSS */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/palettes/dark.system.css";

import "./theme/variables.css";
import "./theme/custom-alerts.css"; // Import des styles personnalisés pour les alertes

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        {/* 1. Splash screen */}
        <Route exact path="/splash" component={Splash} />

        {/* 2. Redirection initiale vers Splash */}
        <Route exact path="/" render={() => <Redirect to="/splash" />} />

        {/* 3. Routes publiques */}
        <Route exact path="/login" component={Login} />
        <Route exact path="/Set-Password" component={SetPassword} />
        <Route exact path="/forgot-password" component={ForgotPassword} />

        {/* 4. Routes privées (technicien) */}
        <RouteTechnicien />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
