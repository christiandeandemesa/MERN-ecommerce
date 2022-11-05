const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');

// Creates product
const createProduct = asyncHandler(async (req, res) => {
	const {name, desc, price, size, color, countInStock} = req.body;

	const productExists = await Product.findOne({name});
	if (productExists) {
		res.status(409).json('Product already exists');
		return;
	}

	if (!name || !desc || !price || !size || !color || !countInStock) {
		res.status(400).json('Name, description, price, size, color, and stock count required');
		return;
	}

	let filePath;
	if (req.file) {
		if (
			req.file.mimetype === 'image/png' ||
			req.file.mimetype === 'image/jpg' ||
			req.file.mimetype === 'image/jpeg'
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
		size,
		color,
		countInStock,
		numReviews: 0,
		reviews: []
	});

	if (!req.user.isAdmin) {
		res.status(403).json('Only an administrator can create a product');
		return;
	}

	if (newProduct) res.status(201).json(newProduct);
	else res.status(400).json('Invalid product data');
});

// Gets one product
const getOneProduct = asyncHandler(async (req, res) => {
	const existingProduct = await Product.findById(req.params.id);
	if (!existingProduct) {
		res.status(401).json('Product not found');
		return;
	}

	res.status(200).json(existingProduct);
});

// Gets all the products
const getAllProducts = asyncHandler(async (req, res) => {
	const size = req.query.size;
	const color = req.query.color;
	const price = req.query.price;
	const rating = req.query.rating;

	let existingProducts;
	if (size) existingProducts = await Product.find({size});
	else if (color) existingProducts = await Product.find({color});
	else if (price === 'high')
		existingProducts = await Product.find().sort({
			price: -1
		}); // Sorts all the mongoose documents by highest price
	else if (price === 'low')
		existingProducts = await Product.find().sort({
			price: 1
		}); // Sorts all the mongoose documents by lowest price
	else if (rating === 'high')
		existingProducts = await Product.find().sort({
			rating: -1
		}); // Sorts all the mongoose documents by highest rating
	else if (rating === 'low')
		existingProducts = await Product.find().sort({
			rating: 1
		}); // Sorts all the mongoose documents by lowest price
	else existingProducts = await Product.find();

	res.status(200).json(existingProducts);
});

// Updates product
const updateProduct = asyncHandler(async (req, res) => {
	const existingProduct = await Product.findById(req.params.id);
	if (!existingProduct) {
		res.status(400).json('Product not found');
		return;
	}

	let filePath;
	if (req.file) {
		if (
			req.file.mimetype === 'image/png' ||
			req.file.mimetype === 'image/jpg' ||
			req.file.mimetype === 'image/jpeg'
		)
			filePath = req.file.filename;
		else res.status(409).json('The only accepted image files are .png, .jpg, and .jpeg');
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
	if (!existingProduct) {
		res.status(404).json('Product not found');
		return;
	}

	if (req.user.isAdmin) {
		await Product.findByIdAndDelete(existingProduct);
		res.status(200).json('Deleted product');
	} else res.status(403).json('Only an administrator can delete a product');
});

// PUT user write review
// PUT user edit review
// PUT user delete review

module.exports = {createProduct, getOneProduct, getAllProducts, updateProduct, deleteProduct};
