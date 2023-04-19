export const SwaggerUnauthorizedResponse = {
  description: 'Unauthorized',
  schema: {
    example: {
      statusCode: 401,
      message: 'Unauthorized',
    },
  },
};

export const SwaggerForbiddenResponse = {
  description: 'Forbidden Access',
  schema: {
    example: {
      statusCode: 403,
      message: 'Forbidden resource',
      error: 'Forbidden',
    },
  },
};

export function SwaggerResponseSuccessfulWithMessage(message) {
  return {
    description: 'Successfull Response',
    schema: {
      example: {
        msg: message,
      },
    },
  };
}

export function SwaggerBadResponse(message) {
  return {
    value: {
      statusCode: 400,
      message: message,
      error: 'Bad Request',
    },
  };
}
