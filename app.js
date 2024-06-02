import express from 'express';
import http from 'http';
import nodemailer from 'nodemailer';
import sqlite3 from 'sqlite3';
const sqlite = sqlite3.verbose();
import db from './myDb.js';





const app = express ();
app.use(express.json());
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("I'm listening in port:", PORT);
});

app.get("/checkstatus", (req, res) => {
   const status = {
      "Status": "Alive"
   };
   
   res.send(status);
});
app.get("/test1",(req,res) => {


 get3Tempratures(res);
//res.send("curOtp : " + curOtp);
console.log(cities);
	
});

var strCities = "New Delhi , Hong Kong , London, Jerusalem , Tel Aviv , Lisbon , Paris , Moscow, Los Angeles , Dallas, Montreal,Malmo,Capetown,oslo, Santiago";
var cities = new Array();
cities = strCities.split(',').map(str => str.trim());

app.get('/getotp/:email', (req, res) => {
	console.log(db);
	var curOtp ="NA";	
    const curEmail = req.params.email;
	
	
	getUserByEmail(curEmail)
    .then((users) => {
		console.log('Selected rows:', users);
		var userexists = users.length > 0;
	
	if(userexists==0){
		insertUser(curEmail);
	}
        
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
    });
	
	//insertUser(curEmail);
   // res.send(`User Email is: ${curEmail}`);
	//todo:
	//generate otp
   generateOTP(curEmail ,res);
	

	//save to db
	//send email to user
	
});

app.get('/checkotp/:email/:otp', (req, res) => {
	
	//get otp for email in db
	
	getUserByEmail(req.params.email)
    .then((users) => {
		console.log('Selected rows:', users);
		var userexists = users.length > 0;
	var result = {"message" : ""}
	if(userexists==1){	
		if(users[0].OTP == req.params.otp){
			
			
			
			result.message = "Exact OTP!"
			res.send(result);
		}
		else{
			result.message = "Wrong OTP!"
			res.send(result);
	}
	}else{
			result.message = "User Not Exist"
			res.send(result);
	}
        
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
    });
	
}
);
//TaRgIL28$*
/*  Funcs */

function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';

           
            res.on('data', (chunk) => {
                data += chunk;
				//console.log(data);
            });

           
            res.on('end', () => {
                resolve(data);
            });

        }).on('error', (error) => {
            reject(error);
        });
    });
}

async function getTemprature(city) {
    try {
        var url = 'http://api.weatherapi.com/v1/current.json?key=f0999de33093498bbad142121243005&q=City&aqi=no'; //Santiago
		url = url.replace("City" , city);
        const response = await httpGet(url);
       
		const weatherData = JSON.parse(response);
		console.log(weatherData);
		console.log("temp-c is: " + weatherData.current.temp_c);
		var resTempr = formTemprature(weatherData.current.temp_c.toString());
		
		console.log(resTempr);
		//console.log(curOtp);
       // res.send(resTempr);
        return resTempr;
        
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
    }
}

async function get3Tempratures(res)
{
	
	
	 var thecities =  getRndCities(14)
	console.log("city1: " + thecities.city1);
const tempr1 = await getTemprature(thecities.city1);
 const tempr2 = await getTemprature(thecities.city2);
 const tempr3 = await  getTemprature(thecities.city3);
 var otp = tempr1 + tempr2+tempr3;
 console.log(otp);
 
 //res.send("new otp:" + otp);
 return otp;
}

function getRndCities(citiesMaxIndx,city1, city2, city3){
	//var city1 = "city1",city2 = "city2" ,city3 = "city3";
	var chosenCities = {};
	
	var curRndNum = getRndNum(0,citiesMaxIndx);
	chosenCities["city1"] = cities[curRndNum];
	
	curRndNum = getRndNum(0,citiesMaxIndx);
	chosenCities["city2"] = cities[curRndNum];
	
	curRndNum = getRndNum(0,citiesMaxIndx);
	chosenCities["city3"] = cities[curRndNum];
	return chosenCities;
	
}

function getRndNum(min,max){
	
	
  return Math.floor(Math.random() * (max - min + 1) + min);

}

function formTemprature(temp)
{
	if(temp.indexOf(".") > -1){ temp = temp.split('.')[0]}
	
	if(temp.length == 1){temp = "0"+temp};
	return temp;
}

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'shmanmantech@gmail.com', 
        pass: 'zokj bhcn hrlx vckn' 
    }
});

async function sendOTPEmail(email , otp){
	
	let mailOptions = {
    from: 'shmanmantech@gmail.com', 
    to: email, 
    subject: 'Your OTP', 
    text: 'this is your new OTP : ' +  otp
	};


	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error('Error occurred:', error.message);
		} else {
			console.log('Email sent:', info.response);
		}
	});
}
async function generateOTP(email,res)
{
	//res.send("generating otp");
	var curOtp = await get3Tempratures(res);
	res.send("OTP generated for user: " +email + " is " + curOtp);
	updateOTP(curOtp,email);
	sendOTPEmail(email,curOtp);
}
function insertUser(email)
{
	const db = new sqlite3.Database('./myDB.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
	console.log(db);
});

const insertUser = `INSERT INTO users (email) VALUES (?)`;

// Data to be inserted
const userData = [email];

db.run(insertUser, userData, function(err) {
    if (err) {
        return console.error(err.message);
    }
    console.log(`A row has been inserted with rowid ${this.lastID}`);
});

db.close((err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Closed the database connection.');
});
}

function getUser(email)
{
	
	const db = new sqlite3.Database('./myDB.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
	console.log(db);
});
	
	const selectQuery = `SELECT * FROM users where email = ?`;

db.all(selectQuery, [email], (err, rows) => {
    if (err) {
        throw err;
    }
    console.log('Data in users table:');
	if(rows.length > 0){
		return 1;
	}else{
		return 0;
	}
    rows.forEach((row) => {
        console.log(`${row.id}:  ${row.email}`);
    });
});

db.close((err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Closed the database connection.');
});
	
}

 function getUserByEmail(email) {
    const db = openDatabase();

    return new Promise((resolve, reject) => {
        const selectQuery = `SELECT * FROM users WHERE email = ?`;
        
        db.all(selectQuery, [email], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }

            // Close the database connection
            db.close((closeErr) => {
                if (closeErr) {
                    console.error(closeErr.message);
                }
                console.log('Closed the database connection.');
            });
        });
    });
}




function updateOTP(otp, email) {
    const db = openDatabase();

    return new Promise((resolve, reject) => {
        const updateQuery = `UPDATE users SET OTP = ? , Created = ? WHERE email = ?`;
var date = new Date().toLocaleTimeString(); 
        db.run(updateQuery, [otp,date ,email], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(`Rows updated: ${this.changes}`);
            }

            // Close the database connection
            db.close((closeErr) => {
                if (closeErr) {
                    console.error(closeErr.message);
                }
                console.log('Closed the database connection.');
            });
        });
    });
}


function openDatabase(){
		const db = new sqlite3.Database('./myDB.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
	console.log(db);
});
return db;
}


