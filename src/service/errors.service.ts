import { ZodError } from "zod";
import { httpResponse } from "./response.service";

class ErrorService {
  handleErrorSchema(error: any) {
    if (error instanceof ZodError) {
      const validationErrors = error.errors;
      return httpResponse.http400(
        "Error in validation schema",
        validationErrors
      );
    } else {
      return httpResponse.http500("Error in server", error);
    }
  }
}

export const errorService = new ErrorService();
