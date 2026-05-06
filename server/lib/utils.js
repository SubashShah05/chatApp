// import jsonwebtoken library
import jwt from "jsonwebtoken";

// function to generate JWT token
export const generateToken = (userId) => {

    // create token using jwt.sign()
    const token = jwt.sign(

        { id: userId },           // data stored inside the token
        process.env.JWT_SECRET,   // secret key used to secure the token
        { expiresIn: "7d" }       // token will expire after 7 days
    );

    // return the generated token
    return token;
};