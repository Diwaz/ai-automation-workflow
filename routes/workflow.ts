import express from 'express';
import { prismaClient } from '../prisma';

const router = express.Router();

router.post('/get',async (req,res)=>{
    const {userId}= req.body;
    if (!userId){
        res.status(400).json({
            message:"invalid user id"
        })
    }
    try {
    const response =await prismaClient.workflow.findMany({
        where:{
            userId
        }
    }) 
    res.status(200).json({
        message:response
    })
    }catch(err){
        res.status(400).json({
            error:err
        })
    }

})
router.post('/',async (req,res)=>{
   const {title, enabled, nodes,connections,userId} = req.body;

   if (!title || !enabled || !nodes || !connections){
    res.status(404).json({
        message:"invalid input"
    })
} 
try {

const response = await prismaClient.workflow.create({
    data:{
        title,
        enabled,
        nodes,
        connections,
        userId
    }
})
console.log("response from workflpw",response);
 
}catch(err){
    res.status(400).json({
        error:err
    })
}
  
    res.status(200).json({
        message: "Workflow created"
    })
});






export default router;