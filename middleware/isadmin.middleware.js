const isAdmin = (req, res, next) => {
    if (req.user && req.user.prn_no === process.env.ADMIN_PRN) {
        next();
    } else {
        return res.status(403).json({ message: "Access denied. Admins only!" });
    }
};

export default isAdmin; // ✅ Default Export
