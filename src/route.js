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
  shouldBeActive,
  BOOTSTRAPPING
} from './helper'
import { isStarted } from './start'

/**
 * 
 * @returns 
 */
function reroute() {
  const { appsToLoad, appsToMount, appsToUnmount } = getAppChange();

  // 当start被调用时，启动并挂载激活的子应用。
  if(isStarted) {
    const appsThatChanged = appsToLoad.concat(appsToMount, appsToUnmount)
    return performAppChanges(appsThatChanged)
  }

  // 注册应用时对满足激活条件的应用进行预加载
  return loadApps(appsToLoad);
}

/**
 * 
 * @param {*} appsToLoad 
 * @returns 
 */
function loadApps(appsToLoad) {
  const loadPromises = appsToLoad.map(app => toLoadPromise(app));
  return Promise.all(loadPromises);
}

/**
 * 
 * @param {*} appsToLoad 
 */
function performAppChanges(appsThatChanged) {
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
 * @returns 
 */
function toLoadPromise(app) {
  return Promise.resolve().then(() => {
    
    if(app.status !== NOT_LOADED && app.status !== LOAD_ERROR) { 
      // 子应用不处于未加载状态，则直接返回子应用
      return app
    }

    app.status = LOADING_SOURCE_CODE

    return app.loadApp.then(source => {
      // 资源加载成功
      const { bootstrap, mount, unmount } = source;

      app.status = NOT_BOOTSTRAPPED;

      app.bootstrap = flattenFnArray(bootstrap);
      app.mount = flattenFnArray(mount);
      app.unmount = flattenFnArray(unmount);

      return app
    }, err => {
      // 资源加载失败
      app.status = LOAD_ERR;
      app.loadErrorTime = new Date().getTime();
      console.log(err);

      return app
    })
  })
}


/**
 * @description 执行子应用的启动和挂载
 * @param {*} app 
 * @returns 
 */
function toBootstrapAndMount(app) {
  return Promise.resolve().then(() => {
    if(shouldBeActive(app)) {
      return toBootstrapPromise(app).then(toMountPromise);
    }
  })
}

/**
 * @description 执行子应用的启动
 * @param {*} app 
 * @returns 
 */
function toBootstrapPromise(app) {
  return Promise.resolve().then(() => {
    if(app.status !== NOT_BOOTSTRAPPED) {
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
function toMountPromise() {
  return Promise.resolve().then(() => {
    if(app.status !== NOT_MOUNTED) {
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
function toUnmountPromise(app) {
  return Promise.resolve().then(() => {

    if(app.status !== MOUNTED) {
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