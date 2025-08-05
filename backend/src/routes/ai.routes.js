import express from "express";
import {
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
} from "../controllers/ai.controller.js";
import { verifyUser, verifySeller } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyUser);

// AI Recommendation Routes
router.get("/recommendations/:auctionId", getSupplierRecommendations);
router.get("/bid-suggestions/:auctionId", verifySeller, getBidSuggestions);
router.get("/user-recommendations", getUserRecommendations);

// AI Prediction Routes
router.get("/price-prediction/:auctionId", getPricePrediction);
router.get("/demand-forecast", getDemandForecast);
router.get("/market-trends/:categoryId", getMarketTrends);
router.post("/win-probability", verifySeller, getWinProbability);

// AI Fraud Detection
router.post("/fraud-detection", detectFraud);

// AI User Preferences
router.post("/preferences", updateUserPreferences);

// AI Analytics (Admin only)
router.get("/analytics", getAIAnalytics);

// AI Insights
router.get("/insights/:auctionId", getAuctionInsights);
router.get("/auction-insights/:auctionId", getAuctionInsights);
router.get("/search-suggestions", getSearchSuggestions);

export default router; 