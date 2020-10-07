var express = require("express"),
app         = express(),
methodOverride = require("method-override"),
expressSanitizer = require("express-sanitizer"),
bodyParser  = require("body-parser"),
mongoose    = require('mongoose');
mongoose.connect('mongodb://localhost:27017/restful_blog_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

// APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer())

// MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
// 	title: "TestBlog",
// 	image: "https://pixabay.com/get/54e3d5404257ad14f1dc84609620367d1c3ed9e04e507749742b7cdd9f49cd_340.jpg",
// 	body: "This is a sample post. Filled with Blah"
// });

// RESTFUL ROUTES

app.get("/", function(req, res){
	res.redirect("/blogs");
});

// INDEX
app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log("ERROR!");
		} else {
			res.render("index", {blogs: blogs});
		}
	});
});

// NEW ROUTE
app.get("/blogs/new", function(req, res){
	res.render("new");
});

// CREATE ROUTE
app.post("/blogs", function(req, res){
// 	create blogs
	console.log("==========")
	console.log(req.body);
	req.body.blog.body = req.sanitize(req.body.blog.body)
	console.log(req.body);
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new");
			} else {
				// then, redirect to the index
				res.redirect("/blogs");
				}
	});
});


// SHOW ROUTE
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
		   res.redirect("/blogs");
		   } else {
				res.render("show", {blog: foundBlog});
		   }
	})
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: foundBlog});
		}
	})
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body)
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
		   res.redirect("/blogs");
		   } else {
			   res.redirect("/blogs/" + req.params.id);
		   }
	});
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
	// destroy blog
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	})
	// redirect somewhere
}); 


app.listen(process.env.PORT || 8000, function() {
  console.log("Your Server Is Running");
});