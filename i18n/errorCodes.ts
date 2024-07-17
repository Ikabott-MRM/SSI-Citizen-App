interface ErrorMessage {
  en: string;
  es: string;
}

type ErrorCodes = {
  [code: number]: ErrorMessage;
};

const errorCodes: ErrorCodes = {
  400: {
    en: 'Bad Request',
    es: 'Solicitud incorrecta',
  },
  404: {
    en: 'Request not found',
    es: 'Solicitud no encontrada',
  },
  409: {
    en: 'Conflict. Request already processed',
    es: 'Conflicto. Solicitud ya procesada',
  },
  500: {
    en: 'Internal server error',
    es: 'Error interno del servidor',
  },
};

export { errorCodes };
