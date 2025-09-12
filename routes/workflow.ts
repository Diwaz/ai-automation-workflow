import express from 'express';
import { prismaClient } from '../prisma';

const router = express.Router();


router.get('/',(req,res)=>{
    
    res.status(200).json({
        message: "Empty Workflow"
    })
});






export default router;