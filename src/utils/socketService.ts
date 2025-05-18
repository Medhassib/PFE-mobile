import { io, Socket } from "socket.io-client";
import api from "./api";

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("token");
  }

  connect() {
    if (!this.socket) {
      // Récupérer l'URL de base de l'API
      const apiUrl = api.defaults.baseURL || "";
      const baseUrl = apiUrl.replace("/api", ""); // Supprimer "/api" si présent

      this.socket = io(baseUrl, {
        auth: {
          token: this.token
        },
        transports: ["websocket", "polling"]
      });

      console.log("Socket connecté");
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("Socket déconnecté");
    }
  }

  getSocket() {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }
}

export default new SocketService();