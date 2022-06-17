const _ = require('lodash')


let countdown = 1000;
let countDownArr = [];
let IntervalArrayList = [];

let socketIdList = [] //현재 소켓 id가 속한 roomList를 반환 
let idList = [] //  id에 속한 room 리스트를 반환 
let roomList = []

setCountDown = (room, countDown) =>{
    console.log("setCountDown! " , countDownArr[room] )
    if( _.isNil(countDownArr[room])){ //없는 경우 세팅 다시 
        countDownArr[room] = countDown
    }
    console.log("countDownArr", countDownArr)
}



let count = 0;
const connection = (io) =>{
    const nsp = io.of('/chat');
    // console.log('socket!!!connection')


    nsp.on('connection', function(socket){

        //현재 모든 roomList를 보여줌 
        socket.on('getRoomList', function() {
            console.log("getRoomList", socketIdList)
            
            let socketID = Object.keys(socketIdList)
            let roomNameList = []
            for(let i = 0 ; i < socketID.length; i++){
                roomNameList.push(socketIdList[socketID[i]])             
            }       

            socket.emit('getRoomList', { roomNameList : roomNameList})

        })
        //룸 클릭시 그 룸에 들어감 
        //한번 룸에 단 한번만 들어가도록 설정 해야함 
        socket.on('adminJoinRoom',function(data){
            console.log('adminJoinroom')
            if( _.isNil(socket.room)){
                socket.room = data.roomName;
            }else{
                socket.leave(socket.room) //기존 룸 나가고 
                socket.room = data.roomName; // 새로 세팅
            }
            socket.join(data.roomName);
            nsp.to(data.roomName).emit('system', {  
                                                  nickName : 'admin',
                                                  msg: '채팅방에 접속 하셨습니다'
                                                });
        });
    
        
        socket.on('clientJoinRoom', function(data){
            console.log("clientJoinRoom!")
            let roomName = data.nickName +"_" + count;
            socketIdList[socket.id] = roomName; 
            socket.room = roomName; //현재 있는 방 
            socket.join(roomName);
            count += 1; // index 증가 ( 중복방지 )
            nsp.to(socket.room).emit('system', { 
                                                 nickName : data.nickName,
                                                  msg: '채팅방에 접속 하셨습니다'
                                                });
        })

        socket.on('disconnect',function(data){
            console.log('disconnect')
            nsp.to(socket.room).emit('system', { 
                                                 nickName : data.nickName,
                                                 msg: '이 채팅방을 나가셨습니다.'
                                                });
            let socketKeyList = Object.keys(socketIdList);
            let idx = socketKeyList.indexOf(socket.id);
           // console.log('idx', idx);
           // console.log('splice ' ,socketIdList.splice(idx ,1));
            //console.log("socketIdList ", socketIdList)
            delete socketIdList[socket.id]
        });
    


        socket.on('chat', function(data) {
            console.log("socket.id " , socket.id)
            console.log('message from client: ', data);
            console.log(socket.room)
            data.room = socket.room
            //let serverTime = new date.now();
            let serverTime = new Date();
            data.serverTime = serverTime;
            console.log('data ', data )
            nsp.to(socket.room).emit('chat', data);
        });

    });

   
   


    let timerNsp = io.of('/timer') // timer 네임 스페이스 생성 
    // namespace /timer 에 접속한다.
    let timer = timerNsp.on('connection', function(socket){
        console.log('timerSocketConnection')
        //타이머 테스트
        socket.on('timer', function(data){
            let name = socket.name = data.name;
            let room = socket.room = data.room;
            let countDown = data.count
            console.log("countDown ")
            setCountDown(room, countDown)
            // room에 join한다
            socket.join(room);
            // room에 join되어 있는 클라이언트에게 메시지를 전송한다
            timer.to(room).emit('chat message', data.msg);
            console.log('Message from Client: ' + data);
            socket.emit('timer', 'yes!');
            //timerStart(timer,room);
        });

        //타이머 시작
        socket.on('startTimer', function(data){
            let name = socket.name = data.name;
            let room = socket.room = data.room;
            let countDown = data.count
            console.log("countDown ", name, room , countDown)
            setCountDown(room, countDown)
            // room에 join한다
            socket.join(room);
            // room에 join되어 있는 클라이언트에게 메시지를 전송한다
            timer.to(room).emit('startTimer', '룸에 다 꼽아버림');
            console.log('Message from Client: ' + data);
            //socket.emit('startTimer', 'yes!');
            timerStart(timer, room);
        });

        socket.on('stopTimer', function(data){
            //console.log(IntervalArrayList)
            let name = socket.name = data.name;
            let room = socket.room = data.room;
            clearInterval(IntervalArrayList[room]);
            IntervalArrayList[room] = null
            console.log('stopTimer')
            socket.emit('stopTimer', room + " clear ");
        })
    });

    timerStart = (timer, room) =>{
        if( IntervalArrayList[room]){
            console.log('isExist')
            return;
        }else{
            console.log('nonExist')
        }
        console.log("timer Start", countDownArr)
        let timerOut = setInterval(function() {
            console.log('hello')
            countDownArr[room] =  countDownArr[room] - 1;
            if(countDownArr[room] === 0 ){
                clearInterval(timerOut)
                countDownArr[room] = null //초기화처리
            }
            timer.to(room).emit('startTimer', { room : room , countdown:  countDownArr[room] });
        }, 1000);
        IntervalArrayList[room] = timerOut;
    }


};

module.exports =  {
    connection : connection
};