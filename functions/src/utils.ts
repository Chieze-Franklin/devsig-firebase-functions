import { DocumentData } from "@google-cloud/firestore";

export function transformDate(docData: DocumentData) {
    let createdAt, updatedAt;
    if (docData.createdAt) {
        createdAt = docData.createdAt.toDate();
    }
    if (docData.updatedAt) {
        updatedAt = docData.updatedAt.toDate();
    }
    return ({
        ...docData,
        createdAt,
        updatedAt
    });
}