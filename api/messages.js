import { getConnecterUser, triggerNotConnected } from "../lib/session";
import { sql } from "@vercel/postgres"; 


export default async (request, response) => {
    try {
        
        const user = await getConnecterUser(request);

        if (!user) {
            return triggerNotConnected(response);
        }
        const PushNotifications = require('@pusher/push-notifications-server');

const beamsClient = new PushNotifications({
    instanceId: '097db24c-140f-4e07-8caa-17dfa6d83ea3',
    secretKey: '62FAB2C7CDB32D45A008008E07BE12B6BC3BDD4FAC66DB3942594EC8280DECBD',
});

const sendPushNotification = async (receiverId, message, sender) => {
    try {
        const receiverIdString = String(receiverId);

        const deepLinkUrl = `localhost:3002/messages/user/${receiverIdString}`;
        console.log(user.externalId)
        const publishResponse = await beamsClient.publishToUsers([user.externalId], {
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
        console.log(user)
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
