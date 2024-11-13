import { db } from '@vercel/postgres';
import { Redis } from '@upstash/redis';
import { arrayBufferToBase64, stringToArrayBuffer } from "../lib/base64";

export const config = {
    runtime: 'edge',
};

const redis = Redis.fromEnv();

export default async function handler(request) {
    try {
        if (request.method === 'POST') {
            const { username, email, password } = await request.json();

            if (!username || !email || !password) {
                const error = { code: "BAD_REQUEST", message: "Tous les champs (username, email, password) sont requis" };
                return new Response(JSON.stringify(error), {
                    status: 400, 
                    headers: { 'content-type': 'application/json' },
                });
            }

            const client = await db.connect();

            const { rowCount: userCount } = await client.sql`SELECT * FROM users WHERE username = ${username}`;
            const { rowCount: emailCount } = await client.sql`SELECT * FROM users WHERE email = ${email}`;

            if (userCount > 0) {
                const error = { code: "CONFLICT", message: "Le nom d'utilisateur est déjà pris" };
                return new Response(JSON.stringify(error), {
                    status: 409, // Conflict
                    headers: { 'content-type': 'application/json' },
                });
            }

            if (emailCount > 0) {
                const error = { code: "CONFLICT", message: "L'email est déjà utilisé" };
                return new Response(JSON.stringify(error), {
                    status: 409, // Conflict
                    headers: { 'content-type': 'application/json' },
                });
            }

            const hash = await crypto.subtle.digest('SHA-256', stringToArrayBuffer(username + password));
            const hashed64 = arrayBufferToBase64(hash);

            const external_id = crypto.randomUUID().toString();
            const created_on = new Date().toISOString();

            const { rowCount: insertCount, rows: insertedRows } = await client.sql`
                INSERT INTO users (username, email, password, created_on, external_id)
                VALUES (${username}, ${email}, ${hashed64}, ${created_on}, ${external_id})
                RETURNING user_id, username, email, external_id
            `;

            if (insertCount !== 1) {
                const error = { code: "INTERNAL_ERROR", message: "Erreur lors de l'enregistrement de l'utilisateur" };
                return new Response(JSON.stringify(error), {
                    status: 500, // Internal Server Error
                    headers: { 'content-type': 'application/json' },
                });
            }

            const token = crypto.randomUUID().toString();

            const user = { 
                id: insertedRows[0].user_id, 
                username: insertedRows[0].username, 
                email: insertedRows[0].email, 
                externalId: insertedRows[0].external_id 
            };

            await redis.set(token, user, { ex: 3600 });  
            const userInfo = {};
            userInfo[user.id] = user;
            await redis.hset("users", userInfo);

            return new Response(JSON.stringify({
                token: token,
                username: username,
                externalId: insertedRows[0].external_id,
                id: insertedRows[0].user_id,
            }), {
                status: 200, 
                headers: { 'content-type': 'application/json' },
            });
        } else {
            const error = { code: "METHOD_NOT_ALLOWED", message: "Méthode HTTP non autorisée" };
            return new Response(JSON.stringify(error), {
                status: 405, 
                headers: { 'content-type': 'application/json' },
            });
        }
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify(error), {
            status: 500, 
            headers: { 'content-type': 'application/json' },
        });
    }
}
