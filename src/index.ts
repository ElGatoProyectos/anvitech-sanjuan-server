import express from "express";
import cors from "cors";
// import router from "./routes/route";
import { cronStart } from "./utils/utils";
import router from "./routes/router-test";

const app = express();

app.use(express.json());

app.use(cors());

cronStart();

app.use("/api", router);

app.listen(4000, () => {
  console.log("this application is running in 4000");
});
