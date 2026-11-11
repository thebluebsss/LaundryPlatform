// @ts-nocheck
import mongoose from "mongoose";

const laundryServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true, // wash_fold, dry_clean, heavy_items, special_care
    },
    pricingType: {
      type: String,
      required: true, // per_kg, per_item
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    unitName: {
      type: String,
      required: true, // kg, cái, bộ...
    },
    description: {
      type: String,
      default: "",
    },
    iconName: {
      type: String,
      default: "Shirt",
    },
    durationDays: {
      type: Number,
      default: 1,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    customId: {
      type: String, // To map to old / static client id (e.g. 'wf-regular', 'wf-premium')
      default: null,
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret.customId || ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const LaundryService = mongoose.models.LaundryService || mongoose.model("LaundryService", laundryServiceSchema);
export default LaundryService;
