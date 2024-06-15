import { useParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { useEffect, useState } from 'react';
import LinkAlone from './LinkAlone'; // Assuming Link is a component you created
import Loading from './img/loading.gif';
import './css/redirect.css';
import CopyRight from './CopyRight';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import downArrow from './img/downArrow.png';

const Redirect = () => {
	const { linkUrl } = useParams();
	const [linkItem, setLinkItem] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchLinkItem = async () => {
			try {
				const querySnapshot = await getDocs(collection(db, 'generalLinks'));
				const links = querySnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				const foundLink = links.find((item) => item.key === linkUrl);
				setLinkItem(foundLink);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching link:', error);
				setLoading(false);
			}
		};

		fetchLinkItem();

		// Scroll to the top when the component mounts
		window.scrollTo({ top: 0, behavior: 'smooth' });

		// Clean up any ongoing tasks when the component unmounts
		return () => {
			// Cleanup tasks here
		};
	}, [linkUrl]);

	if (loading) {
		return (
			<>
				<div className='loadingGif'>
					<img src={Loading} alt='Loading...' />
				</div>
				<CopyRight />
			</>
		);
	}

	return (
		<div>
			{linkItem ? (
				<>
					<Navbar />
					<div className='downArrow'>
						<p>Click Here</p>
						<img src={downArrow} alt='Arrow' />
					</div>
					<div className='redirectLinkFou'>
						<div className='redirectLink'>
							<LinkAlone keyName={linkItem.key} link={linkItem.link} />
						</div>
					</div>
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
			) : (
				<>
					<div className='linkNotFoundCon'>
						<p className='linkNotFound'>Link not found</p>
					</div>
					<div className='auth-container'>
						<Link to='/sign' className='LinkTag'>
							<div className='signInCon'>
								<button className='auth-button signInWithGoogle'>
									Create Account or Sign Up
								</button>
							</div>
						</Link>
					</div>
					<CopyRight />
				</>
			)}
		</div>
	);
};

export default Redirect;
