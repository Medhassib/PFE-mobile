import React from "react";
import { Route } from "react-router-dom";
import TechnicienProfile from "../components/profil";
import Layout from "../components/Layout";
import PrivateRoute from "../pages/auth/PrivateRoute";
import Mission from "../pages/Mission";
import Favoris from "../pages/Favoris";
import MesIncidents from "../pages/MesIncidents";
import MessagePage from "../pages/Message";

const RouteTechnicien: React.FC = () => {
  return (
    <>
      <PrivateRoute path="/profil">
        <Layout>
          <TechnicienProfile />
        </Layout>
      </PrivateRoute>

      <PrivateRoute path="/Mission">
        <Layout>
          <Mission />
        </Layout>
      </PrivateRoute>
      <PrivateRoute path="/Favoris">
        <Layout>
          <Favoris />
        </Layout>
      </PrivateRoute>
      <PrivateRoute path="/MesIncidents">
        <Layout>
          <MesIncidents />
        </Layout>
      </PrivateRoute>
      <PrivateRoute path="/message">
        <Layout>
          <MessagePage />
        </Layout>
      </PrivateRoute>
    </>
  );
};

export default RouteTechnicien;
