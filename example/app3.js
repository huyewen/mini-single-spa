const html  = `<div>
  <h1>我是app3</h1>
  app1是single-spa-example的第三个子应用
</div>`

function bootstrap(props) {
  return Promise.resolve().then()
}

function mount(props) {
  return Promise.resolve().then(() => {
    const id = 'mini-single-spa:app1';
    const ele = document.createElement('div');
    ele.id = id;
    ele.innerHTML = html;
    document.body.append(ele);
  })
}

function unmount(props) {
  return Promise.resolve().then(() => {
    const id = 'mini-single-spa:app1';
    const ele = document.querySelector(`#${id.replace(':', '\\:')}`)
    document.body.remove(ele)
  })
}

export {
  bootstrap,
  mount,
  unmount
}