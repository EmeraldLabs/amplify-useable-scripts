/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
try {
      // Scan the DynamoDB table
      const scanParams = {
          TableName: '', // Replace with your table name
      };

      const scanResult = await dynamoDB.scan(scanParams).promise();

      // Update records with appropriate status
      const updatePromises = scanResult.Items.map(async item => {
          let newStatus = '';
          
          //any condition for column value change
          // if (item.visaStatus === 'US Citizen') {
          //     newStatus = 'usCitizen';
          // } else if (item.visaStatus === 'Green Card') {
          //     newStatus = 'greenCard';
          // } else if (item.visaStatus === 'Canadian Citizen') {
          //   newStatus = 'canadianCitizen';
          // }else if (item.visaStatus === 'Foreign National') {
          //   newStatus = 'foreignNational';
          // }else{
          //   // console.log("skipped");
          // }

          console.log(newStatus)

          if (newStatus) {
              await updateRecord(item, newStatus);
          }
      });

      await Promise.all(updatePromises);

      return {
          statusCode: 200,
          body: JSON.stringify('Records updated successfully')
      };
  } catch (error) {
      console.error('Error:', error);
      return {
          statusCode: 500,
          body: JSON.stringify('An error occurred')
      };
    }

async function updateRecord(item, newStatus) {
  const updateParams = {
      TableName: '', // Replace with your table name
      Key: { 'id': item.id }, // Replace with your primary key column
      UpdateExpression: 'SET visaStatus = :newStatus',
      ExpressionAttributeValues: {
          ':newStatus': newStatus
      }
  };

  await dynamoDB.update(updateParams).promise();
}

// Through Batching

const BATCH_SIZE = 25; // Adjust the batch size as needed

exports.handler = async (event, context) => {
    try {
        // Scan the DynamoDB table
        const scanParams = {
            TableName: '', // Replace with your table name
        };

        const scanResult = await dynamoDB.scan(scanParams).promise();

        // Split items into batches and update records with appropriate status
        const updatePromises = [];
        const batches = chunkArray(scanResult.Items, BATCH_SIZE);

        for (const batch of batches) {
            updatePromises.push(updateBatch(batch));
        }

        await Promise.all(updatePromises);

        return {
            statusCode: 200,
            body: JSON.stringify('Records updated successfully')
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify('An error occurred')
        };
    }
};

async function updateBatch(batch) {
    const updatePromises = batch.map(async item => {
      //any value condition
      //   let newStatus = '';
      //   if (item.visaStatus === 'US Citizen') {
      //     newStatus = 'usCitizen';
      // } else if (item.visaStatus === 'Green Card') {
      //     newStatus = 'greenCard';
      // } else if (item.visaStatus === 'Canadian Citizen') {
      //   newStatus = 'canadianCitizen';
      // }else if (item.visaStatus === 'Foreign National') {
      //   newStatus = 'foreignNational';
      // }else{
      //   // console.log("skipped");
      // }
    });

    await Promise.all(updatePromises);
}

async function updateRecord(item, newStatus) {
    const updateParams = {
        TableName: '', // Replace with your table name
        Key: { 'id': item.id }, // Replace with your primary key column and appropriate value
        UpdateExpression: 'SET visaStatus = :newStatus',
        ExpressionAttributeValues: {
            ':newStatus': newStatus
        }
    };

    await dynamoDB.update(updateParams).promise();
}

function chunkArray(arr, chunkSize) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
}
