import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import   {toast}  from "@/components/ui/sonner"; // Assurez-vous que le chemin est correct

const AuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error) {
      console.error("Google Auth Error:", error);
      toast.error("Erreur d'authentification", {
        description: "La connexion avec Google a échoué. Veuillez réessayer.",
        variant: "destructive",
      });
      navigate("/login"); // Ou votre page d'accueil/login
      return;
    }

    if (token) {
      login(token)
        .then(() => {
          toast.success("Connexion réussie", {
            description: "Vous êtes maintenant connecté.",
            variant: "success",
          });
          navigate("/dashboard");
        })
        .catch((err) => {
          console.error("Login failed after token received:", err);
          toast.error("Erreur de connexion", {
            description: "Impossible de finaliser la connexion.",
            variant: "destructive",
          });
          navigate("/login");
        });
    } else {
      // S'il n'y a ni token ni erreur, quelque chose d'anormal s'est produit
      console.error("No token or error in auth callback");
      toast.error("Problème d'authentification", {
        description: "Les informations de connexion sont manquantes.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [location, navigate, login]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Authentification en cours...</p>
      {/* Vous pouvez ajouter un spinner ici */}
    </div>
  );
};

export default AuthCallback;
