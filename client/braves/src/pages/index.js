import React from 'react';

class HomePage extends React.Component {
  componentDidMount() {
    // For now, redirect to login
    window.location.href = '/login';
  }

  render() {
    return (
      <div>
        <p>Redirecting to login...</p>
      </div>
    );
  }
}

export default HomePage;