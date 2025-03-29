
import express from 'express';
import pool from '../../db/database';
import { CountyEVData } from '../../types';

const router = express.Router();
const dol ='dol_vehicle_id';
const vin ='vin';
// Get county with most EVs and charging stations
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT
        v.county,
        COUNT(v.${dol}) AS total_evs,
        s.no_of_ev_charging_stations AS charging_stations
      FROM
        vehicles v
      JOIN
        stations s ON v.county = s.county
      GROUP BY
        v.county, s.no_of_ev_charging_stations
      ORDER BY
        total_evs DESC, s.no_of_ev_charging_stations DESC
      LIMIT 1;
    `;
    
    const result = await pool.query(query);
    
    if (result.rows && result.rows.length > 0) {
      const countyData: CountyEVData = {
        county: result.rows[0].county,
        totalEvs: parseInt(result.rows[0].total_evs),
        chargingStations: parseInt(result.rows[0].charging_stations)
      };
      
      // Set proper headers
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      return res.status(200).json({
        success: true,
        data: countyData
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'No data found'
      });
    }
  } catch (error) {
    console.error('Error fetching county EV data:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching county EV data'
    });
  }
});

export default router;
