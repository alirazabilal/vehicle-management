CREATE DATABASE vehicles;
use vehicles;
CREATE TABLE Admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE Mech_admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);
CREATE TABLE Appoints (
    a_id INT AUTO_INCREMENT PRIMARY KEY,
    ownername VARCHAR(255) ,
    c_modelname VARCHAR(255) ,
    numberplate VARCHAR(255) ,
    day_appoint DATETIME ,
    c_issues TEXT,
    c_require TEXT
);
ALTER TABLE Appoints
ADD COLUMN me_id INT;



CREATE TABLE IF NOT EXISTS Mechanics (
    m_id INT AUTO_INCREMENT PRIMARY KEY,
    m_name VARCHAR(255) NOT NULL,
    m_role VARCHAR(100),
    m_availability BOOLEAN DEFAULT TRUE,
    m_scale INT
);
CREATE TABLE offerings (
    o_id INT AUTO_INCREMENT PRIMARY KEY,
    o_name VARCHAR(255) NOT NULL,
    o_availabilty BOOLEAN NOT NULL,
    o_rating INT
);

CREATE TABLE cars (
    ca_id INT AUTO_INCREMENT PRIMARY KEY,
    ca_name VARCHAR(255) NOT NULL,
    ca_price INT,
    ca_quantity INT
);

insert into cars(ca_id,ca_name,ca_price,ca_quantity)
Values(1,'honda',3535,2),(2,'wagonr',53464,2),(3,'city',53454,2),(4,'543543',133453,2),(5,'corolla',153433,2),
(6,'prado',134353,2),(7,'landcruiser',13345,2),(8,'elentra',135333,2),(9,'tahoe',1354353,2),(10,'gmc yukon',24243534,2);


CREATE TABLE reviews(
    r_id INT AUTO_INCREMENT PRIMARY KEY,
    r_personname VARCHAR(255) NOT NULL,
    r_body VARCHAR(255) NOT NULL
)

ALTER TABLE reviews
ADD COLUMN c_id INT,
ADD FOREIGN KEY (c_id) REFERENCES Customers(c_id);

ALTER TABLE reviews
ADD COLUMN o_id INT,
ADD FOREIGN KEY (o_id) REFERENCES offerings(o_id);

ALTER TABLE reviews ADD COLUMN mech_name VARCHAR(255);

ALTER TABLE cars ADD COLUMN ca_image VARCHAR(255);
ALTER TABLE cars ADD COLUMN ad_by VARCHAR(255) DEFAULT "ANONYMOUS CAKE";
insert into Admins(username, password)
Values('adm123', '123');

insert into Mech_admins(username, password)
Values('mech123', '123');

ALTER TABLE Appoints
ADD COLUMN c_id INT,
ADD FOREIGN KEY (c_id) REFERENCES Customers(c_id);

drop table Appoints;

drop table cars;

drop table reviews;

drop database vehicles;
ALTER TABLE Appoints
ADD COLUMN status VARCHAR(255) DEFAULT 'Pending';
