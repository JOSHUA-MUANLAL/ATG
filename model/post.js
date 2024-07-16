const connection=require('./db')
const mongoose = require('mongoose');

try{
    const postSchema = new mongoose.Schema({
        content: String,
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserData' },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserData' }],
        comments: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserData' },
            comment: String,
            date: { type: Date, default: Date.now }
        }],
        date: { type: Date, default: Date.now }
    });
    
      
      
      // Create the User model
      const PostData = connection.model('PostData', postSchema);
      console.log("connected",PostData);
      
      // Export the User model
      module.exports = {PostData};

}catch(error){
    console.log("Error in Postmodel:-\n",error)
}