import { ReactNode } from 'react';
import { WidgetId, WidgetConfig } from '../types';

interface DashboardWidgetsProps {
  enabledWidgets: WidgetConfig[];
  widgetId: WidgetId;
  children: ReactNode;
  condition?: boolean;
}

export const DashboardWidgets = ({ enabledWidgets, widgetId, children, condition = true }: DashboardWidgetsProps) => {
  const widget = enabledWidgets.find(w => w.id === widgetId);
  
  if (!widget || !widget.enabled || !condition) {
    return null;
  }
  
  return <>{children}</>;
};

