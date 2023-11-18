const User = require("../app/modulers/user");

const checkRole = (requiredRole) => {
    return async(req, res, next) => {
        let uid = req.cookies.uid;
        console.log(uid)
        if (!uid) {
            res.redirect("/");
            return;
        }
        try {
            const user = await User.findOne({ _id: uid })
            if (!user) {
                throw new Error()
            }
            req.user = user
            if (user.role !== requiredRole) {
                res.redirect("/")
            }
            next();
            console.log("Pass author")
        } catch (error) {
            res.redirect("/");
            return;
        }
    }
}
module.exports = checkRole;