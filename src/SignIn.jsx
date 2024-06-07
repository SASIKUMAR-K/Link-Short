import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	signInWithPopup,
	GoogleAuthProvider,
	onAuthStateChanged,
	sendPasswordResetEmail,
	fetchSignInMethodsForEmail,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	sendEmailVerification,
} from 'firebase/auth';
import { auth } from './firebase/index';
import './css/signIn.css';
import Navbar from './Navbar';
import CopyRight from './CopyRight';

const provider = new GoogleAuthProvider();

const SignIn = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isForgotPassword, setIsForgotPassword] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [isSignUp, setIsSignUp] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				navigate('/'); // Redirect to the home page or admin page on successful authentication
			}
		});

		return () => unsubscribe();
	}, [navigate]);

	const handleGoogleSignIn = async () => {
		try {
			await signInWithPopup(auth, provider);
			navigate('/'); // Redirect to the home page or admin page on successful authentication
		} catch (error) {
			alert('Something went wrong. Try again later.');
			console.error('Error during sign-in:', error);
		}
	};

	const handleEmailPasswordSignIn = async () => {
		try {
			await signInWithEmailAndPassword(auth, email, password);
			navigate('/'); // Redirect to the home page or admin page on successful authentication
		} catch (error) {
			alert('Failed to sign in. Please check your email and password.');
			console.error('Error during sign-in:', error);
		}
	};

	const handleSignUp = async () => {
		if (password !== confirmPassword) {
			alert('Passwords do not match.');
			return;
		}

		if (!validatePassword(password)) {
			alert(
				'Password must be at least 8 characters long and contain at least one number and one special character.'
			);
			return;
		}

		try {
			const methods = await fetchSignInMethodsForEmail(auth, email);
			if (methods.length > 0) {
				alert('Email already in use. Please use a different email.');
				return;
			}

			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			await sendEmailVerification(userCredential.user);
			alert('Sign up successful! Please check your email for verification.');
		} catch (error) {
			alert('Failed to sign up. Please try again.');
			console.error('Error during sign-up:', error);
		}
	};

	const handleForgotPassword = () => {
		setIsForgotPassword(true);
	};

	const handleResetPassword = async () => {
		if (!email) {
			alert('Please enter your email to reset password.');
			return;
		}

		try {
			const methods = await fetchSignInMethodsForEmail(auth, email);
			if (methods.length === 0) {
				alert('Email not found. Please check and try again.');
				return;
			}

			await sendPasswordResetEmail(auth, email);
			alert('Password reset email sent!');
			setIsForgotPassword(false);
		} catch (error) {
			alert('Error sending password reset email. Please try again.');
			console.error('Error during password reset:', error);
		}
	};

	const handleGoBack = () => {
		setIsForgotPassword(false);
	};

	const validatePassword = (password) => {
		const regex =
			/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
		return regex.test(password);
	};

	return (
		<div>
			<Navbar />
			<form className='resumeFormMain' onSubmit={(e) => e.preventDefault()}>
				<label htmlFor='email'>Email</label>
				<input
					type='email'
					name='email'
					placeholder='Enter your Email'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				{!isForgotPassword && (
					<>
						<label htmlFor='password'>Password</label>
						<input
							type={showPassword ? 'text' : 'password'}
							name='password'
							placeholder='Enter your password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</>
				)}
				{isSignUp && (
					<>
						<label htmlFor='confirmPassword'>Confirm Password</label>
						<input
							type={showPassword ? 'text' : 'password'}
							name='confirmPassword'
							placeholder='Confirm your password'
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
						/>
						<label className='showPassword'>
							<input
								type='checkbox'
								className='showPasswordBox'
								checked={showPassword}
								onChange={() => setShowPassword(!showPassword)}
							/>
							Show Password
						</label>
					</>
				)}
				{!isSignUp && !isForgotPassword && (
					<label className='showPassword'>
						<input
							type='checkbox'
							className='showPasswordBox'
							checked={showPassword}
							onChange={() => setShowPassword(!showPassword)}
						/>
						Show Password
					</label>
				)}
				<button
					type='button'
					onClick={
						isForgotPassword
							? handleResetPassword
							: isSignUp
							? handleSignUp
							: handleEmailPasswordSignIn
					}
				>
					{isForgotPassword
						? 'Reset Password'
						: isSignUp
						? 'Sign Up'
						: 'Sign In'}
				</button>
				{!isForgotPassword && !isSignUp && (
					<>
						<button
							className='forgotPasssignUp'
							type='button'
							onClick={handleForgotPassword}
						>
							Forgot Password ?
						</button>
						<button
							className='forgotPasssignUp'
							type='button'
							onClick={() => setIsSignUp(true)}
						>
							Don't Have an Account ? Sign Up
						</button>
					</>
				)}
				{isForgotPassword && (
					<button type='button' onClick={handleGoBack}>
						Go Back
					</button>
				)}
				{isSignUp && (
					<button
						className='forgotPasssignUp'
						type='button'
						onClick={() => setIsSignUp(false)}
					>
						Already have an account ? Sign in
					</button>
				)}
				<div className='signInCon'>
					<button className='signInWithGoogle' onClick={handleGoogleSignIn}>
						Sign in with Google
					</button>
				</div>
			</form>
			<CopyRight />
		</div>
	);
};

export default SignIn;
