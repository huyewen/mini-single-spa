import { reroute } from './route'

function urlChangeEvent() {
  reroute();
}

window.addEventListener('hashchange', urlChangeEvent);
window.addEventListener('popstate', urlChangeEvent);

const routerEventListeningTo = ['hashchange', 'popstate'];

const caturedEventListener = {
  hashchange: [],
  popstate: []
}

// 拦截原生监听器
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

// 重写元素监听函数，拦截子应用监听程序
window.addEventListener = function(e, fn) {
  if(routerEventListeningTo.includes(e) && !caturedEventListener[e].some(cFn => cFn === fn)) {
    caturedEventListener[e].push(fn)
  }

  originalAddEventListener.apply(this, arguments)
}

window.removeEventListener = function(e, fn) {
  if(routerEventListeningTo.includes(e)) {
    caturedEventListener[e] = caturedEventListener[e].filter(cFn => cFn !== fn)
  }

  originalRemoveEventListener.apply(this, arguments)
}

history.pushState = function () {
  window.dispatchEvent(new PopStateEvent('popState'))
}

