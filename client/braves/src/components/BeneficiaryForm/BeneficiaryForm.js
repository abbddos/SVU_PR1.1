import React from 'react';
import { withRouter } from 'next/router';
import styles from './BeneficiaryForm.module.css';

class BeneficiaryForm extends React.Component {
    constructor(props) {
        super(props);

        const isEditing = props.isEditing || false;
        const beneficiaryData = props.beneficiaryData || {};

        // THIS WORKS - using your exact pattern from the service component
        let formattedDate = '';
        if (beneficiaryData.date_of_birth) {
            try {
                const date = new Date(beneficiaryData.date_of_birth);
                if (!isNaN(date.getTime())) {
                    formattedDate = date.getFullYear() + '-' + 
                        String(date.getMonth() + 1).padStart(2, '0') + '-' +
                        String(date.getDate()).padStart(2, '0');
                }
            } catch (e) {
                console.error('Date parsing error:', e);
            }
        }

        this.state = {
            isEditing: isEditing,

            // Biographical Information
            first_name: beneficiaryData.first_name || '',
            middle_name: beneficiaryData.middle_name || '',
            mother_first_name: beneficiaryData.mother_first_name || '',
            last_name: beneficiaryData.last_name || '',
            date_of_birth: formattedDate, // USING YOUR WORKING PATTERN
            place_of_birth: beneficiaryData.place_of_birth || '',
            sex: beneficiaryData.sex || '',

            // Residency and contact
            contact_number: beneficiaryData.contact_number || '',
            current_address: beneficiaryData.current_address || '',
            displacement_status: beneficiaryData.displacement_status || '',

            // Identification(s)
            national_identifier: beneficiaryData.national_identifier || '',
            other_national_identifier: beneficiaryData.other_national_identifier || '',
            national_identifier_number: beneficiaryData.national_identifier_number || '',
            beneficiary_pic: beneficiaryData.beneficiary_pic || '',

            // Household Information - FIXED: Handle 0 values
            household_size: beneficiaryData.household_size !== null && beneficiaryData.household_size !== undefined 
                ? beneficiaryData.household_size.toString() : '',
            disability_in_household: beneficiaryData.disability_in_household || '',
            disability_type: beneficiaryData.disability_type || '',
            elders_in_household: beneficiaryData.elders_in_household || '',
            number_of_elders: beneficiaryData.number_of_elders !== null && beneficiaryData.number_of_elders !== undefined 
                ? beneficiaryData.number_of_elders.toString() : '',
            infants_in_household: beneficiaryData.infants_in_household || '',
            number_of_infants: beneficiaryData.number_of_infants !== null && beneficiaryData.number_of_infants !== undefined 
                ? beneficiaryData.number_of_infants.toString() : '',

            // Education/Occupation
            occupation: beneficiaryData.occupation || '',
            education: beneficiaryData.education || '',

            // Last Updated - will be set on submit
            created_at: beneficiaryData.created_at || null,
            last_update: beneficiaryData.last_update || null,
            last_updated_by: beneficiaryData.last_updated_by || '',

            formError: '',
            formLoading: false,
        };
    }

    // Update state when props change
    componentDidUpdate(prevProps) {
        if (prevProps.isEditing !== this.props.isEditing || 
            prevProps.beneficiaryData !== this.props.beneficiaryData) {

            const beneficiaryData = this.props.beneficiaryData || {};

            // USING YOUR WORKING PATTERN
            let formattedDate = '';
            if (beneficiaryData.date_of_birth) {
                try {
                    const date = new Date(beneficiaryData.date_of_birth);
                    if (!isNaN(date.getTime())) {
                        formattedDate = date.getFullYear() + '-' + 
                            String(date.getMonth() + 1).padStart(2, '0') + '-' +
                            String(date.getDate()).padStart(2, '0');
                    }
                } catch (e) {
                    console.error('Date parsing error:', e);
                }
            }

            this.setState({
                isEditing: this.props.isEditing || false,

                first_name: beneficiaryData.first_name || '',
                middle_name: beneficiaryData.middle_name || '',
                mother_first_name: beneficiaryData.mother_first_name || '',
                last_name: beneficiaryData.last_name || '',
                date_of_birth: formattedDate, // USING YOUR WORKING PATTERN
                place_of_birth: beneficiaryData.place_of_birth || '',
                sex: beneficiaryData.sex || '',

                contact_number: beneficiaryData.contact_number || '',
                current_address: beneficiaryData.current_address || '',
                displacement_status: beneficiaryData.displacement_status || '',

                national_identifier: beneficiaryData.national_identifier || '',
                other_national_identifier: beneficiaryData.other_national_identifier || '',
                national_identifier_number: beneficiaryData.national_identifier_number || '',
                beneficiary_pic: beneficiaryData.beneficiary_pic || '',

                household_size: beneficiaryData.household_size !== null && beneficiaryData.household_size !== undefined 
                    ? beneficiaryData.household_size.toString() : '',
                disability_in_household: beneficiaryData.disability_in_household || '',
                disability_type: beneficiaryData.disability_type || '',
                elders_in_household: beneficiaryData.elders_in_household || '',
                number_of_elders: beneficiaryData.number_of_elders !== null && beneficiaryData.number_of_elders !== undefined 
                    ? beneficiaryData.number_of_elders.toString() : '',
                infants_in_household: beneficiaryData.infants_in_household || '',
                number_of_infants: beneficiaryData.number_of_infants !== null && beneficiaryData.number_of_infants !== undefined 
                    ? beneficiaryData.number_of_infants.toString() : '',

                occupation: beneficiaryData.occupation || '',
                education: beneficiaryData.education || '',

                created_at: beneficiaryData.created_at || null,
                last_update: beneficiaryData.last_update || null,
                last_updated_by: beneficiaryData.last_updated_by || '',
            });
        }
    }

    handleInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            this.setState({ beneficiary_pic: e.target.files[0] });
        }
    }

    resetForm = () => {
        if (this.props.isEditing && this.props.beneficiaryData) {
            const beneficiaryData = this.props.beneficiaryData;

            // USING YOUR WORKING PATTERN
            let formattedDate = '';
            if (beneficiaryData.date_of_birth) {
                try {
                    const date = new Date(beneficiaryData.date_of_birth);
                    if (!isNaN(date.getTime())) {
                        formattedDate = date.getFullYear() + '-' + 
                            String(date.getMonth() + 1).padStart(2, '0') + '-' +
                            String(date.getDate()).padStart(2, '0');
                    }
                } catch (e) {
                    console.error('Date parsing error:', e);
                }
            }

            this.setState({
                first_name: beneficiaryData.first_name || '',
                middle_name: beneficiaryData.middle_name || '',
                mother_first_name : beneficiaryData.mother_first_name || '',
                last_name: beneficiaryData.last_name || '',
                date_of_birth: formattedDate, // USING YOUR WORKING PATTERN
                place_of_birth: beneficiaryData.place_of_birth || '',
                sex: beneficiaryData.sex || '',

                contact_number: beneficiaryData.contact_number || '',
                current_address: beneficiaryData.current_address || '',
                displacement_status: beneficiaryData.displacement_status || '',

                national_identifier: beneficiaryData.national_identifier || '',
                other_national_identifier: beneficiaryData.other_national_identifier || '',
                national_identifier_number: beneficiaryData.national_identifier_number || '',
                beneficiary_pic: beneficiaryData.beneficiary_pic || '',

                household_size: beneficiaryData.household_size !== null && beneficiaryData.household_size !== undefined 
                    ? beneficiaryData.household_size.toString() : '',
                disability_in_household: beneficiaryData.disability_in_household || '',
                disability_type: beneficiaryData.disability_type || '',
                elders_in_household: beneficiaryData.elders_in_household || '',
                number_of_elders: beneficiaryData.number_of_elders !== null && beneficiaryData.number_of_elders !== undefined 
                    ? beneficiaryData.number_of_elders.toString() : '',
                infants_in_household: beneficiaryData.infants_in_household || '',
                number_of_infants: beneficiaryData.number_of_infants !== null && beneficiaryData.number_of_infants !== undefined 
                    ? beneficiaryData.number_of_infants.toString() : '',

                occupation: beneficiaryData.occupation || '',
                education: beneficiaryData.education || '',

                formError: '',
                formLoading: false,
            });
        } else {
            this.setState({
                first_name: '',
                middle_name: '',
                mother_first_name: '',
                last_name: '',
                date_of_birth: '',
                place_of_birth: '',
                sex: '',

                contact_number: '',
                current_address: '',
                displacement_status: '',

                national_identifier: '',
                other_national_identifier: '',
                national_identifier_number: '',
                beneficiary_pic: '',

                household_size: '',
                disability_in_household: '',
                disability_type: '',
                elders_in_household: '',
                number_of_elders: '',
                infants_in_household: '',
                number_of_infants: '',

                occupation: '',
                education: '',

                created_at: '',
                last_update: '',
                last_updated_by: '',

                formError: '',
                formLoading: false,
            });
        }
    }

    handleFormSubmit = async (e) => {
        e.preventDefault();
        const userDataStr = localStorage.getItem('user');
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const userEmail = userData ? userData.email : '';

        

        // USING YOUR WORKING PATTERN for submission
        let formattedDate = '';
        if (this.state.date_of_birth) {
            try {
                const date = new Date(this.state.date_of_birth);
                if (!isNaN(date.getTime())) {
                    formattedDate = date.getFullYear() + '-' + 
                        String(date.getMonth() + 1).padStart(2, '0') + '-' +
                        String(date.getDate()).padStart(2, '0');
                }
            } catch (e) {
                console.error('Date parsing error:', e);
            }
        }

        this.setState({ 
            formLoading: true, 
            formError: ''
        });

        try {
            let url, method;
            const formData = new FormData();

            const token = localStorage.getItem('access_token');
            if(!token){
                this.setState({
                    loading: false,
                    error: 'Please log in to view your profile'
                });
                return;
            }

            if (this.props.isEditing && this.props.beneficiaryData && this.props.beneficiaryData.id) {
                formData.append('id', this.props.beneficiaryData.id);
            }

            formData.append('first_name', this.state.first_name);
            formData.append('middle_name', this.state.middle_name);
            formData.append('mother_first_name', this.state.mother_first_name);
            formData.append('last_name', this.state.last_name);
            formData.append('date_of_birth', formattedDate); // USING YOUR WORKING PATTERN
            formData.append('place_of_birth', this.state.place_of_birth);
            formData.append('sex', this.state.sex);

            formData.append('contact_number', this.state.contact_number);
            formData.append('current_address', this.state.current_address);
            formData.append('displacement_status', this.state.displacement_status);

            formData.append('national_identifier', this.state.national_identifier);
            formData.append('other_national_identifier', this.state.other_national_identifier);
            formData.append('national_identifier_number', this.state.national_identifier_number);

            if (this.state.beneficiary_pic && typeof this.state.beneficiary_pic !== 'string') {
                formData.append('beneficiary_pic', this.state.beneficiary_pic);
            }

            formData.append('household_size', this.state.household_size);
            formData.append('disability_in_household', this.state.disability_in_household);
            formData.append('disability_type', this.state.disability_type);
            formData.append('elders_in_household', this.state.elders_in_household);
            formData.append('number_of_elders', this.state.number_of_elders);
            formData.append('infants_in_household', this.state.infants_in_household);
            formData.append('number_of_infants', this.state.number_of_infants);

            formData.append('occupation', this.state.occupation);
            formData.append('education', this.state.education);
            formData.append('last_updated_by', userEmail);

            if (this.props.isEditing && this.props.beneficiaryData && this.props.beneficiaryData.id) {
                url = `http://localhost:5000/api/v1/beneficiaries/${this.props.beneficiaryData.id}`;
                method = 'PUT';
            } else {
                url = 'http://localhost:5000/api/v1/beneficiaries/';
                method = 'POST';
            }

            const response = await fetch(url, {
                method: method,
                body: formData,
                headers: {
                        'Authorization': `Bearer ${token}`
                    }
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Beneficiary ${this.props.isEditing ? 'Updated' : 'Created'} successfully!`);
                const beneficiaryId = data.id || data.beneficiary?.id || this.props.beneficiaryData?.id;
    
                if (confirm('Would you like to view the ID card of this Beneficiary?')) {
                    this.props.router.push(`/beneficiaryID/${beneficiaryId}`);
                } else{
                    window.location.reload();
                }

                if (this.props.onSuccess) {
                    this.props.onSuccess(data);
                    this.setState({ formLoading: false });
                }


            } else {
                this.setState({
                    formError: data.error || `Failed to ${this.props.isEditing ? 'update' : 'create'} beneficiary`,
                    formLoading: false
                });
            }

            if (!this.props.isEditing) {
                //window.location.reload();
            }
        } catch (error) {
            this.setState({
                formError: 'Network error - cannot reach server',
                formLoading: false
            });
        }
    }

    render() {
        return (
            <div className={styles.container}>
                <div className={styles.beneficiaryForm}>
                    <h2>{this.props.isEditing ? "Edit Beneficiary" : "Create New Beneficiary"}</h2>
                    <form onSubmit={this.handleFormSubmit}>
                        <div className={styles.formSection}>
                            <h3>Biographical Information:</h3>
                            <div className={styles.formRowd}>
                                <div className={styles.profilePicPreview}>
                                    {this.state.beneficiary_pic ? (
                                        <img
                                            src={
                                                typeof this.state.beneficiary_pic === 'string'
                                                    ? `http://localhost:5000${this.state.beneficiary_pic}`
                                                    : URL.createObjectURL(this.state.beneficiary_pic)
                                            }
                                            alt="Profile"
                                            className={styles.profileImage}
                                        />
                                    ) : (
                                        <img src="/images/default_pic.jpg" className={styles.profileImage} />
                                    )}
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.cell}>
                                    <label className={styles.label}>First Name:<span className={styles.required}>*</span> </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    placeholder="First Name"
                                    value={this.state.first_name}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />
                                </div>
                                <div className={styles.cell}>
                                <label className={styles.label}>Middle Name:<span className={styles.required}>*</span></label>
                                <input
                                    type="text"
                                    name="middle_name"
                                    placeholder="Middle Name"
                                    value={this.state.middle_name}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />
                                </div>
                                <div className={styles.cell}>
                                    <label className={styles.label}>Mother's First Name:<span className={styles.required}>*</span> </label>
                                <input
                                    type="text"
                                    name="mother_first_name"
                                    placeholder="Mohter's first name"
                                    value={this.state.mother_first_name}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />
                                </div>
                                <div className={styles.cell}>
                                <label className={styles.label}>Last Name:<span className={styles.required}>*</span></label>
                                <input
                                    type="text"
                                    name="last_name"
                                    placeholder="Last Name"
                                    value={this.state.last_name}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.cell}>
                                <label className={styles.label}>Sex:<span className={styles.required}>*</span></label>
                                <select
                                    name="sex"
                                    value={this.state.sex}
                                    onChange={this.handleInputChange}
                                    className={styles.formSelect}
                                    required
                                >
                                    <option value="">Select Sex</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                                </div>
                                <div className={styles.cell}>
                                <label className={styles.label}>Date of Birth:<span className={styles.required}>*</span></label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    placeholder="Date of Birth"
                                    value={this.state.date_of_birth}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />
                                </div>
                                <div className={styles.cell}>
                                <label className={styles.label}>Place of Birth:<span className={styles.required}>*</span></label>
                                <input
                                    type="text"
                                    name="place_of_birth"
                                    placeholder="Place of Birth"
                                    value={this.state.place_of_birth}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />
                                </div>
                            </div>
                            <div className={styles.formRow}>
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
                        <div className={styles.formSection}>
                            <h3>Identity:</h3>
                            <div className={styles.formRow}>
                                <div className={styles.cell}>
                                <label className={styles.label}>National Identifier:<span className={styles.required}>*</span></label>
                                <small className={styles.hint}>Select the identification documentation available with the beneficiary</small>
                                <select
                                    name="national_identifier"
                                    value={this.state.national_identifier}
                                    onChange={this.handleInputChange}
                                    className={styles.formSelect}
                                    required
                                >
                                    <option value="">Select National Identifier</option>
                                    <option value="National ID">National ID</option>
                                    <option value="Family Booklet">Family Booklet</option>
                                    <option value="Passport">Passport</option>
                                    <option value="Driving License">Driving License</option>
                                    <option value="Other">Other</option>
                                </select>
                                </div>
                                <div className={styles.cell}>
                                <label className={styles.label}>If other please specify:</label>
                                <small className={styles.hint}>.</small>
                                <input
                                    type="text"
                                    name="other_national_identifier"
                                    placeholder="Other National Identifier"
                                    value={this.state.other_national_identifier}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />
                                </div>
                                <div className={styles.cell}>
                                <label className={styles.label}>National Identifier Number:<span classname={styles.required}>*</span></label>
                                <small className={styles.hint}>.</small>
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
                        </div>
                        <div className={styles.formSection}>
                            <h3>Contact - Address and Displacement</h3>
                            <div className={styles.formRow}>
                                <div className={styles.cell}>
                                <label className={styles.label}>Contact Number:</label>
                                <input
                                    type="text"
                                    name="contact_number"
                                    placeholder="Contact Number"
                                    value={this.state.contact_number}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />
                                </div>
                                <div className={styles.cell}>
                                <label className={styles.label}>Current Address:<span className={styles.required}>*</span></label>
                                <input
                                    type="text"
                                    name="current_address"
                                    placeholder="Current Address"
                                    value={this.state.current_address}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />
                                </div>
                                <div className={styles.cell}>
                                <label className={styles.label}>Displacement Status:<span className={styles.required}>*</span></label>
                                <select
                                    name="displacement_status"
                                    value={this.state.displacement_status}
                                    onChange={this.handleInputChange}
                                    className={styles.formSelect}
                                    required
                                >
                                    <option value="">Select Displacement Status</option>
                                    <option value="Resident">Resident</option>
                                    <option value="IDP">IDP</option>
                                    <option value="Refugee">Refugee</option>
                                    <option value="Returnee">Returnee </option>
                                    <option value="Immigrant">Immigrant</option>
                                </select>
                                </div>
                            </div>
                        </div>
                        <div className={styles.formSection}>
                            <h3>Household Info:</h3>
                            <div className={styles.formRow}>
                                <div className={styles.cell}>
                                <label className={styles.label}>Household Size:<span className={styles.required}>*</span></label>
                                <input
                                    type="number"
                                    name="household_size"
                                    placeholder="Household Size"
                                    value={this.state.household_size}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                    min="0"
                                />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.cell}>
                                <label className={styles.label}>Is there any disability in the household?</label>
                                <small className={styles.hint}>.</small>
                                <select
                                    name="disability_in_household"
                                    value={this.state.disability_in_household}
                                    onChange={this.handleInputChange}
                                    className={styles.formSelect}
                                >
                                    <option value="">Select Disability Status</option>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                                </div>
                                <div className={styles.cell}>
                                <label className={styles.label}>If yes, select the disability type:</label>
                                <small className={styles.hint}>If no, select (None).</small>
                                <select
                                    name="disability_type"
                                    value={this.state.disability_type}
                                    onChange={this.handleInputChange}
                                    className={styles.formSelect}
                                    required
                                >
                                    <option value="">Select Disability Type</option>
                                    <option value="None">None</option>
                                    <option value="Visual">Visual</option>
                                    <option value="Hearing - Speaking">Hearing - Speaking</option>
                                    <option value="Mobility">Mobility </option>
                                    <option value="Mental">Mental</option>
                                </select>
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.cell}>
                                <label className={styles.label}>Are there any elders in the household?</label>
                                <small className={styles.hint}>Any individuals aged 65 and older.</small>
                                <select
                                    name="elders_in_household"
                                    value={this.state.elders_in_household}
                                    onChange={this.handleInputChange}
                                    className={styles.formSelect}
                                >
                                    <option value="">Are there elders in the household?</option>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                                </div> 
                                <div className={styles.cell}>
                                <label className={styles.label}>If yes, how many?</label>
                                <small className={styles.hint}>If no, insert(0).</small>
                                <input
                                    type="number"
                                    name="number_of_elders"
                                    value={this.state.number_of_elders}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                    defaultValue="0"
                                />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.cell}>
                                <label className={styles.label}>Are there any infants in the household?</label>
                                <small className={styles.hint}>Any individuals aged 2 and younger</small>
                                <select
                                    name="infants_in_household"
                                    value={this.state.infants_in_household}
                                    onChange={this.handleInputChange}
                                    className={styles.formSelect}
                                >
                                    <option value="">Are there infants in the household?</option>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                                </div>
                                <div className={styles.cell}>
                                <label className={styles.label}>If yes, how many?</label>
                                <small className={styles.hint}>If no, insert (0).</small>
                                <input
                                    type="number"
                                    name="number_of_infants"
                                    value={this.state.number_of_infants}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                    defaultValue="0"
                                />
                                </div>
                            </div>
                        </div>
                        <div className={styles.formSection}>
                            <h3>Occupation - Education</h3>
                            <div className={styles.formRow}>
                                <div calssName={styles.cell}>
                                <label className={styles.label}>Occupation:</label>
                                <input
                                    type="text"
                                    name="occupation"
                                    placeholder="Occupation"
                                    value={this.state.occupation}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />
                                </div>
                                <div className={styles.cell}>
                                <label className={styles.label}>Select the highest level of education:</label>
                                <select
                                    name="education"
                                    value={this.state.education}
                                    onChange={this.handleInputChange}
                                    className={styles.formSelect}
                                    required
                                >
                                    <option value="">Select the highest educational level</option>
                                    <option value="None">None</option>
                                    <option value="Elementary">Elementary</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Secondary">Secondary</option>
                                    <option value="University - College">University - College</option>
                                    <option value="Post Grad (Masters - Phd)">Post Grad (Masters - Phd)</option>
                                </select>
                                </div>
                            </div>
                        </div>
                        <div className={styles.lastUpdated}>  {/* Add this class */}
                            <h3> {this.state.created_at ? `Created at: ${this.state.created_at}` : ''}</h3>
                            <h3>{this.state.last_updated_by ? `Last Updated By: ${this.state.last_updated_by}` : ''}</h3>
                            <h3>{this.state.last_update ? `Last Update: ${this.state.last_update}` : ''}</h3>
                        </div>
                        <div className={styles.formActions}>
                            <button
                                type="submit"
                                disabled={this.state.formLoading}
                                className={styles.submitButton}
                            >
                                {this.state.formLoading ? 'Sending...' :
                                    this.props.isEditing ? 'Update Beneficiary' : 'Create Beneficiary'}
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
            </div>
        );
    }
}

BeneficiaryForm.defaultProps = {
    isEditing: false,
    beneficiaryData: null,
    onSuccess: null
};

export default withRouter(BeneficiaryForm);