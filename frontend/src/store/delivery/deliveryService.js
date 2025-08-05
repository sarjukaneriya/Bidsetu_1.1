import axios from 'axios';
import { getValidToken } from '../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${getValidToken()}`,
  },
});

// Set expected delivery date (for suppliers)
export const setExpectedDeliveryDate = async (auctionId, expectedDeliveryDate) => {
  try {
    const response = await axios.put(
      `${API_URL}/auctions/${auctionId}/expected-delivery`,
      { expectedDeliveryDate },
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data.message) || error.message;
    throw new Error(message);
  }
};

// Update delivery status (for buyers)
export const updateDeliveryStatus = async (auctionId, deliveryData) => {
  try {
    const response = await axios.put(
      `${API_URL}/auctions/${auctionId}/delivery-status`,
      deliveryData,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data.message) || error.message;
    throw new Error(message);
  }
};

// Get supplier metrics
export const getSupplierMetrics = async (supplierId) => {
  try {
    const response = await axios.get(
      `${API_URL}/auctions/supplier-metrics/${supplierId}`,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data.message) || error.message;
    throw new Error(message);
  }
};

// Get delivery status for an auction
export const getDeliveryStatus = async (auctionId) => {
  try {
    const response = await axios.get(
      `${API_URL}/auctions/${auctionId}`,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data.message) || error.message;
    throw new Error(message);
  }
};

const deliveryService = {
  setExpectedDeliveryDate,
  updateDeliveryStatus,
  getSupplierMetrics,
  getDeliveryStatus,
};

export default deliveryService; 