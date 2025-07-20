import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as aiService from "./aiService.js";

// Async thunks
export const fetchSupplierRecommendations = createAsyncThunk(
  "ai/fetchSupplierRecommendations",
  async ({ auctionId, limit }, { rejectWithValue }) => {
    try {
      const response = await aiService.getSupplierRecommendations(auctionId, limit);
      if (response.isError) {
        return rejectWithValue(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBidSuggestions = createAsyncThunk(
  "ai/fetchBidSuggestions",
  async (auctionId, { rejectWithValue }) => {
    try {
      const response = await aiService.getBidSuggestions(auctionId);
      if (response.isError) {
        return rejectWithValue(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPricePrediction = createAsyncThunk(
  "ai/fetchPricePrediction",
  async (auctionId, { rejectWithValue }) => {
    try {
      const response = await aiService.getPricePrediction(auctionId);
      if (response.isError) {
        return rejectWithValue(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchWinProbability = createAsyncThunk(
  "ai/fetchWinProbability",
  async ({ auctionId, bidAmount }, { rejectWithValue }) => {
    try {
      const response = await aiService.getWinProbability(auctionId, bidAmount);
      if (response.isError) {
        return rejectWithValue(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAuctionInsights = createAsyncThunk(
  "ai/fetchAuctionInsights",
  async (auctionId, { rejectWithValue }) => {
    try {
      const response = await aiService.getAuctionInsights(auctionId);
      if (response.isError) {
        return rejectWithValue(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMarketTrends = createAsyncThunk(
  "ai/fetchMarketTrends",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await aiService.getMarketTrends(categoryId);
      if (response.isError) {
        return rejectWithValue(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserRecommendations = createAsyncThunk(
  "ai/fetchUserRecommendations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await aiService.getUserRecommendations();
      if (response.isError) {
        return rejectWithValue(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserPreferences = createAsyncThunk(
  "ai/updateUserPreferences",
  async ({ action, data }, { rejectWithValue }) => {
    try {
      const response = await aiService.updateUserPreferences(action, data);
      if (response.isError) {
        return rejectWithValue(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const detectFraud = createAsyncThunk(
  "ai/detectFraud",
  async ({ auctionId, bidAmount }, { rejectWithValue }) => {
    try {
      const response = await aiService.detectFraud(auctionId, bidAmount);
      if (response.isError) {
        return rejectWithValue(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  supplierRecommendations: [],
  bidSuggestions: null,
  pricePrediction: null,
  winProbability: null,
  auctionInsights: null,
  marketTrends: null,
  userRecommendations: null,
  fraudDetection: null,
  loading: false,
  error: null,
  success: false,
};

// AI slice
const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearBidSuggestions: (state) => {
      state.bidSuggestions = null;
    },
    clearPricePrediction: (state) => {
      state.pricePrediction = null;
    },
    clearWinProbability: (state) => {
      state.winProbability = null;
    },
    clearFraudDetection: (state) => {
      state.fraudDetection = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Supplier Recommendations
      .addCase(fetchSupplierRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplierRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.supplierRecommendations = action.payload;
        state.success = true;
      })
      .addCase(fetchSupplierRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Bid Suggestions
      .addCase(fetchBidSuggestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBidSuggestions.fulfilled, (state, action) => {
        state.loading = false;
        state.bidSuggestions = action.payload;
        state.success = true;
      })
      .addCase(fetchBidSuggestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Price Prediction
      .addCase(fetchPricePrediction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPricePrediction.fulfilled, (state, action) => {
        state.loading = false;
        state.pricePrediction = action.payload;
        state.success = true;
      })
      .addCase(fetchPricePrediction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Win Probability
      .addCase(fetchWinProbability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWinProbability.fulfilled, (state, action) => {
        state.loading = false;
        state.winProbability = action.payload;
        state.success = true;
      })
      .addCase(fetchWinProbability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Auction Insights
      .addCase(fetchAuctionInsights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuctionInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.auctionInsights = action.payload;
        state.success = true;
      })
      .addCase(fetchAuctionInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Market Trends
      .addCase(fetchMarketTrends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketTrends.fulfilled, (state, action) => {
        state.loading = false;
        state.marketTrends = action.payload;
        state.success = true;
      })
      .addCase(fetchMarketTrends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // User Recommendations
      .addCase(fetchUserRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.userRecommendations = action.payload;
        state.success = true;
      })
      .addCase(fetchUserRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update User Preferences
      .addCase(updateUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.userRecommendations = action.payload;
        state.success = true;
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fraud Detection
      .addCase(detectFraud.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(detectFraud.fulfilled, (state, action) => {
        state.loading = false;
        state.fraudDetection = action.payload;
        state.success = true;
      })
      .addCase(detectFraud.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearBidSuggestions,
  clearPricePrediction,
  clearWinProbability,
  clearFraudDetection,
} = aiSlice.actions;

export default aiSlice.reducer; 