import React, { useState, useEffect, useRef } from 'react';
// import Chart from 'chart.js/auto';
import './styles.css';
import Plotly from 'plotly.js-dist'

function App() {
  const [resultData, setResultData] = useState(null);
  const [group, setGroup] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [defaultSelection, setDefaultSelection] = useState('Toronto Metropolitan University');
  const [countriesData, setCountriesData] = useState([]);
  const [expandedAuthors, setExpandedAuthors] = useState([]);
  const [titleData, setTitleData] = useState([])

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
        const departments = await data.deptList
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
        const titles = data.topPerformingArticle;
        setTitleData(titles)
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

        const formattedLabels = mapToFormattedArray(labels)

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

        // Create new Chart instance
        var viewsTrace = {
          x: formattedLabels,
          y: viewsData,
          name: 'views',
          text: viewsData.map(String),
          type: 'bar',
          hovertemplate: '<b><i>Views</i>: %{y}<extra></extra></b>',
          textposition: 'auto',
          marker: {
            color: 'rgb(46, 64, 83)',
          }
        };
        
        var downloadsTrace = {
          x: formattedLabels,
          y: downloadsData,
          name: 'downloads',
          text: downloadsData.map(String),
          type: 'bar',
          hovertemplate: '<b><i>Downloads</i>: %{y}<extra></extra></b>',
          textposition: 'auto',
          hoverinfo: 'none',
          marker: {
            color: 'rgb(174, 182, 191)',
          }
        };
        
        var data = [viewsTrace, downloadsTrace];

        let width, height;
        if (window.innerWidth <= 768) {
          width = Math.min(window.innerWidth * 0.9, 500);
          height = Math.min(window.innerHeight * 0.5, 300);
          var layout = {
            barmode: 'group', 
            paper_bgcolor:'rgba(0,0,0,0)',
            plot_bgcolor:'rgba(0,0,0,0)',
            width: width,
            height: height,
            margin: {l: 30, r: 0, t: 0, b: 50},
            legend: { orientation: 'v', x: 0.7, y: 1.1, yanchor: 'bottom', traceorder: 'normal' },
            xaxis: {
              tickfont: { size: 8, bold: true }
            },
            yaxis: {
              tickfont: { size: 8, bold: true }
            },
            dragmode: false,
            selectdirection: 'h'
          };
        } else {
          width = Math.min(window.innerWidth * 0.9, 1275);
          height = Math.min(window.innerHeight * 0.6, 600);
          var layout = {
            barmode: 'group', 
            paper_bgcolor:'rgba(0,0,0,0)',
            plot_bgcolor:'rgba(0,0,0,0)',
            autosize: false,
            width: width,
            height: height,
            legend: { orientation: 'v', x: 0.9, y: 1.05, yanchor: 'bottom', traceorder: 'normal', font: { size: 15 } },
            dragmode: false,
            selectdirection: 'h'
          };
        }
        
        Plotly.newPlot('chart', data, layout, {displayModeBar: false});
        
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
        ['Country', 'Popularity', { role: 'tooltip', p: { html: true } }],
        ...countriesData.map(([country, popularity]) => {
            const logPopularity = Math.log10(popularity);
            return [country, logPopularity, `Popularity: ${popularity}`];
        })
    ]);

    const options = {
        colorAxis: {
            colors: [ '#DADADA', '#2E4053']
        },
        backgroundColor: 'skyblue',
        datalessRegionColor: '#ffffff',
        tooltip: { isHtml: true },
        legend: 'none',
        scale: 'log'
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
        <hr />
        <h2 id="heading">Global engagement</h2>
        <hr />
        <div className='map-container'>
          <div id="regions_div" className="map"></div>
        </div>
        <hr />
        <h2 id="heading">Total views and downloads</h2>
        <hr />
        <div className='totalData'>
          <div id="totals"></div>
        </div>
        <hr />
        <h2 id="heading">Past 6 months overview</h2>
        <hr />
        <div id='chart'></div>
        <div id='trendingArticles' style={{ display: titleData.length ? 'block' : 'none' }}>
          <hr />
          <h2 id="heading">Trending Articles</h2>
          <hr />
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
                    <td><a href={article.url} style={{ textDecoration: 'none', color: '#007ab6' }}>{article.title}</a></td>
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