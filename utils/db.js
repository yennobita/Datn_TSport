const mongoose = require("mongoose");

async function connectMongoose() {
  try {
    await mongoose.connect(process.env.DB_HOST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Kết nối MongoDB thất bại", error);
  }
}

module.exports = { connectMongoose };
