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
            const snapshot = await db.collection('clients').where('token', '==', clientToken).get();
            if (snapshot.empty) {
                throw new Error('Unauthorized access');
            }
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
