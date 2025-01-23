const express = require('express');
const mongoose=require("mongoose");
const app = express()
app.use(express.json());      //middle ware which is used to pass the data
// import {v4 as uuidv4} from 'uuid';
const {v4:uuidv4}=require('uuid');


mongoose.connect("mongodb+srv://sathanard2023cse:sathu_2828@cluster0.7wxev.mongodb.net/expenses").then(()=>{
console.log("Connected to MongoDB");   //database connection
});


const expenseSchema=new mongoose.Schema({ // creating the schema using this we can create the model
    id:{type:String,required:true,unique:true},
    title:{type:String,required:true},
    amount:{type:String,required:true},
})

const Expense=mongoose.model("Expense",expenseSchema); // creating the model for the schema


 app.get("/api/expenses" , async(req,res)=>{
    try{
    const expenses=await Expense.find();
    if(!expenses){
    res.status(404).send({message:"no express found"});
    }
    res.status(200).json(expenses);
}catch(error){
    res.status(500).json({message:"Internal Server Error"});
}
});


app.get('/api/expenses' , (req,res)=>{
    //console.log(req.query)
    res.status(200).json(expenses); 
});


// get - parameter(used for getting single data,only one data is sent) -> '/:' , query(to get multiple data,multiple data is sent)-> '?'
app.get('/api/expenses/:id' , async(req,res)=>{
    const {id} = req.params;//destructuring
    // console.log(id)
    const expense = await Expense.findOne({id});
    if(!expense){
        res.status(404).json({message:"Not found"});
        return;
    }
    res.status(200).json(expense)
});

app.post("/api/expenses",async(req,res)=>{ //sending the data through post method
    try{
    const{title,amount}=req.body;
    
    if(!title || !amount){
        res.status(400).json({message:"Provide both title and amount"});
    }
    const newExpense=new Expense({
        id:uuidv4(),
        title:title,

        amount:amount 
    })
    const savedExpense=await newExpense.save()
    res.status(201).json(savedExpense)
}catch(error){
    res.status(500).json({message:"Internal server error",error:error.message});
}
});

app.delete("/api/expenses/:id",async(req,res)=>{
    const {id}=req.params;
    try{
        const deletedExpense=await Expense.findOneAndDelete({id})
        if(!deletedExpense){
            res.status(404).json({message:"Expense not found"})
            return
        }
        res.status(200).json({message:"Deleted successfully"})
    }catch(error){
res.status(500).json({message:"Internal server error"});
    }
});

app.put("/api/expenses/:id", async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;    
    try {
        const updatedExpense = await Expense.findOneAndUpdate({id },updateData,{ new: true });    
        if (!updatedExpense) {
            return res.status(404).json({ message: "Expense not found" });
        }    
        res.status(200).json(updatedExpense);
    } catch (error) {
        res.status(500).json({ message: "Error updating expense", error: error.message });
    }
});

app.listen(3000,()=>{
    console.log("server is running");
});