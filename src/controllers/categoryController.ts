import Category from "../models/Category";

export class categoryController {
  static async getCategoriesByRestaurant(req, res, next) {
    try {
      const restaurant_id = req.params.restaurantId;
      const categories = await Category.find({ restaurant_id }, { __v: 0 });
      // .populate("restaurant_id")
      // .exec();
      res.send(categories);
    } catch (e) {
      next(e);
    }
  }
}
