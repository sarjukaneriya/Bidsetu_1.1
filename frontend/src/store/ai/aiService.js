import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

// Get auth token from localStorage
const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.token;
};

// Configure axios with auth token
const config = {
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
  },
};

// AI Recommendation Services
export const getSupplierRecommendations = async (auctionId, limit = 10) => {
  try {
    const response = await axios.get(
      `${API_URL}/ai/recommendations/${auctionId}?limit=${limit}`,
      config
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
      config
    );
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};

export const getUserRecommendations = async () => {
  try {
    const response = await axios.get(`${API_URL}/ai/user-recommendations`, config);
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
      config
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
      config
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
      config
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
      config
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
      config
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
      config
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
    const response = await axios.get(`${API_URL}/ai/analytics`, config);
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
      config
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
      config
    );
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
}; 