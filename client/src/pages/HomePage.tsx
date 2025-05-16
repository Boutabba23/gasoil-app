import React from 'react';
import { Button } from '@/components/ui/button'; // ShadCN UI Button
import { motion } from 'framer-motion'; // For animations
import VotreLogo from '../assets/react.svg'; // Ensure this path is correct
// You can also use a Lucide icon if you prefer
// import { LogIn } from 'lucide-react'; 

const HomePage: React.FC = () => {
  const handleLogin = () => {
    const googleLoginInitiationUrl = import.meta.env.VITE_API_GOOGLE_LOGIN_URL;

    if (!googleLoginInitiationUrl) {
      console.error(
        "ERREUR: VITE_API_GOOGLE_LOGIN_URL n'est pas défini dans votre fichier .env (client/.env)."
      );
      // Optionally, display an error to the user (e.g., using a toast)
      alert("Erreur de configuration: Impossible de contacter le service d'authentification.");
      return;
    }

    // Construct the URL with the prompt=select_account parameter
    // This assumes your googleLoginInitiationUrl does not already contain query parameters.
    // If it might, a more robust URL construction is needed.
    const authUrlWithPrompt = `${googleLoginInitiationUrl}?prompt=select_account`;

    console.log("Redirection vers l'URL d'authentification Google:", authUrlWithPrompt);
    window.location.href = authUrlWithPrompt;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-center p-6 md:p-10 rounded-xl bg-slate-800/30 shadow-2xl backdrop-blur-md" // Added some styling to the central card
      >
        <img src={VotreLogo} alt="Logo Société" className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-6 shadow-lg rounded-full" />
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 tracking-tight">
          Gestion Gasoil Pro
        </h1>
        <p className="text-md sm:text-lg md:text-xl text-slate-300 mb-8 max-w-md mx-auto">
          Votre solution intuitive et efficace pour le suivi de carburant.
        </p>
        <Button
          onClick={handleLogin}
          size="lg" // 'lg' size from ShadCN Button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg 
                     transition-all duration-150 ease-in-out hover:shadow-xl focus:outline-none focus:ring-2 
                     focus:ring-blue-400 focus:ring-opacity-75 transform hover:scale-105"
        >
          {/* <LogIn className="mr-2 h-5 w-5" /> Optional icon */}
          Se connecter avec Google
        </Button>
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="absolute bottom-5 text-xs sm:text-sm text-slate-400"
      >
        © {new Date().getFullYear()} VotreNomDeSociete. Tous droits réservés.
      </motion.footer>
    </div>
  );
};

export default HomePage;