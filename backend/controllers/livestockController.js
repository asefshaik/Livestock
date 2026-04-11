const Livestock = require("../models/Livestock");
const axios = require("axios");

// @desc    Create livestock listing
// @route   POST /api/livestock
// @access  Private (Farmer)
const createLivestock = async (req, res, next) => {
  try {
    const {
      animalType,
      breed,
      age,
      weight,
      price,
      description,
      location,
      imageLabels: imageLabelsParsed,
    } = req.body;

    // Get all uploaded images
    const imageFiles = req.files
      ? req.files.filter((f) => f.fieldname === "images")
      : [];
    const images = imageFiles.map((file) => file.path || file.location);

    // Parse image labels from JSON string
    let labelMap = {};
    if (imageLabelsParsed) {
      try {
        const labelArray = JSON.parse(imageLabelsParsed);
        labelArray.forEach((item) => {
          labelMap[item.index] = item.label;
        });
      } catch (parseErr) {
        console.warn("Failed to parse imageLabels JSON:", parseErr);
      }
    }

    // Build imageLabels array with image URLs and labels
    const imageLabels = [];
    imageFiles.forEach((file, idx) => {
      const label = labelMap[idx] || "extra";
      imageLabels.push({
        url: file.path || file.location,
        label: (label || "extra").toLowerCase(),
      });
    });

    const livestock = await Livestock.create({
      farmerId: req.user._id,
      animalType,
      breed,
      age: Number(age),
      weight: Number(weight),
      price: Number(price),
      description,
      location,
      images,
      imageLabels,
    });

    await livestock.populate(
      "farmerId",
      "name email location phone profileImage"
    );

    res.status(201).json({ success: true, data: livestock });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all livestock
// @route   GET /api/livestock
// @access  Public
const getAllLivestock = async (req, res, next) => {
  try {
    const {
      animalType,
      location,
      minPrice,
      maxPrice,
      healthStatus,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };

    if (animalType) query.animalType = animalType;
    if (location) query.location = { $regex: location, $options: "i" };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (healthStatus) query.healthStatus = healthStatus;

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    else if (sort === "price_desc") sortOption = { price: -1 };
    else if (sort === "health_score") sortOption = { healthScore: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Livestock.countDocuments(query);
    const livestock = await Livestock.find(query)
      .populate("farmerId", "name email location phone profileImage")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: livestock,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single livestock
// @route   GET /api/livestock/:id
// @access  Public
const getLivestock = async (req, res, next) => {
  try {
    const livestock = await Livestock.findById(req.params.id).populate(
      "farmerId",
      "name email location phone profileImage"
    );

    if (!livestock) {
      return res
        .status(404)
        .json({ success: false, message: "Livestock not found" });
    }

    res.json({ success: true, data: livestock });
  } catch (error) {
    next(error);
  }
};

// @desc    Update livestock
// @route   PUT /api/livestock/:id
// @access  Private (Farmer - owner)
const updateLivestock = async (req, res, next) => {
  try {
    const livestock = await Livestock.findById(req.params.id);

    if (!livestock) {
      return res
        .status(404)
        .json({ success: false, message: "Livestock not found" });
    }

    // Check ownership
    if (livestock.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this listing",
      });
    }

    // Prevent changing farmerId or animalId
    const { farmerId, animalId, ...updateData } = req.body;

    const newImages = req.files ? req.files.map((file) => file.path) : [];

    // Apply updates
    Object.keys(updateData).forEach((key) => {
      livestock[key] = updateData[key];
    });

    if (newImages.length > 0) {
      livestock.images = [...(livestock.images || []), ...newImages];
    }

    await livestock.save();
    await livestock.populate(
      "farmerId",
      "name email location phone profileImage"
    );

    res.json({ success: true, data: livestock });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete livestock
// @route   DELETE /api/livestock/:id
// @access  Private (Farmer - owner)
const deleteLivestock = async (req, res, next) => {
  try {
    const livestock = await Livestock.findById(req.params.id);

    if (!livestock) {
      return res
        .status(404)
        .json({ success: false, message: "Livestock not found" });
    }

    if (livestock.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this listing",
      });
    }

    await Livestock.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Livestock listing deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get farmer's listings
// @route   GET /api/farmer/livestock
// @access  Private (Farmer)
const getFarmerLivestock = async (req, res, next) => {
  try {
    const livestock = await Livestock.find({ farmerId: req.user._id }).sort({
      createdAt: -1,
    });

    const stats = {
      total: livestock.length,
      verified: livestock.filter((l) => l.isHealthVerified).length,
      avgHealthScore:
        livestock.filter((l) => l.healthScore !== null).length > 0
          ? Math.round(
              livestock
                .filter((l) => l.healthScore !== null)
                .reduce((sum, l) => sum + l.healthScore, 0) /
                livestock.filter((l) => l.healthScore !== null).length
            )
          : null,
    };

    res.json({ success: true, data: livestock, stats });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze livestock health score
// @route   POST /api/livestock/analyze/:livestockId
// @access  Private (Farmer - owner only)
const analyzeHealthScore = async (req, res, next) => {
  try {
    const { livestockId } = req.params;

    // Get images from multer files
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No images provided for analysis" });
    }

    // Validate livestock exists
    const livestock = await Livestock.findById(livestockId);
    if (!livestock) {
      return res
        .status(404)
        .json({ success: false, message: "Livestock not found" });
    }

    // Check ownership - only the farmer who added the livestock can analyze it
    if (livestock.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to analyze this livestock. Only the owner can request health analysis.",
      });
    }

    try {
      // Convert files to base64
      // Note: req.files from Cloudinary multer have .path as URL or .location
      const imageDatas = await Promise.all(
        req.files.map(async (file) => {
          // Get the image URL (could be file.path or file.location)
          const imageUrl = file.location || file.path;

          console.log("Fetching image from:", imageUrl);

          // Fetch image from URL
          const response = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            timeout: 10000,
          });

          // Convert to base64
          return Buffer.from(response.data, "binary").toString("base64");
        })
      );

      console.log(`Converted ${imageDatas.length} images to base64`);
      console.log("Sending to AI service at http://localhost:8000/analyze");

      // Call AI service (FastAPI on port 8000)
      const response = await axios.post(
        "http://localhost:8000/analyze",
        {
          images: imageDatas,
          animalType: livestock.animalType,
          breed: livestock.breed,
        },
        {
          timeout: 30000, // 30 second timeout
        }
      );

      const analysisResult = response.data;
      console.log("AI service response:", analysisResult);

      // Update livestock with health score
      livestock.healthScore =
        analysisResult.healthScore || analysisResult.score || 0;
      livestock.healthStatus =
        analysisResult.status || analysisResult.healthStatus || "unknown";
      livestock.isHealthVerified = true;
      livestock.healthAnalysis =
        analysisResult.analysis || analysisResult.details || "";

      await livestock.save();

      // Return detailed analysis
      res.json({
        success: true,
        data: {
          livestockId: livestock._id,
          healthScore: livestock.healthScore,
          healthStatus: livestock.healthStatus,
          healthAnalysis: livestock.healthAnalysis,
          message: "Health analysis completed successfully",
        },
      });
    } catch (aiError) {
      console.error("AI Service Error:", aiError.message);
      console.error("Error code:", aiError.code);
      console.error("Error response:", aiError.response?.data);

      if (aiError.code === "ECONNREFUSED") {
        return res.status(503).json({
          success: false,
          message:
            "AI service is not available. Please ensure the FastAPI service is running on port 8000.",
        });
      }

      if (aiError.response?.status === 413) {
        return res.status(413).json({
          success: false,
          message: "Images are too large. Please use smaller images.",
        });
      }

      if (aiError.code === "ENOTFOUND") {
        return res.status(503).json({
          success: false,
          message: "Cannot reach AI service. Check if port 8000 is available.",
        });
      }

      throw aiError;
    }
  } catch (error) {
    console.error("Analysis error:", error);
    next(error);
  }
};

module.exports = {
  createLivestock,
  getAllLivestock,
  getLivestock,
  updateLivestock,
  deleteLivestock,
  getFarmerLivestock,
  analyzeHealthScore,
};
