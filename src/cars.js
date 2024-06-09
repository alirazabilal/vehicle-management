const express = require("express");
const path = require("path");
const db = require("./dbsetup");
const nodemailer = require("nodemailer");
const multer = require("multer");
const cars = express();

require("dotenv").config();
const dotenv = require("dotenv");
cars.set("views", path.join(__dirname, "views"));
cars.set("view engine", "ejs");
cars.use(express.urlencoded({ extended: true }));
cars.use(express.static(path.join(__dirname, "..", "public")));

const store = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "public", "images"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: store });

cars.get("/cars", (req, res) => {
  const query = "SELECT * FROM cars";
  db.query(query, (err, cars) => {
    if (err) {
      console.error("Database error:", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.render("cars", { cars });
    }
  });
});
cars.post("/buy-car", (req, res) => {
  const carId = req.body.ca_id;

  db.query(
    "SELECT ca_quantity FROM cars WHERE ca_id = ?",
    [carId],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        res.status(500).send({ success: false });
        return;
      }

      if (results.length > 0 && results[0].ca_quantity > 0) {
        db.query(
          "UPDATE cars SET ca_quantity = ca_quantity - 1 WHERE ca_id = ?",
          [carId],
          (err, updateResult) => {
            if (err) {
              console.error("Database error:", err);
              res.status(500).send({ success: false });
            } else {
              res.send({ success: true });
            }
          }
        );
      } else {
        res.send({ success: false });
      }
    }
  );
});

cars.get("/post-car", (req, res) => {
  res.render("post-car");
});

cars.get("/submitted-ad", (req, res) => {
  res.render("submitted-ad");
});
cars.post("/post-car", upload.single("ca_image"), (req, res) => {
  const { ca_name, ca_price, ca_quantity, ad_by } = req.body;
  const ca_image = req.file ? req.file.filename : null;
  const query =
    "INSERT INTO cars (ca_name, ca_price, ca_quantity, ca_image,ad_by) VALUES (?, ?, ?, ?,?)";
  db.query(
    query,
    [ca_name, ca_price, ca_quantity, ca_image, ad_by],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        res.status(500).send("Internal Server Error");
      } else {
        res.redirect("/submitted-ad");
      }
    }
  );
});

cars.get("/review-page", (req, res) => {
  res.render("review-page");
});

cars.post("/review-page", (req, res) => {
  const { r_personname, r_body, mech_name } = req.body;

  const query =
    "INSERT INTO reviews (r_personname, r_body,mech_name) VALUES ( ?, ?,?)";
  db.query(query, [r_personname, r_body, mech_name || null], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.redirect("/review-page");
    }
  });
});

cars.get("/infopagecars", (req, res) => {
  res.render("infopagecars");
});

cars.get("/contactus", (req, res) => {
  res.render("contactus");
});

cars.get("/", (req, res) => {
  res.redirect("/cars");
});

cars.listen(2002, () => {
  console.log("Cars server running at http://localhost:2002 for cars");
});
