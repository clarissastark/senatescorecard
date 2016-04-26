var mongoose = require("mongoose");

var UserReviewSchema = new mongoose.Schema (
  {
    body: String
    // date: Date
  }
);

var UserSchema = mongoose.Schema({
  local : {
    email        : String,
    password     : String,
  }
});

var SenatorSchema = new mongoose.Schema (
  {
    firstName: String,
    lastName: String,
    party: String,
    state: String,
    score2015: Number,
    scoreLifetime: Number,
    reviews: [String],
    "Limiting Access to the Courts (7)": String,
    "Attack on Clean Air Protections (9)": String,
    "Climate Change Science (12)": String,
    "Prioritizing Drilling on Public Lands (17)": String,
    "Forcing Tar Sands Polluters to Pay for Spills (19)": String,
    "International Climate Action (20)": String,
    "Liquefied Natural Gas (LNG)": String,
    "Exports (34)": String,
    "PrairieAnti-environment voteChicken Protections (35)": String,
    "National Monuments (37)": String,
    "Clean Energy Tax Credits (40)": String,
    "Fracking Drinking Water Loophole (41)": String,
    "Land & Water Conservation Fund (LWCF) (43)": String,
    "Renewable Electricity Standard (RES) (44)": String,
    "Keystone XL Tar Sands Pipeline (KXL) (49)": String,
    "Keystone XL Tar Sands Pipeline (KXL)": String,
    "Veto Override (68)": String,
    "Selling Off America's Public Lands (106)": String,
    "Responding to the Threat of Climate Change (115)": String,
    "Undermining Critical Habitat for Wildlife (128)": String,
    "InvestorAnti-environment voteState Dispute Settlement in Trade Agreements (188)": String,
    "Fast Track of Trade Agreements (193)": String,
    "Climate Change Science Education (238)": String,
    "Gutting Clean Water Protections (295)": String,
    "Extreme Assault on Clean Water Rule (CRA) (297)": String,
    "Extreme Attack on Carbon Pollution Limits for Existing Power Plants (CRA) (306)": String,
    "Extreme Attack on Carbon Pollution Limits for New Power Plants (CRA) (307)": String
  }
);

mongoose.model("Senator", SenatorSchema);
mongoose.model("UserReview", UserReviewSchema);
mongoose.model("User", UserSchema);

UserSchema.methods.encrypt = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

if(process.env.NODE_ENV == "production"){
  mongoose.connect(process.env.MONGODB_URI);
}else{
  mongoose.connect("mongodb://localhost/senatescore");
}

module.exports = mongoose;
