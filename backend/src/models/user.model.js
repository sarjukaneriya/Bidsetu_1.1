import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, unique: true , trim : true},
  password: { type: String, required: true,trim : true},
  email: { type: String, required: true, unique: true , trim : true},
  location: { type: String },
  userType: {
    type: String,
    default: "user",
  },
  resetToken: { type: String },
  resetTokenExpire: { type: Date },
  
  profilePicture: { type: String , 
  default:"https://res.cloudinary.com/dnsxaor2k/image/upload/v1721403078/r4s3ingo0ysqq5hzsqal.jpg"},
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  gender: { type: String },
  description: { type: String },
  paymentVerified: { type: Boolean, default: false },
  
  // Business Verification for Suppliers
  businessVerified: { type: Boolean, default: false },
  businessDetails: {
    businessName: { type: String },
    businessType: { type: String },
    gstNumber: { type: String },
    panNumber: { type: String },
    businessAddress: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    phoneNumber: { type: String },
    email: { type: String },
    website: { type: String },
    businessDescription: { type: String },
    yearsInBusiness: { type: Number },
    annualTurnover: { type: String },
    employeeCount: { type: Number },
    certifications: { type: String },
    bankName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    accountHolderName: { type: String },
    verificationDate: { type: Date },
    verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
  },

  // 🏆 Supplier Performance Metrics for AI Ranking
  supplierMetrics: {
    onTimeDeliveries: { type: Number, default: 0 }, // Count of on-time deliveries
    totalDeliveries: { type: Number, default: 0 }, // Total number of deliveries
    onTimeDeliveryRate: { type: Number, default: 0 }, // Percentage (0-100)
    reliabilityScore: { type: Number, default: 0 }, // Overall score (0-100)
    averageDeliveryTime: { type: Number, default: 0 }, // Average days to deliver
    totalEarnings: { type: Number, default: 0 }, // Total earnings from successful deliveries
    rating: { type: Number, default: 0 }, // Average rating from buyers
    totalReviews: { type: Number, default: 0 }, // Total number of reviews
    lastDeliveryDate: { type: Date }, // Date of last delivery
    isActiveSupplier: { type: Boolean, default: false }, // Whether supplier is currently active
  },
  
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  bids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bid" }],
  auctions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Auction" }],
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  notifications: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Notification" },
  ],
},{
  timestamps:true

});

//compare password method
userSchema.methods.comparePassword = async function(enteredPassword){
  return await bcrypt.compare(enteredPassword,this.password);
}



//Jwt token generation method
userSchema.methods.generateJwtToken = function(){
  return jwt.sign({
      _id:this._id,
      fullName:this.fullName,
      email:this.email,
      location:this.location,
      userType:this.userType,
  },
  process.env.JWT_SECRET,
  {
      expiresIn:process.env.JWT_EXPIRES_IN
  })
}


//use jwt to create a reset token and used in the forget password route
userSchema.methods.generateResetToken=function(){
  const resetToken=jwt.sign({_id:this._id},process.env.RESET_TOKEN_SECRET,{expiresIn:"10m"});
  this.resetToken=resetToken;
  //add token to user model   

  this.resetTokenExpire=Date.now()+10*60*1000; //10 mins from now
  return resetToken;
}


userSchema.methods.compareTwoToken=(token) => jwt.verify(token, process.env.RESET_TOKEN_SECRET)


//hash password before saving the user model into the database
userSchema.pre('save', async function(next){
  if(!this.isModified('password')){
      next();
  }
  this.password=await bcrypt.hash(this.password,10);
  next();
})



const User = mongoose.model("User", userSchema);

export default User;


