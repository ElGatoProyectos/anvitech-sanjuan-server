import { Request, Response } from "express";
import { userService } from "../service/user.service";
import bcrypt from "bcrypt";

class AuthController {
  async login(request: Request, response: Response): Promise<void> {
    try {
      const { username, password } = await request.body;

      const responseData = await userService.findByDni(username);
      if (!responseData.ok) {
        response
          .status(401)
          .json({ message: "Error in authorization request" });
      } else {
        const responseCompare = bcrypt.compareSync(
          password,
          responseData.content.password
        );
        if (responseCompare) {
          const formatData = {
            id: responseData.content.id,
            role: responseData.content.role,
            username: responseData.content.username,
          };
          response.status(200).json(formatData);
        } else {
          response
            .status(401)
            .json({ message: "Error in authorization request" });
        }
      }
    } catch (error) {
      response.status(500).json(error);
    }
  }
}

export const authController = new AuthController();
