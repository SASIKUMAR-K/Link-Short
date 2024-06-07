import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Redirect from './Redirect';
import SignIn from './SignIn';
import Admin from './Admin';
function Connect() {
	return (
		<>
			<Router>
				<Routes>
					<Route path='/' element={<Admin />} />
					<Route path='/sign' element={<SignIn />} />
					<Route path='/:linkUrl' element={<Redirect />} />
				</Routes>
			</Router>
		</>
	);
}

export default Connect;
