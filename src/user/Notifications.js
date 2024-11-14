import React, { useEffect } from 'react';
// Importing Client and TokenProvider explicitly, as they are named exports
import { Client, TokenProvider } from "@pusher/push-notifications-web";

const beamsClient = new Client({
    instanceId: '097db24c-140f-4e07-8caa-17dfa6d83ea3',
});

const Notifications = ({ children }) => {
    useEffect(() => {
        const initializePushNotifications = async () => {
            const token = sessionStorage.getItem('token'); 
            const userExternalId = sessionStorage.getItem('externalId'); 

            const beamsTokenProvider = new TokenProvider({
                url: "/api/beams",
                headers: {
                    Authentication: "Bearer " + token,
                },
            });

            try {
                await beamsClient.start();
                await beamsClient.addDeviceInterest('global'); // Abonnement global
                await beamsClient.setUserId(userExternalId, beamsTokenProvider);
                const deviceId = await beamsClient.getDeviceId();
                console.log("Push ID:", deviceId);
            } catch (error) {
                console.error("Erreur d'initialisation des notifications push:", error);
            }
        };

        initializePushNotifications();
    }, []);

    return <>{children}</>;
};

export default Notifications;
