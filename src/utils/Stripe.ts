import Stripe from "stripe"; // Correct import with a capital 'S'
import { getEnvironmentVariables } from "../environments/environment";

export class StripeService {
  private static _stripe = new Stripe(
    getEnvironmentVariables().stripe.secret_key
  );

  static async checkout(data: { items: any[]; deliveryCharge: number }) {
    try {
      const session = await StripeService._stripe.checkout.sessions.create({
        line_items: [
          ...data.items.map((item) => ({
            price_data: {
              currency: "zar",
              product_data: {
                name: item.name,
                images: ["http://localhost:3000/" + item.cover],
              },
              unit_amount: item.price * 100,
            },
            quantity: item.quantity,
          })),
          {
            price_data: {
              currency: "zar",
              product_data: {
                name: "Delivery charge",
              },
              unit_amount: data.deliveryCharge,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: "http://localhost:4200/success",
        cancel_url: "http://localhost:4200/cancel",
      });
      return session;
    } catch (e) {
      throw e;
    }
  }

  static async createCustomer(name: string, email: string) {
    try {
      const params: Stripe.CustomerCreateParams = {
        email: email,
        name: name,
      };

      const customer: Stripe.Customer =
        await StripeService._stripe.customers.create(params);
      console.log(customer.id);
    } catch (e) {
      throw e;
    }
  }
}
