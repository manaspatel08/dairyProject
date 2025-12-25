import Store from "../models/store.js";
import { handleResponse } from "../utils/handleResponse.js";
import { storeSchemaValidator } from "../validators/schemaValidation.js";

export const createStore = async (req, res) => {
  try {
    const { error } = storeSchemaValidator.validate(req.body);
    if (error) {
      return handleResponse(res, 400, error.details[0].message);
    }

    const {
      Store_Name,
      Store_Adress,
      Store_contactNo,
      Store_bank_account_no,
      store_ifsc_code,
    } = req.body;

    const existingStore = await Store.findOne({ owner: req.user.id });
    if (existingStore) {
      return handleResponse(res, 409, "You already have a store registered.");
    }

    const duplicateStore = await Store.findOne({
      $or: [
        { Store_bank_account_no },
        { Store_contactNo },
      ],
    });

    if (duplicateStore) {
      if (duplicateStore.Store_bank_account_no === Store_bank_account_no) {
        return handleResponse(res, 409, "Store bank account number already exists.");
      }
      if (duplicateStore.Store_contactNo === Store_contactNo) {
        return handleResponse(res, 409, "Store contact number already exists.");
      }
    }

    const newStore = await Store.create({
      Store_Name,
      Store_Adress,
      Store_contactNo,
      Store_bank_account_no,
      store_ifsc_code,
      owner: req.user.id,
    });

    return handleResponse(res, 201, "Store created successfully", {
      store: newStore,
    });
  } catch (error) {
    return handleResponse(res, 400, "Bad Request", { error: error.message });
  }
};

export const getStoreByOwner = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    
    if (!store) {
      return handleResponse(res, 404, "Store not found for this admin");
    }

    return handleResponse(res, 200, "Store fetched successfully", {
      store: store,
    });
  } catch (error) {
    return handleResponse(res, 500, "Server Error", { error: error.message });
  }
};

