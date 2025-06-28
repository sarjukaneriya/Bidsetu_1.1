import ApiResponse  from "../utils/ApiResponse.js";
import Auction from "../models/auction.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// @desc Create a Need (Auction) by Buyer
// @route POST /api/v1/auctions

// @access Private (Buyer Only)
const createAuction = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      quantity,
      budget,
      category,
      startTime,
      endTime,
      location,
      
    } = req.body;
    const image = req.file?.path;

    console.log(name, "name");
    console.log(description, "description");
    console.log(category, "category");
    console.log(quantity, "quantity");
    console.log(budget, "budget");
    console.log(startTime, "startTime");
    console.log(endTime, "endTime");

    // 🛑 Check if logged-in user is Buyer
    if (req.user.userType !== "user") {
      return res
        .status(403)
        .json(new ApiResponse(403, "Only Buyers can post Needs"));
    }

    // 🛑 Validate fields
    if (
      !name ||
      !description ||
      !category ||
      !startTime ||
      !endTime ||
      !budget ||
      !quantity ||
      !location
    ) {
      return res
        .status(400)
        .json(new ApiResponse(400, "All fields are required"));
    }

    // 🛑 Check if startTime is before endTime
    if (new Date(startTime).getTime() >= new Date(endTime).getTime()) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Start time must be before end time"));
    }

    // 🛑 Check if budget is a positive number
    if (budget <= 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Budget must be a positive number"));
    }
    

    const imgUrlCloudinary = await uploadOnCloudinary(image);

    if (!imgUrlCloudinary) {
      return res
        .status(500)
        .json(new ApiResponse(500, "Error uploading image"));
    }
    // ✅ Determine status
    let currentDate = new Date();
    let status = "upcoming";

    if (new Date(startTime).getTime() < currentDate.getTime()) {
      status = "active";
    }
    if (new Date(endTime).getTime() < currentDate.getTime()) {
      status = "over";
    }

    // ✅ Create Auction (Buyer Need)
    const auction = await Auction.create({
      name,
      description,
      quantity,
      budget,
      category,
      user: req.user._id, // Buyer ID
      startTime,
      endTime,
      location,
      status,
      image: imgUrlCloudinary.url,
    });

    if (!auction) {
      return res
        .status(500)
        .json(new ApiResponse(500, "Error creating need"));
    }

    return res
      .status(201)
      .json(new ApiResponse(201, "Need posted successfully", auction));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});


// @desc Get all auctions
// @route GET /api/v1/auctions
// @access Public

// const getAllAuctions = asyncHandler(async (req, res) => {
//   try {
//     const { location, category, itemName } = req.body;
//     console.log(req.body, "req.body");

//     let filter = {
//       status: { $ne: "over" },
//     };
   
//     if (location && !mongoose.Types.ObjectId.isValid(location)) {
//       var cityid = await City.find({name: location});
//       console.log(cityid[0]._id.toString(), " city id");
//       if(location){
//         filter.location=cityid[0]._id.toString();
//       }
//     } else {
//       if(location){
//         filter.location =  location;

//       }
//     }


    
//     console.log(req.body, "req.body");

//     if (category) filter.category = category;
//     if (itemName) {
//       filter.name = { $regex: itemName, $options: "i" };
//     }
//     console.log(filter, "filter ......");
//     const auctions = await Auction.find(filter)
//       .populate("seller", "fullName email phone location profilePicture")
//       .populate({
//         path: "winner",

//         populate: {
//           path: "bidder",
//           select: "fullName  profilePicture",
//         },
//       })
//       .populate("category", "name")
//       .populate("location", "name")
//       //show new ones
//       .sort({ createdAt: -1 });

//     if (!auctions) {
//       return res.status(404).json(new ApiResponse(404, "No auctions found"));
//     }
//     return res.json(
//       new ApiResponse(200, "Auctions retrieved successfully", auctions)
//     );
//   } catch (error) {
//     // Handle the error
//     return res
//       .status(500)
//       .json(new ApiResponse(500, error?.message || "Internal server error"));
//   }
// });

// // @desc Get a single Auction by ID
// // @route GET /api/v1/auctions/:id
// // @access Public

// @desc Get a single Auction by ID
// @route GET /api/v1/auctions/:id
// @access Public
const getSingleAuctionById = asyncHandler(async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate("category", "name")
      .populate("location", "name")
      .populate("user", "fullName email phone location profilePicture")
      .populate({
        path: "bids",
        populate: {
          path: "bidder",
          select: "fullName email profilePicture",
        },
      })
      .populate({
        path: "winner",
        populate: {
          path: "bidder",
          select: "fullName profilePicture",
        },
      });

    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }

    return res.json(
      new ApiResponse(200, "Auction retrieved successfully", auction)
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});



const getAllAuctions = asyncHandler(async (req, res) => {
  try {
    const { location, category, itemName } = req.body;
    console.log(req.body, "req.body");

    let filter = {
      status: { $ne: "over" },
    };

    if (location && !mongoose.Types.ObjectId.isValid(location)) {
      var cityid = await City.find({ name: location });
      if (cityid.length > 0) {
        filter.location = cityid[0]._id.toString();
      }
    } else {
      if (location) {
        filter.location = location;
      }
    }

    if (category) filter.category = category;
    if (itemName) {
      filter.name = { $regex: itemName, $options: "i" };
    }

    console.log(filter, "filter ......");

    const auctions = await Auction.find(filter)
      .populate("user", "fullName email phone location profilePicture") // changed seller to buyer
      .populate({
        path: "winner",
        populate: {
          path: "bidder",
          select: "fullName  profilePicture",
        },
      })
      .populate("category", "name")
      .populate("location", "name")
      .sort({ createdAt: -1 });

    if (!auctions || auctions.length === 0) {
      return res.status(404).json(new ApiResponse(404, "No needs found"));
    }

    return res.json(
      new ApiResponse(200, "Needs retrieved successfully", auctions)
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

// @desc Update auction status
// @route POST /api/v1/auctions/:id/status
// @access public
import { asyncHandler } from "../utils/asyncHandler.js";

const updateAuctionStatus = asyncHandler(async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }
    //check start and now time and update status
    const now = new Date();

    if (now < auction.startTime) {
      auction.status = "upcoming";
    } else if (now > auction.startTime && now < auction.endTime) {
      auction.status = "active";
    } else {
      auction.status = "over";
    }

    await auction.save();
    return res.json(
      new ApiResponse(200, "Auction status updated successfully", auction)
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

// @desc Get all auctions of a user on which he placed bids
// @route GET /api/v1/auctions/user-bids
// @access Private

const getBidsAuctionsByUser = asyncHandler(async (req, res) => {
  try {

    const bids = await Bid.find({ bidder: req.user._id }).populate("auction")
    // populate category in auction
    .populate({
      path: "auction",
      populate: {
        path: "category",
        select: "name",
       
      }
    })
    .sort({ createdAt: -1 });
    // it is not showing in reverse order
    

    if (!bids) {
      return res.status(404).json(new ApiResponse(404, "No bids found"));
    }

    

    return res.json(
      new ApiResponse(200, "bids retrieved successfully", bids)
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});


// @desc Get all auctions by a user uploaded by him
// @route GET /api/v1/auctions/user-auctions
// @access Private

const getAuctionsByUser = asyncHandler(async (req, res) => {
  try {
    const auctions = await Auction.find({ User: req.user._id }).populate(
      "category",
      "name"
    )
    .populate({
      path: "winner",
      populate: {
        path: "bidder",
        select: "fullName",
      }})
      .sort({createdAt:-1})

    if (!auctions) {
      return res.status(404).json(new ApiResponse(404, "No auctions found"));
    }

    return res.json(
      new ApiResponse(200, "Auctions retrieved successfully", {
        auctions:auctions
      })
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});





// @desc delete auction by id
// @route DELETE /api/v1/auctions/delete/:id
// @access Private

const deleteSingleAuctionById = asyncHandler(async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }
    //delete all related data to this auction like bids and reviews

    const bids = await Bid.find({ auction: req.params.id });
    if (bids) {
      await Bid.deleteMany({ auction: req.params.id });
    }
console.log(auction, "auction.............");

await Auction.deleteOne({ _id: req.params.id });
return res.json(
      new ApiResponse(200, "Auction deleted successfully", auction)
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});



// @desc update a single auction by id
// @route PUT /api/v1/auctions/update/:id
// @access Private

const updateSingleAuactionById = asyncHandler(async (req, res) => {
 

  try {
    const {
      name,
      description,
      category,
      startTime,
      endTime,
      budget,
      location,
    } = req.body;
    const image = req.file?.path;

    console.log(req.body, "req.body........");
const auction = await Auction.findById(req.params.id);
if (!auction) {
  return res.status(404).json(new ApiResponse(404, "Auction not found"));
}
 // Check if startingPrice is a positive number
 if (budget <= 0) {
  return res
    .status(400)
    .json(new ApiResponse(400, "Starting price must be a positive number"));
}

//check start and now time and update status accordingly
let currentDate=new Date();

 if(startTime !== auction.startTime || endTime !== auction.endTime){
  if(currentDate.getTime()>auction.startTime.getTime()){
    return res.status(400).json(new ApiResponse(400, "Auction has already started, you can't update start time or end time"));
 }
 }

if(startTime > endTime){
  return res.status(400).json(new ApiResponse(400, "Start time must be before end time"));
}
if(startTime < currentDate.getTime()){
  auction.status = "active";
}else{
  auction.status = "upcoming";
}
if(auction.status === "over"){
  return res.status(400).json(new ApiResponse(400, "Auction is over, you can't update"));
}


    if(image){
    var imgUrlCloudinary = await uploadOnCloudinary(image);
    console.log(imgUrlCloudinary);
    if (!imgUrlCloudinary?.url) {
      return res.status(400).json(new ApiResponse(400, "Invalid image"));
    }
  }

    auction.name = name ? name : auction.name;
    auction.description = description ? description : auction.description;
    auction.category = category ? category : auction.category;
    auction.startTime = startTime ? startTime : auction.startTime;
    auction.endTime = endTime ? endTime : auction.endTime;
    auction.budget = budget ? budget : auction.budget;
    auction.location = location ? location : auction.location;

    auction.image = imgUrlCloudinary?.url
      ? imgUrlCloudinary.url
      : auction.image ;
    


    await auction.save();
    return res.status(201).json(new ApiResponse(201, "Auction Updated Successfully."))

  } catch (error) {
    console.error(error);
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          error.message || "Internal Server Error"
        )
      );
  }
});

// @desc Get auction winner
// @route GET /api/v1/auctions/:id/winner
// @access Public

const getAuctionWinner= asyncHandler(async (req, res) => {
  
  try {
    const auction = await Auction.findById(req.params.id)
    .populate(
      {
        path: "winner",
  
        populate: {
          path: "bidder",
          select: "fullName  profilePicture",
        },
      }
    )
      
    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }
    if (auction.bids.length === 0) {
      return res.status(404).json(new ApiResponse(404, "No bids found"));
    }
    const winner={
      winnerFullName:auction?.winner?.bidder?.fullName,
      winnerProfilePicture:auction?.winner?.bidder?.profilePicture,
      winnerBidAmount:auction?.winner?.bidAmount,
      winnerBidTime:auction?.winner?.bidTime
    }

return res.status(200).json(new ApiResponse(200, "Auction winner retrieved successfully", {winner:winner}));
    
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});



// @desc Get LIVE 10 auctions 
// @route GET /api/v1/auctions/live
// @access Public

const getLiveAuctions = asyncHandler(async (req, res) => {
  try {
    const auctions = await Auction.find({ status: "active" })
      .limit(10)
      .populate("user", "fullName email phone location profilePicture")
      .populate({
        path: "winner",

        populate: {
          path: "bidder",
          select: "fullName  profilePicture",
        },
      });

    if (!auctions) {
      return res.status(404).json(new ApiResponse(404, "No auctions found"));
    }
    return res.json(
      new ApiResponse(200, "Auctions retrieved successfully", auctions)
    );
  } catch (error) {
    // Handle the error
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});


// @desc Get UPCOMING 10 auctions
// @route GET /api/v1/auctions/upcoming-auctions
// @access Public

const getUpcomingAuctions = asyncHandler(async (req, res) => {
  try {
    const auctions = await Auction.find({ status: "upcoming" })
      .limit(10)
      .populate("user", "fullName email phone location profilePicture")
      .populate({
        path: "winner",

        populate: {
          path: "bidder",
          select: "fullName  profilePicture",
        },
      });

    // if (!auctions) {
    //   return res.status(404).json(new ApiResponse(404, "No auctions found"));
    // }
    return res.json(
      new ApiResponse(200, "Auctions retrieved successfully", auctions)
    );
  } catch (error) {
    // Handle the error
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});



const finalizeAuctionWinner = asyncHandler(async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).populate('bids');

    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }

    if (auction.status === "over") {
      return res.status(400).json(new ApiResponse(400, "Auction already finalized"));
    }

    const bids = await Bid.find({ auction: req.params.id });

    if (bids.length === 0) {
      auction.status = "over";
      await auction.save();
      return res.status(400).json(new ApiResponse(400, "No bids found, auction closed with no winner"));
    }

    // Find the lowest bid
    let minBid = bids[0];
    for (let i = 1; i < bids.length; i++) {
      if (bids[i].bidAmount < minBid.bidAmount) {
        minBid = bids[i];
      }
    }

    // Update Auction
    auction.winner = minBid._id; // store winning Bid ID
    auction.lowestBidAmount = minBid.bidAmount;
    auction.status = "over";

    await auction.save();

    return res.status(200).json(
      new ApiResponse(200, "Auction finalized successfully", {
        winnerBid: minBid,
      })
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

// @desc update payment status of auction
// @route PUT /api/v1/auctions/update-payment-status/:id
// @access Private

const updatePaymentStatus = asyncHandler(async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }
    auction.paid = true;
    await auction.save();
    return res.json(
      new ApiResponse(200, "Auction payment status updated successfully", auction)
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
})



export {
  createAuction,
  getAllAuctions,
  getSingleAuctionById,
  updateAuctionStatus,
  getBidsAuctionsByUser,
  getAuctionsByUser,
  deleteSingleAuctionById,
  updateSingleAuactionById,
  getAuctionWinner,
  getLiveAuctions,
  getUpcomingAuctions,
  updatePaymentStatus,
  finalizeAuctionWinner,
};
