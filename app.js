const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "userData.db");

const app = express();
const bcrypt = require("bcrypt");
app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();


//API 1 

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(request.body.password, 10);
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const createUserQuery = `
      INSERT INTO 
        user (username, name, password, gender, location) 
      VALUES 
        (
          '${username}', 
          '${name}',
          '${hashedPassword}', 
          '${gender}',
          '${location}'
        )`;
    const dbResponse = await db.run(createUserQuery);
    const newUserId = dbResponse.lastID;
    response.send(`Created new user with ${newUserId}`);
  } else {
    response.status = 400;
    response.send("User already exists");
  }
});

// API 2 

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched === true) {
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

// API 3 
app.put("/change-password",async(request,response)=>{
    const {username, oldPassword, newPassword} = request.body;
    const checkForUserQuery = `
        SELECT * FROM user WHERE username = "${username}"`;
    const dbUser = await db.get(checkForUserQuery);
    if (dbUser === undefined){
        response.send(400);
        response.send("User not registered");
    } else {
        const isValidPassword = await bcrypt.compare(oldPassword.dbUser.password);
        if (isValidPassword===true) {
            const lengthOfNewPassword = newPassword.length;
            if (lengthOfNewPassword <5) {
                response.send(400);
                response.send("Password is too short")
            } else {
                const encryptedPassword = await bcrypt.hash(newPassword,10);
                const updatePasswordQuery =   `
                    update user
                    set password = "${encryptedPassword}"
                    where username = "${username}"`;
                    await db.run(updatePasswordQuery);
                    response.send("Password updated")                                  
                }
        } else {
            response.status(400);
            response.send("Invalid current password");
            }
    }
});
