const { dayjs } = require("dayjs");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Blog = require("../models/Blog");
const { format } = require("date-fns");
const Order = require("../models/ProductOrder");

module.exports = {
  index: async (req, res, next) => {
    // const categories = await Category.find({}).lean();
    const latestProducts = await Product.find()
      .lean()
      .sort({ date: -1 }) // Sắp xếp theo ngày giảm dần
      .limit(8); // Giới hạn chỉ lấy 7 sản phẩm gần nhất
    
    const blogs = await Blog.find()
      .sort({ date: -1 }) // Sắp xếp theo ngày giảm dần
      .limit(3); // Giới hạn chỉ lấy 3 bài viết gần nhất
    const formattedBlogs = blogs.map((blog) => {
      const truncatedContent =
        blog.content.length > 200
          ? blog.content.replace(/(<([^>]+)>)/gi, "").slice(0, 200) + "..."
          : blog.content;
      const formattedDate = format(blog.date, "dd-MM-yyyy");
      return {
        ...blog.toObject(),
        formattedDate: formattedDate,
        truncatedContent: truncatedContent,
      };
    });
    // let categoryData = categories;
    // for (let i = 0; i < categoryData.length; i++) {
    //   categoryData[i].listProduct = [];
    //   for (let j = 0; j < categoryData[i].listIdProduct.length; j++) {
    //     let product = await Product.findById(
    //       categoryData[i].listIdProduct[j]
    //     ).lean();
    //     categoryData[i].listProduct.push(product);
    //     if (j === 3) {
    //       break;
    //     }
    //   }
    // }


    res.render("home/home", {
      // category: categories,
      // categoryData: categoryData,
      blogs: formattedBlogs,
      latestProducts: latestProducts,
    });
  },
};
