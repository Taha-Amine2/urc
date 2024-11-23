import { getConnecterUser, triggerNotConnected } from "../lib/session.js";
import { db } from '@vercel/postgres';
import PushNotifications from '@pusher/push-notifications-server';  // Utilisation d'import



export default async (request, response) => {
    try {
        const user = await getConnecterUser(request);

        if (!user) {
            return triggerNotConnected(response);
        }

        const { receiver_id, content, receiver_type, image_url } = await request.body;

        if (!receiver_id || !content || !receiver_type) {
            return response.status(400).json({ error: "Receiver ID, content, and receiver type are required." });
        }

        // Enregistrer le message dans la base de données
        const result = await db.sql`
            INSERT INTO messages (sender_id, sender_name, receiver_id, content, receiver_type, image_url)
            VALUES (${user.id}, ${user.username}, ${receiver_id}, ${content}, ${receiver_type}, ${image_url})
            RETURNING message_id, sender_id, sender_name, receiver_id, content, timestamp, receiver_type, image_url;
        `;

        if (result.rowCount === 0) {
            return response.status(500).json({ error: "Message could not be saved." });
        }

        const savedMessage = result.rows[0];

        // Initialiser le client Push Notifications
        const beamsClient = new PushNotifications({
            instanceId: '097db24c-140f-4e07-8caa-17dfa6d83ea3',
            secretKey: '62FAB2C7CDB32D45A008008E07BE12B6BC3BDD4FAC66DB3942594EC8280DECBD',
        });

        // Fonction pour envoyer des notifications
        const sendPushNotification = async (externalIds, message, sender) => {
            try {
                await beamsClient.publishToUsers(externalIds, {
                    web: {
                        notification: {
                            title: sender.username,
                            body: message.content,
                            icon: "https://www.univ-brest.fr/themes/custom/ubo_parent/favicon.ico",
                        },
                        data: {
                            senderId: sender.id,
                            receiverId: receiver_id,
                            receiverType: receiver_type,
                            messageId: message.message_id,
                        },
                    },
                });
                console.log('Notification sent');
            } catch (error) {
                console.error("Error sending notification:", error);
            }
        };

        if (receiver_type === 'group') {
            // Récupérer tous les utilisateurs, sauf l'expéditeur
            const allUsersResult = await db.sql`
                SELECT external_id 
                FROM users 
                WHERE user_id != ${user.id};
            `;

            if (allUsersResult.rowCount > 0) {
                const externalIds = allUsersResult.rows.map(row => row.external_id);
                await sendPushNotification(externalIds, savedMessage, user);
            }
        } else if (receiver_type === 'user') {
            // Récupérer l'ID externe de l'utilisateur destinataire
            const receiverResult = await db.sql`
                SELECT external_id
                FROM users
                WHERE user_id = ${receiver_id};
            `;

            if (receiverResult.rowCount > 0) {
                const receiverExternalId = receiverResult.rows[0].external_id;
                await sendPushNotification([receiverExternalId], savedMessage, user);
            } else {
                return response.status(404).json({ error: "Receiver not found." });
            }
        }

        return response.status(200).json(savedMessage);
    } catch (error) {
        console.error("Error saving message:", error);
        return response.status(500).json({ error: "An error occurred while saving the message." });
    }
};
