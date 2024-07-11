const bodyParser = require('body-parser')
const express=require('express')
const app=express()
const mongoose=require('mongoose')
const jwt=require('jsonwebtoken')
const authentication=require('./middleware/authentication')
const cors=require('cors')
const secretKey = 'joshua';
const bcrypt=require('bcryptjs')
const {UserData}=require('./model/schema')


app.use(bodyParser.json())
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
const sendmail=require('./model/sendmail')
const res = require('express/lib/response')

try{
    app.get("/",(req,res)=>{
        res.send("<h>hello</h>")
    })
    
    app.post('/userregister',async(req,res)=>{
        try{
            const email=req.body.email;
            const password=req.body.password;
            const name=req.body.name
            const number=req.body.number;
            const address=req.body.address;

            console.log(password)
            
            let check=await UserData.findOne({user_email:email})
    
            if(check){
                res.status(404).json({message:"User Already Existed"})
    
            }else{
                const saltRounds=10;
                const hashedPassword=await bcrypt.hash(password, saltRounds)
    
                const user=new UserData({
                    user_email:email,
                    user_eame: name,
                    user_number:number,
                    password:hashedPassword,
                    address:address
                
                })
    
                console.log("User data inserted")
                
                user.save()
                .then(result=>{
                    console.log("user data saved")
                    let mailOptions={
                        from:{
                            name:'Joshua',
                            address:'joshua00521202021@msijanakpuri.com'
                        },
                        to:email,
                        subject:'Registration Complete',
                        text:'Registration Complete',
                        html:`<b>Welcome! User ${name}<br> Thank you For Registering With Us<br></b>`
                              }
                      sendmail(mailOptions)
                    res.status(200).json({message:'user Registered, Check for a mail'})
                })
                .catch(error=>{
                    console.log(error)
                    res.status(404).json({message:error})
                })
            }
    
    
        }catch(error){
            console.log(error)
            res.status(404).json({error})
        }
    })
    
    
    app.post("/forgotpassword",async(req,res)=>{
        try{
            const email=req.body.email;
    
            const check=await UserData.findOne({user_email:email})
    
            if(!check){
                res.status(404).json({message:"No Such User Exist"})
            }
            const otp=Math.floor(Math.random() * 900000) + 100000;

            check.resetotp=otp;
            check.resettime=Date.now() + 3600000;
            await check.save()

            let mailOptions={
                from:{
                    name:'Joshua',
                    address:'joshua00521202021@msijanakpuri.com'
                },
                to:email,
                subject:'One Time Password',
                text:'Passsword OTP',
                html:`<b>Dear User ${email}<br> Your OTP for Password reset is<ul> ${otp}</ul> </b>`
                      }
                sendmail(mailOptions)
                res.status(202).json({message:`your otp for password reset has been send to your registered email`})
    
    
    
    
        }catch(error){
            console.log(error)
            res.status(404).json({error})
        }
    })


    app.post('/resetpassword',async(req,res)=>{
        try{
            const email=req.body.email;
            const otp=req.body.otp;
            const newpassword=req.body.newpassword;

            result=await UserData.findOne({user_email:email})
           

            if(result){
                console.log(result,"1")
                if(result.resetotp==otp){
                    const saltRounds=10;
                    const hashedPassword=await bcrypt.hash(newpassword, saltRounds);
                    console.log("hashed",hashedPassword)

                    result.password=hashedPassword;
                    result.resetotp=undefined;
                    
                    await result.save()

                    let mailOptions={
                        from:{
                            name:'Joshua',
                            address:'joshua00521202021@msijanakpuri.com'
                        },
                        to:email,
                        subject:'Password reset',
                        text:'Reset password',
                        html:`<b>Dear User ${email}<br> Your password has been reset successfully </b>`
                              }
                        sendmail(mailOptions)



                }else{
                    res.status(400).json({message:"OTP IS INCORRECT"})
                }
                res.status(202).json({message:"Password reset successfully"})
            }else{
                res.status(404).json({message:"NO USER FOUND"})
            }

        }catch(error){
            console.log("here")
            console.log(error)
            res.status(404).json({error:error})

        }
    })
    
    app.post("/login",async(req,res)=>{
        try{
    
            const email=req.body.email;
            const password=req.body.password;
           
    
            let result=await UserData.findOne({user_email:email})
            console.log(result)
            if(result){
                console.log("user found")
                
            let passwordcompare=await bcrypt.compare(password,result.password)
    
            if(passwordcompare){
                console.log(passwordcompare)
    
                const userPayload={
                    name:result.user_name,
                    email:result.user_email
                }
                
                const token = jwt.sign(userPayload, secretKey);
                console.log("3)Token signed");
                res.status(200).json({token})
    
            }else{
                console.log("password incorrect")
                res.status(401).json({message:"Password incorrect"})
                
            }
            
            }else{console.log('user not found')
                res.status(401).json({message:'User Not Found'})
            }
    
    
        }catch(error){
            console.log(error)
            res.status(404).json({error})
        }
    })
    
    console.log("woriking")
}catch(error){
    console.log(error)
    res.status(404).json({error})
}


app.get('/getuserdata',authentication,async(req,res)=>{
    try{
        let email=req.userdetail.email;

        const result=await UserData.findOne({user_email:email})

        if(!result){
            res.status(404).json({message:"failed to get data"})
        }

        res.status(202).json({result})


    }catch(error){
        res.status(404).json({message:error})
    }
})

app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
  })