const express = require("express");
const path = require("path");
const db = require("./dbsetup");

const appIndex = express();

appIndex.set("views", path.join(__dirname, "views"));
appIndex.set("view engine", "ejs");
appIndex.use(express.urlencoded({ extended: true }));
appIndex.use(express.static(path.join(__dirname, "..", "public")));

appIndex.get("/", (req, res) => {
  res.render("index");
});

appIndex.post("/create-appointment", (req, res) => {
  const { ownername, modelname, numberplate, date, time, c_issues, c_require } =
    req.body;
  const appointmentDateTime = `${date} ${time}`;

  // Insertinmg into customers table
  const customerQuery =
    "INSERT INTO Customers (c_name, c_modelname, c_issues,c_require) VALUES (?, ?, ?, ?)";
  db.query(
    customerQuery,
    [ownername, modelname, c_issues, c_require],
    (err, customerResult) => {
      if (err) {
        console.error("Error occurred:", err);
        return res.status(500).send("Error saving customer data");
      }
      const c_id = customerResult.insertId;
      const appointmentQuery =
        "INSERT INTO Appoints (ownername, c_modelname, numberplate, day_appoint,c_issues, c_id,c_require ) VALUES (?, ?, ?, ?, ?, ?,?)";
      db.query(
        appointmentQuery,
        [
          ownername,
          modelname,
          numberplate,
          appointmentDateTime,
          c_issues,
          c_id,
          c_require,
        ],
        (err, appointmentResult) => {
          if (err) {
            console.error("Error occurred:", err);
            return res.status(500).send("Error saving the appointment");
          }

          res.render("appointment-successful");
        }
      );
    }
  );
});

appIndex.get("/booking", (req, res) => {
  res.render("index");
});

appIndex.listen(3000, () => {
  console.log("Index server running at http://localhost:3000");
});
