import {ID, Query} from 'appwrite';
import {INewUser} from "@/types";
import {account, appWriteConfig, avatars, databases} from "@/lib/appwrite/config.ts";

export async function createUserAccount(user: INewUser) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name
        );

        if (!newAccount) throw Error;
        const avatarUrl = avatars.getInitials(user.name);

        const newUser = await saveUserToDB({
            accountId: newAccount.$id,
            name: newAccount.name,
            email: newAccount.email,
            username: user.username,
            imageUrl: avatarUrl,
        });
        return newUser;
    } catch (e) {
        console.log(e);
        return e;
    }
}

export async function saveUserToDB(user: {
    accountId: string;
    email: string;
    name: string;
    imageUrl: URL;
    username?: string;
}) {
    try {
        const newUser = await databases.createDocument(
            appWriteConfig.databaseID,
            appWriteConfig.userCollectionId,
            ID.unique(),
            user,
        )
        return newUser;
    } catch (e) {
        console.log(e);
        return e;
    }
}

export async function signInAccount(user: { email: string, password: string }) {
    try {
        const session = await  account.createEmailSession(user.email, user.password)
        return session;
    }
    catch (e) {
        console.log(e)
    }
}

export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;
        const currentUser = await databases.listDocuments(
            appWriteConfig.databaseID,
            appWriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]);
        if (!currentUser) throw Error;
        return currentUser.documents[0]
    }
    catch (e) {
        console.log(e)
    }
}