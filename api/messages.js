import { getConnecterUser, triggerNotConnected } from "../lib/session";
import { sql } from "@vercel/postgres"; 
const PushNotifications = require('@pusher/push-notifications-server');

const beamsClient = new PushNotifications({
    instanceId: '875e7724-b0db-4bdf-b082-54a376631128',
    secretKey: '955C9D57C12DCB37DFCBC128F83EF54232F2B223A2894524BBB5E2398B007187',
});

// Helper function to send the push notification
const sendPushNotification = async (receiverExternalId, message, sender) => {
    const deepLinkUrl = `localhost:3002/messages/user/${receiverExternalId}`;
    try {
        const publishResponse = await beamsClient.publishToUsers([receiverExternalId], {
            web: {
                notification: {
                    title: sender.username,
                    body: message.content,
                    ico: "https://www.univ-brest.fr/themes/custom/ubo_parent/favicon.ico",
                },
                data: {
                    deepLinkUrl,
                },
            },
        });
        console.log('Notification sent', publishResponse);
    } catch (error) {
        console.error("Error sending notification:", error);
    }
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
        const receiverResult = await sql`
            SELECT external_id 
            FROM users 
            WHERE user_id = ${receiver_id};
        `;

        if (receiverResult.rowCount === 0) {
            return response.status(404).json({ error: "Receiver not found." });
        }

        const receiverExternalId = receiverResult.rows[0].external_id;

        // Save the message in the database
        const result = await sql`
            INSERT INTO messages (sender_id, sender_name, receiver_id, content, receiver_type)
            VALUES (${user.id}, ${user.username}, ${receiver_id}, ${content}, ${receiver_type})
            RETURNING message_id, sender_id, sender_name, receiver_id, content, timestamp, receiver_type;
        `;

        if (result.rowCount === 0) {
            return response.status(500).json({ error: "Message could not be saved." });
        }

        const savedMessage = result.rows[0];

        // Send the push notification to the receiver using their external_id
        await sendPushNotification(receiverExternalId, savedMessage, user);

        return response.status(200).json(savedMessage);
    } catch (error) {
        console.error("Error saving message:", error);
        return response.status(500).json({ error: "An error occurred while saving the message." });
    }
};
