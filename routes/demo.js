const express = require("express");
const bcrypt = require("bcryptjs"); // crypting the data na magbabago into hashed or undecodable string

const db = require("../data/database");

const router = express.Router();

router.get("/", function (req, res) {
  res.render("welcome");
});

router.get("/signup", function (req, res) {
  let sessionInputData = req.session.inputData; // wala pang nnakastore na data kapag first time na sign up pa lng

  if (!sessionInputData) {
    // first time magsign up // at hindi pa nagsusubmit
    // then kapag first time pa lang lalagyan nya ng valeu ung session which is ung nasa loob ng inputdat
    sessionInputData = {
      hasError: false,
      email: "",
      confirmEmail: "",
      password: "",
    };
  }
  req.session.inputData = null; // ginawa to para mawala yung mga data kapag nagrender ulit yung sign up
  res.render("signup", { inputData: sessionInputData });
});
router.get("/login", function (req, res) {
  let sessionInputData = req.session.inputData;
  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      email: "",
      password: "",
      password: "",
    };
  }
  req.session.inputData = null;
  res.render("login", { inputData: sessionInputData });
});

router.post("/signup", async function (req, res) {
  const userData = req.body;
  const enteredEmail = userData.email;
  const enteredConfirmEmail = userData["confirm-email"];
  const enteredPassword = userData.password;

  // first param kung ano yung ihahash, pangalwa kung gano kalakas yung paghash
  //  ginagamit to para pagnahack yung database di agad malalaman yung password

  if (
    !enteredConfirmEmail ||
    !enteredConfirmEmail ||
    !enteredPassword ||
    enteredPassword.trim() < 6 || // trim is used for removing white space or yung mga space
    enteredEmail !== enteredConfirmEmail ||
    !enteredEmail.includes("@")
  ) {
    console.log("Incorrect Data");
    // return res.render("signup"); magkakroon ulit ng confirmation sa taas
    // return res.redirect("/signup"); // dalawang post yung magagawa kapag ginawa to
    req.session.inputData = {
      // massstore siya ng panandaliian sa mongodb
      // but it will not grant access to authenticated
      hasError: true,
      message: "Invalid input - please check your data",
      email: enteredEmail,
      confirmEmail: enteredConfirmEmail,
      password: enteredPassword,
    };
    req.session.save(function () {
      // massstore siya ng panandaliian sa mongodb at sa browser
      // kapag nasave na tsaka lng madidirect sa signup
      return res.redirect("/signup"); // then redirect maaccess niya yung session na inputData
    });
    return; // ginagamit to para di magexecute yung mga kasunod na data
  }

  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: enteredEmail });

  if (existingUser) {
    req.session.inputData = {
      hasError: true,
      message: "User exists already",
      email: enteredEmail,
      confirmEmail: enteredConfirmEmail,
      password: enteredPassword,
    };
    req.session.save(function () {
      return res.redirect("/signup");
    });
    return;
  }
  const hashedPassword = await bcrypt.hash(enteredPassword, 12);
  const user = {
    email: enteredEmail,
    password: hashedPassword,
  };
  await db.getDb().collection("users").insertOne(user);
  res.redirect("/login");
});

router.post("/login", async function (req, res) {
  const userData = req.body;
  const enteredEmail = userData.email;
  const enteredPassword = userData.password;

  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: enteredEmail });

  if (!existingUser) {
    req.session.inputData = {
      hasError: true,
      message: "Password is not correct",
      email: enteredEmail,
      password: enteredPassword,
    };
    req.session.save(function () {
      return res.redirect("/login");
    });
    return;
  }
  const passwordsAreEqual = await bcrypt.compare(
    enteredPassword,
    existingUser.password
  );
  // first value is hindi nakahash na icocompare mo sa password // first value is password
  // pangalawa is yung hashed password // sampled hashed password 123 === sakdj2oija;lisjdl;2;,
  // panagalawa parin to idedecrpyt niya yung pangalawang value na babalik sa dating value na nakkahindi nakahashed
  // ang magiging format niya sa huli ay 123 === 123
  // then maglalabs siya ng value sa huli boolean/

  if (!passwordsAreEqual) {
    console.log("Could not log in - password are not equal");
    return res.redirect("/login");
  }

  // dito naka store yung sa sa database email is equal doon sa database ng session
  // then magtrue them pwede sya magaccess don sa admin
  // same sa id
  // dito sa  req.session.user ito lang  yung may mga access sa admin.
  // kapag tama yung id at email
  // gagana yung  admin or magreredirect
  req.session.isAuthenticated = true;
  console.log(existingUser._id);
  req.session.user = { email: existingUser.email }; //id: existingUser._id,
  // dito niya nilgay ung authenticated
  req.session.save(function () {
    // then yung inaccess sa session is masasave doon sa mongodb at mawawala rin depende kung anong time out ilalagay mo
    // madaming object for options sa sessions
    // if you collection find mongodb auth-demo -sessions may m akakikita ka na data doon sa sessions

    res.redirect("/profile");
  }); // it will save session in database // it will only execute kapag nasave na yung data sa database
  // res.redirect("/admin");
});

router.get("/admin", async function (req, res) {
  // kailangan ng ticket para pumunta sa admin
  // cookie is a data storage in the browser
  // session is stored in database / server -side
  // session cookie is stored in change all the time / client side

  // if (!req.session.isAuthenticated) {
  //   // access was denied para mas makita na bawal ka don pumunta
  //   return res.status(401).render("401");
  // }

  // const user = await db
  //   .getDb()
  //   .collection("users")
  //   .findOne({ email: req.session.user.email });
  // console.log(req.session.user.email);
  // console.log(user);
  // if (!user || !user.isAdmin) {
  //   return res.status(403).render("403");
  // }
  if (!res.locals.isAuth) {
    return res.status(401).render("401");
  }
  if (!res.locals.isAdmin) {
    return res.status(403).render("403");
  }

  // makakapunta ka lang sa admin kapag authenticaed is true which is nasa login form siya
  // kaya di makakapunta sa admit hanggat di ka naglologin dahil doon ka nagauthenticate
  res.render("admin");
});

router.get("/profile", function (req, res) {
  if (!res.locals.isAuth) {
    return res.status(401).render("401");
  }

  //   if (!req.session.isAuthenticated) {
  //     // access was denied para mas makita na bawal ka don pumunta
  //     return res.status(401).render("401");
  //   }

  res.render("profile");
});
router.post("/logout", function (req, res) {
  req.session.user = null;
  req.session.isAuthenticated = false;

  // yung authenticated sa mongodb is magiging false
  // yung user naman don  mawawala
  res.redirect("/");
});

module.exports = router;
// additional sample
// session are connect to different visitors na pupupnta sa link na yun iba ang cookie sa ibang visitor
// then kapag nagincognit iba ng yung cookie na nakaalgay

// for example nakalog in ka sa admin at hindi mo nilologout
// ang cookie session dito at default to sa web browser

// then kapag gumamit ka ng incognito mode hindi sya mapupunta sa admin mode
// dahil yung cookie session doon ay iba at ibang id yung  mahahanap
// mawawala yung cookie session na una mong nilagay sa unahan nung naglog in ka sa admin
// kailngan mo uling mag-login para maunthenticate ulit yung login  mo

// only the admin lang na may correct cookie session lang yung gumagana

// additional data // authentication and authorization

// authentication is about sign up and login credentials
// may access in different resources

// authorization is about kung sino magacces sa laahat ng data
// you can view all

// cookie session - ito yung mga data na nakapaloob sa browser kung ano yung mga post request, get request
// pwedeng maaccess kaapg gumamit ng mga third party packages

// updated na paliwanag
// yung sessions mismo is inaaccess niya yung nasa db na pala
// kapag may nagsign-up or maglogin mapupunta yung mga cookies or mga data  nila sa mongodb.sessions ng panandalian
// req.session.user ={email: enteredEmail} dito kapag inaassgin ko yung session ng sa user maaccess sya lang laht ng database
// res.session.save(function(){ para masave yung mga functions
//})

// req.session.user - misomng database yung nababago dahil sa third party package na dinownload

// kahit saang routes pwedeng maaccess yung req.session user kasi nga yung ung default value sa browser
// at dadagdag nang dadagdag yung mga data sa session kapag madami yung naglologin sa website or sa browser
// sa bawat browser iba iba ung id or session id kaya kapag naglogin ng dadami yung session sa mongodb
