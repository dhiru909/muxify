import {SQSClient, ReceiveMessageCommand,DeleteMessageCommand} from "@aws-sdk/client-sqs"
import { config } from "./config/config"
import {S3Event} from "aws-lambda"
import {ECSClient,RunTaskCommand} from "@aws-sdk/client-ecs"
// import cluster from "node:cluster";
// import { cpus } from "node:os";

const databaseUrl = config.databaseUrl
const S3_ACCESS_KEY_ID = config.awsS3.accessKeyId
const S3_SECRET_ACCESS_KEY = config.awsS3.secretAccessKey
const client = new SQSClient({
        region:config.awsS3.region,
        credentials:{
            accessKeyId:config.awsSQS.accessKeyId!,
            secretAccessKey:config.awsSQS.secretAccessKey!,
        }
    })

    const ecsClient = new ECSClient({
        region:config.awsS3.region,
        credentials:{
            accessKeyId:config.awsECS.accessKeyId!,
            secretAccessKey:config.awsECS.secretAccessKey!,
        }
    })

    async function init(){
        console.log(process.pid);
        
        const command = new ReceiveMessageCommand({
            QueueUrl:config.awsS3.sqsQueueUrl,
            MaxNumberOfMessages:1,
            WaitTimeSeconds:20
        })
        try {
   while(true){
            const {Messages} = await client.send(command);
            if(!Messages){
                console.log("No message in queue");
                // await new Promise(resolve => setTimeout(resolve, 10000));
                continue;
            }else{
                try{
                    for(const message of Messages){
                    const { MessageId, Body} = message
                    console.log("message received" ,{MessageId,Body} )

                    // validate the event
                    if(!Body){
                        continue
                    }

                    // parse the event
                    const event = JSON.parse(Body)as S3Event
                    // ignore the test event
                    if("Service" in event && "Event" in event){
                        if(event.Event==="s3:TestEvent") {

                        await client.send(new DeleteMessageCommand({
                            QueueUrl:config.awsS3.sqsQueueUrl,
                            ReceiptHandle:message.ReceiptHandle
                        }))
                        continue;
                        }
                    }
                    for(const record of event.Records){
                        const {s3} =record
                        const {bucket,
                            object:{
                                key,eTag
                            }
                        } = s3

                        // spin the docker container
                         const runTaskCommand = new RunTaskCommand(
                        {
                            taskDefinition:config.taskDefinition,
                            cluster:config.cluster,
                            launchType:"FARGATE",
                            networkConfiguration:{
                                awsvpcConfiguration:{
                                    subnets:config.subnets,securityGroups:config.securityGroups,assignPublicIp:"ENABLED"
                                },
                                
                            }
                            ,overrides:{
                                containerOverrides:[{name:config.containerName,environment:[
                                    {name:"BUCKET_NAME",value:bucket.name},{
                                        name:"KEY",
                                        value:key
                                    },{
                                        name:"MONGODB_URL",
                                        value:databaseUrl
                                    },
                                    {
                                        name:"ETAG",
                                        value:`"${eTag}"`
                                    },
                                    {
                                        name:"S3_ACCESS_KEY_ID",
                                        value:S3_ACCESS_KEY_ID
                                    },
                                    {   name:"S3_SECRET_ACCESS_KEY",
                                        value:S3_SECRET_ACCESS_KEY
                                    },{
                                        name:"S3_REGION",
                                        value:config.awsS3.region
                                    }
                                ]}]
                            }
                        }
                    )
                    // delete the message
                   const data = await ecsClient.send(runTaskCommand);
const taskStatus = data.tasks![0].lastStatus;

if (taskStatus === 'STOPPED') {
  const exitCode = data.tasks![0]?.containers?.[0]?.exitCode;
  if (exitCode === 0) {
    console.log('Task exited successfully');
  } else {
    console.log('Task exited unsuccessfully with code', exitCode);
  }
} else {
  console.log('Task did not stop');
}
                        await client.send(new DeleteMessageCommand({
                            QueueUrl:config.awsS3.sqsQueueUrl,
                            ReceiptHandle:message.ReceiptHandle
                        }))




                    }
                    
                    

                }
                }catch(err){
                    console.log(err)
                }
            }
        }
  // ...
} catch (err) {
  console.error(err);
  // Handle the error
}
       
    }

    init()