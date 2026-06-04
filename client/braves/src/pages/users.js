import React from 'react';
import styles from './users.module.css';
import Navbar from '../components/Navbar/Navbar';

class UsersPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Table state
      users: [],
      loading: false,
      page: 1,
      hasMore: true,
      searchQuery: '',
      searchResults: [],
      
      // Form state
      isEditing: false,
      editingUserId: null,
      email: '',
      first_name: '',
      last_name: '',
      role: 'user',
      profile_pic: null,
      created_at: null,
      updated_by: '',
      last_update: null,

      formError: '',
      formLoading: false
    };
    this.hasLoadedInitial = false;
    this.scrollThrottle = null;
    this.scrollCheckCount = 0;
  }

  componentDidMount() {
  // Always reset and reload when component mounts
  this.setState({
    users: [],
    page: 1,
    hasMore: true,
    loading: false
  }, () => {
    this.loadUsers();
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
        this.loadUsers();
      }
      
      this.scrollThrottle = null;
    }, 250); // 250ms throttle
  }

  loadUsers = async () => {
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

      const token = localStorage.getItem('access_token');
      if(!token){
        this.setState({
            loading: false,
            error: 'Please log in to view your profile'
        });
        return;
      }
      // Cache busting to prevent duplicate API responses
      const response = await fetch(
        `http://localhost:5000/api/v1/users/all?page=${this.state.page}&per_page=20}`,{
          method: 'GET',
          headers: {
                    'Authorization': `Bearer ${token}`,
                  },
        }
      );
      const data = await response.json();
      
      console.log('API response:', {
        usersCount: data.users.length,
        current_page: data.current_page,
        pages: data.pages,
        hasMore: data.current_page < data.pages
      });
      
      const isLastPage = data.current_page >= data.pages;
      
      // Filter out any duplicates (safety check)
      const existingIds = new Set(this.state.users.map(u => u.id));
      const newUsers = data.users.filter(u => !existingIds.has(u.id));
      
      console.log(`Adding ${newUsers.length} new users (filtered from ${data.users.length})`);
      
      this.setState(prevState => ({
        users: [...prevState.users, ...newUsers],
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
      const filteredUsers = this.state.users.filter(user =>
        (user.id.toString().toLowerCase().includes(query.toLowerCase())) ||
        (user.email.toLowerCase().includes(query.toLowerCase())) ||
        (user.first_name && user.first_name.toLowerCase().includes(query.toLowerCase())) ||
        (user.last_name && user.last_name.toLowerCase().includes(query.toLowerCase())) ||
        user.role.toLowerCase().includes(query.toLowerCase())
      );
      
      this.setState({
        searchResults: filteredUsers
      });
    }
  }

  handleEdit = (user) => {
    this.setState({
      isEditing: true,
      editingUserId: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      updated_by: user.updated_by,
      created_at: user.created_at,
      last_update: user.last_update,
      profile_pic: user.profile_pic
    });
  }

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleResetPassword = async (userId) =>{

    const token = localStorage.getItem('access_token');
    if(!token){
      this.setState({
        loading: false,
        error: 'Please log in to proceed'
      });
    }

    const userDataStr = localStorage.getItem('user');
    const UserData = userDataStr ? JSON.parse(userDataStr): null;
    const UserEmail = UserData ? UserData.email : '';
    
    try{
      const response = await fetch(`http://localhost:5000/api/v1/users/reset_password/${userId}`,{
        method: "PUT",
        headers: { 
          'Content-Type': "application/json",
          'Authorization': `Bearer ${token}`,
         }
      });

      const data = await response.json();
      if(response.ok){
          alert("Password reset successfully!");
        }
      else{
          alert(data.error || 'Failed to delete user');
        }
      
      this.resetForm();
      
      }catch (error) {
        alert('Network error - cannot reach server');
      }
    }
  

  handleFormSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('access_token');
    if(!token){
        this.setState({
            loading: false,
            error: 'Please log in to view your profile'
          });
        return;
    
    }

    const userDataStr = localStorage.getItem('user');
    const userData = userDataStr ? JSON.parse(userDataStr) : null;
    const userEmail = userData ? userData.email : '';;
    this.setState({ 
          formLoading: true, 
          formError: ''
        });
    
    try {
      let url, method, body;
      
      if (this.state.isEditing) {
        url = `http://localhost:5000/api/v1/users/${this.state.editingUserId}`;
        method = 'PUT';
      } else {
        url = 'http://localhost:5000/api/v1/users/';
        method = 'POST';
      }
      
      body = JSON.stringify({
        email: this.state.email,
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        role: this.state.role,
        updated_by: userEmail

      });
      
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json' ,
          'Authorization': `Bearer ${token}`
        },
        body: body
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (this.state.isEditing) {
          alert("User updated successfully!");
          const updatedUsers = this.state.users.map(user =>
            user.id === this.state.editingUserId ? { ...user, ...data } : user
          );
          this.setState({ users: updatedUsers });
        } else {
          alert(`User created successfully! Password: ${data.generated_password}`);
          this.setState(prevState => ({
            users: [data, ...prevState.users]
          }));
        }
        
        this.resetForm();
      } else {
        this.setState({ 
          formError: data.error || `Failed to ${this.state.isEditing ? 'update' : 'create'} user`,
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
    this.setState({
      isEditing: false,
      editingUserId: null,
      email: '',
      first_name: '',
      last_name: '',
      role: 'user',
      profile_pic: '',
      last_update: null,
      created_at: null,
      updated_by: '',
      formError: '',
      formLoading: false
    });
  }

  toggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      if(!token){
        this.setState({
            loading: false,
            error: 'Please log in to view your profile'
        });
        return;
      }
      const response = await fetch(`http://localhost:5000/api/v1/users/${userId}/status`, {
        method: "PATCH",
        headers: { 
          'Content-Type': "application/json",
          'Authorization': `Bearer ${token}`,
         }
      });

      const data = await response.json();

      if (response.ok) {
        const updatedUsers = this.state.users.map(user =>
          user.id === userId ? { ...user, isActive: !currentStatus } : user
        );

        this.setState({
          users: updatedUsers,
          searchResults: this.state.searchResults.map(user =>
            user.id === userId ? { ...user, isActive: !currentStatus } : user
          )
        });

        alert(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      } else {
        alert(data.error || 'Failed to update user status');
      }
    } catch (error) {
      alert('Network error - cannot reach server');
    }
  }

  deleteUser = async (userId, userEmail, isActive) => {
    if (isActive) {
      alert('Cannot delete active users. Please deactivate the user first.');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete user: ${userEmail}? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if(!token){
        this.setState({
            loading: false,
            error: 'Please log in to view your profile'
        });
        return;
      }
      const response = await fetch(`http://localhost:5000/api/v1/users/${userId}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
         }
      });

      const data = await response.json();

      if (response.ok) {
        alert('User deleted successfully!');
        this.setState(prevState => ({
          users: prevState.users.filter(user => user.id !== userId),
          searchResults: prevState.searchResults.filter(user => user.id !== userId)
        }));
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      alert('Network error - cannot reach server');
    }
  }

  render(){
    const { users, loading, hasMore, searchQuery, searchResults } = this.state;
    const displayUsers = searchQuery ? searchResults : users;

    return (
      <div className={styles.container} style={{ minHeight: '150vh' }}>
        <Navbar />
        <h1>User Administration</h1>

        
        {/* Form Section */}
        <div className={styles.userForm}>
          <h2>{this.state.isEditing ? 'Edit User' : 'Create New User'}</h2>
          <form onSubmit={this.handleFormSubmit}>
            <div className = {styles.imgPart}>
            {this.state.profile_pic ? (
              <img
                  src={
                        typeof this.state.profile_pic === 'string'
                        ? `http://localhost:5000${this.state.profile_pic}`
                        : URL.createObjectURL(this.state.profile_pic)
                      }
                  alt="Profile"
                  className={styles.profileImage_}
              />
              ) : (
               <img src="/images/default_pic.jpg" className={styles.profileImage_} />
            )}
            </div>
            <div className={styles.formRow}>
              <div className={styles.cell}>
              <label className={styles.label}>Email:<span className={styles.required}>*</span></label>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={this.state.email}
                onChange={this.handleInputChange}
                required
                className={styles.formInput}
              />
              </div>
              <div className={styles.cell}>
              <label className={styles.label}>First Name:<span className={styles.required}>*</span></label>
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
              <div className={styles.cell}>
              <label className={styles.label}>Role:<span className={styles.required}>*</span></label>
              <select
                name="role"
                value={this.state.role}
                onChange={this.handleInputChange}
                className={styles.formSelect}
              >
                <option value="admin">Administrator</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
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
                 this.state.isEditing ? 'Update User' : 'Create User'}
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
        
        {/* Table Section */}
        <div className={styles.resultsTable}>
          <h2>Users ({users.length} total)</h2>
          
          <div className={styles.searchSection}>
            <input
              type="text"
              placeholder="Search users by email, name, or role..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={this.handleSearchChange}
            />
          </div>
          
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID:</th>
                <th></th>
                <th>Email:</th>
                <th>First Name:</th>
                <th>Last Name:</th>
                <th>Role:</th>
                <th>Created At:</th>
                <th>Last Login:</th>
                <th>Actions:</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {displayUsers.map((user, index) => (
                <tr key={`${user.id}-${index}`} className={user.isActive ? styles.isActive : styles.isInActive}>
                  <td>{user.id}</td>
                  <td className={styles.profileIcon}>
                    {user && user.profile_pic ? (
                      <img 
                        src={`http://localhost:5000${user.profile_pic}`}
                        alt="Profile"
                        className={styles.profileImage}
                      />
                    ) : (
                      '👤'
                    )}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.first_name}</td>
                  <td>{user.last_name}</td>
                  <td>{user.role}</td>
                  <td>{user.created_at}</td>
                  <td>{user.last_login}</td>
                  <td>
                    <button 
                      className={styles.editButton} 
                      onClick={() => this.handleEdit(user)}
                    >
                      Edit
                    </button>
                    <button 
                      className={styles.activateButton} 
                      onClick={() => this.toggleUserStatus(user.id, user.isActive)}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      className={styles.deleteButton} 
                      onClick={() => this.deleteUser(user.id, user.email, user.isActive)}
                    >
                      Delete
                    </button>
                  </td>
                  <td>
                    <button 
                      className={styles.deleteButton} 
                      onClick={() => this.handleResetPassword(user.id)}
                    >
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Loading indicator */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Loading more users...
            </div>
          )}
          
          {/* Prompt to scroll if not loading but has more */}
          {hasMore && !loading && users.length > 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              Scroll down to load more users...
            </div>
          )}
          
          {/* End message */}
          {!hasMore && users.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
              All users loaded ({users.length} total)
            </div>
          )}
          
          {/* No users message */}
          {users.length === 0 && !loading && (
            <div style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
              No users found
            </div>
          )}
        </div>
      </div>
    );
  }
}


export default UsersPage;