import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import './styles.css';

function App() {
  const [resultData, setResultData] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [group, setGroup] = useState([]);
  const [showMore, setShowMore] = useState(false)
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000');
        const data = await response.json();
        const filteredData = await data.filteredData
        setResultData(filteredData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await fetch('http://localhost:5000');
        const result = await response.json();
        setGroup(result);
      } catch (error) {
        console.error('Error fetching group data:', error);
      }
    };
    fetchGroup();
  }, []);

  useEffect(() => {
    if (resultData && (selectedDepartment || selectedFaculty) ) {
      // Store data for the selected department
      if (selectedDepartment) {
        const data = resultData[selectedDepartment];
        dataSelection(data)
      }

      if (selectedFaculty && !selectedDepartment){
        const data = resultData[selectedFaculty];
        dataSelection(data)
      }
     
      function dataSelection(data){
          // Store data in variables
        const viewsData = data.views;
        const downloadsData = data.downloads;
        const topCountriesObject = data.topCountriesByViews;
        const countriesData = Object.entries(topCountriesObject);
        const titleData = data.topPerformingArticle;
        const totalViews = data.totalViews;
        const totalDownloads = data.totalDownloads;
        const dates = data.xlabels
        const labels = dates.splice(6,11)

        function mapToFormattedArray(arr) {
          return arr.map(dateString => {
            const [year, month] = dateString.split('-');
            const monthIndex = parseInt(month, 10) - 1;
            const dateObj = new Date(year, monthIndex);
            // Format the date as 'Mon YYYY'
            const formattedDate = new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'short'
            }).format(dateObj);
            return formattedDate;
          });
        }

        function displayData() {
          // Assuming there's only one row in the table body
          const tbody = document.getElementById('tableBody');
          tbody.innerHTML = ''; // Clear existing data
      
          titleData.forEach(entry => {
              const row = document.createElement('tr');
              const titleCell = document.createElement('td');
              const viewsCell = document.createElement('td');
              const authorCell = document.createElement('td');
      
              const titleLink = document.createElement('a');
              titleLink.textContent = entry.title;
              titleLink.href = entry.url;
              titleLink.style.textDecoration = 'none';
              titleLink.style.color = 'black';
              titleCell.appendChild(titleLink);
      
              // Conditional rendering for author text with "Show More" / "Show Less" button
              const text = entry.author;
              const string = text.toString()
              const truncatedText = string.substring(0, 25);
              const showMore = text.length > 25;
      
              authorCell.textContent = showMore ? truncatedText + '...' : text;
              if (showMore) {
                  const toggleButton = document.createElement('button');
                  toggleButton.textContent = showMore ? 'Show More' : 'Show Less';
                  toggleButton.addEventListener('click', () => {
                      authorCell.textContent = showMore ? text : truncatedText + '...';
                      toggleButton.textContent = showMore ? 'Show Less' : 'Show More';
                  });
                  authorCell.appendChild(toggleButton);
              }
      
              viewsCell.textContent = entry.views;
      
              row.appendChild(titleCell);
              row.appendChild(authorCell);
              row.appendChild(viewsCell);
      
              tbody.appendChild(row);
          });
      }
      
      displayData();
      

        const tableRows2 = [];

        for (let i = 0; i < countriesData.length; i++) {
            tableRows2.push(`<tr>
                                <td>${countriesData[i][0]}</td>
                                <td>${countriesData[i][1]}</td>
                            </tr>`);
          }
        
        const table2 = `<table>
                          <tr>
                            <th>Country</th>
                            <th>Views</th>
                          </tr>${tableRows2.join('')}
                        </table>`;

        document.getElementById('topCountriesByViews').innerHTML = table2;

        const table3 = `<table>
                            <tr>
                                <th>Totals</th>
                                <th>Value</th>
                            </tr>
                            <tr>
                                <td>Total Views</td>
                                <td>${totalViews}</td>
                            </tr>
                            <tr>
                                <td>Total Downloads</td>
                                <td>${totalDownloads}</td>
                            </tr>
                        </table>`;

        document.getElementById('totals').innerHTML = table3;

        // Destroy existing Chart instance if it exists
        if (chartRef.current) {
          chartRef.current.destroy();
        }

        // Create new Chart instance
        const ctx = document.getElementById('myChart').getContext('2d');
        chartRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Views',
                data: viewsData,
                backgroundColor: 'rgba(0, 154, 68, 0.3)',
                borderColor: 'rgba(0, 154, 68 , 1)',
                borderWidth: 1,
              },
              {
                label: 'Downloads',
                data: downloadsData,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderColor: 'rgba(0, 0, 0, 1)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              x: { stacked: false },
              y: { stacked: false }
            },
          }
        });
        }
      
    }
  }, [resultData, selectedDepartment, selectedFaculty]);

  const handleFacultyChange = (e) => {
    setSelectedFaculty(e.target.value);
    setSelectedDepartment('');
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  return (
    <div className="master">
      <div className='dropdown-menu'>
        <div className="dropdown">
          <select id="faculties" value={selectedFaculty} onChange={handleFacultyChange}>
            <option value="">Select a faculty</option>
            {group.map(({ faculty }) => (
              <option key={faculty} value={faculty}>{faculty}</option>
            ))}
          </select>
        </div>
        {selectedFaculty && (
          <div className="dropdown">
            <select id="departments" value={selectedDepartment} onChange={handleDepartmentChange}>
              <option value="">Select a department</option>
              {group.find(({ faculty }) => faculty === selectedFaculty)?.depts.map(({ name }) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <h2 id="heading">Total views and downloads</h2>
      <div id="totals"></div>
      <h2 id="heading">Past 6 months overview</h2>
      <canvas id="myChart"></canvas>
      <div id="topPerformingArticles">
        <h2 id="heading">Trending Articles</h2>
        <table id="table" class="trendingArticles">
          <thead>
            <tr>
              <th>Title</th>
              <th>Authors</th>
              <th>Views</th>
            </tr>
          </thead>
          <tbody id="tableBody"></tbody>
        </table>
      </div>
      <h2 id="heading">Top Countries by Views</h2>
      <div id="topCountriesByViews"></div>
    </div>
  );
}

export default App;