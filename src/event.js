
export function CustomEvent (type, params) {
  var event = new CustomEvent(type, {
    bubbles: params.bubbles,
    cancelable: params.cancelable,
    detail: params.detail
  });

  return event
}