
import express from 'express';
import pool from '../db/database';


const router = express.Router();


router.post('/', async (req, res) => {
  try {
    const { query } = req.body;

    if(!query) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    if(query.trim()===''){
      return res.status(400).json({ success: false, message: 'Query cannot be empty' });
    }

    const result = await pool.query(query);

    if (result.rows.length > 0) {
      res.json({ success: true, data: result.rows ,rowCount:result.rowCount  });
    } else{
      res.json({success: true, 
        data: [],
        message: 'Query executed successfully but no results found'  });
    }
  } catch(error) {
    console.error('Error executing query:', error);
    res.status(500).json({ success: false, 
        message: 'Error executing query',
        error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
