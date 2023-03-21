
import * as singleSpa from '../index'

export const NOT_LOADED = 'NOT_LOADED';
export const LOADING_SOURCE_CODE = 'LOADING_SOURCE_CODE';
export const NOT_BOOTSTRAPPED = 'NOT_BOOTSTRAPPED';
export const BOOTSTRAPPING = 'BOOTSTRAPPING';
export const NOT_MOUNTED = 'NOT_MOUNTED';
export const MOUNTING = 'MOUNTING';
export const MOUNTED = 'MOUNTED';
export const UPDATING = 'UPDATING';
export const UNMOUNTING = 'UNMOUNTING';
export const UNLOADING = 'UNLOADING';
export const LOAD_ERR = 'LOAD_ERR'

/**
 * @description 判断子应用是否应处于激活状态
 * @param {*} app 子应用
 * @returns boolean
 */
export function shouldBeActive (app) {
  return app.activeWhen(window.location);
}

/**
 * @description 
 * @param {*} fns 返回值为promise实例的函数或函数数组
 * @returns promise实例
 */
export function flattenFnArray (fns) {
  fns = Array.isArray(fns) ? fns : [fns];

  /**
   * bootstrap, mount, unmount 可能是一个返回值为promise实例的函数数组，
   * 所以要对数组中的函数按序调用，只有当一个函数返回值resolve后才能调用
   * 下一个函数
   */
  return function (customProps) {
    return fns.reduce((resultPromise, fn) => resultPromise.then(() => fn(customProps)), Promise.resolve())
  }
}


export function getProps (app) {
  return Object.assign(app.customProps, {
    name: app.appName,
    singleSpa
  })
}

