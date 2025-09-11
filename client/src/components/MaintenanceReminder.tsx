import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Plus,
  Bell,
  Trash2
} from "lucide-react";
import { format, addDays, isAfter, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import api from "../lib/api";
import { toast } from "sonner";

interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  type: "inspection" | "cleaning" | "repair" | "replacement";
}

const MaintenanceReminder: React.FC = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  // Fetch maintenance tasks
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get("/maintenance/tasks");
        setTasks(response.data);
      } catch (err) {
        console.error("Failed to fetch maintenance tasks:", err);
        setError("Impossible de charger les tâches de maintenance");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Toggle task completion
  const toggleTaskCompletion = async (taskId: string) => {
    try {
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      setTasks(updatedTasks);

      // Update in backend
      await api.patch(`/maintenance/tasks/${taskId}`, {
        completed: !tasks.find(t => t.id === taskId)?.completed
      });

      toast.success("Tâche mise à jour", {
        description: "Le statut de la tâche a été modifié avec succès."
      });
    } catch (err) {
      console.error("Failed to update task:", err);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la mise à jour de la tâche."
      });
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    try {
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);

      // Delete from backend
      await api.delete(`/maintenance/tasks/${taskId}`);

      toast.success("Tâche supprimée", {
        description: "La tâche a été supprimée avec succès."
      });
    } catch (err) {
      console.error("Failed to delete task:", err);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la suppression de la tâche."
      });
    }
  };

  // Add new task
  const addNewTask = () => {
    // In a real app, this would open a modal or navigate to a form page
    toast.info("Fonctionnalité à venir", {
      description: "L'ajout de nouvelles tâches de maintenance sera disponible prochainement."
    });
  };

  // Get priority color
  const getPriorityColor = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  // Get type icon
  const getTypeIcon = (type: "inspection" | "cleaning" | "repair" | "replacement") => {
    switch (type) {
      case "inspection":
        return <Calendar className="h-4 w-4" />;
      case "cleaning":
        return <Wrench className="h-4 w-4" />;
      case "repair":
        return <Wrench className="h-4 w-4" />;
      case "replacement":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Check if task is overdue
  const isOverdue = (dueDate: string) => {
    return isAfter(new Date(), parseISO(dueDate));
  };

  // Filter tasks based on completion status
  const filteredTasks = showCompleted 
    ? tasks 
    : tasks.filter(task => !task.completed);

  // Sort tasks by due date
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Tâches de Maintenance
          </span>
          <div className="flex items-center gap-2">
            <Button onClick={addNewTask} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
            >
              {showCompleted ? "Masquer" : "Voir"} terminées
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Clock className="animate-spin h-6 w-6 mr-2" />
            Chargement des tâches...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-red-500">{error}</p>
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-gray-500">
              {showCompleted ? "Aucune tâche terminée" : "Aucune tâche de maintenance en attente"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTasks.map((task) => (
              <div 
                key={task.id}
                className={`p-4 rounded-lg border ${
                  task.completed 
                    ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700" 
                    : isOverdue(task.dueDate) 
                      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" 
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(task.type)}
                      <h3 className="font-medium">{task.title}</h3>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      {isOverdue(task.dueDate) && !task.completed && (
                        <Badge variant="destructive">
                          En retard
                        </Badge>
                      )}
                      {task.completed && (
                        <Badge variant="secondary">
                          Terminé
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {task.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Échéance: {format(parseISO(task.dueDate), "dd/MM/yyyy", { locale: fr })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTaskCompletion(task.id)}
                      className={task.completed ? "text-green-600" : ""}
                    >
                      {task.completed ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-gray-300" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaintenanceReminder;
