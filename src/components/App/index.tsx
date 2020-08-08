import React, { useEffect, useState, MouseEvent } from 'react';

import NumberDisplay from '../NumberDisplay';
import Button from '../Button';
import { generateCells } from '../../utils';
import { Cell, Face, CellState } from '../../types';

import "./App.scss";
import { NUM_OF_BOMBS } from '../../constants';

const App: React.FC = () => {
    const [cells, setCells] = useState<Cell[][]>(generateCells());
    const [face, setFace] = useState<Face>(Face.smile);
    const [time, setTime] = useState<number>(0);
    const [live, setLive] = useState<boolean>(false);
    const [bombCount, setBombCounter] = useState<number>(NUM_OF_BOMBS);

    useEffect(() => {
        const handleMouseDown = (): void => { setFace(Face.scared) }
        const handleMouseUp = (): void => { setFace(Face.smile) }


        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
        }
    }, []);

    useEffect(() => {
        if(live && time < 1000){
            const timer = setInterval(() => {
                setTime(time+1);
            }, 1000);

            return () => {
                clearInterval(timer);
            }
        }
        else{
            handleFaceClick();
        }
    }, [live, time]);

    const handleCellClick = (rowParam: number, colParam: number) => (): void => {
        // start game
        if(!live) setLive(true);
    }

    const handleFaceClick = (): void => {
        if(live){
            setTime(0);
            setLive(false);
            setCells(generateCells());
        }
    }

    const handleCellContext = (rowParam: number, colParam: number) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>):void => {
        e.preventDefault();

        if(!live) return;
        
        const currentCells = cells.slice();
        const currentCell = cells[rowParam][colParam];

        if(currentCell.state === CellState.visible) return;
        else if (currentCell.state === CellState.unvisible){
            currentCells[rowParam][colParam].state = CellState.flagged;
            setCells(currentCells);
            setBombCounter(bombCount-1);
        } 
        else if (currentCell.state === CellState.flagged){
            currentCells[rowParam][colParam].state = CellState.unvisible;
            setCells(currentCells);
            setBombCounter(bombCount+1);
        }
    }

    const renderCells = (): React.ReactNode => {
        return cells.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
                <Button 
                    key={`${rowIndex}-${colIndex}`} 
                    state={cell.state} 
                    value={cell.value} 
                    onClick={handleCellClick}
                    onContext={handleCellContext}
                    row={rowIndex} 
                    col={colIndex} 
                /> 
            ))
        )
    }

    return(
        <div className="App">
            <div className="Header">
                <NumberDisplay value={bombCount} />
                <div className="Face" onClick={handleFaceClick}>
                    <span role="img" aria-label="face">
                        { face }
                    </span>
                </div>
                <NumberDisplay value={time} />
            </div>
            <div className="Body">
                {renderCells()}
            </div>
        </div>
    )
};

export default App;