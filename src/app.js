import { reroute } from './route'
import {
  NOT_LOADED,
  LOADING_SOURCE_CODE,
  NOT_BOOTSTRAPPED,
  NOT_MOUNTED,
  MOUNTED,
  LOAD_ERR,
  shouldBeActive
} from './helper'


const apps = [] // 存放注册的app

/**
 * @description 保存子应用并预加载被激活的子应用
 * @param {*} appName 子应用名称
 * @param {*} loadApp 异步的子应用资源加载函数
 * @param {*} activeWhen 触发子应用启动并挂载的条件
 * @param {*} customProps 自定义参数对象
 */
const registerApp = (appName, loadApp, activeWhen, customProps) => {
  const registeraction = {
    appName,
    loadApp,
    activeWhen,
    customProps,
    status: NOT_LOADED
  };

  apps.push(registeraction);

  reroute();
}

/**
 * @description 获取当前路由匹配到的处于各状态中的子应用
 * @returns app对象
 */
const getAppChange = () => {
  const appsToLoad = [];
  const appsToMount = [];
  const appsToUnmount = [];
  // 用于加载错误时超过两百毫秒重新加载应用
  const curentTime = new Date().getTime()

  apps.forEach(app => {
    switch(app.status) {
      case LOAD_ERR:
        if(shouldBeActive(app) && curentTime - app.loadErrorTime >= 200) {
          appsToLoad.push(app);
        }
        break
      case NOT_LOADED:
      case LOADING_SOURCE_CODE:
        if(shouldBeActive(app)) {
          appsToLoad.push(app);
        }
        break;
      case NOT_BOOTSTRAPPED:
      case NOT_MOUNTED:
        if(shouldBeActive(app)) {
          appsToMount.push(app);
        }
        break;
      case MOUNTED:
        // 当前app已处于挂载状态，但是路径与该子应用不匹配，应该被卸载
        if(!shouldBeActive(app)) {
          appsToUnmount.push(app);
        }
        break;
      default:
        break;
    }
  });
  return {
    appsToLoad,
    appsToMount,
    appsToUnmount
  };
}



export {
  registerApp,
  getAppChange
}

