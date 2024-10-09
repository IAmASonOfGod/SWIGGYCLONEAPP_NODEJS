import { body, param } from "express-validator";
import Restaurant from "../models/Restaurant";
import Category from "../models/Category";

export class itemValidators {
  static addItem() {
    return [
      body("itemImages", "Cover image is required").custom((cover, { req }) => {
        if (req.file) {
          return true;
        } else {
          throw new Error("Cover image is required");
        }
      }),
      body("name", "Item name is required").isString(),
      body("restaurant_id", "Restaurant Id is required")
        .isString()
        .custom((restaurant_id, { req }) => {
          return Restaurant.findById(restaurant_id)
            .then((restaurant) => {
              if (restaurant) {
                return true;
              } else {
                // throw new Error("User Already Exists");
                throw "Restaurant does not exists";
              }
            })
            .catch((e) => {
              throw new Error(e);
            });
        }),
      body("category_id", "Category Id is required")
        .isString()
        .custom((category_id, { req }) => {
          return Category.findOne({
            _id: category_id,
            restaurant_id: req.body.restaurant_id,
          })
            .then((category) => {
              if (category) {
                return true;
              } else {
                // throw new Error("User Already Exists");
                throw "CATEGORY does not exists";
              }
            })
            .catch((e) => {
              throw new Error(e);
            });
        }),
      body("status", "Status is required").isString(),
      body("price", "Item is veg or not is required").isBoolean(),
      body("veg", "Status is required").isBoolean(),
    ];
  }

  static getMenuItems() {
    return [
      param("restaurantId", "Restaurant Id is required")
        .isString()
        .custom((restaurant_id, { req }) => {
          return Restaurant.findById(restaurant_id)
            .then((restaurant) => {
              if (restaurant) {
                req.restaurant = restaurant;
                return true;
              } else {
                // throw new Error("User Already Exists");
                throw "Restaurant does not exists";
              }
            })
            .catch((e) => {
              throw new Error(e);
            });
        }),
    ];
  }
}
