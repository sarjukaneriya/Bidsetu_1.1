import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import deliveryService from './deliveryService.js';

// Set expected delivery date
export const setExpectedDeliveryDate = createAsyncThunk(
  'delivery/setExpectedDeliveryDate',
  async ({ auctionId, expectedDeliveryDate }, thunkAPI) => {
    try {
      return await deliveryService.setExpectedDeliveryDate(auctionId, expectedDeliveryDate);
    } catch (error) {
      const message = error.message || 'Failed to set expected delivery date';
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  }
);

// Update delivery status
export const updateDeliveryStatus = createAsyncThunk(
  'delivery/updateDeliveryStatus',
  async ({ auctionId, deliveryData }, thunkAPI) => {
    try {
      return await deliveryService.updateDeliveryStatus(auctionId, deliveryData);
    } catch (error) {
      const message = error.message || 'Failed to update delivery status';
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  }
);

// Get supplier metrics
export const getSupplierMetrics = createAsyncThunk(
  'delivery/getSupplierMetrics',
  async (supplierId, thunkAPI) => {
    try {
      return await deliveryService.getSupplierMetrics(supplierId);
    } catch (error) {
      const message = error.message || 'Failed to get supplier metrics';
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  }
);

// Get delivery status
export const getDeliveryStatus = createAsyncThunk(
  'delivery/getDeliveryStatus',
  async (auctionId, thunkAPI) => {
    try {
      return await deliveryService.getDeliveryStatus(auctionId);
    } catch (error) {
      const message = error.message || 'Failed to get delivery status';
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  }
);

const initialState = {
  deliveryStatus: null,
  supplierMetrics: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
    clearDeliveryStatus: (state) => {
      state.deliveryStatus = null;
    },
    clearSupplierMetrics: (state) => {
      state.supplierMetrics = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Set expected delivery date
      .addCase(setExpectedDeliveryDate.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(setExpectedDeliveryDate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = action.payload.message;
      })
      .addCase(setExpectedDeliveryDate.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload.message;
      })
      // Update delivery status
      .addCase(updateDeliveryStatus.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(updateDeliveryStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = action.payload.message;
      })
      .addCase(updateDeliveryStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload.message;
      })
      // Get supplier metrics
      .addCase(getSupplierMetrics.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(getSupplierMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.supplierMetrics = action.payload.data;
        state.message = '';
      })
      .addCase(getSupplierMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload.message;
      })
      // Get delivery status
      .addCase(getDeliveryStatus.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(getDeliveryStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.deliveryStatus = action.payload.data;
        state.message = '';
      })
      .addCase(getDeliveryStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload.message;
      });
  },
});

export const { reset, clearDeliveryStatus, clearSupplierMetrics } = deliverySlice.actions;
export default deliverySlice.reducer; 