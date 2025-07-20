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
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "Bid" }, // Winning bid (not user)
    lowestBidAmount: { type: Number, default: null },
    image:{type:String,required:true}, // Lowest bid price
    status: { type: String},
    location: { type: mongoose.Schema.Types.ObjectId, ref: "City" },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    paid: { type: Boolean, default: false },
    
    // 🚚 Delivery Tracking Fields for Supplier Ranking
    expectedDeliveryDate: { type: Date }, // When supplier promised to deliver
    actualDeliveryDate: { type: Date }, // When item was actually delivered
    deliveryStatus: { 
      type: String, 
      enum: ['pending', 'in_transit', 'delivered', 'delayed', 'cancelled'],
      default: 'pending'
    },
    deliveryConfirmed: { type: Boolean, default: false }, // Buyer confirmed delivery
    deliveryConfirmedAt: { type: Date }, // When delivery was confirmed
    deliveryNotes: { type: String }, // Any delivery-related notes
  },
  {
    timestamps: true,
  }
);

const Auction = mongoose.model("Auction", auctionSchema);

export default Auction;
