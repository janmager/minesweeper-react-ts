import React, { useEffect, useState, MouseEvent } from 'react';

import NumberDisplay from '../NumberDisplay';
import Button from '../Button';
import { generateCells, openMultipleCells } from '../../utils';
import { Cell, Face, CellState, CellValue } from '../../types';

import "./App.scss";
import { NUM_OF_BOMBS, MAX_ROWS, MAX_COLS } from '../../constants';

const App: React.FC = () => {
    const [cells, setCells] = useState<Cell[][]>(generateCells());
    const [face, setFace] = useState<Face>(Face.smile);
    const [time, setTime] = useState<number>(0);
    const [live, setLive] = useState<boolean>(false);
    const [bombCount, setBombCounter] = useState<number>(NUM_OF_BOMBS);
    const [rows, setRows] = useState<number>(MAX_ROWS);
    const [cols, setCols] = useState<number>(MAX_COLS);
    const [hasLost, setHasLost] = useState<boolean>(false);
    const [hasWon, setHasWon] = useState<boolean>(false);

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
    }, [live, time]);

    useEffect(() => {
        if(hasLost){
            setLive(false);
            setFace(Face.lost);
        } 
    }, [hasLost]);

    useEffect(() => {
        if(hasWon){
            setLive(false);
            setFace(Face.won);
        }
    }, [hasWon])

    const handleCellClick = (rowParam: number, colParam: number) => (): void => {
        // start game
        let newCells = cells.slice();

        if(!live){
            let isABomb = newCells[rowParam][colParam].value === CellValue.bomb;
            while(isABomb){
                newCells = generateCells();
                if(newCells[rowParam][colParam].value !== CellValue.bomb){
                    isABomb = false;
                    break;
                }
            }
            setLive(true);
        } 

        const currentCell = newCells[rowParam][colParam];

        if(currentCell.state === CellState.flagged || currentCell.state === CellState.visible) return;

        if(currentCell.value === CellValue.bomb){
            setHasLost(true);
            newCells[rowParam][colParam].red = true;
            newCells = showAllBombs();
            setCells(newCells);
            return;
        }
        else if(currentCell.value === CellValue.none){
            newCells = openMultipleCells(newCells, rowParam, colParam);
        }
        else{
            newCells[rowParam][colParam].state = CellState.visible;
        }

        // Check to see if you have won
        let openCellExists = false;
        for(let row = 0; row < MAX_ROWS; row++){
            for(let col = 0; col < MAX_COLS; col++){
                const currentCell = newCells[row][col];

                if(currentCell.value !== CellValue.bomb && currentCell.state === CellState.unvisible){
                    openCellExists = true;
                    break;
                }
            }
        }

        if(!openCellExists){
            newCells = newCells.map(row => row.map(cell => {
                if(cell.value === CellValue.bomb){
                    return{
                        ...cell,
                        state: CellState.flagged
                    }
                }
                return cell;
            }))
            setHasWon(true);
        }

        setCells(newCells);
    }

    const handleFaceClick = (): void => {
        setTime(0);
        setLive(false);
        setBombCounter(NUM_OF_BOMBS);
        setCells(generateCells());
        setHasLost(false);
        setHasWon(false);
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
                    red={cell.red}
                /> 
            ))
        )
    }

    const showAllBombs = (): Cell[][] => {
        const currentCells = cells.slice();

        return currentCells.map(row => row.map(cell => {
            if(cell.value === CellValue.bomb){
                return{
                    ...cell,
                    state: CellState.visible
                }
            } 

            return cell;
        }))
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