import React from 'react';
import styles from './SideNav.module.css';
import Link from 'next/link';

class SideNav extends React.Component{
render(){
    return(
        <div className = {styles.sideNavMain}>
            <div className = {styles.sideNavLink}>
                <Link href = "/Bens">New Beneficiary</Link>
            </div>
            <div className = {styles.sideNavLink}>
                <Link href = "/searchBeneficiary">Search Beneficiary</Link>
            </div>
        </div>
        );
    }
}

export default SideNav;