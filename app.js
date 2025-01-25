const express = require('express');
const mongoose=require("mongoose");
const app = express()
app.use(express.json());      //middle ware which is used to pass the data
// import {v4 as uuidv4} from 'uuid';
const {v4:uuidv4}=require('uuid');
const bcrypt=require("bcrypt")
const jwt = require("jsonwebtoken");
const cors=require('cors');
const authMiddleware=require("./middleware/auth");


app.use(express.json());
app.use(cors());


mongoose.connect("mongodb+srv://sathanard2023cse:sathu2828@cluster0.7wxev.mongodb.net/expenses").then(()=>{
console.log("Connected to MongoDB");   //database connection
});


const expenseSchema=new mongoose.Schema({ // creating the schema using this we can create the model
    id:{type:String,required:true,unique:true},
    title:{type:String,required:true},
    amount:{type:String,required:true},
})

const Expense=mongoose.model("Expense",expenseSchema); // creating the model for the schema

const userSchema=new mongoose.Schema({ // creating the schema using this we can create the model
    id:{type:String,required:true,unique:true},
    uname:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true}
})

const User=mongoose.model("User",userSchema);


 app.get("/api/expenses" , authMiddleware,async(req,res)=>{
    console.log(req.user)
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

app.post("/register",async(req,res)=>{
    const{email,uname,password}=req.body;
    try{
    const user=await User.findOne({email});
    if(user){
        return res.status(400).json({message:"Email alreday exists"});
    }
const hashedPassword=await bcrypt.hash(password,10);
const newUser=new User({
    id:uuidv4,
    email,
    uname,
    password :hashedPassword,
});
await newUser.save();
res.status(200).json({meassage:"User created successfully"});
    }
    catch(error){
        res.status(500).json({meassage:"Internal server error"});
    }
});
//Login

app.post("/login",async (req,res)=>{
    const{email,password}=req.body;
    try{
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invaild Email"});
        }

        const isValidPassword=await bcrypt.compare(password,user.password);

        if(!isValidPassword){
            return res.status(400).json({message:"Invaild Password"});
        }

        // CREATING A TOKEN WITH 3 ARGUMNETS 
        const token=jwt.sign({id:user.id},"my_secret",{expiresIn:"1h"});
        res.status(200).json({token});

    }
    catch(error){
        return res.status(500).json({message:"Internal server error"});
    }

});


app.get("/login", authMiddleware,async (req, res) => {
    console.log(req.user)
    const { email, password } = req.query; // Get email and password from query parameters
  
    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid Email" });
      }
  
      // Compare the entered password with the hashed password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid Password" });
      }
  
      // Create a token for the user if authenticated
      const token = jwt.sign({ id: user.id }, "my_secret", { expiresIn: "1h" });
  
      // Return a success response with the token
      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  

app.listen(3000,()=>{
    console.log("server is running");
});