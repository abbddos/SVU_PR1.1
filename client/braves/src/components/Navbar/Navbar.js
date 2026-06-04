import React from 'react';
import styles from './Navbar.module.css';
import Link from 'next/link';

class Navbar extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            user: null
        };
    }

    componentDidMount() {
        console.log('🔄 Navbar mounting...');
        
        const userData = localStorage.getItem('user');
        console.log('📦 Raw userData from localStorage:', userData);
        
        if (userData) {
            try {
            const user = JSON.parse(userData);
            this.setState({ user });
            } catch (error) {
            console.error('❌ JSON parse error:', error);
            }
        } else {
            console.log('❌ No user data found in localStorage');
        }
    }

    handleLogout = () => {
        // Clear all authentication data
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token'); 
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/login';
    }

    render() {
    const { user } = this.state;

        return (
        <nav className={styles.navbar}>
            <div className={styles.navLeft}>
                <img className = {styles.sarcLogo}src = "/images/sarc-logo.jpg" />
                <h2 className={styles.logo}>BRAV<span className = {styles.rede}>e</span>S</h2>
                <div className={styles.navLinks}>
                    <Link href='/home' className = {styles.navLink}>Home</Link>
                </div>
            </div>
            <div className={styles.navRight}>
            <Link href="/profile" className={styles.profileLink}>
                <div className={styles.profileIcon}>
                {user && user.profile_pic ? (
                    <img 
                    src={`${process.env.NEXT_PUBLIC_API_URL}${user.profile_pic}`}
                    alt="Profile"
                    className={styles.profileImage}
                    />
                ) : (
                    '👤'
                )}
                </div>
            </Link>
            <button onClick={this.handleLogout} className={styles.logoutButton}>
                Logout
            </button>
            </div>
        </nav>
        );
    }
}

export default Navbar;