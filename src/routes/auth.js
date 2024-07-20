import express from 'express';
import { forgotPassword, login, resetPassword, signUp } from '../controllers/auth.js';
import { getAllUsers, getOneUser, deleteUser, updateUser, updateUserRole } from '../controllers/user.js';
import { upload } from '../helpers/multer.js';
import { isLoggedIn } from '../middlewares/auth.js';


const router = express.Router();

router.post("/login", login)
router.post("/signup", upload.single('image'), signUp)
router.get("/users", getAllUsers)
router.get("/user/:userId", getOneUser)
router.delete("/delete/:userId", deleteUser)
router.put("/user/update", isLoggedIn, upload.single('image'), updateUser)
router.post("/user/role", isLoggedIn, updateUserRole)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)


export default router