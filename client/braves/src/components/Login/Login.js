import React from 'react';
import styles from './Login.module.css';
import Link from 'next/link';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: '',
      loading: false
    };
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    this.setState({ loading: true, error: '' });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.state.email,
          password: this.state.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/home';
      } else {
        this.setState({
          error: data.error || 'Login failed',
          loading: false
        });
      }
    } catch (error) {
      this.setState({
        error: 'Network error - cannot reach server',
        loading: false
      });
      
    }
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  render() {
    return (
    <div className = {styles.loginPage}>
      <div className={styles.frame}>
        {/* Note: In Next.js, use public folder for images */}
        <img 
          src="/images/sarc-logo.jpg" 
          className={styles.sarcLogo} 
          alt="SARC Logo" 
        />
        <div className={styles.titleBox}>
          <h1 className={styles.titleHeader}>B.R.A.V.<span className={styles.redE}>e</span>.S</h1>
          <h3 className={styles.titleMore}>Syrian Arab Red Crescent Beneficiaries Registration And Verification System</h3>
        </div>
        
        {/* Added onSubmit handler */}
        <form onSubmit={this.handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={this.state.email}
              onChange={this.handleChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={this.state.password}
              onChange={this.handleChange}
              required
            />
          </div>
          
          {this.state.error && (
            <div className={styles.error}>{this.state.error}</div>
          )}
          
          <div className={styles.submission}>
            <button 
              type="submit" 
              className={styles.loginButton}
              disabled={this.state.loading}
            >
              {this.state.loading ? 'Signing In...' : 'Sign In'}
            </button>
            <Link href="/ForgotPassword/ForgotPassword" className={styles.forgotPassword}>Forgot Password...</Link>
          </div>
        </form>
      </div>
      </div>
    );
  }
}

export default Login;