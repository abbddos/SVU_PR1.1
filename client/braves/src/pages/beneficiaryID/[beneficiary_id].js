import { withRouter } from 'next/router';
import React from 'react';
import styles from './BeneficiariesDetailPage.module.css';
import Navbar from '@/components/Navbar/Navbar';
import { QRCodeSVG } from 'qrcode.react';

class BeneficiaryDetailPage extends React.Component {

  static async getInitialProps({ query }) {
    // This runs on both client and server
    return { beneficiaryId: query.beneficiary_id };
  }

  constructor(props) {
    super(props);
    this.state = {
      beneficiary: null,
      loading: true, 
      error: ''
    };
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
          'Authorization':`Bearer ${token}`
        }
      });
      const data = await response.json();
      this.setState({ beneficiary: data, loading: false });
    } catch (error) {
      console.error('Error:', error);
      this.setState({ loading: false });
    }
  }

  QRCodeData = () =>{
    const {beneficiary} = this.state;
    if(!beneficiary) return '';

    const data = {
      id: beneficiary.id,
    }

    return JSON.stringify(data);
  }


  
  handlePrint = () => {
  // Simply call window.print() - CSS handles the rest
  window.print();
};

  render() {
    const { beneficiary, loading } = this.state;
    
    if (loading) return <div>Loading...</div>;
    if (!beneficiary) return <div>Beneficiary not found</div>;

    return (
      <div className={styles.container}>
      <div className={styles.noPrint}>
        <Navbar />
      </div>
      <div className={styles.page}>
        <div className={styles.card} id="card">
          <div className={styles.ribbon}></div>
          
          <div className={styles.cardContent}>
            {/* LEFT COLUMN - Photo and QR Code */}
            <div className={styles.leftColumn}>
              {beneficiary.beneficiary_pic ? (
                    // Show actual image - handle both File objects and file paths
                    <img 
                        src={`http://localhost:5000${beneficiary.beneficiary_pic}`} 
                        alt="Profile" 
                        className={styles.benPic}
                    />
                    ) : (
                    // Show placeholder when no image
                    <img src="/images/default_pic.jpg" className={styles.benPic} />
                    )}
              <div className={styles.qrPlaceholder}>
                <QRCodeSVG
                  value={this.QRCodeData()}
                  size={150}
                  level="H"
                  renderAs="svg"
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>
            </div>
            
            {/* RIGHT COLUMN - Details */}
            <div className={styles.details}>
              <h5 className={styles.bid} id={beneficiary.id}>
                ID: {beneficiary.id}
              </h5>
              
              <h3 className={styles.name}>
                {beneficiary.first_name} {beneficiary.middle_name} {beneficiary.last_name} - {beneficiary.mother_first_name}
              </h3>
              <h4 className={styles.bid}>
                ID#: {beneficiary.id}
              </h4>
              
              <table className={styles.benInfo}>
                <tbody>
                  <tr>
                    <td>Date of Birth:</td>
                    <td>{beneficiary.date_of_birth || 'N/A'}</td>
                    <td>Place of Birth:</td>
                    <td>{beneficiary.place_of_birth || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Sex:</td>
                    <td>{beneficiary.sex || 'N/A'}</td>
                    <td>Household Size:</td>
                    <td>{beneficiary.household_size || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Displacement Status:</td>
                    <td>{beneficiary.displacement_status || 'N/A'}</td>
                    <td>Contact:</td>
                    <td>{beneficiary.contact_number || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
              
              <div className={styles.socialIcons}>
                <a href="#"><i className="fa fa-dribbble"></i></a>
                <a href="#"><i className="fa fa-twitter"></i></a>
                <a href="#"><i className="fa fa-linkedin"></i></a>
                <a href="#"><i className="fa fa-facebook"></i></a>
              </div>
            </div>
          </div>
          <p>
                <div className={styles.bottomRibbon}>
                  <img src="/images/sarc-logo.jpg" className={styles.sarcIcon} alt="SARC" />
                  <small className={styles.sarcContact}>
                    TEL: XXX-XXXXXXX | YYY-YYYYYYY
                  </small>
                </div>
              </p>
        </div>
      </div>
      <div className={styles.tail}>
        <button onClick={this.handlePrint} className={styles.printButton}>
            Print
          </button>
          <button onClick={() => this.props.router.back()} className={styles.backButton}>
            ← Back
          </button>
        </div>
      </div>
    );
  }
}



export default withRouter(BeneficiaryDetailPage);