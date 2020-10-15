import Fetcher from "@netless/fetch-middleware";
import {netlessToken} from "../AppOptions";

const fetcher = new Fetcher(5000, "https://console-api.netless.link");

export class RoomOperator {

    public async createRoomApi(name: string, limit: number, isRecord: boolean): Promise<any> {
        const json = await fetcher.post<any>({
            path: `v5/rooms`,
            headers: {token: netlessToken.sdkToken},
            body: {
                name: name,
                limit: limit,
                isRecord: isRecord,
            },
        });
        return json as any;
    }

    public async joinRoomApi(uuid: string): Promise<any> {
        const json = await fetcher.post<any>({
            path: `v5/tokens/rooms/${uuid}`,
            headers: {token: netlessToken.sdkToken},
            body: {
                role: "writer",
                lifespan: 0,
            },
        });
        return json as any;
    }

    public async staticConversionApi(sourceUrl: string, targetBucket: string, targetFolder: string): Promise<any> {
        const json = await fetcher.post<any>({
            path: `services/static-conversion/tasks`,
            query: {
                token: netlessToken.sdkToken,
            },
            body: {
                sourceUrl: sourceUrl,
                targetBucket: targetBucket,
                targetFolder: targetFolder,
            },
        });
        return json as any;
    }
}
