import './Chessboard.css'
import Tile from './Tile';
import { initialBoardState } from '../Constants';
import { isLegalMove } from '../Rules';
import React, { useEffect, useRef, useState } from 'react';

export interface Piece {
    image: string,
    x: number,
    y: number,
    colour: Colour,
    type: Type
}

export interface Position {
    column: number,
    row: number
}

export enum Type {
    PAWN = "pawn",
    BISHOP = "bishop",
    ROOK = "rook",
    KNIGHT = "knight",
    KING = "king",
    QUEEN = "queen"
}

export enum Colour {
    BLACK = 'b',
    WHITE = 'w'
}

enum Mode {
    SINGLE_PLAYER,
    VERSUS
}

export default function Chessboard() {

    let board: React.ReactElement[] = []; // a list of html elements we return out of our react component full of <Tile /> elements.
    let [pieces, setPieces] = useState<Piece[]>();    // our list of all pieces we have, and their coordinates
    let [turns, setTurns] = useState(0);
    let [turn, setTurn] = useState<Colour>();
    let [mode, setMode] = useState<Mode>();
    let [player, setPlayer] = useState<Colour>();
    let [opponent, setOpponent] = useState<Colour>()
    let [check, setCheck] = useState<Colour | undefined>(undefined);

    // single player is pretty much just for debugging and showcasing on my website, you control both pieces. we'll constantly switch 'opponent' and 'player' variables in this case

    const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"]; // this is used for transcribing our grid elements xe[0,7], ye[0,7] to regular chess squares.
    const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
    
    let activePiece:HTMLElement | null = null;  // the html element of the piece we grabbed. movepiece uses this to move it around with its styling element and to contain it. 
    const chessBoardRef = useRef<HTMLDivElement>(null); // reference to our chess board grid
    let activePiecePosition: Position | undefined; // which column and row the grabbed chess piece came from in 

    useEffect(() => {
        setPieces(initialBoardState());
        setTurn(Colour.WHITE); // white starts first
        setMode(Mode.SINGLE_PLAYER); // defaulting to single player
        setPlayer(Colour.WHITE);
        setOpponent(Colour.BLACK);
    }, [])

    const DangerZones = () => {
        // i'll just have to repurpose the algorithm
        // and try to find valid 'attack tiles' for every active unit
        // of a certain colour
        // and flag those for 'i can't go there' zones
        // if you're in that, then check triggers
        // can just create an array full of those Position{x, y} coordinates and compare it with the king's position
        
        let dangerZonesArray: Position[] = []; // ok so im using an array but i actually want a set. Problem is, sets can't compare object elements.
        let direction: number;
        let piecePositions: Position[] = [];

        // get the position of each piece in play
        pieces?.forEach(piece => {
            piecePositions.push({column: piece.x, row: piece.y})
        })
    
        opponent === Colour.BLACK ? direction = -1 : direction = 1; // black goes down, while white goes up. this is used for pawns exclusively!
    
        pieces?.forEach(piece => {
            if (piece.colour === opponent) // type of enemy we're checking for
            {
                switch (piece.type) // this is going to be a big mess of complicated math, but basically i'm setting tiles based on where pieces could go, and accounting for the fact that you can't jump over other pieces.
                {
                    case Type.PAWN:
                        dangerZonesArray.push({column: piece.x + direction * 1, row: piece.y + direction * 1});
                        dangerZonesArray.push({column: piece.x - direction * 1, row: piece.y + direction * 1});
                        break;
                    case Type.KNIGHT:
                        dangerZonesArray.push({column: piece.x + 1, row: piece.y + 2});
                        dangerZonesArray.push({column: piece.x + 1, row: piece.y - 2});
                        dangerZonesArray.push({column: piece.x - 1, row: piece.y + 2});
                        dangerZonesArray.push({column: piece.x - 1, row: piece.y - 2});
    
                        dangerZonesArray.push({column: piece.x + 2, row: piece.y + 1});
                        dangerZonesArray.push({column: piece.x + 2, row: piece.y - 1});
                        dangerZonesArray.push({column: piece.x - 2, row: piece.y + 1});
                        dangerZonesArray.push({column: piece.x - 2, row: piece.y - 1});
                        break;
                    case Type.KING:
                        dangerZonesArray.push({column: piece.x - 1, row: piece.y});     // left
                        dangerZonesArray.push({column: piece.x + 1, row: piece.y});     // right
    
                        dangerZonesArray.push({column: piece.x, row: piece.y - 1});     // up
                        dangerZonesArray.push({column: piece.x, row: piece.y + 1});     // down
    
                        dangerZonesArray.push({column: piece.x + 1, row: piece.y + 1}); // down right
                        dangerZonesArray.push({column: piece.x - 1, row: piece.y + 1}); // down left
    
                        dangerZonesArray.push({column: piece.x - 1, row: piece.y - 1}); // up left
                        dangerZonesArray.push({column: piece.x + 1, row: piece.y - 1}); // up right
                        break;
                    case Type.ROOK:
                        // right
                        for (let i = 1; i < (8 - piece.x); i++)
                        {
                            // if there is a piece at the position we just iterated to

                            if(JSON.stringify(piecePositions).includes(JSON.stringify({column: piece.x + i, row: piece.y})))
                            {
                                dangerZonesArray.push({column: piece.x + i, row: piece.y}); // add that last tile to dangerzones, used for making a king have to move
                                i = 8;
                            } else {
                                dangerZonesArray.push({column: piece.x + i, row: piece.y});
                            }

                        }
                        // left
                        for (let i = 1; i < piece.x + 1; i++)
                        {
                            // if there is a piece at the position we just iterated to

                            if(JSON.stringify(piecePositions).includes(JSON.stringify({column: piece.x - i, row: piece.y})))
                            {
                                dangerZonesArray.push({column: piece.x - i, row: piece.y}); // add that last tile to dangerzones, used for making a king have to move
                                i = 8; // end the iteration
                            } else {
                                dangerZonesArray.push({column: piece.x - i, row: piece.y});
                            }

                        }

                        // down
                        for (let i = 1; i < (8 - piece.y); i++)
                        {
                            // if there is a piece at the position we just iterated to

                            if(JSON.stringify(piecePositions).includes(JSON.stringify({column: piece.x, row: piece.y + i})))
                            {
                                dangerZonesArray.push({column: piece.x, row: piece.y + i}); // add that last tile to dangerzones, used for making a king have to move
                                i = 8;
                            } else {
                                dangerZonesArray.push({column: piece.x, row: piece.y + i});
                            }

                        }

                        // up
                        for (let i = 1; i < piece.y + 1; i++)
                        {
                            // if there is a piece at the position we just iterated to

                            if(JSON.stringify(piecePositions).includes(JSON.stringify({column: piece.x, row: piece.y - i})))
                            {
                                dangerZonesArray.push({column: piece.x, row: piece.y - i}); // add that last tile to dangerzones, used for making a king have to move
                                i = 8; // end the iteration
                            } else {
                                dangerZonesArray.push({column: piece.x, row: piece.y - i});
                            }

                        }

                        break;

                    case Type.BISHOP:
                        // ++, +-, -+, --
                        // piece.x + i && piece.y + i

                        // ++ => right down
                        for (let i = 1; i < Math.min(8 - piece.x, 8 - piece.y); i++)
                        {
                            // if there is a piece at the position we just iterated to

                            if(JSON.stringify(piecePositions).includes(JSON.stringify({column: piece.x + i, row: piece.y + i}))) // check if there is a piece in pieces where we're currently pointed to
                            {
                                dangerZonesArray.push({column: piece.x + i, row: piece.y + i}); // add that last tile to dangerzones, used for making a king have to move
                                i = 8; // end the iteration
                            } else {
                                dangerZonesArray.push({column: piece.x + i, row: piece.y + i}); // add the tile to the list of dangerous tiles, and move on to the next tile.
                            }

                        }

                        // +- => right up
                        for (let i = 1; i < Math.min(8 - piece.x, piece.y + 1); i++)
                        {
                            // if there is a piece at the position we just iterated to

                            if(JSON.stringify(piecePositions).includes(JSON.stringify({column: piece.x + i, row: piece.y - i}))) // check if there is a piece in pieces where we're currently pointed to
                            {
                                dangerZonesArray.push({column: piece.x + i, row: piece.y - i}); // add that last tile to dangerzones, used for making a king have to move
                                i = 8; // end the iteration
                            } else {
                                dangerZonesArray.push({column: piece.x + i, row: piece.y - i}); // add the tile to the list of dangerous tiles, and move on to the next tile.
                            }

                        }

                        // -+ => left down
                        for (let i = 1; i < Math.min(piece.x + 1, 8 - piece.y); i++)
                        {
                            // if there is a piece at the position we just iterated to

                            if(JSON.stringify(piecePositions).includes(JSON.stringify({column: piece.x - i, row: piece.y + i}))) // check if there is a piece in pieces where we're currently pointed to
                            {
                                dangerZonesArray.push({column: piece.x - i, row: piece.y + i}); // add that last tile to dangerzones, used for making a king have to move
                                i = 8; // end the iteration
                            } else {
                                dangerZonesArray.push({column: piece.x - i, row: piece.y + i}); // add the tile to the list of dangerous tiles, and move on to the next tile.
                            }

                        }

                        // -- => up left
                        for (let i = 1; i < Math.min(piece.x + 1, piece.y + 1); i++)
                        {
                            // if there is a piece at the position we just iterated to

                            if(JSON.stringify(piecePositions).includes(JSON.stringify({column: piece.x - i, row: piece.y - i}))) // check if there is a piece in pieces where we're currently pointed to
                            {
                                dangerZonesArray.push({column: piece.x - i, row: piece.y - i}); // add that last tile to dangerzones, used for making a king have to move
                                i = 8; // end the iteration
                            } else {
                                dangerZonesArray.push({column: piece.x - i, row: piece.y - i}); // add the tile to the list of dangerous tiles, and move on to the next tile.
                            }

                        }

                        break;

                    case Type.QUEEN:
                            
                        // queen is basically the functionality of a rook and bishop slapped together, so i can just combine the two.

                        // %%%%%%%%%%%%%%%%%%%%%%%%%%%%% copy pasted from rook %%%%%%%%%%%%%%%%%%%%%%%%%%%%%

                        // right
                        for (let i = 1; i < (8 - piece.x); i++)
                        {
                            // if there is a piece at the position we just iterated to

                            if(JSON.stringify(piecePositions).includes(JSON.stringify({column: piece.x + i, row: piece.y})))
                            {
                                dangerZonesArray.push({column: piece.x + i, row: piece.y}); // add that last tile to dangerzones, used for making a king have to move
                                i = 8;
                            } else {
                                dangerZonesArray.push({column: piece.x + i, row: piece.y});
                            }

                        }
                        // left
                        for (let i = 1; i < piece.x + 1; i++)
                        {
                            // if there is a piece at the position we just iterated to

                            if(JSON.stringify(piecePositions).includes(JSON.stringify({column: piece.x - i, row: piece.y})))
                            {
                                dangerZonesArray.push({column: piece.x - i, row: piece.y}); // add that last tile to dangerzones, used for making a king have to move
                                i = 8; // end the iteration
                            } else {
                                dangerZonesArray.push({column: piece.x - i, row: piece.y});
                            }

                        }

                        // down
                        for (let i = 1; i < (8 - piece.y); i++)
                        {
                            // if there is a piece at the position we just iterated to

                            if(JSON.stringify(piecePositions).includes(JSON.stringify({column: piece.x, row: piece.y + i})))
                            {
                                dangerZonesArray.push({column: piece.x, row: piece.y + i}); // add that last tile to dangerzones, used for making a king have to move
                                i = 8;
                            } else {
                                dangerZonesArray.push({column: piece.x, row: piece.y + i});
                            }

                        }

                        // up
                        for (let i = 1; i < piece.y + 1; i++)
                        {
                            // if there is a piece at the position we just iterated to

                            if(JSON.stringify(piecePositions).includes(JSON.stringify({column: piece.x, row: piece.y - i})))
                            {
                                dangerZonesArray.push({column: piece.x, row: piece.y - i}); // add that last tile to dangerzones, used for making a king have to move
                                i = 8; // end the iteration
                            } else {
                                dangerZonesArray.push({column: piece.x, row: piece.y - i});
                            }

                        }


                        // %%%%%%%%%%%%%%%%%%%%%%%%%%%%% copy pasted from bishop %%%%%%%%%%%%%%%%%%%%%%%%%%%%%

                        // ++ => right down
                        for (let i = 1; i < Math.min(8 - piece.x, 8 - piece.y); i++)
                        {
                            // if there is a piece at the position we just iterated to

                            if(JSON.stringify(piecePositions).includes(JSON.stringify({column: piece.x + i, row: piece.y + i})))
                            {
                                dangerZonesArray.push({column: piece.x + i, row: piece.y + i}); // add that last tile to dangerzones, used for making a king have to move
                                i = 8; // end the iteration
                            } else {
                                dangerZonesArray.push({column: piece.x + i, row: piece.y + i});
                            }

                        }

                        // +- => right up
                        for (let i = 1; i < Math.min(8 - piece.x, piece.y + 1); i++)
                        {
                            // if there is a piece at the position we just iterated to

                            if(JSON.stringify(piecePositions).includes(JSON.stringify({column: piece.x + i, row: piece.y - i})))
                            {
                                dangerZonesArray.push({column: piece.x + i, row: piece.y - i}); // add that last tile to dangerzones, used for making a king have to move
                                i = 8; // end the iteration
                            } else {
                                dangerZonesArray.push({column: piece.x + i, row: piece.y - i});
                            }

                        }

                        // -+ => left down
                        for (let i = 1; i < Math.min(piece.x + 1, 8 - piece.y); i++)
                        {
                            // if there is a piece at the position we just iterated to

                            if(JSON.stringify(piecePositions).includes(JSON.stringify({column: piece.x - i, row: piece.y + i})))
                            {
                                dangerZonesArray.push({column: piece.x - i, row: piece.y + i}); // add that last tile to dangerzones, used for making a king have to move
                                i = 8; // end the iteration
                            } else {
                                dangerZonesArray.push({column: piece.x - i, row: piece.y + i});
                            }

                        }

                        // -- => up left
                        for (let i = 1; i < Math.min(piece.x + 1, piece.y + 1); i++)
                        {
                            // if there is a piece at the position we just iterated to

                            if(JSON.stringify(piecePositions).includes(JSON.stringify({column: piece.x - i, row: piece.y - i})))
                            {
                                dangerZonesArray.push({column: piece.x - i, row: piece.y - i}); // add that last tile to dangerzones, used for making a king have to move
                                i = 8; // end the iteration
                            } else {
                                dangerZonesArray.push({column: piece.x - i, row: piece.y - i});
                            }

                        }

                        break;

                }
            }
        })
        let filteredDangerZonesArray: Position[] = [];
        let flag: boolean;
    
        // this is really hacky... all i'm doing here is removing invalid or duplicate position{col, row} elements.
        // set doesn't work and i can't find a better solution but i mean it works
        // i could use hashmap but this works so oh well
        dangerZonesArray.forEach(position => {
    
            filteredDangerZonesArray.forEach(pos => {
                if ((pos.column === position.column) && (pos.row === position.row)) flag = true; // duplicate check
            });
    
            if (position.column < 0 || position.column > 7) flag = true; // out of bounds check
            if (position.row < 0 || position.row > 7) flag = true; // out of bounds check
    
            if (!flag)
            {
                filteredDangerZonesArray.push(position); // only push if no flags were tripped
            }
    
            flag = false; // reset the algorithm
    
        });
    
        return filteredDangerZonesArray;

    }

    const grabPiece = (e: React.MouseEvent) => {    // any time we click a tile on the board

        activePiecePosition = getElementPosition(e); // remember the position of the element we're moving for later, used by dropPiece
        const element = e.target as HTMLElement;    // cast the element into a html element so we can access class list

        if (element.style.backgroundImage.match(`${player}.png`) && turn === player)    // check the colour. we don't grab the piece if it's not ours. -- also check if it's our turn
        {
            if (element.classList.contains("chess-piece"))  // checking if the element contains a chess piece
            {
                const x = e.clientX;
                const y = e.clientY;
                element.style.position = "absolute";
                element.style.left = `${x - 50}px`;
                element.style.top = `${y - 50}px`;
    
                activePiece = element;
            }
        }
    }

    const movePiece = (e: React.MouseEvent) => {

        const chessboard = chessBoardRef.current;

        if (activePiece && chessboard)  // checking if the element contains a chess piece
        {
            // all of this is to set boundaries
            const minX = chessboard.offsetLeft - 25;
            const minY = chessboard.offsetTop - 25;
            const maxX = chessboard.offsetLeft + chessboard.clientWidth - 75;
            const maxY = chessboard.offsetTop + chessboard.clientHeight - 75;
            const x = e.clientX - 50;
            const y = e.clientY - 50;
            activePiece.style.position = "absolute";

            if (x < minX) { // set our horizontal borders
                activePiece.style.left = `${minX}px`;
            } else if (x > maxX) {
                activePiece.style.left = `${maxX}px`;
            } else {
                activePiece.style.left = `${x}px`;
            }

            if (y < minY) { // set our vertical borders
                activePiece.style.top = `${minY}py`;
            } else if (y > maxY) {
                activePiece.style.top = `${maxY}px`;
            } else {
                activePiece.style.top = `${y}px`;
            }
        }
    }

    const dropPiece = (e: React.MouseEvent) => {

        const chessboard = chessBoardRef.current;
        const oldPosition: Position | undefined = {column: activePiecePosition!.column, row: activePiecePosition!.row};
        const newPosition: Position | undefined = getElementPosition(e);
        let piece: Piece | undefined; 


        // checking if this is a legal move. we're mov

        // we need to split the chess board into 8 columns using math
        // the chessboard starts horizontally at chessboard.offsetLeft
        // each column is 100px after that.
        // x + (0-100) 0, x + (100-200) 1, x + (200-300) 2, x + (300-400) 3, x + (400-500) 4, x + (500-600) 5 ...
        // check if the cursor is in each square

        // if clientX in chessboard.offsetLeft + (0, 100) => it's in column 0. Snap to 0.
        // Let's subtract clientX by offsetLeft, divide it by 100, and then floor it. that should be our column.

        if (activePiece && chessboard && newPosition && oldPosition)
        {
            piece = pieces?.find(e => e.x === oldPosition!.column && e.y === oldPosition!.row);
            if (pieces?.find(e => e.x === newPosition!.column && e.y === newPosition!.row)?.colour !== player) // if the target is an enemy
            {
                if ((newPosition.column < 0 || newPosition.column > 7) || (newPosition.row < 0 || newPosition.row > 7) || (newPosition.column === oldPosition.column && newPosition.row === oldPosition.row))
                {
                    returnPiece();  // if it's dropped outside of boundaries, or inside of the square it came from, return it.
                } else {
                    verifyLegalMove(piece!, oldPosition!, newPosition!);
                }
            } else returnPiece(); // same team, we don't allow you to bump into allies :)
        }


        activePiece = null;

    }

    const verifyLegalMove = (piece: Piece, oldPosition: Position, newPosition: Position) => {

        let dangerZones: Position[] = DangerZones();
        let illegalPositionFlag: boolean = false; // triggered if the king is trying to move to a spot in a DangerZone tile


        if (isLegalMove(piece, pieces!, oldPosition!, newPosition!, turn!)) {  // check if the move is legal, if it is, we move the piece
            // this is where we delete something on collision
            let tempArray = pieces;
            if (tempArray)
            {
                for (let i = 0; i < tempArray.length; i++)
                {
                    if (tempArray[i].x === newPosition!.column && tempArray[i].y === newPosition!.row && tempArray[i])
                    {
                        tempArray?.splice(i, 1);
                    }
                }
            }
            setPieces(tempArray);

            if (piece.type === Type.KING) // if we're moving a king
            {
                // check if we're moving it to a spot where it would be in check

                dangerZones.forEach(position => {
                    if ((newPosition.column === position.column) && (newPosition.row === position.row))
                    {
                        illegalPositionFlag = true;
                        returnPiece();
                    }
                })

            }
            
            if (!illegalPositionFlag)
            {
                // move the piece to a location
                setPieces(value => {
                    const pieces = value?.map(p => {
                        if (p.x === oldPosition!.column && p.y === oldPosition!.row) {   // only change our old position to our new position
                            // the position we want to move it to
                            p.x = newPosition!.column;
                            p.y = newPosition!.row;
                        }
                        return p;
                    });
                    return pieces;
                });

                // you've completed your move, it's their turn now
                switchTurn();
            }

        } else {
            returnPiece(); // not a legal move, return the piece to where it was.
        }

    }

    const switchTurn = () => {

        if (mode === Mode.SINGLE_PLAYER)
        {
            let temp: Colour = player!;

            setPlayer(opponent);
            setOpponent(temp);
        }

        setTurn(opponent);
        setTurns(turns + 1); // next turn

    }

    const returnPiece = () => {

        if (activePiece)
        {
            activePiece.style.left = '';
            activePiece.style.top = '';
            activePiece = null;
        }

    }

    const getElementPosition = (element: React.MouseEvent) => {
        // translates the cursor's position on the board to something we can use, which 'cell' the mouse is over. example: 255, 255 => [x: 0, y: 7]
        const chessboard = chessBoardRef.current;

        if (chessboard && element)
        {
            let horizontalPosition = element.clientX - chessboard.offsetLeft; // get our horizontal column
            let column = Math.floor(horizontalPosition / 100);
    
            let verticalPosition = element.clientY - chessboard.offsetTop; // get our vertical row
            let row = Math.floor(verticalPosition / 100);

            return {column, row};
        }

    }

    const drawBoard = () => {
        for (let i = 0; i < verticalAxis.length; i++) {
            for(let j = 0; j < horizontalAxis.length; j++) {
                const number = j + i + 2;
                let image = undefined;
                pieces?.forEach(p => {
                    if (p.x === j && p.y === i) {
                        image = p.image;
                    }
                })
                board.push(<Tile key={`[${i}, ${j}]`} image={image} number={number} />);
            }
        }
    }

    drawBoard();

    return (
        <div>
            <div id="chessboard" ref={chessBoardRef} onMouseMove={movePiece} onMouseDown={grabPiece} onMouseUp={dropPiece} onMouseLeave={returnPiece}>
                {board}
            </div>
        </div>
    )
}