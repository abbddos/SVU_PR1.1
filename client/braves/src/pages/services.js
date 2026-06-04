import React from 'react';
import styles from './services.module.css';
import Navbar from '../components/Navbar/Navbar'

class Services extends React.Component{
    
    constructor(props){
        super(props);
        
        const today = new Date().toISOString().split('T')[0];
        
        this.state = {
            services: [],
            loading: false,
            page: 1,
            hasMore: true,
            searchQuery: '',
            searchResults: [],

            isEditing: false,
            editingServiceId: null,

            formError: '',
            formLoading: false,

            service_type:'',
            service_description:'',
            governorate: '',
            district: '',
            sub_district: '',
            village_neighborhood: '',
            start_date: today,
            end_date: today,

            created_at: null,
            updated_by: '',
            last_update: null,

            htmlContent: ''
        };

        this.hasLoadedInitial = false;
        this.scrollThrottle = null;
        this.scrollCheckCount = 0;
    }

    componentDidMount(){
        this.setState({
            services:[],
            page: 1,
            hasmore: true,
            loading: false
        } , ()=> {
            this.loadServices();
        });

        window.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount(){
        this.hasLoadedInitial = false;
        window.removeEventListener('scroll', this.handleScroll);
        if (this.scrollThrottle){
            clearTimeout(this.scrollThrottle);
        }
    }

    handleScroll = () => {
        if(this.scrollThrottle) return;
        this.scrollThrottle = setTimeout(() =>{
            this.scrollCheckCount++;
            if(this.state.loading || !this.state.hasmore){
                this.scrollThrottle = null;
                return;
            }

            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollPercent = (scrollTop + windowHeight) / documentHeight;

            console.log(`Scroll check #${this.scrollCheckCount}:`, {
                scrollTop,
                windowHeight,
                documentHeight,
                scrollPercent,
                nearBottom: scrollPercent > 0.9
            });

            if (scrollPercent > 0.9) {
                console.log('Near bottom - loading more');
                this.loadServices();
            }
            
            this.scrollThrottle = null;
        }, 250);
    }

    loadServices = async ()=>{
        const isInitialLoad = this.state.page === 1;
        if((isInitialLoad && this.hasLoadedInitial) ||
            this.state.loading ||
            !this.state.hasMore){
                console.log('Skipping load:', {
                    isInitialLoad,
                    hasLoadedInitial: this.hasLoadedInitial,
                    loading: this.state.loading,
                    hasMore: this.state.hasMore,
                    page: this.state.page
                });
                return;
            }

            console.log(`Loading page ${this.state.page}`);

            if(isInitialLoad){
                this.hasLoadedInitial = true;
            }

            this.setState({loading: true});

            try{

                const token = localStorage.getItem('access_token');
                if(!token){
                    this.setState({
                        loading: false,
                        error: 'Please log in to view your profile'
                    });
                    return;
                }
                const response = await fetch(`http://localhost:5000/api/v1/services/all?page=${this.state.page}&per_page=20`,{
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                const isLastPage = data.current_page >= data.pages;
                const existingIds = new Set(this.state.services.map(s => s.id));
                const newServices = data.services.filter(s => !existingIds.has(s.id));

                this.setState(prevState => ({
                    services: [...prevState.services, ...newServices],
                    page: prevState.page + 1,
                    hasMore: !isLastPage,
                    loading: false
                }));
            } catch(error){
                console.error('Load error:', error);
                this.setState({ loading: false });
                if (this.state.page === 1) {
                    this.hasLoadedInitial = false; // Reset flag if initial load fails
                }
            }
    }

    handleSearchChange = (e) => {
        const query = e.target.value;
        this.setState({ searchQuery: query });
        
        if (query.trim() === '') {
        this.setState({ searchResults: [] });
        } else {
            const filteredServices = this.state.services.filter(service =>
                (service.id.toString().toLowerCase().includes(query.toLowerCase())) ||
                (service.service_type.toLowerCase().includes(query.toLowerCase())) ||
                (service.governorate && service.governorate.toLowerCase().includes(query.toLowerCase())) ||
                (service.district && service.district.toLowerCase().includes(query.toLowerCase())) ||
                (service.sub_district && service.sub_district.toLowerCase().includes(query.toLowerCase())) ||
                (service.village_neighborhood && service.village_neighborhood.toLowerCase().includes(query.toLowerCase())) ||
                (service.start_date && service.start_date.toLowerCase().includes(query.toLowerCase())) ||
                (service.end_date && service.end_date.toLowerCase().includes(query.toLowerCase())) 
        );
        
            this.setState({
                searchResults: filteredServices
            });
        }
    }

    

    handleEdit = (service) => {
        // Try to parse
        const startDate = new Date(service.start_date);
        const endDate = new Date(service.end_date);

        // Now set state with the manual format
        const formatDate = (date) => {
            if (!date || isNaN(date.getTime())) return '';
            return date.getFullYear() + '-' + 
                String(date.getMonth() + 1).padStart(2, '0') + '-' +
                String(date.getDate()).padStart(2, '0');
        };
        
        this.setState({
            service_type: service.service_type || '',
            service_description: service.service_description || '',
            governorate: service.governorate || '',
            district: service.district || '',
            sub_district: service.sub_district || '',
            village_neighborhood: service.village_neighborhood || '',
            start_date: formatDate(startDate),
            end_date: formatDate(endDate),
            created_at: service.created_at,
            last_update : service.last_update,
            updated_by: service.updated_by,
            isEditing: true,
            editingServiceId: service.id,

        });
    };

    handleInputChange = (e) => {
       this.setState({ [e.target.name]: e.target.value });
    }

    handleDescriptionChange = (e) => {
        this.setState({ service_description: e.target.value });
    };

    handleRichTextChange = (e) => {
        // Get the HTML content
        const html = e.target.innerHTML;
        this.setState({ htmlContent: html });
    };

    handleFormSubmit = async (e) => {
        e.preventDefault();
        const userDataStr = localStorage.getItem('user');
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const userEmail = userData ? userData.email : '';
        console.log(userEmail);
        this.setState({ 
            formLoading: true, 
            formError: ''
        });

        
        try {
        let url, method, body;
        const token = localStorage.getItem('access_token');
        if(!token){
            this.setState({
                loading: false,
                error: 'Please log in to view your profile'
            });
            return;
        }
        
        if (this.state.isEditing) {
            url = `http://localhost:5000/api/v1/services/${this.state.editingServiceId}`;
            method = 'PUT';
        } else {
            url = 'http://localhost:5000/api/v1/services/';
            method = 'POST';
        }
        
        body = JSON.stringify({
            service_type: this.state.service_type,
            service_description: this.state.service_description,
            governorate: this.state.governorate,
            district: this.state.district,
            sub_district: this.state.sub_district,
            village_neighborhood: this.state.village_neighborhood,
            start_date: this.state.start_date,
            end_date: this.state.end_date,
            updated_by: userEmail,
        });
        
        const response = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
             },
            body: body
        });
        
        const data = await response.json();
        
        if (response.ok) {
            if (this.state.isEditing) {
            alert("Service updated successfully!");
            const updatedServices = this.state.services.map(service =>
                service.id === this.state.editingServiceId ? { ...service, ...data } : service
            );
            this.setState({ services: updatedServices });
            } else {
            alert(`Service created successfully!`);
            this.setState(prevState => ({
                services: [data, ...prevState.services]
            }));
            }
            
            this.resetForm();
        } else {
            this.setState({ 
            formError: data.error || `Failed to ${this.state.isEditing ? 'update' : 'create'} service`,
            formLoading: false 
            });
        }
        } catch (error) {
            this.setState({ 
                formError: 'Network error - cannot reach server',
                formLoading: false 
            });
        }
    }

    resetForm = () => {
        const today = new Date().toISOString().split('T')[0]; 

        this.setState({
        isEditing: false,
        editingServiceId: null,
        service_type: '',
        service_description: '',
        governorate: '',
        district: '',
        sub_district: '',
        village_neighborhood: '',
        start_date: today,  // Use the local variable
        end_date: today,
        created_at: null,
        last_update: null,
        updated_by: '',
        formError: '',
        formLoading: false
        });
    }

    deleteService = async (serviceId) => {
        try {
        const token = localStorage.getItem('access_token');
        if(!token){
            this.setState({
                loading: false,
                error: 'Please log in to view your profile'
            });
            return;
        }
        const response = await fetch(`http://localhost:5000/api/v1/services/${serviceId}`, {
            method: "DELETE",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
             }
        });

        const data = await response.json();

        if (response.ok) {
            alert('Service deleted successfully!');
            this.setState(prevState => ({
            services: prevState.services.filter(service => service.id !== serviceId),
            searchResults: prevState.searchResults.filter(service => service.id !== serviceId)
            }));
        } else {
            alert(data.error || 'Failed to delete service');
        }
        } catch (error) {
            alert('Network error - cannot reach server');
        }
    }

    render(){
        const { services, loading, hasMore, searchQuery, searchResults } = this.state;
        const displayServices = searchQuery ? searchResults : services;

        
        return(
            <div className = {styles.container}style={{ minHeight: '150vh' }}>
                <Navbar />
                <h1>Services</h1>

                <div className = {styles.serviceForm}>
                    <h2>{this.state.isEditing ? 'Edit Service' : 'Create New Service'}</h2>
                    <form onSubmit = {this.handleFormSubmit}>
                        <div className = {styles.formRow}>
                            <div className={styles.cell}>
                            <label className={styles.label}>Service Type:<span className={styles.required}>*</span></label>
                            <select
                                name="service_type"
                                value={this.state.service_type}
                                onChange={this.handleInputChange}
                                className={styles.formSelect}
                                required
                                >
                                <option value="">Select Service Type</option> {/* Add empty option */}
                                <option value="GFA">General Food Assistance</option>
                                <option value="SHTR">Shelter</option>
                                <option value="CBT">Cash Based Transfer</option>
                                <option value="NFI">Non Food Items</option>
                                <option value="WASH">WASH</option>
                                <option value="PSS">Psycho-Social Support</option>
                                <option value="LEG">Legal</option>
                                <option value="LH">Livelihoods</option>
                                <option value="CD">Capacity Development</option>
                            </select>
                            </div>
                        </div>
                        <div className = {styles.formRowd}>
                            <div class={styles.cell}>
                            <label className={styles.label}>Description:</label>
                            <small className={styles.hint}>EG. Short description of what the service is, when and where it will be delivered, donor(s)... etc.</small>
                            <textarea
                                onChange={this.handleInputChange} 
                                placeholder="Plain text description"
                                className={styles.Textarea}
                                name="service_description"
                                value = {this.state.service_description}
                            />
                            </div>
                        </div>
                        <div className = {styles.formRow}>
                            <div className={styles.cell}>
                            <label className={styles.label}>Governorate:<span className={styles.required}>*</span></label>
                            <input
                                type="text"
                                name="governorate"
                                placeholder="Governorate"
                                value={this.state.governorate}
                                onChange={this.handleInputChange}
                                className={styles.formInput}
                            />
                            </div> 
                            <div className={styles.cell}>
                            <label className = {styles.label}>District:<span className={styles.required}>*</span></label>
                            <input
                                type="text"
                                name="district"
                                placeholder="District"
                                value={this.state.district}
                                onChange={this.handleInputChange}
                                className={styles.formInput}
                            />
                            </div>
                            <div className={styles.cell}>
                            <label className = {styles.label}>Sub-District:<span className={styles.required}>*</span></label>
                            <input
                                type="text"
                                name="sub_district"
                                placeholder="Sub District"
                                value={this.state.sub_district}
                                onChange={this.handleInputChange}
                                className={styles.formInput}
                            />
                            </div>
                            <div className={styles.cell}>
                            <label className = {styles.label}>Village/Neighborhood:<span className={styles.required}>*</span></label>
                            <input
                                type="text"
                                name="village_neighborhood"
                                placeholder="Village/Neighborhood"
                                value={this.state.village_neighborhood}
                                onChange={this.handleInputChange}
                                className={styles.formInput}
                            />
                            </div>
                        </div>
                        <div className = {styles.formRow}>
                            <div className={styles.cell}>
                            <label className = {styles.label}>Start Date:<span className={styles.required}>*</span></label>
                            <input
                                type="date"
                                name="start_date"
                                placeholder="Start Date"
                                value={this.state.start_date}
                                onChange={this.handleInputChange}
                                className={styles.formInput}
                            />
                            </div><div className={styles.cell}>
                            <label className = {styles.label}>End Date:<span className={styles.required}>*</span></label>
                            <input
                                type="date"
                                name="end_date"
                                placeholder="End Date"
                                value={this.state.end_date}
                                onChange={this.handleInputChange}
                                className={styles.formInput}
                            />
                            </div>
                        </div>
                        <div className={styles.lastUpdated}>  {/* Add this class */}
                            <h3>{this.state.created_at ? `Created at: ${this.state.created_at}` : ''}</h3>
                            <h3>{this.state.updated_by ? `Last Updated By: ${this.state.updated_by}` : ''}</h3>
                            <h3>{this.state.last_update ? `Last Update: ${this.state.last_update}` : ''}</h3>
                        </div>
                        <div className={styles.formActions}>
                            <button 
                                type="submit" 
                                disabled={this.state.formLoading}
                                className={styles.submitButton}
                            >
                                {this.state.formLoading ? 'Sending...' : 
                                this.state.isEditing ? 'Update Service' : 'Create Service'}
                            </button>
            
                            <button 
                                type="button" 
                                onClick={this.resetForm}
                                className={styles.cancelButton}
                                >
                                Clear
                            </button>
                        
                        </div>
                            
                            {this.state.formError && (
                            <div className={styles.errorMessage}>
                                {this.state.formError}
                            </div>
                            )}
                    </form>
                </div>

                <div className = {styles.resultsTable}>
                    <h2>Services ({services.length} total)</h2>
                    <div className={styles.searchSection}>
                        <input
                        type="text"
                        placeholder="Search servies by type, location and dates..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={this.handleSearchChange}
                        />
                    </div>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>ID:</th>
                            <th>Service Type</th>
                            <th>Governorate:</th>
                            <th>District:</th>
                            <th>Sub-District:</th>
                            <th>Village-Neighborhood:</th>
                            <th>Start Date:</th>
                            <th>End Date:</th>
                            <th>Last Updated By:</th>
                            <th>Actions:</th>
                        </tr>
                        </thead>
                        <tbody>
                            {displayServices.map((service, index) =>(
                                <tr key = {`${service.id}-${index}`}>
                                    <td>{service.id}</td>
                                    <td>{service.service_type}</td>
                                    <td>{service.governorate}</td>
                                    <td>{service.district}</td>
                                    <td>{service.sub_district}</td>
                                    <td>{service.village_neighborhood}</td>
                                    <td>{service.start_date}</td>
                                    <td>{service.end_date}</td>
                                    <td>{service.updated_by}</td>
                                    <td>
                                        <button 
                                            className={styles.editButton} 
                                            onClick={() => this.handleEdit(service)}
                                            >
                                            Edit
                                        </button>
                                        <button 
                                            className={styles.deleteButton} 
                                            onClick={() => this.deleteService(service.id)}
                                            >
                                            Delete
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default Services;