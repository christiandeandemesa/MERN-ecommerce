import {useState} from 'react';
import {useParams} from 'react-router-dom';
import {useSelector} from 'react-redux';

import {Rating, Typography, Paper, Box, ButtonGroup, Button, Modal, TextField} from '@mui/material';
import axios from 'axios';

const months = [
	'',
	'Jan.',
	'Feb.',
	'Mar.',
	'Apr.',
	'May',
	'Jun.',
	'Jul.',
	'Aug.',
	'Sep.',
	'Oct.',
	'Nov.',
	'Dec.'
];

function Review({review}) {
	const user = useSelector(state => state.user.currentUser);
	const productId = useParams();

	const [editMode, setEditMode] = useState(false);
	const [openModal, setOpenModal] = useState(false);

	const [userRating, setUserRating] = useState(review.userRating);
	const [userReview, setUserReview] = useState(review.userReview);
	const [errorMessage, setErrorMessage] = useState('');

	// Updates the user's review for the product
	const handleSubmit = async e => {
		e.preventDefault();
		try {
			await axios.put(
				`http://localhost:5000/products/${productId.id}/updateReviews`,
				{userRating, userReview},
				{
					headers: {
						Authorization: 'Bearer ' + user.token
					}
				}
			);
			window.location.reload(false);
		} catch (err) {
			setErrorMessage(err.response.data);
		}
	};

	const handleDelete = async e => {
		e.preventDefault();
		console.log('Delete');
	};

	// Resets the form when Cancel is clicked
	const handleReset = () => {
		setEditMode(false);
		setUserRating(review.userRating);
		setUserReview(review.userReview);
	};

	return editMode ? (
		// Edit review form
		<Paper
			elevation={3}
			component='form'
			onSubmit={handleSubmit}
			sx={{
				width: '100%',
				padding: '1rem',
				display: 'flex',
				flexDirection: 'column',
				gap: '2rem',
				background: 'white',
				border: '1px solid black'
			}}
		>
			{errorMessage && (
				<Typography color='error' sx={{textAlign: 'center'}}>
					{errorMessage}
				</Typography>
			)}
			<Rating
				size='large'
				value={userRating}
				onChange={(e, newRating) => setUserRating(newRating)}
			/>
			<TextField
				label='Review'
				type='text'
				multiline
				rows={6}
				required
				value={userReview}
				onChange={e => setUserReview(e.target.value)}
			/>

			<ButtonGroup
				variant='contained'
				disableElevation
				sx={{
					width: '20%',
					display: 'flex',
					justifyContent: 'space-between'
				}}
			>
				<Button type='button' onClick={handleReset}>
					Cancel
				</Button>
				<Button type='submit' color='success'>
					Update
				</Button>
			</ButtonGroup>
		</Paper>
	) : (
		// Written/Updated review
		<Paper sx={{padding: '1rem', display: 'flex', border: '1px solid black'}}>
			<Box sx={{flex: 5}}>
				<Typography variant='h4'>{review.userName}</Typography>
				<Rating value={review.userRating} readOnly />
				<Typography variant='h5'>
					{`
                        ${months[review.updatedAt.slice(0, 10).split('-')[1]]} 
                        ${review.updatedAt.slice(0, 10).split('-')[2]}, 
                        ${review.updatedAt.slice(0, 10).split('-')[0]}
                    `}
				</Typography>
				<Typography variant='h5'>{review.userReview}</Typography>
			</Box>
			{user.id === review.userId && (
				<>
					<ButtonGroup
						disableElevation
						variant='contained'
						sx={{
							flex: 1,
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'space-evenly'
						}}
					>
						<Button onClick={() => setEditMode(true)}>Edit</Button>
						<Button onClick={() => setOpenModal(true)} color='error'>
							Delete
						</Button>
					</ButtonGroup>
					<Modal open={openModal} onClose={() => setOpenModal(false)}>
						<Box
							sx={{
								width: {
									xs: '100%',
									sm: '75%',
									md: '50%',
									lg: '35%',
									xl: '25%'
								},
								height: '20vh',
								padding: '1rem',
								position: 'absolute',
								top: '50%',
								left: '50%',
								transform: 'translate(-50%, -50%)',
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'space-between',
								background: 'white',
								border: '2px solid #000'
							}}
						>
							<Typography variant='h6' component='h2'>
								Are you sure you want to delete your post?
							</Typography>
							<ButtonGroup
								variant='contained'
								disableElevation
								sx={{
									width: '100%',
									display: 'flex',
									justifyContent: 'space-between'
								}}
							>
								<Button type='button' color='error' onClick={handleDelete}>
									Yes, delete it
								</Button>
								<Button type='button' onClick={() => setOpenModal(false)}>
									No, keep it
								</Button>
							</ButtonGroup>
						</Box>
					</Modal>
				</>
			)}
		</Paper>
	);
}

export default Review;