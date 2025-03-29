
import express from 'express';
import pool from '../db/database';
import { EVRatioData } from '../types';

const router = express.Router();

// Get top 3 counties with highest EV-to-charging station ratio
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT
        v.county,
        COUNT(v.vin) AS total_evs,
        s.no_of_ev_charging_stations AS charging_stations,
        CAST(COUNT(v.vin) AS REAL) / s.no_of_ev_charging_stations AS ratio
      FROM
        vehicles v
      JOIN
        stations s ON v.county = s.county
      GROUP BY
        v.county, s.no_of_ev_charging_stations
      ORDER BY
        ratio DESC
      LIMIT 3;
    `;
    
    const result = await pool.query(query);
    
    if (result.rows.length > 0) {
      const ratioData: EVRatioData[] = result.rows.map(row => ({
        county: row.county,
        totalEvs: parseInt(row.total_evs),
        chargingStations: parseInt(row.charging_stations),
        ratio: parseFloat(row.ratio)
      }));
      
      res.json({ success: true, data: ratioData });
    } else {
      res.json({ success: false, message: 'No data found' });
    }
  } catch (error) {
    console.error('Error fetching EV ratio data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
