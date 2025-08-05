import axios from "axios";
import { getValidToken } from "../../utils/auth";

const API_URL = 'http://localhost:8000/api/v1';

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${getValidToken()}`,
  },
});

export const getCartItems = async () => {
  const response = await axios.get(`${API_URL}/cart`, getAuthConfig());
  return response.data.data;
};

export const deleteCartItem=async(id)=>{
    const response = await axios.delete(`${API_URL}/cart/${id}`,{
        withCredentials:true
    });
    //console.log('response delete cart', response.data);
    return response.data.data;
}





const cartService= {
    getCartItems,
    deleteCartItem
}


export default cartService;