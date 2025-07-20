import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import aiRecommendationService from "../services/aiRecommendationService.js";
import aiPredictionService from "../services/aiPredictionService.js";
import AIRecommendation from "../models/aiRecommendation.model.js";
import AIPrediction from "../models/aiPrediction.model.js";
import Auction from "../models/auction.model.js";

// @desc Get AI supplier recommendations for an auction
// @route GET /api/v1/ai/recommendations/:auctionId
// @access Private
const getSupplierRecommendations = asyncHandler(async (req, res) => {
  const { auctionId } = req.params;
  const { limit = 10 } = req.query;

  const recommendations = await aiRecommendationService.getSupplierRecommendations(
    auctionId,
    parseInt(limit)
  );

  res.status(200).json(
    new ApiResponse(200, recommendations, "Supplier recommendations retrieved successfully")
  );
});

// @desc Get AI bid suggestions for a supplier
// @route GET /api/v1/ai/bid-suggestions/:auctionId
// @access Private
const getBidSuggestions = asyncHandler(async (req, res) => {
  const { auctionId } = req.params;
  const supplierId = req.user._id;

  const suggestions = await aiRecommendationService.getBidSuggestions(auctionId, supplierId);

  if (!suggestions) {
    throw new ApiError(404, "Unable to generate bid suggestions");
  }

  res.status(200).json(
    new ApiResponse(200, suggestions, "Bid suggestions generated successfully")
  );
});

// @desc Get AI price prediction for an auction
// @route GET /api/v1/ai/price-prediction/:auctionId
// @access Private
const getPricePrediction = asyncHandler(async (req, res) => {
  const { auctionId } = req.params;

  const prediction = await aiPredictionService.predictOptimalPrice(auctionId);

  // Save prediction data
  await aiPredictionService.savePrediction('price_prediction', {
    auctionId,
    category: req.body.categoryId,
    predictedPrice: prediction.predictedPrice,
    confidence: prediction.confidence,
    factors: prediction.factors,
    timestamp: new Date()
  });

  res.status(200).json(
    new ApiResponse(200, prediction, "Price prediction generated successfully")
  );
});

// @desc Get AI demand forecast
// @route GET /api/v1/ai/demand-forecast
// @access Private
const getDemandForecast = asyncHandler(async (req, res) => {
  const { categoryId, locationId, timeFrame = 'monthly' } = req.query;

  if (!categoryId || !locationId) {
    throw new ApiError(400, "Category ID and Location ID are required");
  }

  const forecast = await aiPredictionService.forecastDemand(categoryId, locationId, timeFrame);

  // Save forecast data
  await aiPredictionService.savePrediction('demand_forecast', {
    category: categoryId,
    location: locationId,
    predictedDemand: forecast.predictedDemand,
    confidence: forecast.confidence,
    timeFrame: forecast.timeFrame,
    seasonalFactor: forecast.seasonalFactor,
    trendDirection: forecast.trendDirection,
    timestamp: new Date()
  });

  res.status(200).json(
    new ApiResponse(200, forecast, "Demand forecast generated successfully")
  );
});

// @desc Get AI market trends
// @route GET /api/v1/ai/market-trends/:categoryId
// @access Private
const getMarketTrends = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const trends = await aiPredictionService.getMarketTrend(categoryId);

  // Save market trend data
  await aiPredictionService.savePrediction('market_trend', {
    category: categoryId,
    averagePrice: trends.averagePrice,
    priceVolatility: trends.priceVolatility,
    supplyDemandRatio: trends.supplyDemandRatio,
    competitionLevel: trends.competitionLevel,
    marketSize: trends.marketSize,
    growthRate: trends.growthRate,
    timestamp: new Date()
  });

  res.status(200).json(
    new ApiResponse(200, trends, "Market trends retrieved successfully")
  );
});

// @desc Detect fraud for a bid
// @route POST /api/v1/ai/fraud-detection
// @access Private
const detectFraud = asyncHandler(async (req, res) => {
  const { auctionId, bidAmount } = req.body;
  const userId = req.user._id;

  if (!auctionId || !bidAmount) {
    throw new ApiError(400, "Auction ID and bid amount are required");
  }

  const fraudDetection = await aiPredictionService.detectFraud(userId, auctionId, bidAmount);

  // Save fraud alert if risk score is high
  if (fraudDetection.riskScore > 30) {
    await aiPredictionService.savePrediction('fraud_alert', {
      userId,
      auctionId,
      riskScore: fraudDetection.riskScore,
      riskFactors: fraudDetection.riskFactors,
      alertType: fraudDetection.alertType,
      status: fraudDetection.status,
      timestamp: new Date()
    });
  }

  res.status(200).json(
    new ApiResponse(200, fraudDetection, "Fraud detection completed successfully")
  );
});

// @desc Get AI win probability prediction
// @route POST /api/v1/ai/win-probability
// @access Private
const getWinProbability = asyncHandler(async (req, res) => {
  const { auctionId, bidAmount } = req.body;
  const supplierId = req.user._id;

  if (!auctionId || !bidAmount) {
    throw new ApiError(400, "Auction ID and bid amount are required");
  }

  const probability = await aiPredictionService.predictWinProbability(auctionId, supplierId, bidAmount);

  // Save win probability data
  await aiPredictionService.savePrediction('win_probability', {
    auctionId,
    supplierId,
    bidAmount,
    winProbability: probability.winProbability,
    factors: probability.factors,
    recommendedBid: probability.recommendedBid,
    timestamp: new Date()
  });

  res.status(200).json(
    new ApiResponse(200, probability, "Win probability calculated successfully")
  );
});

// @desc Update user AI preferences
// @route POST /api/v1/ai/preferences
// @access Private
const updateUserPreferences = asyncHandler(async (req, res) => {
  const { action, data } = req.body;
  const userId = req.user._id;
  const userType = req.user.role === 'buyer' ? 'buyer' : 'seller';

  if (!action || !data) {
    throw new ApiError(400, "Action and data are required");
  }

  const preferences = await aiRecommendationService.updateUserPreferences(
    userId,
    userType,
    action,
    data
  );

  res.status(200).json(
    new ApiResponse(200, preferences, "User preferences updated successfully")
  );
});

// @desc Get user AI recommendations
// @route GET /api/v1/ai/user-recommendations
// @access Private
const getUserRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.user.role === 'buyer' ? 'buyer' : 'seller';

  const aiRecommendation = await AIRecommendation.findOne({ userId, userType });

  if (!aiRecommendation) {
    return res.status(200).json(
      new ApiResponse(200, { recommendations: [] }, "No recommendations found")
    );
  }

  // Get personalized recommendations based on user preferences
  const recommendations = {
    preferredCategories: aiRecommendation.preferredCategories,
    categoryExpertise: aiRecommendation.categoryExpertise,
    aiScores: aiRecommendation.aiScores,
    cachedRecommendations: aiRecommendation.cachedRecommendations.slice(-5), // Last 5
    learningPreferences: aiRecommendation.learningPreferences
  };

  res.status(200).json(
    new ApiResponse(200, recommendations, "User recommendations retrieved successfully")
  );
});

// @desc Get AI analytics dashboard data
// @route GET /api/v1/ai/analytics
// @access Private (Admin only)
const getAIAnalytics = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    throw new ApiError(403, "Access denied. Admin only.");
  }

  // Get AI prediction data
  const aiPrediction = await AIPrediction.findOne();
  
  // Get AI recommendation data
  const totalRecommendations = await AIRecommendation.countDocuments();
  const activeUsers = await AIRecommendation.countDocuments({
    'aiScores.overallScore': { $gt: 0 }
  });

  // Calculate model performance metrics
  const modelPerformance = aiPrediction?.modelPerformance || [];
  
  // Get recent fraud alerts
  const recentFraudAlerts = aiPrediction?.fraudAlerts?.slice(-10) || [];

  // Get market insights
  const marketInsights = aiPrediction?.marketTrends?.slice(-5) || [];

  const analytics = {
    totalRecommendations,
    activeUsers,
    modelPerformance,
    recentFraudAlerts,
    marketInsights,
    aiUsage: {
      totalPredictions: aiPrediction?.pricePredictions?.length || 0,
      totalForecasts: aiPrediction?.demandForecasts?.length || 0,
      totalFraudChecks: aiPrediction?.fraudAlerts?.length || 0
    }
  };

  res.status(200).json(
    new ApiResponse(200, analytics, "AI analytics retrieved successfully")
  );
});

// @desc Get AI insights for a specific auction
// @route GET /api/v1/ai/insights/:auctionId
// @access Private
const getAuctionInsights = asyncHandler(async (req, res) => {
  const { auctionId } = req.params;

  // Get price prediction
  const pricePrediction = await aiPredictionService.predictOptimalPrice(auctionId);
  
  // Get supplier recommendations
  const recommendations = await aiRecommendationService.getSupplierRecommendations(auctionId, 5);
  
  // Get market trends for this category
  const auction = await Auction.findById(auctionId).populate('category');
  const marketTrends = auction ? await aiPredictionService.getMarketTrend(auction.category._id) : null;

  const insights = {
    pricePrediction,
    topSuppliers: recommendations.slice(0, 3),
    marketTrends,
    auctionAnalysis: {
      competitionLevel: recommendations.length > 0 ? 'High' : 'Low',
      expectedBids: Math.round(recommendations.length * 1.5),
      successProbability: pricePrediction.confidence
    }
  };

  res.status(200).json(
    new ApiResponse(200, insights, "Auction insights retrieved successfully")
  );
});

// @desc Get AI-powered search suggestions
// @route GET /api/v1/ai/search-suggestions
// @access Private
const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const userId = req.user._id;

  if (!query) {
    throw new ApiError(400, "Search query is required");
  }

  // Update user search history
  await aiRecommendationService.updateUserPreferences(userId, 'seller', 'search', {
    query,
    clickedResults: []
  });

  // Get user preferences
  const aiRecommendation = await AIRecommendation.findOne({ userId, userType: 'seller' });
  
  // Generate search suggestions based on user preferences and query
  const suggestions = {
    query,
    categories: aiRecommendation?.preferredCategories || [],
    locations: aiRecommendation?.preferredLocations || [],
    priceRange: aiRecommendation?.priceRange || { min: 0, max: 1000000 },
    relatedQueries: [
      `${query} suppliers`,
      `${query} near me`,
      `best ${query} prices`,
      `${query} delivery`
    ]
  };

  res.status(200).json(
    new ApiResponse(200, suggestions, "Search suggestions generated successfully")
  );
});

export {
  getSupplierRecommendations,
  getBidSuggestions,
  getPricePrediction,
  getDemandForecast,
  getMarketTrends,
  detectFraud,
  getWinProbability,
  updateUserPreferences,
  getUserRecommendations,
  getAIAnalytics,
  getAuctionInsights,
  getSearchSuggestions
}; 