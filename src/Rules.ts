import { Piece, Colour, Position, Type } from './components/Chessboard'

enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    UP_RIGHT,
    UP_LEFT,
    DOWN_RIGHT,
    DOWN_LEFT
}

// i need to create a unique ruleset for each piece.
// example: rook can go any number of columns or rows in a straight line

const movePawn = (piece: Piece, pieces: Piece[], enemyFound: boolean, oldPosition: Position, newPosition: Position) => {

    let direction: number;
    piece?.colour === Colour.BLACK ? direction = 1 : direction = -1; // pawns can only move in one direction, determine it based on the colour

    if (oldPosition.row === 6 || oldPosition.row === 1) // this is for the double move at the start
    {
        // we can do a double move
        
        if (
            (oldPosition.column === newPosition.column)
            && ((oldPosition.row - direction * 2) === newPosition.row)
            && scan(pieces, oldPosition, newPosition)
        ) return true;

    }

    if (piece && newPosition && oldPosition)
    {
        

        if ( // this is to check if we're trying to move one diagonal for pawn's takeover
        Math.abs(oldPosition.column - newPosition.column) === 1
        && oldPosition.row - newPosition.row === 1 * direction
        && enemyFound
        ) return true;
        if ( // normal vertical movement
        oldPosition.row - newPosition.row === 1 * direction
        && oldPosition.column === newPosition.column
        && !enemyFound
        ) return true ;
    }

    return false;
}

const moveKnight = (oldPosition: Position, newPosition: Position) => {
    // todo -- there's definitely a better way to do this LOL
    if (newPosition && oldPosition)
    {

        if (
            (newPosition.row === oldPosition.row - 2 && newPosition.column === oldPosition.column - 1)
            || (newPosition.row === oldPosition.row - 2 && newPosition.column === oldPosition.column + 1)
            || (newPosition.row === oldPosition.row + 2 && newPosition.column === oldPosition.column - 1)
            || (newPosition.row === oldPosition.row + 2 && newPosition.column === oldPosition.column + 1)
            || (newPosition.row === oldPosition.row + 1 && newPosition.column === oldPosition.column + 2)
            || (newPosition.row === oldPosition.row + 1 && newPosition.column === oldPosition.column - 2)
            || (newPosition.row === oldPosition.row - 1 && newPosition.column === oldPosition.column + 2)
            || (newPosition.row === oldPosition.row - 1 && newPosition.column === oldPosition.column - 2)
        ) return true;

    }

    return false;
}

const moveRook = (pieces: Piece[], oldPosition: Position, newPosition: Position) => {

    if (!scan(pieces, oldPosition, newPosition!)) return false; // scans if we're going over a unit (too far, illegal move)


    if (newPosition && oldPosition)
    {
        if (newPosition.column === oldPosition.column)
        {
            return true;
        } else if (newPosition.row === oldPosition.row)
        {
            // are we moving vertically?
            // check collision
            return true;
        } else {
            // move was absolutely illegal
            return false;
        }
    }
}

const moveKing = (oldPosition: Position, newPosition: Position) => {
    // any direction but it must be only at most one tile away (i'm checking differences here)
    if (newPosition && oldPosition)
    {   
        if (
            (Math.abs(oldPosition.column - newPosition.column) === 1
            || Math.abs(oldPosition.column - newPosition.column) === 0)
            &&
            (Math.abs(oldPosition.row - newPosition.row) === 1
            || Math.abs(oldPosition.row - newPosition.row) === 0)
            )
        {
            return true;
        }
    }
    return false;
}

const moveBishop = (pieces: Piece[], oldPosition: Position, newPosition: Position) => {
    // only allow a move if the absolute values of horizontal difference and vertical difference are equal
    if (!scan(pieces, oldPosition, newPosition!)) return false;


    if (newPosition && oldPosition)
    {
        if (Math.abs(oldPosition.row - newPosition.row) === Math.abs(oldPosition.column - newPosition.column)) return true;
    }

    return false;

}

const moveQueen = (pieces: Piece[], oldPosition: Position, newPosition: Position) => {
    if (!scan(pieces, oldPosition, newPosition!))
    {
        return false;
    }

    let direction = getDirection(oldPosition, newPosition);

    switch(direction > 3)
    {
        case true:
            if (newPosition && oldPosition)
            {
                if (Math.abs(oldPosition.row - newPosition.row) === Math.abs(oldPosition.column - newPosition.column)) return true;
            }
            break;
        case false:
            if (newPosition && oldPosition)
            {
                if (newPosition.column === oldPosition.column)
                {
                    return true;
                } else if (newPosition.row === oldPosition.row)
                {
                    // are we moving vertically?
                    // check collision
                    return true;
                } else {
                    // move was absolutely illegal
                    return false;
                }
            }
            break;
    }


    if (newPosition && oldPosition)
    {
        if (Math.abs(oldPosition.row - newPosition.row) === Math.abs(oldPosition.column - newPosition.column)) return true;
    }

    return false;
}

const findEnemy = (piece: Piece, pieces: Piece[], position: Position) => {

    let enemyFound: boolean = false;

    if (pieces && position && piece)
    {
        let targetPiece = pieces.find(e => e.x === position.column && e.y === position.row) // get the enemy piece element if it exists
        if (targetPiece) // if there is anything in that tile at all
        {
            targetPiece.colour === piece.colour ? /* same team */ enemyFound = false : /* opposite colour */ enemyFound = true;
        } else enemyFound = false;
        
    }

    return enemyFound;

}

// the entire purpose of this function is for readability. scan uses this in its switch to determine which direction to scan for something
// it basically just sets an enumerator direction based on the vector created from the pieces old position and my new position
const getDirection = (oldPosition: Position, newPosition: Position) => {

    let direction: Direction;

    if (newPosition && oldPosition)
    {
        if (newPosition.column === oldPosition.column)
        {
            // we're moving vertically
            if (newPosition.row > oldPosition.row) direction = Direction.DOWN;
            if (newPosition.row < oldPosition.row) direction = Direction.UP;
        }

        if (newPosition.row === oldPosition.row)
        {
            if (newPosition.column > oldPosition.column) direction = Direction.RIGHT;
            if (newPosition.column < oldPosition.column) direction = Direction.LEFT;
        }

        if (Math.abs(oldPosition.row - newPosition.row) === Math.abs(oldPosition.column - newPosition.column))
        {
            // we're moving diagonally
            if ((newPosition.column > oldPosition.column) && (newPosition.row > oldPosition.row)) direction = Direction.DOWN_RIGHT;
            if ((newPosition.column < oldPosition.column) && (newPosition.row > oldPosition.row)) direction = Direction.DOWN_LEFT;
            if ((newPosition.column > oldPosition.column) && (newPosition.row < oldPosition.row)) direction = Direction.UP_RIGHT;
            if ((newPosition.column < oldPosition.column) && (newPosition.row < oldPosition.row)) direction = Direction.UP_LEFT;
        }
        
    }

    return direction!;
    
}

const scan = (pieces: Piece[], oldPosition: Position, newPosition: Position) => {

    let legalMove: boolean = true;
    let direction: Direction = getDirection(oldPosition, newPosition);
    let matched: Piece[] | undefined = undefined;
    let closest: Piece | undefined;

    let foundPieces: Piece[] = []
    let foundPiece: Piece | undefined

    // this thing right here is a prime candidate for refactoring hahaha... one of the 7 great wonders of my code.
    // basically i find out the direction i want to scan in based on the vector created between my old position, and my new position.
    // Then, i use the direction to create a specific formula to get an array of the items in its path.
    // Closest is just the item closest to the piece in the path it's going.
    // if we're going over closest, then the move is illegal.
    // that's all that's going on here.

    if (pieces && oldPosition && newPosition)
    {
        switch (direction!)
        {
            case Direction.UP:
                matched = pieces.filter(e => (oldPosition.row > e.y && oldPosition.column === e.x));  // get all pieces above us
                if(matched !== undefined)   // check if we actually had something return
                {
                    matched.forEach(e => {  // iterate through each piece above us
                        if (closest){       // for the first time closest is set, just set it as our first item
                            if(e.y > closest!.y) closest = e // sort the pieces, getting the one closest to us (the highest Y value)
                        } else {
                            closest = e
                        }
                    });
                    if (closest) // make sure there actually is something there
                    {
                        if (closest!.y > newPosition.row) legalMove = false; // bread and butter formula for finding if the move we made was illegal
                    }
                }
                break;

            case Direction.DOWN:
                matched = pieces.filter(e => (oldPosition.row < e.y && oldPosition.column === e.x));  // get all pieces above us
                if(matched !== undefined)   // check if we actually had something return
                {
                    matched.forEach(e => {  // iterate through each piece above us
                        if (closest){       // for the first time closest is set, just set it as our first item
                            if(e.y < closest!.y) closest = e // sort the pieces, getting the one closest to us (the lowest Y value)
                        } else {
                            closest = e
                        }
                    });
                    if (closest) // make sure there actually is something there
                    {
                        if (closest!.y < newPosition.row) legalMove = false; // bread and butter formula for finding if the move we made was illegal
                    }
                }
                break;

            case Direction.LEFT:
                matched = pieces.filter(e => (oldPosition.column > e.x && oldPosition.row === e.y));  // get all pieces left of us
                if(matched !== undefined)   // check if we actually had something return
                {
                    matched.forEach(e => {  // iterate through each piece to the left of us
                        if (closest){       // for the first time closest is set, just set it as our first item
                            if(e.x > closest!.x) closest = e // sort the pieces, getting the one closest to us (the highest X value)
                        } else {
                            closest = e
                        }
                    });
                    if (closest) // make sure there actually is something there
                    {
                        if (closest!.x > newPosition.column) legalMove = false; // bread and butter formula for finding if the move we made was illegal
                    }
                }
                break;

            case Direction.RIGHT:
                matched = pieces.filter(e => (oldPosition.column < e.x && oldPosition.row === e.y));  // get all pieces to the right of us
                if(matched !== undefined)   // check if we actually had something return
                {
                    matched.forEach(e => {  // iterate through each piece to the right of us us
                        if (closest){       // for the first time closest is set, just set it as our first item
                            if(e.x < closest!.x) closest = e // sort the pieces, getting the one closest to us (the lowest X value)
                        } else {
                            closest = e
                        }
                    });
                    if (closest) // make sure there actually is something there
                    {
                        if (closest.x < newPosition.column) legalMove = false; // bread and butter formula for finding if the move we made was illegal
                    }
                }
                break;

            case Direction.UP_RIGHT:

                for (let i = 1; (i + oldPosition.column < 8) && (i + oldPosition.row < 8); i++) // limit it to the boundaries of the board
                {
                    foundPiece = pieces.find(e => (e.x === oldPosition.column + i) && (e.y === oldPosition.row - i));
                    if (foundPiece) foundPieces.push(foundPiece); // only push it if it isn't undefined
                }


                foundPieces.forEach(piece => {
                    if (closest)
                    {
                        if ((piece.x < closest.x) && (piece.y > closest.y)) closest = piece;
                    } else closest = piece;
                })

                if (closest)
                {
                    if ((newPosition.column > closest!.x) && (newPosition.row < closest!.y))
                    {
                        legalMove = false;
                    }     
                }

            break;

            case Direction.UP_LEFT:

                for (let i = 1; (oldPosition.column - i > 0) && (i + oldPosition.row < 8); i++) // limit it to the boundaries of the board
                {
                    foundPiece = pieces.find(e => (e.x === oldPosition.column - i) && (e.y === oldPosition.row - i));
                    if (foundPiece) foundPieces.push(foundPiece); // only push it if it isn't undefined
                }

                foundPieces.forEach(piece => {
                    if (closest)
                    {
                        if ((piece.x > closest.x) && (piece.y > closest.y)) closest = piece;
                    } else closest = piece;
                })

                if (closest)
                {
                    if ((newPosition.column < closest!.x) && (newPosition.row < closest!.y))
                    {
                        legalMove = false;
                    }     
                }

            break;

            case Direction.DOWN_LEFT:

                for (let i = 1; (oldPosition.column - i > 0) && (oldPosition.row - i > 0); i++) // limit it to the boundaries of the board
                {
                    foundPiece = pieces.find(e => (e.x === oldPosition.column - i) && (e.y === oldPosition.row + i));
                    if (foundPiece) foundPieces.push(foundPiece); // only push it if it isn't undefined
                }


                foundPieces.forEach(piece => {
                    if (closest)
                    {
                        if ((piece.x < closest.x) && (piece.y < closest.y)) closest = piece;
                    } else closest = piece;
                })

                // for (let i = 1; i < foundPieces.length; i++) {
                //     if (closest)
                //     {
                //         if ((foundPieces[i].x < closest.x) && (foundPieces[i].y < closest.y)) closest = foundPieces[i];
                //     } else closest = foundPieces[i];
                // }


                if (closest)
                {
                    if ((newPosition.column < closest!.x) && (newPosition.row > closest!.y))
                    {
                        legalMove = false;
                    }     
                }

            break;

            case Direction.DOWN_RIGHT:

                for (let i = 1; (i + oldPosition.column < 8) && (oldPosition.row - i > 0); i++) // limit it to the boundaries of the board
                {
                    foundPiece = pieces.find(e => (e.x === oldPosition.column + i) && (e.y === oldPosition.row + i));
                    if (foundPiece) foundPieces.push(foundPiece); // only push it if it isn't undefined
                }


                foundPieces.forEach(piece => {
                    if (closest)
                    {
                        if ((piece.x > closest.x) && (piece.y < closest.y)) closest = piece;
                    } else closest = piece;
                })


                if (closest)
                {
                    if ((newPosition.column > closest!.x) && (newPosition.row > closest!.y))
                    {
                        legalMove = false;
                    }     
                }

            break;
        } 
    }


    return legalMove;
}


const isLegalMove = (piece: Piece, pieces: Piece[], oldPosition: Position, newPosition: Position, currentTurnColour: Colour) => {

    let enemyFound: boolean | undefined;
    let result: boolean | undefined;

    if (oldPosition && newPosition)
    {
        enemyFound = findEnemy(piece, pieces, newPosition);

        switch (piece?.type)
        {
            case Type.PAWN:
                result = movePawn(piece, pieces, enemyFound, oldPosition, newPosition);
                break;
            case Type.BISHOP:
                result = moveBishop(pieces, oldPosition, newPosition);
                break;
            case Type.KNIGHT:
                result = moveKnight(oldPosition, newPosition);
                break;
            case Type.ROOK:
                result = moveRook(pieces, oldPosition, newPosition);
                break;
            case Type.KING:
                result = moveKing(oldPosition, newPosition);
                break;
            case Type.QUEEN:
                result = moveQueen(pieces, oldPosition, newPosition);
                break;
        }

        return result;

    } else return false;

}

export { isLegalMove }