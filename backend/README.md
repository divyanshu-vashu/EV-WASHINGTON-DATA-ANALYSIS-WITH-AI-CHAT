
# EV Data Visualization Backend

This is the backend server for the EV Data Visualization application. It provides API endpoints that query a PostgreSQL database to retrieve data for visualization on the frontend.

## Database Connection

The application connects to a PostgreSQL database with the following connection string:
```
postgresql://admin:admin@localhost:5431/appointy
```

## API Endpoints

- `GET /api/county-ev`: Returns the county with the most EVs and charging stations
- `GET /api/ev-ratio`: Returns the top 3 counties with the highest EV-to-charging station ratio
- `GET /api/popular-models`: Returns the top 5 most popular EV models in counties with over 100 charging stations
- `GET /api/brand-comparison`: Returns the popularity of Tesla vs other brands in the county with the most charging infrastructure

## Development

1. Install dependencies:
```
npm install
```

2. Start the development server:
```
npm run dev
```

3. Build for production:
```
npm run build
```

4. Start production server:
```
npm start
```
