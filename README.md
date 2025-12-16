# API-SNCF - Horaires des trains en direct

A React-based web application for viewing real-time train schedules and information from the SNCF (French National Railway Company) API. This application provides an intuitive interface to explore train stations, departures, arrivals, journeys, and various other SNCF API endpoints.

![20240110111513](https://github.com/GuillaumeSere/api-sncf/assets/75996200/02b43094-0dfa-4aea-ae8a-9af003d440c4)

![20240216231216](https://github.com/GuillaumeSere/api-sncf/assets/75996200/a136cab1-de45-4f2f-9bdc-ba851845e75a)

![20240216231235](https://github.com/GuillaumeSere/api-sncf/assets/75996200/65a2739d-708a-4985-b887-8be8d811312c)

## 🌐 Live Demo

Visit the live application: [https://guillaumesere.github.io/api-sncf/](https://guillaumesere.github.io/api-sncf/)

## ✨ Features

- **Real-time Train Information**: View departures and arrivals for any train station
- **Journey Planning**: Search for journeys between different locations
- **Station Explorer**: Browse train stations by city with detailed information
- **Commercial Modes**: Explore different transportation modes available
- **Coverage Areas**: View coverage information for different regions
- **Places Search**: Find train stations and places
- **Lines Information**: View train line details
- **Isochrones**: Visualize travel time zones from specific locations
- **Reports**: Access detailed train reports
- **Interactive API Documentation**: Built-in Swagger UI for API exploration
- **Special Routes**: Dedicated pages for specific routes (Metz-Bettembourg, Metz-Thionville)

## 🛠️ Technologies

- **React** 18.2.0
- **React Router DOM** 6.4.4
- **Axios** for API calls
- **SCSS/Sass** for styling
- **Bulma** CSS framework
- **Swagger UI React** for API documentation
- **React Lottie Player** for animations
- **React Snowfall** for seasonal effects

## 📋 Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn
- SNCF API key ([Get one here](https://www.sncf-connect.com/partenaire))

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/GuillaumeSere/api-sncf.git
cd api-sncf
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
touch .env
```

4. Add your SNCF API key to the `.env` file:
```env
REACT_APP_API_KEY=your_api_key_here
```

**Note**: The API key should be prefixed with your authentication method. For example:
```env
REACT_APP_API_KEY=Basic your_base64_encoded_credentials
```
or
```env
REACT_APP_API_KEY=Bearer your_token
```

## 🎯 Usage

### Development

Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

### Build

Create a production build:
```bash
npm run build
```

### Deploy

Deploy to GitHub Pages:
```bash
npm run deploy
```

Deploy to Vercel:
```bash
npm run vercel-build
```

## 📁 Project Structure

```
api-sncf/
├── public/              # Static assets and OpenAPI specification
│   ├── images/         # Station images
│   └── openapi.json    # API documentation
├── src/
│   ├── components/     # Reusable React components
│   │   ├── Arrivals.jsx
│   │   ├── CityCard.jsx
│   │   ├── Departures.jsx
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── TrainStation.jsx
│   ├── pages/          # Page components
│   │   ├── Home.jsx
│   │   ├── City.jsx
│   │   ├── Journeys.jsx
│   │   ├── Schedules.jsx
│   │   └── SwaggerUI.jsx
│   ├── services/       # API service layer
│   │   └── sncfApi.js  # SNCF API wrapper functions
│   └── styles/         # SCSS stylesheets
└── package.json
```

## 🔑 API Configuration

This application uses the SNCF Connect API (formerly known as SNCF Open Data API). All API calls are made to:
- Base URL: `https://api.sncf.com/v1`
- Default Coverage: `sncf`

The API key must be provided in the `Authorization` header for all requests.

## 🛣️ Available Routes

- `/` - Home page
- `/commercial-modes` - Commercial modes overview
- `/journeys` - Journey planning
- `/coverage` - Coverage areas
- `/places` - Places search
- `/schedules` - Schedule information
- `/reports` - Train reports
- `/lines` - Train lines
- `/isochrones` - Isochrone visualization
- `/api-docs` - Interactive API documentation (Swagger UI)
- `/metz-bettembourg` - Metz to Bettembourg route
- `/metz-thionville` - Metz to Thionville route
- `/:city` - City-specific station listings
- `/:city/:codeStation` - Individual station details with departures/arrivals

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project appears to be open source. Please check the repository for specific license information.

## 🙏 Acknowledgments

- [SNCF Connect API](https://www.sncf-connect.com/) for providing the train data
- All contributors and users of this project
