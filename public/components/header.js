import { get, showmessage, wait, extract } from '/js/utils.js'

class HeaderElement extends HTMLElement {
  async connectedCallback(){
    this.signin_required = (this.getAttribute('signin') == 'required')
    await this.load()
  }
  async load(){
    this.user_id = await get('/api/get_user_info')
      .then(packet=>extract(packet.json(), ['user_id']))
      .then(({user_id})=>user_id)
      .catch(packet=>{
        const { title, message } = packet.json()
        if(title=="SignInRequiredError") {
          if(this.signin_required){
            const title = "Signin is required"
            showmessage({title}).then(mb=>mb.redirect({
              uri:`/signin/?redirect_uri=${window.location.pathname}`, seconds:5
            }))
          }
          return 'guest'
        }
        showmessage({title,message,color:'warning'})
        console.error(packet)
      })
    this.innerHTML = `
<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <div class="container-fluid">
    <a class="navbar-brand" href="/">maruyu.work</a>
    <span class="navbar-text">Hello, ${this.user_id}</span>
  </div>
</nav>
    `
  }
}

window.customElements.define("header-element", HeaderElement);