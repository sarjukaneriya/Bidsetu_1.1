import axios from "axios";
import { getValidToken } from "../../utils/auth";

const API_URL = 'http://localhost:8000/api/v1';

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${getValidToken()}`,
  },
});

export const placeABid = async (data) => {
  const response = await axios.post(`${API_URL}/bids/${data.id}`, { amount: data.amount }, getAuthConfig());
  return response.data;
};


export const getBidsAuctionsByUser=async()=>{
    const response = await axios.get(`${API_URL}/auctions/user-bids`, getAuthConfig());
     //console.log("response bids auction...",response.data);
    return response.data;
};

export const getAllBidsForAuction=async(id)=>{
    const response = await axios.get(`${API_URL}/bids/get-all-bids/${id}`, getAuthConfig());
    //console.log("response getallBids for Auctions,,,,,,,,...",response.data);

    return response.data;
}








const bidService= {
    placeABid,
    getAllBidsForAuction,
    getBidsAuctionsByUser
}


export default bidService;