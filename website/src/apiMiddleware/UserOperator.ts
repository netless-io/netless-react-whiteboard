import {v1} from "uuid";

export type UserInf = {
    readonly userId: string;
    readonly name: string;
    readonly uuid: string;
};

export class UserOperator {

    public getUserAndCreateIfNotExit(userId: string): UserInf {
        let user = this.getUser(userId);
        if (!user) {
            user = this.createUser(userId);
        }
        return user;
    }

    public createUser(name: string = "Netless user"): UserInf {
        const user: UserInf = Object.freeze({
            userId: "" + Math.floor(Math.random() * 10000),
            uuid: v1(),
            name: name,
        });
        localStorage.setItem(user.userId, JSON.stringify(user));

        return user;
    }

    public getUser(userId: string): UserInf | undefined {
        let user: UserInf | undefined = undefined;
        const json = localStorage.getItem(userId);

        if (json) {
            try {
                user = Object.freeze(JSON.parse(json));

            } catch (error) {
                console.error(error);
                localStorage.removeItem(userId);
            }
        }
        return user;
    }

    public clearUsers(): void {
        localStorage.clear();
    }
}
