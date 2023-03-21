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
 * @param {String} appName 子应用名称
 * @param {Function | Object} loadApp 异步的子应用资源加载函数(要不就是返回promise的函数，要不就是一个对象，这个对象表示已经被解析过的应用，它包含各个生命周期函数)
 * @param {String | Array<String> | Function} activeWhen 触发子应用启动并挂载的条件(目前就要求字符串，或者是以location为参数的函数)
 * @param {Object} customProps 自定义参数对象
 */
function registerApp (appName, loadApp, activeWhen, customProps = {}) {

  if (getAppNames().indexOf(appName) > -1) throw Error(`应用${appName}已经被注册过了`)

  const registeraction = Object.assign({
    status: NOT_LOADED,
    loadErrorTime: null
  }, {
    appName,
    loadApp,
    activeWhen,
    customProps,
  })

  // 格式化
  registeraction.loadApp = sanitizeLoadApp(registeraction.loadApp)
  registeraction.activeWhen = sanitizeActiveWhen(registeraction.activeWhen)
  registeraction.customProps = sanitizeCustomProps(registeraction.customProps)

  apps.push(registeraction);

  reroute();
}

function sanitizeLoadApp (loadApp) {
  if (typeof loadApp !== 'function') {
    return () => Promise.resolve(loadApp)
  }

  return loadApp
}

function sanitizeActiveWhen (activeWhen) { // 函数或字符串（这里为了简化不要求动态路径或者路径数组）
  return typeof activeWhen === 'function'
    ? activeWhen
    : (location) => location.pathname.startsWith(activeWhen)
}

function sanitizeCustomProps (customProps) {
  return customProps ? customProps : {}
}

function getAppNames () {
  return apps.map(item => item.appName)
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
    switch (app.status) {
      case LOAD_ERR:
        if (shouldBeActive(app) && curentTime - app.loadErrorTime >= 200) {
          appsToLoad.push(app);
        }
        break
      case NOT_LOADED:
      case LOADING_SOURCE_CODE:
        if (shouldBeActive(app)) {
          appsToLoad.push(app);
        }
        break;
      case NOT_LOADED: // 未加载
      case LOADING_SOURCE_CODE: // 加载中
        if (shouldBeActive(app)) {
          appsToLoad.push(app); // 加进待加载数组
        }
        break;
      case NOT_BOOTSTRAPPED: // 未启动
      case NOT_MOUNTED: // 未挂载
        if (shouldBeActive(app)) {
          appsToMount.push(app); // 加进待挂载数组
        }
        break;
      case MOUNTED: // 已挂载
        // 当前app已处于挂载状态，但是路径与该子应用不匹配，应该被卸载
        if (!shouldBeActive(app)) {
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

