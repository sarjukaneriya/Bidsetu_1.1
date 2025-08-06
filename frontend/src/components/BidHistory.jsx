import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getBidsAuctionsByUser } from "../store/bid/bidSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "./Loading";
import { Link } from "react-router-dom";
import { FaEye, FaTrophy, FaClock, FaCheckCircle, FaTimesCircle, FaChartLine, FaFilter, FaSort } from "react-icons/fa";

const BidHistory = () => {
  const dispatch = useDispatch();
  const [bidData, setBidData] = useState([]);
  const [filteredBids, setFilteredBids] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const { user } = useSelector((state) => state.auth);
  const { bids, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.bid
  );

  const isWinningBid = (bid) => {
    const winner = bid.auction?.winner;
    if (!winner) return false;
    return typeof winner === "string" ? winner === bid._id : winner._id === bid._id;
  };

  useEffect(() => {
    if (user?._id) {
      dispatch(getBidsAuctionsByUser());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (isSuccess) {
      setBidData(bids);
      setFilteredBids(bids);
    } else if (isError) {
      toast.error(message);
    }
  }, [bids, isSuccess, isError, message]);

  useEffect(() => {
    let filtered = [...bidData];
    
    // Apply filter
    switch (filter) {
      case "won":
        filtered = filtered.filter((bid) => isWinningBid(bid));
        break;
      case "lost":
        filtered = filtered.filter(
          (bid) =>
            bid.auction?.status === "completed" &&
            bid.auction?.winner &&
            !isWinningBid(bid)
        );
        break;
      case "active":
        filtered = filtered.filter(bid =>
          new Date(bid.auction?.endTime) > new Date() &&
          bid.auction?.status !== "completed"
        );
        break;
      case "expired":
        filtered = filtered.filter(bid => new Date(bid.auction?.endTime) < new Date());
        break;
      default:
        break;
    }
    
    // Apply sorting
    switch (sortBy) {
      case "date":
        filtered.sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));
        break;
      case "amount":
        filtered.sort((a, b) => b.bidAmount - a.bidAmount);
        break;
      case "auction":
        filtered.sort((a, b) => a.auction?.name.localeCompare(b.auction?.name));
        break;
      default:
        break;
    }
    
    setFilteredBids(filtered);
  }, [bidData, filter, sortBy]);

  const getBidStatus = (bid, auction) => {
    if (auction.status === "completed" && isWinningBid(bid)) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center gap-1">
          <FaTrophy /> Won
        </span>
      );
    } else if (auction.status === "completed" && auction.winner && !isWinningBid(bid)) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center gap-1">
          <FaTimesCircle /> Lost
        </span>
      );
    } else if (new Date(auction.endTime) < new Date()) {
      return (
        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs flex items-center gap-1">
          <FaClock /> Expired
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
          <FaClock /> Active
        </span>
      );
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

  const calculateStats = () => {
    if (!bidData || bidData.length === 0)
      return { total: 0, won: 0, lost: 0, active: 0, winRate: 0, totalBidAmount: 0, avgBidAmount: 0 };

    // Consider only completed auctions for win/loss statistics
    const completedBids = bidData.filter(
      (bid) => bid.auction?.status === "completed"
    );

    const total = completedBids.length;
    const won = completedBids.filter((bid) => isWinningBid(bid)).length;
    const lost = completedBids.filter(
      (bid) => bid.auction?.winner && !isWinningBid(bid)
    ).length;

    const active = bidData.filter(
      (bid) =>
        new Date(bid.auction?.endTime) > new Date() &&
        bid.auction?.status !== "completed"
    ).length;

    const totalBidAmount = completedBids.reduce(
      (sum, bid) => sum + bid.bidAmount,
      0
    );
    const avgBidAmount = total > 0 ? Math.round(totalBidAmount / total) : 0;
    const winRate = total > 0 ? Math.round((won / total) * 100) : 0;

    return {
      total,
      won,
      lost,
      active,
      winRate,
      totalBidAmount,
      avgBidAmount,
    };
  };

  const stats = calculateStats();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Bid History</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaChartLine className="text-blue-600" />
            <span>Detailed Analytics</span>
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
                <p className="text-sm text-green-600 font-medium">Won Bids</p>
                <p className="text-2xl font-bold text-green-800">{stats.won}</p>
              </div>
              <FaTrophy className="text-green-600" size={20} />
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Bid Value</p>
                <p className="text-2xl font-bold text-purple-800">${stats.totalBidAmount.toLocaleString()}</p>
              </div>
              <FaChartLine className="text-purple-600" size={20} />
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Avg Bid</p>
                <p className="text-2xl font-bold text-orange-800">${stats.avgBidAmount}</p>
              </div>
              <FaCheckCircle className="text-orange-600" size={20} />
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-600" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Bids</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <FaSort className="text-gray-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="auction">Sort by Auction</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredBids.length} of {bidData.length} bids
          </div>
        </div>

        {filteredBids && filteredBids.length > 0 ? (
          <div className="grid gap-4">
            {filteredBids.map((bid) => (
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
                        <span>Your Bid: <strong className="text-blue-600">${bid.bidAmount}</strong></span>
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
                
                {bid.auction?.winner && bid.auction?.status === "completed" && isWinningBid(bid) && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">🎉 Congratulations! You Won!</h4>
                    <p className="text-sm text-green-600">
                      Your bid of ${bid.bidAmount} was selected as the winning bid for this auction.
                    </p>
                  </div>
                )}

                {bid.auction?.winner && !isWinningBid(bid) && bid.auction.status === "completed" && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Better luck next time!</h4>
                    <p className="text-sm text-red-600">
                      Your bid of ${bid.bidAmount} was not selected. The winning bid was ${bid.auction.winner.bidAmount}.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FaChartLine size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {filter === "all" ? "No bids yet" : `No ${filter} bids found`}
            </h3>
            <p className="text-gray-500 mb-4">
              {filter === "all" 
                ? "Start bidding on auctions to find opportunities and grow your business."
                : `No bids match the "${filter}" filter. Try changing the filter or browse more auctions.`
              }
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

export default BidHistory; 