import {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';

import {Typography, Box, FormControl, InputLabel, Select, MenuItem} from '@mui/material';

import axios from 'axios';

import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

function Items() {
	const catName = useParams();

	const [products, setProducts] = useState([]);
	const [size, setSize] = useState('');
	const [color, setColor] = useState('');
	const [filter, setFilter] = useState('');

	const sizes = ['', 'XS', 'S', 'M', 'L', 'XL'];
	const colors = [
		'',
		'Pink',
		'Red',
		'Orange',
		'Yellow',
		'Green',
		'Blue',
		'Purple',
		'Black',
		'Gray',
		'White',
		'Brown'
	];

	// Gets all the products from MongoDB
	useEffect(() => {
		async function fetchData() {
			try {
				const res = await axios.get(
					`http://localhost:5000/products?size=${size}&color=${color}&filter=${filter}`
				);
				setProducts(res.data);
			} catch (err) {
				console.log(err);
			}
		}
		fetchData();
	}, [size, color, filter]);

	return (
		<div style={{padding: '0 1rem'}}>
			<Typography variant='h3' component='div' sx={{marginBottom: '2rem'}}>
				{catName.category.toUpperCase()}
			</Typography>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between'
				}}
			>
				{/* Filter Products */}
				<Box
					sx={{
						width: {lg: '30%', xl: '25%'},
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center'
					}}
				>
					<Typography variant='h6' sx={{display: {xs: 'none', lg: 'block'}}}>
						Filter Products:{' '}
					</Typography>
					<Box sx={{minWidth: 120}}>
						<FormControl fullWidth>
							<InputLabel>Size</InputLabel>
							<Select
								value={size}
								label='Size'
								onChange={e => setSize(e.target.value)}
							>
								{sizes.map((size, idx) => (
									<MenuItem key={idx} value={size}>
										{size === '' ? 'All' : size}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>
					<Box sx={{minWidth: 120}}>
						<FormControl fullWidth>
							<InputLabel>Color</InputLabel>
							<Select
								value={color}
								label='Color'
								onChange={e => setColor(e.target.value)}
							>
								{colors.map((color, idx) => (
									<MenuItem key={idx} value={color}>
										{color === '' ? 'All' : color}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>
				</Box>

				{/* Sort Products */}
				<Box
					sx={{
						width: {lg: '20%', xl: '16%'},
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center'
					}}
				>
					<Typography variant='h6' sx={{display: {xs: 'none', lg: 'block'}}}>
						Sort Products:{' '}
					</Typography>
					<Box sx={{minWidth: 120}}>
						<FormControl fullWidth>
							<InputLabel>Sort</InputLabel>
							<Select
								value={filter}
								label='Price'
								onChange={e => setFilter(e.target.value)}
							>
								<MenuItem value=''>Alphabetical</MenuItem>
								<MenuItem value='Price (Lowest to Highest)'>
									Price (Lowest to Highest)
								</MenuItem>
								<MenuItem value='Price (Highest to Lowest)'>
									Price (Highest to Lowest)
								</MenuItem>
								<MenuItem value='Rating (Lowest to Highest)'>
									Rating (Lowest to Highest)
								</MenuItem>
								<MenuItem value='Rating (Highest to Lowest)'>
									Rating (Highest to Lowest)
								</MenuItem>
							</Select>
						</FormControl>
					</Box>
				</Box>
			</Box>

			{/* Container to hold all Product cards */}
			<Box
				sx={{
					padding: '1rem 0',
					display: 'flex',
					flexWrap: 'wrap',
					justifyContent: {xs: 'center', sm: 'flex-start'},
					gap: '1rem'
				}}
			>
				{products.map(product => (
					<ProductCard key={product._id} productData={product} />
				))}
			</Box>

			<Footer />
		</div>
	);
}

export default Items;
