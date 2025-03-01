import Student from "../model/student.model.js"
import jwt from "jsonwebtoken"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const generateToken =(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
       expiresIn:'30d'
    })
   }
   
const register = async (req,res)=>{
    try {
        const { name, email, prn_no, phone_no, course, year, designation, skills, password } = req.body;
        if (!name || !email || !prn_no || !password) {
          throw res.status(400)
                    .json({
                         message: 'Please fill all required fields' 
                        });
        }
    
        const existingStudent = await Student.findOne({ 
            $or: [
                { email },
                 { prn_no }
            ] 
        });
        if (existingStudent) {
          throw res.status(400)
                    .json({ 
            message: 'Email or PRN No already registered!' 
        });
        }
        
        const student = await Student.create({
        name,
          email,
          prn_no,
          phone_no,
          course,
          year,
          designation,
          skills,
          password
        })
          
     return res.status(201).json({
             message: 'Student registered successfully' ,
             student,
             token:generateToken(student._id)
            });
    } catch (error) {
        res.status(500)
        .json({
            message:error.message
        })
    }
}


const loginUser = async (req, res) => {
    try {
        const { prn_no, password } = req.body;

        const student = await Student.findOne({ prn_no });
        if (!student) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await student.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check if the user is an admin based on PRN number & password
        let role = "user"; // Default role

        if (prn_no === process.env.ADMIN_PRN && password === process.env.ADMIN_PASSWORD) {
            role = "admin"; // Assign admin role if credentials match
        }
        const token = generateToken(student._id, role);
       

        res.status(200).json({
            message: "Login successful",
            token,
            role, // Send role to frontend
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




const updateStudentProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // If an image is uploaded, upload it to Cloudinary
        if (req.file) {
            const result = await uploadOnCloudinary(req.file.buffer, "image");

            if (!result || !result.secure_url) {
                return res.status(500).json({ message: "Image upload failed" });
            }

            student.image = result.secure_url; // Store Cloudinary URL
        }

        // Update other details
        Object.keys(updates).forEach((key) => {
            student[key] = updates[key];
        });

        const updatedStudent = await student.save();

        res.status(200).json({
            message: "Student profile updated successfully",
            updatedStudent
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getStudentProfile = async (req, res) => {
    try {
        // Extract student ID from token (added by authMiddleware)
        const student = await Student.findById(req.user.id).select(
            "name email prn_no phone_no course year designation skills image"
        );

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Format response to match UI
        const profileData = {
            name: student.name || "",
            email: student.email || "",
            prn_no: student.prn_no || "",
            phone_no: student.phone_no || "",
            course: student.course || "",
            year: student.year || "",
            designation: student.designation || "",
            skills: student.skills || [], // Ensure it's always an array
            image: student.image || "", // Ensure it always returns an image (empty if not set)
        };

        res.json(profileData);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const deleteStudentByAdmin = async (req, res) => {
    try {
        const { id } = req.params; 

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        await student.deleteOne();

        res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

 const sendConnectionRequest = async (req, res) => {
    try {
      const { senderId, receiverId } = req.body;
  
      if (senderId === receiverId) {
        return res.status(400).json({ message: "You can't send a request to yourself" });
      }
  
      const sender = await Student.findById(senderId);
      const receiver = await Student.findById(receiverId);
  
      if (!sender || !receiver) {
        return res.status(404).json({ message: "Sender or receiver not found" });
      }
  
      // Convert ObjectId to string for comparison
      const senderStr = senderId.toString();
      const receiverStr = receiverId.toString();
  
      // Check if already connected or request sent
      if (receiver.connections.some(id => id.toString() === senderStr) || 
          receiver.pendingRequests.some(id => id.toString() === senderStr)) {
        return res.status(400).json({ message: "Already connected or request pending" });
      }
  
      // Update sender and receiver
      receiver.pendingRequests.push(senderStr);
      sender.sentRequests.push(receiverStr);
  
      await receiver.save();
      await sender.save();
  
      res.status(200).json({ message: "Connection request sent successfully" });
    } catch (error) {
      console.error("Error in sendConnectionRequest:", error);
      res.status(500).json({ message: "Server Error", error });
    }
  };
  


// controllers/connectionController.js
const handleConnectionRequest = async (req, res) => {
    try {
      const { userId, senderId, action } = req.body; // action: 'accept' or 'reject'
  
      const user = await Student.findById(userId);
      const sender = await Student.findById(senderId);
  
      if (!user || !sender) {
        return res.status(404).json({ message: "User or sender not found" });
      }
  
      // Convert ObjectId to string for proper comparison
      const userStr = userId.toString();
      const senderStr = senderId.toString();
  
      // Check if request exists
      if (!user.pendingRequests.some(id => id.toString() === senderStr)) {
        return res.status(400).json({ message: "No pending request found from this user" });
      }
  
      // Remove from pendingRequests & sentRequests
      user.pendingRequests = user.pendingRequests.filter(id => id.toString() !== senderStr);
      sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== userStr);
  
      if (action === "accept") {
        user.connections.push(senderStr);
        sender.connections.push(userStr);
      }
  
      await user.save();
      await sender.save();
  
      res.status(200).json({ message: `Request ${action}ed successfully` });
    } catch (error) {
      console.error("Error in handleConnectionRequest:", error);
      res.status(500).json({ message: "Server Error", error });
    }
  };


// Search student by name and return name + PRN
const searchStudent = async (req, res) => {
    try {
        const { name, course, year, skill, designation } = req.query;

        // Ensure at least one search parameter is provided
        if (!name && !course && !year && !skill && !designation) {
            return res.status(400).json({ message: "Please provide at least one search parameter." });
        }

        // Build query object dynamically
        const query = {};

        if (name) {
            query.name = { $regex: name, $options: "i" }; // Case-insensitive name search
        }

        if (course) {
            query.course = { $regex: `^${course}$`, $options: "i" }; // Exact course match (case insensitive)
        }

        if (year) {
            query.year = { $regex: `^${year}$`, $options: "i" }; // Exact year match
        }

        if (skill) {
            query.skills = { $elemMatch: { $regex: `^${skill}$`, $options: "i" } }; // Ensure skill exists in array
        }

        if (designation) {
            query.designation = { $regex: `^${designation}$`, $options: "i" }; // Exact designation match
        }

        // Fetch students based on query
        const students = await Student.find(query)
            .select("name prn_no course year skills designation") // Only return necessary fields
            .limit(10); // Limit results to 10

        if (students.length === 0) {
            return res.status(404).json({ message: "No students found matching the criteria." });
        }

        res.json(students);
    } catch (error) {
        console.error("Error searching student:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


  const getUserById = async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await Student.findById(userId); // Fetch user from database
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };


export {
    register,
    loginUser,
    updateStudentProfile,
    getStudentProfile,
    deleteStudentByAdmin,
    sendConnectionRequest,
    handleConnectionRequest,
    searchStudent,
    getUserById
}