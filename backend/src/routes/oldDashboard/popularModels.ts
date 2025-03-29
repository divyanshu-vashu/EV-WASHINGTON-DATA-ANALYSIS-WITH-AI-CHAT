
import express from 'express';
import pool from '../db/database';
import { PopularModelData } from '../types';

const router = express.Router();

// Get top 5 most popular EV models in counties with over 100 charging stations
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT
        v.make,
        v.model,
        COUNT(v.vin) AS count
      FROM
        vehicles v
      JOIN
        stations s ON v.county = s.county
      WHERE
        s.no_of_ev_charging_stations > 100
      GROUP BY
        v.make, v.model
      ORDER BY
        count DESC
      LIMIT 5;
    `;
    
    const result = await pool.query(query);
    
    if (result.rows.length > 0) {
      const modelsData: PopularModelData[] = result.rows.map(row => ({
        make: row.make,
        model: row.model,
        count: parseInt(row.count)
      }));
      
      res.json({ success: true, data: modelsData });
    } else {
      res.json({ success: false, message: 'No data found' });
    }
  } catch (error) {
    console.error('Error fetching popular models data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
