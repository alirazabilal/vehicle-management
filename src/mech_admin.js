const express = require("express");
const path = require("path");
const session = require("express-session");
const db = require("./dbsetup");
const appLogin = express();

appLogin.use(
  session({
    secret: "alirazabilal123",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

appLogin.set("views", path.join(__dirname, "views"));
appLogin.set("view engine", "ejs");
appLogin.use(express.urlencoded({ extended: true }));
appLogin.use(express.static(path.join(__dirname, "..", "public")));

const isLoggedIn = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/");
  }
};

appLogin.post("/login", (req, res) => {
  const { username, password, role } = req.body;

  let query;
  let redirectPath;

  if (role === "admin") {
    query = "SELECT * FROM Admins WHERE username = ?";
    redirectPath = "/admin";
  } else if (role === "mechanic") {
    query = "SELECT * FROM Mech_admins WHERE username = ?";
    redirectPath = "/mechanic-home";
  } else {
    res.status(401).send("ROLE IS NOT ALLOWED (WRONG)");
    return;
  }

  db.query(query, [username], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      res.status(500).send("error server internal");
      return;
    }

    if (results.length === 0) {
      res.status(401).send("USERNAME IS WRONG");
      return;
    }

    const user = results[0];
    if (password === user.password) {
      req.session.loggedIn = true;
      req.session.role = role;
      res.redirect(redirectPath);
    } else {
      res.status(401).send("PASSWORD IS WRONG");
    }
  });
});

appLogin.get("/mechanic-home", isLoggedIn, (req, res) => {
  res.render("mechanic-home");
});

appLogin.get("/mechanic-orders", isLoggedIn, (req, res) => {
  const query = "SELECT * FROM Offerings WHERE o_id = 2";

  db.query(query, [1], function (err, orders) {
    if (err) {
      console.error("Database error:", err);
      res.status(500).send("SERVER ERROR INTERNAL");
    } else {
      res.render("mechanic-orders", { orders: orders });
    }
  });
});

appLogin.get("/search-appointments", isLoggedIn, (req, res) => {
  const mechanicId = req.query.mechanic_id;

  const query = "SELECT * FROM appoints WHERE a_id = ?";
  db.query(query, [mechanicId], (err, orders) => {
    if (err) {
      console.error("Database error:", err);
      res.status(500).send("SERVER ERROR INTERNAL");
    } else {
      db.query(
        "SELECT m_id, m_name, m_role, m_availability FROM mechanics WHERE m_availability = TRUE",
        (err, mechanics) => {
          if (err) {
            console.error("Database error for mechanics:", err);
            res.status(500).send("SERVER ERROR INTERNAL");
          } else {
            res.render("mechanic-orders", { orders, mechanics });
          }
        }
      );
    }
  });
});

appLogin.get("/", (req, res) => {
  res.render("login");
});

appLogin.get("/admin", isLoggedIn, (req, res) => {
  res.render("admin");
});

appLogin.get("/add-mechanic", isLoggedIn, (req, res) => {
  res.render("addmechanic");
});

appLogin.post("/add-mechanic", isLoggedIn, (req, res) => {
  const mechanicName = req.body.mechanicName;
  const serviceName = req.body.serviceName;
  const availability = req.body.availability === "true";
  const insertQuery =
    "INSERT INTO Mechanics (m_name, m_role, m_availability) VALUES (?, ?, ?)";
  db.query(
    insertQuery,
    [mechanicName, serviceName, availability],
    (err, results) => {
      if (err) {
        res
          .status(500)
          .send("SERVER ERROR INTERNAL !!!! Error AT adding mechanic");
      } else {
        res.redirect("/mechanic");
      }
    }
  );
});

appLogin.get("/Service", isLoggedIn, (req, res) => {
  const query = "SELECT * FROM offerings";

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send("SERVER ERROR INTERNAL");
      return;
    }

    res.render("Service", { services: results });
  });
});

appLogin.post("/Service", isLoggedIn, (req, res) => {
  const serviceName = req.body.serviceName;
  const serviceAvailability = req.body.serviceAvailability === "true";
  const serviceRating = req.body.serviceRating;

  const query =
    "INSERT INTO offerings (o_name, o_availabilty,o_rating) VALUES (?, ?,?)";
  const values = [serviceName, serviceAvailability, serviceRating];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error service:", err);
      res.status(500).send("SERVER ERROR INTERNAL");
      return;
    }

    res.redirect("/Service");
  });
});

appLogin.get("/customers", isLoggedIn, (req, res) => {
  const query = "SELECT * FROM Customers";
  db.query(query, function (err, customers) {
    if (err) {
      console.error("Database error:", err);
      res.status(500).send("SERVER ERROR INTERNAL");
    } else {
      console.log(customers);
      res.render("customers", { customers });
    }
  });
});

appLogin.get("/mechanic", isLoggedIn, (req, res) => {
  const query = "SELECT * FROM Mechanics";
  db.query(query, function (err, mechanic) {
    if (err) {
      console.error("Database ISSUE ", err);
      res.status(500).send("SERVER ERROR INTERNAL");
    } else {
      res.render("mechanic", { mechanic });
    }
  });
});

appLogin.get("/orders", isLoggedIn, (req, res) => {
  const queryOrders = "SELECT a_id, ownername, day_appoint FROM Appoints";

  const queryMechanics =
    "SELECT m_id, m_name FROM Mechanics WHERE m_availability = TRUE";

  db.query(queryOrders, function (err, orders) {
    if (err) {
      console.error("Database error for orders:", err);
      res.status(500).send("Internal Server Error");
    } else {
      db.query(queryMechanics, function (err, mechanics) {
        if (err) {
          console.error("Database error for mechanics:", err);
          res.status(500).send("SERVER ERROR INTERNAL");
        } else {
          res.render("orders", { orders: orders, mechanics: mechanics });
        }
      });
    }
  });
});

appLogin.post("/assign-mechanic", isLoggedIn, (req, res) => {
  const orderId = req.body.order_id;
  const mechanicId = req.body.m_id;

  db.beginTransaction(function (err) {
    if (err) {
      throw err;
    }

    const updateAppointmentQuery =
      "UPDATE Appoints SET me_id = ? WHERE a_id = ?";

    db.query(
      updateAppointmentQuery,
      [mechanicId, orderId],
      function (err, result) {
        if (err) {
          return db.rollback(function () {
            console.error("Error updating appointment:", err);
            res.status(500).send("Internal Server Error");
          });
        }

        const updateMechanicAvailabilityQuery =
          "UPDATE Mechanics SET m_availability = FALSE WHERE m_id = ?";

        db.query(
          updateMechanicAvailabilityQuery,
          [mechanicId],
          function (err, result) {
            if (err) {
              return db.rollback(function () {
                console.error("Error updating available:", err);
                res.status(500).send("SERVER ERROR INTERNAL");
              });
            }

            db.commit(function (err) {
              if (err) {
                return db.rollback(function () {
                  res.status(500).send("SERVER ERROR INTERNAL");
                });
              }
              console.log("Successful");
              console.log("assigned mechanic");
              console.log("updated availability");
              res.redirect("/orders");
            });
          }
        );
      }
    );
  });
});

appLogin.get("/infopage", isLoggedIn, (req, res) => {
  res.render("infopage");
});

appLogin.get("/logout", (req, res) => {
  req.session.loggedIn = false;
  res.render("logout");
});

appLogin.get("/logoutm", (req, res) => {
  req.session.loggedIn = false;
  res.render("logoutm");
});

appLogin.get("/contactusrepair", isLoggedIn, (req, res) => {
  res.render("contactusrepair");
});

appLogin.listen(3001, () => {
  console.log("Login server running at http://localhost:3001");
});
