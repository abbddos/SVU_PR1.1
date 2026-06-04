import React from 'react';
import styles from './ChangePasswordForm.module.css';

class ChangePasswordForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            current_password: '',
            new_password: '',
            confirm_new_password: '',
            error: '',
            loading: false
        };
    }

    handleInputChange = (event) =>{
        this.setState({[event.target.name]: event.target.value});
    }

    handleSubmit = async (event) =>{
        event.preventDefault();

        const userDataStr = localStorage.getItem('user');
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const userEmail = userData ? userData.email : '';
        console.log(userEmail);
        this.setState({ 
            formLoading: true, 
            formError: ''
        });

        if(this.state.current_password === this.state.new_password){
            alert("New password cannot be the same as current password!");
            return;
        }

        if (this.state.new_password !== this.state.confirm_new_password) {
            alert("New passwords don't match!");
            return;
        }

        try{
            const token = localStorage.getItem('access_token');
            if(!token){
                this.setState({
                    loading: false,
                    error: 'Please log in to view your profile'
                });
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/change_password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    current_password: this.state.current_password,
                    new_password: this.state.new_password,
                    updated_by: userEmail
                })
            });

            const data  = await response.json();

            if(response.ok){
                alert('Password updated successfully!');
                window.location.reload();
            } else {
                alert(data.error || 'Failed to update password');
            }

        } catch(error){
            alert('Network error - cannot reach server');
        } finally {
            this.setState({ loading: false });
        }
    }

    render() {
        const { currentPassword, newPassword, confirmPassword } = this.state;

        return (
        <div className={styles.formSection}>
            <h2>Change Password</h2>
            
            <form onSubmit={this.handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
                <label>Current Password</label>
                <input
                type="password"
                name="current_password"
                value={this.state.current_password}
                onChange={this.handleInputChange}
                className={styles.input}
                placeholder="Enter your current password"
                required
                />
            </div>

            <div className={styles.formGroup}>
                <label>New Password</label>
                <input
                type="password"
                name="new_password"
                value={this.state.new_password}
                onChange={this.handleInputChange}
                className={styles.input}
                placeholder="Enter new password"
                required
                />
            </div>

            <div className={styles.formGroup}>
                <label>Confirm New Password</label>
                <input
                type="password"
                name="confirm_new_password"
                value={this.state.confirm_new_password}
                onChange={this.handleInputChange}
                className={styles.input}
                placeholder="Confirm your new password"
                required
                />
            </div>

            <button type="submit" className={styles.submitButton}>
                Update Password
            </button>
            </form>
        </div>
        );
    }
}

export default ChangePasswordForm;