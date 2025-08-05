// scripts/seedDemoData.js
import mongoose from "mongoose";
import User from "../src/models/user.model.js";
import Auction from "../src/models/auction.model.js";
import Bid from "../src/models/bid.model.js";
import ProductCategory from "../src/models/productCategory.model.js";
import City from "../src/models/city.model.js";

// 1. Connect to DB
await mongoose.connect("mongodb+srv://sarjukaneriya:77718@cluster0.qsj31td.mongodb.net/auctiondb?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 2. Master Data: Categories & Cities (idempotent)
const categories = [
  { name: "Electronics" },
  { name: "Raw Materials" },
  { name: "Office Supplies" },
];
const cities = [
  { name: "New York" },
  { name: "Los Angeles" },
  { name: "Chicago" },
];

const categoryDocs = [];
for (const cat of categories) {
  let doc = await ProductCategory.findOne({ name: cat.name });
  if (!doc) doc = await ProductCategory.create(cat);
  categoryDocs.push(doc);
}

const cityDocs = [];
for (const city of cities) {
  let doc = await City.findOne({ name: city.name });
  if (!doc) doc = await City.create(city);
  cityDocs.push(doc);
}

// 3. Users: Buyers & Suppliers (idempotent)
const buyers = [
  { fullName: "Buyer One", email: "buyer1@example.com", password: "pass", userType: "user" },
  { fullName: "Buyer Two", email: "buyer2@example.com", password: "pass", userType: "user" },
];
const suppliers = [
  { fullName: "Supplier One", email: "supplier1@example.com", password: "pass", userType: "seller", businessVerified: true },
  { fullName: "Supplier Two", email: "supplier2@example.com", password: "pass", userType: "seller", businessVerified: true },
  { fullName: "Supplier Three", email: "supplier3@example.com", password: "pass", userType: "seller", businessVerified: true },
];

const buyerDocs = [];
for (const user of buyers) {
  let doc = await User.findOne({ email: user.email });
  if (!doc) doc = await User.create(user);
  buyerDocs.push(doc);
}
const supplierDocs = [];
for (const user of suppliers) {
  let doc = await User.findOne({ email: user.email });
  if (!doc) doc = await User.create(user);
  supplierDocs.push(doc);
}

// 4. Auctions (idempotent by name+buyer)
const auctionsData = [
  {
    name: "Bulk Copper Wire",
    description: "Need 1000kg copper wire",
    quantity: 1000,
    budget: 5000,
    category: categoryDocs[1]._id,
    user: buyerDocs[0]._id,
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: "over",
    image: "https://via.placeholder.com/150",
    location: cityDocs[0]._id,
  },
  {
    name: "Office Chairs",
    description: "Ergonomic chairs for office",
    quantity: 50,
    budget: 2000,
    category: categoryDocs[2]._id,
    user: buyerDocs[1]._id,
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: "active",
    image: "https://via.placeholder.com/150",
    location: cityDocs[1]._id,
  },
];

const auctionDocs = [];
for (const auc of auctionsData) {
  let doc = await Auction.findOne({ name: auc.name, user: auc.user });
  if (!doc) doc = await Auction.create(auc);
  auctionDocs.push(doc);
}

// 5. Bids (idempotent by auction+supplier+amount)
const bidsData = [
  // For first auction (over)
  { auction: auctionDocs[0]._id, bidder: supplierDocs[0]._id, bidAmount: 4500 },
  { auction: auctionDocs[0]._id, bidder: supplierDocs[1]._id, bidAmount: 4700 },
  // For second auction (active)
  { auction: auctionDocs[1]._id, bidder: supplierDocs[2]._id, bidAmount: 1800 },
  { auction: auctionDocs[1]._id, bidder: supplierDocs[0]._id, bidAmount: 1900 },
];

const bidDocs = [];
for (const bid of bidsData) {
  let doc = await Bid.findOne({ auction: bid.auction, bidder: bid.bidder, bidAmount: bid.bidAmount });
  if (!doc) doc = await Bid.create(bid);
  bidDocs.push(doc);
}

// 6. Set bids and winners on auctions (idempotent)
for (const auc of auctionDocs) {
  const aucBids = await Bid.find({ auction: auc._id });
  auc.bids = aucBids.map(b => b._id);
  // Set winner for 'over' auctions
  if (auc.status === "over" && aucBids.length > 0) {
    const lowestBid = aucBids.reduce((min, b) => (b.bidAmount < min.bidAmount ? b : min), aucBids[0]);
    auc.winner = lowestBid._id;
    auc.lowestBidAmount = lowestBid.bidAmount;
  }
  await auc.save();
}

console.log("Demo data seeded successfully!");
process.exit();