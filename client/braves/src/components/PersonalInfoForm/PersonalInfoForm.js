import React from 'react';
import styles from './PersonalInfoForm.module.css';

class PersonalInfoForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            id: null,
            first_name: '',
            last_name: '',
            job_title: '',
            profile_pic: null,
            loading: false

        };
    }

    componentDidMount() {
        this.populateForm();
    }

    componentDidUpdate(prevProps) {
        // If user props changed, update the form
        if (prevProps.user !== this.props.user) {
            this.populateForm();
        }
    }

    populateForm = () => {
        if (this.props.user) {
            console.log('🔄 Populating form with user:', this.props.user);
            this.setState({
                id: this.props.user.id || null,
                first_name: this.props.user.first_name || '',
                last_name: this.props.user.last_name || '',
                job_title: this.props.user.job_title || '',
                profile_pic: this.props.user.profile_pic || null
            });
        }
    }

    handleInputChange = (event) =>{
        this.setState({ [event.target.name] : event.target.value});
    }

    
    handleFileChange = (event) =>{
        if(event.target.files && event.target.files[0]){
            this.setState({profile_pic: event.target.files[0]});
        }
    }


    handleSubmit = async (event) =>{
        event.preventDefault();

        const userDataStr = localStorage.getItem('user');
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const userEmail = userData ? userData.email : '';
        console.log(userEmail);
        this.setState({ 
            formLoading: true, 
            formError: ''
        });
        
        try{
            const userId = this.props.user.id;
            const formData = new FormData();
            const token = localStorage.getItem('access_token');
            if(!token){
                this.setState({
                    loading: false,
                    error: 'Please log in to view your profile'
                });
                return;
            }

            formData.append('first_name', this.state.first_name);
            formData.append('last_name', this.state.last_name);
            formData.append('job_title', this.state.job_title);
            formData.append('updated_by', userEmail);
            
            // Append file if selected
            if (this.state.profile_pic) {
                formData.append('profile_pic', this.state.profile_pic);
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${userId}`,{
                method : 'PUT',
                body: formData,
                headers:{
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if(response.ok){
                const updatedUser = { 
                    ...this.props.user, 
                    profile_pic: data.profile_pic // Use the updated data from response
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                alert('Profile updated successfully!');
                window.location.reload();
            } else {
                alert(data.error || 'Failed to update profile');
            }
        } catch(error){
            alert('Network error - cannot reach server');
        } finally {
            this.setState({ loading: false });
        }
    }

    render() {
        return (
            <div className={styles.formSection}>
                <h2>Personal Information</h2>
                
                <form onSubmit={this.handleSubmit} className={styles.form}>
                {/* Profile Picture Upload */}
                <div className={styles.profilePicSection}>
                <div className={styles.profilePicPreview}>
                    {this.state.profile_pic ? (
                    // Show actual image - handle both File objects and file paths
                    <img 
                        src={
                        typeof this.state.profile_pic === 'string' 
                            ? `${process.env.NEXT_PUBLIC_API_URL}${this.state.profile_pic}` // Existing image from API
                            : URL.createObjectURL(this.state.profile_pic) // Newly selected file
                        } 
                        alt="Profile" 
                        className={styles.profileImage}
                    />
                    ) : (
                    // Show placeholder when no image
                    <div className={styles.profilePlaceholder}>
                        👤
                    </div>
                    )}
                </div>
                <div className={styles.fileUpload}>
                    <label className={styles.fileLabel}>
                    Choose Profile Picture
                    <input
                        type="file"
                        accept="image/*"
                        onChange={this.handleFileChange}
                        className={styles.fileInput}
                    />
                    </label>
                </div>
                </div>

                {/* Form Fields */}
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                    <label>First Name</label>
                    <input
                        type="text"
                        name="first_name"
                        value={this.state.first_name}
                        onChange={this.handleInputChange}
                        className={styles.input}
                    />
                    </div>
                    
                    <div className={styles.formGroup}>
                    <label>Last Name</label>
                    <input
                        type="text"
                        name="last_name"
                        value={this.state.last_name}
                        onChange={this.handleInputChange}
                        className={styles.input}
                    />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>Job Title</label>
                    <input
                    type="text"
                    name="job_title"
                    value={this.state.job_title}
                    onChange={this.handleInputChange}
                    className={styles.input}
                    placeholder="e.g. Software Developer, Project Manager"
                    />
                </div>

                <button type="submit" className={styles.submitButton}>
                    Update Personal Information
                </button>
                </form>
            </div>
        );
    }
}

export default PersonalInfoForm;