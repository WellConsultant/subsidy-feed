import {
  init_modal_v1
} from "./chunk-YNQPYXFA.js";
import {
  CF2Component,
  init_runtime,
  registerComponent
} from "./chunk-IF35HPMH.js";
import {
  init_define_process
} from "./chunk-XDBWEWVZ.js";

// projects/lib/packages/yggdrasil-blueprints/__generated__/packs/video.ts
init_define_process();

// projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/video-player-starter-v1.ts
init_define_process();
var VideoPlayerStarterV1 = class _VideoPlayerStarterV1 {
  static getInstance() {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new _VideoPlayerStarterV1();
    this.setupYoutubeAPI();
    this.setupVimeoAPI();
    this.setupWistiaAPI();
    this.setupVoomlyAPI();
    return this._instance;
  }
  static setupYoutubeAPI() {
    const youtubeVideos = document.querySelectorAll('[data-video-type="youtube"]');
    youtubeVideos?.forEach((yVideo) => {
      if (yVideo?.querySelector(".iframeblocked, .iframeunmuted") && !document.getElementById("youtube-script")) {
        const tag = document.createElement("script");
        tag.src = "//www.youtube.com/iframe_api";
        tag.id = "youtube-script";
        const firstScriptTag = document.body.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        globalThis.onYouTubePlayerAPIReady = () => {
          this.YoutubeApiReady = true;
          const event = new CustomEvent("CF2_YOUTUBE_API_READY");
          document.dispatchEvent(event);
        };
      }
    });
  }
  static setupVimeoAPI() {
    const vimeoVideos = document.querySelectorAll('[data-video-type="vimeo"]');
    vimeoVideos?.forEach((vVideo) => {
      if (vVideo?.querySelector(".iframeblocked, .iframeunmuted") && !document.getElementById("vimeo-script")) {
        const tag = document.createElement("script");
        tag.src = "https://player.vimeo.com/api/player.js";
        tag.id = "vimeo-script";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    });
  }
  static setupWistiaAPI() {
    const wistiaVideos = document.querySelectorAll('[data-video-type="wistia"]');
    wistiaVideos?.forEach((wVideo) => {
      if (wVideo?.querySelector(".iframeblocked, .iframeunmuted") && !document.getElementById("wistia-script")) {
        const tag = document.createElement("script");
        tag.src = "//fast.wistia.net/assets/external/E-v1.js";
        tag.id = "wistia-script";
        const firstScriptTag = document.head.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    });
  }
  static setupVoomlyAPI() {
    if (document.querySelectorAll('[data-video-type="voomly"]').length) {
      document.querySelectorAll('[data-video-type="voomly"]').forEach((voomlyVideo) => {
        const tagSrc = voomlyVideo.getAttribute("data-src-lib-script");
        voomlyVideo.removeAttribute("data-src-lib-script");
        if (!document.getElementById("voomly-script")) {
          const tag = document.createElement("script");
          tag.src = tagSrc;
          tag.id = "voomly-script";
          const firstScriptTag = document.getElementsByTagName("script")[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
          tag.onload = () => {
            document.dispatchEvent(new CustomEvent("CF2_VOOMLY_API_READY"));
          };
        }
      });
    }
  }
  setupVideo(element) {
    const videoType = element.getAttribute("data-video-type");
    if (videoType === "html5") {
      this.setupHTML5(element);
    } else if (videoType === "youtube") {
      this.setupYoutube(element);
    } else if (videoType === "vimeo") {
      this.setupVimeo(element);
    } else if (videoType === "wistia") {
      this.setupWistia(element);
    } else if (videoType === "voomly") {
      this.setupVoomly(element);
    } else if (videoType === "custom" || videoType === "custom_script") {
      this.sharedSetup(element);
    }
    this.setupLazyLoaded(element);
  }
  setAndGetIFrameId(element) {
    let frameId = null;
    if (!element) return;
    const iframe = element.querySelector("iframe");
    frameId = iframe.getAttribute("name");
    iframe.setAttribute("id", frameId);
    return frameId;
  }
  fitVids(element) {
    const customSelectors = [
      'iframe[src*="fast.wistia.net"]',
      'iframe[src*="embed.voomly.com"]',
      'iframe[data-src*="player.vimeo.com"]',
      'iframe[data-src*="youtube.com"]',
      'iframe[data-src*="youtube-nocookie.com"]',
      'iframe[data-src*="fast.wistia.net"]',
      'iframe[data-src*="embed.voomly.com"]',
      'iframe[data-src*="kickstarter.com"][data-src*="video.html"]'
    ];
    $(element).fitVids({ customSelector: customSelectors.join(",") });
  }
  setupMuted(bpPlayer, element) {
    if (!bpPlayer || !element) return;
    const iframeUnmute = element.querySelector(".iframeUnmute");
    const child = '<div class="unmute-player-wrapper"><span class="unmute-player-icon"><i class="fa fa-volume-up"/></span></div>';
    $(iframeUnmute).append(child);
  }
  handleExtraListeners(element, bpPlayer, callback) {
    const videoType = element.getAttribute("data-video-type");
    const blockPauseAttr = element.getAttribute(`data-${videoType}-block-pause`);
    if (blockPauseAttr === "true") {
      this.appendBPText(bpPlayer, element);
      const wrapper = element.querySelector(".start-session-wrapper");
      wrapper.addEventListener("click", () => {
        callback();
        $(wrapper).remove();
      });
    } else {
      this.setupMuted(bpPlayer, element);
      const wrapper = element.querySelector(".unmute-player-wrapper");
      wrapper.addEventListener("click", () => {
        callback();
        $(wrapper).closest(".iframeUnmute").remove();
      });
    }
  }
  resizeVids(iframe, element) {
    $(iframe).attr("width", "auto");
    $(iframe).attr("height", "auto");
    this.fitVids(element);
    $(iframe).css("width", "100%");
    $(iframe).css("height", "100%");
  }
  setStickyVideo(element, isStickyCloseable, videoFrame) {
    const { bottom, top } = element.getBoundingClientRect();
    const videoType = element.getAttribute("data-video-type");
    if (bottom <= 10) {
      if ((videoType === "html5" || videoType === "voomly" || videoType === "custom_script") && !element.dataset.originalHeight) {
        const currentHeight = element.offsetHeight;
        element.dataset.originalHeight = currentHeight;
        element.style.height = `${currentHeight}px`;
      }
      videoFrame.classList.add("video-sticky-css");
      if (!isStickyCloseable) return;
      const closeIconDiv = element.querySelector(".closeIconDiv");
      closeIconDiv.style.display = "flex";
    }
    if (top >= 10) {
      videoFrame.classList.remove("video-sticky-css");
      if ((videoType === "html5" || videoType === "voomly" || videoType === "custom_script") && element.dataset.originalHeight) {
        delete element.dataset.originalHeight;
        element.style.height = "";
      }
      if (!isStickyCloseable) return;
      const closeIconDiv = element.querySelector(".closeIconDiv");
      closeIconDiv.style.display = "none";
    }
  }
  appendBPText(bpPlayer, element) {
    if (!bpPlayer || !element) return;
    const text = element.getAttribute("data-session-starter-text") ?? "Click To Join Session In Progess...";
    const iframeBlocker = element.querySelector(".iframeBlocker");
    const child = `<div class="start-session-wrapper"><span class="start-session">${text}</span></div>`;
    $(iframeBlocker).append(child);
  }
  appendExtraChildren(element) {
    const elVideo = element.querySelector(".elVideo");
    if (elVideo?.classList?.contains("iframeblocked")) $(elVideo).append("<div class='iframeBlocker'></div>");
    if (elVideo?.classList?.contains("iframeunmuted")) $(elVideo).append("<div class='iframeUnmute'></div>");
  }
  setupDefaultSize(element) {
    const iframe = element.querySelector("iframe");
    if (!iframe) return;
    const isVideoPopup = element.parentElement?.classList?.contains("elPopupVideoContainer");
    if (isVideoPopup) {
      this.fitVids(element);
    } else {
      const wrapperWidth = $(element).css("width").split("px")[0];
      const customWidth = element.getAttribute("data-custom-width");
      const customHeight = element.getAttribute("data-custom-height");
      const hasCustomSize = !!customHeight || !!customWidth;
      if (Number(wrapperWidth) > Number(customWidth)) {
        if (hasCustomSize) {
          if (customHeight == "auto" && customWidth == "auto") {
            this.fitVids(element);
          }
        } else {
          this.fitVids(element);
        }
      } else {
        this.fitVids(element);
      }
    }
  }
  setupVideoReSizing(element) {
    const iframe = element.querySelector("iframe");
    const isVideoPopup = element.parentElement?.classList?.contains("elPopupVideoContainer");
    const customWidth = element.getAttribute("data-custom-width");
    if (!iframe || isVideoPopup || !customWidth) return;
    const customHeight = element.getAttribute("data-custom-height");
    const fluidClass = "fluid-width-video-wrapper";
    window.addEventListener("resize", () => {
      const wrapperWidth = $(element).css("width").split("px")[0];
      const hasResized = element.querySelector(`.${fluidClass}`);
      if (Number(wrapperWidth) < Number(customWidth)) {
        if (!hasResized) {
          this.resizeVids(iframe, element);
        }
      } else {
        if (!hasResized) return;
        const $fluidWrapper = $(element).find(`.${fluidClass}`);
        $fluidWrapper.css("padding-top", 0);
        $fluidWrapper.css("border-radius", "inherit");
        $(iframe).css("width", customWidth ?? 640);
        $(iframe).css("height", customHeight ?? 360);
        $fluidWrapper.removeClass(fluidClass);
      }
    });
  }
  isMobile() {
    const subs = {
      Android: function() {
        return navigator.userAgent.match(/Android/i);
      },
      BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
      },
      iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
      },
      Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
      },
      Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
      },
      any: function() {
        return subs.Android() || subs.BlackBerry() || subs.iOS() || subs.Opera() || subs.Windows();
      }
    };
    return subs;
  }
  setupStickyVideo(element) {
    const isSticky = element.getAttribute("data-is-video-sticky") === "true";
    if (!isSticky) return;
    let isVideoClosed = false;
    const isStickyCloseable = element.getAttribute("data-sticky-closeable") === "true";
    let videoFrame = element.querySelector("iframe");
    const videoType = element.getAttribute("data-video-type");
    if (videoType === "html5") videoFrame = element.querySelector(".video-js");
    else if (videoType === "voomly") videoFrame = element.querySelector(`[data-id="${element.getAttribute("data-voomly-video-id")}"]`);
    else if (videoType === "custom_script" && !videoFrame) {
      videoFrame = element.querySelector(".voomly-embed");
    }
    if (!videoFrame) return;
    if (isStickyCloseable) {
      const videoWrapper = element.querySelector(".elVideo") ?? element;
      const closeVideoDiv = document.createElement("div");
      const closeVideoIcon = document.createElement("i");
      closeVideoDiv.classList.add("video-sticky-close-button-css");
      closeVideoIcon.className = "fa fa-times";
      closeVideoDiv.appendChild(closeVideoIcon);
      closeVideoDiv.classList.add("closeIconDiv");
      videoWrapper.appendChild(closeVideoDiv);
      const closeIconDiv = videoWrapper.querySelector(".closeIconDiv");
      closeIconDiv.addEventListener("click", function(e) {
        e.preventDefault();
        closeIconDiv.style.display = "none";
        videoFrame.classList.remove("video-sticky-css");
        if ((videoType === "html5" || videoType === "voomly" || videoType === "custom_script") && element.dataset.originalHeight) {
          delete element.dataset.originalHeight;
          element.style.height = "";
        }
        isVideoClosed = true;
      });
    }
    this.setStickyVideo(element, isStickyCloseable, videoFrame);
    window.addEventListener("scroll", () => {
      const windowWidth = window.innerWidth;
      if (windowWidth > 640 && !this.isMobile().any() && !isVideoClosed) {
        this.setStickyVideo(element, isStickyCloseable, videoFrame);
      }
    });
  }
  handleVoomlyAPI() {
    const voomlyEmbedBlock = document.querySelectorAll(".voomly-embed-api");
    voomlyEmbedBlock.forEach((video) => {
      const videoID = video.dataset.id;
      const videoType = video.dataset.type;
      const videoAspect = video.dataset.ratio;
      const player = window.attachVoomlyPlayer(video, videoID, videoType, videoAspect);
      player.onReady(() => {
        player.enableCustomTurnstileIntegration();
        player.onTimelineTurnstileCompleted((body) => {
          if (body.email) {
            const filteredBody = {};
            Object.keys(body).forEach((key) => {
              if (key === "firstName") filteredBody["first_name"] = body[key];
              if (key === "lastName") filteredBody["last_name"] = body[key];
              if (key === "email") filteredBody["email"] = body[key];
            });
            fetch(window.location, {
              method: "post",
              headers: {
                "Content-Type": "application/json",
                "X-CF2-POST-TYPE": "submit"
              },
              body: JSON.stringify({ contact: filteredBody })
            });
          }
        });
      });
    });
  }
  setupVoomly(element) {
    if (window.attachVoomlyPlayer) {
      if (element.querySelector(".voomly-embed-api")) {
        this.handleVoomlyAPI();
      }
      this.sharedSetup(element);
    } else {
      document.addEventListener("CF2_VOOMLY_API_READY", () => {
        if (element.querySelector(".voomly-embed-api")) {
          this.handleVoomlyAPI();
        }
        this.sharedSetup(element);
      });
    }
  }
  setupYoutubeBP(element) {
    const frameId = this.setAndGetIFrameId(element);
    if (!frameId) return;
    const bpPlayer = new window.YT.Player(frameId, {});
    this.handleExtraListeners(element, bpPlayer, () => {
      bpPlayer.seekTo(0, true);
      bpPlayer.unMute();
    });
  }
  setupYoutubeBPListeners(element) {
    const bpVideo = element.querySelector(".iframeblocked, .iframeunmuted");
    if (!bpVideo) return;
    const iframe = bpVideo.querySelector("iframe");
    const srcAttr = iframe.getAttribute("data-src") ? "data-src" : "src";
    let src = iframe.getAttribute(srcAttr);
    if (src.indexOf("enablejsapi") < 0) {
      src = src.replace("autoplay=1", "enablejsapi=1&autoplay=1");
      iframe.setAttribute(srcAttr, src);
    }
    if (_VideoPlayerStarterV1.YoutubeApiReady) {
      if (!iframe.getAttribute("data-src")) this.setupYoutubeBP(element);
    } else {
      document.addEventListener("CF2_YOUTUBE_API_READY", () => {
        if (!iframe.getAttribute("data-src")) this.setupYoutubeBP(element);
      });
    }
  }
  setupVimeoBP(element) {
    const frameId = this.setAndGetIFrameId(element);
    if (frameId) {
      const bpPlayer = new window.Vimeo.Player(frameId);
      bpPlayer.ready().then(() => {
        this.handleExtraListeners(element, bpPlayer, () => {
          bpPlayer.setCurrentTime(0);
          bpPlayer.setVolume(0.5);
        });
      });
    }
  }
  checkVimeoReady(element) {
    const loopUntilVimeoReady = (timeout) => {
      timeout = timeout >= 300 ? timeout : timeout + 50;
      const iframe = element.querySelector("iframe");
      if (!window.Vimeo) {
        window.setTimeout(loopUntilVimeoReady, timeout, timeout);
      } else {
        if (!iframe.getAttribute("data-src")) this.setupVimeoBP(element);
      }
    };
    loopUntilVimeoReady(50);
  }
  setupVimeoListeners(element) {
    const bpVideo = element.querySelector(".iframeblocked, .iframeunmuted");
    if (!bpVideo) return;
    this.checkVimeoReady(element);
  }
  setupWistiaBP(element) {
    const setWistiaListener = (video) => {
      const bpPlayer = video;
      const element2 = $(video.container).closest(".elVideoWrapper").get(0);
      this.handleExtraListeners(element2, bpPlayer, () => {
        bpPlayer.play();
        bpPlayer.unmute();
      });
    };
    const wistiaId = element.getAttribute("data-wistia-id");
    globalThis._wq = globalThis._wq || [];
    globalThis._wq.push({ id: wistiaId, onReady: setWistiaListener });
  }
  setupWistiaListeners(element) {
    const bpVideo = element.querySelector(".iframeblocked, .iframeunmuted");
    const iframe = element.querySelector("iframe");
    if (!bpVideo) return;
    if (!iframe.getAttribute("data-src")) this.setupWistiaBP(element);
  }
  sharedSetup(element) {
    this.setupDefaultSize(element);
    this.setupVideoReSizing(element);
    this.setupStickyVideo(element);
    this.appendExtraChildren(element);
  }
  setupYoutube(element) {
    const url = window.location.href;
    const queries = $.parseParams(url);
    if (queries["noautoplay"] == "true") {
      let src = $(".elVideo iframe", $(element)).attr("src");
      src = src.replace("autoplay=1", "autoplay=0");
      $(".elVideo iframe", $(element)).attr("src", src);
    }
    this.sharedSetup(element);
    this.setupYoutubeBPListeners(element);
  }
  setupVimeo(element) {
    const url = window.location.href;
    const queries = $.parseParams(url);
    if (queries["noautoplay"] == "true") {
      let src = $(".elVideo iframe", $(element)).attr("src");
      src = src.replace("autoplay=1", "autoplay=0");
      $(".elVideo iframe", $(element)).attr("src", src);
    }
    this.sharedSetup(element);
    this.setupVimeoListeners(element);
  }
  setupWistia(element) {
    const url = window.location.href;
    const queries = $.parseParams(url);
    if (queries["noautoplay"] == "true") {
      let src = $(".elVideo iframe", this).attr("src");
      src = src.replace("autoPlay=1", "autoPlay=0");
      $(".elVideo iframe", this).attr("src", src);
    }
    this.sharedSetup(element);
    this.setupWistiaListeners(element);
  }
  setupHTML5(element) {
    const video = element.querySelector("video");
    const id = video.id;
    const player = globalThis.videojs(id);
    player.fluid(true);
    player.playbackRates([0.5, 1, 1.5, 2]);
    player.aspectRatio("16:9");
    this.sharedSetup(element);
    video.addEventListener("contextmenu", (evt) => {
      evt.preventDefault();
    });
  }
  setupLazyLoaded(element) {
    var lazyVideo = element.querySelector('iframe[data-loading="lazy"], video[data-loading="lazy"]');
    const videoType = element.getAttribute("data-video-type");
    if (lazyVideo && "IntersectionObserver" in window) {
      if (lazyVideo.tagName == "VIDEO") {
        lazyVideo.addEventListener("loadeddata", () => {
          delete element.querySelector(".elSpinnerWrapper")?.dataset?.loader;
        });
      } else if (lazyVideo.tagName == "IFRAME") {
        lazyVideo.addEventListener("load", () => {
          if (element.querySelector(".iframeblocked, .iframeunmuted")) {
            if (videoType === "youtube") {
              this.setupYoutubeBP(element);
            } else if (videoType === "vimeo") {
              this.setupVimeoBP(element);
            } else if (videoType === "wistia") {
              this.setupWistiaBP(element);
            }
          }
          delete element.querySelector(".elSpinnerWrapper")?.dataset?.loader;
        });
      }
      var lazyVideoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((el) => {
          const target = el.target;
          if (el.isIntersecting) {
            if (target.tagName == "IFRAME") {
              target.setAttribute("src", target.dataset.src);
              delete target.dataset.loading;
              lazyVideoObserver.unobserve(lazyVideo);
            } else if (target.tagName == "VIDEO") {
              for (var source in target.children) {
                var videoSource = target.children[source];
                if (typeof videoSource.tagName === "string" && videoSource.tagName === "SOURCE" && videoSource.dataset.src) {
                  videoSource.src = videoSource.dataset.src;
                }
              }
              target.load();
              delete target.dataset.loading;
              lazyVideoObserver.unobserve(lazyVideo);
            }
          }
        });
      });
      lazyVideoObserver.observe(lazyVideo);
    } else {
      delete element.querySelector(".elSpinnerWrapper")?.dataset?.loader;
    }
  }
};
var videoPlayerStarter = VideoPlayerStarterV1.getInstance();
var video_player_starter_v1_default = videoPlayerStarter;

// projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/video-background-v1.ts
init_define_process();
init_runtime();
var VideoBackgroundV1 = class extends CF2Component {
  constructor(el, runtimeSel) {
    super(el, runtimeSel);
  }
  mount() {
    this.parentElement = this.element.parentElement;
    this.isPageBackground = this.parentElement.getAttribute("data-page-element") === "ContentNode";
    this.background = $(this.parentElement).css("background");
    this.backgroundOverlayContainer = this.element.querySelector(".backgroundOverlay");
    this.videoEnded = false;
    this.id = this.element.getAttribute("data-param-videoid");
    this.playerId = this.element.getAttribute("data-param-videoplayerid");
    this.type = this.element.getAttribute("data-param-videotype");
    this.endaction = this.element.getAttribute("data-param-endaction");
    this.redirectUrl = this.element.getAttribute("data-param-redirecturl");
    this.redirectToNewPage = this.element.getAttribute("data-param-redirectnewpage");
    this.useBgAsOverlay = this.element.getAttribute("data-param-usebgasoverlay");
    this.styleType = this.element.getAttribute("data-param-bgstyletype");
    this.offsetY = this.element.getAttribute("data-param-bgoffsety");
    this.offsetX = this.element.getAttribute("data-param-bgoffsetx");
    this.hideOnMobile = this.element.getAttribute("data-param-hideonmobile");
    this.overlayBackground = this.element.getAttribute("data-param-overlaybackground");
    const href = window.location.href;
    const queries = $.parseParams(href);
    if (queries["noautoplay"] == "true") return;
    if (this.type === "youtube") {
      if (!document.getElementById("youtube-script")) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.id = "youtube-script";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
      this.handleYoububePlayer();
    } else if (this.type === "vimeo") {
      if (!document.getElementById("vimeo-script")) {
        const tag = document.createElement("script");
        tag.src = "https://player.vimeo.com/api/player.js";
        tag.id = "vimeo-script";
        $("body").append(tag);
      }
      this.handleVimeoPlayer();
    }
  }
  handleVideoStart() {
    const parentElement = this.parentElement;
    const useBgAsOverlay = this.useBgAsOverlay === "true";
    const background = this.overlayBackground;
    const backgroundOverlayContainer = this.backgroundOverlayContainer;
    const zIndex = $(parentElement).css("z-index");
    $(parentElement).css("background", "none");
    if (useBgAsOverlay) {
      $(backgroundOverlayContainer).css("display", "block");
      $(backgroundOverlayContainer).css("background", background);
    }
    if (!zIndex || zIndex === "auto") {
      $(parentElement).css("z-index", 1);
    }
    this.handleVideoResize();
  }
  handleYoububePlayer() {
    const loop = this.endaction === "loop" ? 1 : 0;
    const videoId = this.id;
    const playerId = this.playerId;
    const [width, height] = this.getVideoSize();
    const onPlayerStateChange = (evt) => {
      if (evt.data == window.YT.PlayerState.ENDED) {
        this.handleVideoEndAction();
      }
    };
    const onPlayerReady = () => {
      this.handleVideoStart();
    };
    const handleYoutube = (timeout) => {
      timeout = timeout >= 300 ? timeout : timeout + 50;
      if (window.YT?.Player) {
        const player = new window.YT.Player(playerId, {
          width,
          height,
          videoId,
          playerVars: {
            controls: 0,
            autoplay: 1,
            mute: 1,
            disablekb: 1,
            loop,
            enablejsapi: 1,
            modestbranding: 1,
            playlist: videoId,
            origin: window.location.href,
            rel: 0
          },
          events: {
            "onReady": onPlayerReady,
            "onStateChange": onPlayerStateChange
          }
        });
      } else {
        window.setTimeout(handleYoutube, timeout, timeout);
      }
    };
    handleYoutube(50);
  }
  handleVimeoPlayer() {
    const videoId = this.id;
    const loop = this.endaction === "loop";
    const playerId = this.playerId;
    const [width, height] = this.getVideoSize();
    const handleVimeo = (timeout) => {
      timeout = timeout >= 300 ? timeout : timeout + 50;
      if (window.Vimeo?.Player) {
        $(`#${playerId}`).css({
          overflow: "hidden",
          width: "100%",
          height: "100%"
        });
        const player = new window.Vimeo.Player(playerId, {
          id: videoId,
          width,
          height,
          autoplay: true,
          muted: true,
          pause: false,
          byline: false,
          title: false,
          loop,
          autopause: false,
          controls: false,
          sidedock: false
        });
        player.on("play", () => {
          this.handleVideoStart();
        });
        player.on("ended", () => {
          this.handleVideoEndAction();
        });
      } else {
        window.setTimeout(handleVimeo, timeout, timeout);
      }
    };
    handleVimeo(50);
  }
  getVideoSize() {
    const videoRatio = 16 / 9;
    let width, height;
    let parentWidth, parentHeight;
    let isHeightBiggerThanWidth = false;
    if (this.styleType === "fill") {
      width = "100%";
      height = "100%";
    } else {
      const [paddingLeft] = $(this.parentElement).css("padding-left").split("px") ?? 0;
      const [paddingRight] = $(this.parentElement).css("padding-right").split("px") ?? 0;
      const [paddingTop] = $(this.parentElement).css("padding-top").split("px") ?? 0;
      const [paddingBottom] = $(this.parentElement).css("padding-bottom").split("px") ?? 0;
      const [borderWidth] = $(this.parentElement).css("border-width").split("px") ?? 0;
      if (this.isPageBackground) {
        parentWidth = $(window).width();
        parentHeight = $(window).height();
      } else {
        parentWidth = Number($(this.parentElement).width()) + Number(paddingLeft) + Number(paddingRight) + Number(borderWidth);
        parentHeight = Number($(this.parentElement).height()) + Number(paddingBottom) + Number(paddingTop) + Number(borderWidth);
      }
      if (parentWidth / videoRatio < parentHeight) {
        isHeightBiggerThanWidth = true;
        width = parentHeight * videoRatio;
        height = parentHeight;
      } else {
        width = parentWidth;
        height = parentWidth / videoRatio;
      }
    }
    return [width, height, parentWidth, parentHeight, isHeightBiggerThanWidth];
  }
  handleVideoResize() {
    const element = this.element;
    const parentElement = this.parentElement;
    const iframe = $(element).find("iframe");
    const isPageBackground = this.isPageBackground;
    const styleType = this.styleType;
    const offsetY = this.offsetY;
    const offsetX = this.offsetX;
    const hideOnMobile = this.hideOnMobile === "true";
    const useBgAsOverlay = this.useBgAsOverlay === "true";
    const background = this.background;
    if (!isPageBackground) {
      $(element).css({
        position: "absolute",
        overflow: "hidden"
      });
      $(parentElement).css({
        position: "relative"
      });
    }
    const resizeVideo = () => {
      if (!this.videoEnded) {
        if ($(window).width() < 700 && hideOnMobile) {
          $(element).css({
            display: "none"
          });
          $(parentElement).css("background", background);
          return;
        } else {
          $(element).css({
            display: "block"
          });
          $(parentElement).css("background", "none");
        }
        const videoRatio = 16 / 9;
        const [width, height, parentWidth, parentHeight, isHeightBiggerThanWidth] = this.getVideoSize();
        const widthDiff = width - parentWidth;
        const heightDiff = height - parentHeight;
        if (styleType === "offset") {
          const heightDiff2 = height - parentHeight;
          const widthDiff2 = width - parentWidth;
          const fixedOffsetX = widthDiff2 * offsetX / 100;
          const fixedOffsetY = heightDiff2 * offsetY / 100;
          if (isHeightBiggerThanWidth) {
            iframe.width(width).height(height).css({
              "transform": `translateX(-${fixedOffsetX}px)`,
              "pointer-events": "none"
            });
          } else {
            iframe.width(width).height(height).css({
              "transform": `translateY(-${fixedOffsetY}px)`,
              "pointer-events": "none"
            });
          }
        } else {
          iframe.width(width).height(height).css({
            background: "black",
            "pointer-events": "none"
          });
        }
      }
    };
    resizeVideo();
    window.addEventListener("resize", function() {
      resizeVideo();
    });
  }
  handleVideoEndAction() {
    const element = this.element;
    const parentElement = this.parentElement;
    const endAction = this.endaction;
    const redirectUrl = this.redirectUrl;
    const redirectNewPage = this.redirectToNewPage === "true";
    const background = this.background;
    if (endAction !== "loop") {
      this.videoEnded = true;
      $(element).css({
        display: "none"
      });
      $(parentElement).css("background", background);
    }
    if (endAction === "redirect") {
      if (redirectNewPage) {
        window.open(redirectUrl, "_blank");
      } else {
        window.location.href = redirectUrl;
      }
    } else if (endAction === "open-popup") {
      globalThis.CFOpenPopup();
    }
  }
};
registerComponent("VideoBackground/V1", VideoBackgroundV1);
window["VideoBackgroundV1"] = VideoBackgroundV1;

// projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/video-v1.ts
init_define_process();
init_runtime();
var VideoV1 = class extends CF2Component {
  constructor(el, runtimeSel) {
    super(el, runtimeSel);
  }
  mount() {
    video_player_starter_v1_default.setupVideo(this.element);
  }
};
registerComponent("Video/V1", VideoV1);
window["VideoV1"] = VideoV1;

// projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/video-v2.ts
init_define_process();
init_runtime();
var VideoV2 = class extends CF2Component {
  constructor(el, runtimeSel) {
    super(el, runtimeSel);
  }
  mount() {
    if (this.element.querySelector("video")) {
      video_player_starter_v1_default.setupVideo(this.element);
    }
  }
};
registerComponent("Video/V2", VideoV2);
window["VideoV2"] = VideoV2;

// projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/video-popup-v1.ts
init_define_process();
init_modal_v1();
init_runtime();
var VideoPopupV1 = class extends CF2Component {
  constructor(el, runtimeSel) {
    super(el, runtimeSel);
  }
  mount() {
    this.modal = this.getComponent("Modal/V1");
    this.video = this.getComponent("Video/V1");
    this.isVideoInitialized = false;
    this.setupVideoPopupListenters();
  }
  setupVideoPopupListenters() {
    const isWistia = this.video.videoType === "wistia";
    const isVimeo = this.video.videoType === "vimeo";
    const isYoutube = this.video.videoType === "youtube";
    const isHTML5 = this.video.videoType === "html5";
    const isVoomly = this.video.videoType === "voomly";
    const isCustomScript = this.video.videoType === "custom_script";
    const popupImage = this.element.querySelector(".elImage");
    this.video.element.addEventListener("click", (evt) => {
      evt.stopPropagation();
    });
    popupImage.addEventListener("click", () => {
      this.modal.element.style.display = "flex";
      if (isHTML5 || isVoomly) {
        const videoElement = this.video.element.querySelector("video");
        if (this.isVideoInitialized) {
          videoElement.play();
        } else {
          videoElement.addEventListener("loadeddata", () => {
            videoElement.play();
          });
          this.isVideoInitialized = true;
        }
      } else if (isCustomScript) {
        if (this.isVideoInitialized) {
          const videoElement = this.video.element.querySelector("video");
          videoElement.play();
        } else {
          const scriptElement = this.video.element.querySelector("script");
          scriptElement.setAttribute("src", scriptElement.getAttribute("data-src"));
          this.isVideoInitialized = true;
          const videoElement = this.video.element.querySelector("video");
          videoElement.addEventListener("loadeddata", () => {
            videoElement.play();
          });
        }
      } else {
        const videoElement = this.video.element.querySelector("iframe");
        let src = videoElement.getAttribute("data-src");
        if (isYoutube) {
          src = src.replace("autoplay=0", "mute=1&autoplay=1");
        } else if (isVimeo) {
          src = src.replace("autoplay=0", "muted=1&autoplay=1");
        } else if (isWistia) {
          src = src.replace("autoplay=0", "muted=true&autoplay=1");
        }
        videoElement.setAttribute("src", src);
      }
    });
    this.modal.onClose = () => {
      if (isHTML5 || isVoomly || isCustomScript) {
        const videoElement = this.video.element.querySelector("video");
        videoElement.pause();
        videoElement.currentTime = 0;
      } else {
        const videoElement = this.video.element.querySelector("iframe");
        let src = videoElement.getAttribute("src");
        if (isYoutube) {
          src = src.replace("mute=1&autoplay=1", "autoplay=0");
        } else if (isVimeo) {
          src = src.replace("muted=1&autoplay=1", "autoplay=0");
        } else if (isWistia) {
          src = src.replace("muted=true&autoplay=1", "autoplay=0");
        }
        videoElement.setAttribute("src", src);
      }
    };
  }
};
registerComponent("VideoPopup/V1", VideoPopupV1);
window["VideoPopupV1"] = VideoPopupV1;
//# sourceMappingURL=video-N3MSFIF7.js.map
