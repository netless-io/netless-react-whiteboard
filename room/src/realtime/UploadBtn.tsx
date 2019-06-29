import * as React from "react";
import * as OSS from "ali-oss";

import ImageIcon from "../assets/image/image.svg";
import DocToImageIcon from "../assets/image/doc_to_image.svg";
import DocToWebIcon from "../assets/image/doc_to_web.svg";

import Popover from "antd/lib/popover";
import Upload from "antd/lib/upload";

import {PptKind, Room, WhiteWebSdk} from "white-react-sdk";
import {ToolBoxUpload} from "../components";
import {PPTProgressListener, UploadManager, OSSBucketInformation} from "../tools";

export type ToolBoxUploadBoxState = {
    toolBoxColor: string,
};

export const FileUploadStatic: string = "application/pdf, " +
    "application/vnd.openxmlformats-officedocument.presentationml.presentation, " +
    "application/vnd.ms-powerpoint, " +
    "application/msword, " +
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type UploadBtnProps = OSSBucketInformation & {
    readonly oss: OSS;
    readonly room: Room;
    readonly roomToken: string;
    readonly sdk: WhiteWebSdk;
    readonly whiteboardRef?: HTMLDivElement;
    readonly onProgress?: PPTProgressListener;
};

export default class UploadBtn extends React.Component<UploadBtnProps, ToolBoxUploadBoxState> {

    private readonly oss: OSS;

    public constructor(props: UploadBtnProps) {
        super(props);
        this.oss = props.oss;
        this.state = {
            toolBoxColor: "#A2A7AD",
        };
    }

    private uploadStatic = (event: any) => {
        const uploadManager = new UploadManager(this.oss, this.props.room);
        const pptConverter = this.props.sdk.pptConverter(this.props.roomToken!);

        uploadManager.convertFile(
            event.file,
            pptConverter,
            PptKind.Static,
            {
                bucket: this.props.bucket,
                folder: this.props.folder,
                prefix: this.props.prefix,
            },
            this.props.onProgress).catch(error => alert("upload file error" + error),
        );
    }

    private uploadDynamic = (event: any) => {
        const uploadManager = new UploadManager(this.oss, this.props.room);
        const pptConverter = this.props.sdk.pptConverter(this.props.roomToken!);
        uploadManager.convertFile(
            event.file,
            pptConverter,
            PptKind.Dynamic,
            {
                bucket: this.props.bucket,
                folder: this.props.folder,
                prefix: this.props.prefix,
            },
            this.props.onProgress,
        ).catch(error => alert("upload file error" + error));
    }

    private uploadImage = (event: any) => {
        const uploadFileArray: File[] = [];
        uploadFileArray.push(event.file);
        const uploadManager = new UploadManager(this.oss, this.props.room);
        if (this.props.whiteboardRef) {
            const {clientWidth, clientHeight} = this.props.whiteboardRef;
            uploadManager.uploadImageFiles(uploadFileArray, clientWidth / 2, clientHeight / 2, this.props.onProgress)
                .catch(error => alert("upload file error" + error));
        } else {
            const clientWidth = window.innerWidth;
            const clientHeight = window.innerHeight;
            uploadManager.uploadImageFiles(uploadFileArray, clientWidth / 2, clientHeight / 2, this.props.onProgress)
                .catch(error => alert("upload file error" + error));
        }
    }

    private renderPopoverContent = (): React.ReactNode => {
        return (
            <div className="popover-box">
                <Upload disabled={!this.props.roomToken}
                        accept={FileUploadStatic}
                        showUploadList={false}
                        customRequest={this.uploadStatic}>
                    <div className="popover-box-cell">
                        <div className="popover-box-cell-img-box">
                            <img src={DocToImageIcon} style={{height: 28}}/>
                        </div>
                        <div className="popover-box-cell-title">
                            资料转图片
                        </div>
                        <div className="popover-box-cell-script">支持 pdf、ppt、pptx、word</div>
                    </div>
                </Upload>
                <Upload disabled={!this.props.roomToken}
                        accept={"application/vnd.openxmlformats-officedocument.presentationml.presentation"}
                        showUploadList={false}
                        customRequest={this.uploadDynamic}>
                    <div className="popover-box-cell">
                        <div className="popover-box-cell-img-box">
                            <img src={DocToWebIcon} style={{height: 28}}/>
                        </div>
                        <div className="popover-box-cell-title">
                            资料转网页
                        </div>
                        <div className="popover-box-cell-script">支持 pptx</div>
                    </div>
                </Upload>
                <Upload disabled={!this.props.roomToken}
                        accept={"image/*"}
                        showUploadList={false}
                        customRequest={this.uploadImage}>
                    <div className="popover-box-cell">
                        <div className="popover-box-cell-img-box">
                            <img src={ImageIcon} style={{height: 28}}/>
                        </div>
                        <div className="popover-box-cell-title">
                            上传图片
                        </div>
                        <div className="popover-box-cell-script">支持常见图片格式</div>
                    </div>
                </Upload>
            </div>
        );
    }

    public render(): React.ReactNode {
        return (
            <Popover content={this.renderPopoverContent()}>
                <div className="tool-box-cell-box"
                     onMouseEnter={() => this.setState({toolBoxColor: "#141414"})}
                     onMouseLeave={() => this.setState({toolBoxColor: "#A2A7AD"})}>
                    <div className="tool-box-cell">
                        <ToolBoxUpload color={this.state.toolBoxColor}/>
                    </div>
                </div>
            </Popover>
        );
    }
}
