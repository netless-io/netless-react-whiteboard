import * as React from "react";

import "./MenuPPTDoc.less";

import PPTDatas from "./PPTDatas";
import {SceneDefinition, Room} from "white-react-sdk";

export type MenuPPTDocProps = {
    readonly room: Room;
};

export type MenuPPTDocState = {
    readonly docs: PPTDataType[];
    readonly activeDocData?: PPTDataType;
};

export type PPTDataType = {
    readonly id: number;
    readonly active: boolean;
    readonly cover: string;
    readonly data: ReadonlyArray<SceneDefinition>;
};

class MenuPPTDoc extends React.Component<MenuPPTDocProps, MenuPPTDocState> {

    public constructor(props: MenuPPTDocProps) {
        super(props);
        this.state = {
            docs: this.createDocs(),
        };
    }

    private createDocs(): PPTDataType[] {
        return PPTDatas.map((pptData: {active: boolean, id: number, data: string}) => {
            const dataObj = JSON.parse(pptData.data);
            return {
                active: pptData.active,
                cover: dataObj[0].ppt.src,
                id: pptData.id,
                data: dataObj,
            };
        });
    }

    private selectDoc = (id: number) => {
        const {room} = this.props;
        const activeData = this.state.docs!.find(data => data.id === id)!;

        this.setState({activeDocData: activeData});
        room.putScenes(`/defaultPPT${activeData.id}`, activeData.data);
        room.setScenePath(`/defaultPPT${activeData.id}/${activeData.data[0].name}`);

        const docsArray = this.state.docs.map(data => {
            const changeToActive = data.id === id;

            if (changeToActive === data.active) {
                return data;
            } else {
                return {...data, active: changeToActive};
            }
        });
        this.setState({docs: docsArray});
    }

    public render(): React.ReactNode {
        let docCells: React.ReactNode;
        if (this.state.docs.length > 0) {
            docCells = this.state.docs.map(data => {
                return (
                    <div key={`${data.id}`}
                         onClick={() => this.selectDoc(data.id)}
                         className="menu-ppt-inner-cell">
                        <div className="menu-ppt-image-box"
                             style={{backgroundColor: data.active ? "#A2A7AD" : "#525252"}}>
                            <svg key="" width={144} height={104}>
                                <image width="100%"
                                       height="100%"
                                       xlinkHref={data.cover + "?x-oss-process=style/ppt_preview"}
                                />
                            </svg>
                        </div>
                    </div>
                );
            });
        }

        return (
            <div className="menu-ppt-box">
                <div className="menu-ppt-line">
                    <div className="menu-ppt-text-box">
                        Documents
                    </div>
                </div>
                <div style={{height: 42}}/>
                <div style={{width: "100%", height: 24}}/>
                <div className="menu-ppt-inner-box">
                    {docCells}
                </div>
            </div>
        );
    }
}

export default MenuPPTDoc;
