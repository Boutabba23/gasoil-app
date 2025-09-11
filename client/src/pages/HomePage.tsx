import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import VotreLogoSociete from "../assets/tank.svg";
import googleLogoUrl from "../assets/google.svg";
import { Link } from "react-router-dom";
import { useAuthSimple } from "../hooks/useAuthSimpleEnglish";

const HomePage: React.FC = () => {
  const { signInWithGoogle, loading, error } = useAuthSimple();
  
  const handleLogin = async () => {
    try {
      console.log("HomePage: handleLogin function CALLED!");
      await signInWithGoogle();
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      alert(
        "Erreur de configuration: Impossible de contacter le service d'authentification."
      );
    }
  };
  const logoContainerSizeClasses = "w-32 h-32 md:w-36 md:h-36";
  const logoImageSizeClasses = "w-20 h-20 md:w-24 md:h-24";
  console.log("HomePage: handleLogin function CALLED!");

  return (
    // Main container: Ensures content can scroll if it exceeds viewport height
    // and provides padding for the overall page.
    <div
      className="flex flex-col items-center justify-between pt-36 min-h-screen 
                  bg-gradient-to-br from-[#fffbe7] to-[#FFF1A7] 
                   text-slate-800 p-4 sm:p-6 md:p-8 overflow-y-auto"
    >
      {" "}
      {/* Added overflow-y-auto */}
      {/* This div will group the main card and the footer, allowing them to flow naturally */}
      <div className="flex flex-col items-start w-full max-w-lg">
        {" "}
        {/* max-w-lg to constrain width */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center p-6 md:p-10 rounded-xl bg-[#fdd06f] shadow-2xl backdrop-blur-md dark:bg-slate-800/80 w-full"
          // Added w-full to motion.div so text-center works on its block children like h1, p
        >
          <div
            className={`
              ${logoContainerSizeClasses} 
              mx-auto mb-12 rounded-full bg-[#FFF1A7] shadow-lg 
              flex items-center justify-center overflow-hidden
            `}
          >
            <img
              src={VotreLogoSociete}
              alt="Logo Société - Citerne Gasoil"
              className={`${logoImageSizeClasses} object-contain`}
            />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 tracking-tight text-[#FE5D26] dark:text-slate-100">
            Gestion Gasoil
          </h1>
          <p className="text-md sm:text-lg md:text-xl text-[#FA812F] dark:text-slate-300 mb-16 max-w-md mx-auto">
            Votre solution efficace pour le suivi du carburant.
          </p>
          
          {/* Affichage des erreurs de débogage */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-6 max-w-md mx-auto text-sm">
              <p className="font-semibold">Erreur de débogage:</p>
              <p>{error}</p>
              <p className="mt-2 text-xs">Si vous voyez ce message, vérifiez la console pour plus de détails.</p>
            </div>
          )}

          <div className="mt-8 flex justify-center ">
            <Button
              className="hover:cursor-pointer"
              onClick={() => {
                console.log("HomePage: Google Login Button CLICKED!");
                handleLogin(); // Then call your actual handler
              }}
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              ) : (
                <img
                  src={googleLogoUrl}
                  alt="Google G logo"
                  className="w-5 h-5 mr-3"
                />
              )}
              {loading ? "Connexion..." : "Se connecter avec Google"}
            </Button>
          </div>
        </motion.div>
        {/* Footer is now part of the normal document flow, below the motion.div */}
      </div>{" "}
      {/* End of grouping div for card and footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        // Responsive classes for positioning:
        // On screens up to 'sm' (max-sm behavior implied by lack of 'sm:' prefix for fixed):
        // `fixed bottom-0 left-0 right-0` ensures it's at the viewport bottom.
        // `z-10` to ensure it's above the main gradient if there's any weird layering.
        // `py-3` or `py-4` for padding.
        // On 'sm' screens and larger (`sm:` prefix):
        // `sm:relative` resets fixed positioning to normal flow.
        // `sm:mt-auto` makes it stick to bottom of flex parent if content is short, OR pushes down if content is long.
        // `sm:py-5` adjusts padding for larger screens.
      >
        <div
          className="w-full text-center text-xs sm:text-sm 
        text-slate-700/70 dark:text-slate-300/70 
        bg-transparent
        sm:relative sm:mt-auto   /* Normal flow on sm+ */
        max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:py-3 max-sm:bg-white/20 max-sm:dark:bg-black/30 max-sm:backdrop-blur-sm max-sm:z-10 /* Fixed on max-sm */
       "
        >
          <span>
            © {new Date().getFullYear()} Boutabba Larab. Tous droits réservés.
          </span>
          <div>
            <Link
              to="/privacy-policy"
              className="hover:underline hover:text-mysecondary"
            >
              Politique de Confidentialité
            </Link>
            <span className="opacity-50"> | </span>
            <Link
              to="/terms-of-service"
              className="hover:underline hover:text-mysecondary"
            >
              Conditions d'Utilisation
            </Link>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default HomePage;
