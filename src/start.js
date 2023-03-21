
import {
  reroute
} from './route'

// 启动标识
let started = false

/**
 * @description
 */
function start () {
  started = true

  reroute()
}

/**
 * @description 返回是否被启动的Boolean值
 * @returns 
 */
function isStart () {
  return started
}

export {
  start,
  isStarted
}