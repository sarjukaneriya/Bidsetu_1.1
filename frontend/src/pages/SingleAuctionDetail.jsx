import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getSingleAuctionById, reset } from "../store/auction/auctionSlice";
import CountDownTimer from "../components/CountDownTimer";
import BidCard from "../components/BidCard";
import { placeABid } from "../store/bid/bidSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sendNewBidNotification } from "../store/notification/notificationSlice";
import socket from "../socket";
import { getAllBidsForAuction } from "../store/bid/bidSlice";
import Loading from "../components/Loading";
import LiveHome from "../components/home/LiveHome";
import DeliveryConfirmation from "../components/DeliveryConfirmation";
import AIBidSuggestion from "../components/AIBidSuggestion";
import AIAuctionInsights from "../components/AIAuctionInsights";

const SingleAuctionDetail = ({ noPadding }) => {
  const [newBidAmount, setNewBidAmount] = useState("");
  const logInUser = JSON.parse(localStorage.getItem("user"));
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("description");
  const params = useParams();
  const dispatch = useDispatch();
  const { singleAuction } = useSelector((state) => state.auction);
  const { bids } = useSelector((state) => state.bid);
  const [auctionStarted, setAuctionStarted] = useState(false);
  const [singleAuctionData, setSingleAuctionData] = useState();
  const [auctionWinnerDetailData, setAuctionWinnerDetailData] = useState();
  const [bidsData, setBidsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);

  // Get current lowest bid amount
  const getCurrentLowestBid = () => {
    if (bidsData.length === 0) return singleAuction?.budget || 0;
    
    const lowestBid = bidsData.reduce((lowest, bid) => {
      return bid.bidAmount < lowest.bidAmount ? bid : lowest;
    });
    
    return lowestBid.bidAmount;
  };

  // Check if current user is the winner
  const isCurrentUserWinner = () => {
    const winnerId = auctionWinnerDetailData?.bidder?._id || 
                    singleAuction?.winner?.bidder?._id;
    return winnerId === logInUser?._id;
  };

  // Check if current user is the buyer
  const isCurrentUserBuyer = () => {
    return singleAuction?.user?._id === logInUser?._id;
  };

  // Check if auction has ended and has a winner
  const hasWinner = () => {
    return (singleAuction?.status === "over" || auctionWinnerDetailData) && 
           (singleAuction?.winner || auctionWinnerDetailData);
  };

  // Handle delivery confirmation
  const handleDeliveryConfirmed = () => {
    toast.success("Delivery process updated successfully!");
    // Refresh auction data
    dispatch(getSingleAuctionById(params?.id));
  };

  // Handle payment status update
  const handlePaymentUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/auctions/update-payment-status/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Payment status updated successfully!');
        dispatch(getSingleAuctionById(params?.id));
      } else {
        toast.error(data.message || 'Failed to update payment status');
      }
    } catch (error) {
      toast.error('Error updating payment status');
      console.error(error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const auctionStartTime = new Date(singleAuction?.startTime).getTime();
      const auctionEndTime = new Date(singleAuction?.endTime).getTime();

      if (
        currentTime >= auctionStartTime &&
        currentTime <= auctionEndTime &&
        !auctionStarted
      ) {
        setAuctionStarted(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [singleAuction?.startTime]);

  socket.on("winnerSelected", async (data) => {
    setAuctionStarted(false);
    setAuctionWinnerDetailData(data);
    
    // Show delivery form if current user is the winner
    if (data.bidder._id === logInUser?._id) {
      setShowDeliveryForm(true);
    }
  });

  const handleWinner = () => {
    socket.emit("selectWinner", params?.id);
  };

  useEffect(() => {
    if (params?.id) {
      setIsLoading(true);
      
      // Only check for malformed tokens if user is logged in
      const user = localStorage.getItem('user');
      if (user) {
        const token = localStorage.getItem('token');
        if (token && (token.length < 10 || !token.includes('.'))) {
          localStorage.removeItem('token');
          console.log('Removed malformed token');
        }
      }
      
      Promise.all([dispatch(getSingleAuctionById(params?.id))])
        .then(() => {
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error loading auction:", error);
          setIsLoading(false);
          toast.error("Failed to load auction details");
        });
      
      dispatch(getAllBidsForAuction(params?.id));
    }
  }, [params?.id, dispatch]);

  socket.on("newBidData", async (data) => {
    setBidsData([
      {
        _id: new Date().getTime(),
        bidder: {
          fullName: data.fullName,
          profilePicture: data.profilePicture,
        },
        bidAmount: data.bidAmount,
        bidTime: data.bidTime,
        auction: data.auctionId,
      },
      ...bidsData,
    ]);

    setSingleAuctionData((prevState) => ({
      ...prevState,
      startingPrice: data.bidAmount,
    }));
  });

  useEffect(() => {
    setBidsData(bids);
    setSingleAuctionData(singleAuction);
    
    // Debug logging for bidding issues
    console.log("=== Bidding Debug Info ===");
    console.log("logInUser:", logInUser);
    console.log("singleAuction:", singleAuction);
    console.log("auctionStarted:", auctionStarted);
    console.log("auctionWinnerDetailData:", auctionWinnerDetailData);
    console.log("bidsData:", bidsData);
    console.log("==========================");
  }, [bids, singleAuction]);

  useEffect(() => {
    socket.on("connect", () => {
      //console.log(`Client connected with the id: ${socket.id}`);
    });
    socket.emit("joinAuction", logInUser?._id);
    socket.on("newUserJoined", (data) => {
      
    });
  }, []);

  const placeBidHandle = async (e) => {
    e.preventDefault();
    
    // Check if user is a supplier
    if (logInUser?.userType !== "seller") {
      toast.error("Only suppliers can place bids");
      return;
    }
    
    // Check if user is trying to bid on their own auction
    if (singleAuction?.user?._id === logInUser?._id) {
      toast.error("You cannot bid on your own auction");
      return;
    }
    
    // Check business verification for suppliers
    if (logInUser?.businessVerified !== true) {
      toast.info(
        "Please complete business verification to place bids. Go to profile settings..."
      );
      return;
    }

    const currentLowestBid = getCurrentLowestBid();
    
    if (Math.floor(newBidAmount) >= currentLowestBid) {
      toast.info("Bid amount should be less than the current lowest bid");
      return;
    }

    if (singleAuction?.endTime < new Date().getTime() / 1000) {
      toast.info("Auction time is over");
      return;
    }

    let bidData = {
      id: params.id,
      amount: Math.floor(newBidAmount),
    };

    dispatch(placeABid(bidData));
    setNewBidAmount("");

    socket.emit("newBid", {
      profilePicture: logInUser?.profilePicture,
      fullName: logInUser?.fullName,
      bidAmount: Math.floor(newBidAmount),
      bidTime: new Date().getTime(),
      auctionId: params.id,
    });

    await socket.emit("sendNewBidNotification", {
      auctionId: params.id,
      type: "BID_PLACED",
      newBidAmount: newBidAmount,
      fullName: logInUser?.fullName,
      id: logInUser?._id,
    });
    
    setActiveTab("bids");
    dispatch(
      sendNewBidNotification({
        auctionId: params.id,
        type: "BID_PLACED",
        newBidAmount: newBidAmount,
      })
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <div
        className={`flex place-content-between  py-10 px-5 lg:py-20  lg:px-10  items-start gap-7 flex-wrap md:flex-nowrap ${noPadding ? "lg:py-0 px-0" : "p-4"}`}
        id="item01"
      >
        <img
          className=" rounded-xl  md:max-w-[45%]  w-full "
          src={singleAuction?.image}
          alt="product image"
        />
        <div className="w-full flex gap-4 flex-col ">
          <div>
            <h2 className="text-3xl font-extrabold text-white">
              {singleAuction?.name}
            </h2>

            <div className="pt-4 flex flex-row gap-4 flex-wrap text-body-text-color capitalize">
              <a
                href="#"
                className="px-4 py-1 border rounded-full hover:bg-color-primary border-border-info-color hover:text-white transition-all"
              >
                {singleAuction?.category?.name}
              </a>
              <a
                href="#"
                className="px-4 py-1 border rounded-full hover:bg-color-primary border-border-info-color hover:text-white transition-all"
              >
                {singleAuction?.location?.name}
              </a>
            </div>
            
            {/* Quick Bid Info for Suppliers */}
            {logInUser && logInUser._id !== singleAuction?.user?._id && logInUser?.userType === "seller" && (
              <div className="mt-4 p-4 bg-theme-color rounded-lg">
                <h3 className="text-white font-medium mb-2">🎯 Ready to Bid?</h3>
                <div className="text-sm text-white">
                  <p>• Your bid must be <strong>less than</strong> the current lowest bid</p>
                  <p>• You need business verification to place bids</p>
                  <p>• Scroll down to the "Place Your Bid" section</p>
                </div>
              </div>
            )}
            
            {/* Buyer Info */}
            {logInUser && logInUser._id === singleAuction?.user?._id && (
              <div className="mt-4 p-4 bg-blue-600 rounded-lg">
                <h3 className="text-white font-medium mb-2">📋 Your Auction</h3>
                <div className="text-sm text-white">
                  <p>• This is your auction - you cannot bid on it</p>
                  <p>• Monitor bids and select a winner when ready</p>
                  <p>• You need payment verification to complete transactions</p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border-info-color">
            {/* Creator */}
            <div className="flex gap-8">
              <div id="author-item" className="text-heading-color">
                <span className="font-medium capitalize  ">Buyer</span>
                <div id="author-info" className="flex items-center gap-2 pt-2">
                  <img
                    src={singleAuction?.user?.profilePicture}
                    alt="avatar"
                    className="w-[45px] rounded-full"
                  />
                  <a href="#" className="font-medium ">
                    {singleAuction?.user?.fullName}
                  </a>
                </div>
              </div>
            </div>
            
            {/* TABS buttons */}
            <div className="flex gap-4 pt-4 font-bold text-white ">
              <button
                className={`px-5 py-2 rounded-xl   ${
                  activeTab === "description"
                    ? "bg-color-primary"
                    : "bg-theme-bg2 text-body-text-color"
                }`}
                onClick={() => setActiveTab("description")}
              >
                Details
              </button>
              <button
                className={`px-5 py-2 rounded-xl   ${
                  activeTab === "bids"
                    ? "bg-color-primary"
                    : "bg-theme-bg2 text-body-text-color"
                }`}
                onClick={() => setActiveTab("bids")}
              >
                Bids ({bidsData.length})
              </button>
            </div>
          </div>
          
          <div>
            {/* Description */}
            <div
              id="description"
              className={`pt-4 border-t border-border-info-color ${
                activeTab === "description" ? "block" : "hidden"
              }`}
            >
              <h3 className="text-heading-color font-medium">Description</h3>
              <p className="text-body-text-color">
                {singleAuction?.description}
              </p>
              
              {/* Budget Information */}
              <div className="mt-4 p-4 bg-theme-bg2 rounded-lg">
                <h3 className="text-heading-color font-medium mb-2">Budget Information</h3>
                <div className="flex justify-between items-center">
                  <span className="text-body-text-color">Buyer's Budget:</span>
                  <span className="text-white font-bold">${singleAuction?.budget}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-body-text-color">Quantity Needed:</span>
                  <span className="text-white font-bold">{singleAuction?.quantity}</span>
                </div>
              </div>
            </div>
            
            {/* Bids */}
            <div
              id="bids"
              className={`pt-4 border-t border-border-info-color max-h-[250px] overflow-y-auto  ${
                activeTab === "bids" ? "block" : "hidden"
              } no-scrollbar`}
            >
              {/* map over bids array */}
              {singleAuction?.bids?.length > 0 || bidsData.length > 0 ? (
                bidsData?.map((bid) => <BidCard key={bid._id} bid={bid} />)
              ) : (
                <h1 className="text-white">No bids yet</h1>
              )}
            </div>
          </div>

          <div className="text-heading-color capitalize"></div>

          {/* countdown timer */}
          <div className="flex flex-col gap-4 pt-4 border-t border-border-info-color">
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-2">
                <h3 className="text-heading-color font-medium">
                  {singleAuction?.bids?.length > 0
                    ? "Current Lowest Bid"
                    : "Starting Price"}
                </h3>
                <p className="text-body-text-color text-lg font-bold">
                  ${getCurrentLowestBid()}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-heading-color font-medium">Time </h3>
                <p className="text-body-text-color">
                  <CountDownTimer
                    startTime={singleAuction?.startTime}
                    endTime={singleAuction?.endTime}
                    id={singleAuction?._id}
                    Winner={handleWinner}
                  />
                </p>
              </div>
            </div>
          </div>

          {/* Winner Section */}
          {hasWinner() && (
            <div className="flex flex-col gap-4 pt-4 border-t border-border-info-color">
              <div>
                <h1 className="font-bold text-white text-xl mb-4">🏆 Auction Winner</h1>
                <div className="bg-theme-bg2 p-6 rounded-lg border border-theme-color">
                  <div className="flex sm:gap-10 items-center justify-between">
                    <div className="flex gap-4 items-center text-white">
                      <img
                        src={
                          auctionWinnerDetailData?.bidder?.profilePicture ||
                          singleAuction?.winner?.bidder?.profilePicture
                        }
                        alt="winner profile"
                        className="w-12 h-12 rounded-full border-2 border-theme-color"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-lg">
                          {auctionWinnerDetailData?.bidder?.fullName ||
                            singleAuction?.winner?.bidder?.fullName}
                        </span>
                        <span className="text-sm text-body-text-color">
                          Won on {new Date(
                            auctionWinnerDetailData?.bidTime ||
                              singleAuction?.winner?.bidTime
                          ).toLocaleDateString()} at {new Date(
                            auctionWinnerDetailData?.bidTime ||
                              singleAuction?.winner?.bidTime
                          ).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-theme-color">
                        ${auctionWinnerDetailData?.bidAmount ||
                          singleAuction?.winner?.bidAmount}
                      </div>
                      <div className="text-sm text-body-text-color">Winning Bid</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Status Section */}
              <div className="mt-4">
                <h3 className="text-heading-color font-medium mb-4">
                  💳 Payment Status
                </h3>
                <div className="bg-theme-bg2 p-4 rounded-lg border border-theme-color">
                  <div className="flex justify-between items-center">
                    <span className="text-white">
                      Payment Status: 
                      <span className={`ml-2 px-2 py-1 rounded text-sm ${
                        singleAuction?.paid ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                      }`}>
                        {singleAuction?.paid ? 'Paid' : 'Pending'}
                      </span>
                    </span>
                    {isCurrentUserBuyer() && !singleAuction?.paid && (
                      <button
                        onClick={handlePaymentUpdate}
                        className="bg-theme-color text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Mark as Paid
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Status Section */}
              {singleAuction?.paid && (
                <div className="mt-4">
                  <h3 className="text-heading-color font-medium mb-4">
                    🚚 Delivery Status
                  </h3>
                  <div className="bg-theme-bg2 p-4 rounded-lg border border-theme-color">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white">
                        Status: 
                        <span className={`ml-2 px-2 py-1 rounded text-sm ${
                          singleAuction?.deliveryStatus === 'delivered' ? 'bg-green-600 text-white' :
                          singleAuction?.deliveryStatus === 'in_transit' ? 'bg-blue-600 text-white' :
                          singleAuction?.deliveryStatus === 'delayed' ? 'bg-red-600 text-white' :
                          'bg-yellow-600 text-white'
                        }`}>
                          {singleAuction?.deliveryStatus || 'pending'}
                        </span>
                      </span>
                    </div>
                    {singleAuction?.expectedDeliveryDate && (
                      <div className="text-sm text-body-text-color">
                        Expected Delivery: {new Date(singleAuction.expectedDeliveryDate).toLocaleDateString()}
                      </div>
                    )}
                    {singleAuction?.actualDeliveryDate && (
                      <div className="text-sm text-body-text-color">
                        Actual Delivery: {new Date(singleAuction.actualDeliveryDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Confirmation Section */}
              {isCurrentUserWinner() && singleAuction?.paid && !singleAuction?.expectedDeliveryDate && (
                <div className="mt-4">
                  <h3 className="text-heading-color font-medium mb-4">
                    🚚 Set Expected Delivery Date
                  </h3>
                  <DeliveryConfirmation 
                    auctionId={params.id}
                    userType="supplier"
                    onDeliveryConfirmed={handleDeliveryConfirmed}
                  />
                </div>
              )}

              {/* Buyer Delivery Confirmation */}
              {isCurrentUserBuyer() && singleAuction?.winner && singleAuction?.expectedDeliveryDate && !singleAuction?.deliveryConfirmed && (
                <div className="mt-4">
                  <h3 className="text-heading-color font-medium mb-4">
                    📦 Confirm Delivery
                  </h3>
                  <DeliveryConfirmation 
                    auctionId={params.id}
                    userType="buyer"
                    onDeliveryConfirmed={handleDeliveryConfirmed}
                  />
                </div>
              )}

              {/* Delivery Confirmed Message */}
              {singleAuction?.deliveryConfirmed && (
                <div className="mt-4 bg-green-600 p-4 rounded-lg text-center">
                  <h3 className="text-white font-medium">✅ Delivery Confirmed!</h3>
                  <p className="text-white text-sm mt-1">
                    This transaction has been completed successfully.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* No bids message */}
          {hasWinner() && bidsData.length === 0 && (
            <div className="flex flex-col gap-4 pt-4 border-t border-border-info-color">
              <div className="bg-theme-bg2 p-6 rounded-lg text-center">
                <h1 className="text-white text-xl">No Bids Placed</h1>
                <p className="text-body-text-color mt-2">This auction ended without any bids.</p>
              </div>
            </div>
          )}

          {/* AI Auction Insights - Show to all users */}
          {singleAuction && (
            <div className="flex flex-col gap-4 pt-4 border-t border-border-info-color">
              <AIAuctionInsights 
                auctionId={params.id} 
                categoryId={singleAuction.category?._id}
              />
            </div>
          )}

          {/* AI Bid Suggestions - Show only to suppliers when auction is active */}
          {!singleAuction?.status === "over" && 
           !auctionWinnerDetailData && 
           auctionStarted && 
           logInUser && 
           logInUser._id !== singleAuction?.user?._id && (
            <div className="flex flex-col gap-4 pt-4 border-t border-border-info-color">
              <AIBidSuggestion 
                auctionId={params.id}
                onBidSuggestion={(suggestedAmount) => setNewBidAmount(suggestedAmount.toString())}
              />
            </div>
          )}

          {/* Bidding Form - Always show for suppliers */}
          <div className="flex flex-col gap-4 pt-4 border-t border-border-info-color">
            <h3 className="text-heading-color font-medium">🎯 Place Your Bid</h3>
            
            {/* Auction Status Info */}
            <div className="bg-theme-bg2 p-4 rounded-lg">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-body-text-color">Auction Status:</span>
                  <span className={`font-medium ${
                    singleAuction?.status === "over" ? "text-red-400" :
                    singleAuction?.status === "active" ? "text-green-400" :
                    "text-yellow-400"
                  }`}>
                    {singleAuction?.status === "over" ? "Ended" :
                     singleAuction?.status === "active" ? "Active" :
                     "Upcoming"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-text-color">Current Lowest Bid:</span>
                  <span className="text-white font-bold">${getCurrentLowestBid()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-text-color">Buyer's Budget:</span>
                  <span className="text-white font-bold">${singleAuction?.budget}</span>
                </div>
              </div>
            </div>

            {/* Show different messages based on auction status */}
            {singleAuction?.status === "over" ? (
              <div className="bg-red-600 p-4 rounded-lg text-center">
                <h4 className="text-white font-medium">⏰ Auction Ended</h4>
                <p className="text-white text-sm mt-1">This auction is no longer accepting bids.</p>
              </div>
            ) : auctionWinnerDetailData ? (
              <div className="bg-blue-600 p-4 rounded-lg text-center">
                <h4 className="text-white font-medium">🏆 Winner Selected</h4>
                <p className="text-white text-sm mt-1">This auction has a winner and is no longer accepting bids.</p>
              </div>
            ) : !auctionStarted ? (
              <div className="bg-yellow-600 p-4 rounded-lg text-center">
                <h4 className="text-white font-medium">⏳ Auction Not Started Yet</h4>
                <p className="text-white text-sm mt-1">This auction will start soon. You can prepare your bid.</p>
              </div>
            ) : (
              /* Show bid form when auction is active and no winner */
              <form
                className="flex justify-between flex-wrap gap-4 items-center"
                onSubmit={placeBidHandle}
              >
                {/* input button for bid */}
                <input
                  type="number"
                  className="outline-none text-slate-300 px-3 py-4 rounded-xl bg-theme-bg2 border border-border-info-color focus:border-theme-color transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="Enter your bid (must be less than current lowest)"
                  value={newBidAmount}
                  onChange={(e) => setNewBidAmount(e.target.value)}
                  required
                />
                {logInUser ? (
                  logInUser?.userType === "seller" ? (
                    logInUser?.businessVerified ? (
                      <button
                        type="submit"
                        disabled={singleAuction?.user === logInUser?._id}
                        className={`py-2 px-4 rounded-lg text-white ${
                          singleAuction?.user === logInUser?._id
                            ? "bg-theme-bg2 text-body-text-color cursor-not-allowed border border-border-info-color"
                            : "bg-color-primary border cursor-pointer border-border-info-color hover:bg-color-danger"
                        }`}
                      >
                        {singleAuction?.user === logInUser?._id ? "Cannot Bid on Your Own Auction" : "Place Bid"}
                      </button>
                    ) : (
                      <Link
                        to="/user-profile/business-verification"
                        className="bg-color-primary py-2 px-4 rounded-lg cursor-pointer text-white"
                      >
                        Complete Business Verification
                      </Link>
                    )
                  ) : logInUser?.userType === "user" ? (
                    <div className="bg-red-600 p-3 rounded-lg text-center">
                      <p className="text-white text-sm">Buyers cannot bid on auctions</p>
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      className="bg-color-primary py-2 px-4 rounded-lg cursor-pointer text-white"
                    >
                      Login as Supplier to Bid
                    </Link>
                  )
                ) : (
                  <Link
                    to="/login"
                    className="bg-color-primary py-2 px-4 rounded-lg cursor-pointer text-white"
                  >
                    Login to Place Bid
                  </Link>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SingleAuctionDetail;
