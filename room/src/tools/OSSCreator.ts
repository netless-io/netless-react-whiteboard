import * as OSS from "ali-oss";

export type OSSBucketInformation = {
    readonly bucket: string;
    readonly folder: string;
    readonly prefix: string;
};

export type OSSOptions = OSSBucketInformation & {
    readonly accessKeyId: string;
    readonly accessKeySecret: string;
    readonly region: string;
};

export function createOSS(options: OSSOptions): OSS {
    return new OSS({
        accessKeyId: options.accessKeyId,
        accessKeySecret: options.accessKeySecret,
        region: options.region,
        bucket: options.bucket,
    });
}


