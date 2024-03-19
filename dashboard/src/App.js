import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import './styles.css';

function App() {
  const [resultData, setResultData] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [group, setGroup] = useState([]);
  const [expandedAuthors, setExpandedAuthors] = useState([]);
  const [titleData, setTitleData] = useState([])
  const chartRef = useRef(null);

  const toggleAuthor = (index) => {
    const newExpandedAuthors = [...expandedAuthors];
    newExpandedAuthors[index] = !newExpandedAuthors[index];
    setExpandedAuthors(newExpandedAuthors);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000');
        const data = await response.json();
        const filteredData = await data.filteredData
        const departments = await data.resolvedData
        setResultData(filteredData)
        setGroup(departments);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

//   useEffect(() => {
//     const fetchGroup = async () => {
//       try {
//         const response = await fetch('http://localhost:5000');
//         const result = await response.json();
//         setGroup(result);
//       } catch (error) {
//         console.error('Error fetching group data:', error);
//       }
//     };
//     fetchGroup();
//   }, [resultData]);

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
        setTitleData(titleData)
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
                          </tr>
                          ${tableRows2.join('')}
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
      <h2 id="heading">Trending Articles</h2>
      <div id='topPerformingArticles'>
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Views</th>
                </tr>
            </thead>
            <tbody>
                {titleData.map((article, index) => (
                    <tr key={index}>
                        <td><a href={article.url} style={{ textDecoration: 'none', color: 'black' }}>{article.title}</a></td>
                        <td>
                            {expandedAuthors[index] || article.author.join(', ').length <= 100
                                ? `${article.author.join(', ')}`
                                : `${article.author.join(', ').substring(0, 100)}`}
                            {article.author.join(', ').length > 100 && (
                                <i><a className="toggle-text" onClick={() => toggleAuthor(index)}>
                                    {expandedAuthors[index] ? '...Less' : '...More'}
                                </a></i>
                            )}
                        </td>
                        <td>{article.views}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
      <h2 id="heading">Top Countries by Views</h2>
      <div id="topCountriesByViews"></div>
    </div>
  );
}

export default App;