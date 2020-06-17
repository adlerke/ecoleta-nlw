import express from "express";
import { celebrate, Joi } from "celebrate";

import PointsController from "./controllers/PointsController";
import ItemsController from "./controllers/ItemsController";
import multer from "multer";
import multerConfig from "./config/multer";

const routes = express.Router();
const upload = multer(multerConfig);

const pointsController = new PointsController();
const itemsController = new ItemsController();

routes.get("/", (req, res) => {
  return res.json({ message: "🔥 Api" });
});

//Items
routes.get("/getItems", itemsController.index);
//Points
routes.get("/points", pointsController.index);
routes.get("/points/:id", pointsController.show);
routes.get("/getPoints", pointsController.listPoints);

routes.post(
  "/createPoint",
  upload.single("image"),

  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required(),
      whatsapp: Joi.number().required(),
      latitude: Joi.number().required(),
      longitude: Joi.string().required(),
      city: Joi.string().required(),
      uf: Joi.string().required().max(2),
      items: Joi.string().required(),
    }),

  }, {
    abortEarly: false
  }),
  pointsController.create
);
export default routes;
