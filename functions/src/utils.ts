import { DocumentSnapshot } from "@google-cloud/firestore";

export function buildJsonData(doc: DocumentSnapshot) {
    const docData = doc.data();
    if (doc.exists && docData) {
        return ({
            _id: doc.id,
            id: doc.id,
            ...docData,
            createTime: doc.createTime ? doc.createTime.toDate() : undefined,
            date: docData.date ? docData.date.toDate() : undefined,
            updateTime: doc.updateTime ? doc.updateTime.toDate() : undefined
        });
    }
    return ({});
}