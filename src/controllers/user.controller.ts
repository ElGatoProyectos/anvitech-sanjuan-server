import { Request, Response } from "express";
import { userService } from "../service/user.service";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class UserController {
  async userGet(request: Request, response: Response): Promise<void> {
    try {
      const serviceResponse = await userService.findAll();

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  // POST method for creating a new user
  async userPost(request: Request, response: Response): Promise<void> {
    try {
      const body = request.body;
      const serviceResponse = await userService.createUser(body);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async userIdGet(request: Request, response: Response): Promise<void> {
    try {
      const id = Number(request.params.id);
      const serviceResponse = await userService.findById(id);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  // PUT method for updating a user by ID
  async userIdPut(request: Request, response: Response): Promise<void> {
    try {
      const id = Number(request.params.id);
      const body = request.body;

      const serviceResponse = await userService.updateUser(body, id);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  // DELETE method for deleting a user by ID
  async userIdDelete(request: Request, response: Response): Promise<void> {
    try {
      const id = Number(request.params.id);
      const serviceResponse = await userService.deleteUser(id);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async userFilePost(request: any, response: Response): Promise<void> {
    // Usando multer para manejar la subida de archivos en memoria
    upload.single("file")(request, response, async (err) => {
      if (err) {
        return response.status(500).json({ error: "Error uploading file" });
      }

      const file = request.file;
      if (!file) {
        return response.status(400).json({ error: "No file uploaded" });
      }

      try {
        const serviceResponse = await userService.registerMassive(file);

        response.status(200).json(serviceResponse);
      } catch (error) {
        response.status(500).json(error);
      }
    });
  }
}

export const userController = new UserController();
