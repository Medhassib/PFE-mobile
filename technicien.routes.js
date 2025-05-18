import express from "express";
import Technicien from "../models/Technicien.js";
import upload from "../middleware/upload.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import transporter from "../config/mailer.js";
import Verification from "../models/Verification.js";
import { verifyToken } from "../middleware/auth.js";
import Favoris from "../models/Favoris.js";
import TechnicienIncident from "../models/TechnicienIncident.js";
import { Admin, Discussion, Message } from "../models/index.js";
const router = express.Router();
import Incident from "../models/Incident.js"; // Assure-toi d'importer le modèle Incident
import Feedback from "../models/Feedback.js";
// Get all techniciens
router.get("/", async (req, res) => {
  try {
    const techniciens = await Technicien.findAll();
    res.json(techniciens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Ajoutez cette route dans votre backend (techniciens.js)
// Dans votre fichier de routes techniciens

// Get technicien by ID
router.get("/:id", async (req, res) => {
  try {
    const technicien = await Technicien.findByPk(req.params.id);
    if (!technicien) {
      return res.status(404).json({ message: "Technicien not found cc" });
    }
    res.json(technicien);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create technicien
router.post("/", async (req, res) => {
  try {
    const technicien = await Technicien.create(req.body);
    res.status(201).json(technicien);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update technicien
router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    const technicien = await Technicien.findByPk(req.params.id);
    if (!technicien) {
      return res.status(404).json({ message: "Technicien not found" });
    }
    // Si un nouveau mot de passe est fourni, le hacher
    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      req.body.password = hashedPassword;
    }
    // Mettre à jour le technicien avec les nouvelles données (email, nom, téléphone, etc.)
    await technicien.update(req.body);
    // Si un fichier est uploadé, envoyer ce fichier à Cloudinary
    if (req.file) {
      technicien.file = req.file.path;
      await technicien.save();
    }
    res.json({
      message: "Technicien updated successfully",
      technicien,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete technicien
router.delete("/:id", async (req, res) => {
  try {
    const technicien = await Technicien.findByPk(req.params.id);
    if (!technicien) {
      return res.status(404).json({ message: "Technicien not found" });
    }
    await technicien.destroy();
    res.json({ message: "Technicien deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/incident-affecter", async (req, res) => {
  try {
    const { idTechnicien, idIncident } = req.body;
    if ((!idIncident, !idTechnicien)) {
      return res.status(400).json({ message: "parametre null" });
    }
    const technicien = await Technicien.findByPk(idTechnicien);
    if (!technicien) {
      return res.status(400).json({ message: error.message });
    }
    const incident = await Incident.findByPk(idIncident);
    if (!incident) {
      return res.status(400).json({ message: error.message });
    }
    await incident.update({
      id_technicien: idTechnicien,
      accepted_by: true,
    });
    await technicien.update({
      disponibilite: true,
    });
    res.json({ message: "Mission affecter " });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/incident/Lister", verifyToken, async (req, res) => {
  try {
    const technicien = await Technicien.findByPk(req.user.id);
    if (!technicien) {
      return res.status(400).json({ message: "Technicien introuvable" }); // ✅
    }
    const incidents = await Incident.findAll({
      where: {
        code_postal: technicien.code_postal,
      },
    });
    res.json({ message: "Mission afficher", incidents });
  } catch (error) {
    res.status(500).json({ message: "incidents error" });
  }
});

// route PUT pour accepter l'incident

router.post("/favoris", verifyToken, async (req, res) => {
  const { id_incident } = req.body;
  const id_technicien = req.user?.id;

  try {
    const alreadyExist = await Favoris.findOne({
      where: { id_incident, id_technicien },
    });

    if (alreadyExist) {
      return res.status(400).json({ message: "Déjà dans les favoris" });
    }

    const favori = await Favoris.create({
      id_incident,
      id_technicien,
      date_ajout: new Date(),
    });

    return res.status(200).json({ message: "Ajouté aux favoris", favori });
  } catch (error) {
    console.error("❌ Erreur dans /favoris :", error);
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/favoris/:id_incident", verifyToken, async (req, res) => {
  const { id_incident } = req.params;
  const id_technicien = req.user?.id;

  try {
    const favori = await Favoris.findOne({
      where: { id_incident, id_technicien },
    });

    if (!favori) {
      return res.status(404).json({ message: "Favori non trouvé" });
    }

    await favori.destroy();

    return res.status(200).json({ message: "Supprimé des favoris" });
  } catch (error) {
    console.error("❌ Erreur dans DELETE /favoris :", error);
    return res.status(500).json({ message: error.message });
  }
});
router.get("/favoris/reload", verifyToken, async (req, res) => {
  const id_technicien = req.user?.id;

  try {
    const favoris = await Favoris.findAll({
      where: { id_technicien },
      attributes: ["id_incident"],
    });

    const ids = favoris.map((f) => f.id_incident);

    return res.status(200).json({ favoris: ids });
  } catch (error) {
    console.error("❌ Erreur dans GET /favoris :", error);
    return res.status(500).json({ message: error.message });
  }
});
router.get("/favoris/afficher", verifyToken, async (req, res) => {
  const id_technicien = req.user?.id;

  try {
    // Récupérer tous les favoris du technicien avec les détails de l'incident
    const favoris = await Favoris.findAll({
      where: { id_technicien },
      include: [
        {
          model: Incident, // Assure-toi que ton modèle est bien relié
          as: "incident",
        },
      ],
    });

    // Formater la réponse pour extraire seulement les données de l'incident
    const incidentsFavoris = favoris.map((favori) => favori.incident);

    return res.status(200).json({ favoris: incidentsFavoris });
  } catch (error) {
    console.error("❌ Erreur dans GET /favoris :", error);
    return res.status(500).json({ message: error.message });
  }
});

router.put("/incident/:id/accept", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const id_technicien = req.user?.id; // Récupère l'ID du technicien connecté

    const incident = await Incident.findByPk(id);

    if (!incident) {
      return res.status(404).json({ message: "Incident non trouvé" });
    }

    // Marquer l'incident comme accepté
    incident.accepted_by = true;
    incident.id_technicien = id_technicien; // Associe le technicien à l'incident
    incident.date_acceptation = new Date();
    incident.etat = "ON_PROGRESS";
    await incident.save();
    // Créer une entrée dans la table TechnicienIncident
    await TechnicienIncident.create({
      id_technicien: id_technicien,
      id_incident: id,
      date_assignation: new Date(),
    });
    res.json({ message: "Incident accepté", incident });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/incidents/acceptes", verifyToken, async (req, res) => {
  const id_technicien = req.user?.id;

  try {
    const incidents = await TechnicienIncident.findAll({
      where: { id_technicien },
      include: [
        {
          model: Incident,
          as: "incident", // alias, voir association ci-dessous
        },
      ],
    });

    const result = incidents.map((entry) => entry.incident); // Extraire uniquement les incidents

    return res.status(200).json({ incidents: result });
  } catch (error) {
    console.error("❌ Erreur dans GET /incidents/acceptes :", error);
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/incidents/accepte/:id", verifyToken, async (req, res) => {
  const id_technicien = req.user?.id;
  const id_incident = req.params.id;

  try {
    // Supprimer l'entrée correspondante dans technicien_incident
    const deleted = await TechnicienIncident.destroy({
      where: {
        id_technicien,
        id_incident,
      },
    });

    if (deleted === 0) {
      return res
        .status(404)
        .json({ message: "Aucune mission trouvée pour suppression." });
    }

    // Optionnel : tu peux aussi réinitialiser l'incident dans la table Incident
    // Si tu veux que l'incident soit à nouveau "non affecté"
    await Incident.update(
      {
        accepted_by: false,
        id_technicien: null,
        date_acceptation: null,
        etat: "ON_HOLd",
      },
      {
        where: { id: id_incident, id_technicien },
      }
    );

    return res.status(200).json({ message: "Mission supprimée avec succès." });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de la mission :", error);
    return res.status(500).json({ message: error.message });
  }
});
router.post(
  "/incident/:id/feedback",
  verifyToken,
  upload.single("file"), // le fichier est dans req.file, pas dans req.body
  async (req, res) => {
    try {
      const id_technicien = req.user?.id;
      const id_incident = req.params.id;
      const { description, signature, statut_mission } = req.body;

      const file = req.file?.path; // ou req.file.path si tu veux le chemin complet

      if (!file) {
        return res.status(400).json({ message: "Fichier requis." });
      }

      const feedback = await Feedback.create({
        id_technicien,
        id_incident,
        description,
        file, // ✅ correspond à la colonne dans le modèle Feedback
        signature,
        statut_mission,
      });

      await Incident.update(
        { etat: "done" },
        { where: { id: id_incident, id_technicien } }
      );
      res.status(201).json(feedback);
    } catch (error) {
      console.error("Erreur lors de la création du feedback:", error);
      res.status(400).json({ message: error.message });
    }
  }
);

router.post("/send-message", verifyToken, async (req, res) => {
  try {
    // 1. Validation des données
    const { content, recipient_id } = req.body;
    const sender_id = req.user.id;
    const sender_role = req.user.role;

    if (!content || !recipient_id || !sender_role) {
      return res.status(400).json({
        success: false,
        message: "Content, recipient_id and sender_role are required",
      });
    }

    // 2. Déterminer les IDs selon le rôle de l'expéditeur
    let id_admin, id_technicien;

    if (sender_role === "admin") {
      id_admin = sender_id;
      id_technicien = recipient_id;

      // Vérifier si le technicien existe
      const technicien = await Technicien.findByPk(recipient_id);
      if (!technicien) {
        return res.status(404).json({
          success: false,
          message: "Technicien not found",
        });
      }
    } else if (sender_role === "technicien") {
      id_technicien = sender_id;
      id_admin = recipient_id;

      // Vérifier si l'admin existe
      const admin = await Admin.findByPk(recipient_id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid sender_role",
      });
    }

    // 3. Chercher ou créer la discussion
    let discussion = await Discussion.findOne({
      where: {
        id_technicien,
        id_admin,
      },
    });

    if (!discussion) {
      discussion = await Discussion.create({
        id_technicien,
        id_admin,
        status: "active",
        last_message_at: new Date(),
      });
    }

    // 4. Créer le message
    const message = await Message.create({
      content,
      sender_type: sender_role,
      sender_id,
      discussion_id: discussion.id,
      status: "sent",
    });

    // 5. Mettre à jour la discussion
    await Discussion.update(
      { last_message_at: new Date() },
      { where: { id: discussion.id } }
    );

    // 6. Réponse
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: {
        message,
        discussion_id: discussion.id,
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
// GET /messages/:discussion_id
router.get("/messages/:id", verifyToken, async (req, res) => {
  const id_discussion = parseInt(req.params.id, 10);
  if (isNaN(id_discussion)) {
    return res.status(400).json({
      success: false,
      message: "Invalid discussion id",
    });
  }

  try {
    const messages = await Message.findAll({
      where: { discussion_id: id_discussion },
      order: [["created_at", "ASC"]], // Utiliser created_at au lieu de date_envoie
    });

    res.json({ success: true, messages });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching messages" });
  }
});

router.get("/technicien/discussion", verifyToken, async (req, res) => {
  try {
    const id_technicien = req.user?.id;

    if (!id_technicien) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise",
      });
    }

    const discussions = await Discussion.findAll({
      where: { id_technicien },
      include: [
        {
          model: Admin,
          as: "Admin", // Utiliser "Admin" au lieu de "admin" pour correspondre à la définition dans models/index.js
          attributes: ["id", "nom", "prenom", "email"],
        },
      ],
      order: [["last_message_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      discussions,
    });
  } catch (error) {
    console.error("❌ Erreur dans GET /discussions :", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// GET /techniciens/discussions/admin/:adminId - Vérifier s'il existe une discussion avec un admin spécifique
router.get("/discussions/admin/:adminId", verifyToken, async (req, res) => {
  try {
    const technicienId = req.user.id;
    const adminId = req.params.adminId;

    // Vérifier que l'utilisateur est un technicien
    if (req.user.role !== "technicien") {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé"
      });
    }

    // Rechercher une discussion existante entre ce technicien et cet admin
    const discussion = await Discussion.findOne({
      where: {
        id_technicien: technicienId,
        id_admin: adminId
      }
    });

    if (discussion) {
      return res.status(200).json({
        success: true,
        discussion
      });
    } else {
      return res.status(200).json({
        success: true,
        discussion: null,
        message: "Aucune discussion existante avec cet administrateur"
      });
    }
  } catch (error) {
    console.error("Erreur vérification discussion:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la vérification de la discussion"
    });
  }
});
export default router;
