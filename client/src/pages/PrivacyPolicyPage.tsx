import React from "react";
import { Link } from "react-router-dom"; // For a "Back to Home" link

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-slate-800 dark:text-slate-200">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-8 inline-block"
        >
          ← Retour à l'accueil
        </Link>
        <h1 className="text-3xl font-extrabold  mb-6">
          Politique de Confidentialité
        </h1>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
          <p>Date de dernière mise à jour : [Insérer la date]</p>

          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p>
            Bienvenue sur Gasoil App. Nous respectons votre vie privée et nous
            nous engageons à la protéger. Cette politique de confidentialité
            explique comment nous collectons, utilisons, divulguons et
            protégeons vos informations lorsque vous utilisez notre application.
          </p>

          <h2 className="text-xl font-semibold">
            2. Informations que nous collectons
          </h2>
          <p>
            Lorsque vous vous connectez avec Google, nous collectons les
            informations suivantes à partir de votre compte Google, avec votre
            permission :
          </p>
          <ul>
            <li>Votre nom complet (displayName)</li>
            <li>Votre adresse e-mail</li>
            <li>Votre identifiant Google unique (googleId)</li>
            <li>L'URL de votre photo de profil (si disponible et partagée)</li>
          </ul>
          <p>
            Nous collectons également les données que vous générez en utilisant
            l'application, telles que :
          </p>
          <ul>
            <li>Les mesures de jauge en centimètres que vous saisissez.</li>
            <li>Les volumes en litres correspondants.</li>
            <li>La date et l'heure de chaque mesure/conversion.</li>
          </ul>

          <h2 className="text-xl font-semibold">
            3. Comment nous utilisons vos informations
          </h2>
          <p>Nous utilisons les informations que nous collectons pour :</p>
          <ul>
            <li>Fournir, exploiter et maintenir notre application.</li>
            <li>Identifier et authentifier les utilisateurs.</li>
            <li>Stocker et afficher votre historique de conversions.</li>
            <li>
              Améliorer notre application et développer de nouvelles
              fonctionnalités.
            </li>
            <li>
              Communiquer avec vous, si nécessaire (par exemple, pour le support
              utilisateur).
            </li>
          </ul>
          <p>
            Votre adresse e-mail est utilisée pour identifier de manière unique
            votre historique de conversions et afficher cet historique
            (globalement, selon la configuration actuelle de l'application).
          </p>

          <h2 className="text-xl font-semibold">
            4. Partage de vos informations
          </h2>
          <p>
            Actuellement, l'historique des conversions, qui peut inclure
            l'affichage de l'adresse e-mail de l'utilisateur ayant effectué la
            mesure, est visible par tous les utilisateurs authentifiés de
            l'application au sein de votre organisation.
          </p>
          <p>
            Nous ne vendons, n'échangeons ni ne louons vos informations
            personnelles identifiables à des tiers à des fins de marketing. Nous
            pouvons partager des informations agrégées et anonymisées qui
            n'identifient aucun individu spécifique.
          </p>

          <h2 className="text-xl font-semibold">
            5. Sécurité de vos informations
          </h2>
          <p>
            Nous utilisons des mesures de sécurité commercialement raisonnables
            pour protéger vos informations. Cependant, aucune méthode de
            transmission sur Internet ou de stockage électronique n'est
            sécurisée à 100 %, et nous ne pouvons garantir une sécurité absolue.
          </p>

          <h2 className="text-xl font-semibold">6. Conservation des données</h2>
          <p>
            Nous conservons vos informations personnelles et vos données de
            conversion aussi longtemps que votre compte est actif ou que cela
            est nécessaire pour vous fournir nos services.
          </p>

          <h2 className="text-xl font-semibold">7. Vos droits</h2>
          <p>
            Selon votre juridiction, vous pouvez avoir certains droits
            concernant vos informations personnelles, tels que le droit d'accès,
            de rectification ou de suppression. Vous pouvez supprimer des
            entrées spécifiques de votre historique de conversions via
            l'interface de l'application. Pour toute autre demande, veuillez
            nous contacter.
          </p>

          <h2 className="text-xl font-semibold">
            8. Modifications de cette politique de confidentialité
          </h2>
          <p>
            Nous pouvons mettre à jour cette politique de confidentialité de
            temps à autre. Nous vous informerons de tout changement en publiant
            la nouvelle politique de confidentialité sur cette page. Il vous est
            conseillé de consulter régulièrement cette politique de
            confidentialité pour tout changement.
          </p>

          <h2 className="text-xl font-semibold">9. Nous contacter</h2>
          <p>
            Si vous avez des questions concernant cette politique de
            confidentialité, veuillez nous contacter à : [Votre adresse e-mail
            de contact ou celle de l'entreprise]
          </p>
        </div>
      </div>
    </div>
  );
};
export default PrivacyPolicyPage;
