import React from 'react';
import styles from './SearchForm.module.css';
import Link from 'next/link';

class SearchForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            formData: {
                id: '',
                national_identifier_number: '',
                contact_number: '',
                first_name: '',
                middle_name: '',
                last_name: '',
                date_of_birth: ''
            },
            results: null,
            loading: false,
            error: '',
            searchType: ''
        };
    }

    handleChange = (e) =>{
        const {name, value} = e.target;
        this.setState(prevState =>({
            formData: {
                ...prevState.formData,
                [name]: value
            }
        }));
    }

    handleSubmit = async (e) =>{
        e.preventDefault();
        this.setState({loading: true, error: '', results: null});

        try{
            const searchData = {};
            Object.entries(this.state.formData).forEach(([key, value]) =>{
                if(value.trim() !== ''){
                    searchData[key] = value.trim();
                }
            });

            let searchType = '';
            if (searchData.id) searchType = 'ID Search';
            else if (searchData.national_identifier_number) searchType = 'National ID Search';
            else if (searchData.contact_number) searchType = 'Contact Number Search';
            else searchType = 'Name/DOB Search';

            const token = localStorage.getItem('access_token');
            if(!token){
                this.setState({
                    loading: false,
                    error: 'Please log in to view your profile'
                });
                return;
            }

            const response = await fetch("http://localhost:5000/api/v1/beneficiaries/search",{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(searchData)
            });

            const data = await response.json();
            if(response.ok){
                this.setState({
                    results: data,
                    loading: false,
                    searchType
                });
            }

            else if(response.status === 404){
                // Handle "No matches found" as a normal result, not an error
                this.setState({
                    results: data, // This will have the "message": "No matches found"
                    loading: false,
                    searchType
                });
            }

            else{
                // Handle other errors (400, 500, etc.)
                this.setState({ 
                    error: data.error || data.message || 'Search failed', 
                    loading: false 
                });
            }
            
        }catch(error){
            this.setState({ 
                error: 'Network error. Please try again.', 
                loading: false 
            });
            console.error('Search error:', error);
        }
    }

    resetForm = () => {
        this.setState({
        formData: {
            id: '',
            national_identifier_number: '',
            contact_number: '',
            first_name: '',
            middle_name: '',
            last_name: '',
            date_of_birth: ''
        },
        results: null,
        error: '',
        searchType: ''
        });
    }

    clearField = (fieldName) => {
        this.setState(prevState => ({
        formData: {
            ...prevState.formData,
            [fieldName]: ''
        }
        }));
    }

    render(){
        const { formData, results, loading, error, searchType } = this.state;

        const formatDate = (date) => {
            let fDate = '';
            try{
                const date_ = new Date(date);
                if (date_) {
                    fDate = date_.getFullYear() + '-' + 
                    String(date_.getMonth() + 1).padStart(2, '0') + '-' +
                    String(date_.getDate()).padStart(2, '0');
                    return fDate;
                }
            }catch(e){
                console.error('Date parsing error:', e);
                return '';
            }
        };

        
        return(
            <div className = {styles.container}>
                <div className = {styles.SearchForm}>
                    <form onSubmit={this.handleSubmit} className = {styles.searchForm}>
                        <h2>Search Beneficiary</h2>
                        <div className={styles.formRow}>
                            <input
                                type="text"
                                name="id"
                                placeholder="ID"
                                value={this.state.formData.id}
                                onChange={this.handleChange}
                                className={styles.formInput}
                            />

                            <input
                                type="text"
                                name="national_identifier_number"
                                placeholder="National Identifier Number"
                                value={this.state.formData.national_identifier_number}
                                onChange={this.handleChange}
                                className={styles.formInput}
                            />

                            <input
                                type="text"
                                name="contact_number"
                                placeholder="Contact Number"
                                value={this.state.formData.contact_number}
                                onChange={this.handleChange}
                                className={styles.formInput}
                            />
                        </div>
                        <div className = {styles.formRow}>
                            <input 
                                type = "text"
                                name = "first_name"
                                placeholder = "First Name"
                                value = {this.state.formData.first_name}
                                onChange = {this.handleChange}
                                className = {styles.formInput}
                            />

                            <input 
                                type = "text"
                                name = "middle_name"
                                placeholder = "Middle Name"
                                value = {this.state.formData.middle_name}
                                onChange = {this.handleChange}
                                className = {styles.formInput}
                            />

                            <input 
                                type = "text"
                                name = "last_name"
                                placeholder = "Last Name"
                                value = {this.state.formData.last_name}
                                onChange = {this.handleChange}
                                className = {styles.formInput}
                            />
                        </div>
                        <div className = {styles.formRow}>
                            <input
                                type="date"
                                name="date_of_birth"
                                placeholder="Date of Birth"
                                value={this.state.formData.date_of_birth}
                                onChange={this.handleChange}
                                className={styles.formInput}
                            />
                        </div>
                        <div className={styles.formActions}>
                            <button 
                                type="submit" 
                                disabled={this.state.loading}
                                className={styles.submitButton}
                            >
                                {this.state.formLoading ? 'Searching...' : 'Search'}
                            </button>
            
                            <button 
                                type="button" 
                                onClick={this.resetForm}
                                className={styles.cancelButton}
                                >
                                Clear
                            </button>                        
                        </div>
                    </form>
                </div>
                
                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    {loading && (
                        <div className={styles.loading}>
                            Searching...
                        </div>
                    )}

                    {results && !results.message && results.matches && (
                        <div className={styles.resultsTable}>
                        <div className={styles.resultsContainer}>
                            <div className={styles.resultsHeader}>
                                <h3>Search Results</h3>
                                <span className={styles.resultCount}>
                                    {results.count || (Array.isArray(results.matches) ? results.matches.length : 1)} record(s) found
                                </span>
                            </div>

                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>First Name</th>
                                        <th>Middle Name</th>
                                        <th>Mother's Name</th>
                                        <th>Last Name</th>
                                        <th>Date of Birth</th>
                                        <th>Sex</th>
                                        <th>National ID#</th>
                                        <th>Contact</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Handle both single object and array */}
                                    {(Array.isArray(results.matches) ? results.matches : [results.matches])
                                        .map((beneficiary) => (
                                            <tr key={beneficiary.id}>
                                                <td>{beneficiary.id}</td>
                                                <td>{beneficiary.first_name}</td>
                                                <td>{beneficiary.middle_name}</td>
                                                <td>{beneficiary.mother_first_name}</td>
                                                <td>{beneficiary.last_name}</td>
                                                <td>{formatDate(beneficiary.date_of_birth) || 'N/A'}</td>
                                                <td>{beneficiary.sex || 'N/A'}</td>
                                                <td>{beneficiary.national_identifier_number || 'N/A'}</td>
                                                <td>{beneficiary.contact_number || 'N/A'}</td>
                                                <td>
                                                    <Link href={`/editBeneficiary/${beneficiary.id}`} className={styles.editButton}>Edit</Link>
                                                    <Link href={`/beneficiaryID/${beneficiary.id}`} className={styles.viewButton}>View ID</Link>
                                                    <Link href={`/history/${beneficiary.id}`} className={styles.historyButton}>View History</Link>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                        </div>
                    )}

                    {results && results.message === "No matches found" && (
                        <div className = {styles.resultsTable}>
                        <div className={styles.noResults}>
                            No beneficiaries found matching your search criteria.
                        </div>
                        </div>
                    )}
                
            </div>
        );
    }
}

export default SearchForm;