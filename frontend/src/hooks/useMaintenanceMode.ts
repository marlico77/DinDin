/**
 * Hook para verificar se está em período de manutenção
 * 
 * Controlado pela variável de ambiente VITE_FLAG_MAINTENANCE
 * - true: Ativa o modo de manutenção
 * - false ou não definido: Desativa o modo de manutenção
 * 
 * Para configurar, adicione no arquivo .env:
 * VITE_FLAG_MAINTENANCE=true
 */
export const useMaintenanceMode = () => {
  // Verificar flag do ambiente
  const maintenanceFlag = import.meta.env.VITE_FLAG_MAINTENANCE;
  const isMaintenanceEnabled = maintenanceFlag === 'true' || maintenanceFlag === true;

  // Se a flag não estiver ativa, não está em manutenção
  if (!isMaintenanceEnabled) {
    return {
      isMaintenanceMode: false,
      startTime: new Date(),
      endTime: new Date(),
    };
  }

  // Se estiver em manutenção, calcular período (2 horas a partir de agora)
  const now = new Date();
  const startTime = new Date(now);
  const endTime = new Date(now);
  endTime.setHours(endTime.getHours() + 2); // 2 horas de duração prevista
  
  return {
    isMaintenanceMode: true,
    startTime,
    endTime,
  };
};

