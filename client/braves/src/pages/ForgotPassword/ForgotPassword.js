import React from 'react';
import styles from './ForgotPassword.module.css';
import Link from 'next/link';

class ForgotPassword extends React.Component{
  constructor(props) {
    super(props);
    this.state={
      admins: [], 
      error: ''
    }
  }
  
  handleGetAdmins = async () =>{
    try{
      const response = await fetch('http://localhost:5000/api/v1/users/admins', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
          }
      });

      const data = await response.json();

      if(response.ok){
        this.setState({admins: data});
      }
      else{
        this.setState({error: 'error loading administrators'});
      }
    } catch(error){
      this.setState({error: 'Network error - cannot reach server'});
    }
  }

  componentDidMount(){
    this.handleGetAdmins();
  }

  render() {
  const {admins, error} = this.state;
  return (
    <div className={styles.loginPage}>
      <div className={styles.frame}>
        <img 
          src="/images/sarc-logo.jpg" 
          className={styles.sarcLogo} 
          alt="SARC Logo" 
        />
        <div className={styles.listHolder}>
          <p>Please contact your administrator(s) to reset your password.</p>
          <ul>
            {admins.map((admin) => (
              <li key={admin.id}>
                {admin.first_name} {admin.last_name}, {admin.email}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.linkHolder}>
          <Link href="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
}


export default ForgotPassword;