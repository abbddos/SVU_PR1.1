import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import ActionForm from '../components/ActionsForm/ActionsForm'; 
import styles from './beneficiaries.module.css';

class actions extends React.Component{
    render(){
        return(
            <div className={styles.container}>
                <Navbar />
                <ActionForm />
            </div>
        );
    }
}

export default actions;
