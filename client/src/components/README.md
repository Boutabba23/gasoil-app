# Frontend Components Documentation

This document provides an overview of the components created for the gasoil application frontend.

## Components Created

### 1. Dashboard Components

- **DashboardStats**: Displays key statistics about fuel consumption and tank levels.
- **RealTimeMonitor**: Shows real-time tank level monitoring with auto-refresh capabilities.
- **MaintenanceReminder**: Manages and tracks maintenance tasks for the tank.
- **FuelAnalytics**: Provides detailed analytics and charts for fuel consumption.
- **TankCapacityAlerts**: Handles alerts for tank capacity thresholds.
- **DashboardHeader**: A responsive header component with user info and quick actions.
- **DashboardNav**: Navigation component for the dashboard sidebar.
- **DashboardFooter**: Footer component with company info and links.

### 2. Utility Components

- **ErrorBoundary**: Catches and displays errors gracefully.
- **LoadingSpinner**: Shows loading states with customizable size and text.
- **EmptyState**: Displays empty states with optional actions.
- **OfflineIndicator**: Shows when the application is offline.
- **ThemeSwitcher**: Allows users to switch between light, dark, and system themes.
- **SearchBox**: Provides search functionality with recent searches.

### 3. Layout Components

- **DashboardLayoutNew**: A modern dashboard layout with collapsible sidebar and responsive design.

## Usage

All components are designed to be reusable and follow the component-based architecture of React. They use Tailwind CSS for styling and are fully responsive.

### Example Usage

```jsx
import DashboardStats from './components/DashboardStats';

function MyPage() {
  return (
    <div>
      <DashboardStats refreshTrigger={refreshKey} />
    </div>
  );
}
```

## Dependencies

- React
- React Router
- Tailwind CSS
- Lucide React (icons)
- Radix UI (for some UI components)
- Recharts (for charts in FuelAnalytics)

## Future Enhancements

- Implement more advanced search functionality
- Add more chart types and customization options
- Enhance the maintenance reminder with calendar integration
- Add push notifications for alerts
