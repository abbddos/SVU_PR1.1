import React from 'react';
import MultiSelectDropdown from '../MultiSelect/MultiSelectDropdown';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

import styles from './Dashboard.module.css'; 

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      loading: true,
      error: '',
      filters: {
        start_date: '',
        governorate: [],
        district: [],
        sub_district: [],
        village_neighborhood: [],
        service_type: []
      },
      filterOptions: {
        governorates: [],
        districts: [],
        subDistricts: [],
        villages: [],
        serviceTypes: []
      }
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {

      const token = localStorage.getItem('access_token');
      if(!token){
        this.setState({
          loading: false,
          error: 'Please log in to view your profile'
        });
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/actions/report`,{
        method: 'GET',
        headers :{
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonData = await response.json();
      this.extractFilterOptions(jsonData);
      
      this.setState({
        data: jsonData,
        loading: false
      });
      
    } catch (error) {
      this.setState({
        error: error.message,
        loading: false
      });
    }
  }

  extractFilterOptions = (data) => {
    if (!data || !Array.isArray(data)) return;

    const formatOptions = (items) => {
      const unique = [...new Set(items.filter(Boolean))].sort();
      return unique.map(item => ({ label: item, value: item }));
    };

    this.setState({
      filterOptions: {
        governorates: formatOptions(data.map(item => item.governorate)),
        districts: formatOptions(data.map(item => item.district)),
        subDistricts: formatOptions(data.map(item => item.sub_district)),
        villages: formatOptions(data.map(item => item.village_neighborhood)),
        serviceTypes: formatOptions(data.map(item => item.service_type))
      }
    });
  }

  handleFilterChange = (event) => {
    this.setState(prevState => ({
      filters: {
        ...prevState.filters,
        start_date: event.target.value
      }
    }));
  }

  handleMultiSelectChange = (name, selected) => {
    this.setState(prevState => ({
      filters: {
        ...prevState.filters,
        [name]: selected
      }
    }));
  }

  clearFilters = () => {
    this.setState({
      filters: {
        start_date: '',
        governorate: [],
        district: [],
        sub_district: [],
        village_neighborhood: [],
        service_type: []
      }
    });
  }

  getFilteredData = () => {
    const { data, filters } = this.state;
    if (!data || !Array.isArray(data)) return [];

    return data.filter(item => {
      if (filters.start_date && !item.start_date?.startsWith(filters.start_date)) return false;
      
      if (filters.governorate.length > 0) {
        const govValues = filters.governorate.map(g => g.value);
        if (!govValues.includes(item.governorate)) return false;
      }
      
      if (filters.district.length > 0) {
        const distValues = filters.district.map(d => d.value);
        if (!distValues.includes(item.district)) return false;
      }
      
      if (filters.sub_district.length > 0) {
        const subValues = filters.sub_district.map(s => s.value);
        if (!subValues.includes(item.sub_district)) return false;
      }
      
      if (filters.village_neighborhood.length > 0) {
        const villageValues = filters.village_neighborhood.map(v => v.value);
        if (!villageValues.includes(item.village_neighborhood)) return false;
      }
      
      if (filters.service_type.length > 0) {
        const serviceValues = filters.service_type.map(s => s.value);
        if (!serviceValues.includes(item.service_type)) return false;
      }
      
      return true;
    });
  }

  // Prepare data for charts
  prepareServiceTypeData = (filteredData) => {
    const serviceMap = new Map();
    
    filteredData.forEach(item => {
      const service = item.service_type || 'Unknown';
      if (!serviceMap.has(service)) {
        serviceMap.set(service, {
          name: service,
          beneficiaries: 0,
          count: 0,
          males: 0,
          females: 0
        });
      }
      const stats = serviceMap.get(service);
      stats.beneficiaries += item.Total_Beneficiaries || 0;
      stats.count += 1;
      stats.males += item.Males || 0;
      stats.females += item.Females || 0;
    });
    
    return Array.from(serviceMap.values());
  }

  prepareGovernorateData = (filteredData) => {
    const govMap = new Map();
    
    filteredData.forEach(item => {
      const gov = item.governorate || 'Unknown';
      if (!govMap.has(gov)) {
        govMap.set(gov, {
          name: gov,
          beneficiaries: 0,
          count: 0
        });
      }
      const stats = govMap.get(gov);
      stats.beneficiaries += item.Total_Beneficiaries || 0;
      stats.count += 1;
    });
    
    return Array.from(govMap.values());
  }

  prepareMonthlyData = (filteredData) => {
    const monthMap = new Map();
    
    filteredData.forEach(item => {
      if (!item.start_date) return;
      const date = new Date(item.start_date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthMap.has(monthYear)) {
        monthMap.set(monthYear, {
          month: monthYear,
          beneficiaries: 0,
          count: 0
        });
      }
      const stats = monthMap.get(monthYear);
      stats.beneficiaries += item.Total_Beneficiaries || 0;
      stats.count += 1;
    });
    
    return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  }

  prepareDisplacementData = (filteredData) => {
    const totalImmigrants = filteredData.reduce((sum, item) => sum + (item.Displacement_Immigrant || 0), 0);
    const totalIDPs = filteredData.reduce((sum, item) => sum + (item.Displacement_IDP || 0), 0);
    const totalResidents = filteredData.reduce((sum, item) => sum + (item.Displacement_Resident || 0), 0);
    const totalRefugees = filteredData.reduce((sum, item) => sum + (item.Displacement_Refugee || 0), 0);
    const totalReturnees = filteredData.reduce((sum, item) => sum + (item.Displacement_Returnee || 0), 0);
    
    const allDisplacement =  [
      {name: "Immigrants", value: totalImmigrants},
      {name: "IDPs", value: totalIDPs},
      {name: "Residents", value: totalResidents},
      {name: "Refugees", value: totalRefugees},
      {name: "Returnees", value: totalReturnees}
    ];

    return allDisplacement;
  }
  

  prepareGenderData = (filteredData) => {
    const totalMales = filteredData.reduce((sum, item) => sum + (item.Males || 0), 0);
    const totalFemales = filteredData.reduce((sum, item) => sum + (item.Females || 0), 0);
    
    return [
      { name: 'Males', value: totalMales },
      { name: 'Females', value: totalFemales }
    ];
  }

  prepareDisabilityData = (filteredData) => {
    const none = filteredData.reduce((sum, item) => sum + (item.Disability_None || 0), 0);
    const mobility = filteredData.reduce((sum, item) => sum + (item.Disability_Mobility || 0), 0);
    const mental = filteredData.reduce((sum, item) => sum + (item.Disability_Mental || 0), 0);
    const hearing  = filteredData.reduce((sum, item) => sum + (item.Disability_Hearing || 0), 0);
    const visual  = filteredData.reduce((sum, item) => sum + (item.Disability_Visual || 0), 0);
    
    const allData =[
      { name: 'No Disability', value: none },
      { name: 'Mobility', value: mobility },
      { name: 'Mental', value: mental },
      { name: 'Visual', value: visual},
      { name: 'Hearing', value: hearing}
    ];

    return allData.filter(item => item.value > 0);
  }

  // Chart colors
  COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  renderFilters = () => {
    const { filters, filterOptions } = this.state;

    return (
      <div className={styles.filtersContainer}>
        <div className={styles.filterRow}>
          <div className={styles.cell}>
            <label>Date:</label>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={this.handleFilterChange}
              className={styles.filterInput}
            />
          </div>
          
          <div className={styles.cell}>
            <label>Governorate:</label>
            <MultiSelectDropdown
              options={filterOptions.governorates}
              selectedValues={filters.governorate}
              onChange={(selected) => this.handleMultiSelectChange('governorate', selected)}
              placeholder="Select governorates..."
            />
          </div>
          
          <div className={styles.cell}>
            <label>District:</label>
            <MultiSelectDropdown
              options={filterOptions.districts}
              selectedValues={filters.district}
              onChange={(selected) => this.handleMultiSelectChange('district', selected)}
              placeholder="Select districts..."
            />
          </div>
          
          <div className={styles.cell}>
            <label>Sub-District:</label>
            <MultiSelectDropdown
              options={filterOptions.subDistricts}
              selectedValues={filters.sub_district}
              onChange={(selected) => this.handleMultiSelectChange('sub_district', selected)}
              placeholder="Select sub-districts..."
            />
          </div>
          
          <div className={styles.cell}>
            <label>Village/Neighborhood:</label>
            <MultiSelectDropdown
              options={filterOptions.villages}
              selectedValues={filters.village_neighborhood}
              onChange={(selected) => this.handleMultiSelectChange('village_neighborhood', selected)}
              placeholder="Select villages..."
            />
          </div>
          
          <div className={styles.cell}>
            <label>Service Type:</label>
            <MultiSelectDropdown
              options={filterOptions.serviceTypes}
              selectedValues={filters.service_type}
              onChange={(selected) => this.handleMultiSelectChange('service_type', selected)}
              placeholder="Select service types..."
            />
          </div>
        </div>
        <div className={styles.filterRow}>
          <button onClick={this.clearFilters} className={styles.clearButton}>
            Clear Filters
          </button>
        </div>
      </div>
    );
  }

  renderCharts = (filteredData) => {
    if (!filteredData || filteredData.length === 0) {
      return <div className={styles.noData}>No data matches the selected filters</div>;
    }

    const serviceData = this.prepareServiceTypeData(filteredData);
    const governorateData = this.prepareGovernorateData(filteredData);
    const monthlyData = this.prepareMonthlyData(filteredData);
    const genderData = this.prepareGenderData(filteredData);
    const disabilityData = this.prepareDisabilityData(filteredData);
    const displacement = this.prepareDisplacementData(filteredData);

    const totalHouseholds = filteredData.reduce((sum, item) => sum + (item.Total_Beneficiaries || 0), 0);
    const totalBeneficiaries = filteredData.reduce((sum, item) => sum +(item.Total_Household_Size || 0), 0)

    const totalRecords = filteredData.length;

    return (
      <div className={styles.dashboardCharts}>
        {/* KPI Row */}
        <div className={styles.kpiRow}>
          <div className={styles.kpiCard}>
            <h3>Total Households Served</h3>
            <div className={styles.kpiValue}>{totalHouseholds.toLocaleString()}</div>
          </div>
          <div className={styles.kpiCard}>
            <h3>Total Beneficiaries Served</h3>
            <div className={styles.kpiValue}>{totalBeneficiaries.toLocaleString()}</div>
          </div>
        </div>

        <div className={styles.kpiRow_1}>
          <div className={styles.kpiCard}>
            <h3>Immigrants:</h3>
            <div className={styles.kpiValue}>{displacement.find(item => item.name === "Immigrants")?.value || 0}</div>
          </div>
          <div className={styles.kpiCard}>
            <h3>IDPs:</h3>
            <div className={styles.kpiValue}>{displacement.find(item => item.name === "IDPs")?.value || 0}</div>
          </div>
          <div className={styles.kpiCard}>
            <h3>Residents:</h3>
            <div className={styles.kpiValue}>{displacement.find(item => item.name === "Residents")?.value || 0}</div>
          </div>
          <div className={styles.kpiCard}>
            <h3>Returnees:</h3>
            <div className={styles.kpiValue}>{displacement.find(item => item.name === "Returnees")?.value || 0}</div>
          </div>
          <div className={styles.kpiCard}>
            <h3>Refugees:</h3>
            <div className={styles.kpiValue}>{displacement.find(item => item.name === "Refugees")?.value || 0}</div>
          </div>
        </div>

        {/* First Row - 2 Charts */}
        <div className={styles.chartsRow}>
          <div className={styles.chartCard}>
            <h3>Beneficiaries by Service Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="beneficiaries" fill="rgb(200,0,0)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartCard}>
            <h3>Monthly Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="beneficiaries" stroke="rgb(200,0,0)" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Second Row - 2 Charts */}
        <div className={styles.chartsRow}>
          <div className={styles.chartCard}>
            <div className={styles.pieRow}>
            <div className={styles.pieThing}>
              <h3>Gender Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={entry => `${entry.name}: ${entry.value}`}
                    outerRadius={120}
                    fill="rgb(200,0,0)"
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} 
                      fill={index === 0 ? 'rgb(200,0,0)' : index === 1 ? 'rgb(253,177,177)' : 'rgb(253, 177, 177)'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.pieThing}>
                <h3>Disability Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={disabilityData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={entry => `${entry.name}: ${entry.value}`}
                      outerRadius={120}
                      innerRadius={50}
                      fill="rgb(200,0,0)"
                      dataKey="value"
                    >
                      {disabilityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} 
                        fill={index === 0 ? 'rgb(200,0,0)' : index === 1 ? 'rgb(150,0,0)' : 'rgb(100,0,0)'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
            </div>
            </div>
          </div>
            <div className={styles.chartCard}>
              <h3>Beneficiaries by Governorate</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={governorateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="beneficiaries" fill="rgb(200,0,0)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
      </div>
    );
  }

  render() {
    const { loading, error } = this.state;
    const filteredData = this.getFilteredData();

    if (loading) {
      return <div className={styles.loading}>Loading dashboard data...</div>;
    }

    if (error) {
      return <div className={styles.error}>Error: {error}</div>;
    }

    return (
      <div className={styles.dashboard}>
        <h1>Dashboard</h1>
        {this.renderFilters()}
        {this.renderCharts(filteredData)}
      </div>
    );
  }
}

export default Dashboard;