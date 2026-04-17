import EventEmitter from 'events';

const eventInstance = new EventEmitter();

const publish = (eventName, payload)=>{
    eventInstance.emit(eventName,payload);
}

const subscribe = (eventName, handler)=>{
    eventInstance.on(eventName,handler);
}

export {
    publish,
    subscribe
}