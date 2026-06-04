import React from 'react';
import styles from './MultiSelectDropdown.module.css';

class MultiSelectDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      searchTerm: ''
    };
    this.dropdownRef = React.createRef();
  }

  componentDidMount() {
    // Close dropdown when clicking outside
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleClickOutside = (event) => {
    if (this.dropdownRef.current && !this.dropdownRef.current.contains(event.target)) {
      this.setState({ isOpen: false });
    }
  }

  toggleDropdown = () => {
    this.setState(prevState => ({ isOpen: !prevState.isOpen }));
  }

  handleSearchChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  }

  handleSelectAll = () => {
    const { options, selectedValues, onChange } = this.props;
    if (selectedValues.length === options.length) {
      // If all selected, deselect all
      onChange([]);
    } else {
      // Otherwise select all
      onChange([...options]);
    }
  }

  handleItemClick = (option) => {
    const { selectedValues, onChange } = this.props;
    
    const isSelected = selectedValues.some(item => item.value === option.value);
    
    if (isSelected) {
      // Remove if already selected
      onChange(selectedValues.filter(item => item.value !== option.value));
    } else {
      // Add if not selected
      onChange([...selectedValues, option]);
    }
  }

  getFilteredOptions = () => {
    const { options } = this.props;
    const { searchTerm } = this.state;
    
    if (!searchTerm) return options;
    
    return options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  render() {
    const { label, options, selectedValues, placeholder = 'Select options...' } = this.props;
    const { isOpen, searchTerm } = this.state;
    
    const filteredOptions = this.getFilteredOptions();
    const allSelected = options.length > 0 && selectedValues.length === options.length;

    return (
      <div className={styles.dropdownContainer} ref={this.dropdownRef}>
        <div className={styles.dropdownHeader} onClick={this.toggleDropdown}>
          <span className={styles.selectedCount}>
            {selectedValues.length > 0 
              ? `${selectedValues.length} selected` 
              : placeholder}
          </span>
          <span className={`${styles.arrow} ${isOpen ? styles.open : ''}`}>▼</span>
        </div>
        
        {isOpen && (
          <div className={styles.dropdownList}>
            {/* Search box */}
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={this.handleSearchChange}
                className={styles.searchInput}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            {/* Select All option */}
            {options.length > 0 && (
              <div 
                className={`${styles.dropdownItem} ${styles.selectAll}`}
                onClick={this.handleSelectAll}
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  readOnly
                  onClick={(e) => e.stopPropagation()}
                />
                <span>Select All</span>
              </div>
            )}
            
            {/* Options list */}
            <div className={styles.optionsList}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map(option => {
                  const isSelected = selectedValues.some(item => item.value === option.value);
                  return (
                    <div
                      key={option.value}
                      className={`${styles.dropdownItem} ${isSelected ? styles.selected : ''}`}
                      onClick={() => this.handleItemClick(option)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span>{option.label}</span>
                    </div>
                  );
                })
              ) : (
                <div className={styles.noResults}>No options found</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default MultiSelectDropdown;