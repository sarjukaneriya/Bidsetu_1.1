import mongoose from "mongoose";

const aiPredictionSchema = new mongoose.Schema({
  // Price prediction data
  pricePredictions: [{
    auctionId: { type: mongoose.Schema.Types.ObjectId, ref: "Auction" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "ProductCategory" },
    predictedPrice: Number,
    confidence: Number, // 0-100
    factors: [{
      factor: String,
      weight: Number,
      impact: String // "positive", "negative", "neutral"
    }],
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Demand forecasting
  demandForecasts: [{
    category: { type: mongoose.Schema.Types.ObjectId, ref: "ProductCategory" },
    location: { type: mongoose.Schema.Types.ObjectId, ref: "City" },
    predictedDemand: Number,
    confidence: Number,
    timeFrame: { type: String, enum: ["weekly", "monthly", "quarterly"] },
    seasonalFactor: Number,
    trendDirection: { type: String, enum: ["increasing", "decreasing", "stable"] },
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Market trends
  marketTrends: [{
    category: { type: mongoose.Schema.Types.ObjectId, ref: "ProductCategory" },
    averagePrice: Number,
    priceVolatility: Number,
    supplyDemandRatio: Number,
    competitionLevel: Number, // 0-100
    marketSize: Number,
    growthRate: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Fraud detection
  fraudAlerts: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    auctionId: { type: mongoose.Schema.Types.ObjectId, ref: "Auction" },
    riskScore: Number, // 0-100
    riskFactors: [{
      factor: String,
      score: Number,
      description: String
    }],
    alertType: { type: String, enum: ["bid_manipulation", "fake_supplier", "payment_fraud", "behavioral"] },
    status: { type: String, enum: ["pending", "investigating", "resolved", "false_positive"] },
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Win probability predictions
  winProbabilities: [{
    auctionId: { type: mongoose.Schema.Types.ObjectId, ref: "Auction" },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bidAmount: Number,
    winProbability: Number, // 0-100
    factors: [{
      factor: String,
      impact: Number,
      description: String
    }],
    recommendedBid: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Supplier ranking predictions
  supplierRankings: [{
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "ProductCategory" },
    predictedRank: Number,
    rankingFactors: [{
      factor: String,
      weight: Number,
      score: Number
    }],
    expectedPerformance: {
      winRate: Number,
      averageBidAmount: Number,
      deliveryScore: Number,
      qualityScore: Number
    },
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Model performance tracking
  modelPerformance: [{
    modelType: { type: String, enum: ["price_prediction", "demand_forecast", "fraud_detection", "win_probability"] },
    accuracy: Number,
    precision: Number,
    recall: Number,
    f1Score: Number,
    trainingDate: Date,
    lastUpdated: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Indexes for performance
aiPredictionSchema.index({ "pricePredictions.auctionId": 1 });
aiPredictionSchema.index({ "demandForecasts.category": 1, "demandForecasts.location": 1 });
aiPredictionSchema.index({ "fraudAlerts.status": 1, "fraudAlerts.riskScore": -1 });
aiPredictionSchema.index({ "winProbabilities.auctionId": 1, "winProbabilities.supplierId": 1 });

const AIPrediction = mongoose.model("AIPrediction", aiPredictionSchema);

export default AIPrediction; 