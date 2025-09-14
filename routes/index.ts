import express from 'express';
import workflowRoutes from './workflow';
import { prismaClient } from '../prisma';


const router = express.Router();



router.use('/workflow',workflowRoutes)

router.post('/credential',async (req,res)=>{
    const {userId, provider , apiKey,title} = req.body;
    if (!userId || !provider || !apiKey || !title){
        res.status(404).json({
            message:"Invalid input"
        })
    }
    try {
    const response = await prismaClient.credential.create({
        data:{
            provider,
            apiKey,
            userId,
            title
        }
    })
        console.log("response from creating creds",response);
        res.status(200).json({
            message:"Credentials created successfully"
        })
        
    }catch(err){
        res.status(400).json({
            error:err
        })
    }
})
router.get('/credentials',async (req,res)=>{
    const {userId} = req.body;
    if (!userId){
        res.status(400).json({
            message:"invalid user id"
        })
    }
    try {
        const user = await prismaClient.user.findUnique({
            where:{
                id: userId
            }
        })
        if (!user){
            res.status(404).json({
                message:"unable to find user"
            })
        }
    const response = await prismaClient.credential.findMany({
        where:{
            userId
        }
    })
    if (!response){
        res.status(400).json({
            error:"something went wrong"
        })
    }
    console.log("response from get creds",response);
    res.status(200).json({
        message:response
    })
    
    }catch (err){
        res.status(404).json({
            error:err
        })
    }
})
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
    // console.log("resp from sing in ",user)
        if (!user){
    res.status(400).json({
            message:"User not found"
        }) 
    }
  res.status(200).json({
        message:"user logged in ",
        id: user.id
    })
    }catch(err){
        res.status(404).json({
            error: err
        })
   }
     
})
export default router;