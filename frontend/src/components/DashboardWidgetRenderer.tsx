import { ReactNode } from 'react';

interface DashboardWidgetRendererProps {
  children: ReactNode;
  enabled: boolean;
}

export const DashboardWidgetRenderer = ({ children, enabled }: DashboardWidgetRendererProps) => {
  if (!enabled) return null;
  
  return <>{children}</>;
};

