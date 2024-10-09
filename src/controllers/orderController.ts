import Order from "../models/Order";
import { StripeService } from "../utils/Stripe";

export class orderController {
  static async placeOrder(req, res, next) {
    const data = req.body;
    const user_id = req.user.aud;
    const restaurant = req.restaurant;
    try {
      let orderData: any = {
        user_id,
        restaurant_id: data.restaurant_id,
        order: data.order,
        status: data.status,
        payment_mode: data.payment_mode,
        payment_status: data.payment_status,
        total: data.total,
        grandTotal: data.grandTotal,
        deliveryCharge: data.deliveryCharge,
      };

      if (data.instruction)
        orderData = { ...orderData, instruction: data.instruction };
      const order = await new Order(orderData).save();
      //   const address = await new Address(addressData).save();
      //   // delete order.user_id;
      //   // delete order.__v;
      const response_order = {
        user_id,
        restaurant_id: order.restaurant_id,
        order: order.order,
        status: JSON.parse(order.status),
        instruction: order.instruction || null,
        payment_mode: order.payment_mode,
        payment_status: order.payment_status,
        total: order.total,
        grandTotal: order.grandTotal,
        deliveryCharge: order.deliveryCharge,
        created_at: order.created_at,
        update_at: order.updated_at,
      };
      res.send(response_order);
    } catch (e) {
      next(e);
    }
  }

  static async getUserOrders(req, res, next) {
    const user_id = req.user.aud;
    const perPage = 5;
    const currentPage = parseInt(req.query.page) || 1;
    const prevPage = currentPage == 1 ? null : currentPage - 1;
    let nextPage = currentPage + 1;
    try {
      const orders_doc_count = await Order.countDocuments({ user_id });
      // send an empty array if no document on filter query exists
      if (!orders_doc_count) {
        res.json({
          orders: [],
          perPage,
          currentPage,
          prevPage,
          nextPage: null,
          totalPages: 0,
          // totalRecords: orders_doc_count,
        });
      }
      const totalPages = Math.ceil(orders_doc_count / perPage);
      if (totalPages == 0 || totalPages == currentPage) {
        nextPage = null;
      }
      if (totalPages < currentPage) {
        throw "No more orders available";
      }
      const orders = await Order.find({ user_id }, { user_id: 0, __v: 0 })
        .skip(perPage * currentPage - perPage)
        .limit(perPage)
        .sort({ created_at: -1 })
        .populate("restaurant_id")
        .exec();
      //   res.send(orders);
      res.json({
        orders,
        perPage,
        currentPage,
        prevPage,
        nextPage,
        totalPages,
        // totalRecords: orders_doc_count,
      });
    } catch (e) {
      next(e);
    }
  }

  static async stripeCheckout(req, res, next) {
    const data = req.body;
    // const user_id = req.user.aud;
    // const restaurant = req.restaurant;
    try {
      let orderData: any = {
        // user_id,
        // restaurant_id: data.restaurant_id,
        items: JSON.parse(data.order),
        // status: data.status,
        // payment_mode: data.payment_mode,
        // payment_status: data.payment_status,
        // total: data.total,
        // grandTotal: data.grandTotal,
        deliveryCharge: data.deliveryCharge,
      };

      const session = await StripeService.checkout(orderData);
      res.send(session);
    } catch (e) {
      next(e);
    }
  }
}
