import { AppError } from "@shared/errors/app-error";
import { logger } from "@shared/logger";
import Elysia, { ValidationError } from "elysia";

export function applyErrorHandler(app: Elysia) {
  app.error({ APP_ERROR: AppError }).onError(({ code, error }) => {
    let statusCode: number = 500;
    let responseMessage: string;
    let responseCode: string;

    switch (code) {
      case "APP_ERROR": {
        statusCode = error.statusCode;
        responseMessage = error.message;
        responseCode = error.code;
        break;
      }
      case "VALIDATION": {
        const validationError = error as ValidationError;

        const valueError = error.valueError;

        statusCode = 400;
        responseCode = "VALIDATION_ERROR";
        responseMessage = valueError
          ? `${valueError.path} - ${valueError.message}`
          : "Validation failed";
        break;
      }
      case "NOT_FOUND": {
        statusCode = 404;
        responseMessage = "Resource not found";
        responseCode = "NOT_FOUND";
        break;
      }
      default: {
        logger.error(error);

        statusCode = 500;
        responseMessage = "An unexpected error occurred";
        responseCode = "INTERNAL_SERVER_ERROR";
      }
    }

    return new Response(
      JSON.stringify({
        statusCode,
        message: responseMessage,
        code: responseCode,
      }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
      },
    );
  });
}
