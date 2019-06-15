import * as React from "react";

import SelectorIcon from "../assets/image/selector.svg";
import PencilIcon from "../assets/image/pencil.svg";
import TextIcon from "../assets/image/text.svg";
import EraserIcon from "../assets/image/eraser.svg";
import EllipseIcon from "../assets/image/ellipse.svg";
import RectangleIcon from "../assets/image/rectangle.svg";

import Identicon from "react-identicons";

import {CursorAdapter, CursorDescription, Cursor, RoomMember} from "white-react-sdk";

type CursorComponentProps = {
    roomMember: RoomMember;
};

type ApplianceDescription = {
    readonly iconUrl: string;
    readonly hasColor: boolean;
    readonly hasStroke: boolean;
};

class CursorComponent extends React.Component<CursorComponentProps, {}> {

    private static readonly descriptions: {readonly [applianceName: string]: ApplianceDescription} = Object.freeze({
        selector: Object.freeze({
            iconUrl: SelectorIcon,
            hasColor: false,
            hasStroke: false,
        }),
        pencil: Object.freeze({
            iconUrl: PencilIcon,
            hasColor: true,
            hasStroke: true,
        }),
        text: Object.freeze({
            iconUrl: TextIcon,
            hasColor: true,
            hasStroke: false,
        }),
        eraser: Object.freeze({
            iconUrl: EraserIcon,
            hasColor: false,
            hasStroke: false,
        }),
        ellipse: Object.freeze({
            iconUrl: EllipseIcon,
            hasColor: true,
            hasStroke: true,
        }),
        rectangle: Object.freeze({
            iconUrl: RectangleIcon,
            hasColor: true,
            hasStroke: true,
        }),
    });

    private iconUrl = (name: string): string => {
        return CursorComponent.descriptions[name].iconUrl;
    }

    public render(): React.ReactNode {
        const {roomMember} = this.props;
        const color = `rgb(${roomMember.memberState.strokeColor[0]}, ${roomMember.memberState.strokeColor[1]}, ${roomMember.memberState.strokeColor[2]})`;
        return <div>
            <div style={{borderColor: color}} className="cursor-box">
                <Identicon
                    size={24}
                    string={roomMember.information.avatar}/>
            </div>
            <div style={{backgroundColor: color}}  className="cursor-box-tool">
                <img src={this.iconUrl(roomMember.memberState.currentApplianceName)}/>
            </div>
        </div>;

    }
}

export class UserCursor implements CursorAdapter {

    private readonly cursors: {[memberId: number]: Cursor} = {};
    private roomMembers: ReadonlyArray<RoomMember> = [];

    public createCursor(memberId: number): CursorDescription {
        return {x: 16, y: 16, width: 32, height: 32};
    }

    public onAddedCursor(cursor: Cursor): void {
        for (const roomMember of this.roomMembers) {
            if (roomMember.memberId === cursor.memberId) {
                cursor.setReactNode((
                    <CursorComponent roomMember={roomMember} />
                ));
                break;
            }
        }
        this.cursors[cursor.memberId] = cursor;
    }

    public onRemovedCursor(cursor: Cursor): void {
        delete this.cursors[cursor.memberId];
    }

    public refreshRoomMembers(roomMembers: ReadonlyArray<RoomMember>): void {
        this.roomMembers = roomMembers;
        for (const roomMember of roomMembers) {
            const cursor = this.cursors[roomMember.memberId];
            if (cursor) {
                cursor.setReactNode((
                    <CursorComponent roomMember={roomMember} />
                ));
            }
        }
    }
}
