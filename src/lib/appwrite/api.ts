import {ID} from 'appwrite';
import {INewUser} from "@/types";
import {account} from "@/lib/appwrite/config.ts";

export async function createUserAccount(user: INewUser) {
    try {
        return account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name,
        );
    }
    catch (e) {
        console.log(e);
        return e;
    }
}