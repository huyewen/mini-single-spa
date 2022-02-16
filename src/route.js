import {
  getAppChange
} from './app'
import {
  NOT_LOADED,
  LOADING_SOURCE_CODE,
  NOT_BOOTSTRAPPED,
  NOT_MOUNTED,
  MOUNTED,
  LOAD_ERR,
  flattenFnArray
} from './helper'

/**
 * 
 * @returns 
 */
function reroute() {
  const { appsToLoad, appsToMount, appsToUnmount } = getAppChange();

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
 * @param {*} app 
 * @returns 
 */
function toLoadPromise(app) {
  return Promise.resolve().then(() => {
    
    if(app.status !== NOT_LOADED) { 
      // 子应用不处于未加载状态，则直接返回子应用
      return app
    }

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

      console.log(err);

      return app
    })
  })
}

export {
  reroute
}