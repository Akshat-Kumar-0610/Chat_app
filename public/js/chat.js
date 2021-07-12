const socket = io()
//message form
const $messageform = document.querySelector('#message-form')
const $messageformInput = $messageform.querySelector('input')
const $messageformButton = $messageform.querySelector('button')
//location button
const $locationButton = document.querySelector('#send-location')
//messages
const $messages = document.querySelector('#messages')
//message templates
const messageTemplate = document.querySelector('#message-template').innerHTML
//location
const $location = document.querySelector("#location")
//location template
const locationTemplate = document.querySelector('#location-template').innerHTML
//options
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix:true})


socket.on('message',(message)=>{
    console.log(message.username)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        CreatedAt:moment(message.CreatedAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
})

socket.on('location',(message)=>{
    const html = Mustache.render(locationTemplate,{
        username:message.username,
        url:message.url,
        CreatedAt:moment(message.CreatedAt).format('h:mm A')
    })
    $location.insertAdjacentHTML('beforeend',html)
})

$messageform.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageformButton.setAttribute('disabled','disabled')
    const message= e.target.elements.message.value
    socket.emit('sendmessage',message,(error)=>{
        $messageformButton.removeAttribute('disabled')
        $messageformInput.value=''
        $messageformInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('Message was recieved')
    })
})

$locationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported on your browser')
    }
    $locationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        // console.log(position)
        socket.emit('geolocation',{latitude:position.coords.latitude,longitude:position.coords.longitude},()=>{
            $locationButton.removeAttribute('disabled')
            $locationButton.focus()
            console.log('location shared')
        })
    })
    
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})