import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import styles from './profile.module.css';
import PersonalInfoForm from '@/components/PersonalInfoForm/PersonalInfoForm';
import ChangePasswordForm from '@/components/ChangePasswordForm/ChangePasswordForm';

class Profile extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            user: null,
            loading: true, 
            error: ''
        };
    }

    componentDidMount(){
        this.fetchUserProfile();
    }


    fetchUserProfile = async () =>{
        try{
            const token = localStorage.getItem('access_token');
            if(!token){
                this.setState({
                    loading: false,
                    error: 'Please log in to view your profile'
                });
                return; 
            }

            const response = await fetch('http://localhost:5000/api/v1/users/profile',{
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if(response.ok){
                this.setState({
                    user: data,
                    loading: false
                });
            } else {
                this.setState({
                    loading: false,
                    error: data.error || 'Failed to load profile'
                });
            }
        } catch(error){
            this.setState({
                error: 'Network error - cannot reach server',
                loading: false 
            });
        }
    }

    render() {

        const { user, loading, error } = this.state;

        if (this.state.loading) {
        return (
            <div className={styles.container}>
            <Navbar />
            <div className={styles.loading}>Loading...</div>
            </div>
        );
        }

        return (
        <div className={styles.container}>
            <Navbar />
            <div className={styles.content}>
                <PersonalInfoForm user = {user}/>
                <ChangePasswordForm />
            </div>
        </div>
        );
    }
}

export default Profile;