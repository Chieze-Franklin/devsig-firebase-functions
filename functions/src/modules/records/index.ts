// import * as admin from 'firebase-admin';
import { onRequest } from 'firefuncs';

import { buildJsonData } from '../../utils';
import { AuthClientMiddleware, InitMiddleware } from '../../middleware';

export class Records {
    @onRequest('/', {
        method: 'get',
        middleware: [InitMiddleware]
    }, 'europe-west1')
    public async find(req: any, res: any) {
        try {
            const db: FirebaseFirestore.Firestore = req.firestore.db;
            const collection = db.collection('records');
            let query;
            if (req.query.email) {
                query = collection.where('email', '==', req.query.email);
            }
            if (req.query.metric) {
                if (!query) {
                    query = collection.where('metric', '==', req.query.metric);
                } else {
                    query = query.where('metric', '==', req.query.metric);
                }
            }
            if (!query) {
                query = collection;
            }
            const snapshot = await query.get();
            if (!snapshot.empty) {
                const docs: any[] = [];
                snapshot.forEach(doc => docs.push(buildJsonData(doc)))
                res.send({
                    data: docs
                });
            } else {
                res.send({
                    data: []
                });
            }
        } catch (error) {
            res.send({
                error: {
                    message: error.message
                }
            })
        }
    }

    @onRequest('/', {
        method: 'post',
        middleware: [InitMiddleware, AuthClientMiddleware]
    }, 'europe-west1')
    public async save(req: any, res: any) {
        try {
            const db: FirebaseFirestore.Firestore = req.firestore.db;
            const ref = await db.collection('records').add({
                ...req.body,
                clientId: req.firestore.clientId,
                // createdAt: new Date(Date.now()), // admin.firestore.Timestamp.fromDate(new Date()),
                date: req.body.date ? new Date(req.body.date) : new Date(Date.now()),
                // updatedAt: new Date(Date.now()),
            });
            const doc = await ref.get();
            if (doc.exists) {
                res.send({ data: buildJsonData(doc) })
            } else {
                throw new Error('Record was not created');
            }
        } catch (error) {
            res.send({
                error: {
                    message: error.message
                }
            })
        }
    }
}
