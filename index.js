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
const {PostData}=require('./model/post')


app.use(bodyParser.json())
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
const sendmail=require('./model/sendmail')
const res = require('express/lib/response')

try{
    app.get("/",(req,res)=>{
        res.send(`
            <style>
            u{
            color:blue
            }

            body{
            background-color:black;
            color:white}
            </style><center><h1>ASSESMENT 1</h1></center><br>
            <h2><b>Note:-</b></h2>
            <h3><ul><li>User are request to use postman as shown in video</li>
            <li>Link for the video:- <a href='https://drive.google.com/file/d/1STNLcWuaqbqwbjmLh1mBWfAH5EeAkPyU/view?usp=sharing'>Link</a></li>
            <li>Since it is deployed on free instance(Render.io) it might take 60sec to get active </li>
            <li>Tech used
            <ol>
            <li>Node js(Express.js) for Framework</li>
            <li>Mongodb atlas for Database</li>
            <li>Nodemailer for mail service</li>
            <li>JWT for token</li>
            <li>bcrypt for encryption</li>
            <li>Render.io to deploy and host</li>
            
            </ol></li>
            <li>Process:-
            <ol><li>(POST) <u>/userregister</u> for register with input name,email,number,address,password (key names should be as mentioned)</li>
            <li>(POST) <u>/login</u> for login in with input email and password and if success it will generate a token </li> 
            <li>(GET) <u>/getuserdata</u> for Userdetail in with input email and token on the headers key name- authorization</li> 
            <li>(POST) <u>/forgotpassword</u> for forgot password in with input email and it will send an otp for password in your registered email </li> 
            <li>(POST) <u>/resetpassword</u> for password reset with email , otp and newpassword</li> 
            </li></ul></h3>

            </style><center><h1>ASSESMENT 2</h1></center><br>
             <h2><b>Note:-</b></h2>
             <h3><ul><li>Link for the video:- <a href='https://drive.google.com/file/d/1jdPo8gD4nnXrjYNSHXcbqnIAddcankUW/view?usp=sharing'>Link</a></li>
             <li>Update version of Assesment 1 with CRUD operation for post, comment and like</li>
             <li>Process:-
             <ol>
             <li>(POST) <u> /login</u> for login with email and passwsord and if success generates Token</li>
             <li>(POST) <u>/post</u> for making a POST copy the login token and input the post and token on the headers key name Authorization</li>
             <li>(GET) <u>/posts</u> for checking the post available</li>
             <li>(PUT) <u>/post/update</u> For making update on POST , with input new post , old postId and Token of User who made the post on the headers Authorization</li>
             <li>(DELETE) <u>/post/delete</u> For Deleting the POST ,with input PostId and the Logged in user token on Headers Authorization</li>
             <li>(POST) <u>/post/commet</u> For making Comment on a Post , input the PostID and Comment (From another account or by another profile)</li>
             <li>(POST) <u>/post/like</u> To Like a post , with input PostId of the post made by the users (From another account or by another profile)</li>
             </ol>
             </ul>





            `)
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
                    id: result._id,
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



app.post('/post',authentication, async(req,res)=>{
    try{
        const content = req.body.post;
        const user = req.userdetail.id;

        const post = new PostData({
            content,
            user
        });

        await post.save();
        res.status(201).json({ message: 'Post created successfully', post });



    }catch(error){
        res.status(404).json({message:error})
    }
})


app.get('/posts', async (req, res) => {
    try {
        const posts = await PostData.find().populate('user', 'user_name user_email').populate('comments.user', 'user_name user_email');
        if(!posts){
            res.json({message:"NO post available"})
        }
        res.status(200).json(posts);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/posts/:id', async (req, res) => {
    try {
        const post = await PostData.findById(req.params.id).populate('user', 'user_name user_email').populate('comments.user', 'user_name user_email');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//for updatingpost
app.put('/post/update', authentication, async (req, res) => {
    try {
        const content = req.body.post;
        const post = await PostData.findById(req.body.postid);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.user.toString() !== req.userdetail.id) {
            return res.status(403).json({ message: 'Unauthorized action' });
        }

        post.content = content;
        await post.save();
        res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
 // for deleting post
app.delete('/post/delete', authentication, async (req, res) => {
    try {
        
        const post = await PostData.findById(req.body.postid);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.user.toString() !== req.userdetail.id) {
            return res.status(403).json({ message: 'Unauthorized action' });
        }

        await PostData.findByIdAndDelete(req.body.postid);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

app.post('/post/like', authentication, async (req, res) => {
    try {
        const post = await PostData.findById(req.body.postid);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.likes.includes(req.userdetail.id)) {
            return res.status(400).json({ message: 'You already liked this post' });
        }

        post.likes.push(req.userdetail.id);
        await post.save();
        res.status(200).json({ message: 'Post liked successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.post('/post/comment', authentication, async (req, res) => {
    try {
        const comment = req.body.comment;
        const post = await PostData.findById(req.body.postid);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.comments.push({ user: req.userdetail.id, comment });
        await post.save();

        if(req.userdetail.id!=post.user){

            let postuser= await UserData.findById(post.user)
            let mailOptions={
                from:{
                    name:'Joshua',
                    address:'joshua00521202021@msijanakpuri.com'
                },
                to:postuser.user_email,
                subject:'Comment',
                text:'Comment',
                html:`<b>Dear User ${postuser.user_email}<br> ${req.userdetail.name} has commented on your post</b>: <br><u> ${post.content}</u> `
                      }
                sendmail(mailOptions)

        }






        res.status(200).json({ message: 'Comment added successfully', comments: post.comments });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
  })