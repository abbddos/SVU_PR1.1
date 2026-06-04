import React from 'react';
import { withRouter } from "next/router";
import Navbar from '@/components/Navbar/Navbar';
import SideNav from '@/components/SideNav/SideNav';
import BeneficiaryForm from '@/components/BeneficiaryForm/BeneficiaryForm';
import styles from '../beneficiaries.module.css';

class EditBeneficiaryPage extends React.Component{
    static async getInitialProps({ query }) {
    // This runs on both client and server
    return { beneficiaryId: query.beneficiary_id };
  }

  constructor(props){
    super(props);
    this.state = {
        beneficiary: null, 
        loading: false,
        error: ''
    }
  }
  

  componentDidMount() {
    const { beneficiary_id } = this.props.router.query;
    if (beneficiary_id) {
      this.fetchBeneficiary(beneficiary_id);
    }
  }

  fetchBeneficiary = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      if(!token){
          this.setState({
            loading: false,
            error: 'Please log in to view your profile'
          });
          return;
      }
      const response = await fetch(`http://localhost:5000/api/v1/beneficiaries/${id}`,{
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      this.setState({ beneficiary: data, loading: false });
    } catch (error) {
      console.error('Error:', error);
      this.setState({ loading: false });
    }
  }

  handleFormSuccess = (updatedBeneficiary) => {
        // Optional: handle after successful update
        console.log('Beneficiary updated:', updatedBeneficiary);
        // Redirect or show success message
    }

  render(){
    return(
        <div className={styles.container}>
            <Navbar />
            <SideNav />
            <BeneficiaryForm 
              isEditing={true}
              beneficiaryData={this.state.beneficiary}
              onSuccess={this.handleFormSuccess}
            />
        </div>
    );
  }

}

export default withRouter(EditBeneficiaryPage);
