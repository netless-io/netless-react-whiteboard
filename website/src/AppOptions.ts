import {OSSOptions} from "netless-whiteboard-room";

const config = require("./tokenConfig");

export const netlessToken = {
    sdkToken: config.netlessToken,
};

export const ossOptions: OSSOptions = Object.freeze({
    accessKeyId: config.ossConfigObj.accessKeyId,
    accessKeySecret: config.ossConfigObj.accessKeySecret,
    region: config.ossConfigObj.region,
    bucket: config.ossConfigObj.bucket,
    folder: config.ossConfigObj.folder,
    prefix: config.ossConfigObj.prefix,
});
