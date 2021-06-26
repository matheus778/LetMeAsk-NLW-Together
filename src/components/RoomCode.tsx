import copyImg from '../assets/images/copy.svg';
import '../styles/room-code.scss';

type roomCodeprops = {
  code: string;
}

export function RoomCode({ code }:roomCodeprops) {
  function copyRoomCodeClipBoard() {
    navigator.clipboard.writeText(code);
  }

  return(
   <button className="room-code" onClick={copyRoomCodeClipBoard}>
     <div>
       <img src={copyImg} alt="Copy room code" />
     </div>
     <span>sala #{code}</span>
   </button>
  );
}