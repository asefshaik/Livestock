const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const livestockSchema = new mongoose.Schema(
  {
    animalId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Farmer reference is required"],
      index: true,
    },
    animalType: {
      type: String,
      required: [true, "Animal type is required"],
      enum: [
        "Cattle",
        "Goat",
        "Sheep",
        "Pig",
        "Poultry",
        "Horse",
        "Camel",
        "Buffalo",
        "Other",
      ],
    },
    breed: {
      type: String,
      required: [true, "Breed is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [0, "Age cannot be negative"],
    },
    weight: {
      type: Number,
      required: [true, "Weight is required"],
      min: [0, "Weight cannot be negative"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    images: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length >= 3 && v.length <= 10;
        },
        message: "Between 3 and 10 images are required",
      },
      default: [],
    },
    // Image labels/view types for AI health scanning (e.g., [{url: "...", label: "front"}, ...])
    imageLabels: {
      type: [
        {
          url: String,
          label: {
            type: String,
            enum: ["front", "back", "side", "extra"],
          },
        },
      ],
      default: [],
    },
    videos: {
      type: [String],
      default: [],
    },
    // AI Health Score fields
    healthScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    healthStatus: {
      type: String,
      enum: ["healthy", "moderate", "risk", "pending", null],
      default: null,
    },
    isHealthVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compute healthStatus from score on save
livestockSchema.pre("save", function (next) {
  if (this.healthScore !== null && this.healthScore !== undefined) {
    if (this.healthScore > 85) this.healthStatus = "healthy";
    else if (this.healthScore >= 60) this.healthStatus = "moderate";
    else this.healthStatus = "risk";
    this.isHealthVerified = true;
  }
  next();
});

module.exports = mongoose.model("Livestock", livestockSchema);
