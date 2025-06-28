// import mongoose from "mongoose";

// const auctionSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: { type: String , required: true},
//   category: { type: mongoose.Schema.Types.ObjectId, ref: "ProductCategory", required: true},
//   seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   startTime: { type: Date, required: true },
//   endTime: { type: Date, required: true },
//   bids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bid" }],
//   winner: { type: mongoose.Schema.Types.ObjectId, ref: "Bid" },
//   status: {
//     type: String
   
//   },
//   location: {type:mongoose.Schema.Types.ObjectId, ref:"City" },
//   image:{type:String,required:true},
//   startingPrice: { type: Number, required: true },
//   reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
//   paid:{
//     type:Boolean,
//     default:false
//   },
// }, 
// {
//   timestamps: true,
// });

// const Auction = mongoose.model("Auction", auctionSchema);


// export default Auction;


import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Need title
    description: { type: String, required: true }, // Need description
    quantity: { type: Number, required: true }, // Quantity needed
    budget: { type: Number, required: true }, // Buyer's budget (reference for suppliers)
    category: { type: mongoose.Schema.Types.ObjectId, ref: "ProductCategory", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who posted the need
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    bids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bid" }], // Ref to Bid documents
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Winning supplier
    lowestBidAmount: { type: Number, default: null },
    image:{type:String,required:true}, // Lowest bid price
    status: { type: String},
    location: { type: mongoose.Schema.Types.ObjectId, ref: "City" },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    paid: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Auction = mongoose.model("Auction", auctionSchema);

export default Auction;
