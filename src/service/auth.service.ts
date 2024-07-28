import { errorService } from "./errors.service";
import { httpResponse } from "./response.service";
import { userService } from "./user.service";
import bcrypt from "bcrypt";

class AuthService {
  async login(data: { username: string; password: string }) {
    try {
      const responseUser = await userService.findUserByUsername(data.username);
      if (!responseUser.ok) return responseUser;

      const responseUserEnabled = await userService.findById(
        responseUser.content.id
      );
      if (responseUserEnabled.content.enabled === "0")
        return httpResponse.http401("Error in authentication");
      if (bcrypt.compareSync(data.password, responseUser.content.password))
        return httpResponse.http200("Login correct", responseUser.content);
      return httpResponse.http401("Error in Auth", {
        message: "Error in auth",
      });
    } catch (error) {
      return errorService.handleErrorSchema(error);
    }
  }

  async validationAdmin(session: any) {
    try {
      const { user } = session;

      if (user.role === "admin" || user.role === "superadmin") {
        return httpResponse.http200("Authentication ok", null);
      } else return httpResponse.http401("Error in authentication");
    } catch (error) {
      return errorService.handleErrorSchema(error);
    }
  }

  async validationUser(session: any) {
    try {
      const { user } = session;

      if (
        user.role === "user" ||
        user.role === "admin" ||
        user.role === "superadmin"
      ) {
        const responseUser = await userService.findById(user.id);

        if (!responseUser.ok || responseUser.content.enabled === "0")
          return httpResponse.http401("Error in authentication");
        else return httpResponse.http200("Authentication ok");
      } else return httpResponse.http401("Error in authentication");
    } catch (error) {
      return errorService.handleErrorSchema(error);
    }
  }
}

export const authService = new AuthService();
