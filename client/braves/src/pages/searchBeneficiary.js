import React from 'react';
import styles from './searchBeneficiaries.module.css';
import Navbar from '../components/Navbar/Navbar';
import SideNav from '../components/SideNav/SideNav';
import SearchForm from '../components/SearchForm/SearchForm';

class SearchBeneficiary extends React.Component {
    render(){
        return(
            <div className={styles.container}>
                <Navbar />
                <SideNav />
                <SearchForm />
            </div>
        );
    }
}

export default SearchBeneficiary;