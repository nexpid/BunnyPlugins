// Generated by dts-bundle-generator v9.5.1

declare module "react-native-video" {
    import React$1 from 'react';
    import { ReactNode } from 'react';
    import { ImageProps, ImageRequireSource, ImageURISource, StyleProp, ViewProps, ViewStyle } from 'react-native';
    import { DirectEventHandler, Double, Float, Int32, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
    
    type VideoSaveData = {
    	uri: string;
    };
    export declare enum AdEvent {
    	/**
    	 * iOS only: Fired the first time each ad break ends. Applications must reenable seeking when this occurs (only used for dynamic ad insertion).
    	 */
    	AD_BREAK_ENDED = "AD_BREAK_ENDED",
    	/**
    	 * Fires when an ad rule or a VMAP ad break would have played if autoPlayAdBreaks is false.
    	 */
    	AD_BREAK_READY = "AD_BREAK_READY",
    	/**
    	 * iOS only: Fired first time each ad break begins playback. If an ad break is watched subsequent times this will not be fired. Applications must disable seeking when this occurs (only used for dynamic ad insertion).
    	 */
    	AD_BREAK_STARTED = "AD_BREAK_STARTED",
    	/**
    	 * Android only: Fires when the ad has stalled playback to buffer.
    	 */
    	AD_BUFFERING = "AD_BUFFERING",
    	/**
    	 * Android only: Fires when the ad is ready to play without buffering, either at the beginning of the ad or after buffering completes.
    	 */
    	AD_CAN_PLAY = "AD_CAN_PLAY",
    	/**
    	 * Android only: Fires when an ads list is loaded.
    	 */
    	AD_METADATA = "AD_METADATA",
    	/**
    	 * iOS only: Fired every time the stream switches from advertising or slate to content. This will be fired even when an ad is played a second time or when seeking into an ad (only used for dynamic ad insertion).
    	 */
    	AD_PERIOD_ENDED = "AD_PERIOD_ENDED",
    	/**
    	 * iOS only: Fired every time the stream switches from content to advertising or slate. This will be fired even when an ad is played a second time or when seeking into an ad (only used for dynamic ad insertion).
    	 */
    	AD_PERIOD_STARTED = "AD_PERIOD_STARTED",
    	/**
    	 * Android only: Fires when the ad's current time value changes. The event `data` will be populated with an AdProgressData object.
    	 */
    	AD_PROGRESS = "AD_PROGRESS",
    	/**
    	 * Fires when the ads manager is done playing all the valid ads in the ads response, or when the response doesn't return any valid ads.
    	 */
    	ALL_ADS_COMPLETED = "ALL_ADS_COMPLETED",
    	/**
    	 * Fires when the ad is clicked.
    	 */
    	CLICK = "CLICK",
    	/**
    	 * Fires when the ad completes playing.
    	 */
    	COMPLETED = "COMPLETED",
    	/**
    	 * Android only: Fires when content should be paused. This usually happens right before an ad is about to cover the content.
    	 */
    	CONTENT_PAUSE_REQUESTED = "CONTENT_PAUSE_REQUESTED",
    	/**
    	 * Android only: Fires when content should be resumed. This usually happens when an ad finishes or collapses.
    	 */
    	CONTENT_RESUME_REQUESTED = "CONTENT_RESUME_REQUESTED",
    	/**
    	 * iOS only: Cuepoints changed for VOD stream (only used for dynamic ad insertion).
    	 */
    	CUEPOINTS_CHANGED = "CUEPOINTS_CHANGED",
    	/**
    	 * Android only: Fires when the ad's duration changes.
    	 */
    	DURATION_CHANGE = "DURATION_CHANGE",
    	/**
    	 * Fires when an error is encountered and the ad can't be played.
    	 */
    	ERROR = "ERROR",
    	/**
    	 * Fires when the ad playhead crosses first quartile.
    	 */
    	FIRST_QUARTILE = "FIRST_QUARTILE",
    	/**
    	 * Android only: Fires when the impression URL has been pinged.
    	 */
    	IMPRESSION = "IMPRESSION",
    	/**
    	 * Android only: Fires when an ad triggers the interaction callback. Ad interactions contain an interaction ID string in the ad data.
    	 */
    	INTERACTION = "INTERACTION",
    	/**
    	 * Android only: Fires when the displayed ad changes from linear to nonlinear, or the reverse.
    	 */
    	LINEAR_CHANGED = "LINEAR_CHANGED",
    	/**
    	 * Fires when ad data is available.
    	 */
    	LOADED = "LOADED",
    	/**
    	 * Fires when a non-fatal error is encountered. The user need not take any action since the SDK will continue with the same or next ad playback depending on the error situation.
    	 */
    	LOG = "LOG",
    	/**
    	 * Fires when the ad playhead crosses midpoint.
    	 */
    	MIDPOINT = "MIDPOINT",
    	/**
    	 * Fires when the ad is paused.
    	 */
    	PAUSED = "PAUSED",
    	/**
    	 * Fires when the ad is resumed.
    	 */
    	RESUMED = "RESUMED",
    	/**
    	 * Android only: Fires when the displayed ads skippable state is changed.
    	 */
    	SKIPPABLE_STATE_CHANGED = "SKIPPABLE_STATE_CHANGED",
    	/**
    	 * Fires when the ad is skipped by the user.
    	 */
    	SKIPPED = "SKIPPED",
    	/**
    	 * Fires when the ad starts playing.
    	 */
    	STARTED = "STARTED",
    	/**
    	 * iOS only: Stream request has loaded (only used for dynamic ad insertion).
    	 */
    	STREAM_LOADED = "STREAM_LOADED",
    	/**
    	 * iOS only: Fires when the ad is tapped.
    	 */
    	TAPPED = "TAPPED",
    	/**
    	 * Fires when the ad playhead crosses third quartile.
    	 */
    	THIRD_QUARTILE = "THIRD_QUARTILE",
    	/**
    	 * iOS only: An unknown event has fired
    	 */
    	UNKNOWN = "UNKNOWN",
    	/**
    	 * Android only: Fires when the ad is closed by the user.
    	 */
    	USER_CLOSE = "USER_CLOSE",
    	/**
    	 * Android only: Fires when the non-clickthrough portion of a video ad is clicked.
    	 */
    	VIDEO_CLICKED = "VIDEO_CLICKED",
    	/**
    	 * Android only: Fires when a user clicks a video icon.
    	 */
    	VIDEO_ICON_CLICKED = "VIDEO_ICON_CLICKED",
    	/**
    	 * Android only: Fires when the ad volume has changed.
    	 */
    	VOLUME_CHANGED = "VOLUME_CHANGED",
    	/**
    	 * Android only: Fires when the ad volume has been muted.
    	 */
    	VOLUME_MUTED = "VOLUME_MUTED"
    }
    type Headers$1 = ReadonlyArray<Readonly<{
    	key: string;
    	value: string;
    }>>;
    type VideoMetadata = Readonly<{
    	title?: string;
    	subtitle?: string;
    	description?: string;
    	imageUri?: string;
    }>;
    export type VideoSrc = Readonly<{
    	uri?: string;
    	isNetwork?: boolean;
    	isAsset?: boolean;
    	shouldCache?: boolean;
    	type?: string;
    	mainVer?: Int32;
    	patchVer?: Int32;
    	requestHeaders?: Headers$1;
    	startPosition?: Float;
    	cropStart?: Float;
    	cropEnd?: Float;
    	metadata?: VideoMetadata;
    	drm?: Drm;
    	cmcd?: NativeCmcdConfiguration;
    	textTracksAllowChunklessPreparation?: boolean;
    }>;
    type DRMType = WithDefault<string, "widevine">;
    type DebugConfig = Readonly<{
    	enable?: boolean;
    	thread?: boolean;
    }>;
    type Drm = Readonly<{
    	type?: DRMType;
    	licenseServer?: string;
    	headers?: Headers$1;
    	contentId?: string;
    	certificateUrl?: string;
    	base64Certificate?: boolean;
    	useExternalGetLicense?: boolean;
    	multiDrm?: WithDefault<boolean, false>;
    }>;
    type CmcdMode = WithDefault<Int32, 1>;
    export type NativeCmcdConfiguration = Readonly<{
    	mode?: CmcdMode;
    	request?: Headers$1;
    	session?: Headers$1;
    	object?: Headers$1;
    	status?: Headers$1;
    }>;
    type TextTracks = ReadonlyArray<Readonly<{
    	title: string;
    	language: string;
    	type: string;
    	uri: string;
    }>>;
    type SelectedTextTrackType = WithDefault<string, "system">;
    type SelectedAudioTrackType = WithDefault<string, "system">;
    type SelectedTextTrack = Readonly<{
    	type?: SelectedTextTrackType;
    	value?: string;
    }>;
    type SelectedAudioTrack = Readonly<{
    	type?: SelectedAudioTrackType;
    	value?: string;
    }>;
    type SelectedVideoTrackType = WithDefault<string, "auto">;
    type SelectedVideoTrack = Readonly<{
    	type?: SelectedVideoTrackType;
    	value?: string;
    }>;
    type BufferConfigLive = Readonly<{
    	maxPlaybackSpeed?: Float;
    	minPlaybackSpeed?: Float;
    	maxOffsetMs?: Int32;
    	minOffsetMs?: Int32;
    	targetOffsetMs?: Int32;
    }>;
    type BufferingStrategyType = WithDefault<string, "Default">;
    type BufferConfig = Readonly<{
    	minBufferMs?: Float;
    	maxBufferMs?: Float;
    	bufferForPlaybackMs?: Float;
    	bufferForPlaybackAfterRebufferMs?: Float;
    	maxHeapAllocationPercent?: Float;
    	backBufferDurationMs?: Float;
    	minBackBufferMemoryReservePercent?: Float;
    	minBufferMemoryReservePercent?: Float;
    	cacheSizeMB?: Float;
    	live?: BufferConfigLive;
    }>;
    type SubtitleStyle = Readonly<{
    	fontSize?: Float;
    	paddingTop?: WithDefault<Float, 0>;
    	paddingBottom?: WithDefault<Float, 0>;
    	paddingLeft?: WithDefault<Float, 0>;
    	paddingRight?: WithDefault<Float, 0>;
    	opacity?: WithDefault<Float, 1>;
    	subtitlesFollowVideo?: WithDefault<boolean, true>;
    }>;
    type OnLoadData = Readonly<{
    	currentTime: Float;
    	duration: Float;
    	naturalSize: Readonly<{
    		width: Float;
    		height: Float;
    		orientation: WithDefault<string, "landscape">;
    	}>;
    	audioTracks: {
    		index: Int32;
    		title?: string;
    		language?: string;
    		bitrate?: Float;
    		type?: string;
    		selected?: boolean;
    	}[];
    	textTracks: {
    		index: Int32;
    		title?: string;
    		language?: string;
    		/**
    		 * iOS only supports VTT, Android supports all 3
    		 */
    		type?: WithDefault<string, "srt">;
    		selected?: boolean;
    	}[];
    }>;
    export type OnLoadStartData = Readonly<{
    	isNetwork: boolean;
    	type: string;
    	uri: string;
    }>;
    export type OnVideoAspectRatioData = Readonly<{
    	width: Float;
    	height: Float;
    }>;
    export type OnBufferData = Readonly<{
    	isBuffering: boolean;
    }>;
    export type OnProgressData = Readonly<{
    	currentTime: Float;
    	playableDuration: Float;
    	seekableDuration: Float;
    }>;
    export type OnBandwidthUpdateData = Readonly<{
    	bitrate: Int32;
    	width?: Float;
    	height?: Float;
    	trackId?: Int32;
    }>;
    export type OnSeekData = Readonly<{
    	currentTime: Float;
    	seekTime: Float;
    }>;
    export type OnPlaybackStateChangedData = Readonly<{
    	isPlaying: boolean;
    	isSeeking: boolean;
    }>;
    export type OnTimedMetadataData = Readonly<{
    	metadata: {
    		value?: string;
    		identifier: string;
    	}[];
    }>;
    export type OnAudioTracksData = Readonly<{
    	audioTracks: {
    		index: Int32;
    		title?: string;
    		language?: string;
    		bitrate?: Float;
    		type?: string;
    		selected?: boolean;
    	}[];
    }>;
    type OnTextTracksData = Readonly<{
    	textTracks: {
    		index: Int32;
    		title?: string;
    		language?: string;
    		/**
    		 * iOS only supports VTT, Android supports all 3
    		 */
    		type?: WithDefault<string, "srt">;
    		selected?: boolean;
    	}[];
    }>;
    export type OnTextTrackDataChangedData = Readonly<{
    	subtitleTracks: string;
    }>;
    export type OnVideoTracksData = Readonly<{
    	videoTracks: {
    		index: Int32;
    		tracksId?: string;
    		codecs?: string;
    		width?: Float;
    		height?: Float;
    		bitrate?: Float;
    		selected?: boolean;
    	}[];
    }>;
    export type OnPlaybackRateChangeData = Readonly<{
    	playbackRate: Float;
    }>;
    export type OnVolumeChangeData = Readonly<{
    	volume: Float;
    }>;
    export type OnExternalPlaybackChangeData = Readonly<{
    	isExternalPlaybackActive: boolean;
    }>;
    export type OnGetLicenseData = Readonly<{
    	licenseUrl: string;
    	loadedLicenseUrl: string;
    	contentId: string;
    	spcBase64: string;
    }>;
    export type OnPictureInPictureStatusChangedData = Readonly<{
    	isActive: boolean;
    }>;
    type OnReceiveAdEventData = Readonly<{
    	data?: {};
    	event: WithDefault<string, "AD_BREAK_ENDED">;
    }>;
    export type OnVideoErrorData = Readonly<{
    	error: Readonly<{
    		errorString?: string;
    		errorException?: string;
    		errorStackTrace?: string;
    		errorCode?: string;
    		error?: string;
    		code?: Int32;
    		localizedDescription?: string;
    		localizedFailureReason?: string;
    		localizedRecoverySuggestion?: string;
    		domain?: string;
    	}>;
    	target?: Int32;
    }>;
    export type OnAudioFocusChangedData = Readonly<{
    	hasAudioFocus: boolean;
    }>;
    type ControlsStyles = Readonly<{
    	hideSeekBar?: WithDefault<boolean, false>;
    	hideDuration?: WithDefault<boolean, false>;
    	seekIncrementMS?: Int32;
    	hideNavigationBarOnFullScreenMode?: WithDefault<boolean, true>;
    	hideNotificationBarOnFullScreenMode?: WithDefault<boolean, true>;
    }>;
    export type OnControlsVisibilityChange = Readonly<{
    	isVisible: boolean;
    }>;
    export interface VideoNativeProps extends ViewProps {
    	src?: VideoSrc;
    	adTagUrl?: string;
    	adLanguage?: string;
    	allowsExternalPlayback?: boolean;
    	disableFocus?: boolean;
    	maxBitRate?: Float;
    	resizeMode?: WithDefault<string, "none">;
    	repeat?: boolean;
    	automaticallyWaitsToMinimizeStalling?: boolean;
    	shutterColor?: Int32;
    	audioOutput?: WithDefault<string, "speaker">;
    	textTracks?: TextTracks;
    	selectedTextTrack?: SelectedTextTrack;
    	selectedAudioTrack?: SelectedAudioTrack;
    	selectedVideoTrack?: SelectedVideoTrack;
    	paused?: boolean;
    	muted?: boolean;
    	controls?: boolean;
    	filter?: WithDefault<string, "">;
    	filterEnabled?: boolean;
    	volume?: Float;
    	playInBackground?: boolean;
    	preventsDisplaySleepDuringVideoPlayback?: boolean;
    	preferredForwardBufferDuration?: Float;
    	playWhenInactive?: boolean;
    	pictureInPicture?: boolean;
    	ignoreSilentSwitch?: WithDefault<string, "inherit">;
    	mixWithOthers?: WithDefault<string, "inherit">;
    	rate?: Float;
    	fullscreen?: boolean;
    	fullscreenAutorotate?: boolean;
    	fullscreenOrientation?: WithDefault<string, "all">;
    	progressUpdateInterval?: Float;
    	restoreUserInterfaceForPIPStopCompletionHandler?: boolean;
    	localSourceEncryptionKeyScheme?: string;
    	debug?: DebugConfig;
    	showNotificationControls?: WithDefault<boolean, false>;
    	bufferConfig?: BufferConfig;
    	contentStartTime?: Int32;
    	currentPlaybackTime?: Double;
    	disableDisconnectError?: boolean;
    	focusable?: boolean;
    	hideShutterView?: boolean;
    	minLoadRetryCount?: Int32;
    	reportBandwidth?: boolean;
    	subtitleStyle?: SubtitleStyle;
    	viewType?: Int32;
    	bufferingStrategy?: BufferingStrategyType;
    	controlsStyles?: ControlsStyles;
    	onControlsVisibilityChange?: DirectEventHandler<OnControlsVisibilityChange>;
    	onVideoLoad?: DirectEventHandler<OnLoadData>;
    	onVideoLoadStart?: DirectEventHandler<OnLoadStartData>;
    	onVideoAspectRatio?: DirectEventHandler<OnVideoAspectRatioData>;
    	onVideoBuffer?: DirectEventHandler<OnBufferData>;
    	onVideoError?: DirectEventHandler<OnVideoErrorData>;
    	onVideoProgress?: DirectEventHandler<OnProgressData>;
    	onVideoBandwidthUpdate?: DirectEventHandler<OnBandwidthUpdateData>;
    	onVideoSeek?: DirectEventHandler<OnSeekData>;
    	onVideoEnd?: DirectEventHandler<{}>;
    	onVideoAudioBecomingNoisy?: DirectEventHandler<{}>;
    	onVideoFullscreenPlayerWillPresent?: DirectEventHandler<{}>;
    	onVideoFullscreenPlayerDidPresent?: DirectEventHandler<{}>;
    	onVideoFullscreenPlayerWillDismiss?: DirectEventHandler<{}>;
    	onVideoFullscreenPlayerDidDismiss?: DirectEventHandler<{}>;
    	onReadyForDisplay?: DirectEventHandler<{}>;
    	onPlaybackRateChange?: DirectEventHandler<OnPlaybackRateChangeData>;
    	onVolumeChange?: DirectEventHandler<OnVolumeChangeData>;
    	onVideoExternalPlaybackChange?: DirectEventHandler<OnExternalPlaybackChangeData>;
    	onGetLicense?: DirectEventHandler<OnGetLicenseData>;
    	onPictureInPictureStatusChanged?: DirectEventHandler<OnPictureInPictureStatusChangedData>;
    	onRestoreUserInterfaceForPictureInPictureStop?: DirectEventHandler<{}>;
    	onReceiveAdEvent?: DirectEventHandler<OnReceiveAdEventData>;
    	onVideoPlaybackStateChanged?: DirectEventHandler<OnPlaybackStateChangedData>;
    	onVideoIdle?: DirectEventHandler<{}>;
    	onAudioFocusChanged?: DirectEventHandler<OnAudioFocusChangedData>;
    	onTimedMetadata?: DirectEventHandler<OnTimedMetadataData>;
    	onAudioTracks?: DirectEventHandler<OnAudioTracksData>;
    	onTextTracks?: DirectEventHandler<OnTextTracksData>;
    	onTextTrackDataChanged?: DirectEventHandler<OnTextTrackDataChangedData>;
    	onVideoTracks?: DirectEventHandler<OnVideoTracksData>;
    }
    export type AudioTrack = OnAudioTracksData["audioTracks"][number];
    type TextTrack$1 = OnTextTracksData$1["textTracks"][number];
    export type VideoTrack = OnVideoTracksData["videoTracks"][number];
    type OnLoadData$1 = Readonly<{
    	currentTime: number;
    	duration: number;
    	naturalSize: Readonly<{
    		width: number;
    		height: number;
    		orientation: WithDefault<"landscape" | "portrait", "landscape">;
    	}>;
    	audioTracks: {
    		index: number;
    		title?: string;
    		language?: string;
    		bitrate?: number;
    		type?: string;
    		selected?: boolean;
    	}[];
    	textTracks: {
    		index: number;
    		title?: string;
    		language?: string;
    		/**
    		 * iOS only supports VTT, Android supports all 3
    		 */
    		type?: WithDefault<"srt" | "ttml" | "vtt", "srt">;
    		selected?: boolean;
    	}[];
    	videoTracks: {
    		index: number;
    		tracksID?: string;
    		codecs?: string;
    		width?: number;
    		height?: number;
    		bitrate?: number;
    		selected?: boolean;
    	}[];
    }>;
    type OnTextTracksData$1 = Readonly<{
    	textTracks: {
    		index: number;
    		title?: string;
    		language?: string;
    		/**
    		 * iOS only supports VTT, Android supports all 3
    		 */
    		type?: WithDefault<string, "srt">;
    		selected?: boolean;
    	}[];
    }>;
    type OnReceiveAdEventData$1 = Readonly<{
    	data?: object;
    	event: WithDefault<
    	/**
    	 * iOS only: Fired the first time each ad break ends. Applications must reenable seeking when this occurs (only used for dynamic ad insertion).
    	 */ "AD_BREAK_ENDED"
    	/**
    	 * Fires when an ad rule or a VMAP ad break would have played if autoPlayAdBreaks is false.
    	 */
    	 | "AD_BREAK_READY"
    	/**
    	 * iOS only: Fired first time each ad break begins playback. If an ad break is watched subsequent times this will not be fired. Applications must disable seeking when this occurs (only used for dynamic ad insertion).
    	 */
    	 | "AD_BREAK_STARTED"
    	/**
    	 * Android only: Fires when the ad has stalled playback to buffer.
    	 */
    	 | "AD_BUFFERING"
    	/**
    	 * Android only: Fires when the ad is ready to play without buffering, either at the beginning of the ad or after buffering completes.
    	 */
    	 | "AD_CAN_PLAY"
    	/**
    	 * Android only: Fires when an ads list is loaded.
    	 */
    	 | "AD_METADATA"
    	/**
    	 * iOS only: Fired every time the stream switches from advertising or slate to content. This will be fired even when an ad is played a second time or when seeking into an ad (only used for dynamic ad insertion).
    	 */
    	 | "AD_PERIOD_ENDED"
    	/**
    	 * iOS only: Fired every time the stream switches from content to advertising or slate. This will be fired even when an ad is played a second time or when seeking into an ad (only used for dynamic ad insertion).
    	 */
    	 | "AD_PERIOD_STARTED"
    	/**
    	 * Android only: Fires when the ad's current time value changes. The event `data` will be populated with an AdProgressData object.
    	 */
    	 | "AD_PROGRESS"
    	/**
    	 * Fires when the ads manager is done playing all the valid ads in the ads response, or when the response doesn't return any valid ads.
    	 */
    	 | "ALL_ADS_COMPLETED"
    	/**
    	 * Fires when the ad is clicked.
    	 */
    	 | "CLICK"
    	/**
    	 * Fires when the ad completes playing.
    	 */
    	 | "COMPLETED"
    	/**
    	 * Android only: Fires when content should be paused. This usually happens right before an ad is about to cover the content.
    	 */
    	 | "CONTENT_PAUSE_REQUESTED"
    	/**
    	 * Android only: Fires when content should be resumed. This usually happens when an ad finishes or collapses.
    	 */
    	 | "CONTENT_RESUME_REQUESTED"
    	/**
    	 * iOS only: Cuepoints changed for VOD stream (only used for dynamic ad insertion).
    	 */
    	 | "CUEPOINTS_CHANGED"
    	/**
    	 * Android only: Fires when the ad's duration changes.
    	 */
    	 | "DURATION_CHANGE"
    	/**
    	 * Fires when an error is encountered and the ad can't be played.
    	 */
    	 | "ERROR"
    	/**
    	 * Fires when the ad playhead crosses first quartile.
    	 */
    	 | "FIRST_QUARTILE"
    	/**
    	 * Android only: Fires when the impression URL has been pinged.
    	 */
    	 | "IMPRESSION"
    	/**
    	 * Android only: Fires when an ad triggers the interaction callback. Ad interactions contain an interaction ID string in the ad data.
    	 */
    	 | "INTERACTION"
    	/**
    	 * Android only: Fires when the displayed ad changes from linear to nonlinear, or the reverse.
    	 */
    	 | "LINEAR_CHANGED"
    	/**
    	 * Fires when ad data is available.
    	 */
    	 | "LOADED"
    	/**
    	 * Fires when a non-fatal error is encountered. The user need not take any action since the SDK will continue with the same or next ad playback depending on the error situation.
    	 */
    	 | "LOG"
    	/**
    	 * Fires when the ad playhead crosses midpoint.
    	 */
    	 | "MIDPOINT"
    	/**
    	 * Fires when the ad is paused.
    	 */
    	 | "PAUSED"
    	/**
    	 * Fires when the ad is resumed.
    	 */
    	 | "RESUMED"
    	/**
    	 * Android only: Fires when the displayed ads skippable state is changed.
    	 */
    	 | "SKIPPABLE_STATE_CHANGED"
    	/**
    	 * Fires when the ad is skipped by the user.
    	 */
    	 | "SKIPPED"
    	/**
    	 * Fires when the ad starts playing.
    	 */
    	 | "STARTED"
    	/**
    	 * iOS only: Stream request has loaded (only used for dynamic ad insertion).
    	 */
    	 | "STREAM_LOADED"
    	/**
    	 * iOS only: Fires when the ad is tapped.
    	 */
    	 | "TAPPED"
    	/**
    	 * Fires when the ad playhead crosses third quartile.
    	 */
    	 | "THIRD_QUARTILE"
    	/**
    	 * iOS only: An unknown event has fired
    	 */
    	 | "UNKNOWN"
    	/**
    	 * Android only: Fires when the ad is closed by the user.
    	 */
    	 | "USER_CLOSE"
    	/**
    	 * Android only: Fires when the non-clickthrough portion of a video ad is clicked.
    	 */
    	 | "VIDEO_CLICKED"
    	/**
    	 * Android only: Fires when a user clicks a video icon.
    	 */
    	 | "VIDEO_ICON_CLICKED"
    	/**
    	 * Android only: Fires when the ad volume has changed.
    	 */
    	 | "VOLUME_CHANGED"
    	/**
    	 * Android only: Fires when the ad volume has been muted.
    	 */
    	 | "VOLUME_MUTED", "AD_BREAK_ENDED">;
    }>;
    export interface ReactVideoEvents {
    	onAudioBecomingNoisy?: () => void;
    	onAudioFocusChanged?: (e: OnAudioFocusChangedData) => void;
    	onIdle?: () => void;
    	onBandwidthUpdate?: (e: OnBandwidthUpdateData) => void;
    	onBuffer?: (e: OnBufferData) => void;
    	onControlsVisibilityChange?: (e: OnControlsVisibilityChange) => void;
    	onEnd?: () => void;
    	onError?: (e: OnVideoErrorData) => void;
    	onExternalPlaybackChange?: (e: OnExternalPlaybackChangeData) => void;
    	onFullscreenPlayerWillPresent?: () => void;
    	onFullscreenPlayerDidPresent?: () => void;
    	onFullscreenPlayerWillDismiss?: () => void;
    	onFullscreenPlayerDidDismiss?: () => void;
    	onLoad?: (e: OnLoadData$1) => void;
    	onLoadStart?: (e: OnLoadStartData) => void;
    	onPictureInPictureStatusChanged?: (e: OnPictureInPictureStatusChangedData) => void;
    	onPlaybackRateChange?: (e: OnPlaybackRateChangeData) => void;
    	onVolumeChange?: (e: OnVolumeChangeData) => void;
    	onProgress?: (e: OnProgressData) => void;
    	onReadyForDisplay?: () => void;
    	onReceiveAdEvent?: (e: OnReceiveAdEventData$1) => void;
    	onRestoreUserInterfaceForPictureInPictureStop?: () => void;
    	onSeek?: (e: OnSeekData) => void;
    	onPlaybackStateChanged?: (e: OnPlaybackStateChangedData) => void;
    	onTimedMetadata?: (e: OnTimedMetadataData) => void;
    	onAudioTracks?: (e: OnAudioTracksData) => void;
    	onTextTracks?: (e: OnTextTracksData$1) => void;
    	onTextTrackDataChanged?: (e: OnTextTrackDataChangedData) => void;
    	onVideoTracks?: (e: OnVideoTracksData) => void;
    	onAspectRatio?: (e: OnVideoAspectRatioData) => void;
    }
    export declare enum FilterType {
    	NONE = "",
    	INVERT = "CIColorInvert",
    	MONOCHROME = "CIColorMonochrome",
    	POSTERIZE = "CIColorPosterize",
    	FALSE = "CIFalseColor",
    	MAXIMUMCOMPONENT = "CIMaximumComponent",
    	MINIMUMCOMPONENT = "CIMinimumComponent",
    	CHROME = "CIPhotoEffectChrome",
    	FADE = "CIPhotoEffectFade",
    	INSTANT = "CIPhotoEffectInstant",
    	MONO = "CIPhotoEffectMono",
    	NOIR = "CIPhotoEffectNoir",
    	PROCESS = "CIPhotoEffectProcess",
    	TONAL = "CIPhotoEffectTonal",
    	TRANSFER = "CIPhotoEffectTransfer",
    	SEPIA = "CISepiaTone"
    }
    export type ISO639_1 = "aa" | "ab" | "ae" | "af" | "ak" | "am" | "an" | "ar" | "as" | "av" | "ay" | "az" | "ba" | "be" | "bg" | "bi" | "bm" | "bn" | "bo" | "br" | "bs" | "ca" | "ce" | "ch" | "co" | "cr" | "cs" | "cu" | "cv" | "cy" | "da" | "de" | "dv" | "dz" | "ee" | "el" | "en" | "eo" | "es" | "et" | "eu" | "fa" | "ff" | "fi" | "fj" | "fo" | "fr" | "fy" | "ga" | "gd" | "gl" | "gn" | "gu" | "gv" | "ha" | "he" | "hi" | "ho" | "hr" | "ht" | "hu" | "hy" | "hz" | "ia" | "id" | "ie" | "ig" | "ii" | "ik" | "io" | "is" | "it" | "iu" | "ja" | "jv" | "ka" | "kg" | "ki" | "kj" | "kk" | "kl" | "km" | "kn" | "ko" | "kr" | "ks" | "ku" | "kv" | "kw" | "ky" | "la" | "lb" | "lg" | "li" | "ln" | "lo" | "lt" | "lu" | "lv" | "mg" | "mh" | "mi" | "mk" | "ml" | "mn" | "mr" | "ms" | "mt" | "my" | "na" | "nb" | "nd" | "ne" | "ng" | "nl" | "nn" | "no" | "nr" | "nv" | "ny" | "oc" | "oj" | "om" | "or" | "os" | "pa" | "pi" | "pl" | "ps" | "pt" | "qu" | "rm" | "rn" | "ro" | "ru" | "rw" | "sa" | "sc" | "sd" | "se" | "sg" | "si" | "sk" | "sl" | "sm" | "sn" | "so" | "sq" | "sr" | "ss" | "st" | "su" | "sv" | "sw" | "ta" | "te" | "tg" | "th" | "ti" | "tk" | "tl" | "tn" | "to" | "tr" | "ts" | "tt" | "tw" | "ty" | "ug" | "uk" | "ur" | "uz" | "ve" | "vi" | "vo" | "wa" | "wo" | "xh" | "yi" | "yo" | "za" | "zh" | "zu";
    export declare enum Orientation {
    	PORTRAIT = "portrait",
    	LANDSCAPE = "landscape"
    }
    export declare enum ResizeMode {
    	NONE = "none",
    	CONTAIN = "contain",
    	COVER = "cover",
    	STRETCH = "stretch"
    }
    export declare enum TextTrackType {
    	SUBRIP = "application/x-subrip",
    	TTML = "application/ttml+xml",
    	VTT = "text/vtt"
    }
    /**
     * Define Available view type for android
     * these values shall match android spec, see ViewType.kt
     */
    export declare enum ViewType {
    	TEXTURE = 0,
    	SURFACE = 1,
    	SURFACE_SECURE = 2
    }
    type Headers$1 = Record<string, string>;
    export type EnumValues<T extends string | number> = T extends string ? `${T}` | T : T;
    export type ReactVideoSourceProperties = {
    	uri?: string;
    	isNetwork?: boolean;
    	isAsset?: boolean;
    	shouldCache?: boolean;
    	type?: string;
    	mainVer?: number;
    	patchVer?: number;
    	headers?: Headers$1;
    	startPosition?: number;
    	cropStart?: number;
    	cropEnd?: number;
    	metadata?: VideoMetadata$1;
    	drm?: Drm$1;
    	cmcd?: Cmcd;
    	textTracksAllowChunklessPreparation?: boolean;
    };
    export type ReactVideoSource = Readonly<Omit<ReactVideoSourceProperties, "uri"> & {
    	uri?: string | NodeRequire;
    }>;
    export type ReactVideoPosterSource = ImageURISource | ImageRequireSource;
    export type ReactVideoPoster = Omit<ImageProps, "source"> & {
    	source?: ReactVideoPosterSource;
    };
    type VideoMetadata$1 = Readonly<{
    	title?: string;
    	subtitle?: string;
    	description?: string;
    	artist?: string;
    	imageUri?: string;
    }>;
    type DebugConfig$1 = Readonly<{
    	enable?: boolean;
    	thread?: boolean;
    }>;
    declare enum DRMType$1 {
    	WIDEVINE = "widevine",
    	PLAYREADY = "playready",
    	CLEARKEY = "clearkey",
    	FAIRPLAY = "fairplay"
    }
    type Drm$1 = Readonly<{
    	type?: DRMType$1;
    	licenseServer?: string;
    	headers?: Headers$1;
    	contentId?: string;
    	certificateUrl?: string;
    	base64Certificate?: boolean;
    	multiDrm?: boolean;
    	getLicense?: (spcBase64: string, contentId: string, licenseUrl: string, loadedLicenseUrl: string) => string | Promise<string>;
    }>;
    declare enum CmcdMode$1 {
    	MODE_REQUEST_HEADER = 0,
    	MODE_QUERY_PARAMETER = 1
    }
    /**
     * Custom key names MUST carry a hyphenated prefix to ensure that there will not be a
     * namespace collision with future revisions to this specification. Clients SHOULD
     * use a reverse-DNS syntax when defining their own prefix.
     *
     * @see https://cdn.cta.tech/cta/media/media/resources/standards/pdfs/cta-5004-final.pdf CTA-5004 Specification (Page 6, Section 3.1)
     */
    export type CmcdData = Record<`${string}-${string}`, string | number>;
    export type CmcdConfiguration = Readonly<{
    	mode?: CmcdMode$1;
    	request?: CmcdData;
    	session?: CmcdData;
    	object?: CmcdData;
    	status?: CmcdData;
    }>;
    export type Cmcd = boolean | CmcdConfiguration;
    declare enum BufferingStrategyType$1 {
    	DEFAULT = "Default",
    	DISABLE_BUFFERING = "DisableBuffering",
    	DEPENDING_ON_MEMORY = "DependingOnMemory"
    }
    type BufferConfigLive$1 = {
    	maxPlaybackSpeed?: number;
    	minPlaybackSpeed?: number;
    	maxOffsetMs?: number;
    	minOffsetMs?: number;
    	targetOffsetMs?: number;
    };
    type BufferConfig$1 = {
    	minBufferMs?: number;
    	maxBufferMs?: number;
    	bufferForPlaybackMs?: number;
    	bufferForPlaybackAfterRebufferMs?: number;
    	backBufferDurationMs?: number;
    	maxHeapAllocationPercent?: number;
    	minBackBufferMemoryReservePercent?: number;
    	minBufferMemoryReservePercent?: number;
    	cacheSizeMB?: number;
    	live?: BufferConfigLive$1;
    };
    export declare enum SelectedTrackType {
    	SYSTEM = "system",
    	DISABLED = "disabled",
    	TITLE = "title",
    	LANGUAGE = "language",
    	INDEX = "index"
    }
    export type SelectedTrack = {
    	type: SelectedTrackType;
    	value?: string | number;
    };
    declare enum SelectedVideoTrackType$1 {
    	AUTO = "auto",
    	DISABLED = "disabled",
    	RESOLUTION = "resolution",
    	INDEX = "index"
    }
    type SelectedVideoTrack$1 = {
    	type: SelectedVideoTrackType$1;
    	value?: string | number;
    };
    type SubtitleStyle$1 = {
    	fontSize?: number;
    	paddingTop?: number;
    	paddingBottom?: number;
    	paddingLeft?: number;
    	paddingRight?: number;
    	opacity?: number;
    	subtitlesFollowVideo?: boolean;
    };
    declare enum TextTrackType$1 {
    	SUBRIP = "application/x-subrip",
    	TTML = "application/ttml+xml",
    	VTT = "text/vtt"
    }
    type TextTracks$1 = {
    	title: string;
    	language: ISO639_1;
    	type: TextTrackType$1;
    	uri: string;
    }[];
    export type TextTrackSelectionType = "system" | "disabled" | "title" | "language" | "index";
    type SelectedTextTrack$1 = Readonly<{
    	type: TextTrackSelectionType;
    	value?: string | number;
    }>;
    export type AudioTrackSelectionType = "system" | "disabled" | "title" | "language" | "index";
    type SelectedAudioTrack$1 = Readonly<{
    	type: AudioTrackSelectionType;
    	value?: string | number;
    }>;
    export type Chapters = {
    	title: string;
    	startTime: number;
    	endTime: number;
    	uri?: string;
    };
    export declare enum FullscreenOrientationType {
    	ALL = "all",
    	LANDSCAPE = "landscape",
    	PORTRAIT = "portrait"
    }
    export declare enum IgnoreSilentSwitchType {
    	INHERIT = "inherit",
    	IGNORE = "ignore",
    	OBEY = "obey"
    }
    export declare enum MixWithOthersType {
    	INHERIT = "inherit",
    	MIX = "mix",
    	DUCK = "duck"
    }
    export declare enum PosterResizeModeType {
    	CONTAIN = "contain",
    	CENTER = "center",
    	COVER = "cover",
    	NONE = "none",
    	REPEAT = "repeat",
    	STRETCH = "stretch"
    }
    export type AudioOutput = "speaker" | "earpiece";
    type ControlsStyles$1 = {
    	hideSeekBar?: boolean;
    	hideDuration?: boolean;
    	seekIncrementMS?: number;
    	hideNavigationBarOnFullScreenMode?: boolean;
    	hideNotificationBarOnFullScreenMode?: boolean;
    };
    export interface ReactVideoProps extends ReactVideoEvents, ViewProps {
    	source?: ReactVideoSource;
    	/** @deprecated */
    	drm?: Drm$1;
    	style?: StyleProp<ViewStyle>;
    	adTagUrl?: string;
    	adLanguage?: ISO639_1;
    	audioOutput?: AudioOutput;
    	automaticallyWaitsToMinimizeStalling?: boolean;
    	bufferConfig?: BufferConfig$1;
    	bufferingStrategy?: BufferingStrategyType$1;
    	chapters?: Chapters[];
    	contentStartTime?: number;
    	controls?: boolean;
    	currentPlaybackTime?: number;
    	disableFocus?: boolean;
    	disableDisconnectError?: boolean;
    	filter?: EnumValues<FilterType>;
    	filterEnabled?: boolean;
    	focusable?: boolean;
    	fullscreen?: boolean;
    	fullscreenAutorotate?: boolean;
    	fullscreenOrientation?: EnumValues<FullscreenOrientationType>;
    	hideShutterView?: boolean;
    	ignoreSilentSwitch?: EnumValues<IgnoreSilentSwitchType>;
    	minLoadRetryCount?: number;
    	maxBitRate?: number;
    	mixWithOthers?: EnumValues<MixWithOthersType>;
    	muted?: boolean;
    	paused?: boolean;
    	pictureInPicture?: boolean;
    	playInBackground?: boolean;
    	playWhenInactive?: boolean;
    	poster?: string | ReactVideoPoster;
    	/** @deprecated use **resizeMode** key in **poster** props instead */
    	posterResizeMode?: EnumValues<PosterResizeModeType>;
    	preferredForwardBufferDuration?: number;
    	preventsDisplaySleepDuringVideoPlayback?: boolean;
    	progressUpdateInterval?: number;
    	rate?: number;
    	renderLoader?: React$1.ReactNode;
    	repeat?: boolean;
    	reportBandwidth?: boolean;
    	resizeMode?: EnumValues<ResizeMode>;
    	showNotificationControls?: boolean;
    	selectedAudioTrack?: SelectedTrack;
    	selectedTextTrack?: SelectedTrack;
    	selectedVideoTrack?: SelectedVideoTrack$1;
    	subtitleStyle?: SubtitleStyle$1;
    	shutterColor?: string;
    	textTracks?: TextTracks$1;
    	testID?: string;
    	viewType?: ViewType;
    	/** @deprecated */
    	useTextureView?: boolean;
    	/** @deprecated */
    	useSecureView?: boolean;
    	volume?: number;
    	localSourceEncryptionKeyScheme?: string;
    	debug?: DebugConfig$1;
    	allowsExternalPlayback?: boolean;
    	controlsStyles?: ControlsStyles$1;
    }
    export interface VideoRef {
    	seek: (time: number, tolerance?: number) => void;
    	resume: () => void;
    	pause: () => void;
    	presentFullscreenPlayer: () => void;
    	dismissFullscreenPlayer: () => void;
    	restoreUserInterfaceForPictureInPictureStopCompleted: (restore: boolean) => void;
    	setVolume: (volume: number) => void;
    	setFullScreen: (fullScreen: boolean) => void;
    	save: (options: object) => Promise<VideoSaveData> | void;
    	getCurrentPosition: () => Promise<number>;
    }
    declare const Video: React$1.ForwardRefExoticComponent<ReactVideoProps & React$1.RefAttributes<VideoRef>>;
    export declare const VideoDecoderProperties: {
    	getWidevineLevel(): Promise<number>;
    	isCodecSupported(mimeType: string, width: number, height: number): Promise<"unsupported" | "hardware" | "software">;
    	isHEVCSupported(): Promise<"unsupported" | "hardware" | "software">;
    };
    
    export {
    	BufferConfig$1 as BufferConfig,
    	BufferConfigLive$1 as BufferConfigLive,
    	BufferingStrategyType$1 as BufferingStrategyType,
    	CmcdMode$1 as CmcdMode,
    	ControlsStyles$1 as ControlsStyles,
    	DRMType$1 as DRMType,
    	DebugConfig$1 as DebugConfig,
    	Drm$1 as Drm,
    	Headers$1 as Headers,
    	OnLoadData$1 as OnLoadData,
    	OnReceiveAdEventData$1 as OnReceiveAdEventData,
    	OnTextTracksData$1 as OnTextTracksData,
    	SelectedAudioTrack$1 as SelectedAudioTrack,
    	SelectedTextTrack$1 as SelectedTextTrack,
    	SelectedVideoTrack$1 as SelectedVideoTrack,
    	SelectedVideoTrackType$1 as SelectedVideoTrackType,
    	SubtitleStyle$1 as SubtitleStyle,
    	TextTrack$1 as TextTrack,
    	TextTracks$1 as TextTracks,
    	Video as default,
    	VideoMetadata$1 as VideoMetadata,
    };
    
    export {};
};