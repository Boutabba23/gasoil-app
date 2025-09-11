import React from 'react';
import { Github, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const DashboardFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Gestion Gasoil</h3>
            <p className="text-sm text-muted-foreground">
              Solution complète pour la surveillance et la gestion de vos réservoirs de carburant.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm">
                <Github className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Liens Rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/dashboard" className="text-muted-foreground hover:text-foreground">
                  Tableau de bord
                </a>
              </li>
              <li>
                <a href="/dashboard/historique" className="text-muted-foreground hover:text-foreground">
                  Historique
                </a>
              </li>
              <li>
                <a href="/dashboard/settings" className="text-muted-foreground hover:text-foreground">
                  Paramètres
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className="text-muted-foreground hover:text-foreground">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="/terms-of-service" className="text-muted-foreground hover:text-foreground">
                  Conditions d'utilisation
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                support@gasoil-app.com
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                +33 1 23 45 67 89
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                123 Rue de l'Innovation, 75001 Paris
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Newsletter</h3>
            <p className="text-sm text-muted-foreground">
              Abonnez-vous pour recevoir les mises à jour et les nouvelles fonctionnalités.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Votre email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <Button className="ml-2">S'abonner</Button>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Boutabba Larab. Tous droits réservés.
          </p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Version 2.0.0</span>
            <span>|</span>
            <span>Dernière mise à jour: 15/06/2023</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
