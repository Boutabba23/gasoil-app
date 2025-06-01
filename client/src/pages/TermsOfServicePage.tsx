import React from "react";
import { Link } from "react-router-dom";

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-slate-800 dark:text-slate-200">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-8 inline-block"
        >
          ← Retour à l'accueil
        </Link>
        <h1 className="text-3xl font-extrabold mb-6">
          Conditions Générales d'Utilisation
        </h1>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
          <p>Date d'entrée en vigueur : [Insérer la date]</p>

          <h2 className="text-xl font-semibold">
            1. Acceptation des conditions
          </h2>
          <p>
            En accédant ou en utilisant l'application Gasoil App (ci-après
            dénommée "l'Application"), vous acceptez d'être lié par ces
            Conditions Générales d'Utilisation ("CGU"). Si vous n'acceptez pas
            toutes ces conditions, n'utilisez pas l'Application.
          </p>

          <h2 className="text-xl font-semibold">
            2. Utilisation de l'Application
          </h2>
          <p>
            Vous acceptez d'utiliser l'Application uniquement à des fins légales
            et conformément à ces CGU. Vous êtes responsable de l'exactitude des
            données que vous saisissez dans l'Application. L'Application est
            destinée à être utilisée pour la gestion de gasoil des engins de
            [Nom de votre société].
          </p>

          <h2 className="text-xl font-semibold">3. Compte Utilisateur</h2>
          <p>
            Pour utiliser l'Application, vous devez vous authentifier via votre
            compte Google. Vous êtes responsable de la confidentialité des
            informations de votre compte et de toutes les activités qui se
            déroulent sous votre compte.
          </p>

          <h2 className="text-xl font-semibold">4. Propriété Intellectuelle</h2>
          <p>
            L'Application et son contenu original (à l'exclusion du contenu
            fourni par les utilisateurs), ses caractéristiques et ses
            fonctionnalités sont et resteront la propriété exclusive de [Nom de
            votre société] et de ses concédants de licence.
          </p>

          <h2 className="text-xl font-semibold">
            5. Limitation de Responsabilité
          </h2>
          <p>
            L'Application est fournie "telle quelle" et "selon disponibilité".
            [Nom de votre société] ne garantit pas que l'Application sera
            ininterrompue, sécurisée ou exempte d'erreurs. En aucun cas [Nom de
            votre société] ne pourra être tenu responsable des dommages
            indirects, accessoires, spéciaux, consécutifs ou punitifs résultant
            de votre utilisation de l'Application. L'exactitude des conversions
            de jauge dépend de l'exactitude du barème fourni.
          </p>

          <h2 className="text-xl font-semibold">6. Modifications des CGU</h2>
          <p>
            Nous nous réservons le droit de modifier ou de remplacer ces CGU à
            tout moment. Nous vous informerons de toute modification en publiant
            les nouvelles CGU sur cette page.
          </p>

          <h2 className="text-xl font-semibold">7. Droit Applicable</h2>
          <p>
            Ces CGU sont régies et interprétées conformément aux lois de [Votre
            Pays/Juridiction], sans égard à ses dispositions relatives aux
            conflits de lois.
          </p>

          <h2 className="text-xl font-semibold">8. Contact</h2>
          <p>
            Pour toute question concernant ces CGU, veuillez nous contacter à :
            [Votre adresse e-mail de contact ou celle de l'entreprise]
          </p>
        </div>
      </div>
    </div>
  );
};
export default TermsOfServicePage;
