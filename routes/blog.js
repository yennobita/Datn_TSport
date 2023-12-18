const express = require("express");
const router = express.Router();
const BlogController = require("../controller/BlogController");

// Show list of blogs
router.get("/", BlogController.showListBlog);

// Tuyến đường để hiển thị bài viết chi tiết
router.get("/:id", BlogController.viewBlogDetail);

// Render form to edit a blog
// router.get("/edit-blog/:id", BlogController.editBlogGet);

// Edit a blog
// router.post("/edit-blog/:id", BlogController.editBlogPost);
// router.post("/edit-blog/:id/", BlogController.editBlogPostHandler);

// Render form to add a new blog
// router.get("/add-blog", BlogController.addBlogGet);

// Add a new blog
// router.post("/add-blog", BlogController.addBlogPost);
// router.post("/add-blog", BlogController.addBlogPostHandler);


// Delete a blog
// router.get("/delete-blog/:id", BlogController.deleteBlog);

module.exports = router;
