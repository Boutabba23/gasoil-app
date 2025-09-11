import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, Download, Palette, Save, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UserSettings {
  theme: "light" | "dark" | "system";
  notifications: {
    email: boolean;
    browser: boolean;
  };
  dataRetention: number; // days
  exportFormat: "csv" | "json";
}

const defaultSettings: UserSettings = {
  theme: "system",
  notifications: {
    email: true,
    browser: true,
  },
  dataRetention: 90,
  exportFormat: "csv",
};

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialSettings, setInitialSettings] = useState<UserSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        setInitialSettings(parsedSettings);
      } catch (error) {
        console.error("Failed to parse settings:", error);
      }
    }
  }, []);

  // Check if settings have changed
  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(initialSettings);
    setHasChanges(changed);
  }, [settings, initialSettings]);

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNotificationChange = (type: keyof UserSettings["notifications"], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value
      }
    }));
  };

  const saveSettings = () => {
    setIsLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem("userSettings", JSON.stringify(settings));

      // Here you could also save to backend if needed
      // await api.post("/user/settings", settings);

      setInitialSettings(settings);
      setHasChanges(false);

      toast.success("Paramètres enregistrés", {
        description: "Vos préférences ont été mises à jour avec succès."
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'enregistrement des paramètres."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
    toast.info("Paramètres réinitialisés", {
      description: "Les paramètres ont été réinitialisés aux valeurs par défaut."
    });
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = "data:application/json;charset=utf-8,"+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `gasoil-settings-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast.success("Paramètres exportés", {
      description: "Vos paramètres ont été exportés avec succès."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Paramètres
          </CardTitle>
          <CardDescription>
            Personnalisez votre expérience avec l'application Gestion Gasoil
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Apparence</CardTitle>
            <CardDescription>
              Personnalisez l'apparence de l'application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Thème</Label>
                <div className="text-sm text-muted-foreground">
                  Choisissez le thème de l'application
                </div>
              </div>
              <div className="flex gap-2">
                {(["light", "dark", "system"] as const).map((theme) => (
                  <Button
                    key={theme}
                    variant={settings.theme === theme ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSettingChange("theme", theme)}
                  >
                    {theme === "light" && "Clair"}
                    {theme === "dark" && "Sombre"}
                    {theme === "system" && "Système"}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Gérez vos préférences de notification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications par email</Label>
                <div className="text-sm text-muted-foreground">
                  Recevoir des notifications par email
                </div>
              </div>
              <Switch
                checked={settings.notifications.email}
                onCheckedChange={(checked) => handleNotificationChange("email", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications navigateur</Label>
                <div className="text-sm text-muted-foreground">
                  Recevoir des notifications dans le navigateur
                </div>
              </div>
              <Switch
                checked={settings.notifications.browser}
                onCheckedChange={(checked) => handleNotificationChange("browser", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Données
            </CardTitle>
            <CardDescription>
              Gérez vos données et préférences d'export
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-0.5">
              <Label>Format d'export par défaut</Label>
              <div className="flex gap-2">
                {(["csv", "json"] as const).map((format) => (
                  <Button
                    key={format}
                    variant={settings.exportFormat === format ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSettingChange("exportFormat", format)}
                  >
                    {format.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-0.5">
              <Label>Rétention des données (jours)</Label>
              <Input
                type="number"
                value={settings.dataRetention}
                onChange={(e) => handleSettingChange("dataRetention", parseInt(e.target.value))}
                min="7"
                max="365"
              />
              <div className="text-sm text-muted-foreground">
                Les données plus anciennes seront automatiquement supprimées
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Actions sur vos paramètres
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Button
                onClick={saveSettings}
                disabled={!hasChanges || isLoading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
              <Button
                variant="outline"
                onClick={exportSettings}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exporter les paramètres
              </Button>
              <Button
                variant="destructive"
                onClick={resetSettings}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
            {hasChanges && (
              <Alert>
                <Bell className="h-4 w-4" />
                <AlertDescription>
                  Vous avez des modifications non enregistrées. N'oubliez pas de sauvegarder vos changements.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
