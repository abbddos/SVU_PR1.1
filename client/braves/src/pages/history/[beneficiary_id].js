import { withRouter } from "next/router";
import React from 'react';
import Navbar from '@/components/Navbar/Navbar';
import styles from './history.module.css';
import Link from 'next/link';

class BeneficiaryHistory extends React.Component{

    static async getInitialProps({query}){
        return {beneficiaryId: query.beneficiary_id}
    }

    constructor(props){
        super(props);
        this.state = {
            beneficiary: null,
            services: null,
            loading: true,
            error: ''
        };
    }
    

    componentDidMount(){
        const {beneficiary_id} = this.props.router.query;
        if(beneficiary_id){
            this.fetchBeneficiary(beneficiary_id);
            this.fetchServices(beneficiary_id)
        }
    }

    fetchBeneficiary = async (id) =>{
        try{
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
            this.setState({beneficiary: data, loading: false});
        } catch(error){
            console.error('Error:', error);
            this.setState({ loading: false });
        }
    }

    fetchServices = async (id) =>{
        try{
            const token = localStorage.getItem('access_token');
            if(!token){
                this.setState({
                loading: false,
                error: 'Please log in to view your profile'
                });
                return; 
            }
            const response = await fetch(`http://localhost:5000/api/v1/actions/history/${id}`,{
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            this.setState({services: data, loading: false});
        } catch(error){
            console.error('Error:', error);
            this.setState({ loading: false });
        }
    }

    formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    render(){
        const {beneficiary, services, loading} = this.state;

        if (loading) return <div>Loading...</div>;
        if (!beneficiary) return <div>Beneficiary not found</div>;

        return(
        <div className={styles.container}>
            <Navbar />
            
            <div className={styles.content}>
                {/* Beneficiary Information Section */}
                <div className={styles.beneficiarySection}>
                    <div className={styles.beneficiaryCard}>
                        <div className={styles.header}>
                            <h2 className={styles.title}>Beneficiary Information</h2>
                        </div>
                        <div className={styles.beneficiaryMain}>
                            <div className={styles.beneficiaryPhoto}>
                                {beneficiary.beneficiary_pic ? (
                                    <img 
                                        src={`http://localhost:5000${beneficiary.beneficiary_pic}`} 
                                        alt={`${beneficiary.first_name} ${beneficiary.last_name}`}
                                        className={styles.photo}
                                    />
                                ) : (
                                    <div className={styles.photoPlaceholder}>
                                        <span>No Photo</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className={styles.beneficiaryGrid}>
                                <div className={styles.infoGroup}>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>ID:</span> 
                                        <span className = {styles.value}>{beneficiary.id}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Full Name:</span>
                                        <span className={styles.value}>
                                            {beneficiary.first_name} {beneficiary.middle_name} {beneficiary.last_name}
                                        </span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Sex:</span>
                                        <span className={styles.value}>{beneficiary.sex}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Date of Birth:</span>
                                        <span className={styles.value}>{this.formatDate(beneficiary.date_of_birth)}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Place of Birth:</span>
                                        <span className={styles.value}>{beneficiary.place_of_birth}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Mother's Name:</span>
                                        <span className={styles.value}>{beneficiary.mother_first_name}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Contact Number:</span>
                                        <span className={styles.value}>{beneficiary.contact_number}</span>
                                    </div>
                                </div>
                                
                                <div className={styles.infoGroup}>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Current Address:</span>
                                        <span className={styles.value}>{beneficiary.current_address}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Education:</span>
                                        <span className={styles.value}>{beneficiary.education}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Occupation:</span>
                                        <span className={styles.value}>{beneficiary.occupation}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Household Size:</span>
                                        <span className={styles.value}>{beneficiary.household_size}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Infants in Household:</span>
                                        <span className={styles.value}>{beneficiary.infants_in_household} ({beneficiary.number_of_infants})</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Elders in Household:</span>
                                        <span className={styles.value}>{beneficiary.elders_in_household} ({beneficiary.number_of_elders})</span>
                                    </div>
                                </div>
                                
                                <div className={styles.infoGroup}>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Disability in Household:</span>
                                        <span className={styles.value}>{beneficiary.disability_in_household}</span>
                                    </div>
                                    {beneficiary.disability_in_household === 'Yes' && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Disability Type:</span>
                                            <span className={styles.value}>{beneficiary.disability_type}</span>
                                        </div>
                                    )}
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Displacement Status:</span>
                                        <span className={styles.value}>{beneficiary.displacement_status}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>National ID:</span>
                                        <span className={styles.value}>{beneficiary.national_identifier_number}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Last Updated:</span>
                                        <span className={styles.value}>{this.formatDate(beneficiary.last_update)}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Updated By:</span>
                                        <span className={styles.value}>{beneficiary.last_updated_by}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.navigation}>
                            <button onClick={() => this.props.router.back()} className={styles.backButton}>Back to Search</button>
                            <Link href={`/editBeneficiary/${beneficiary.id}`} className={styles.editButton}>Edit</Link>
                            <Link href={`/beneficiaryID/${beneficiary.id}`} className={styles.viewButton}>View ID</Link>
                        </div>
                    </div>
                </div>

                {/* Services Section */}
                <div className={styles.servicesSection}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Services History</h1>
                        <div className={styles.serviceCount}>Total Services: {services?.length || 0}</div>
                    </div>
                    
                    {services && services.length > 0 ? (
                        <div className={styles.tableContainer}>
                            <table className={styles.servicesTable}>
                                <thead>
                                    <tr>
                                        <th>Service ID</th>
                                        <th>Service Type</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Location</th>
                                        <th>Delivery Date:</th>
                                        <th>Updated By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.map(service => (
                                        <tr key={service.service_id}>
                                            <td>{service.service_id}</td>
                                            <td>
                                                <span className={styles.serviceType}>{service.service_type}</span>
                                            </td>
                                            <td>{this.formatDate(service.start_date)}</td>
                                            <td>{this.formatDate(service.end_date)}</td>
                                            <td>
                                                {service.governorate}, {service.district}<br />
                                                <small>{service.village_neighborhood}</small>
                                            </td>
                                            <td>{this.formatDate(service.delivery_date)}</td>
                                            <td>{service.updated_by}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className={styles.noServices}>No services recorded for this beneficiary</div>
                    )}
                </div>
            </div>
        </div>
    );
    }

}

export default withRouter(BeneficiaryHistory);