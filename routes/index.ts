import express from 'express';
import workflowRoutes from './workflow';
import { prismaClient } from '../prisma';

const router = express.Router();



router.use('/workflow',workflowRoutes)

router.post('/signup', async (req, res) =>{
    const {username,password} = req.body;
    console.log('username',username,password)
    if (!username || !password){
        res.status(400).json({
            error:"Invalid username and password"
        })
    }
    try {
    const user = await prismaClient.user.create({
        data:{
            username,
            password
        }
    })
    console.log("response creating user",user);
 
    }catch(err){
    res.status(404).json({
            message:err
        })

    }
   
        res.status(200).json({
        message:"user registered successfully"
    })
})
router.post('/signin',async (req,res)=>{
    const {username,password} = req.body;
    try{
    const user = await prismaClient.user.findUnique({
        where:{
            username
        }
    })
        if (!user){
    res.status(400).json({
            message:"User not found"
        }) 
 
        }
    }catch(err){
        res.status(404).json({
            error: err
        })
   }
        res.status(200).json({
        message:"user logged in !!"
    })
})
export default router;