const express = require('express');
const router = express.Router();
const vendor = require('../services/vendor');


router.post('/add', async function(req,res,next){
  try{
    res.json(await vendor.AddVendor(req.body));
  }catch(er){
    console.log(`Error adding the vendor -> ${er}`);
    next(er);
  }
});

router.post('/getvendor', async function(req,res,next){
  try{
   res.json(await vendor.GetVendor(req.body));
  }catch(er){
   console.log(`Error getting the vendor -> ${er}`);
   next(er);
  }
});

module.exports = router;