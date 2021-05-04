import { generateId } from "../js/utils.js";

class MessageBox extends HTMLElement {
  constructor(){
    super()
    this.modal_id = generateId(10);
    this.aria_id = generateId(10);
    this.okbtn_id = generateId(10);
  }
  generateHTML(){
    this.innerHTML = `
<div class="modal fade" id="${this.modal_id}" tabindex="-1"
    aria-labelledby="${this.aria_id}" aria-hidden="false">
  <div class="modal-dialog">
    <div class="modal-content bg-${this.color}">
      <div class="modal-header">
        <h5 class="modal-title" id="${this.aria_id}">${this.title}</h5>
      </div>
      <div class="modal-body">
        ${this.message ? `<p>${this.message}</p>`: ''}
        <p id="redirect_show"></p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" id="${this.okbtn_id}">OK</button>
      </div>
    </div>
  </div>
</div>
    `
    this.modal = new bootstrap.Modal(document.getElementById(this.modal_id), { backdrop: "static", keyboard: false })
    document.getElementById(this.okbtn_id).addEventListener('click',ev=>this.close())
  }
  async show({title, message, color='light'}){
    this.title = title
    this.message = message
    this.color = color
    this.generateHTML()
    await this.modal.show()
  }
  async close(){
    await this.modal.hide();
  }
  redirect({uri, seconds=0}){
    console.log(uri)
    if(!uri) return
    const elm = document.getElementById("redirect_show")
    let left = seconds
    const btn = document.getElementById(this.okbtn_id)
    btn.innerText = "Redirect now"
    btn.addEventListener('click',ev=>location.href=uri)
    elm.innerText = `Redirect to ${uri} after ${left} seconds`
    setInterval(()=>{
      elm.innerText = `Redirect to ${uri} after ${left} seconds`
      left -= 1
      if(left <= 0) {
        location.href=uri
        return
      }
    }, 1000)
  }
}
window.customElements.define("message-box", MessageBox);