import { getConnecterUser, triggerNotConnected } from "../lib/session";
import { sql } from "@vercel/postgres"; 
const PushNotifications = require('@pusher/push-notifications-server');

const beamsClient = new PushNotifications({
    instanceId: process.env.PUSHER_INSTANCE_ID,
    secretKey: process.env.PUSHER_SECRET_KEY,
});

const sendPushNotification = async (receiverId, message, sender) => {
    try {
        // Ensure receiverId is a string
        const receiverIdString = String(receiverId);

        const deepLinkUrl = `localhost:3002/messages/user/${receiverIdString}`;

        await beamsClient.publishToUsers([receiverIdString], {
            web: {
                notification: {
                    title: sender.username,
                    body: message.content,
                    icon: "https://www.univ-brest.fr/themes/custom/ubo_parent/favicon.ico",
                    deep_link: deepLinkUrl, // Ensure it's a full valid URL
                },
                data: {
                    senderId: sender.id,
                    messageId: message.id,
                },
            },
        });
        console.log('Notification');
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

        const { receiver_id, content } = await request.body;

        if (!receiver_id || !content) {
            return response.status(400).json({ error: "Receiver ID and content are required." });
        }

        const result = await sql`
            INSERT INTO messages (sender_id, receiver_id, content)
            VALUES (${user.id}, ${receiver_id}, ${content})
            RETURNING message_id, sender_id, receiver_id, content, timestamp;
        `;

        if (result.rowCount === 0) {
            return response.status(500).json({ error: "Message could not be saved." });
        }

        const savedMessage = result.rows[0]; // The inserted message

        // Send notification after the message is saved
        await sendPushNotification(receiver_id, savedMessage, user);

        return response.status(200).json(savedMessage);

    } catch (error) {
        console.error("Error saving message:", error);
        return response.status(500).json({ error: "An error occurred while saving the message." });
    }
};
