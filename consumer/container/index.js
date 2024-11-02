const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const fs = require("node:fs");
const path = require("node:path");
const ffmpeg = require("fluent-ffmpeg");
const { default: mongoose } = require("mongoose");
const { default: videoModel } = require("./video/videoModel");
require("dotenv").config();
// const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Event emitted when the database connection is established successfully
    mongoose.connection.on("connected", () => {
      console.log(`MongoDB connected successfully`);
    });

    // Event emitted when there is an error while connecting to the database
    mongoose.connection.on("error", (err) => {
      log(`error in connecting to database`, err);
    });

    // Connect to the database using the connection string from the config file
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex:true,
      // autoReconnect:true,
      // socketOptions:{
      //   connectTimeoutMS:20000
      // }

      // MONGO_CONNECTION_STRING=mongodb://admin:C5A9I5BrMlGvs4PO@SG-muxify-68024.servers.mongodirector.com:27017/admin
    });
  } catch (err) {
    // If the database connection fails, log the error and exit the process
    console.log("failed to connect to database ", err);
    process.exit(1);
  }
};

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});
console.log("start");
const RESOLUTIONS = [
  { name: "360p", width: 480, height: 360 },
  { name: "480p", width: 858, height: 480 },
  { name: "720p", width: 1280, height: 720 },
  { name: "1080p", width: 1920, height: 1080 },
];
const BUCKET_NAME = process.env.BUCKET_NAME;
const KEY = process.env.KEY;
const ETAG = process.env.ETAG;
console.log(KEY, ETAG);

async function init(params) {
  await connectDB();
  const resTranscoding = await videoModel.findOneAndUpdate(
    { etag: ETAG }, // Assuming you have an 'etag' field in your model
    {
      $set: {
        status: "TRANSCODING",
      },
    }, // Update the URL and set the updatedAt field
    { new: true } // Return the updated document
  );
  const urls = {};
  // download the original video
  const command = new GetObjectCommand({
    Key: KEY,
    Bucket: BUCKET_NAME,
  });
  const result = await s3Client.send(command);
  //   fs.mkdirSync("./videos");
  //   fs.mkdirSync("./transcoded");
  const originalFilePath = KEY;
  await fs.promises.writeFile(originalFilePath, result.Body);
  const originalVideoPath = path.resolve(originalFilePath);
  console.log(originalVideoPath);
  // start the transcoder
  const promises = RESOLUTIONS.map((resolution) => {
    const output = `transcoded/${resolution.name}-${KEY.split("/")[1]}`;
    return new Promise((resolve) => {
      try {
        ffmpeg(originalVideoPath)
          .output(output)
          .withVideoCodec("libx264")
          .withAudioCodec("aac")
          .withSize(`${resolution.width}x${resolution.height}`)
          .on("end", async () => {
            const command = new PutObjectCommand({
              Bucket: BUCKET_NAME,
              Key: output,
              Body: fs.createReadStream(output),
            });
            const result = await s3Client.send(command);
            if (result.ETag) {
              const url = `https://${BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${output}`;
              console.log(result);
              console.log(`Upload Complete ${output}`);
              if (url.includes("/360p-")) {
                urls._360p = url;
                // var res = await videoModel.find({etag:ETAG})
                // console.log(res);
              } else if (url.includes("/480p-")) {
                urls._480p = url;
              } else if (url.includes("/720p-")) {
                urls._720p = url;
              } else if (url.includes("/1080p-")) {
                urls._1080p = url;
              }
            }

            resolve(output);
          })
          // .on("progress", (progress) => {
          //   console.log(
          //     `Transcoding ${output} progress: ${progress.percent} bytes`
          //   );
          // })
          .on("start", async () => {
            console.log(`Transcoding ${output}`);
          })
          .format("mp4")
          .run();
      } catch (err) {
        console.log(err);
      }
    });
  });
  await Promise.all(promises);
  const res = await videoModel.findOneAndUpdate(
    { etag: ETAG }, // Assuming you have an 'etag' field in your model
    {
      $set: {
        transcodedUrls: urls,
        status: "TRANSCODED",
      },
    }, // Update the URL and set the updatedAt field
    { new: true } // Return the updated document
  );
  console.log(res);
  process.exit(0);
  //   for()
  // upload the transcoded video
}
init();
// while (true) {
//   // do nothing, just keep the process running
// }
