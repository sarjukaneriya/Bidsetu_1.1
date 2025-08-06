import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getBidsAuctionsByUser } from "../store/bid/bidSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "./Loading";
import { Link } from "react-router-dom";
import { FaEye, FaTrophy, FaClock, FaTimesCircle, FaChartLine } from "react-icons/fa";

const MyBids = () => {
  const dispatch = useDispatch();
  const [bidData, setBidData] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const { bids, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.bid
  );

  useEffect(() => {
    if (user?._id) {
      dispatch(getBidsAuctionsByUser());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (isSuccess) {
      setBidData(bids);
    } else if (isError) {
      toast.error(message);
    }
  }, [bids, isSuccess, isError, message]);

  const getWinnerId = (auction) => {
    if (!auction?.winner) return null;
    return typeof auction.winner === "object"
      ? auction.winner._id?.toString()
      : auction.winner?.toString();
  };


  const getBidStatus = (bid, auction) => {
    const winnerId = getWinnerId(auction);
    const isExpired = ["over", "completed"].includes(auction.status);
    const isWinner = winnerId && winnerId === bid._id?.toString();

    const auctionLabel = isExpired ? (
      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs flex items-center gap-1">
        <FaClock /> Expired
      </span>
    ) : (
      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
        <FaClock /> Active
      </span>
    );

    let resultLabel = null;
    if (isExpired && auction.winner) {
      resultLabel = isWinner ? (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center gap-1">
          <FaTrophy /> Win
        </span>
      ) : (
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center gap-1">
          <FaTimesCircle /> Loss
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1">
        {auctionLabel}
        {resultLabel && (
          <>
            <span className="text-gray-400">·</span>
            {resultLabel}
          </>
        )}
      </span>
    );
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

  const calculateStats = () => {
    if (!bidData || bidData.length === 0)
      return { total: 0, won: 0, lost: 0, active: 0 };

    const total = bidData.length;
    const won = bidData.filter(
      (bid) =>
        ["completed", "over"].includes(bid.auction?.status) &&
        getWinnerId(bid.auction) === bid._id?.toString()
    ).length;
    const lost = bidData.filter(
      (bid) =>
        ["completed", "over"].includes(bid.auction?.status) &&
        bid.auction?.winner &&
        getWinnerId(bid.auction) !== bid._id?.toString()
    ).length;
    const active = bidData.filter(
      (bid) =>
        new Date(bid.auction?.endTime) > new Date() &&
        !["completed", "over"].includes(bid.auction?.status)
    ).length;

    return { total, won, lost, active };
  };

  const stats = calculateStats();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Bids</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaChartLine className="text-blue-600" />
            <span>Performance Analytics</span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Bids</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
              </div>
              <FaChartLine className="text-blue-600" size={20} />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Won</p>
                <p className="text-2xl font-bold text-green-800">{stats.won}</p>
              </div>
              <FaTrophy className="text-green-600" size={20} />
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Lost</p>
                <p className="text-2xl font-bold text-red-800">{stats.lost}</p>
              </div>
              <FaTimesCircle className="text-red-600" size={20} />
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Active Bids</p>
                <p className="text-2xl font-bold text-orange-800">{stats.active}</p>
              </div>
              <FaClock className="text-orange-600" size={20} />
            </div>
          </div>
        </div>

        {bidData && bidData.length > 0 ? (
          <div className="grid gap-4">
            {bidData.map((bid) => {
              const winnerId = getWinnerId(bid.auction);
              const winningAmount =
                typeof bid.auction?.winner === "object"
                  ? bid.auction.winner.bidAmount
                  : null;
              return (
                <div key={bid._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={bid.auction?.image}
                        alt={bid.auction?.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {bid.auction?.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {bid.auction?.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            Your Bid: <strong className="text-blue-600">${bid.bidAmount}</strong>
                          </span>
                          <span>Budget: ${bid.auction?.budget}</span>
                          <span>Quantity: {bid.auction?.quantity}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-gray-500">
                            Bid Placed: {formatDate(bid.bidTime)}
                          </span>
                          <span className="text-sm text-gray-500">
                            Auction Ends: {formatDate(bid.auction?.endTime)}
                          </span>
                          {getBidStatus(bid, bid.auction)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/single-auction-detail/${bid.auction?._id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Auction Details"
                      >
                        <FaEye size={16} />
                      </Link>
                    </div>
                  </div>

                    {bid.auction?.winner && ["completed", "over"].includes(bid.auction?.status) && winnerId === bid._id?.toString() && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">🎉 Congratulations! You Won!</h4>
                        <p className="text-sm text-green-600">
                          Your bid of ${bid.bidAmount} was selected as the winning bid for this auction.
                        </p>
                      </div>
                    )}

                  {bid.auction?.winner && winnerId !== bid._id?.toString() && ["completed", "over"].includes(bid.auction.status) && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Better luck next time!</h4>
                      <p className="text-sm text-red-600">
                        Your bid of ${bid.bidAmount} was not selected.
                        {winningAmount !== null && ` The winning bid was ${winningAmount}.`}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FaChartLine size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No bids yet</h3>
            <p className="text-gray-500 mb-4">
              Start bidding on auctions to find opportunities and grow your business.
            </p>
            <Link
              to="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <FaEye /> Browse Auctions
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBids;
