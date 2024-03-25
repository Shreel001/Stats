import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import './styles.css';

function App() {
  const [resultData, setResultData] = useState(null);
  const [group, setGroup] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [defaultSelection, setDefaultSelection] = useState('Toronto Metropolitan University');
  const [countriesData, setCountriesData] = useState([]);
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
        setGroup(departments)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (resultData) {
      // Store data for the selected department
      if (selectedDepartment) {
        const data = resultData[selectedDepartment];
        dataSelection(data)
      }

      if (selectedFaculty && !selectedDepartment){
        const data = resultData[selectedFaculty];
        dataSelection(data)
      }

      if(!selectedFaculty && !selectedDepartment){
        const data = resultData[defaultSelection]
        dataSelection(data)
      }
     
      function dataSelection(data){
          // Store data in variables
        const viewsData = data.views;
        const downloadsData = data.downloads;
        const topCountriesObject = data.topCountriesByViews;
        const topCountriesArray = Object.entries(topCountriesObject)
        setCountriesData(topCountriesArray)
        console.log(topCountriesArray)
        const titles = data.topPerformingArticle;
        setTitleData(titles)
        console.log(titleData)
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

        const table3 = `<table>
                            <tr>
                                <th>Parameter</th>
                                <th>Value</th>
                            </tr>
                            <tr>
                                <td>Total Number of Views</td>
                                <td>${totalViews}</td>
                            </tr>
                            <tr>
                                <td>Total Number of Downloads</td>
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
                backgroundColor: '#2E4053',
                borderWidth: 1,
              },
              {
                label: 'Downloads',
                data: downloadsData,
                backgroundColor: '#AEB6BF',
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

  useEffect(() => {
    const loadGoogleCharts = async () => {
      if (typeof window.google === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/charts/loader.js';
        script.onload = () => {
          window.google.charts.load('current', {
            'packages': ['geochart'],
          });
          window.google.charts.setOnLoadCallback(drawRegionsMap);
        };
        document.body.appendChild(script);
      } else {
        window.google.charts.load('current', {
          'packages': ['geochart'],
        });
        window.google.charts.setOnLoadCallback(drawRegionsMap);
      }
    };

    loadGoogleCharts();

    return () => {
      const elements = document.querySelectorAll('script[src="https://www.gstatic.com/charts/loader.js"]');
      elements.forEach(el => el.remove());
    }
  }, [countriesData]);

  const drawRegionsMap = () => {
    const data = window.google.visualization.arrayToDataTable([
        ['Country', 'Popularity'],
        ...countriesData.map(([country, popularity]) => [country, popularity])
    ]);

    // Set colors in options object
    const options = {
        colorAxis: {
            colors: ['#808B96', '#2C3E50']
        },
        backgroundColor: '#d9d9d9',
        datalessRegionColor: '#ffffff'
    };

    const chart = new window.google.visualization.GeoChart(document.getElementById('regions_div'));

    chart.draw(data, options);
};


  const handleFacultyChange = (e) => {
    setSelectedFaculty(e.target.value);
    setSelectedDepartment('');
    setDefaultSelection('Toronto Metropolitan University')
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  return (
      <>
        <head>
          <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
        </head>
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
          <h2 id="heading">Global engagement</h2>
          <body>
            <div id="regions_div" style={{ width: '900px', height: '500px', marginTop: '10px' }}></div>
          </body>
          <h2 id="heading">Total views and downloads</h2>
          <div id="totals"></div>
          <h2 id="heading">Past 6 months overview</h2>
          <canvas id="myChart"></canvas>
          <div id='trendingArticles' style={{ display: titleData.length ? 'block' : 'none' }}>
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
          </div>       
        </div>
      </>
  );
}

export default App;