const API_URL = 'http://localhost:3000/data'; // Backend URL
const API_URL1 = 'http://localhost:3000/last7days'; // Backend URL
let chart; // Line chart
let gaugeCharts = {}; // Gauge charts

// Function to create a line chart
function createChart() {
    const ctx = document.getElementById('dataChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Time labels
            datasets: [
                {
                    label: 'PM2.5 (%)',
                    data: [],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'AQI',
                    data: [],
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Dust Density (%)',
                    data: [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Values'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// Function to create a gauge chart
function createGaugeChart(ctx, label, maxValue) {
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [label, ''],
            datasets: [{
                data: [0, maxValue], // Current value and remaining
                backgroundColor: ['rgba(54, 162, 235, 1)', 'rgba(230, 230, 230, 0.5)'],
                borderWidth: 0,
                circumference: 180, // Half-circle
                rotation: -90 // Start from the bottom
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                tooltip: { enabled: false }
            },
            cutout: '75%', // Inner radius to make it look like a gauge
        }
    });
}

// Initialize gauge charts
function initializeGaugeCharts() {
    const pm25Ctx = document.getElementById('pm25Gauge').getContext('2d');
    const aqiCtx = document.getElementById('aqiGauge').getContext('2d');
    const dustDensityCtx = document.getElementById('dustDensityGauge').getContext('2d');

    gaugeCharts.pm25 = createGaugeChart(pm25Ctx, 'PM2.5', 100); // PM2.5: max 100
    gaugeCharts.aqi = createGaugeChart(aqiCtx, 'AQI', 500); // AQI: max 500
    gaugeCharts.dustDensity = createGaugeChart(dustDensityCtx, 'Dust Density', 100); // Dust Density: max 100
}

// Update the gauge charts with the new data
function updateGaugeCharts(data) {
    gaugeCharts.pm25.data.datasets[0].data[0] = data.pm25;
    gaugeCharts.pm25.update();

    gaugeCharts.aqi.data.datasets[0].data[0] = data.aqi;
    gaugeCharts.aqi.update();

    gaugeCharts.dustDensity.data.datasets[0].data[0] = data.dust_density;
    gaugeCharts.dustDensity.update();

    // Update displayed values
    document.getElementById('pm25Value').innerText = `${data.pm25}`;
    document.getElementById('aqiValue').innerText = `${data.aqi}`;
    document.getElementById('dustDensityValue').innerText = `${data.dust_density}`;
}

// Fetch data from the backend
async function fetchData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

       // Update metrics
        document.getElementById('pm25Value').innerText = data.pm25 + '%';
        document.getElementById('aqiValue').innerText = data.aqi;
        document.getElementById('dustDensityValue').innerText = data.dust_density + '%';

        // Update line chart and gauge charts
        updateChart(data);
        updateGaugeCharts(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Update the line chart with new data
function updateChart(data) {
    const currentTime = new Date().toLocaleTimeString();

    // Add new data to the chart
    if (chart) {
        chart.data.labels.push(currentTime);
        chart.data.datasets[0].data.push(data.pm25);
        chart.data.datasets[1].data.push(data.aqi);
        chart.data.datasets[2].data.push(data.dust_density);

        // Keep only the last 10 data points
        if (chart.data.labels.length > 10) {
            chart.data.labels.shift();
            chart.data.datasets.forEach(dataset => dataset.data.shift());
        }

        chart.update();
    }
}


async function fetchLast7DaysData() {
    try {
        const response = await fetch(API_URL1);
        const data = await response.json();

        const labels = data.map(entry => entry.date);
        const avgPm25 = data.map(entry => entry.avgPm25 || 0); // Use 0 for missing data
        const avgAqi = data.map(entry => entry.avgAqi || 0);
        const avgDustDensity = data.map(entry => entry.avgDustDensity || 0);

        renderBarChart(labels, avgPm25, avgAqi, avgDustDensity);
    } catch (error) {
        console.error('Error fetching 7 days data:', error);
    }
}

function renderBarChart(labels, pm25Data, aqiData, dustDensityData) {
    const ctx = document.getElementById('barChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'PM2.5',
                    data: pm25Data,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'AQI',
                    data: aqiData,
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Dust Density',
                    data: dustDensityData,
                    backgroundColor: 'rgba(255, 159, 64, 0.6)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

// Call the function to fetch data and render the chart



// Initialize the charts and fetch data periodically
initializeGaugeCharts();
createChart();
renderBarChart();
setInterval(fetchData, 3000);
fetchData(); // Initial fetch
fetchLast7DaysData();