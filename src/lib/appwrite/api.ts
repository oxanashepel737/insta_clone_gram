import {ID, Query} from 'appwrite';
import {INewPost, INewUser} from "@/types";
import {account, appWriteConfig, avatars, databases, storage} from "@/lib/appwrite/config.ts";


// ============================================================
// AUTH
// ============================================================

// ============================== SIGN UP
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

        return await saveUserToDB({
            accountId: newAccount.$id,
            name: newAccount.name,
            email: newAccount.email,
            username: user.username,
            imageUrl: avatarUrl,
        });
    } catch (e) {
        console.log(e);
        return e;
    }
}

// ============================== SAVE USER TO DB
export async function saveUserToDB(user: {
    accountId: string;
    email: string;
    name: string;
    imageUrl: URL;
    username?: string;
}) {
    try {
        return await databases.createDocument(
            appWriteConfig.databaseId,
            appWriteConfig.userCollectionId,
            ID.unique(),
            user
        );
    } catch (error) {
        console.log(error);
    }
}

// ============================== SIGN IN
export async function signInAccount(user: { email: string; password: string }) {
    try {
        return await account.createEmailSession(user.email, user.password);
    } catch (e) {
        console.log(e);
    }
}

// ============================== GET USER
export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;
        const currentUser = await databases.listDocuments(
            appWriteConfig.databaseId,
            appWriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]);
        if (!currentUser) throw Error;
        return currentUser.documents[0];
    } catch (e) {
        console.log(e);
        return null;
    }
}

// ============================== SIGN OUT
export async function signOutAccount() {
    try {
        return await account.deleteSession('current')
    } catch (e) {
        console.log(e)
    }
}

// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post: INewPost) {
    try {
        //Upload image to storage
        const uploadedFile = await uploadFile(post.file[0]);
        if (!uploadedFile) throw Error;

        // Get file url
        const fileUrl = getFilePreview(uploadedFile.$id);
        if (!fileUrl) {
            deleteFile(uploadedFile.$id)
            throw Error;
        }
        // Convert tags into an array
        const tags = post.tags?.replace(/ /g, '').split(',') || [];
        // Save post to database
        const newPost = await databases.createDocument(
            appWriteConfig.databaseId,
            appWriteConfig.postCollectionId,
            ID.unique(),
            {
                creator: post.userId,
                caption: post.caption,
                imageUrl: fileUrl,
                imageId: uploadedFile.$id,
                location: post.location,
                tags: tags
            }
        )
        if(!newPost) {
            await deleteFile(uploadedFile.$id);
            throw Error;
        }
        return newPost;
    } catch (e) {
        console.log(e)
    }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File) {
    try {
        return await storage.createFile(
            appWriteConfig.storageId,
            ID.unique(),
            file
        )
    } catch (e) {
        console.log(e)
    }
}

// ============================== GET FILE URL
export async function getFilePreview(fileId: string) {
    try {
        return storage.getFilePreview(
            appWriteConfig.storageId,
            fileId,
            2000,
            2000,
            'top',
            100
        )
    } catch (e) {
        console.log(e)
    }
}

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
    try {
        await storage.deleteFile(
            appWriteConfig.storageId,
            fileId
        )
        return {status: 'ok'}
    } catch (e) {
        console.log(e)
    }
}