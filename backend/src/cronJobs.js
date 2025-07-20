// src/cronJobs.js
import cron from 'node-cron';
import moment from "moment"
import Auction from './models/auction.model.js';
import Bid from './models/bid.model.js';
import Notification from './models/notification.model.js';
import Cart from './models/cart.model.js';
import { io } from "./index.js";



async function updateAuctionStatus(auctionId, status) {
  const auction = await Auction.findById(auctionId);

  auction.status = status;

  await auction.save();
}

async function selectAuctionWinner(auctionId) {
  console.log("selecting auction winner in cronJobs,,,,,,,,,,");
  io.emit("setStatus","auction ended.")
  const bids = await Bid.find({ auction: auctionId });
  console.log(bids, "auction.........");

 if(bids.length <= 0){
  return
 }

  // Find the lowest bid (since this is a reverse auction)
  let minBidId = bids[0]._id;
  let minAmount = bids[0].bidAmount;
  for (let i = 1; i < bids.length; i++) {
    if (bids[i].bidAmount < minAmount) {
      minAmount = bids[i].bidAmount;
      minBidId = bids[i]._id;
    }
  }

  const auction = await Auction.findById(auctionId);
  const winnerBid = await Bid.findById(minBidId).populate(
    "bidder",
    "_id fullName email phone profilePicture"
  );

  console.log(winnerBid, "winnerBid");

  auction.winner = minBidId; // Set winner as bid ID
  auction.lowestBidAmount = minAmount;
  auction.status = "over";

  await auction.save();

  await sendNotification(winnerBid, auction)
  

//first find the  user in cart then add item to that cart
  const userCart=await Cart.findOne({user:winnerBid.bidder._id});
  if(!userCart){
      await Cart.create({products:[auction._id],user:winnerBid.bidder._id});
  }else{
      userCart.products.push(auction._id);
      await userCart.save();
  }

  console.log("Cart updated for winner");
  
  

}

async function sendNotification(winnerBid, auction){
  console.log("sending notificaton to userin cornjosb,,,,,,,,,,,,");

  //find auciton
  
  if (!auction || !winnerBid) {
    return 
  }
  const type="AUCTION_ENDED"

  //check notification type
  if (type === "AUCTION_ENDED") {
    var notification = {
      user: null,
      message: `${winnerBid?.bidder?.fullName} Won the  ${auction?.name}`,
      type: "AUCTION_ENDED",
      auction: auction?._id,
      link: `/single-auction-detail/${auction?._id}`,
    };
  }

    // Find all bids for the auction
    const bids = await Bid.find({ auction: auction?._id });

    // Get all unique user IDs from the bids
    const userIds = new Set(bids.map((bid) => bid?.bidder?.toString()));

    // Add the owner of the item to the user IDs
    userIds.add(auction.user.toString());

    // Create a notification for each user ID
    userIds.forEach(async (id) => {
      notification.message = `${
        id === winnerBid?.bidder?._id?.toString() ? "you" : winnerBid?.bidder?.fullName
      } Won the ${auction?.name}`;

      await new Notification({ ...notification, user: id }).save();
    });

    
}

// Watch for new auctions
const changeStream = Auction.watch();

changeStream.on('change', (change) => {
  try{
    if (change.operationType === 'insert') {
      const auction = change.fullDocument;
  console.log("cronjobs,,,,,,,,,,,,,,,, are herer");
      // Schedule cron jobs for the new auction
      const startCronExpression = moment(auction.startTime).format('m H D M *');
      const endCronExpression = moment(auction.endTime).format('m H D M *');
  
      cron.schedule(startCronExpression, () => {
        updateAuctionStatus(auction._id, 'active');
      });
  
      cron.schedule(endCronExpression, async () => {
        await updateAuctionStatus(auction._id, 'over');
        await selectAuctionWinner(auction._id);
      });
    }

  } catch (err){
    console.log(err, "error in cronjobs")

  }
});


