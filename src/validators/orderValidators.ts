import { body } from "express-validator";
import Restaurant from "../models/Restaurant";

export class orderValidators {
  static placeOrder() {
    return [
      body("restaurant_id", "Restaurant ID is required")
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
      body("ORDER", "Order Items is required").isString(),
      body("address", "Address is required").isString(),
      body("status", "Order status is required").isString(),
      body("payment_status", "Payment is required").isString(),
      body("payment_mode", "Payment mode is required").isString(),
      body("total", "Order Total is required").isNumeric(),
      body("grandTotal", "Order grandtotal is required").isNumeric(),
      body("deliveryCharge", "Delivery Charge is required").isNumeric(),
    ];
  }
}
