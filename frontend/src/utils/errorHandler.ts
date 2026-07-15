/**
 * Sanitizes Firebase error messages to prevent exposing sensitive information
 */
export function sanitizeFirebaseError(error: any): string {
  if (!error) {
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  const errorCode = error?.code || '';
  const errorMessage = error?.message || '';

  // Map Firebase error codes to user-friendly messages
   
  const errorMessages: Record<string, string> = {
    // Authentication errors
    'auth/email-already-in-use': 'Este email ja esta em uso.',
    'auth/invalid-email': 'Email invalido.',
    'auth/operation-not-allowed': 'Operacao nao permitida.',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
    'auth/user-disabled': 'Esta conta foi desabilitada.',
    'auth/user-not-found': 'Email ou senha incorretos.',
    'auth/wrong-password': 'Email ou senha incorretos.',
    'auth/invalid-credential': 'Email ou senha incorretos.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    'auth/network-request-failed': 'Erro de conexao. Verifique sua internet.',
    
    // Firestore errors
    'permission-denied': 'Voce nao tem permissao para realizar esta acao.',
    'unavailable': 'Servico temporariamente indisponivel. Tente novamente.',
    'deadline-exceeded': 'A operacao demorou muito. Tente novamente.',
    'unauthenticated': 'Voce precisa estar logado para realizar esta acao.',
    
    // Generic errors
    'failed-precondition': 'Acao nao pode ser realizada no momento.',
    'aborted': 'Operacao cancelada.',
    'out-of-range': 'Valor fora do intervalo permitido.',
    'unimplemented': 'Funcionalidade ainda nao implementada.',
    'internal': 'Erro interno do servidor. Tente novamente.',
    'not-found': 'Item nao encontrado.',
    'already-exists': 'Este item ja existe.',
    'resource-exhausted': 'Limite de recursos excedido. Tente novamente mais tarde.',
  };

  // Check for known error codes
  if (errorCode && errorMessages[errorCode]) {
    return errorMessages[errorCode];
  }

  // Check if error message contains sensitive information
  const sensitivePatterns = [
    /firebase/i,
    /api[_-]?key/i,
    /password/i,
    /token/i,
    /secret/i,
    /credential/i,
    /stack trace/i,
    /at\s+\w+\./i, // Stack trace patterns
  ];

  // If message contains sensitive info, return generic message
  if (errorMessage && sensitivePatterns.some(pattern => pattern.test(errorMessage))) {
    return 'Ocorreu um erro. Tente novamente.';
  }

  // Return sanitized message (limit length)
  if (errorMessage) {
    return errorMessage.slice(0, 200);
  }

  return 'Ocorreu um erro inesperado. Tente novamente.';
}
