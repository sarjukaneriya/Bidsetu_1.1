import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Set expected delivery date (for suppliers)
export const setExpectedDeliveryDate = async (auctionId, expectedDeliveryDate) => {
  try {
    const response = await axios.put(
      `${API_URL}/auctions/${auctionId}/expected-delivery`,
      { expectedDeliveryDate },
      { withCredentials: true }
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
      { withCredentials: true }
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
      { withCredentials: true }
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
      { withCredentials: true }
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