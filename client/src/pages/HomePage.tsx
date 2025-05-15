import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
// import { Chrome } from 'lucide-react'; // Pour l'icône Google
import VotreLogo from '../assets/react.svg'; // Assurez-vous d'avoir un logo

const HomePage: React.FC = () => {
  const handleLogin = () => {
    // Redirige vers l'URL d'authentification Google du backend
    window.location.href = import.meta.env.VITE_API_GOOGLE_LOGIN_URL || 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center"
      >
        <img src={VotreLogo} alt="Logo Société" className="w-32 h-32 mx-auto mb-6" /> {/* Ou <YourLogoIcon /> */}
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          Gestion Gasoil Pro
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-8">
          Votre solution intuitive pour le suivi de carburant.
        </p>
        <Button
          onClick={handleLogin}
          size="lg"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
        >
          {/* <Chrome className="mr-2 h-5 w-5" /> Optionnel: icône Google */}
          Se connecter avec Google
        </Button>
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="absolute bottom-4 text-sm text-slate-400"
      >
        © {new Date().getFullYear()} NomDeVotreSociete. Tous droits réservés.
      </motion.footer>
    </div>
  );
};

export default HomePage;