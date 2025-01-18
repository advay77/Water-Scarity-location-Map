let map;
let marker;

function initMap() {
    map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

async function searchLocation() {
    const locationInput = document.getElementById('location').value;
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationInput)}`);
        if (response.data && response.data.length > 0) {
            const { lat, lon } = response.data[0];
            updateMap(lat, lon);
            fetchPollutedAreas(lat, lon);
            fetchWeather(lat, lon);
        } else {
            alert('Location not found. Please try again.');
        }
    } catch (error) {
        console.error('Error fetching location:', error);
        alert('An error occurred while fetching the location.');
    }
}

function updateMap(lat, lon) {
    if (marker) {
        map.removeLayer(marker);
    }
    map.setView([lat, lon], 10);
    marker = L.marker([lat, lon]).addTo(map);
}

async function fetchPollutedAreas(lat, lon) {
    try {
        const response = await axios.post('/api/polluted-areas', { lat, lon });
        response.data.forEach(location => {
            L.circle([location.location.coordinates[1], location.location.coordinates[0]], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5,
                radius: 1000
            }).addTo(map).bindPopup(`
                <strong>${location.name}</strong><br>
                Pollution Type: ${location.pollutionType}<br>
                Severity: ${location.severity}<br>
                ${location.description}
            `);
        });
    } catch (error) {
        console.error('Error fetching polluted areas:', error);
    }
}

async function fetchWeather(lat, lon) {
    try {
        const response = await axios.post('/api/weather', { lat, lon });
        const weatherInfo = document.getElementById('weather-info');
        weatherInfo.innerHTML = `
            <h3>Current Weather</h3>
            <p>Temperature: ${response.data.current.temperature}°C</p>
            <p>Humidity: ${response.data.current.humidity}%</p>
            <p>Description: ${response.data.current.weather_descriptions.join(', ')}</p>
        `;
    } catch (error) {
        console.error('Error fetching weather:', error);
    }
}

async function submitNewLocation() {
    const name = document.getElementById('new-location-name').value;
    const pollutionType = document.getElementById('pollution-type').value;
    const severity = document.getElementById('pollution-severity').value;
    const description = document.getElementById('new-location-description').value;
    
    if (!name || !pollutionType || !severity || !description) {
        alert('Please fill in all fields');
        return;
    }
    
    try {
        const response = await axios.post('/api/submit-location', {
            name,
            type: 'pollution',
            pollutionType,
            severity,
            description,
            location: {
                type: 'Point',
                coordinates: [marker.getLatLng().lng, marker.getLatLng().lat]
            }
        });
        alert('Polluted area submitted successfully');
        // Refresh the map
        fetchPollutedAreas(marker.getLatLng().lat, marker.getLatLng().lng);
    } catch (error) {
        console.error('Error submitting location:', error);
        alert('An error occurred while submitting the polluted area.');
    }
}

window.onload = initMap;

