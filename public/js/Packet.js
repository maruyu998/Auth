export default class Packet {
  constructor({
    title, message, is_error, status, from_error,
    redirect_uri, details,
    app_id, app_token, app_secret, user_id, access_token,
    appwaitings, userwaitings,
  }){
    const obj = arguments[0]
    if(obj.title===undefined) obj.title=""
    if(obj.message===undefined) obj.message=""
    if(obj.is_error===undefined) obj.is_error=false
    if(obj.status===undefined) obj.status=200
    if(obj.from_error===undefined) obj.from_error=false
    this.o = obj
  }
  is_error = () => this.o.is_error
  json(){
    return Object.entries(this.o)
            .filter(([key,value])=>value!==undefined)
            .map(([key,value])=>({[key]:value}))
            .reduce((left,right)=>Object.assign(left, right), {})
  }
  static parse = (o) => new Packet(o)
  static from_error = (error, status=500) => {
    if(error instanceof Packet) return error
    if(error instanceof Error) return new Packet({
      title:error.name, message:error.message, 
      details:{
        error,
        stack: error.stack
      }, is_error:true, status, from_error:true
    })
    return new Packet({
      title: "UndefinedError",
      message: `undefined error was happened.`,
      details: {error}
    })    
  }
  send(response){ response.status(this.o.status).json(this.json()) }
}