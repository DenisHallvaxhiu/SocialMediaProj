// const password = document.getElementById('password')
// const username = document.getElementById('username')
// const logInButton = document.getElementById('login')



const mysql = require('mysql');

const mysqlConnection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"pasuord",
    database:"socialmedia",
    connectionLimit:10
})

// mysqlConnection.query(`UPDATE users SET password = '12345' WHERE (userID = '1');`,(err,result,fields)=>{
//     if(err){
//         return console.log(err);
//     }else
//     return console.log(result);
// });

// mysqlConnection.query("SELECT userName FROM users WHERE userName = ? AND password = ?",["jimmy2","12345"],(err,result,fields)=>{
//     if(err){
//         return console.log(err)
//     }
//     if (result.length >0){
//         console.log(result[0].userName)
//         return console.log("exists")
//     }else
//     return  console.log("doesnt")
// });

module.exports = mysqlConnection;

