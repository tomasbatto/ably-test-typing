var client = new Ably.Realtime('');

const channel = client.channels.get('test')

const random = Math.random()


document.getElementById('title').innerText = random
const writingHint = document.getElementById('writing-hint')
let currentUser
const users = {}
let imTyping = false

const deleteUserHint = (data) => {
  console.log(data.from, 'not writing')
  delete users[data.from]
  if(currentUser === data.from) {
    currentUser = Object.keys(users).pop()
    if (currentUser) {
      writingHint.innerText = `${currentUser} is typing...`
    } else {
      currentUser = ''
      writingHint.innerText = ''
    }
  }
}

let timeout
let timeoutTime = 2000

const restartTimeout = (channel, data) => {
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(()=> {
    channel.publish('writing', data);
    imTyping = false
  }, timeoutTime)
}

client.connection.on('connected', function() {
  console.log('CONNECTED')
  const channel = client.channels.get('test')

  channel.subscribe(function(message) {
    const data = message.data
    console.log(data)
    if(data.writing && data.from !== random) {
      users[data.from] = true
      currentUser = data.from
      writingHint.innerText = `${currentUser} is typing...`
    } else {
      deleteUserHint(data)
    }
  });

  const input = document.getElementById('input')

  input.onfocus = (ev) => {

  }

  input.addEventListener('focusin', ()=> {
    if(imTyping) {
      imTyping = true
    } else {
      channel.publish('writing', {from: random, writing: true});
      imTyping = true
    }
    restartTimeout(channel,{from: random, writing: false})
  })

  input.addEventListener('keypress', ()=> {
    if(imTyping) {
      imTyping = true
    } else {
      channel.publish('writing', {from: random, writing: true});
      imTyping = true
    }
    restartTimeout(channel,{from: random, writing: false})
  })
});

