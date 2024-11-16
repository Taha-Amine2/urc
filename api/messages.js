import { getConnecterUser, triggerNotConnected } from "../lib/session";
import { db } from '@vercel/postgres';

export const config = {
    runtime: 'edge',
};

export default async (request) => {
    try {
        const user = await getConnecterUser(request);

        if (!user) {
            return triggerNotConnected();
        }

        const { receiver_id, content, receiver_type } = await request.json();

        if (!receiver_id || !content || !receiver_type) {
            return new Response(JSON.stringify({ error: "Receiver ID, content, and receiver type are required." }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Query the database to get the receiver's external_id
        const receiverResult = await db.sql`
            SELECT external_id 
            FROM users 
            WHERE user_id = ${receiver_id};
        `;

        if (receiverResult.rowCount === 0) {
            return new Response(JSON.stringify({ error: "Receiver not found." }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const receiverExternalId = receiverResult.rows[0].external_id;

        // Save the message in the database
        const result = await db.sql`
            INSERT INTO messages (sender_id, sender_name, receiver_id, content, receiver_type)
            VALUES (${user.id}, ${user.username}, ${receiver_id}, ${content}, ${receiver_type})
            RETURNING message_id, sender_id, sender_name, receiver_id, content, timestamp, receiver_type;
        `;

        if (result.rowCount === 0) {
            return new Response(JSON.stringify({ error: "Message could not be saved." }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const savedMessage = result.rows[0];

        // Notify the user
        await sendPushNotification(receiverExternalId, savedMessage, user);

        return new Response(JSON.stringify(savedMessage), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error("Error saving message:", error);
        return new Response(JSON.stringify({ error: "An error occurred while saving the message." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

// Mocked notification function for Edge compatibility
const sendPushNotification = async (receiverExternalId, message, sender) => {
    // Push notification logic here, but keep it compatible with Edge or move to a standard function.
    console.log("Notification sent to", receiverExternalId, ":", message.content);
};
