import { PixelRatio, Dimensions, Platform, StatusBar } from 'react-native';
let initialDeviceHeight = 667;
let initialDeviceWidth = 375;
let initialPixelRatio = 2;
let deviceHeight = Dimensions.get('window').height;
let deviceWidth = Dimensions.get('window').width;
let pixelRatio = PixelRatio.get();
let statusBarHeight = 20; //Initial status bar height
let topBarHeight = 44; //Initial navigation bar height
let tabBarHeight = 49; //Initial tab bar height
let IS_IPHONEX = false;
let changeRatio = Math.min(
  deviceHeight / initialDeviceHeight,
  deviceWidth / initialDeviceWidth,
); //pixelRatio/initialPixelRatio;

let pxWidth = deviceWidth * pixelRatio;

changeRatio = changeRatio.toFixed(2);
if (deviceWidth > 375 && deviceWidth <= 1125 / 2) {
  statusBarHeight = 27;
  topBarHeight = 66;
  tabBarHeight = 60;
} else if (deviceWidth > 1125 / 2) {
  statusBarHeight = 30;
  topBarHeight = 66;
  tabBarHeight = 60;
}

/**
 * iphone4 ---- iphone6
 */
if (pxWidth <= 750) {
  statusBarHeight = 40 / pixelRatio;
  topBarHeight = 44 / pixelRatio;
  tabBarHeight = 49 / pixelRatio;
} else if (750 < pxWidth && pxWidth <= 1125) {
  statusBarHeight = 54 / pixelRatio;
  topBarHeight = 132 / pixelRatio;
  tabBarHeight = 147 / pixelRatio;
} else {
  statusBarHeight = 60 / pixelRatio;
  topBarHeight = 132 / pixelRatio;
  tabBarHeight = 147 / pixelRatio;
}

if (Platform.OS !== 'ios') {
  statusBarHeight = 20;
  if (deviceWidth > 375 && deviceWidth <= 1125 / 2) {
    statusBarHeight = 25;
  } else if (deviceWidth > 1125 / 2 && deviceWidth < 812) {
    statusBarHeight = 25;
  }
  if (StatusBar.currentHeight) {
    statusBarHeight = StatusBar.currentHeight;
  }
}

if (deviceWidth >= 375 && deviceWidth < 768) {
  changeRatio = 1;
}
if (deviceHeight >= 812) {
  statusBarHeight = 44;
  IS_IPHONEX = true;
}
/**
 * Returns status bar height
 */
export function getStatusBarHeight() {
  return statusBarHeight;
}
/**
 * Returns the height of the navigation bar
 */
export function getTopBarHeight() {
  return topBarHeight;
}
/**
 * Returns the height of the tab bar
 */
export function getTabBarHeight() {
  return tabBarHeight;
}
/**
 * Returns the top height
 */
export function getTopHeight() {
  if (Platform.OS === 'ios') {
    return topBarHeight + statusBarHeight;
  } else {
    return topBarHeight + statusBarHeight;
  }
}
/**
 * Returns change ratio
 */
export function getChangeRatio() {
  return changeRatio;
}
/** Gets the tab bar ratio**/
export function getTabBarRatio() {
  return tabBarHeight / 49;
}

/**
 * Gets the top bar ratio
 */
export function getTopBarRatio() {
  return changeRatio;
}

export function isIphoneX() {
  return IS_IPHONEX;
}
