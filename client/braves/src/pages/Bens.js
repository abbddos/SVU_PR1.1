import React from 'react';
import styles from './beneficiaries.module.css';
import Navbar from '../components/Navbar/Navbar';
import SideNav from '../components/SideNav/SideNav';
import BeneficiaryForm from '../components/BeneficiaryForm/BeneficiaryForm';
import Link from 'next/link';

class Bens extends React.Component{
    render(){
        return(
            <div className={styles.container}>
                <Navbar />
                <SideNav />
                <BeneficiaryForm />

            </div>
        );
    }
}

export default Bens;