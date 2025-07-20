import mongoose from "mongoose";

const aiRecommendationSchema = new mongoose.Schema({
  // User preferences and behavior tracking
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userType: { type: String, enum: ["buyer", "seller"], required: true },
  
  // Category preferences and expertise
  preferredCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "ProductCategory" }],
  categoryExpertise: [{
    category: { type: mongoose.Schema.Types.ObjectId, ref: "ProductCategory" },
    expertiseScore: { type: Number, default: 0 }, // 0-100
    totalBids: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 }, // 0-100
    averageBidAmount: { type: Number, default: 0 }
  }],
  
  // Location preferences
  preferredLocations: [{ type: mongoose.Schema.Types.ObjectId, ref: "City" }],
  locationRadius: { type: Number, default: 50 }, // km
  
  // Price preferences
  priceRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 1000000 }
  },
  
  // Behavioral data
  searchHistory: [{
    query: String,
    timestamp: { type: Date, default: Date.now },
    clickedResults: [String]
  }],
  
  // Interaction patterns
  bidHistory: [{
    auctionId: { type: mongoose.Schema.Types.ObjectId, ref: "Auction" },
    bidAmount: Number,
    timestamp: { type: Date, default: Date.now },
    won: Boolean
  }],
  
  // AI-generated scores
  aiScores: {
    reliabilityScore: { type: Number, default: 0 }, // 0-100
    qualityScore: { type: Number, default: 0 }, // 0-100
    deliveryScore: { type: Number, default: 0 }, // 0-100
    overallScore: { type: Number, default: 0 } // 0-100
  },
  
  // Recommendation cache
  cachedRecommendations: [{
    auctionId: { type: mongoose.Schema.Types.ObjectId, ref: "Auction" },
    score: Number,
    reason: String,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Learning preferences
  learningPreferences: {
    notificationFrequency: { type: String, enum: ["immediate", "daily", "weekly"], default: "daily" },
    preferredNotificationTypes: [{ type: String }],
    autoBidEnabled: { type: Boolean, default: false },
    maxAutoBidAmount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes for performance
aiRecommendationSchema.index({ userId: 1, userType: 1 });
aiRecommendationSchema.index({ "categoryExpertise.category": 1 });
aiRecommendationSchema.index({ "aiScores.overallScore": -1 });

const AIRecommendation = mongoose.model("AIRecommendation", aiRecommendationSchema);

export default AIRecommendation; 