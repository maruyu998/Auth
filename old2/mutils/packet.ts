import MDate from "./mdate"

type DataType = string|number|Date|MDate
              |{[key:string]:DataType}
              |{[key:string]:DataType[]}

type KeyType = "string"|"number"|"date"|"mdate"|"array"|"object";
type ValueType = string|number|ValueType[]|ConvertedData[]|{[key:string]:ConvertedData}
type ConvertedData = {
  type: KeyType,
  data: ValueType
}

type Packet = {
  title: string,
  message: string,
  error: Error|null,
  convertedData: ConvertedData|null
}

export function convertPacket({
  title, 
  message, 
  error=null,
  data=null
}:{
  title: string
  message: string
  error: Error|null
  data: DataType|null
}):Packet{
  function convert(data:DataType|null):ConvertedData|null{
    if(data === null) return null
    if(data instanceof String) return { type:"string", data: data as string }
    if(data instanceof Number) return { type:"number", data: data as number }
    if(data instanceof Date) return { type:"date", data: data.getTime() }
    if(data instanceof MDate) return { type:"mdate", data: data.time }
    if(data instanceof Array) return { type:"array", data: data.map(o=>convert(o)) as Array<ConvertedData> }
    if(data instanceof Object) return {
      type:"object", 
      data: Object.assign({}, ...Object.entries(data).map(([k,v])=>({[k]:convert(v)})))
    }
    throw new Error()
  }
  return { title, message, error, convertedData: convert(data)};
}

export function deconvertPacket(packet:Packet){
  const { title, message, error, convertedData } = packet
  function deconvert(cdata:ConvertedData|null){
    if(cdata === null) return null
    if(!(cdata instanceof Object)) {
      console.error("packet:", packet)
      throw new Error("packet parcing error")
    }
    if(cdata.type == "string") return cdata.data
    if(cdata.type == "number") return cdata.data
    if(cdata.type == "date") return new Date(cdata.data as number)
    if(cdata.type == "mdate") return new MDate(cdata.data as number)
    if(cdata.type == "array") return (cdata.data as ConvertedData[]).map(o=>deconvert(o))
    if(cdata.type == "object") return Object.entries(cdata.data as {[key:string]:ConvertedData}).map(([k,v])=>({[k]:deconvert(v)}))
  }
  return { title, message, error, data: deconvert(convertedData)}
}