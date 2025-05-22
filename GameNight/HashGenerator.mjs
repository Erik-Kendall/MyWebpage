import bcrypt from 'bcrypt';

const saltRounds = 10;
const plainTextPassword = 'Temporarypass1234'; // <--- CHANGE THIS TO A TEMPORARY PASSWORD YOU'LL REMEMBER

bcrypt.hash(plainTextPassword, saltRounds, function(err, hash) {
    if (err) {
        console.error("Error hashing password:", err);
        return;
    }
    console.log("Hashed password for '" + plainTextPassword + "':");
    console.log(hash);
});