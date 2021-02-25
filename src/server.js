const express = require("express");
const server = express();
const cors = require("cors");
const error_handler = require("node-error-handler");
const PORT = process.env.PORT || 3001;
const apiRoutes = require("./services/index");
const mongoose = require("mongoose");
const listEndpoints = require("express-list-endpoints");
const cookieParser = require("cookie-parser");
server.set("trust proxy", 1);
server.enable("trust proxy");
//MIDDLEWARES
server.use(express.json());
server.use(cors({
  origin: [
    `${process.env.FRONT_URL}`,
    "http://localhost:3000",
    "https://linkedin-clone-five.vercel.app",
    "https://linkedin-clone-five.vercel.app",
  ],
  credentials: true,
}));
  
server.use(cookieParser());

//ROUTE
server.use("/api", apiRoutes);

//ERROR HANDLERS
server.use(error_handler({ log: true, debug: true }));

//Connect to DB and server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    server.listen(PORT, () => {
      console.log("server connected at port ", PORT);
    })
  );
