import React from 'react';
import styles from './beneficiaries.module.css';
import Navbar from '../components/Navbar/Navbar';
import Link from 'next/link';

class Beneficiaries extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            beneficiaries: [],
            loading: false,
            page: 1,
            hasMore: true,
            searchQuery: '',
            searchResults: [],

            isEditing: false,
            editingBeneficiaryId: null,
            formError: '',
            formLoading: false,

            first_name :'',
            middle_name :'',
            last_name :'',
            date_of_birth : null,
            place_of_birth :'',
            sex:'',
            
            //Residency and contact
            contact_number :'',
            current_address :'',
            displacement_status :'',
            
            //Identification(s)
            national_identifier :'',
            other_national_identifier :'',
            national_identifier_number :'',
            beneficiary_pic :'',
            
            //Household Information
            household_size : null,
            disability_in_household :'',
            disability_type :'',
            elders_in_household :'',
            number_of_elders : null,
            infants_in_household :'',
            number_of_infants :null,
            
            //Education/Occupation
            occupation :'',
            education :'',
            
            //Last Updated
            last_updated_by :''

        };
        this.hasLoadedInitial = false;
        this.scrollThrottle = null;
        this.scrollCheckCount = 0;
    }

    componentDidMount() {
    // Always reset and reload when component mounts
    this.setState({
        beneficiaries: [],
        page: 1,
        hasMore: true,
        loading: false
    }, () => {
        this.loadBeneficiaries();
    });
    
    window.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        this.hasLoadedInitial = false;
        window.removeEventListener('scroll', this.handleScroll);
        if (this.scrollThrottle) {
        clearTimeout(this.scrollThrottle);
        }
    }

    handleScroll = () => {
        // Throttle scroll events
        if (this.scrollThrottle) return;
        
        this.scrollThrottle = setTimeout(() => {
        this.scrollCheckCount++;
        
        if (this.state.loading || !this.state.hasMore) {
            this.scrollThrottle = null;
            return;
        }
        
        // Calculate scroll position
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
        
        // Load more when 90% scrolled
        if (scrollPercent > 0.9) {
            console.log('Near bottom - loading more');
            this.loadBeneficiaries();
        }
        
        this.scrollThrottle = null;
        }, 250); // 250ms throttle
    }

    loadBeneficiaries = async () => {
        // Check if we should load
        const isInitialLoad = this.state.page === 1;
        
        if ((isInitialLoad && this.hasLoadedInitial) || 
            this.state.loading || 
            !this.state.hasMore) {
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
        
        if (isInitialLoad) {
        this.hasLoadedInitial = true;
        }
        
        this.setState({ loading: true });
        
        try {
        // Cache busting to prevent duplicate API responses
        const response = await fetch(
            `http://localhost:5000/api/v1/beneficiaries/all?page=${this.state.page}&per_page=20`
        );
        const data = await response.json();
        
        console.log('API response:', {
            beneficiariesCount: data.beneficiaries.length,
            current_page: data.current_page,
            pages: data.pages,
            hasMore: data.current_page < data.pages
        });
        
        const isLastPage = data.current_page >= data.pages;
        
        // Filter out any duplicates (safety check)
        const existingIds = new Set(this.state.beneficiaries.map(b => b.id));
        const newBeneficiaries = data.beneficiaries.filter(b => !existingIds.has(b.id));
        
        this.setState(prevState => ({
            beneficiaries: [...prevState.beneficiaries, ...newBeneficiaries],
            page: prevState.page + 1,
            hasMore: !isLastPage,
            loading: false
        }));
        
        } catch (error) {
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
        const filteredBeneficiaries = this.state.beneficiaries.filter(beneficiary =>
            (beneficiary.first_name && beneficiary.first_name.toLowerCase().includes(query.toLowerCase())) ||
            (beneficiary.middle_name && beneficiary.middle_name.toLowerCase().includes(query.toLowerCase())) ||
            (beneficiary.last_name && beneficiary.last_name.toLowerCase().includes(query.toLowerCase())) ||
            (beneficiary.date_of_birth && beneficiary.date_of_birth.toLowerCase().includes(query.toLowerCase())) ||
            (beneficiary.place_of_birth && String(beneficiary.place_of_birth).toLowerCase().includes(query.toLowerCase())) ||
            (beneficiary.sex && beneficiary.sex.toLowerCase().includes(query.toLowerCase())) ||
            (beneficiary.national_identifier && beneficiary.national_identifier.toLowerCase().includes(query.toLowerCase())) ||
            (beneficiary.national_identifier_number && beneficiary.national_identifier_number.toLowerCase().includes(query.toLowerCase())) ||
            beneficiary.last_updated_by.toLowerCase().includes(query.toLowerCase())
        );
        
        this.setState({
            searchResults: filteredBeneficiaries
        });
        }
    }

    handleEdit = (beneficiary) => {
        // Try to parse
        const DOB = new Date(beneficiary.date_of_birth);

        // Now set state with the manual format
        const formatDate = (date) => {
            if (!date || isNaN(date.getTime())) return '';
            return date.getFullYear() + '-' + 
                String(date.getMonth() + 1).padStart(2, '0') + '-' +
                String(date.getDate()).padStart(2, '0');
        };
        
        this.setState({
            isEditing: true,
            editingBeneficiaryId: beneficiary.id,
            first_name : beneficiary.first_name || '',
            middle_name: beneficiary.middle_name || '',
            last_name : beneficiary.last_name ||'',
            date_of_birth : formatDate(DOB),
            place_of_birth :beneficiary.place_of_birth ||'',
            sex: beneficiary.sex ||'',
            
            //Residency and contact
            contact_number : beneficiary.contact_number ||'',
            current_address: beneficiary.current_address ||'',
            displacement_status: beneficiary.displacement_status ||'',
            
            //Identification(s)
            national_identifier: beneficiary.national_identifier ||'',
            other_national_identifier: beneficiary.other_national_identifier || '',
            national_identifier_number: beneficiary.national_identifier_number ||'',
            beneficiary_pic : beneficiary.beneficiary_pic || '',
            
            //Household Information
            household_size: beneficiary.household_size || null,
            disability_in_household: beneficiary.disability_in_household ||'',
            disability_type: beneficiary.disability_type ||'',
            elders_in_household: beneficiary.elders_in_household ||'',
            number_of_elders: beneficiary.number_of_elders || null,
            infants_in_household: beneficiary.infants_in_household ||'',
            number_of_infants:beneficiary.number_of_infants || null,
            
            //Education/Occupation
            occupation: beneficiary.occupation ||'',
            education: beneficiary.education ||'',
            
            //Last Updated
            last_updated_by: beneficiary.last_updated_by ||'',
        });

        console.log(this.state.beneficiary_pic);
    };

    handleInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

     handleFileChange = (event) =>{
        if(event.target.files && event.target.files[0]){
            this.setState({beneficiary_pic: event.target.files[0]});
        }
    }

    resetForm = () =>{
        this.setState({
            isEditing: false,
            editingBeneficiaryId: null,
            formError: '',
            formLoading: false,

            first_name :'',
            middle_name :'',
            last_name :'',
            date_of_birth : null,
            place_of_birth :'',
            sex:'',
            
            //Residency and contact
            contact_number :'',
            current_address :'',
            displacement_status :'',
            
            //Identification(s)
            national_identifier :'',
            other_national_identifier :'',
            national_identifier_number :'',
            beneficiary_pic :'',
            
            //Household Information
            household_size : null,
            disability_in_household :'',
            disability_type :'',
            elders_in_household :'',
            number_of_elders : null,
            infants_in_household :'',
            number_of_infants :null,
            
            //Education/Occupation
            occupation :'',
            education :'',
            
            //Last Updated
            last_updated_by :''
        });
    }

    handleFormSubmit = async(e) =>{
        e.preventDefault();

        const userDataStr = localStorage.getItem('user');
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const userEmail = userData ? userData.email : '';
        console.log(userEmail);
        this.setState({ 
            formLoading: true, 
            formError: ''
        });

        try{
            let url, method, body;
            const formData = new FormData();

            formData.append('first_name', this.state.first_name);
            formData.append('middle_name',this.state.middle_name);
            formData.append('last_name', this.state.last_name);
            formData.append('date_of_birth', this.state.date_of_birth);
            formData.append('place_of_birth', this.state.place_of_birth);
            formData.append('sex', this.state.sex);
            
            //Residency and contact
            formData.append('contact_number', this.state.contact_number);
            formData.append('current_address', this.state.current_address);
            formData.append('displacement_status', this.state.displacement_status);
            
            //Identification(s)
            formData.append('national_identifier', this.state.national_identifier);
            formData.append('other_national_identifier', this.state.other_national_identifier);
            formData.append('national_identifier_number', this.state.national_identifier_number);
            
            if (this.state.beneficiary_pic){
                formData.append('beneficiary_pic', this.state.beneficiary_pic);
            }
            
            //Household Information
            formData.append('household_size', this.state.household_size);
            formData.append('disability_in_household', this.state.disability_in_household);
            formData.append('disability_type', this.state.disability_type);
            formData.append('elders_in_household', this.state.elders_in_household);
            formData.append('number_of_elders', this.state.number_of_elders);
            formData.append('infants_in_household', this.state.infants_in_household);
            formData.append('number_of_infants', this.state.number_of_infants);
            
            //Education/Occupation
            formData.append('occupation', this.state.occupation);
            formData.append('education', this.state.education);
            
            //Last Updated
            formData.append('last_updated_by', userEmail);

            if (this.state.isEditing){
                url = `http://localhost:5000/api/v1/beneficiaries/${this.state.editingBeneficiaryId}`;
                method = 'PUT';
            }
            else{
                url = 'http://localhost:5000/api/v1/beneficiaries/';
                method = 'POST';
            }
            const response = await fetch(url, {
                method: method,
                body: formData
            });

            const data = await response.json();

            if(response.ok){
                if(this.state.isEditing){
                    alert("Beneficiary updated successfully!");
                    const updatedBeneficiaries = this.state.beneficiaries.map(beneficiary =>
                        beneficiary.id === this.state.editingBeneficiaryId ? { ...beneficiary, ...data } : beneficiary
                    );
                    this.setState({beneficiaries: updatedBeneficiaries});
                }
                else{
                    alert("User created successfully!");
                    this.setState(prevState =>({
                        beneficiaries: [data, ...prevState.beneficiaries]
                    }));
                }

                this.resetForm();
            }

            else{
                this.setState({ 
                formError: data.error || `Failed to ${this.state.isEditing ? 'update' : 'create'} beneficiary`,
                formLoading: false 
                });
            }
        } catch(error){
            this.setState({ 
            formError: 'Network error - cannot reach server',
            formLoading: false 
        });
        }
    }



    deleteBeneficiary= async (beneficiaryId) => {
        try {
        const response = await fetch(`http://localhost:5000/api/v1/beneficiaries/${beneficiaryId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();

        if (response.ok) {
            alert('Service deleted successfully!');
            this.setState(prevState => ({
            beneficiaries: prevState.beneficiaries.filter(beneficiary => beneficiary.id !== beneficiaryId),
            searchResults: prevState.searchResults.filter(beneficiary => beneficiary.id !== beneficiaryId)
            }));
        } else {
            alert(data.error || 'Failed to delete beneficiary');
        }
        } catch (error) {
            alert('Network error - cannot reach server');
        }
    }

    render(){

        const { beneficiaries, loading, hasMore, searchQuery, searchResults } = this.state;
        const displayBeneficiaries = searchQuery ? searchResults : beneficiaries;
        

        return(
            <div className = {styles.container} style={{ minHeight: '150vh' }}>
                <Navbar />
                <h1>Beneficiaries</h1>
                <div className = {styles.beneficiaryForm}>
                    <h2>{this.state.isEditing ? 'Edit Beneficiary' : 'Create New Beneficiary'}</h2>
                    <form onSubmit={this.handleFormSubmit}>
                        <div className = {styles.formSection}>
                            <h3>Biographical Information:</h3>
                            <div className = {styles.formRowd}>
                                <div className={styles.profilePicPreview}>
                                    {this.state.beneficiary_pic ? (
                                    // Show actual image - handle both File objects and file paths
                                    <img 
                                        src={
                                        typeof this.state.beneficiary_pic === 'string' 
                                            ? `http://localhost:5000${this.state.beneficiary_pic}` // Existing image from API
                                            : URL.createObjectURL(this.state.beneficiary_pic) // Newly selected file
                                        } 
                                        alt="Profile" 
                                        className={styles.profileImage}
                                    />
                                    ) : (
                                    // Show placeholder when no image
                                    <img src = "/images/default_pic.jpg" className = {styles.profileImage} />
                                    )}
                                </div>
                            </div>
                            <div className = {styles.formRow}>
                                <input
                                    type="text"
                                    name="first_name"
                                    placeholder="First Name"
                                    value={this.state.first_name}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />

                                <input
                                    type="text"
                                    name="middle_name"
                                    placeholder="Middle Name"
                                    value={this.state.middle_name}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />

                                <input
                                    type="text"
                                    name="last_name"
                                    placeholder="Last Name"
                                    value={this.state.last_name}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />
                            </div>
                            <div className = {styles.formRow}>
                                <select
                                    name="sex"
                                    value={this.state.sex}
                                    onChange={this.handleInputChange}
                                    className={styles.formSelect}
                                    required
                                    >
                                    <option value = "">Select Sex</option>
                                    <option value = "Male">Male</option>
                                    <option value = "Female">Female</option>
                                </select>

                                <input
                                    type="date"
                                    name="date_of_birth"
                                    placeholder="Date of Birth"
                                    value={this.state.date_of_birth}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />

                                <input
                                    type="text"
                                    name="place_of_birth"
                                    placeholder="Place of Birth"
                                    value={this.state.place_of_birth}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />
                            </div>
                             <div className = {styles.formRow}>
                                 <div className={styles.fileUpload}>
                                    <label className={styles.fileLabel}>
                                    Choose Picture
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={this.handleFileChange}
                                        className={styles.fileInput}
                                    />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className = {styles.formSection}>
                            <h3>Identity:</h3>
                            <div className = {styles.formRow}>
                                <select
                                    name="national_identifier"
                                    value={this.state.national_identifier}
                                    onChange={this.handleInputChange}
                                    className={styles.formSelect}
                                    required
                                    >
                                    <option value = "">Select National Identifier</option>
                                    <option value = "National ID">National ID</option>
                                    <option value = "Family Booklet">Family Booklet</option>
                                    <option value = "Passport">Passport</option>
                                    <option value = "Driving License">Driving License</option>
                                    <option value = "Other">Other</option>
                                </select>

                                <input
                                    type="text"
                                    name="other_national_identifier"
                                    placeholder="Other National Identifier"
                                    value={this.state.other_national_identifier}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />

                                <input
                                    type="text"
                                    name="national_identifier_number"
                                    placeholder="National Identifier Number"
                                    value={this.state.national_identifier_number}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />

                            </div>
                        </div>
                        <div className = {styles.formSection}>
                            <h3>Contact - Address and Displacement</h3>
                            <div className = {styles.formRow}>
                                <input
                                    type="text"
                                    name="contact_number"
                                    placeholder="Contact Number"
                                    value={this.state.contact_number}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />

                                <input
                                    type="text"
                                    name="current_address"
                                    placeholder="Current Address"
                                    value={this.state.current_address}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />

                                <select
                                    name="displacement_status"
                                    value={this.state.displacement_status}
                                    onChange={this.handleInputChange}
                                    className={styles.formSelect}
                                    required
                                    >
                                    <option value = "">Select Displacement Status</option>
                                    <option value = "Resident">Resident</option>
                                    <option value = "IDP">IDP</option>
                                    <option value = "Refugee">Refugee</option>
                                    <option value = "Returnee">Returnee </option>
                                    <option value = "Immigrant">Immigrant</option>
                                </select>
                            </div>
                        </div>
                        <div className = {styles.formSection}>
                            <h3>Household Info:</h3>
                            <div className={styles.formRow}>
                                <input
                                    type="text"
                                    name="household_size"
                                    placeholder="Household Size"
                                    value={this.state.household_size}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <select 
                                    name = "disability_in_household"
                                    value = {this.state.disability_in_household}
                                    onChange = {this.handleInputChange}
                                    className = {styles.formSelect}
                                    required
                                    >
                                    <option value = "">Select Disability Status</option>
                                    <option value = "No">No</option>
                                    <option value = "Yes">Yes</option>
                                </select>
                                <select
                                    name="disability_type"
                                    value={this.state.disability_type}
                                    onChange={this.handleInputChange}
                                    className={styles.formSelect}
                                    required
                                    >
                                    <option value = "">Select Disability Type</option>
                                    <option value = "None">None</option>
                                    <option value = "Visual">Visual</option>
                                    <option value = "Hearing - Speaking">Hearing - Speaking</option>
                                    <option value = "Mobility">Mobility </option>
                                    <option value = "Mental">Mental</option>
                                </select>
                            </div>
                            <div className = {styles.formRow}>
                                <select 
                                    name = "elders_in_household"
                                    value = {this.state.elders_in_household}
                                    onChange = {this.handleInputChange}
                                    className = {styles.formSelect}
                                    required
                                    >
                                    <option value = "">Are there elders in the household?</option>
                                    <option value = "No">No</option>
                                    <option value = "Yes">Yes</option>
                                </select>

                                 <input
                                    type="text"
                                    name="number_of_elders"
                                    placeholder="If Yes, how many?"
                                    value={this.state.number_of_elders}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />
                            </div>
                             <div className = {styles.formRow}>
                                <select 
                                    name = "infants_in_household"
                                    value = {this.state.infants_in_household}
                                    onChange = {this.handleInputChange}
                                    className = {styles.formSelect}
                                    required
                                    >
                                    <option value = "">Are there infants in the household?</option>
                                    <option value = "No">No</option>
                                    <option value = "Yes">Yes</option>
                                </select>

                                 <input
                                    type="text"
                                    name="number_of_infants"
                                    placeholder="If Yes, how many?"
                                    value={this.state.number_of_infants}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />
                            </div>
                        </div>
                        <div className = {styles.formSection}>
                            <h3>Occupation - Education</h3>
                            <div className = {styles.formRow}>
                                <input
                                    type="text"
                                    name="occupation"
                                    placeholder="Occupation"
                                    value={this.state.occupation}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />

                                 <select 
                                    name = "education"
                                    value = {this.state.education}
                                    onChange = {this.handleInputChange}
                                    className = {styles.formSelect}
                                    required
                                    >
                                    <option value = "">Select the highest educational level</option>
                                    <option value = "None">None</option>
                                    <option value = "Elementary">Elementary</option>
                                    <option value = "Intermediate">Intermediate</option>
                                    <option value = "Secondary">Secondary</option>
                                    <option value = "University - College">University - College</option>
                                    <option value = "Post Grad (Masters - Phd)">Post Grad (Masters - Phd)</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.formActions}>
                            <button 
                                type="submit" 
                                disabled={this.state.formLoading}
                                className={styles.submitButton}
                            >
                                {this.state.formLoading ? 'Sending...' : 
                                this.state.isEditing ? 'Update Beneficiary' : 'Create Beneficiary'}
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
                    <h2>Beneficiaries ({beneficiaries.length} total)</h2>
                    <div className={styles.searchSection}>
                        <input
                        type="text"
                        placeholder="Search servies by type, location and dates..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={this.handleSearchChange}
                        />
                    </div>
                    <table className = {styles.table}>
                        <thead>
                            <tr>
                                <th>ID:</th>
                                <th>First Name:</th>
                                <th>Middle Name:</th>
                                <th>Last Name:</th>
                                <th>Date of Birth:</th>
                                <th>Place of Birth:</th>
                                <th>Sex:</th>
                                <th>National Identifier:</th>
                                <th>National Identifier Number:</th>
                                <th>Last updated by:</th>
                            <th>Actions:</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayBeneficiaries.map((beneficiary, index) =>(
                                <tr key={`${beneficiary.id}-${index}`}>
                                    <td>{beneficiary.id}</td>
                                    <td>{beneficiary.first_name}</td>
                                    <td>{beneficiary.middle_name}</td>
                                    <td>{beneficiary.last_name}</td>
                                    <td>{beneficiary.date_of_birth}</td>
                                    <td>{beneficiary.place_of_birth}</td>
                                    <td>{beneficiary.sex}</td>
                                    <td>{beneficiary.national_identifier}</td>
                                    <td>{beneficiary.national_identifier_number}</td>
                                    <td>{beneficiary.last_updated_by}</td>
                                    <td>
                                        <button 
                                            className={styles.editButton} 
                                            onClick={() => this.handleEdit(beneficiary)}
                                            >
                                            Edit
                                        </button>
                                        <Link href="#"
                                            className = {styles.idButton}
                                            >
                                                View ID
                                            </Link>
                                        <Link href="#"
                                            className = {styles.historyButton}
                                            >
                                                History
                                            </Link>
                                        <button 
                                            className={styles.deleteButton} 
                                            onClick={() => this.deleteBeneficiary(beneficiary.id)}
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

export default Beneficiaries;