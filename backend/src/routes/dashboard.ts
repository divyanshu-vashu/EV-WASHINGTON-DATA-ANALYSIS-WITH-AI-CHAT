
import express from 'express';
import pool from '../db/database';
import { BrandComparisonData } from '../types';
import { EVRatioData } from '../types';
import { CountyEVData } from '../types';
import { PopularModelData } from '../types';
const router = express.Router();

// Get popularity of Tesla vs other brands in county with most charging infrastructure
router.get('/brand-comparison', async (req, res) => {
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


const dol ='dol_vehicle_id';
const vin ='vin';
// Get county with most EVs and charging stations
router.get('/county-ev', async (req, res) => {
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

router.get('/ev-ratio', async (req, res) => {
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

  router.get('/popular-models', async (req, res) => {
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
