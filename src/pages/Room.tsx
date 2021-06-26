import { FormEvent, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import logoImg from '../assets/images/logo.svg';
import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';
import { useAuth } from '../hooks/useAuth';
import { database } from '../services/firebase';


import '../styles/room.scss';

type RoomParams = {
  id: string;
}

export function Room(){
  const { user } = useAuth();
  const [newQuestion, setNewQuestion] = useState('');

  const params = useParams<RoomParams>();
  const roomId = params.id;

  const history = useHistory();
  
  async function handleSendQuestion(event: FormEvent) {
    event.preventDefault();

    if(newQuestion.trim() === '') {
      return;
    }

    if(!user) {
      throw new Error('You must be logged in');
    }

    const question = {
      content: newQuestion,
      author: {
        name: user.name,
        avatar: user.avatar
      },
      isHighLighted: false,
      isAnswered: false
    };

    await database.ref(`rooms/${roomId}/questions`).push(question);
    setNewQuestion('');
  }

  return(
   <div id="page-room">
     <header>
       <div className="content">
          <img src={logoImg} alt="logo Letmeask" />
          <RoomCode code={roomId}/>
       </div>
     </header>

     <main className="content">
       <div className="room-title">
         <h1>sala React</h1>
         <span>4 perguntas</span>
       </div>
       
       <form onSubmit={handleSendQuestion}>
         <textarea
         placeholder="o que você quer perguntar?"
         onChange={event=>setNewQuestion(event.target.value)}
         value={newQuestion}
         />

         <div className="form-footer">
          { user ? (
            <div className="user-info">
              <img src={user.avatar} alt={user.name}/>
              <span>{user.name}</span>
            </div>
          ) : (
            <span>Para enviar sua pergunta, <button onClick={()=>history.push('/')}>faça seu login</button>.</span>
          ) }

          <Button type="submit" disabled={!user}>Enviar perguntas</Button>
         </div>
       </form>

     </main>
   </div>
  );
}