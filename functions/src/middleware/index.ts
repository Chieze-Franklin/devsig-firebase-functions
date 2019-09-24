import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export class AuthClientMiddleware {
    async middleware(req: any, res: any, next: Function) {
        try {
            const clientToken = req.headers['x-devsig-client-token'];
            if (!clientToken) {
                throw new Error('Unauthorized access');
            }
            const db: FirebaseFirestore.Firestore = req.firestore.db;
            const doc = await db.collection('clients').doc(clientToken).get();
            const docData = doc.data();
            if (!doc.exists || !docData) {
                throw new Error('Unauthorized access');
            }
            if (docData.blocked) {
                throw new Error('Unauthorized access');
            }
            req.firestore = req.firestore || {};
            req.firestore.clientId = req.firestore.clientId || doc.id;
            next();
        } catch (error) {
            res.send({
                error: {
                    message: error.message
                }
            })
        }
    }
}

export class InitMiddleware {
    async middleware(req: any, res: any, next: Function) {
        try {
            try {
                admin.initializeApp(functions.config().firebase);
            } catch (error) {}
            const db = admin.firestore();
            req.firestore = req.firestore || {};
            req.firestore.db = req.firestore.db || db;
            next();
        } catch (error) {
            res.send({
                error: {
                    message: error.message
                }
            })
        }
    }
}

export class ValidateRequestMiddleware {
    async middleware(req: any, res: any, next: Function) {
        try {
            // request must have
            if (!req.body.email || !req.body.metric || !req.body.value) {
                throw new Error('Request body is missing email, metric or value');
            }
            // request may have
            next();
        } catch (error) {
            res.send({
                error: {
                    message: error.message
                }
            })
        }
    }
}
