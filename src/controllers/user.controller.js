import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/User.model.js";
import {
  getImageUrl,
  deleteLocalImage,
} from "../middleware/upload.middleware.js";

// ─────────────────────────────────────────────
//  UPDATE PROFILE
//  @route  PATCH /api/v1/users/profile
//  @access Private
//
//  Body (multipart/form-data):
//    name  → optional new display name
//    image → optional new avatar image file
// ─────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  const { name } = req.body;

  if (name) user.name = name;

  // If a new avatar was uploaded replace the old one
  if (req.file) {
    deleteLocalImage(user.avatar?.url);
    user.avatar = {
      url:       getImageUrl(req.file.filename),
      public_id: req.file.filename,
    };
  }

  await user.save();

  res.status(200).json(
    new ApiResponse(200, {
      user: {
        id:     user._id,
        name:   user.name,
        email:  user.email,
        avatar: user.avatar?.url || null,
        role:   user.role,
      },
    }, "Profile updated successfully")
  );
});

// ─────────────────────────────────────────────
//  GET ADDRESSES
//  @route  GET /api/v1/users/addresses
//  @access Private
// ─────────────────────────────────────────────
export const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("addresses");
  if (!user) throw new ApiError(404, "User not found");

  res.status(200).json(
    new ApiResponse(200, { addresses: user.addresses }, "Addresses fetched")
  );
});

// ─────────────────────────────────────────────
//  ADD ADDRESS
//  @route  POST /api/v1/users/addresses
//  @access Private
//
//  Body: { label, line1, city, state, postalCode, country, isDefault }
//  If isDefault is true → demote all other addresses first
// ─────────────────────────────────────────────
export const addAddress = asyncHandler(async (req, res) => {
  const { label, line1, city, state, postalCode, country, isDefault } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  // Max 5 saved addresses per user
  if (user.addresses.length >= 5) {
    throw new ApiError(400, "Maximum of 5 addresses allowed. Please remove one first.");
  }

  // If this is the default address, demote all existing ones
  if (isDefault) {
    user.addresses.forEach((addr) => { addr.isDefault = false; });
  }

  // If it's the first address, auto-set as default
  const shouldBeDefault = isDefault || user.addresses.length === 0;

  user.addresses.push({
    label:      label || "Home",
    line1,
    city,
    state,
    postalCode,
    country,
    isDefault: shouldBeDefault,
  });

  await user.save();

  res.status(201).json(
    new ApiResponse(201, { addresses: user.addresses }, "Address added successfully")
  );
});

// ─────────────────────────────────────────────
//  UPDATE ADDRESS
//  @route  PATCH /api/v1/users/addresses/:addressId
//  @access Private
// ─────────────────────────────────────────────
export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  const address = user.addresses.id(req.params.addressId);
  if (!address) throw new ApiError(404, "Address not found");

  const { label, line1, city, state, postalCode, country, isDefault } = req.body;

  if (label      !== undefined) address.label      = label;
  if (line1      !== undefined) address.line1      = line1;
  if (city       !== undefined) address.city       = city;
  if (state      !== undefined) address.state      = state;
  if (postalCode !== undefined) address.postalCode = postalCode;
  if (country    !== undefined) address.country    = country;

  // If setting this address as default, demote all others first
  if (isDefault) {
    user.addresses.forEach((addr) => { addr.isDefault = false; });
    address.isDefault = true;
  }

  await user.save();

  res.status(200).json(
    new ApiResponse(200, { addresses: user.addresses }, "Address updated successfully")
  );
});

// ─────────────────────────────────────────────
//  DELETE ADDRESS
//  @route  DELETE /api/v1/users/addresses/:addressId
//  @access Private
//
//  If the deleted address was the default,
//  auto-promote the first remaining address.
// ─────────────────────────────────────────────
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  const address = user.addresses.id(req.params.addressId);
  if (!address) throw new ApiError(404, "Address not found");

  const wasDefault = address.isDefault;

  address.deleteOne();

  // Auto-promote first remaining address to default
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  res.status(200).json(
    new ApiResponse(200, { addresses: user.addresses }, "Address deleted successfully")
  );
});
