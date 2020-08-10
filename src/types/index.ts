export enum CellValue{
    none, 
    one,
    two, 
    three,
    four,
    five,
    six,
    seven,
    eight,
    bomb
}

export enum CellState{
    unvisible,
    visible,
    flagged
}

export type Cell = { value: CellValue, state: CellState, red?: boolean }

export enum Face{
    smile = "😄",
    scared = "😮",
    lost = "🙁",
    won = "😎"
}