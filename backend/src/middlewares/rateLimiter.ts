// const redis = require('redis');

// import { createClient } from "redis";
// import { config } from "../config/config";
// import rateLimit from "express-rate-limit";
// import RedisStore from "rate-limit-redis";
// console.log(config.redis.endpointUri)
// const clientFunction = async () => {
//     const client = createClient({
//         username:"default",
//         password:"Sc6SVufC5aiPPlWk34PmQIhiIesZxT0T",
//         socket:{
//             connectTimeout:5000,
//             host:config.redis.endpointUri,
//             port:18896
//         } // Increase the connection timeout to 10 seconds
//     });
//     await client.connect()
//     .then(() => {
//         // Connection successful
//         console.log('Connected to Redis');
//     })
//     .catch((error) => {
//         if (error ) {
//             // Handle multiple errors
//                 console.error('Error:', error);
           
//         } else {
//             // Handle single error
//             console.error('Error:', error);
//         }
//     });

//     return client;
// }

// /**
//  * Creates a rate limiter instance that will block requests after a certain limit
//  * has been reached.
//  *
//  * @see https://www.npmjs.com/package/express-rate-limit
//  * @see https://www.npmjs.com/package/rate-limit-redis
//  */
// const rateLimiter = async () => {
//     const client = await clientFunction();
    
//     return rateLimit({
        
//         limit: 20,
//         windowMs: 1 * 60 * 1000,
//         store: new RedisStore({
//             sendCommand: (...args: string[]) => client.sendCommand(args),
//         }),
//         skipSuccessfulRequests: true,
        
//         handler: (req, res, next) => {
//             res.status(429).json({ message: "Too many requests, please try again later." });
//         },
        
//     });
// };



// export default rateLimiter




import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import {client} from "../../server"


/**
 * Middleware function to authenticate the user by checking the authorization token in the request header.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function in the middleware chain.
 */
const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  // Extract the authorization token from the request header
  var ip = req.headers['x-real-ip'] || req.socket.remoteAddress;
// console.log(ip)

  try {
    const result = await client.get(`${ip}`);
    // console.log(result);
    
    if(!result ){
        await client.set(`${ip}`,20,{
            EX:60,
        })
    }else{
       const result =  await client.DECR(`${ip}`)
        if(result<=0){
            // await client.del(ip)
            return next(createHttpError(429, "Please wait"));
        }
        
    }
    next();

  } catch (error) {
    // If the token is expired, return a 401 Unauthorized error
    return next(createHttpError(429, "Please wait"));
  }

  // Call the next middleware function
  
};

export default rateLimiter;

