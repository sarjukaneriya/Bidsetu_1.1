import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

// Submit business verification
const submitBusinessVerification = async (businessData) => {
  try {
    const response = await axios.post(`${API_URL}/users/business-verification`, businessData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};

// Get business verification status
const getBusinessVerification = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/business-verification`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};

// Update business verification
const updateBusinessVerification = async (businessData) => {
  try {
    const response = await axios.put(`${API_URL}/users/business-verification`, businessData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};

const businessVerificationService = {
  submitBusinessVerification,
  getBusinessVerification,
  updateBusinessVerification
};

export default businessVerificationService; 