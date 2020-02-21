import {WhiteWebSdk, DeviceType} from "white-react-sdk";
import {isMobile} from "react-device-detect";
let whiteWebSdk;
if (isMobile) {
    whiteWebSdk = new WhiteWebSdk({deviceType: DeviceType.Touch});
} else {
    whiteWebSdk = new WhiteWebSdk({deviceType: DeviceType.Desktop});
}
export default whiteWebSdk;
