const mongoose=require('mongoose')

const connection=mongoose.createConnection('mongodb+srv://abtohwatlagi:mO1SmptKtBaVj4Nz@cluster0.9puijmu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',{ useNewUrlParser: true, useUnifiedTopology: true });

connection.on('connected', () => {
    console.log('MongoDB connection established successfully');
  });
  
  connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
  
  connection.on('disconnected', () => {
    console.log('MongoDB connection disconnected');
  });

module.exports=connection