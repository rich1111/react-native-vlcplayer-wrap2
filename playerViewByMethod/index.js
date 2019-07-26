import React, { Component } from 'react';
import {
  StatusBar,
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Text,
  Dimensions,
  BackHandler,
  ActivityIndicator,
  Animated,
  NetInfo,
  Image,
  ScrollView
} from 'react-native';

import VLCPlayerView from './VLCPlayerView';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from 'react-native-slider';
import ControlBtn from './ControlBtn';
import TimeLimt from './TimeLimit';
import { getStatusBarHeight } from './SizeController';
const statusBarHeight = getStatusBarHeight();
const _fullKey = 'commonVideo_android_fullKey';
let deviceHeight = Dimensions.get('window').height;
let deviceWidth = Dimensions.get('window').width;

function getWH() {
  return {
    deviceHeight:  Dimensions.get('window').height,
    deviceWidth: Dimensions.get('window').width,
  }
}

const getTime = (data = 0) => {
  let hourCourse = Math.floor(data / 3600);
  let diffCourse = data % 3600;
  let minCourse = Math.floor(diffCourse / 60);
  let secondCourse = Math.floor(diffCourse % 60);
  let courseReal = '';
  if (hourCourse) {
    if (hourCourse < 10) {
      courseReal += '0' + hourCourse + ':';
    } else {
      courseReal += hourCourse + ':';
    }
  }
  if (minCourse < 10) {
    courseReal += '0' + minCourse + ':';
  } else {
    courseReal += minCourse + ':';
  }
  if (secondCourse < 10) {
    courseReal += '0' + secondCourse;
  } else {
    courseReal += secondCourse;
  }
  return courseReal;
};


export default class VlCPlayerViewByMethod extends Component {
  constructor(props) {
    super(props);
    this.url = '';
    this.touchTime = 0;
    this.initialCurrentTime = 0;
    this.initSuccess = false;
    this.firstPlaying = false;
    this.initAdLoadStart = false;
    this.isReloadingError = false;
    this.needReloadCurrent = false;
    this.autoplaySize = 0;
    this.autoplayAdSize = 0;
    this.autoReloadLiveSize = 0;
  }

  static navigationOptions = {
    header: null,
  };

  state = {
    isEndAd: false,
    isFull: false,
    showControls: false,
    showLoading: true,
    currentUrl: '',
    storeUrl: '',
    showChapter: false,
    isEnding: false,
    isVipPlayEnd: false,
    chapterPosition: new Animated.Value(-250),
    volume: 150,
    muted: false,
    adMuted: false,
    adVolume: 150,
    canShowVideo: true,
    pauseByAutoplay: false,
  };

  static defaultProps = {
    endingViewText: {
      endingText: 'End of video playback',
      reloadBtnText: 'Replay',
      nextBtnText: 'Next'
    },
    errorViewText: {
      errorText: 'Video playback error',
      reloadBtnText: 'Replay',
    },
    vipEndViewText: {
      vipEndText: 'End of the test',
      boughtBtnText: 'Please buy and watch now',
    },
    chapterText: 'Chapter',
    autoplay: false,
    showAd: false,
    showTop: false,
    adUrl: '',
    url: '',
    isLive: false,
    autoReloadLive: false,
    reloadWithAd: false,
    showBack: false,
    showTitle: false,
    autoPlayNext: false,
    autoRePlay: false,
    hadNext: false,
    useVip: false,
    useNetInfo: false,
    vipPlayLength: 180,
    endDiffLength: 5,
    lookTime: 0,
    totalTime: 0,
    initWithFull: false,
    considerStatusBar: false,
    style:{
    },
    fullStyle: {
      position:'absolute',
      width:'100%',
      height:'100%',
      top:0,
      left:0,
      zIndex: 9999,
    },
    initAdType: 2,
    initAdOptions: Platform.OS === 'ios' ? ["--input-repeat=1000","--repeat"] : [],
    initType: 1,
    initOptions: [],
    //fullVideoAspectRatio: deviceHeight + ':' + deviceWidth,
    //videoAspectRatio: deviceWidth + ':' + 211.5,
  };

  static propTypes = {

    /**
     * vlc Play type related
     */
    // Ad initialization type
    initAdType: PropTypes.oneOf([1,2]),
    // Ad initialization parameter
    initAdOptions: PropTypes.array,

    // Video initialization type
    initType: PropTypes.oneOf([1,2]),
    // Video initialization parameter
    initOptions: PropTypes.array,

    /**
     * Live broadcast related
     */
    // Live broadcast
    isLive: PropTypes.bool,
    // auto reload  live
    autoReloadLive: PropTypes.bool,

    /**
     * Advertising related
     */
    // Whether to show ads
    showAd:  PropTypes.bool,
    //Advertising url
    adUrl: PropTypes.oneOfType([PropTypes.string,PropTypes.number]).isRequired,
    // Reloading includes ads
    reloadWithAd: PropTypes.bool,
    // End of ad heading
    onAdEnd: PropTypes.func,
    //Whether the ad is playing
    onIsAdPlaying: PropTypes.func,


    /**
     * Screen related
     */
    // Initialize in full screen
    initWithFull: PropTypes.bool,
    //Turn on full screen callback function
    onStartFullScreen: PropTypes.func,
    //Turn off full screen callback function
    onCloseFullScreen: PropTypes.func,

    /**
     * Video related
     */

    //Video path:
    //string:  Local or network resource path
    //number:  require('./resource/1.mp4')
    url: PropTypes.oneOfType([PropTypes.string,PropTypes.number]).isRequired,
    //End of video playback
    onEnd: PropTypes.func,
    //Whether it is playing
    onIsPlaying: PropTypes.func,
    //Already watched
    lookTime: PropTypes.number,
    //total time
    totalTime: PropTypes.number,
    //Is there a next video source?
    hadNext: PropTypes.bool,
    //Play the next video automatically
    autoPlayNext: PropTypes.bool,
    //Automatic repeat play
    autoRePlay: PropTypes.bool,


    /**
     * Style related
     */
    //Video style
    style: PropTypes.object,
    //Full screen video style
    fullStyle: PropTypes.object,
    //Do you need to consider statusBar   only for ios
    considerStatusBar: PropTypes.bool,
    //Whether to display the top
    showTop: PropTypes.bool,
    //title
    title: PropTypes.string,
    //Whether to display the title
    showTitle: PropTypes.bool,
    //Whether to display the return button
    showBack: PropTypes.bool,
    //Return button click event
    onLeftPress: PropTypes.func,

    /**
     * vip Related
     */
    //Use or not vip
    useVip: PropTypes.bool,
    //vip play length
    vipPlayLength: PropTypes.number,

  };

  /*****************************
   *                           *
   *          Lifecycle        *
   *                           *
   *****************************/

  static getDerivedStateFromProps(nextProps, preState) {
    let { url } = nextProps;
    let { currentUrl, storeUrl } = preState;
    if (url && url !== storeUrl) {
      if (storeUrl === '') {
        return {
          currentUrl: url,
          storeUrl: url,
          isEndAd: false,
          isEnding: false,
          isError: false,
          showControls: false,
          showChapter: false,
          isVipPlayEnd: false,
          currentTime: 0,
          totalTime: 0,
        };
      } else {
        return {
          currentUrl: '',
          storeUrl: url,
          currentTime: 0,
          totalTime: 0,
          isEndAd: false,
          isEnding: false,
          isError: false,
          showControls: false,
          showChapter: false,
          isVipPlayEnd: false,
        };
      }
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.url !== prevState.storeUrl) {
      this._hideChapter(0);
      this.initSuccess = false;
      this.setState({
        storeUrl: this.props.url,
        currentUrl: this.props.url,
      });
    }
  }

  componentDidMount() {
    let { style, isAd, initWithFull, useNetInfo,  } = this.props;
    let { autoplay, showAd } = this.props;
    //Do not show ads when an ad is displayed and autoplay is false
    if(showAd && !autoplay){
      if(this.autoplayAdSize < 1){
        this.autoplayAdSize = 1;
        this.setState({
          isEndAd: true
        });
      }
    }
    if(useNetInfo){
      NetInfo.getConnectionInfo().then((connectionInfo) => {
        NetInfo.isConnected.fetch().then(isConnected => {
          this.setState({
            netInfo: {
              ...connectionInfo,
              isConnected: isConnected,
            }
          })
        });
      });
      NetInfo.addEventListener(
        'connectionChange',
        this.handleFirstConnectivityChange
      );
    }
    this.checkShowControlInterval = setInterval(this.checkShowControls,1000);
    this.checkInitSuccessInterval = setInterval(this.checkInitSuccess,250);
    if(initWithFull){
      this._toFullScreen();
    }
  }

  componentWillUnmount() {
    try{
      let { isFull, Orientation, useNetInfo } = this.props;
      this.setState({
        canShowVideo: false
      });
      if (isFull) {
        this._onCloseFullScreen();
      }
      if(this.checkShowControlInterval){
        clearInterval(this.checkShowControlInterval);
      }
      Orientation && Orientation.lockToPortrait();
      StatusBar.setHidden(false);
      NetInfo.removeEventListener(
        'connectionChange',
        this.handleFirstConnectivityChange
      );
      clearInterval(this.checkInitSuccessInterval)
    }catch(e){

    }
  }


  /*****************************
   *                           *
   *      network listener     *
   *                           *
   *****************************/

  handleFirstConnectivityChange = (connectionInfo) => {
    NetInfo.isConnected.fetch().then(isConnected => {
      if(isConnected){
        this.play();
      }else{
        this.stopPlay();
      }
      this.setState({
        netInfo: {
          ...connectionInfo,
          isConnected: isConnected,
        }
      })
    });
  }

  _fetchNetWork = ()=>{
    NetInfo.isConnected.fetch().then(isConnected => {
      NetInfo.getConnectionInfo().then((connectionInfo) => {
        if(isConnected){
          this.play();
        }
        this.setState({
          netInfo: {
            ...connectionInfo,
            isConnected: isConnected,
          }
        })
      });
    });
  }




  /*****************************************************************
   *                                                               *
   *                      VLCPlayer  method                        *
   *                                                               *
   *     You can use these  like:                                  *
   *                                                               *
   *    <VLCPlayerView ref={ ref => this.vlcPlayerView = ref }/>   *
   *                                                               *
   *     this.vlcPlayerView.play();                                *
   *                                                               *
   *                                                               *
   *                                                               *
   *****************************************************************/

  /**
   * Check if vlcplayer is initialized successfully
   */
  checkInitSuccess = ()=> {
    if(this.initSuccess){
      clearInterval(this.checkInitSuccessInterval)
    }else{
      console.log("checkInitSuccess")
      this.playAll();
    }
  }


  pauseAll = ()=>{
    this.vlcPlayerViewRef && this.vlcPlayerViewRef.pause();
    this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.pause();
  }

  playAll = ()=>{
    this.vlcPlayerViewRef && this.vlcPlayerViewRef.play();
    this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.play();
  }

  /*****************************
   *                           *
   *         video             *
   *                           *
   *****************************/

  play = ()=>{
    this.setState({
      pauseByAutoplay: false
    })
    this.firstPlaying = false;
    this.vlcPlayerViewRef && this.vlcPlayerViewRef.play();
  }

  pause = ()=> {
    this.vlcPlayerViewRef && this.vlcPlayerViewRef.pause();
  }

  resume = ()=> {
    this.vlcPlayerViewRef && this.vlcPlayerViewRef.reload(true);
  }

  changeVideoAspectRatio = (ratio)=>{
    this.vlcPlayerViewRef && this.vlcPlayerViewRef.changeVideoAspectRatio(ratio);
    this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.changeVideoAspectRatio(ratio);
  }


  seek = (value) => {
    this.vlcPlayerViewRef && this.vlcPlayerViewRef.seek(value);
  }

  pauseToggle = ()=> {
    this.setState({
      pauseByAutoplay: false
    })
    if(this.state.paused){
      this.vlcPlayerViewRef && this.vlcPlayerViewRef.play();
    }else{
      this.vlcPlayerViewRef && this.vlcPlayerViewRef.pause();
    }
  }

  muteToggle = ()=> {
    if(this.state.muted){
      this.vlcPlayerViewRef && this.vlcPlayerViewRef.muted(false);
      this.setState({
        muted: false
      });
    }else{
      this.vlcPlayerViewRef && this.vlcPlayerViewRef.muted(true);
      this.setState({
        muted: true
      });
    }
  }

  /*****************************
   *                           *
   *     advertise video       *
   *                           *
   *****************************/

  pauseAd = ()=> {
    this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.pause();
  }

  playAd = ()=>{
    this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.play();
  }

  snapshot = (path)=>{
    this.vlcPlayerViewRef && this.vlcPlayerViewRef.snapshot(path);
    this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.snapshot(path);
  }

  resumeAd = ()=> {
    this.initAdSuccess = false;
    this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.reload(true);
  }

  seekAd = (value) => {
    this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.seek(value);
  }

  pauseAdToggle = ()=> {
    if(this.state.adPaused){
      this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.play();
    }else{
      this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.pause();
    }
  }

  muteAdToggle = ()=> {
    if (this.state.adMuted) {
      this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.muted(false);
      this.setState({
        adMuted: false
      });
    } else {
      this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.muted(true);
      this.setState({
        adMuted: true
      });
    }
  }


  /**********************************
   *                                *
   *    VlcPlayerView callback      *
   *                                *
   **********************************/


  /************************
   *                      *
   *         video        *
   *                      *
   ************************/

  _onBuffering = (event) => {
    /*if(__DEV__){
     console.log('_onBuffering:'+this.props.url,event);
     }*/
    let { fullVideoAspectRatio, videoAspectRatio } = this.props;
    this.isProgressChange = false;
    if (this.isReloadingError) {
      this.handleError();
    }
    if(!this.initSuccess){
      this.handleInitSuccess();
    }else{
      let { isPlaying, duration, hasVideoOut} = event;
      if(isPlaying){
        if(duration <= 0){
          this.setState({
            showLoading: false,
          });
        }else{
          this.setState({
            showLoading: true,
          });
        }
      }else{
        this.setState({
          showLoading: true,
        });
      }
    }
  }

  _onIsPlaying = (event)=> {

    let { isPlaying } = event;
    let { onIsPlaying, showAd } = this.props;
    let { isEndAd, paused } = this.state;
    /*if(__DEV__){
     console.log('_onIsPlaying:'+this.props.url,this.state.isError+":"+isPlaying)
     }*/
    if(!this.initSuccess){
      this.handleInitSuccess();
    }
    if (this.isReloadingError) {
      this.handleError();
    }
    if(isPlaying){
      if(!this.firstPlaying){
        this.firstPlaying = true;
        //There is an ad and the ad is not over, stop playing
        if(showAd && !isEndAd){
          this.pause();
        }
      }
      /* this.setState({
       isError: false
       })*/
    }
    onIsPlaying && onIsPlaying(event);
    if(paused !== !isPlaying){
      this.setState({
        paused: !isPlaying
      })
    }
  }

  /**
   * handle the first time video play
   */
  handleInitSuccess = ()=> {
    let { isError, isEndAd, isFull } = this.state;
    this.initSuccess = true;
    let { lookTime, totalTime, showAd, autoplay, fullVideoAspectRatio, videoAspectRatio } = this.props;

    if(this.props.useVideoAspectRatioByMethod){
      if(isFull){
        if(fullVideoAspectRatio){
          this.changeVideoAspectRatio(fullVideoAspectRatio);
        }
      }else{
        if(videoAspectRatio){
          this.changeVideoAspectRatio(videoAspectRatio);
        }
      }
    }
    if(lookTime && totalTime){
      if (Platform.OS === 'ios') {
        if(lookTime < totalTime){
          this.seek(Number((lookTime / totalTime).toFixed(17)));
        }else{
          this.seek(0);
        }
      } else {
        if(lookTime < totalTime){
          this.seek(lookTime);
          this.hadChangeLookTime = false;
        }else{
          this.seek(0);
        }
      }
    }
    this.setState({
      currentTime: lookTime || 0
    })
    //There is an ad and the ad is not over, stop playing
    if(showAd && !isEndAd){
      this.pause();
    }
    //Set autoplay to false to stop playing
    if(!autoplay && this.autoplaySize < 1){
      this.autoplaySize++;
      this.pause();
      this.setState({
        pauseByAutoplay: true
      })
    }
  }


  /**
   * Handling exceptions requires repositioning to the current location
   */
  handleError = () => {
    try {
      let {currentTime, totalTime} = this.state;
      if (currentTime && totalTime && currentTime > 0 && totalTime > 0 && currentTime < totalTime) {
        if (Platform.OS === 'ios') {
          this.seek(Number((currentTime / totalTime).toFixed(17)));
        } else {
          this.seek(currentTime);
        }
        this.isReloadingError = false;
        this.setState({
          isError: false,
        });
      }
    }catch (e){

    }
  }

  /**
   * Need to relocate to the current location when processing the refresh
   */
  handleReloadCurrent = () => {
    try{
      this.needReloadCurrent = false;
      let { currentTime, totalTime } = this.state;
      if(currentTime && totalTime && currentTime > 0 && totalTime > 0 && currentTime < totalTime){
        if (Platform.OS === 'ios') {
          this.seek(Number((currentTime / totalTime).toFixed(17)));
        } else {
          this.seek(currentTime);
        }
      }
    }catch (e){

    }
  }

  /**
   * when video progress is changed
   * @param currentTime
   * @param totalTime
   * @private
   */
  _onProgressChange = ({ currentTime, totalTime }) => {
    let { lookTime } = this.props;

    if(Platform.OS === 'android'  && lookTime && this.props.totalTime && !this.hadChangeLookTime){
      //console.log(currentTime+':'+lookTime)
      if(lookTime < this.props.totalTime){
        if(currentTime < lookTime){
          this.seek(lookTime);
          this.hadChangeLookTime = true;
        }
      }
    }
    this.isProgressChange = true;
    if(!this.changingSlider){
      if(totalTime && currentTime){
        this.setState({
          currentTime,
          totalTime,
          showLoading: false,
        });
      }
    }
    //console.log('_onProgressChange:'+currentTime + ","+totalTime)
    let { useVip, vipPlayLength, onProgressChange } = this.props;
    if (useVip) {
      if (currentTime >= vipPlayLength) {
        this.vlcPlayerViewRef.pause();
        this.setState({
          isVipPlayEnd: true,
        });
      }
    } else {
      onProgressChange && onProgressChange({ currentTime, totalTime });
    }
  };

  /**
   *  when video is ended
   * @private
   */
  _onEnd = (data) => {
    let { url, isLive } = this.props;
    if(__DEV__){
      console.log('_onEnd:'+url+' --> end',data);
    }
    this.hadEnd = true;
    let { currentTime, duration} = data;
    let { endDiffLength, onNext, onEnd, hadNext, autoPlayNext, autoRePlay } = this.props;
    if(duration){
      let diff = (duration - currentTime) / 1000;
      if( diff <= endDiffLength){
        if (hadNext && autoPlayNext) {
          onNext && onNext();
        } else if (hadNext && !autoPlayNext) {
          this.setState({
            isEnding: true,
          });
        } else {
          if (autoRePlay) {
            this.reload();
          } else {
            this.setState({
              isEnding: true,
            });
          }
        }
      }else{
        this.setState({
          isError: true,
        });
      }
    }else{
      if(!isLive){
        this.setState({
          isEnding: true,
        });
      }
    }
    onEnd && onEnd({
      currentTime: currentTime/1000,
      totalTime: duration/1000,
    });
  };

  /**
   * only for android
   * @param e
   * @private
   */
  _onOpen = e => {
    if(__DEV__){
      console.log('onOpen',e);
    }
  };

  /**
   * when video  init success
   * @param e
   * @private
   */
  _onLoadStart = e => {
    let { url , autoplay, fullVideoAspectRatio, videoAspectRatio} = this.props;
    let { isError, isFull }  = this.state;
    /* if(__DEV__){
     console.log('_onLoadStart:'+url+' --> _onLoadStart',e);
     }*/
    if(this.props.useVideoAspectRatioByMethod){
      if(isFull){
        if(fullVideoAspectRatio){
          this.changeVideoAspectRatio(fullVideoAspectRatio);
        }
      }else{
        if(videoAspectRatio){
          this.changeVideoAspectRatio(videoAspectRatio);
        }
      }
    }
    if (isError) {
      this.handleError();
    }
    if(this.needReloadCurrent && !isError){
      this.handleReloadCurrent();
    }
    if(!this.initSuccess){
      this.handleInitSuccess();
    }
  };

  /**
   * when video is stopped
   * @param e
   * @private
   */
  _onStopped = (e)=> {
    /*if(__DEV__){
     let { url } = this.props;
     console.log(url+' --> _onStopped',e);
     }*/
    let { showAd, isLive, autoReloadLive } = this.props;
    let { isEndAd, isEndding, isError, totalTime, pauseByAutoplay, realPaused } = this.state;
    if(isLive){
      if(autoReloadLive && !pauseByAutoplay){
        if(this.autoReloadLiveSize < 20){
          this.reloadLive();
          this.autoReloadLiveSize++;
        }else{
          this.autoReloadLiveSize = 0;
          this.setState({
            isError: true,
            isEndAd: true,
          })
        }
      }else{
        this.setState({
          isError: true,
          isEndAd: true,
        })
      }
    }else{
      // The video may have triggered the event for some reason, 
      // and you need to play it again (except that autoplay is false by default)
      if(!pauseByAutoplay && !this.hadEnd){
        this.play();
      }
    }
  }

  _onError = (e) => {
    //console.log(e);
    this.setState({
      isError: true
    })
  }


  /*****************************
   *                           *
   *     advertise video       *
   *                           *
   *****************************/

  _onAdBuffering = e => {
    /*if(__DEV__){
     console.log('_onAdBuffering',e)
     }*/
  }

  _onAdIsPlaying = (e)=> {
    /*if(__DEV__){
     console.log('_onAdIsPlaying',e)
     }*/
    let { autoplay, onIsAdPlaying } = this.props;
    let { adPaused } = this.state;
    onIsAdPlaying && onIsAdPlaying(e);
    let { isPlaying } = e;
    if(isPlaying){
      if(!this.initAdSuccess){
        this.initAdSuccess = true;
        this.setState({
          showAdView: true
        });
        if(!autoplay && this.autoplayAdSize < 1){
          this.autoplayAdSize ++ ;
          this.pause();
        }
      }
    }
    if(adPaused !== !isPlaying){
      this.setState({
        adPaused: !isPlaying
      })
    }
  }

  _onAdOpen = (e)=> {

  }

  _onAdStopped = (e)=> {
    if(__DEV__){
      console.log("_onAdStopped",e);
    }
    this.setState({ isEndAd: true, showAdView:false },()=>{
      this.play();
      this.vlcPlayerViewRef.volume(199);
    });
    /*this.vlcPlayerViewAdRef &&  this.vlcPlayerViewAdRef.position(0);
     this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.seek(0);
     this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.play();*/
  }

  _onAdLoadStart = e=> {
    if(__DEV__){
      console.log("_onAdLoadStart",e);
    }
    this.initAdSuccess = false;
  }

  _onAdEnd = e => {
    if(__DEV__){
      console.log("_onAdEnd",e);
    }
    let { position } = e;
    if(position === 1){
      this.setState({ isEndAd: true, showAdView:false },()=>{
        this.play();
        this.vlcPlayerViewRef.volume(199);
      });
    }
    /*this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.seek(0);
     this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.play();*/
  }


  /**********************************************
   *                                            *
   *     method  when video need  reload        *
   *                                            *
   **********************************************/

  reload = () => {
    this.startReload();
  };


  reloadCurrent = () => {
    this.startReload(true);
  };

  reloadError = () => {
    this.firstPlaying = false;
    this.isReloadingError = true;
    this.startReload(true);
  }

  startReload = (isCurrent = false)=>{
    this.firstPlaying = false;
    this.needReloadCurrent = isCurrent;
    this.hadEnd = false;
    let { storeUrl, adUrl, currentTime } = this.state;
    let { reloadWithAd, isLive } = this.props;
    let isEndAd = true;
    if(reloadWithAd){
      isEndAd = false;
      this.initAdSuccess = false;
    }

    this.setState({
      currentTime: isCurrent ? currentTime : 0 ,
      pauseByAutoplay: false,
      isEndAd:isEndAd,
      isEnding: false,
      showControls: false,
    },()=>{
      if(reloadWithAd){
        this.resumeAd();
        this.resume(true);
      }else{
        this.resume(true);
        setTimeout(()=>this.checkIsPlaying(0),500)
      }
    });
  }


  reloadLive = ()=> {
    this.firstPlaying = false;
    this.handleEnd = false
    this.resume(true);
  }


  /**
   * 检查是否播放
   * @param index
   */
  checkIsPlaying = (index=0)=>{
    let { paused } = this.state;
    if(index <= 6){
      if(paused){
        this.play();
        index++;
        setTimeout(()=>this.checkIsPlaying(index),500);
      }
    }
  }


  /**
   * End full screen
   * @private
   */
  _onCloseFullScreen = () => {
    let { onCloseFullScreen, BackHandle, Orientation, initWithFull, onLeftPress, videoAspectRatio } = this.props;
    if(initWithFull){
      onLeftPress && onLeftPress();
    }else{
      StatusBar.setHidden(false);
      onCloseFullScreen && onCloseFullScreen();
      //StatusBar.setTranslucent(false);
      if(this.props.useVideoAspectRatioByMethod){
        if(videoAspectRatio){
          this.changeVideoAspectRatio('NULL');
        }
        setTimeout(()=>{
          if(videoAspectRatio){
            this.changeVideoAspectRatio(videoAspectRatio);
          }
        },250);
      }
      Orientation && Orientation.lockToPortrait();
      BackHandle && BackHandle.removeBackFunction(_fullKey);
      this.setState({
        isFull: false,
        showControls: false,
      });
    }

  };

  /**
   * full screen
   * @private
   */
  _toFullScreen = () => {
    let { onStartFullScreen, BackHandle, Orientation, fullVideoAspectRatio } = this.props;
    //StatusBar.setTranslucent(true);
    onStartFullScreen && onStartFullScreen();
    StatusBar.setHidden(true);
    BackHandle && BackHandle.addBackFunction(_fullKey, this._onCloseFullScreen);
    Orientation && Orientation.lockToLandscape && Orientation.lockToLandscape();
    this.setState({
      isFull: true,
      showControls: false,
    });
    if(this.props.useVideoAspectRatioByMethod){
      if(fullVideoAspectRatio){
        this.changeVideoAspectRatio("NULL");
      }
      setTimeout(()=>{
        if(fullVideoAspectRatio){
          this.changeVideoAspectRatio(fullVideoAspectRatio);
        }
      },250);
    }
  };

  /**
   * Layout changes
   * @param e
   * @private
   */
  _onLayout = e => {
    let { width, height } = e.nativeEvent.layout;
    this.setState({
      width,
      height
    })
  };


  _next = () => {
    let { onNext } = this.props;
    onNext && onNext();
  };

  /**
   * Display chapter
   * @private
   */
  _showChapter = () => {
    if (this.showChapter) {
      this._hideChapter();
    } else {
      this.showChapter = true;
      this.setState({
        showChapter: true
      })
      Animated.timing(this.state.chapterPosition, {
        toValue: 0,
        //easing: Easing.back,
        duration: 500,
      }).start();
    }
  };

  /**
   * Hide chapter
   * @param time
   * @private
   */
  _hideChapter = (time = 250) => {
    this.showChapter = false;
    this.setState({
      showChapter: false
    });
    Animated.timing(this.state.chapterPosition, {
      toValue: -250,
      //easing: Easing.back,
      duration: time,
    }).start();
  };


  _onBodyPress = ()=> {
    let { showControls, showChapter } = this.state;
    if(showChapter){
      this._hideChapter(250);
    }else{
      if(showControls){
        this.setState({ showControls: false });
      }else{
        this.setState({ showControls: true });
      }
    }
    //console.log('_onBodyPress',showControls)
    /* let currentTime = new Date().getTime();
     if (this.touchTime === 0) {
     this.touchTime = currentTime;
     if (showControls) {
     this._hideChapter(0);
     }
     if(showControls){
     this.setState({ showControls: false });
     }else{
     this.setState({ showControls: true });
     }
     } else {
     if (currentTime - this.touchTime >= 500) {
     if (showControls) {
     this._hideChapter(0);
     }
     this.touchTime = currentTime;
     if(showControls){
     this.setState({ showControls: false });
     }else{
     this.setState({ showControls: true });
     }
     }
     }*/
  }

  _onBodyPressIn = ()=>{
    this.touchControlTime = new Date().getTime();
  }

  checkShowControls = ()=> {
    let currentTime = new Date().getTime();
    let { showControls } = this.state;
    if (showControls && (currentTime - this.touchControlTime >= 4000)) {
      /*this.setState({
       showControls: false
       });*/
    }
  }


  _onLeftPress = ()=> {
    let { initWithFull, onLeftPress } = this.props;
    let { isFull } = this.state;
    if (isFull) {
      this._onCloseFullScreen();
    } else {
      onLeftPress && onLeftPress();
    }

  }

  /******************************
   *                            *
   *          UI                *
   *                            *
   ******************************/

  getVipEndView = () => {
    let { onVipPress, showBack, vipEndViewText } = this.props;
    let { vipEndText, boughtBtnText } = vipEndViewText;
    let { isFull } = this.state;
    return (
      <View style={[styles.loading, { backgroundColor: 'rgb(0,0,0)' }]}>
        {(showBack) && <View style={{ height: 37, width: 40, position:'absolute', top:0, left:0,zIndex: 999 }}>
          <View style={styles.backBtn}>
            <TouchableOpacity onPress={this._onLeftPress} style={styles.btn} activeOpacity={0.8}>
              <Icon name={'chevron-left'} size={30} color="#fff"/>
            </TouchableOpacity>
          </View>
        </View>
        }
        <View style={styles.centerContainer}>
          <Text style={styles.centerContainerText} numberOfLines={1}>{vipEndText}</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={() => {onVipPress && onVipPress()}} style={[styles.centerContainerBtn,{ backgroundColor: 'rgb(230,33,41)'}]}>
            <Text style={styles.centerContainerBtnText}>{boughtBtnText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  getEndingView = () => {
    let {
      autoPlayNext,
      hadNext,
      showBack,
      endingViewText
    } = this.props;
    let { height, width, isFull} = this.state;
    let { endingText, reloadBtnText, nextBtnText } = endingViewText;
    return(
      <View style={[styles.commonView,{ backgroundColor:'rgba(0,0,0,0.5)'}]}>
        <View style={styles.centerContainer}>
          <Text style={styles.centerContainerText}>{endingText}</Text>
          <View style={styles.centerRowContainer}>
            <TouchableOpacity style={styles.centerContainerBtn} onPress={this.reload} activeOpacity={1}>
              <Icon name={'reload'} size={20} color="#fff" />
              <Text style={styles.centerContainerBtnText}>{reloadBtnText}</Text>
            </TouchableOpacity>
            {!autoPlayNext &&
            hadNext && (<TouchableOpacity style={[styles.centerContainerBtn,{marginLeft:15}]} onPress={this._next} activeOpacity={1}>
              <Icon name={'reload'} size={20} color="#fff" />
              <Text style={styles.centerContainerBtnText}>{nextBtnText}</Text>
            </TouchableOpacity>)
            }
          </View>
        </View>
        <View style={{ height: 37, width: 40, position:'absolute', top:0, left:0,zIndex: 999 }}>
          {(showBack) && (
            <TouchableOpacity
              onPress={this._onLeftPress}
              style={styles.btn}
              activeOpacity={0.8}>
              <Icon name={'chevron-left'} size={30} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

  getErrorView = ()=> {
    let { showBack, initWithFull, onLeftPress, errorView, errorViewText } = this.props;
    let { errorText, reloadBtnText} = errorViewText;
    let { netInfo, height, width, isFull, isError } = this.state;
    return (
      <View style={[styles.loading, { zIndex:999, backgroundColor: '#000' }]}>
        <View style={[styles.backBtn,{position:'absolute',left:0,top:0,zIndex:999}]}>
          {(showBack) && (
            <TouchableOpacity
              onPress={this._onLeftPress}
              style={styles.btn}
              activeOpacity={0.8}>
              <Icon name={'chevron-left'} size={30} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.centerContainerText}>{errorText}</Text>
          <TouchableOpacity style={styles.centerContainerBtn} onPress={this.reloadError} activeOpacity={0.8}>
            <Icon name={'reload'} size={20} color="#fff" />
            <Text style={styles.centerContainerBtnText}>{reloadBtnText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  getNoNetInfoView = ()=> {
    let { showBack, initWithFull, onLeftPress } = this.props;
    let { netInfo, height, width, isFull } = this.state;
    let color1 = 'rgba(255,255,255,0.6)';
    let color2 = 'rgba(0,0,0,0.5)';
    return (
      <View
        style={[styles.loading,{zIndex:999, backgroundColor:'#000',}]}>
        <View style={[styles.backBtn,{position:'absolute',left:0,top:0}]}>
          {(showBack) && (
            <TouchableOpacity
              onPress={this._onLeftPress}
              style={styles.btn}
              activeOpacity={0.8}>
              <Icon name={'chevron-left'} size={30} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.centerContainerText}>The network is not connected, please check the network settings</Text>
          <TouchableOpacity style={styles.centerContainerBtn} onPress={this._fetchNetWork} activeOpacity={1}>
            <Icon name={'reload'} size={20} color="#fff" />
            <Text style={styles.centerContainerBtnText}>Refresh retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  getAdView = ()=> {
    let { onAdEnd, showAd, adUrl, showBack } = this.props;
    let { showAdView, showChapter, isFull, adMuted, adPaused, isEndAd } = this.state;
    return(
      <View style={{position:'absolute',height:'100%',width:'100%',top:0,left:0,zIndex:888,}}>
        <View style={[styles.backBtn,{position:'absolute',width:100, left:0,top:0, zIndex:999}]}>
          {(showBack) && (
            <TouchableOpacity
              onPressIn={this._onLeftPress}
              style={styles.btn}
              activeOpacity={0.8}>
              <Icon name={'chevron-left'} size={30} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <View style={[styles.ad,{position:'absolute',right:0,top:10, zIndex:999}]}>
          <TimeLimt
            //maxTime={30}
            onEnd={()=>{
              this.setState({ isEndAd: true, showAdView:false },()=>{
                this.play();
                this.vlcPlayerViewRef.volume(199);

              });
              onAdEnd && onAdEnd();
            }}
          />
        </View>
        <TouchableOpacity activeOpacity={1} onPress={this.pauseAdToggle} style={[styles.adBtn,{position:'absolute',left: 10, bottom: 10 }]}>
          <Icon name={adPaused ? 'play' : 'pause'} size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} onPress={this.muteAdToggle} style={[styles.adBtn,{position:'absolute',left: 60, bottom: 10, }]}>
          <Icon name={adMuted ? 'volume-off' : 'volume-high'} size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} onPress={()=>{
          if(isFull){
            this._onCloseFullScreen();
          }else{
            this._toFullScreen();
          }
        }}
                          style={[styles.adBtn,{position:'absolute',right: 10, bottom: 10}]}>
          <Icon name={isFull ? 'fullscreen-exit' : 'fullscreen'} size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    )
  }

  getLoadingView = ()=>{
    let { showBack } = this.props;
    let { isFull } = this.props;
    return (<View style={[styles.loading,{zIndex:666}]}>
      <View style={[styles.backBtn,{position:'absolute',left:0,top:0,zIndex:999}]}>
        {(showBack) && (
          <TouchableOpacity
            onPress={this._onLeftPress}
            style={styles.btn}
            activeOpacity={0.8}>
            <Icon name={'chevron-left'} size={30} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      <ActivityIndicator size={'large'} animating={true} color="#fff" />
    </View>);
  }

  getCommonView = ()=>{
    let { showBack } = this.props;
    let { paused, pauseByAutoplay, isFull } = this.state;
    let showPaused = false;
    if(this.firstPlaying || pauseByAutoplay){
      if(paused){
        showPaused = true;
      }
    }
    return (<View style={styles.commonView}>
      <TouchableOpacity activeOpacity={1} style={{flex:1,justifyContent:'center',alignItems:'center'}} onPressIn={this._onBodyPressIn} onPressOut={this._onBodyPress}>
        {showPaused  &&<TouchableOpacity activeOpacity={0.8} style={{paddingTop:2,paddingLeft:2,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'center',alignItems:'center',width:50,height:50,borderRadius:25}} onPress={this.play}>
          <Icon name={'play'} size={30} color="#fff"/>
        </TouchableOpacity>
        }
      </TouchableOpacity>
      <View style={[styles.backBtn,{position:'absolute',left:0,top:0, zIndex:999}]}>
        {(showBack) && (
          <TouchableOpacity
            onPressIn={this._onLeftPress}
            style={styles.btn}
            activeOpacity={0.8}>
            <Icon name={'chevron-left'} size={30} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>);
  }

  getControlView = ()=> {
    let {
      title,
      onLeftPress,
      showBack,
      showTitle,
      initWithFull,
      showTop,
      onEnd,
      style,
      isAd,
      type,
      showAd,
      chapterElements,
      chapterText
    } = this.props;
    let {
      muted,
      paused,
      currentTime,
      totalTime,
      isFull,
      showChapter
    } = this.state;
    let doFast = false;
    if (this.initialCurrentTime && this.initialCurrentTime < currentTime) {
      doFast = true;
    }
    let color1 = 'rgba(255,255,255,0.6)';
    let color2 = 'rgba(0,0,0,0.5)';
    return(
      <View style={{position:'absolute',height:'100%',width:'100%',top:0,left:0,zIndex:999,backgroundColor:'rgba(0,0,0,0)'}}>
        <TouchableOpacity activeOpacity={1} style={{flex:1}} onPressIn={this._onBodyPressIn} onPressOut={this._onBodyPress}>
          {
            this.changingSlider &&
            <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
              <View style={styles.changeSliderView}>
                <Icon name={doFast ? 'fast-forward' : 'rewind'} size={30} color="#30a935" />
                <Text style={{ color: '#30a935', fontSize: 11.5 }}>
                  {getTime(currentTime)}
                  <Text style={{color:'#fff'}}>{ '/' + getTime(totalTime)}</Text>
                </Text>
              </View>
            </View>
          }
        </TouchableOpacity>
        {showTop &&
        <View style={[styles.topView]}>
          <View style={{flex:1, backgroundColor:color1}}>
            <View style={{flex:1, backgroundColor:color2}}>
              <View style={styles.backBtn}>
                {showBack && (
                  <TouchableOpacity
                    onPress={this._onLeftPress}
                    style={styles.btn}
                    activeOpacity={0.8}>
                    <Icon name={'chevron-left'} size={30} color="#fff"/>
                  </TouchableOpacity>
                )}
                <View style={{ justifyContent: 'center', flex: 1, marginLeft:10, marginRight: 10 }}>
                  {showTitle && (<Text style={{ color: '#fff', fontSize: 12 }} numberOfLines={1}>{title}</Text>)}
                </View>
                {isFull && chapterElements && (
                  <TouchableOpacity
                    style={{
                      width: 40,
                      marginRight: 10,
                      height: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={this._showChapter}
                  >
                    <Text style={{ fontSize: 13, color: this.showChapter ? 'red' : '#fff' }}>{chapterText}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
        }
        {this.getChapterView()}
        <View style={[styles.bottomView,{}]}>
          <ControlBtn
            showSlider={!isAd}
            muted={muted}
            isFull={isFull}
            onMutePress={this.muteToggle}
            paused={paused}
            onReload={this.reloadCurrent}
            onPausedPress={this.pauseToggle}
            onFullPress={()=>{
              if(isFull){
                this._onCloseFullScreen();
              }else{
                this._toFullScreen();
              }
            }}
            currentTime={currentTime}
            totalTime={totalTime}
            onValueChange={value => {
              if (!this.changingSlider) {
                this.initialCurrentTime = currentTime;
              }
              this.changingSlider = true;
              this.setState({
                currentTime: value,
                changingSlider: true,
              });
            }}
            onSlidingComplete={value => {
              this.changingSlider = false;
              this.initialCurrentTime = 0;
              if (this.props.useVip) {
                if (value  >= this.props.vipPlayLength) {
                  this.pause();
                  this.setState({
                    isVipPlayEnd: true,
                  });
                }
              }else{
                if (Platform.OS === 'ios') {
                  if(value >= totalTime){
                    console.log(666666);
                    this.pause();
                    this._onEnd({
                      currentTime: totalTime,
                      duration: totalTime
                    })

                    //this.seek(0.99999999);
                  }else{
                    this.seek(Number((value / totalTime).toFixed(17)));
                  }
                } else {
                  if(value >= totalTime){
                    this.seek(value-1);
                  }else{
                    this.seek(value);
                  }
                }
              }
              this.setState({
                showControls: false
              })
            }}
          />
        </View>
      </View>
    )
  }

  getChapterView = ()=>{
    let { chapterElements } = this.props;
    let { isFull, showChapter, height, chapterPosition } = this.state;
    let color1 = 'rgba(255,255,255,0.6)';
    let color2 = 'rgba(0,0,0,0.5)';
    return(
      <Animated.View
        style={
          [
            styles.chapterView,
            {
              borderTopWidth:     isFull ? 1 : 0,
              borderBottomWidth:  isFull ? 1 : 0,
              right:              chapterPosition,
              height:             isFull ? height - 37 - 37  : 0,
            }
          ]
        }>
        <View style={{flex:1, backgroundColor:color1}}>
          <View style={{flex:1, backgroundColor:color2}}>
            <ScrollView>
              {chapterElements}
            </ScrollView>
          </View>
        </View>
      </Animated.View>
    )
  }

  _renderLoading = ()=>{
    let { showAd } = this.props;
    let { pauseByAutoplay, isEndAd, totalTime, showLoading } = this.state;
    let realShowLoading = false;
    if(!showAd || (showAd && isEndAd)){
      //console.log('isEndAd',showLoading);
      if(!this.initSuccess){
        realShowLoading = true;
      }else{
        if(!pauseByAutoplay){
          if(this.firstPlaying){
            if(totalTime > 0){
              //console.log(showLoading);
              if(showLoading){
                realShowLoading = true;
              }
            }
          }else{
            realShowLoading = true;
          }
        }
      }
    }else{
      //console.log('isNotEndAd',showLoading);
      //console.log('-------!this.initAdSuccess---------')
      if(!this.initAdSuccess){
        realShowLoading = true;
      }
    }
    if(this.isProgressChange){
      realShowLoading = false;
    }
    if(realShowLoading){
      return(
        <View style={styles.loading}>
          <ActivityIndicator size={'large'} animating={true} color="#fff" />
        </View>
      )
    }
    return null;
  }

  _renderView = ()=> {
    let {
      title,
      onLeftPress,
      showBack,
      showTitle,
      initWithFull,
      showTop,
      showAd,
      adUrl,
    } = this.props;
    let { isFull, showControls, isEnding, isVipPlayEnd, isError, showChapter, isEndAd, netInfo, currentUrl, pauseByAutoplay } = this.state;
    if(isError && !pauseByAutoplay){
      return this.getErrorView();
    }else if(isEnding){
      return this.getEndingView();
    }else if(isVipPlayEnd){
      return this.getVipEndView();
    }else if(netInfo && netInfo.isConnected === false){
      return this.getNoNetInfoView();
    }
    if(showAd){
      if(adUrl && currentUrl){
        if(!isEndAd){
          return this.getAdView();
        }else{
          if(showControls){
            return this.getControlView();
          }
        }
      }else{
        return this.getLoadingView();
      }
    }else{
      if(!currentUrl){
        return this.getLoadingView();
      }else{
        if(showControls){
          return this.getControlView();
        }
      }
    }
    return this.getCommonView();
  }


  render() {
    let {
      url,
      adUrl,
      showAd,
      showBack,
      style,
      fullStyle,
      autoplay,
      videoAspectRatio,
      fullVideoAspectRatio,
      considerStatusBar,
      initAdType,
      initAdOptions,
      initType,
      initOptions,
    } = this.props;
    let { isEndAd, isFull, currentUrl, isEnding } = this.state;
    /**
     * set videoAspectRatio
     * @type {string}
     */
    let currentVideoAspectRatio = '';//this.state.width + ':' + this.state.height;
    if(!this.props.useVideoAspectRatioByMethod){
      if (isFull) {
        if(fullVideoAspectRatio){
          currentVideoAspectRatio = fullVideoAspectRatio;
        }
      } else {
        if(videoAspectRatio){
          currentVideoAspectRatio = videoAspectRatio;
        }
      }
    }
    /**
     * check video can be play
     * @type {boolean}
     */
    let showVideo = false;
    let realShowAd = false;
    if(showAd){
      if(currentUrl && adUrl){
        realShowAd = true;
        showVideo = true;
        if(isEndAd){
          realShowAd = false;
        }
      }
    }else{
      if(currentUrl){
        showVideo = true;
      }
    }
    if(currentUrl && currentUrl.replace){
      currentUrl = currentUrl.replace(/[“”]/g,"");
    }
    //console.log('currentUrl:'+currentUrl,realShowAd);

    /**
     * check if need consider statusbar
     * @type {{}}
     */
    let considerStyle = {};
    if(!isFull && considerStatusBar){
      if(Platform.OS === 'ios'){
        considerStyle = {
          marginTop: 0,
        };
      }
    }

    return (
      <View
        /*onMoveShouldSetResponder={(evt)=>true}
         onStartShouldSetResponder={(evt)=>true}
         onResponderGrant={e=>{
         //console.log(e)
         }}
         onResponderMove={e=>{
         // console.log(e)
         }}
         onResponderRelease={e=>{
         //console.log(e)
         }}
         onResponderReject={e=>{
         //console.log(e)
         }}*/
        onLayout={this._onLayout}
        style={[styles.container, considerStyle, isFull ? fullStyle : style]}>
        <View style={{flex:1}}>
          <TouchableOpacity activeOpacity={1} style={{flex:1}} onPressIn={this._onBodyPressIn} onPressOut={this._onBodyPress}>
            {realShowAd && (
              <VLCPlayerView
                ref={ref => (this.vlcPlayerViewAdRef = ref)}
                {...this.props}
                videoAspectRatio={currentVideoAspectRatio}
                url={adUrl}
                autoplay={autoplay}
                isAd={true}
                onIsPlaying={this._onAdIsPlaying}
                onBuffering={this._onAdBuffering}
                onLoadStart={this._onAdLoadStart}
                onOpen={this._onAdOpen}
                onSnapshot={this.props.onSnapshot}
                onEnd={this._onAdEnd}
                onStopped={this._onAdStopped}
                initOptions={initAdOptions}
                initType={initAdType}
                mediaOptions={
                  {
                    ':network-caching': 0,
                    ':live-caching': 1500,
                  }
                }
              />
            )}
            {showVideo && (
              <VLCPlayerView
                ref={ref => (this.vlcPlayerViewRef = ref)}
                {...this.props}
                showAd={showAd}
                isAd={false}
                autoplay={autoplay}
                url={currentUrl}
                isEndAd={isEndAd}
                style={showAd && !isEndAd ? { position: 'absolute', zIndex: -1 } : {}}
                videoAspectRatio={currentVideoAspectRatio}
                onProgressChange={this._onProgressChange}
                onSnapshot={this.props.onSnapshot}
                onIsPlaying={this._onIsPlaying}
                onLoadStart={this._onLoadStart}
                onOpen={this._onOpen}
                onStartFullScreen={this._toFullScreen}
                onCloseFullScreen={this._onCloseFullScreen}
                onBuffering={this._onBuffering}
                onStopped={this._onStopped}
                onError={this._onError}
                onEnd={this._onEnd}
                initOptions={initOptions}
                initType={initType}
                mediaOptions={
                  {
                    ':network-caching': 250,
                    ':live-caching': 250,
                  }
                }
              />
            )}
            {this._renderLoading()}
          </TouchableOpacity>
          <View
            style={{position:'absolute',left:0,top:0,width:'100%',height:'100%',backgroundColor:'rgba(0,0,0,0.05)'}}>
          </View>
          {this._renderView()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 211.5,
    backgroundColor: '#000',
  },
  style:{

  },
  topView: {
    top: 0,
    backgroundColor: 'rgba(0,0,0,0)',
    left: 0,
    height: 37,
    position: 'absolute',
    width: '100%',
    zIndex: 999,
  },
  backBtn: {
    height: 37,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  btn: {
    //marginLeft: 10,
    // marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 37,
    width: 40,
  },
  loading: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commonView:{
    position: 'absolute',
    left:0,
    top:0,
    zIndex:999,
    height:'100%',
    width:'100%',
  },
  bottomView: {
    bottom: 0,
    left: 0,
    height: 37,
    zIndex:999,
    position: 'absolute',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  ad: {
    backgroundColor: 'rgba(255,255,255,1)',
    height: 30,
    marginRight: 10,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterView: {
    borderColor: '#000',
    top: 37,
    backgroundColor: 'rgba(0,0,0,0)',
    position: 'absolute',
    width: 220,
    zIndex: 999,
  },
  centerContainer: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerRowContainer:{
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection:'row',
  },
  centerContainerText: {
    fontSize:12,
    color:'#fff'
  },
  centerContainerBtn: {
    marginTop:20,
    paddingLeft:5,
    paddingLeft:10,
    paddingRight: 10,
    minWidth:100,
    minHeight:30,
    borderRadius:15,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#30a935'
  },
  centerContainerBtnText:{
    marginLeft:5,
    fontSize:11,
    color:'#fff'
  },
  changeSliderView: {
    width: 95,
    height: 58.5,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  adBtn:{
    backgroundColor:'rgba(0,0,0,0.3)',
    borderRadius:15,
    width: 30,
    height:30,
    position:'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
});
