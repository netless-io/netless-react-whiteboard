import * as React from "react";

import "./WhiteboardChat.less";

import {
    ThemeProvider,
    MessageGroup,
    Message,
    MessageText,
    MessageList,
    TextComposer,
    Row,
    TextInput,
    SendButton,
} from "@livechat/ui-kit";

import {Room} from "white-web-sdk";
import {MessageType} from "./WhiteboardBottomRight";
import {netlessWhiteboardApi} from "../../apiMiddleware";

function sleep(duration: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
}

export type WhiteboardChatProps = {
    room?: Room;
    messages: MessageType[];
    userId: string;
};

export type WhiteboardChatStates = {
    messages: MessageType[];
    url: string;
};


class WhiteboardChat extends React.Component<WhiteboardChatProps, WhiteboardChatStates> {

    private messagesEnd: HTMLDivElement | null = null;

    public constructor(props: WhiteboardChatProps) {
        super(props);
        this.state = {
            messages: [],
            url: "",
        };
        this.scrollToBottom = this.scrollToBottom.bind(this);
    }

    private scrollToBottom(): void {
        this.messagesEnd!.scrollIntoView({behavior: "smooth"});
    }

    public async componentDidMount(): Promise<void> {
        await sleep(0);
        this.scrollToBottom();
        const canvasArray: any = document.getElementsByClassName("identicon").item(0);
        const url = canvasArray.toDataURL();
        this.setState({url: url});
    }

    public async componentWillReceiveProps(): Promise<void> {
        await sleep(0);
        this.scrollToBottom();
    }

    public render(): React.ReactNode {
        const messages: MessageType[] = this.props.messages; // 有很多内容
        const user = netlessWhiteboardApi.user.getUser(this.props.userId)!;

        if (messages.length > 0) {
            let previousName = messages[0].name;
            let previousId = messages[0].id;

            for (let i = 1; i < messages.length; ++ i) {
                const message = messages[i];
                if (previousName === message.name && previousId === message.id) {
                    console.log(messages);
                    messages[i - 1].messageInner.push(...message.messageInner);
                    messages.splice(i, 1);
                    i --;
                }
                previousName = message.name;
                previousId = message.id;
            }
        }
        let messageNodes: React.ReactNode = null;
        if (messages.length > 0) {
            messageNodes = messages.map((data: MessageType, index: number) => {
                const messageTextNode = data.messageInner.map((inner: string, index: number) => {
                    return (
                        <Message key={`${index}`} isOwn={user.userId === data.id} authorName={data.name}>
                            <MessageText>{inner}</MessageText>
                        </Message>
                    );
                });
                return (
                    <MessageGroup
                        key={`${index}`}
                        avatar={data.avatar}
                        isOwn={user.userId === data.id}
                        onlyFirstWithMeta>
                        {messageTextNode}
                    </MessageGroup>
                );
            });
        }
        return (
            <div className="chat-box">
                <ThemeProvider
                    theme={{
                        vars: {
                            "avatar-border-color": "#005BF6",
                        },
                        FixedWrapperMaximized: {
                            css: {
                                boxShadow: "0 0 1em rgba(0, 0, 0, 0.1)",
                            },
                        },
                        Message: {},
                        MessageText: {
                            css: {
                                backgroundColor: "#F8F8F8",
                                borderRadius: 8,
                            },
                        },
                        Avatar: {
                            size: "32px", // special Avatar's property, supported by this component
                            css: { // css object with any CSS properties
                                borderColor: "blue",
                            },
                        },
                        TextComposer: {
                            css: {
                                "color": "#000",
                            },
                        },
                    }}
                >
                    <div>
                        <div className="chat-box-message">
                            {messageNodes !== null && <MessageList>
                                {messageNodes}
                            </MessageList>}
                            <div className="under-cell" ref={ref => this.messagesEnd = ref}/>
                        </div>
                        <div className="chat-box-input">
                            <TextComposer
                                onSend={(event: any) => {
                                    if (this.props.room) {
                                        this.props.room.dispatchMagixEvent("message", {
                                            name: user.name.substring(0, 6),
                                            avatar: this.state.url,
                                            id: user.userId,
                                            messageInner: [event],
                                        });
                                    }
                                }}>
                                <Row align="center">
                                    <TextInput fill="true"/>
                                    <SendButton fit />
                                </Row>
                            </TextComposer>
                        </div>
                    </div>
                </ThemeProvider>
            </div>
        );
    }
}


export default WhiteboardChat;
