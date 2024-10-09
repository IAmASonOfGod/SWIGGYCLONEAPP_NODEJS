import { body, query } from "express-validator";
import User from "../models/User";

export class restaurantValidators {
  static addRestaurant() {
    return [
      body("name", "Owner name is required").isString(),
      body("email", "Valid email is required")
        .isEmail()
        .custom((email) => {
          return User.findOne({ email })
            .then((user) => {
              if (user) {
                throw new Error("User already exists");
              } else {
                return true;
              }
            })
            .catch((e) => {
              throw new Error(e);
            });
        }),
      body("phone", "Phone number is required").isString(),
      body("password")
        .isAlphanumeric()
        .withMessage("Password must contain only letters and numbers")
        .isLength({ min: 8, max: 25 })
        .withMessage("Password must be between 8-25 characters"),
      body("restaurantImages", "Cover image is required").custom(
        (value, { req }) => {
          if (req.file) {
            return true;
          } else {
            throw new Error("Cover image is required");
          }
        }
      ),
      body("res_name", "Restaurant name is required").isString(),
      body("openTime", "Opening time is required").isString(),
      body("closeTime", "Closing time is required").isString(),
      body("short_name", "Restaurant short name is required").isString(),
      body("status", "Status is required").isString(),
      body("address", "Address is required").isString(),
      body("location", "Location is required").isString(),
      body("delivery_time", "Delivery time is required").isString(),
      body("cuisines", "Cuisines are required").isString(),
      body("city_id", "City ID is required").isString(),
      body("price", "Price is required").isString(),
    ];
  }

  static getNearbyRestaurants() {
    return [
      query("lat", "Latitude is required").isNumeric(),
      query("lng", "Longitude is required").isNumeric(),
      query("radius", "Radius is required").isNumeric(),
    ];
  }

  static searchNearbyRestaurants() {
    return [
      query("lat", "Latitude is required").isNumeric(),
      query("lng", "Longitude is required").isNumeric(),
      query("radius", "Radius is required").isNumeric(),
      query("name", "Search is required").isString(),
    ];
  }
}
