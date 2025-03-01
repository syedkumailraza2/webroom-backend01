import mongoose from 'mongoose';
import bcrypt from "bcryptjs";

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email',
    ],
  },
  prn_no: {
    type: String,
    required: [true, 'PRN No is required'],
    unique: true,
  },
  phone_no: {
    type: String,
  },
  image:{
    type:String,
  },
  course: {
    type: String,
  },
  year: {
    type: String,
  },
  designation: {
    type: String,
  },
  skills: {
    type: [String], // Array to hold top 5 skills
    validate: {
      validator: function (v) {
        return v.length <= 5;
      },
      message: 'You can select up to 5 skills only',
    },
  },
  bio:{
  type:String,

  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  open_to_partner:{
       type:Boolean,
       default:false
  },
  connections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student', // Confirmed connections
      default:[]
    },
  ],
  pendingRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default:[] // Incoming connection requests
    },
  ],
  sentRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default:[] // Sent connection requests
    },
  ]
}, { timestamps: true });


studentSchema.pre('save',async function (next) {
  if(!this.isModified('password'))next()

  const salt = await bcrypt.genSalt(10)
  this.password= await bcrypt.hash(this.password,salt)
  next()
})


studentSchema.methods.matchPassword = async function (enteredpassword) {
  //console.log("EnteredPassword",enteredpassword)
  //console.log("Db Hashed Password",this.password)
  const ismatch = await bcrypt.compare(enteredpassword,this.password)
 // console.log("Password match result:",ismatch)
  return ismatch
}


 const Student = mongoose.model('Student', studentSchema);
 export default Student
