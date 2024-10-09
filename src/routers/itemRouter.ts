import { Router } from "express";
import { GlobalMiddleWare } from "../middlewares/GlobalMiddleWare";
import { itemController } from "../controllers/itemController";
import { itemValidators } from "../validators/itemValidators";
import { Utils } from "../utils/Utils";

class itemRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.getRoutes();
    this.postRoutes();
    this.patchRoutes();
    this.putRoutes();
    this.deleteRoutes();
  }

  getRoutes() {
    this.router.get(
      "/menuItems/:restaurantId",
      GlobalMiddleWare.auth,
      itemValidators.getMenuItems(),
      GlobalMiddleWare.checkError,
      GlobalMiddleWare.adminRole,
      itemController.getMenu
    );
  }

  postRoutes() {
    this.router.post(
      "/create",
      GlobalMiddleWare.auth,
      GlobalMiddleWare.adminRole,
      new Utils().multer.single("itemImages"),
      itemValidators.addItem(),
      GlobalMiddleWare.checkError,
      itemController.addItem
    );
  }

  patchRoutes() {}

  putRoutes() {}

  deleteRoutes() {}
}

export default new itemRouter().router;
