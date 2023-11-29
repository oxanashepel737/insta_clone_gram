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
export function getFilePreview(fileId: string) {
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

// ============================== GET POSTS
export async function getRecentPosts() {
    try {
        const posts = await databases.listDocuments(
            appWriteConfig.databaseId,
            appWriteConfig.postCollectionId,
            [Query.orderDesc('$createdAt'), Query.limit(20)]
        )
        if (!posts) throw Error;
        return posts;
    }
    catch (e) {
        console.log(e)
    }
}

// ============================== LIKE / UNLIKE POST
export async function likePost(postId: string, likesArray: string[]) {
    try {
        const updatedPost = await databases.updateDocument(
            appWriteConfig.databaseId,
            appWriteConfig.postCollectionId,
            postId,
            {
                likes: likesArray
            }
        )
        if(!updatedPost) throw Error;
        return updatedPost;
    }
    catch (e) {
        console.log(e)
    }
}

// ============================== SAVE POST
export async function savePost(postId: string, userId: string) {
    try {
        const updatedPost = await databases.createDocument(
            appWriteConfig.databaseId,
            appWriteConfig.savesCollectionId,
            ID.unique(),
            {
                user: userId,
                post: postId
            }
        )
        if(!updatedPost) throw Error;
        return updatedPost;
    }
    catch (e) {
        console.log(e)
    }
}

// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string,) {
    try {
        const statusCode = await databases.deleteDocument(
            appWriteConfig.databaseId,
            appWriteConfig.savesCollectionId,
            savedRecordId,
        )
        if(!statusCode) throw Error;
        return {status: 'ok'};
    }
    catch (e) {
        console.log(e)
    }
}

// ============================== GET POST BY ID
export async function getPostById(postId: string) {
    try {
        return await databases.getDocument(
            appWriteConfig.databaseId,
            appWriteConfig.postCollectionId,
            postId
        )
    }
    catch (e) {
        console.log(e)
    }
}
