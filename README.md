# react-native-vlcplayer-wrap

A `<VLCPlayer>` component for react-native
This project refers to [react-native-video] (https://github.com/react-native-community/react-native-video).
[react-native-vlcplayer](https://github.com/xiongchuan86/react-native-vlcplayer),
[react-native-vlc-player](https://github.com/ghondar/react-native-vlc-player),
[react-native-vlc-yz-player](https://github.com/xuyuanzhou/react-native-vlcplayer-wrap)

VLCPlayer supports various formats (mp4, m3u8, flv, mov, rtsp, rtmp, etc.), see [vlc wiki] (https://wiki.videolan.org/Documentation:Documentation/)

[https://code.videolan.org/videolan/VLCKit](https://code.videolan.org/videolan/VLCKit)

## Example project

   [https://github.com/xuyuanzhou/vlcplayerExample](https://github.com/xuyuanzhou/vlcplayerExample)

   ![](https://github.com/xuyuanzhou/resource/blob/master/gif/lizi.gif)


## Xcode10+ Some problems

(1) libstdc++.6.0.9.tbd could not be found
      In Xcode10, libstdc++.6.0.9.tbd has been removed, and we have removed it and it is OK.

(2) The situation of compiling the card (currently only wait for the official to fix this problem)

    [https://forums.developer.apple.com/thread/107570](https://forums.developer.apple.com/thread/107570)

    (1) Remove DSYM

    Project Build Settings --> Build Options --> Debug Information Format is set to DWARF.

    ![](./images/dsym.png)

    (2) Compile to the following version of Xcode10

###  install

     `npm install react-native-vlcplayer-wrap --save`

## android setup

android vlc-sdk from:[https://github.com/mengzhidaren/Vlc-sdk-lib](https://github.com/mengzhidaren/Vlc-sdk-lib)

step 1:

Run `react-native link react-native-vlcplayer-wrap`


## ios setup

combined from  [react-native-vlcplayer](https://github.com/xiongchuan86/react-native-vlcplayer) 。

reference: [https://code.videolan.org/videolan/VLCKit](https://code.videolan.org/videolan/VLCKit)

step 1:

   Run `react-native link react-native-vlcplayer-wrap`

step 2:

   download  MobileVLCKit.framework from  [nightlies.videolan.org/build/iOS/](http://nightlies.videolan.org/build/iOS/)

step 3:

   create a folder named vlcKit, and copy MobileVLCKit.framework in this folder.

   ![](./images/7.png)

step 4:

   In XCode, in the project navigator, right click Frameworks -> Add Files to [your project's name], go to `/vlckit` and add MobileVLCKit.framework


   ![](./images/2.png)

   ![](./images/3.png)

step 5:

   add framework search path:      `$(PROJECT_DIR)/../vlcKit`

   ![](./images/1.png)


step 6:

   Select your project. Add the following libraries to your project's Build Phases -> Link Binary With Libraries:

   * AudioToolbox.framework
   * VideoToolbox.framework
   * CoreMedia.framework
   * CoreVideo.framework
   * CoreAudio.framework
   * AVFoundation.framework
   * MediaPlayer.framework
   * libstdc++.6.0.9.tbd
   * libiconv.2.tbd
   * libc++.1.tbd
   * libz.1.tbd
   * libbz2.1.0.tbd

step 7:

   set `Enable Bitcode`  to  `no`

   Build Settings ---> search  Bitcode

   ![](./images/4.png)


step 8:

  set project deployment target  `9.3`



## other react-native plugins

   1. npm install react-native-orientation --save

      react-native link react-native-orientation

   2. npm install react-native-slider --save

   3. npm install react-native-vector-icons --save

      react-native link react-native-vector-icons


## Static Methods

`seek(seconds)`

```
android:
    this.vlcplayer.seek(100); //  unit(单位)  ms
ios:
    this.vlcplayer.seek(0.1); //  0 --- 1 视频位置进度


this.vlcPlayer.resume(autoplay) //重新加载视频进行播放,autopaly: true 表示播放 false表示暂停

this.vlcPlayer.play(bool)       // true: play the video   false: paused the video


this.vlcPlayer.snapshot(path)  // path: string  存储的文件的路径。


```

##  VLCPlayer props

    import { VLCPlayer } from 'eact-native-vlcplayer-wrap';

   | props       | type     |  value  |   describe |
   | --------    | :----:   |  :----:  |   :----:   |
   | paused      | bool     |         |            |
   | muted       | bool     |         |            |
   | volume      | bool     | 0---200 |            |
   | hwDecoderEnabled | number  | 0  or  1 |   (Only android)  need  use with hwDecoderForced |
   | hwDecoderForced  | number  | 0  or  1 |   (Only android)  need  use with hwDecoderEnabled|
   | initType    | number   |         |            |
   | initOptions | array    |         |            |
   | mediaOptions| object   |         |            |
   | source      | object   | { uri: 'http:...' }| |
   | autoplay    | bool     |       |  是否自动播放（默认false）        |
   | onLoadStart | func     |       |  vlc视频容器初始化完毕  |
   | onOpen      | func     |       |  视频被打开            |
   | onBuffering | func     |       |  正在缓冲中           |
   | onProgress  | func     | { currentTime:1000,duration:1000 }  unit：ms    |  视频进度发生改变     |
   | onEnd       | func     |       |  视频播放结束        |
   | onPlaying   | func     |       |  视频正在播放        |
   | onPaused    | func     |       |  视频暂停           |
   | onError     | func     |       |  播放视频出错       |
   | onStopped   | func     |       |  视频停止播放(直播视频请根据这个判断) |
   | onIsPlaying | func     | {isPlaying:true}   |  视频是否正在播放       |


   ```
      initType:   1,2     default value: 1
        example:
             ios:
                   1: [[VLCMediaPlayer alloc] init]
                   2: [[VLCMediaPlayer alloc] initWithOptions:options];

   ```

   initOptions:

   [https://wiki.videolan.org/VLC_command-line_help](https://wiki.videolan.org/VLC_command-line_help)

   [https://www.cnblogs.com/waimai/p/3342739.html](https://www.cnblogs.com/waimai/p/3342739.html)



   ```
      onBuffer:

        android: {
                    isPlaying: true,
                    bufferRate: 70,
                    duration: 0,
                 }

            ios: {
                   duration: 0,
                   isPlaying: true,
                 }

      onProgress:

                {
                    currentTime: 1000        ms
                    duration: 5000           ms
                }

      onIsPlaying:

                {
                    isPlaying: true
                }



   ```

## Callback function simple description (currently encountered)
 ```
                                                        Support platform
           onEnd            end                         ios     android
           onBuffering      Buffering                   ios     ndroid
           onError          error
           onPlaying        playback                    ios     android
           onPaused         pause                       ios     android
           onOpen           open                                android
           onLoadStart      Vlc video initialized       ios     android
           onProgress       progress changes            ios     android          swf格式不支持

           Callback function order :  onLoadStart  ---> onOpen
 ```


##  use plugin
````
   Import { VLCPlayer, VlCPlayerView } from 'eact-native-vlcplayer-wrap';
   Import Orientation from 'react-native-orientation';

   (1)
       Android:
           This.vlcplayer.seek(100); // The unit is ms
       Ios:
           This.vlcplayer.seek(0.1); // 0 --- 1 video location progress
  (2)
       <VLCPlayer
           Ref={ref => (this.vlcPlayer = ref)}
           Style={[styles.video]}
           /**
            * Increase the video aspect ratio, the video will stretch according to this ratio
            * Do not set according to the default ratio
            */
           videoAspectRatio="16:9"
           /**
            * Whether to pause playback
            */
           Paused={this.state.paused}
           /**
            * Resource path
            * Local resources are not supported at this time
            */
           Source={{ uri: this.props.uri}}
           /**
            * Progress
            * Returns {currentTime:1000, duration:1000}
            * Unit is ms
            * currentTime: current time
            * duration: total time
            */
           onProgress={this.onProgress.bind(this)}
           /**
            * End of video playback
            */
           onEnd={this.onEnded.bind(this)}
           /**
            * Being cached
            */
           onBuffering={this.onBuffering.bind(this)}
           /**
            * Error playing video
            */
           onError={this._onError}
           /**
            * Video stops
            */
           onStopped={this.onStopped.bind(this)}
           /**
            * Video playback
            */
           onPlaying={this.onPlaying.bind(this)}
           /**
            * Video pause
            */
           onPaused={this.onPaused.bind(this)}
           /**
            * Video is opened
            /
           onOpen={this._onOpen}
           /**
            * vlc video container is initialized
            * Set the progress of playback here, whether to start playing
            */
           onLoadStart={()=>{
                   If(Platform.OS === 'ios'){
                       this.vlcPlayer.seek(0); //Set the playback progress
                   }else{
                       this.vlcPlayer.seek(0); //Set the time of playback
                   }
                   this.setState({
                     Paused: true,
                   },()=>{
                     this.setState({
                       Paused: false,
                     });
                   })
           }}
       />

````

## Available Sources

Hong Kong Finance, rtmp://202.69.69.180:443/webcast/bshdlive-pc

Hunan Satellite TV, rtmp://58.200.131.2:1935/livetv/hunantv

Rtsp://184.72.239.149/vod/mp4://BigBuckBunny_175k.mov


## Version Simple Description

````
     1.1.1-beta7:
         (1) increase autoAspectRatio bool (only on Android)
             Full Android full screen
````


## Simple Example

````
   (1)
      1. npm install react-native-orientation --save

         react-native link react-native-orientation

      2. npm install react-native-slider --save

      3. npm install react-native-vector-icons --save

         react-native link react-native-vector-icons

   (2)

       import { VLCPlayer, VlcSimplePlayer } from 'eact-native-vlcplayer-wrap';
       import Orientation from 'react-native-orientation';

       <VlcSimplePlayer
           ref={ ref => this.vlCPlayerView = ref}
           url={"rtmp://live.hkstv.hk.lxdns.com/live/hks"}
           Orientation={Orientation}
       />

       note:
        The "1" plugin uses the aspect ratio (1.1.1-beta1 and below) as shown below by default.
            fullVideoAspectRatio: deviceHeight + ':' + deviceWidth,
            videoAspectRatio: deviceWidth + ':' + 211.5,
            (1) In the case of vertical screen, there will be problems with the aspect ratio. Please set the aspect ratio or remove the built-in aspect ratio.
            (2) If the default height is modified in a non-full screen, please set the aspect ratio or remove the built-in aspect ratio.
                Remove the built-in aspect ratio:
                            fullVideoAspectRatio={""}
                            videoAspectRatio={""}
        "2" is not automatically played by default, you need to automatically play, please add the following parameters
             Autoplay={true}

        "3" You can customize the text with the following parameters:
                endingViewText: {
                    endingText: 'End of video playback',
                    reloadBtnText: 'Replay',
                    nextBtnText: 'next'
                },
                errorViewText: {
                    errorText: 'Video playback error',
                    reloadBtnText: 'Replay',
                },
                vipEndViewText: {
                    vipEndText: 'Try to end',
                    boughtBtnText: 'Please buy and buy now,'
                },

      Here are some of the parameters available:

       Static propTypes = {

        /**
            * vlc play type related
            */
               // Ad initialization type
               initAdType: PropTypes.oneOf([1,2]),
               // Advertising initialization parameters
               initAdOptions: PropTypes.array,

               // Video initialization type
               initType: PropTypes.oneOf([1,2]),
               // Video initialization parameters
               initOptions: PropTypes.array,

           /**
            * Live broadcast related
            */
                //Do you live?
                isLive: PropTypes.bool,
                // Whether it automatically reload live
                autoReloadLive: PropTypes.bool,

           /**
            * Advertising related
            */
               // Whether to display ads
               showAd: PropTypes.bool,
               //Ad url
               adUrl: PropTypes.oneOfType([PropTypes.string,PropTypes.number]).isRequired,
               //Reload including ads
               reloadWithAd: PropTypes.bool,
               //End of the ad title
               onAdEnd: PropTypes.func,
               //Is the ad playing?
               onIsAdPlaying: PropTypes.func,


           /**
            * Screen related
            */
           // initialized in full screen
           initWithFull: PropTypes.bool,
           // Turn on the full screen callback function
           onStartFullScreen: PropTypes.func,
           // Turn off the full screen callback function
           onCloseFullScreen: PropTypes.func,

           /**
            * Video related
            */
               // Video path:
               // string: local or network resource path
               // number: require('./resource/1.mp4')
               Url: PropTypes.oneOfType([PropTypes.string,PropTypes.number]).isRequired,
               // Video playback ends
               onEnd: PropTypes.func,
               // Is it playing?
               onIsPlaying: PropTypes.func,
               // Already watched the time
               lookTime: PropTypes.number,
               // total time
               totalTime: PropTypes.number,
               // Is there a next video source?
               hadNext: PropTypes.bool,
               // Automatically play the next video
               autoPlayNext: PropTypes.bool,
               // Automatic repeat play
               autoRePlay: PropTypes.bool,

           /**
            * Style related
            */
               // Video style
               Style: PropTypes.object,
               // full screen video style
               fullStyle: PropTypes.object,
               // Do you need to consider statusBar only for ios
               considerStatusBar: PropTypes.bool,
               //Do you show the top?
               showTop: PropTypes.bool,
               //title
               Title: PropTypes.string,
               // Whether to display the title
               showTitle: PropTypes.bool,
               // Whether to display the return button
               showBack: PropTypes.bool,
               // Back button click event
               onLeftPress: PropTypes.func,

           /**
            * vip related
            */
               // Whether to use vip
               useVip: PropTypes.bool,
               // Non-vip viewing length
               vipPlayLength: PropTypes.number,
         };

````

````
    /**
     * Sample React Native App
     * https://github.com/facebook/react-native
     *
     * @format
     * @flow
     */

    import React, {Component} from 'react';
    import {StyleSheet, View} from 'react-native';
    import {VlcSimplePlayer, VLCPlayer}  from 'eact-native-vlcplayer-wrap';


    export default class App extends Component<Props> {
        render() {
            return (
                <View style={styles.container}>
                <VlcSimplePlayer
                    autoplay={false}
                    url='rtsp://184.72.239.149/vod/mp4://BigBuckBunny_175k.mov'
                    initType={2}
                    hwDecoderEnabled={1}
                    hwDecoderForced={1}
                    initOptions={[
                        "--no-audio",
                        "--rtsp-tcp",
                        "--network-caching=" + 150,
                        "--rtsp-caching=" + 150,
                        "--no-stats",
                        "--tcp-caching=" + 150,
                        "--realrtsp-caching=" + 150,
                    ]}
                />
                <VLCPlayer
                    style={{width:"100%",height:200,marginTop:30}}
                    source={{uri:'rtsp://184.72.239.149/vod/mp4://BigBuckBunny_175k.mov'}}
                    initType={2}
                    initOptions={[
                        "--network-caching=" + 150,
                        "--rtsp-caching=" + 150,
                        "--no-stats",
                        "--tcp-caching=" + 150,
                        "--realrtsp-caching=" + 150,
                    ]}
            />
            </View>
        );
        }
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F5FCFF',
        },
    });

````


**MIT Licensed**
