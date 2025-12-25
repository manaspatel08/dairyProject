import joi from "joi";

export const superAdminSchemaValidator = joi.object({
  email: joi.string().email().required().messages({
    "string.email": "email must be a valid email.",
    "string.empty": "email cannot be empty.",
    "any.required": "email is a required field.",
  }),
  password: joi.string().min(8).required().messages({
    "string.min": "password must be at least 8 characters long.",
    "string.empty": "password cannot be empty.",
    "any.required": "password is a required field.",
  }),
  mobileNo: joi.string().min(10).max(15).required().messages({
    "string.min": "Mobile number must be at least 10 digits long.",
    "string.max": "Mobile number cannot exceed 15 digits.",
    "string.empty": "Mobile number cannot be empty.",
    "any.required": "Mobile number is a required field.",
  }),
});

export const adminSchemaValidator = joi.object({
  email: joi.string().email().required().messages({
    "string.email": "email must be a valid email.",
    "string.empty": "email cannot be empty.",
    "any.required": "email is a required field.",
  }),
  password: joi.string().min(8).required().messages({
    "string.min": "password must be at least 8 characters long.",
    "string.empty": "password cannot be empty.",
    "any.required": "password is a required field.",
  }),
});

export const storeSchemaValidator = joi.object({
  Store_Name: joi.string().max(255).required().messages({
    "string.max": "store name cannot exceed 255 characters",
    "string.empty": "store name cannot be empty",
    "any.required": "store name is a required field",
  }),
  Store_Adress: joi.string().max(255).required().messages({
    "string.max": "Store address cannot exceed 255 characters.",
    "string.empty": "Store address cannot be empty.",
    "any.required": "Store address is a required field.",
  }),
  Store_contactNo: joi.string().min(10).max(15).required().messages({
    "string.min": "Mobile number must be at least 10 digits long.",
    "string.max": "Mobile number cannot exceed 15 digits.",
    "string.empty": "Mobile number cannot be empty.",
    "any.required": "Mobile number is a required field.",
  }),
  Store_bank_account_no: joi.string().min(10).max(16).required().messages({
    "string.min": "bank account number must be at least 10 digits long.",
    "string.max": "bank account number cannot exceed 16 digits.",
    "string.empty": "bank account number cannot be empty.",
    "any.required": "bank account number is a required field.",
  }),
  store_ifsc_code: joi.string().alphanum().required().messages({
    "string.empty": "IFSC code cannot be empty.",
    "any.required": "IFSC code is a required field.",
  }),
});

export const customerSchemaValidator = joi.object({
  email: joi.string().email().required().messages({
    "string.email": "email must be a valid email.",
    "string.empty": "email cannot be empty.",
    "any.required": "email is a required field.",
  }),
  password: joi.string().min(8).required().messages({
    "string.min": "password must be at least 8 characters long.",
    "string.empty": "password cannot be empty.",
    "any.required": "password is a required field.",
  }),
  mobileNo: joi.string().min(10).max(15).required().messages({
    "string.min": "Mobile number must be at least 10 digits long.",
    "string.max": "Mobile number cannot exceed 15 digits.",
    "string.empty": "Mobile number cannot be empty.",
    "any.required": "Mobile number is a required field.",
  }),
});
