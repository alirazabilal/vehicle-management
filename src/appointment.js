const express = require("express");
const path = require("path");
const db = require("./dbsetup");

const appAppoint = express();

appAppoint.set("views", path.join(__dirname, "views"));
appAppoint.set("view engine", "ejs");
appAppoint.use(express.urlencoded({ extended: true }));
appAppoint.use(express.static(path.join(__dirname, "..", "public")));

appAppoint.get("/", (req, res) => {
  res.render("home");
});

appAppoint.post("/create-appointment", (req, res) => {
  const { ownername, modelname, numberplate, date, time, c_issues, c_require } =
    req.body;
  const appointmentDateTime = `${date} ${time}`;

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
      const appQuery =
        "INSERT INTO Appoints (ownername, c_modelname, numberplate, day_appoint,c_issues, c_id,c_require ) VALUES (?, ?, ?, ?, ?, ?,?)";
      db.query(
        appQuery,
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
            return res.status(500).send("Error making the appointment");
          }

          res.render("appointment-done");
        }
      );
    }
  );
});

appAppoint.get("/home", (req, res) => {
  res.render("home");
});

appAppoint.listen(2000, () => {
  console.log("Index server running at http://localhost:2000");
});
