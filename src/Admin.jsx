import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
	signOut,
	onAuthStateChanged,
	sendEmailVerification,
} from 'firebase/auth';
import { auth, db } from './firebase';
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDocs,
	query,
	where,
	updateDoc,
} from 'firebase/firestore';
import './css/admin.css';
import Navbar from './Navbar';
import Loading from './img/loading.gif';
import CopyRight from './CopyRight';

const Admin = () => {
	const navigate = useNavigate();
	const [keyValue, setKeyValue] = useState('');
	const [link, setLink] = useState('');
	const [resumeLinks, setResumeLinks] = useState([]);
	const [editingId, setEditingId] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [searchType, setSearchType] = useState('key');
	const formRef = useRef(null);
	const [user, setUser] = useState(null);
	const [isUserAdmin, setIsUserAdmin] = useState(false);
	const [loading, setLoading] = useState(true);
	const [emailVerified, setEmailVerified] = useState(false);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				setUser(user);
				setEmailVerified(user.emailVerified);
				if (user.emailVerified) {
					await fetchResumeLinks(user.email);
				}
				setIsUserAdmin(user.email === import.meta.env.VITE_REACT_APP_EMAIL);
			} else {
				setUser(null);
				setIsUserAdmin(false);
				setResumeLinks([]);
			}
			setLoading(false);
		});

		return () => unsubscribe();
	}, [isUserAdmin]);

	const fetchResumeLinks = async (email) => {
		try {
			let querySnapshot;
			if (isUserAdmin) {
				querySnapshot = await getDocs(collection(db, 'generalLinks'));
			} else {
				const q = query(
					collection(db, 'generalLinks'),
					where('userEmail', '==', email)
				);
				querySnapshot = await getDocs(q);
			}
			const links = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setResumeLinks(links);
		} catch (error) {
			console.error('Error fetching links:', error);
		}
	};

	const isKeyUnique = async (key) => {
		const q = query(collection(db, 'generalLinks'), where('key', '==', key));
		const querySnapshot = await getDocs(q);
		return querySnapshot.empty;
	};

	const handleAddResumeLink = async () => {
		if (!keyValue || !link) {
			alert('Key and Link fields are required.');
			return;
		}

		try {
			const isUnique = await isKeyUnique(keyValue);
			if (!isUnique) {
				alert('Key already exists. Please try another one.');
				return;
			}

			await addDoc(collection(db, 'generalLinks'), {
				key: keyValue,
				link,
				userEmail: user.email,
				userEmailName: user.displayName,
			});

			setKeyValue('');
			setLink('');
			alert('Link is Added');
			await fetchResumeLinks(user.email);
		} catch (error) {
			console.error('Error adding link:', error);
		}
	};

	const handleEdit = (id, key, link) => {
		setEditingId(id);
		setKeyValue(key);
		setLink(link);
		formRef.current.scrollIntoView({ behavior: 'smooth' });
	};

	const handleUpdate = async () => {
		if (!keyValue || !link) {
			alert('Key and Link fields are required.');
			return;
		}

		try {
			const isUnique = await isKeyUnique(keyValue);
			if (!isUnique && editingId !== null) {
				const existingLink = resumeLinks.find((link) => link.id === editingId);
				if (existingLink && existingLink.key !== keyValue) {
					alert('Key already exists. Please try another one.');
					return;
				}
			}

			await updateDoc(doc(db, 'generalLinks', editingId), {
				key: keyValue,
				link,
			});
			setEditingId(null);
			setKeyValue('');
			setLink('');
			await fetchResumeLinks(user.email);
		} catch (error) {
			console.error('Error updating link:', error);
		}
	};

	const handleDelete = async (id) => {
		const confirmDelete = window.confirm(
			'Are you sure you want to delete this entry?'
		);
		if (confirmDelete) {
			try {
				await deleteDoc(doc(db, 'generalLinks', id));
				await fetchResumeLinks(user.email);
				if (id === editingId) {
					setEditingId(null);
					setKeyValue('');
					setLink('');
				}
			} catch (error) {
				console.error('Error deleting link:', error);
			}
		}
	};

	const handleLogout = async () => {
		try {
			await signOut(auth);
			setUser(null);
		} catch (error) {
			console.error('Error during logout:', error);
		}
	};

	const handleSearch = () => {
		const filteredLinks = resumeLinks.filter((link) => {
			switch (searchType) {
				case 'key':
					return link.key.toLowerCase().includes(searchTerm.toLowerCase());
				case 'link':
					return link.link.toLowerCase().includes(searchTerm.toLowerCase());
				case 'emailId':
					return isUserAdmin
						? link.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
						: false;
				case 'emailName':
					return isUserAdmin
						? link.userEmailName
								.toLowerCase()
								.includes(searchTerm.toLowerCase())
						: false;
				default:
					return false;
			}
		});
		setResumeLinks(filteredLinks);
	};

	const handleClearSearch = () => {
		setSearchTerm('');
		fetchResumeLinks(user.email);
	};

	const handleSendVerificationEmail = async () => {
		try {
			await sendEmailVerification(user);
			alert('Verification email sent.');
		} catch (error) {
			console.error('Error sending verification email:', error);
			alert('Failed to send verification email.');
		}
	};

	return (
		<div>
			<Navbar />
			{loading ? (
				<div className='loadingGif'>
					<img src={Loading} alt='Loading...' />
				</div>
			) : user ? (
				emailVerified ? (
					<>
						<button className='logOutBut' onClick={handleLogout}>
							Logout
						</button>
						<form
							className='resumeFormMain'
							onSubmit={(e) => e.preventDefault()}
							ref={formRef}
						>
							<label>Key:</label>
							<label className='keyDesc'>
								viewlink.web.app/ <strong>key</strong>
							</label>
							<input
								placeholder='Enter your key'
								type='text'
								value={keyValue}
								onChange={(e) => setKeyValue(e.target.value)}
							/>

							<label>Link:</label>
							<input
								placeholder='Enter your Link'
								type='text'
								value={link}
								onChange={(e) => setLink(e.target.value)}
							/>

							{editingId ? (
								<button type='button' onClick={handleUpdate}>
									Update
								</button>
							) : (
								<button type='button' onClick={handleAddResumeLink}>
									Add
								</button>
							)}
						</form>

						<form
							className='resumeFormMain'
							onSubmit={(e) => e.preventDefault()}
						>
							<label>Search by</label>
							<select
								value={searchType}
								onChange={(e) => setSearchType(e.target.value)}
							>
								<option value='key'>Key</option>
								<option value='link'>Link</option>
								{isUserAdmin && (
									<>
										<option value='emailId'>Email ID</option>
										<option value='emailName'>Email Name</option>
									</>
								)}
							</select>
							<input
								type='text'
								placeholder='Type Here'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
							<button type='button' onClick={handleSearch}>
								Search
							</button>
							<button type='button' onClick={handleClearSearch}>
								Clear Search
							</button>
						</form>

						<div className='resume-links-container'>
							{resumeLinks.map((link) => (
								<div key={link.id} className='resume-link'>
									<div>
										<strong>Key:</strong> {link.key}
									</div>
									<div className='linkTextOp'>
										<strong>Link:</strong> {link.link}
									</div>
									{isUserAdmin && (
										<>
											<div>
												<strong>Email ID:</strong> {link.userEmail}
											</div>
											<div>
												<strong>Email Name:</strong> {link.userEmailName}
											</div>
										</>
									)}
									<div className='actions'>
										<button
											onClick={() => handleEdit(link.id, link.key, link.link)}
										>
											Edit
										</button>
										<button
											className='deleteBut'
											onClick={() => handleDelete(link.id)}
										>
											Delete
										</button>
									</div>
								</div>
							))}
						</div>
					</>
				) : (
					<>
						<button className='logOutBut' onClick={handleLogout}>
							Logout
						</button>
						<div className='linkNotFoundCon emailNotVer'>
							<p className='linkNotFound'>Email Not Verified</p>
						</div>
						<div className='signInCon'>
							<button
								className='auth-button signInWithGoogle'
								onClick={handleSendVerificationEmail}
							>
								Send Verification Email
							</button>
						</div>
						<div className='copyDown'>
							<div className='aboutMeContainer'>
								Design And Coded By
								<p>
									<a
										href='https://www.linkedin.com/in/mr-sasikumar-k/'
										target='_blank'
									>
										SASIKUMAR K
									</a>
								</p>
							</div>
						</div>
					</>
				)
			) : (
				<>
					<div className='auth-container'>
						<Link to='/sign' className='LinkTag'>
							<div className='signInCon'>
								<button className='auth-button signInWithGoogle'>
									Create Account or Sign Up
								</button>
							</div>
						</Link>
					</div>
					<div className='copyDown'>
						<div className='aboutMeContainer'>
							Design And Coded By
							<p>
								<a
									href='https://www.linkedin.com/in/mr-sasikumar-k/'
									target='_blank'
								>
									SASIKUMAR K
								</a>
							</p>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default Admin;
