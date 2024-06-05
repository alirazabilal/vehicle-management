const express = require("express");
const path = require("path");
const db = require("./dbsetup");
const appLogin = express();

appLogin.set("views", path.join(__dirname, "views"));
appLogin.set("view engine", "ejs");
appLogin.use(express.urlencoded({ extended: true }));
appLogin.use(express.static(path.join(__dirname, "..", "public")));

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
    res.status(401).send("Invalid role");
    return;
  }

  db.query(query, [username], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    if (results.length === 0) {
      res.status(401).send("Invalid username");
      return;
    }

    const user = results[0];
    if (password === user.password) {
      res.redirect(redirectPath);
    } else {
      res.status(401).send("Invalid password");
    }
  });
});

appLogin.get("/mechanic-home", (req, res) => {
  res.render("mechanic-home");
});
appLogin.get("/mechanic-orders", (req, res) => {
  const query = "SELECT * FROM Offerings WHERE o_id = 2";

  db.query(query, [1], function (err, orders) {
    if (err) {
      console.error("Database error:", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.render("mechanic-orders", { orders: orders });
    }
  });
});

appLogin.get("/search-appointments", (req, res) => {
  const mechanicId = req.query.mechanic_id;

  const query = "SELECT * FROM appoints WHERE a_id = ?";
  db.query(query, [mechanicId], (err, orders) => {
    if (err) {
      console.error("Database error:", err);
      res.status(500).send("Internal Server Error");
    } else {
      db.query(
        "SELECT m_id, m_name, m_role, m_availability FROM mechanics WHERE m_availability = TRUE",
        (err, mechanics) => {
          if (err) {
            console.error("Database error for mechanics:", err);
            res.status(500).send("Internal Server Error");
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

appLogin.get("/admin", (req, res) => {
  res.render("admin");
});
appLogin.get("/add-mechanic", (req, res) => {
  res.render("addmechanic");
});

appLogin.post("/add-mechanic", (req, res) => {
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
        console.error("Error occurred while adding mechanic:", err);
        res.status(500).send("Error occurred while adding mechanic");
      } else {
        res.redirect("/mechanic");
      }
    }
  );
});
appLogin.get("/Service", (req, res) => {
  const query = "SELECT * FROM offerings";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving services:", err);
      res.status(500).send("Internal Serveri Error");
      return;
    }

    res.render("Service", { services: results });
  });
});

appLogin.post("/Service", (req, res) => {
  const serviceName = req.body.serviceName;
  const serviceAvailability = req.body.serviceAvailability === "true";
  const serviceRating = req.body.serviceRating;

  const query =
    "INSERT INTO offerings (o_name, o_availabilty,o_rating) VALUES (?, ?,?)";
  const values = [serviceName, serviceAvailability, serviceRating];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error adding service:", err);
      res.status(500).send("Internal Servero Error");
      return;
    }

    res.redirect("/Service");
  });
});

//admin done
appLogin.get("/customers", (req, res) => {
  const query = "SELECT * FROM Customers";
  db.query(query, function (err, customers) {
    if (err) {
      console.error("Database error:", err);
      res.status(500).send("Internal Server Error");
    } else {
      console.log(customers);
      res.render("customers", { customers });
    }
  });
});

//admin done
appLogin.get("/mechanic", (req, res) => {
  const query = "SELECT * FROM Mechanics";
  db.query(query, function (err, mechanic) {
    if (err) {
      console.error("Database error:", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.render("mechanic", { mechanic });
    }
  });
});

//admin done
appLogin.get("/orders", (req, res) => {
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
          res.status(500).send("Internal Server Error");
        } else {
          res.render("orders", { orders: orders, mechanics: mechanics });
        }
      });
    }
  });
});

appLogin.post("/assign-mechanic", (req, res) => {
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
                console.error("Error updating mechanic availability:", err);
                res.status(500).send("Internal Server Error");
              });
            }

            db.commit(function (err) {
              if (err) {
                return db.rollback(function () {
                  console.error("Error committing transaction:", err);
                  res.status(500).send("Internal Server Error");
                });
              }
              console.log(
                "Successfully assigned mechanic and updated availability."
              );
              res.redirect("/orders");
            });
          }
        );
      }
    );
  });
});
appLogin.get("/infopage", (req, res) => {
  res.render("infopage");
});
appLogin.get("/logout", (req, res) => {
  res.render("logout");
});
appLogin.get("/logoutm", (req, res) => {
  res.render("logoutm");
});
appLogin.get("/contactusrepair", (req, res) => {
  res.render("contactusrepair");
});

appLogin.listen(3001, () => {
  console.log("Login server running at http://localhost:3001");
});
