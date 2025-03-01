import jwt from "jsonwebtoken";
import Student from "../model/student.model.js";

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.replace("Bearer ", "");
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await Student.findById(decoded.id).select("-password");
            if (!req.user) {
                return res.status(401).json({ message: "Not authorized, user not found" });
            }
            next();
        } catch (error) {
            return res.status(401).json({ message: "Not authorized, token failed!" });
        }
    } else {
        return res.status(401).json({ message: "Not authorized, no token provided!" });
    }
};


export default protect