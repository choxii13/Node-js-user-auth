const express = require("express");
const router = express.Router();
const authController = require("../controller/auth-controller");
const demoController = require("../controller/demo-controller");
const guardRoutes = require("../middleware/user-auth-middlerware");

router.use(guardRoutes);
router.get("/", demoController.getHome);
router.get("/admin", demoController.getAdmin);
router.get("/profile", demoController.getProfile);
// auth
router.get("/signup", authController.getSignUp);
router.post("/signup", authController.postSignUp);
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.post("/logout", authController.postLogOut);

router.get("*", function (req, res) {
  res.status(404).render("404");
});

module.exports = router;
