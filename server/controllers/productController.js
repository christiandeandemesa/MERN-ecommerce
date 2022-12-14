const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');

// Creates product
const createProduct = asyncHandler(async (req, res) => {
	const {name, desc, price, category, size, color, countInStock} = req.body;

	const productExists = await Product.findOne({name});
	if (productExists) return res.status(409).json('Product already exists');

	if (!name || !desc || !price || !category || !size || !color || !countInStock)
		return res
			.status(400)
			.json('Name, description, price, category, size, color, and stock count required');

	let filePath;
	if (req.file) {
		if (
			req.file.mimetype === 'image/png' ||
			req.file.mimetype === 'image/jpg' ||
			req.file.mimetype === 'image/jpeg' ||
			req.file.mimetype === 'image/webp'
		)
			filePath = req.file.filename;
		else res.status(409).json('The only accepted image files are .png, .jpg, and .jpeg');
	} else {
		res.status(400).json('Image required');
		return;
	}

	const newProduct = await Product.create({
		name,
		desc,
		rating: 0,
		price,
		image: filePath,
		category,
		size,
		color,
		countInStock,
		numReviews: 0,
		reviews: []
	});

	if (!req.user.isAdmin)
		return res.status(403).json('Only an administrator can create a product');

	if (newProduct) res.status(201).json(newProduct);
	else res.status(400).json('Invalid product data');
});

// Gets one product
const getOneProduct = asyncHandler(async (req, res) => {
	const existingProduct = await Product.findById(req.params.id);
	if (!existingProduct) return res.status(401).json('Product not found');

	res.status(200).json(existingProduct);
});

// Gets all the products
const getAllProducts = asyncHandler(async (req, res) => {
	const category = req.query.category;
	const size = req.query.size;
	const color = req.query.color;
	const filter = req.query.filter;

	// Each if-else statement handles a different combination of queries
	let existingProducts;
	if (category && size && color && filter === 'Price (Highest to Lowest)')
		existingProducts = await Product.find({category, size, color}).sort({
			price: -1
		});
	else if (category && size && color && filter === 'Price (Lowest to Highest)')
		existingProducts = await Product.find({category, size, color}).sort({
			price: 1
		});
	else if (category && size && color && filter === 'Rating (Highest to Lowest)')
		existingProducts = await Product.find({category, size, color}).sort({
			rating: -1
		});
	else if (category && size && color && filter === 'Rating (Lowest to Highest)')
		existingProducts = await Product.find({category, size, color}).sort({
			rating: 1
		});
	else if (category && size && filter === 'Price (Highest to Lowest)')
		existingProducts = await Product.find({category, size}).sort({
			price: -1
		});
	else if (category && size && filter === 'Price (Lowest to Highest)')
		existingProducts = await Product.find({category, size}).sort({
			price: 1
		});
	else if (category && color && filter === 'Price (Highest to Lowest)')
		existingProducts = await Product.find({category, color}).sort({
			price: -1
		});
	else if (category && color && filter === 'Price (Lowest to Highest)')
		existingProducts = await Product.find({category, color}).sort({
			price: 1
		});
	else if (category && size && filter === 'Rating (Highest to Lowest)')
		existingProducts = await Product.find({category, size}).sort({
			rating: -1
		});
	else if (category && size && filter === 'Rating (Lowest to Highest)')
		existingProducts = await Product.find({category, size}).sort({
			rating: 1
		});
	else if (category && color && filter === 'Rating (Highest to Lowest)')
		existingProducts = await Product.find({category, color}).sort({
			rating: -1
		});
	else if (category && color && filter === 'Rating (Lowest to Highest)')
		existingProducts = await Product.find({category, color}).sort({
			rating: 1
		});
	else if (category && size && color)
		existingProducts = await Product.find({category, size, color});
	else if (category && size) existingProducts = await Product.find({category, size});
	else if (category && color) existingProducts = await Product.find({category, color});
	else if (category && filter === 'Price (Highest to Lowest)')
		existingProducts = await Product.find({category}).sort({
			price: -1
		});
	else if (category && filter === 'Price (Lowest to Highest)')
		existingProducts = await Product.find({category}).sort({
			price: 1
		});
	else if (category && filter === 'Rating (Highest to Lowest)')
		existingProducts = await Product.find({category}).sort({
			rating: -1
		});
	else if (category && filter === 'Rating (Lowest to Highest)')
		existingProducts = await Product.find({category}).sort({
			rating: 1
		});
	else if (category) existingProducts = await Product.find({category});
	else if (size) existingProducts = await Product.find({size});
	else if (color) existingProducts = await Product.find({color});
	else if (filter === 'Price (Highest to Lowest)')
		existingProducts = await Product.find().sort({
			price: -1
		});
	else if (filter === 'Price (Lowest to Highest)')
		existingProducts = await Product.find().sort({
			price: 1
		});
	else if (filter === 'Rating (Highest to Lowest)')
		existingProducts = await Product.find().sort({
			rating: -1
		});
	else if (filter === 'Rating (Lowest to Highest)')
		existingProducts = await Product.find().sort({
			rating: 1
		});
	else existingProducts = await Product.find();

	res.status(200).json(existingProducts);
});

// Updates product
const updateProduct = asyncHandler(async (req, res) => {
	const existingProduct = await Product.findById(req.params.id);
	if (!existingProduct) return res.status(400).json('Product not found');

	let filePath;
	if (req.file) {
		if (
			req.file.mimetype === 'image/png' ||
			req.file.mimetype === 'image/jpg' ||
			req.file.mimetype === 'image/jpeg' ||
			req.file.mimetype === 'image/webp'
		)
			filePath = req.file.filename;
		else {
			res.status(409).json('The only accepted image files are .png, .jpg, and .jpeg');
			return;
		}
	}

	let updatedProduct;
	try {
		updatedProduct = await Product.findByIdAndUpdate(
			req.params.id,
			{
				$set: req.body,
				image: filePath
			},
			{new: true}
		);
	} catch (err) {
		console.log(err.message.white.bgRed);
		res.status(400).json('Invalid updated product data');
	}

	if (req.user.isAdmin) res.status(201).json(updatedProduct);
	else res.status(403).json('Only an administrator can update a product');
});

// Deletes product
const deleteProduct = asyncHandler(async (req, res) => {
	const existingProduct = await Product.findById(req.params.id);
	if (!existingProduct) return res.status(404).json('Product not found');

	if (req.user.isAdmin) {
		await Product.findByIdAndDelete(existingProduct);
		res.status(200).json('Deleted product');
	} else res.status(403).json('Only an administrator can delete a product');
});

// Creates review
const createReview = asyncHandler(async (req, res) => {
	const {userRating, userReview} = req.body;

	const existingProduct = await Product.findById(req.params.id);
	if (!existingProduct) return res.status(404).json('Product not found');

	if (existingProduct.reviews.find(user => user.userId === req.user.id))
		return res.status(409).json('You have already written a review for this product');

	if (!userRating || !userReview) return res.status(400).json('Rating and review are required');

	const newReview = {
		userName: `${req.user.firstName} ${req.user.lastName}`,
		userId: req.user.id,
		userRating,
		userReview
	};

	existingProduct.reviews.push(newReview); // Adds the newReview object to the reviews array
	existingProduct.rating =
		existingProduct.reviews.reduce((a, b) => b.userRating + a, 0) /
		existingProduct.reviews.length; // Updates the average rating of all the reviews' userRatings
	existingProduct.numReviews = existingProduct.reviews.length;

	const updatedProduct = await existingProduct.save(); // .save() in this case updates the document

	if (updatedProduct)
		res.status(201).json({
			review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
			rating: updatedProduct.rating,
			numReviews: updatedProduct.numReviews
		});
	else res.status(400).json('Invalid review data');
});

// Updates review
const updateReview = asyncHandler(async (req, res) => {
	const {userRating, userReview} = req.body;

	const existingProduct = await Product.findById(req.params.id);
	if (!existingProduct) return res.status(404).json('Product not found');

	if (!existingProduct.reviews.find(user => user.userId === req.user.id))
		return res.status(409).json('You have not written a review for this product');

	if (!userRating || !userReview) return res.status(400).json('Rating and review are required');

	await Product.updateOne(
		{_id: req.params.id},
		{
			$pull: {reviews: {userId: req.user.id}} // Removes any object in the reviews array where its userId matches to the logged in user's id
		}
	);

	const productWithoutReview = await Product.findById(req.params.id); // You have to find the product again after the above update, and assigning the const to above update returns an object with upserts instead of the document
	const updatedReview = {
		userName: `${req.user.firstName} ${req.user.lastName}`,
		userId: req.user.id,
		userRating,
		userReview
	};

	productWithoutReview.reviews.push(updatedReview);
	productWithoutReview.rating =
		productWithoutReview.reviews.reduce((a, b) => b.userRating + a, 0) /
		productWithoutReview.reviews.length;

	const updatedProduct = await productWithoutReview.save();

	if (updatedProduct)
		res.status(201).json({
			review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
			rating: updatedProduct.rating,
			numReviews: updatedProduct.numReviews
		});
	else res.status(400).json('Invalid updated review data');
});

// Deletes review
const deleteReview = asyncHandler(async (req, res) => {
	const existingProduct = await Product.findById(req.params.id);
	if (!existingProduct) return res.status(404).json('Product not found');

	if (!existingProduct.reviews.find(user => user.userId === req.user.id))
		return res.status(409).json('You have not written a review for this product');

	await Product.updateOne(
		{_id: req.params.id},
		{
			$pull: {reviews: {userId: req.user.id}}
		}
	);

	const productWithoutReview = await Product.findById(req.params.id);

	productWithoutReview.rating =
		productWithoutReview.reviews.reduce((a, b) => b.userRating + a, 0) /
			productWithoutReview.reviews.length || 0; // If there is at least one review then find the average, otherwise it is 0
	productWithoutReview.numReviews = productWithoutReview.reviews.length;

	await productWithoutReview.save();

	res.status(200).json("Deleted user's review");
});

module.exports = {
	createProduct,
	getOneProduct,
	getAllProducts,
	updateProduct,
	deleteProduct,
	createReview,
	updateReview,
	deleteReview
};
