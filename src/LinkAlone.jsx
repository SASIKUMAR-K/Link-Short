import './css/link.css';

const Link = ({ keyName, link }) => {
	return (
		<div className='linkContainer'>
			<a
				className='anchorContainer'
				href={link}
				target='_blank'
				title='Go to The Link'
			>
				<div className='linkName'>linkshort.web.app/{keyName}</div>
				<div className='linkText'>{link}</div>
			</a>
		</div>
	);
};

export default Link;
