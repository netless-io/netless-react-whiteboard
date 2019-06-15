import {UserOperator} from "./UserOperator";
import {RoomOperator} from "./RoomOperator";

export const netlessWhiteboardApi = Object.freeze({
    user: new UserOperator(),
    room: new RoomOperator(),
});
