import { getConnecterUser, triggerNotConnected } from "../lib/session";
import { db } from '@vercel/postgres';

export const config = {
    runtime: 'edge',
};
export default async (request, response) => {
    try {
        
        const user = await getConnecterUser(request);

        if (!user) {
            return triggerNotConnected(response);
        }
   

        const { receiver_id, content, receiver_type } = await request.body;

        if (!receiver_id || !content || !receiver_type) {
            return response.status(400).json({ error: "Receiver ID, content, and receiver type are required." });
        }

        // Query the database to get the receiver's external_id
        const receiverResult = await db.sql`
            SELECT external_id 
            FROM users 
            WHERE user_id = ${receiver_id};
        `;
console.log("ha l'externel :" ,receiverResult);
        if (receiverResult.rowCount === 0) {
            return response.status(404).json({ error: "Receiver not found." });
        }

        const receiverExternalId = receiverResult.rows[0].external_id;

        // Save the message in the database
        const result = await db.sql`
            INSERT INTO messages (sender_id, sender_name, receiver_id, content, receiver_type)
            VALUES (${user.id}, ${user.username}, ${receiver_id}, ${content}, ${receiver_type})
            RETURNING message_id, sender_id, sender_name, receiver_id, content, timestamp, receiver_type;
        `;

        if (result.rowCount === 0) {
            return response.status(500).json({ error: "Message could not be saved." });
        }

        const savedMessage = result.rows[0];

        const PushNotifications = require('@pusher/push-notifications-server');

        const beamsClient = new PushNotifications({
            instanceId: '097db24c-140f-4e07-8caa-17dfa6d83ea3',
            secretKey: '62FAB2C7CDB32D45A008008E07BE12B6BC3BDD4FAC66DB3942594EC8280DECBD',
        });
        
        const sendPushNotification = async (receiverId, message, sender) => {
            try {
                const receiverIdString = String(receiverId);
        
                const deepLinkUrl = `localhost:3002/messages/user/${receiverIdString}`;
                const publishResponse = await beamsClient.publishToUsers([receiverExternalId], {
                    web: {
                        notification: {
                            title: user.username,
                            body: message.content,
                            ico: "https://www.univ-brest.fr/themes/custom/ubo_parent/favicon.ico",
                        },
                        data: {
                            /* additionnal data */
                        }
                    },
                });
                console.log('Notification');
            } catch (error) {
                console.error("Error sending notification:", error);
            }
        
        
        
        
                };
        await sendPushNotification(receiver_id, savedMessage, user);

        return response.status(200).json(savedMessage);
    } catch (error) {
        console.error("Error saving message:", error);
        return response.status(500).json({ error: "An error occurred while saving the message." });
    }
};
