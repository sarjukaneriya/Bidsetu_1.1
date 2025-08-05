import axios from "axios";
import { getValidToken } from "../../utils/auth";

const API_URL = "http://localhost:8000/api/v1";

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${getValidToken()}`,
  },
});

// AI Recommendation Services
export const getSupplierRecommendations = async (auctionId, limit = 10) => {
  try {
    const response = await axios.get(
      `${API_URL}/ai/recommendations/${auctionId}?limit=${limit}`,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};

export const getBidSuggestions = async (auctionId) => {
  try {
    const response = await axios.get(
      `${API_URL}/ai/bid-suggestions/${auctionId}`,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};

export const getUserRecommendations = async () => {
  try {
    const response = await axios.get(`${API_URL}/ai/user-recommendations`, getAuthConfig());
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};

// AI Prediction Services
export const getPricePrediction = async (auctionId) => {
  try {
    const response = await axios.get(
      `${API_URL}/ai/price-prediction/${auctionId}`,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};

export const getDemandForecast = async (categoryId, locationId, timeFrame = 'monthly') => {
  try {
    const response = await axios.get(
      `${API_URL}/ai/demand-forecast?categoryId=${categoryId}&locationId=${locationId}&timeFrame=${timeFrame}`,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};

export const getMarketTrends = async (categoryId) => {
  try {
    const response = await axios.get(
      `${API_URL}/ai/market-trends/${categoryId}`,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};

export const getWinProbability = async (auctionId, bidAmount) => {
  try {
    const response = await axios.post(
      `${API_URL}/ai/win-probability`,
      { auctionId, bidAmount },
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};

// AI Fraud Detection
export const detectFraud = async (auctionId, bidAmount) => {
  try {
    const response = await axios.post(
      `${API_URL}/ai/fraud-detection`,
      { auctionId, bidAmount },
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};

// AI User Preferences
export const updateUserPreferences = async (action, data) => {
  try {
    const response = await axios.post(
      `${API_URL}/ai/preferences`,
      { action, data },
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};

// AI Analytics (Admin only)
export const getAIAnalytics = async () => {
  try {
    const response = await axios.get(`${API_URL}/ai/analytics`, getAuthConfig());
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};

// AI Insights
export const getAuctionInsights = async (auctionId) => {
  try {
    const response = await axios.get(
      `${API_URL}/ai/insights/${auctionId}`,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};

export const getSearchSuggestions = async (query) => {
  try {
    const response = await axios.get(
      `${API_URL}/ai/search-suggestions?query=${encodeURIComponent(query)}`,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
}; 