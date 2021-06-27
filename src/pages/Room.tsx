import { FormEvent, useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import logoImg from '../assets/images/logo.svg';
import { Button } from '../components/Button';
import { Question } from '../components/Question';
import { RoomCode } from '../components/RoomCode';
import { useAuth } from '../hooks/useAuth';
import { database } from '../services/firebase';


import '../styles/room.scss';

type RoomParams = {
  id: string;
}

type firebaseQuestions = Record<string, {
  author: {
    name: string;
    avatar: string;
  }
  content: string;
  isAnswered: boolean;
  isHighLighted: boolean;
}>

type QuestionType = {
  id: string;
  author: {
    name: string;
    avatar: string;
  }
  content: string;
  isAnswered: boolean;
  isHighLighted: boolean;
}

export function Room(){
  const { user } = useAuth();
  const history = useHistory();

  const [newQuestion, setNewQuestion] = useState('');
  const [questions, setQuestion] = useState<QuestionType[]>([]);
  const [title, setTitle] = useState('');

  const params = useParams<RoomParams>();
  const roomId = params.id;

  useEffect(()=>{
    const roomRef = database.ref(`rooms/${roomId}`);

    roomRef.on('value', room => {

      const databaseRoom = room.val();
      const firebaseQuestions:firebaseQuestions = databaseRoom.questions ?? {};

      const parsedQuestions = Object.entries(firebaseQuestions).map(([key, value])=>{
        return {
          id: key,
          content: value.content,
          author: value.author,
          isHighLighted: value.isHighLighted,
          isAnswered: value.isAnswered
        }
      })

      setTitle(databaseRoom.title)
      setQuestion(parsedQuestions);
    });

  }, [roomId]);

  
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
         <h1>sala {title}</h1>
         { questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
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
      
      <div className="question-list">
        {questions.map(question=> {
          return (
            <Question
              key={question.id}
              content={question.content}
              author={question.author}
            />
          )
        })}
      </div>

     </main>
   </div>
  );
}