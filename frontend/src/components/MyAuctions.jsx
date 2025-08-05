import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getAuctionsByUser } from "../store/auction/auctionSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "./Loading";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash, FaEye, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const MyAuctions = () => {
  const dispatch = useDispatch();
  const [auctionData, setAuctionData] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const { auction, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auction
  );

  useEffect(() => {
    if (user?._id) {
      dispatch(getAuctionsByUser(user._id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (isSuccess) {
      setAuctionData(auction);
    } else if (isError) {
      toast.error(message);
    }
  }, [auction, isSuccess, isError, message]);

  const getStatusBadge = (status, endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    
    if (status === "completed") {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center gap-1"><FaCheckCircle /> Completed</span>;
    } else if (status === "cancelled") {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center gap-1"><FaTimesCircle /> Cancelled</span>;
    } else if (end < now) {
      return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs flex items-center gap-1"><FaClock /> Expired</span>;
    } else {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1"><FaClock /> Active</span>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Auctions</h2>
          <Link
            to="/create-auction"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaEdit /> Create New Auction
          </Link>
        </div>

        {auctionData && auctionData.length > 0 ? (
          <div className="grid gap-4">
            {auctionData.map((auction) => (
              <div key={auction._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={auction.image}
                      alt={auction.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {auction.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {auction.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Budget: ${auction.budget}</span>
                        <span>Quantity: {auction.quantity}</span>
                        <span>Bids: {auction.bids?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-500">
                          Ends: {formatDate(auction.endTime)}
                        </span>
                        {getStatusBadge(auction.status, auction.endTime)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/single-auction-detail/${auction._id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FaEye size={16} />
                    </Link>
                    {auction.status === "active" && (
                      <>
                        <Link
                          to={`/edit-auction/${auction._id}`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Auction"
                        >
                          <FaEdit size={16} />
                        </Link>
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Auction"
                        >
                          <FaTrash size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {auction.status === "over" && auction.winner && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">🏆 Winner Selected</h4>
                    <div className="flex items-center gap-3">
                      <img
                        src={auction.winner.bidder?.profilePicture}
                        alt={auction.winner.bidder?.fullName}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          {auction.winner.bidder?.fullName}
                        </p>
                        <p className="text-xs text-green-600">
                          Winning Bid: ${auction.winner.bidAmount}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FaEdit size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No auctions yet</h3>
            <p className="text-gray-500 mb-4">
              Start by creating your first auction to find suppliers for your needs.
            </p>
            <Link
              to="/create-auction"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <FaEdit /> Create Your First Auction
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAuctions; 