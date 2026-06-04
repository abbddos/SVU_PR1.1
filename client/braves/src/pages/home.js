import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import styles from './home.module.css';
import Link from 'next/link';

class Home extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            userRole: '',
            isClient: false
        };
    }

    componentDidMount() {
        const userDataStr = localStorage.getItem('user');
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const userRole = userData ? userData.role : '';
        this.setState({ userRole, isClient: true });
    }


    render(){
        const { userRole, isClient } = this.state;

        return(
            <div className = {styles.mainPage}>
                <Navbar />
                <div className = {styles.actionPage}>
                    <div className = {styles.allServices}>
                        {(userRole === 'root' || userRole === 'admin') &&(
                        <Link href = "/users">
                            <div className = {styles.partContainer}>
                                <div className = {styles.imageContainer}>
                                    <img className = {styles.partImage} src = "/images/home/sarc-admin.jpeg" />
                                </div>
                                <div className = {styles.captionContainer}>
                                    <h4 className = {styles.captionLabel}>Users</h4>
                                    <div className = {styles.caption}>BRAVeS administraiton for users' creation, editing, activation, deactivation and management of BRAVeS data and access. </div>
                                </div>
                            </div>
                        </Link>
                        )}

                        {(userRole === 'root' || userRole === 'manager') && (
                        <Link href = "/services">
                            <div className = {styles.partContainer}>
                                <div className = {styles.imageContainer}>
                                    <img className = {styles.partImage} src = "/images/home/sarc-services.jpg" />
                                </div>
                                <div className = {styles.captionContainer}>
                                    <h4 className = {styles.captionLabel}>Services</h4>
                                    <div className = {styles.caption}>Create, update and manage SARC services. </div>
                                </div>
                            </div>
                        </Link>
                        )}

                        {(userRole === 'root' || userRole === 'manager' || userRole === 'user') && (
                        <Link href = "/Bens">
                            <div className = {styles.partContainer}>
                                <div className = {styles.imageContainer}>
                                    <img className = {styles.partImage} src = "/images/home/sarc-beneficiaries.webp" />
                                </div>
                                <div className = {styles.captionContainer}>
                                    <h4 className = {styles.captionLabel}>Beneficiaries</h4>
                                    <div className = {styles.caption}>Register, update and manage beneficiaries information and data.</div>
                                </div>
                            </div>
                        </Link>
                        )}

                        {(userRole === 'root' || userRole === 'manager' || userRole === 'user') && (
                        <Link href = "/actions">
                            <div className = {styles.partContainer}>
                                <div className = {styles.imageContainer}>
                                    <img className = {styles.partImage} src = "/images/home/sarc-action.jpg" />
                                </div>
                                <div className = {styles.captionContainer}>
                                    <h4 className = {styles.captionLabel}>Actions</h4>
                                    <div className = {styles.caption}>Connect services to beneficiaries in the field.</div>
                                </div>
                            </div>
                        </Link>
                        )}

                        {(userRole === 'root' || userRole === 'manager') && (
                        <Link href = "/report">
                            <div className = {styles.partContainer}>
                                <div className = {styles.imageContainer}>
                                    <img className = {styles.partImage} src = "/images/home/braves.dashboard.png" />
                                </div>
                                <div className = {styles.captionContainer}>
                                    <h4 className = {styles.captionLabel}>Dashboard</h4>
                                    <div className = {styles.caption}>View BRAVeS live Dashboard </div>
                                </div>
                            </div>
                        </Link>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default Home;