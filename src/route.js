import {
  getAppChange
} from './app'
import {
  NOT_LOADED,
  LOADING_SOURCE_CODE,
  NOT_BOOTSTRAPPED,
  NOT_MOUNTED,
  MOUNTED,
  MOUNTING,
  UNMOUNTING,
  LOAD_ERR,
  flattenFnArray,
  getProps
} from './helper'
import { isStart } from './start'

export function triggerAppChange () {
  return reroute();
}

let appsThatChanged,
  navigationIsCanceled = false, // 是否取消导航
  oldUrl = currentUrl, // 路由在跳转，上次保存的路径成为老路径
  newUrl = (currentUrl = window.location.href); // 当前页面路径才是新路径

/**
 * 
 * @returns 
 */
function reroute () {
  const { appsToLoad, appsToMount, appsToUnmount } = getAppChange();

  if (isStart) { // 表示已经启动
    appsThatChanged = [].concat(appsToLoad, appsToMount, appsToUnmount)
    return performAppChanges()
  } else { // 表示应用注册了，还没启动，这时要先去加载应用
    appsThatChanged = appsToLoad
    return loadApps();
  }
}

function performAppChanges () {

}

/**
 * 
 * @param {*} appsToLoad 
 * @returns 
 */
function loadApps () {
  const loadPromises = appsThatChanged.map(app => toLoadPromise(app));
  return Promise.all(loadPromises);
}

/**
 * 
 * @param {*} appsToLoad 
 */
function performAppChanges (appsThatChanged) {
  /**
   * 此处将会调用bootstrap，mount，unmount
   * 加载应用，到这里我们为toLoadPromise新增一个LOADING_SOURCE_CODE状态，避免重复加载
   */
  // 本来在unMount前要先unLoad，但是这里我们先省去这一步
  // 先卸载unMount
  const unmountPromise = Promise.all(appsThatChanged.map(toUnmountPromise))

  appsToLoad.map(app => toLoadPromise(app).then(app => toBootstrapAndMount(app, unmountPromise))); // 怎么保证调用start时先前注册时激活的子应用已被加载完成？？
}

/**
 * 
 * @param {*} app 
 * @returns promise
 * @descripion 加载指定app，使用promise嵌套，最外层的promise由最里层的promise状态决定
 */
function toLoadPromise (app) {
  return Promise.resolve().then(() => {
    // 处于正在加载中状态了，直接返回，要是加载完成，这个属性也会被delete
    if (app.loadPromises) {
      return app.loadPromises
    }

    if (app.status !== NOT_LOADED || app.status !== LOAD_ERR) {
      // 子应用不处于未加载状态，则直接返回子应用
      return app
    }
    // 修改app状态为加载中
    app.status = LOADING_SOURCE_CODE

    app.loadPromises = Promise.resolve().then(() => {

      const loadPromise = app.loadApp(getProps(app))
      return loadPromise.then(source => { // 当前promise决定外层promise状态
        // 资源加载成功
        const { bootstrap, mount, unmount } = source;

        app.status = NOT_BOOTSTRAPPED;
        app.bootstrap = flattenFnArray(bootstrap);
        app.mount = flattenFnArray(mount);
        app.unmount = flattenFnArray(unmount);

        delete app.loadPromise

        return app
      })
    }).catch(err => {
      // 资源加载失败
      app.status = LOAD_ERR;
      app.loadErrorTime = new Date().getTime();
      console.log(err);

      return app
    })

    return app.loadPromises // 外层Promise状态由当前promise状态决定
  })
}


/**
 * @description 执行子应用的启动和挂载
 * @param {*} app 
 * @returns 
 */
function toBootstrapAndMount (app) {
  return Promise.resolve().then(() => {
    if (shouldBeActive(app)) {
      return toBootstrapPromise(app).then(toMountPromise);
    }
  })
}

/**
 * @description 执行子应用的启动
 * @param {*} app 
 * @returns 
 */
function toBootstrapPromise (app) {
  return Promise.resolve().then(() => {
    if (app.status !== NOT_BOOTSTRAPPED) {
      return app;
    }

    app.status = BOOTSTRAPPING; // 启动中

    return app.bootstrap(app.customProps).then(() => {
      app.NOT_MOUNTED;
      return app
    })
  })
}

/**
 * @description 执行子应用的挂载
 * @param {*} app 
 * @returns 
 */
function toMountPromise () {
  return Promise.resolve().then(() => {
    if (app.status !== NOT_MOUNTED) {
      return app
    }

    app.status = MOUNTING; // 挂载中

    return app.mount(app.customProps).then(() => {
      app.status = MOUNTED
    })
  })
}

/**
 * @description 执行子应用的卸载
 * @param {*} app 
 * @returns 
 */
function toUnmountPromise (app) {
  return Promise.resolve().then(() => {

    if (app.status !== MOUNTED) {
      return app;
    }

    app.status = UNMOUNTING;

    return app.unmount(app.customProps).then(() => {
      app.status = NOT_MOUNTED;

      return app
    })
  })
}

export {
  reroute
}