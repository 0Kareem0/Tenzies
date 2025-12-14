import Die from "./components/die";
import { useState, useRef ,useEffect } from "react";
import { nanoid } from "nanoid"
import Confetti from 'react-confetti'


export default function App() {
   const [dice, setDice] = useState(() => generateAllNewDice());
   const ref = useRef(null);
    function generateAllNewDice() {
        return new Array(10)
            .fill(0)
            .map(() => ({
                value: Math.ceil(Math.random() * 6),
                isHeld: false,
                id:nanoid()
            }))
    }

    function hold(id){
      setDice(prevDice => prevDice.map(die =>{
        return die.id === id ? {...die, isHeld : !die.isHeld} :die;
      }))
    } // die.id is that on die we click on it compare it to the id if they are equal or not

  function rollDice(){
   {!gameWon ? 
    setDice(oldDice => oldDice.map(die => die.isHeld ? die : {...die,value:Math.ceil(Math.random() * 6)}))
    : setDice(generateAllNewDice()) } 
  }

  const gameWon = dice.every(die => die.isHeld && die.value === dice[0].value);

 useEffect(()=>{
    if(gameWon){
      ref.current.focus()
    }
  },[gameWon])
  

  const mappedDice = dice.map(die => <Die
    key={die.id}
    value={die.value}
    isHeld={die.isHeld}
    hold={() => hold(die.id)}
    />);

    
  return <main>
            {gameWon && <Confetti />}
            <div aria-live="polite" className="sr-only">
            {gameWon && <p>Congratulations! You won! Press "New Game" to start again.</p>}
            </div>
            <h1 className="title">Tenzies</h1>
            <p className="instructions">Roll until all dice are the same. Click each die to freeze it at its current value between rolls.</p>
            <div className="dice-container">
      {mappedDice}
    </div>


    <button ref={ref} onClick={rollDice} className="rollButton">{gameWon ? "New Game" : "Roll"}</button>
  </main>;
}
