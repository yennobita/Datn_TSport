const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const BlogSchema = new Schema(
  {
    title: String,
    content: String,
    author: String,
    date: {
      type: Date,
      default: Date.now
    },
    image: String,
    comments: [
      {
        user: String,
        text: String,
        date: {
          type: String, 
          default: new Date().toString(), 
        },
      }
    ],
    tags: [String],
  },
  { collection: "blogs" }
);

const Blog = mongoose.model("Blog", BlogSchema);
module.exports = Blog;
