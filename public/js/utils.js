export function generateId(length) {
  const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const clength = c.length;
  let r = "";
  for (var i = 0; i < length; i++) r += c[Math.floor(Math.random() * clength)];
  return r;
}

export async function wait(exp_f, interval=500, times=100) {
  return await new Promise((resolve, reject) => {
    let i = 0;
    const interval_id = setInterval(() => {
      if (i >= times) reject();
      if (exp_f()) {
        clearInterval(interval_id);
        resolve();
      }
      i++;
    }, interval);
  });
}

import Packet from './Packet.js'
export async function get(uri){
  return fetch(uri).then(res=>{
      if(res.status==404) throw Error(`not found error at get to ${uri}`)
      return res
    })
    .then(res=>res.json()).then(res=>Packet.parse(res))
    .catch(e=>{throw Packet.from_error(e)})
    .then(packet=>{
      if(packet.is_error()) throw packet
      else return packet
    })
}
export async function post(uri, json){
  return fetch(uri, {
    method:"POST", 
    headers:{'Accept': 'application/json', 'Content-Type': 'application/json'},
    body: JSON.stringify(json)
  }).then(res=>{
    if(res.status==404) throw Error(`not found error at post to ${uri}`)
    return res
  }).then(res=>res.json()).then(res=>Packet.parse(res))
  .catch(e=>{throw Packet.from_error(e)})
  .then(packet=>{
    if(packet.is_error()) throw packet
    else return packet
  })
}
export async function showmessage({title, message, color}){
  const messagebox = document.getElementsByTagName('message-box')[0]
  await wait(() => messagebox !== undefined && messagebox.show !== undefined, 500);
  messagebox.show({title,message,color})
  return messagebox
}

const ExtractParamError = ({param_name, object_name}) => new Packet({
  title: "ExtractParamError",
  message: `Parameter "${param_name}" is required${object_name?` in ${object_name}`:""}.`,
  details: { param_name }
})
export function extract(object, keys){
  return new Promise((resolve, reject) => {
    const ret = {}
    for(let key of keys){
      if(object[key] !== undefined){
        ret[key] = object[key]
      }else reject(ExtractParamError({param_name:key}))
    }
    return resolve(ret)
  })
}