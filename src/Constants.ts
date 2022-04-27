import { Piece, Colour, Type } from './components/Chessboard';

export const initialBoardState = () => {

    const pieces: Piece[] = [];

    const assets = {
        pawnb: 'assets/pawn_b.png',
        pawnw: 'assets/pawn_w.png',
        queenb: 'assets/queen_b.png',
        queenw: 'assets/queen_w.png',
        kingb: 'assets/king_b.png',
        kingw: 'assets/king_w.png',
        bishopb: 'assets/bishop_b.png', 
        bishopw: 'assets/bishop_w.png', 
        knightb: 'assets/knight_b.png',
        knightw: 'assets/knight_w.png', 
        rookb: 'assets/rook_b.png', 
        rookw: 'assets/rook_w.png', 
    };

    // pawns
    for (let i = 0; i < 8; i++)
    {
        pieces.push({image: assets.pawnb,  x: i, y: 6, colour: Colour.BLACK, type: Type.PAWN});
        pieces.push({image: assets.pawnw,  x: i, y: 1, colour: Colour.WHITE, type: Type.PAWN});
    }

    // rooks
    pieces.push({image: assets.rookb,  x: 0, y: 7, colour: Colour.BLACK, type: Type.ROOK})
    pieces.push({image: assets.rookb,  x: 7, y: 7, colour: Colour.BLACK, type: Type.ROOK})
    pieces.push({image: assets.rookw,  x: 0, y: 0, colour: Colour.WHITE, type: Type.ROOK})
    pieces.push({image: assets.rookw,  x: 7, y: 0, colour: Colour.WHITE, type: Type.ROOK})

    //knights
    pieces.push({image: assets.knightb,  x: 1, y: 7, colour: Colour.BLACK, type: Type.KNIGHT})
    pieces.push({image: assets.knightb,  x: 6, y: 7, colour: Colour.BLACK, type: Type.KNIGHT})
    pieces.push({image: assets.knightw,  x: 1, y: 0, colour: Colour.WHITE, type: Type.KNIGHT})
    pieces.push({image: assets.knightw,  x: 6, y: 0, colour: Colour.WHITE, type: Type.KNIGHT})

    // bishops
    pieces.push({image: assets.bishopb,  x: 2, y: 7, colour: Colour.BLACK, type: Type.BISHOP})
    pieces.push({image: assets.bishopb,  x: 5, y: 7, colour: Colour.BLACK, type: Type.BISHOP})
    pieces.push({image: assets.bishopw,  x: 2, y: 0, colour: Colour.WHITE, type: Type.BISHOP})
    pieces.push({image: assets.bishopw,  x: 5, y: 0, colour: Colour.WHITE, type: Type.BISHOP})

    // kings
    pieces.push({image: assets.kingb,  x: 3, y: 7, colour: Colour.BLACK, type: Type.KING})
    pieces.push({image: assets.kingw,  x: 4, y: 0, colour: Colour.WHITE, type: Type.KING})

    //queens
    pieces.push({image: assets.queenb,  x: 4, y: 7, colour: Colour.BLACK, type: Type.QUEEN})
    pieces.push({image: assets.queenw,  x: 3, y: 0, colour: Colour.WHITE, type: Type.QUEEN})

    return pieces;

}