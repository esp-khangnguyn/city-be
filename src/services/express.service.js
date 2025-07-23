import express from "express";
import fs from "fs";
import cors from "cors"; // ✅ Thêm dòng này
import bodyParser from "body-parser";
import globalErrorHandler from "../middlewares/errorHandler.middleware";

const routeFiles = fs
  .readdirSync(__dirname + "/../routes/")
  .filter((file) => file.endsWith(".js"));

let server;
let routes = [];

const expressService = {
  init: async () => {
    try {
      // Load tất cả route trong folder routes/
      for (const file of routeFiles) {
        const route = await import(`../routes/${file}`);
        const routeName = Object.keys(route)[0];
        routes.push(route[routeName]);
      }

      server = express();

      // ✅ Kích hoạt CORS trước bodyParser
      server.use(
        cors({
          origin: "*", // hoặc ghi rõ: origin: "http://localhost:3001"
          credentials: true, // nếu có dùng cookie
        })
      );

      server.use(bodyParser.json());

      routes.forEach((route) => {
        server.use("/api", route);
      });

      server.use(globalErrorHandler);

      server.listen(process.env.SERVER_PORT, () => {
        console.log(
          `[EXPRESS] Server is running on port ${process.env.SERVER_PORT}`
        );
        console.log("[EXPRESS] Express initialized");
      });
    } catch (error) {
      console.log("[EXPRESS] Error during express service initialization");
      throw error;
    }
  },
};

export default expressService;
