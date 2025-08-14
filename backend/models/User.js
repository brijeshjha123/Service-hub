const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('User', userSchema);
//b1fcT4RaeSq8QZKb
//mongodb+srv://brijeshzhaaa:b1fcT4RaeSq8QZKb@cluster0.lhxc4rg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0