import Die from "./components/die";
import { useState } from "react";
import { nanoid } from "nanoid"

export default function App() {
   const [dice, setDice] = useState(generateAllNewDice());

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
    }

  function rollDice(){
    setDice(generateAllNewDice());
  }


  console.log(generateAllNewDice());
  const mappedDice = dice.map(die => <Die
    key={die.id}
    value={die.value}
    isHeld={die.isHeld}
    hold={() => hold(die.id)}
    />);

  return <main>
    <div className="dice-container">
      {mappedDice}
    </div>

    <button onClick={rollDice} className="rollButton">Roll</button>
  </main>;
}
