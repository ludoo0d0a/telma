# SNCF API Explorer

This is a React application that serves as an explorer for the SNCF API. It allows users to search for train schedules, view real-time information, and explore the various features of the SNCF API.

## Features

- Search for train schedules between two stations
- View real-time departure and arrival information
- Explore the different API endpoints and their responses
- Responsive design for mobile and desktop

## Tech Stack

- React
- Vite
- TypeScript
- Bulma CSS
- Leaflet (for maps)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ludooo0d0a/api-sncf.git
   ```
2.  Navigate to the project directory:
    ```bash
    cd api-sncf
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```
4.  Create a `.env` file in the root of the project and add your SNCF API key:
    ```bash
    cp .env.example .env
    ```
    Then, edit the `.env` file to add your API key:
    ```
    SNCF_API_KEY="your_sncf_api_key_here"
    ```
### Running the Application
To run the application, you need to start both the proxy server and the Vite development server.

1.  Start the proxy server:
    ```bash
    node proxy-server.cjs
    ```
2.  In a separate terminal, start the Vite development server:
    ```bash
    npm start
    ```
The application will be available at http://localhost:5173.
