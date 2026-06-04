import React from 'react';
import styles from './ActionsForm.module.css';

class ActionForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            beneficiary_id: '',
            service_id: '',
            action_date: '',
            quantity: 1,
            notes: '',
            recorded_by: '',

            lastActionId: null,
            formError: '',
            formLoading: false,
            formUndo: false
        };
    }

    handleInputChange = (e) =>{
        this.setState({[e.target.name]: e.target.value});
    }

    resetForm = () =>{
        this.setState({
            beneficiary_id: '',
            service_id: '',
            action_date: '',
            quantity: 1,
            notes: '',
            recorded_by: '',

            lastActionId: null,
            formError: '',
            formLoading: false,
            formUndo: false
        });
    }

    resetToUndo = (a_id) =>{
        this.setState({
            beneficiary_id: '',
            service_id: '',
            action_date: '',
            quantity: 1,
            notes: '',
            recorded_by: '',

            lastActionId: a_id,
            formError: '',
            formLoading: false,
            formUndo: true
        });
    }

    
checkService = async (serviceId) =>{
        let serviceExists = false;
        
        try{
            const token = localStorage.getItem('access_token');
            if(!token){
                this.setState({
                loading: false,
                error: 'Please log in to view your profile'
                });
                return; 
            }
            const response = await fetch(`http://localhost:5000/api/v1/services/${serviceId}`,{
                method: 'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':`Bearer ${token}`
                }
            });

            if(response.ok){
                serviceExists = true;
            
            } else{
                serviceExists = false;
            }
            return serviceExists;
        }catch(e){
            this.setState({
                formError: 'Network error - cannot reach server',
                formLoading: false,
                formUndo: false
            });

            serviceExists = false;
            return serviceExists;
        }
    }


    checkBeneficiary = async (benId) =>{
        let benExists = false;

        try{
            const token = localStorage.getItem('access_token');
            if(!token){
                this.setState({
                loading: false,
                error: 'Please log in to view your profile'
                });
                return; 
            }
            const response = await fetch(`http://localhost:5000/api/v1/beneficiaries/${benId}`,{
                method: 'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if(response.ok){
                benExists = true;
            
            } else{
                benExists = false;
            }
            return benExists;
        }catch(e){
            this.setState({
                formError: 'Network error - cannot reach server',
                formLoading: false,
                formUndo: false
            });

            benExists = false;
            return benExists;
        }
    }

    
    handleSubmit = async (e) =>{
        e.preventDefault();
        const userDataStr = localStorage.getItem('user');
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const userEmail = userData ? userData.email : '';

        this.setState({
            formLoading: true,
            formError: ''
        });

        if(confirm("Are you sure you want to Submit this action?")){
            try{

                const benExists = await this.checkBeneficiary(this.state.beneficiary_id);
                const serviceExists = await this.checkService(this.state.service_id);

                if(benExists && serviceExists){

                    const token = localStorage.getItem('access_token');
                    if(!token){
                        this.setState({
                        loading: false,
                        error: 'Please log in to view your profile'
                        });
                        return; 
                    }
                    const response = await fetch('http://localhost:5000/api/v1/actions/', {
                        method: 'POST',
                        headers: {
                            'Content-Type':'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            beneficiary_id: this.state.beneficiary_id,
                            service_id: this.state.service_id,
                            action_date: this.state.action_date,
                            quantity: this.state.quantity,
                            notes: this.state.notes,
                            recorded_by: userEmail,
                        })
                    });

                    const data = await response.json();

                    if(response.ok){
                        alert("Action Complete");
                        this.resetToUndo(data.id);
                    }
                    else{
                        this.setState({
                            formError: data.error || "Failed to Submit Action",
                            formLoading: false,
                            formUndo: false
                        });
                    }
                } else{
                    if(!this.state.formError){
                        alert("Beneficiary or Service Not found");
                        this.resetForm();
                    }
                }
            } catch(error){
                this.setState({
                    formError: 'Network error - cannot reach server',
                    formLoading: false,
                    formUndo: false
                });
            } 

        } else {
            this.resetForm();
        }
    }

    handleUndo = async (e) =>{
        e.preventDefault();
        if(this.state.formUndo){
            if(confirm("Are you sure you want to roll back your last transaction?")){
                try{

                    this.setState({
                        formLoading: true,
                        formError: ''
                    });

                    const response = await fetch(`http://localhost:5000/api/v1/actions/undo/${this.state.lastActionId}`, {
                        method: "DELETE",
                        headers: {'Content-Type': 'application/json'}
                    });

                    const data = await response.json();

                    if(response.ok){
                        alert("Action rolled back.. you cannot bring it back");
                        this.resetForm();
                    } else {
                        alert(data.error || 'Failed to rollback action');
                        this.resetForm();
                    }
                } catch(error){
                    alert('Network error - cannot reach server');
                    this.resetForm();
                }
            } else{
                this.resetForm();
            }
        }
    }
    render(){
        return(
            <div className={styles.container}>
                <div className={styles.actionsForm}>
                    <h2>Actions</h2>
                    <form onSubmit={this.handleSubmit}>
                        <div className={styles.formRow}>
                            <div className={styles.cell}>
                                <label className={styles.label}>Enter Beneficiary ID:<span className={styles.required}>*</span></label>
                                <small className={styles.hint}>Enter the beneficiary's ID number or scan the QR code on his SARC ID.</small>
                                <input 
                                    type="number"
                                    name="beneficiary_id"
                                    value={this.state.beneficiary_id}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                    required
                                />
                            </div>
                            <div className={styles.cell}>
                                <label className={styles.label}>Enter Service ID:<span className={styles.required}>*</span></label>
                                <small className={styles.hint}>For service ID, check your mission documentation or your field team leader.</small>
                                <input 
                                    type="number"
                                    name="service_id"
                                    value={this.state.service_id}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                    required 
                                />
                            </div>
                            <div className={styles.cell}>
                                <label className={styles.label}>Action Date:<span className={styles.required}>*</span></label>
                                <div className={styles.hintGroup}>
                                    <small className={styles.hint}>.</small>
                                </div>
                                <input
                                    type="date"
                                    name="action_date"
                                    value={this.state.action_date}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />
                            </div>
                            </div> 
                            <div className={styles.formRow}>
                            <div className={styles.cell}>
                                <label className={styles.label}>Quantity:<span className={styles.required}>*</span></label>
                                <div className={styles.hintGroup}>
                                    <small className={styles.hint}>Enter the quantities of packages delivered.</small>
                                    <small className={styles.hint}>If services are other than (GFA) or (NFI) enter (1).</small>
                                </div>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={this.state.quantity}
                                    onChange={this.handleInputChange}
                                    className={styles.formInput}
                                />
                            </div>
                        </div>
                        <div className={styles.formRowa}>
                            <div className={styles.cell}>
                                <label className={styles.label}>Notes:</label>
                                <small className={styles.hint}>Optional..</small>
                                <textarea
                                onChange={this.handleInputChange} 
                                className={styles.Textarea}
                                name="notes"
                                value = {this.state.notes}
                            />
                            </div>
                        </div>
                        <div className={styles.formActions}>
                            <button
                                type="submit"
                                disabled={this.state.formLoading}
                                className={styles.submitButton}
                            >
                                {this.state.formLoading ? 'Sending...': 'Submit'}
                            </button>

                            <button
                                type="button"
                                disabled={!this.state.formUndo}
                                className={styles.undoButton}
                                onClick={this.handleUndo}
                            >
                                Undo Last Input
                            </button>

                            <button
                                type="button"
                                className={styles.clearButton}
                                onClick={this.resetForm}
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

export default ActionForm;