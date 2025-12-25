import DeliveryPartner from "../models/deliveryPartner.js";
import { handleResponse } from "../utils/handleResponse.js";

export const listPartners = async (req, res) => {
  try {
    const partners = await DeliveryPartner.find().sort({ createdAt: -1 });
    return handleResponse(res, 200, "Partners fetched", partners);
  } catch (err) {
    return handleResponse(res, 500, "Server Error", { error: err.message });
  }
};

export const createPartner = async (req, res) => {
  try {
    const { name, phone, email, notes } = req.body;
    if (!name) return handleResponse(res, 400, "name required");
    const p = await DeliveryPartner.create({ name, phone, email, notes });
    return handleResponse(res, 201, "Partner created", p);
  } catch (err) {
    return handleResponse(res, 500, "Server Error", { error: err.message });
  }
};



