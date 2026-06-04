import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import styles from './home.module.css';
import Dashboard from '@/components/Dashboard/Dashboard';

class Report extends React.Component{
    render(){
        return(
            <div className={styles.mainPage}>
                <Navbar />
                <Dashboard />
            </div>
        );
    }
}

export default Report;