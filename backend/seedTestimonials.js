require("dotenv").config();
const mongoose = require("mongoose");
const Testimonial = require("./models/Testimonial");

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Dairy Farmer",
    location: "Punjab",
    message:
      "LiveHub transformed how I sell my cattle. The AI health scores build trust instantly with buyers!",
    avatar: "R",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Livestock Buyer",
    location: "Maharashtra",
    message:
      "I've bought 3 animals through LiveHub. The verified health scores gave me confidence I never had before.",
    avatar: "P",
    rating: 5,
  },
  {
    name: "Amit Singh",
    role: "Goat Farmer",
    location: "Rajasthan",
    message:
      "Listed my goats and got inquiries within hours. The platform is simple, professional, and it actually works.",
    avatar: "A",
    rating: 5,
  },
];

const seed = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    await Testimonial.deleteMany({});
    await Testimonial.insertMany(testimonials);

    console.log("Successfully seeded testimonials! ✅");
    process.exit();
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seed();
