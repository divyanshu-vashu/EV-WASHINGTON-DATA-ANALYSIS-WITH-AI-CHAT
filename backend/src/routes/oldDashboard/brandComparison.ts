
import express from 'express';
import pool from '../db/database';
import { BrandComparisonData } from '../types';

const router = express.Router();

// Get popularity of Tesla vs other brands in county with most charging infrastructure
router.get('/', async (req, res) => {
  try {
    const query = `
      WITH CountyWithMaxStations AS (
        SELECT county
        FROM stations
        ORDER BY no_of_ev_charging_stations DESC
        LIMIT 1
      )
      SELECT
        v.make,
        COUNT(v.vin) AS count
      FROM
        vehicles v
      WHERE
        v.county = (SELECT county FROM CountyWithMaxStations)
      GROUP BY
        v.make
      ORDER BY
        count DESC;
    `;
    
    const result = await pool.query(query);
    
    if (result.rows.length > 0) {
      const brandData: BrandComparisonData[] = result.rows.map(row => ({
        make: row.make,
        count: parseInt(row.count)
      }));
      
      res.json({ success: true, data: brandData });
    } else {
      res.json({ success: false, message: 'No data found' });
    }
  } catch (error) {
    console.error('Error fetching brand comparison data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
