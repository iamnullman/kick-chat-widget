// kickbot.js
import WebSocket from 'ws';
import EventEmitter from 'events';

class KickBot extends EventEmitter {
  constructor(chatroomList, auth) {
    super();
    this.chatroomList = chatroomList;
    this.auth = auth;
  }

  connect() {
    this.chatroomList.forEach((chatroomNumber) => {
      const chat = new WebSocket(
        'wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0-rc2&flash=false'
      );

      chat.on('open', () => {
        chat.send(
          JSON.stringify({
            event: 'pusher:subscribe',
            data: {
              auth: this.auth,
              channel: `chatrooms.${chatroomNumber}.v2`,
            },
          })
        );

        this.emit('connected', chatroomNumber);
      });

      chat.on('error', (error) => {
        this.emit('error', error, chatroomNumber);
      });

      chat.on('close', () => {
        this.emit('close', chatroomNumber);
      });

      chat.on('message', (data) => {
        
        try {
          const dataString = data.toString();
          const jsonData = JSON.parse(dataString);
          const jsonDataSub = JSON.parse(jsonData.data);
          if(jsonDataSub.type === "message")
          this.emit('message', {
            chatroomNumber,
            message: jsonDataSub.content,
            sender: jsonDataSub.sender,
          });
        } catch (error) {
          this.emit('parseError', error, data);
        }
      });
    });
  }
}

export default KickBot;
