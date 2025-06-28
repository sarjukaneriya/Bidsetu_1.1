import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import Bid from "../models/bid.model.js";
import Auction from "../models/auction.model.js";



// @desc Add bid on item
// @route POST /api/v1/bids/:itemId
// @access Private

// const addBidOnItem = asyncHandler(async (req, res) => {
//   try {
//     const { amount } = req.body;

//     if (!amount) {
//       return res.status(400).json(new ApiResponse(400, "Amount is required"));
//     }
//     console.log(amount, "amount");

//     let item = await Auction.findById(req.params.id); 
//     if (!item) {
//       return res.status(404).json(new ApiResponse(404, "Item not found"));
//     }
//     console.log(item, "item....");

//     const newBid = new Bid({
//       bidder: req.user._id,
//       auction: req.params.id,
//       bidAmount: req.body.amount,
//     });

    
//     await newBid.save();
    
//     item.bids.push(newBid._id);
//     item.startingPrice = amount;

//     await item.save();

//     return res
//       .status(201)
//       .json(new ApiResponse(201, "Bid placed successfully", newBid));
//   } catch (error) {
//     return res
//       .status(500)
//       .json(new ApiResponse(500, error?.message || "Internal server error"));
//   }
// });


const addBidOnItem = asyncHandler(async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json(new ApiResponse(400, "Bid amount is required"));
    }

    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }

    if (auction.status !== "active") {
      return res.status(400).json(new ApiResponse(400, "Bidding is closed for this Need"));
    }

    if (req.user.userType !== "seller") {
      return res.status(403).json(new ApiResponse(403, "Only Suppliers can place bids"));
    }

    const newBid = new Bid({
      bidder: req.user._id,
      auction: req.params.id,
      bidAmount: amount,
    });

    await newBid.save();

    // Push the bid ID into the auction
    auction.bids.push(newBid._id);

    // Update lowestBidAmount if needed
    if (!auction.lowestBidAmount || amount < auction.lowestBidAmount) {
      auction.lowestBidAmount = amount;
      auction.winner = newBid._id;
    }

    await auction.save();

    return res
      .status(201)
      .json(new ApiResponse(201, "Bid placed successfully", newBid));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});




//@desc Get all a winner of an auction
//@route GET /api/auctions/:id/winner
//@access Public

// const getWinnerOfAuction = asyncHandler(async (req, res) => {
//   console.log(req.params.id, "req.params.id");
//   const bids = await Bid.find({ auction: req.params.id });
//   console.log(bids, "auction.........");

//   if (!bids) {
//     return res.status(404).json(new ApiResponse(404, "Auction not found"));
//   }
//   if (bids.length === 0) {
//     return res.status(406).json(new ApiResponse(406, "No bids found"));
//   }

//   //we got auction array
//   //we need to get the max bid from the array
//   //then we need to get the user id of the max bid
//   //then we need to get the user from the user id
//   //then we need to set the winner of the auction to the user
//   //then we need to set the auction to over
//   //then we need to save the auction

//   let maxBidId = bids[0]._id;
//   let maxAmount = bids[0].bidAmount;
//   for (let i = 1; i < bids.length; i++) {
//     if (bids[i].bidAmount > maxAmount) {
//       maxAmount = bids[i].bidAmount;
//       maxBidId = bids[i]._id;
//     }
//   }

//   console.log(maxAmount, "maxAmount");
//   console.log(maxBidId, "maxBid");
//   const auction = await Auction.findById(req.params.id);
//   const winnerUser = await Bid.findById(maxBidId).populate(
//     "bidder",
//     "fullName email phone profilePicture"
//   );

//   console.log(winnerUser, "winnerUser");

//   auction.winner = maxBidId;
//   auction.status = "over";

//   await auction.save();

//   return res
//     .status(200)
//     .json(new ApiResponse(200, "Winner of the auction", winnerUser));
// });

const getWinnerOfAuction = asyncHandler(async (req, res) => {
  const bids = await Bid.find({ auction: req.params.id });

  if (!bids || bids.length === 0) {
    return res.status(404).json(new ApiResponse(404, "No bids found"));
  }

  // Find Lowest Bid
  let minBidId = bids[0]._id;
  let minAmount = bids[0].bidAmount;

  for (let i = 1; i < bids.length; i++) {
    if (bids[i].bidAmount < minAmount) {
      minAmount = bids[i].bidAmount;
      minBidId = bids[i]._id;
    }
  }

  const auction = await Auction.findById(req.params.id);
  const winnerBid = await Bid.findById(minBidId).populate(
    "bidder",
    "fullName email phone profilePicture"
  );

  auction.winner = minBidId;
  auction.status = "over";

  await auction.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Winner of the auction", winnerBid));
});


// @desc Get all bids by user ID 
// @route GET /api/bids
// @access Private

const getBidsByUser = asyncHandler(async (req, res) => {
  try {
    const bids = await Bid.find({ bidder: req.user._id }).populate(
      "auction",
      "name description budget"
    )
    .sort({ createdAt: -1 })


    console.log(bids, "bids....");
    if (!bids) {
      return res.status(404).json(new ApiResponse(404, "No bids found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "All bids by user", {bids: bids}));
    
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
    
  }

  
});


// @desc Get all bids by Auction ID
// @route GET /api/bids/get-all-bids/:auctionId
// @access Public

const getAllBidsByAuctionId = asyncHandler(async (req, res) => {
  try {

    const bids = await Bid.find({ auction: req.params.auctionId }).populate(
      "bidder",
      "fullName profilePicture"
    )
    .sort({ createdAt: -1 })

    if (!bids) {
      return res.status(404).json(new ApiResponse(404, "No bids found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "All bids by auction", {bids: bids}));
    
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
    
  }

  
});




export { 
  addBidOnItem, 
  getWinnerOfAuction,
  getBidsByUser,
  getAllBidsByAuctionId
};


