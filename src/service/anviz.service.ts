import axios from "axios";
import { errorService } from "./errors.service";
import { httpResponse } from "./response.service";
import "dotenv/config";

class AnvizService {
  async getToken() {
    try {
      const response = await axios.post("https://api.us.crosschexcloud.com/", {
        header: {
          nameSpace: "authorize.token",
          nameAction: "token",
          version: "1.0",
          requestId: "f1becc28-ad01-b5b2-7cef-392eb1526f39",
          timestamp: "2022-10-21T07:39:07+00:00",
        },
        payload: {
          api_key: process.env.CROSSCHEXCLOUD_API_KEY,
          api_secret: process.env.CROSSCHEXCLOUD_API_SECRET,
        },
      });

      return httpResponse.http200("Fetch ok!", {
        token: response.data.payload.token,
      });
    } catch (error) {
      return errorService.handleErrorSchema(error);
    }
  }

  async getData(
    token: string,
    begin_time: string,
    end_time: string,
    order = "asc",
    page = 1,
    per_page = 10000000000
  ) {
    // begin_time: "2022-06-01T12:46:43+00:00",
    //       end_time: "2024-05-24T12:46:43+00:00",
    try {
      const response = await axios.post("https://api.us.crosschexcloud.com/", {
        header: {
          nameSpace: "attendance.record",
          nameAction: "getrecord",
          version: "1.0",
          requestId: "f1becc28-ad01-b5b2-7cef-392eb1526f39",
          timestamp: "2022-10-21T07:39:07+00:00",
        },
        authorize: {
          type: "token",
          token,
        },
        payload: {
          begin_time,
          end_time,
          order,
          page,
          per_page,
        },
      });
      return httpResponse.http200("Fetch ok!", response.data);
    } catch (error) {
      return errorService.handleErrorSchema(error);
    }
  }
}

export const anvizService = new AnvizService();
