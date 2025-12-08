import Die from "./components/die";
import { useState } from "react";

export default function App() {
 
   const [dice, setDice] = useState(generateAllNewDice());

  function generateAllNewDice(){
    const newDice = [];
      for (let i = 0; i < 10; i ++){
        const rand = Math.floor(Math.random() * 6)
        newDice.push(rand);
      }
    return newDice;
  }

  function rollDice(){
    setDice(generateAllNewDice());
  }


  console.log(generateAllNewDice());
  const mappedDice = dice.map(die => <Die value={die} />);
  
  return <main>
    <div className="dice-container">
      {mappedDice}
    </div>

    <button onClick={rollDice} className="rollButton">Roll</button>
  </main>;
}
