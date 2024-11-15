import React, { useEffect } from 'react';
// Importing Client and TokenProvider explicitly, as they are named exports
import { Client, TokenProvider } from "@pusher/push-notifications-web";


console.log("Notifications component loaded");

const beamsClient = new Client({
    instanceId: '097db24c-140f-4e07-8caa-17dfa6d83ea3',
});

const Notifications = ({ children }) => {
    useEffect(() => {
        console.log("HHHH")
        const initializePushNotifications = async () => {
            const token = sessionStorage.getItem('token');
const userExternalId = sessionStorage.getItem('externalId');

if (!token || !userExternalId) {
    console.error('Token or External ID is missing!');
    return; // Sortir de la fonction si les données sont manquantes
}

            console.log(userExternalId)

            const beamsTokenProvider = new TokenProvider({
                url: "/api/beams",
                headers: {
                    Authentication: "Bearer " + token,
                },
            });
console.log(beamsTokenProvider)
            try {
                console.log("hihi")
                await beamsClient.start();
                console.log("hihio")
                await beamsClient.addDeviceInterest('global'); 
                console.log("hihioo")// Abonnement global
                await beamsClient.setUserId(userExternalId, beamsTokenProvider);
                console.log("hihioan")
                const deviceId = await beamsClient.getDeviceId();
                console.log("Push ID:", deviceId);
            } catch (error) {
                console.error("Erreur d'initialisation des notifications push:", error);
            }
        };

        initializePushNotifications();
    }, []);

    return (
        <>
            {children}
            <div>Notifications Component Loaded</div>
        </>
    );
    
};

export default Notifications;
