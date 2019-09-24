// import * as admin from 'firebase-admin';
import { onRequest } from 'firefuncs';

import { buildJsonData } from '../../utils';
import { AuthClientMiddleware, InitMiddleware, ValidateRequestMiddleware } from '../../middleware';

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
                return res.send({
                    data: docs
                });
            } else {
                return res.send({
                    data: []
                });
            }
        } catch (error) {
            return res.send({
                error: {
                    message: error.message
                }
            })
        }
    }

    @onRequest('/', {
        method: 'post',
        middleware: [InitMiddleware, AuthClientMiddleware, ValidateRequestMiddleware]
    }, 'europe-west1')
    public async save(req: any, res: any) {
        try {
            const db: FirebaseFirestore.Firestore = req.firestore.db;
            const docRef = await db.collection('records').add({
                ...req.body,
                clientId: req.firestore.clientId,
                // createdAt: new Date(Date.now()), // admin.firestore.Timestamp.fromDate(new Date()),
                date: req.body.date ? new Date(req.body.date) : new Date(Date.now()),
                // updatedAt: new Date(Date.now()),
            });
            const doc = await docRef.get();
            if (doc.exists) {
                return res.send({ data: buildJsonData(doc) })
            } else {
                throw new Error('Record was not created');
            }
        } catch (error) {
            return res.send({
                error: {
                    message: error.message
                }
            })
        }
    }

    @onRequest('/', {
        method: 'post',
        middleware: [InitMiddleware, AuthClientMiddleware, ValidateRequestMiddleware]
    }, 'europe-west1')
    public async saveInPeriod(req: any, res: any) {
        try {
            const period = req.query && req.query.period ? req.query.period : 'day';
            const date = req.body.date ? new Date(req.body.date) : new Date(Date.now());
            let startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
            let endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
            if (period == 'year') {
                startDate = new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
                endDate = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
            } else if (period == 'month') {
                startDate = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
                endDate =
                new Date(date.getFullYear(),
                    date.getMonth(),
                    new Date(date.getFullYear(), (date.getMonth() + 1), 0).getDate(),
                    23, 59, 59, 999);
            } else if (period == 'hour') {
                startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), 0, 0, 0);
                endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), 59, 59, 999);
            } else if (period == 'minute') {
                startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), 0, 0);
                endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), 59, 999);
            }

            const db: FirebaseFirestore.Firestore = req.firestore.db;
            const snapshot = await db.collection('records')
                .where('email', '==', req.body.email)
                .where('metric', '==', req.body.metric)
                .where('date', '>=', startDate)
                .where('date', '<=', endDate)
                .get();
            if (!snapshot.empty) {
                // update existing record
                const docs: any[] = [];
                snapshot.forEach((doc) => {
                    const docRef = db.collection('records').doc(doc.id);
                    docRef.update({
                        value: req.body.value,
                        date
                    }).then(result => {;}).catch(error => {;});
                    docs.push({
                        ...buildJsonData(doc),
                        value: req.body.value,
                        date,
                        updateTime: new Date(Date.now())
                    });
                })
                return res.send({
                    data: docs
                });
            } else {
                // create a new record
                return await new Records().save(req, res);
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
