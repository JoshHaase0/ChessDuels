//Fix king's movement (breaks on edges)
//Re-play a random taken piece
//Sudden death, random spaces on the board slowly start to become unusable

const DECK_SIZE = 8;
const PIECES_LIST = ["block", "knight", "bishop", "rook", "queen"];
const BORDER_COLORS = ["red", "blue", "yellow", "purple"];
var border = 0;
$(document).ready(function() {

    var pieces = [["bRQ", "bN", "bB", "bQ", "bKI", "bB", "bN", "bRK"],
                  ["bPI", "bPI", "bPI", "bPI", "bPI", "bPI", "bPI", "bPI"],
                  ["eE", "eE", "eE", "eE", "eE", "eE", "eE", "eE"],
                  ["eE", "eE", "eE", "eE", "eE", "eE", "eE", "eE"],
                  ["eE", "eE", "eE", "eE", "eE", "eE", "eE", "eE"],
                  ["eE", "eE", "eE", "eE", "eE", "eE", "eE", "eE"],
                  ["wPI", "wPI", "wPI", "wPI", "wPI", "wPI", "wPI", "wPI"],
                  ["wRK", "wN", "wB", "wQ", "wKI", "wB", "wN", "wRQ"]]
    var skips = [2, 2];
    var turns = 0;
    var undo_Pieces = pieces;
    var deck = [[],[]];
    var undo_Deck = deck;
    var cards = [];
    var selected_card = "";
    var selected_card_number;
    var selected_card_id = "";
    var movementOptions = []
    var selectedY = -1;
    var selectedX = -1;
    var xPos = -1;
    var yPos = -1
    var color = "w";
    var move = true;
    var undo = false;
    var cooldown = false;
    var angry_king = false;
    var check_icon_undo = "";
    gen_Cards();
    createBoard();
    createCards();
    setCards();
    setBoard(true);
    setStats();

    function find_Check() {
        movementOptions = [];
        let opponent = "w";
        if ( color == "w" ) { opponent = "b"; } else { opponent = "w"; }
        let king_location = "";
        for (let i = 0; i < pieces.length; i++) {
            for (let j = 0; j < pieces[i].length; j++) {
                if (pieces[i][j][0] == opponent && pieces[i][j][1] == "K") {
                    king_location = "#" + i + j;
                }
            }
        }
        for (let i = 0; i < pieces.length; i++) {
            for (let j = 0; j < pieces[i].length; j++) {
                yPos = i;
                xPos = j;
                if (pieces[i][j][0] == color) {
                    if (pieces[i][j][1] == "P") {
                        pawnOptions();
                    } else if (pieces[i][j][1] == "R") {
                        rookOptions();
                    } else if (pieces[i][j][1] == "B") {
                        bishopOptions();
                    } else if (pieces[i][j][1] == "N") {
                        knightOptions();
                    } else if (pieces[i][j][1] == "Q") {
                        bishopOptions();
                        rookOptions();
                    } else if (pieces[i][j][1] == "K") {
                        kingOptions();
                    }
                }
            }
        }
        if (movementOptions.includes(king_location)) {
            $("#check-info").attr("src", "images/icons/check-danger.png");
        } else {
            $("#check-info").attr("src", "images/icons/check-safe.png");
        }
        movementOptions = [];
    }


    function gen_Cards() {
        for (let i  = 0; i < 13; i++) {
            cards.push("pawn");
        }
        for (let i  = 0; i < 8; i++) {
            cards.push("rook");
        }
        for (let i  = 0; i < 7; i++) {
            cards.push("bishop");
        }
        for (let i  = 0; i < 6; i++) {
            cards.push("knight");
        }
        for (let i  = 0; i < 3; i++) {
            cards.push("king");
        }
        for (let i  = 0; i < 3; i++) {
            cards.push("queen");
        }
        for (let i  = 0; i < 3; i++) {
            cards.push("block");
        }
        for (let i  = 0; i < 3; i++) {
            cards.push("undo");
        }
        for (let i  = 0; i < 5; i++) {
            cards.push("wild");
        }
        for (let i = 0; i < 2; i++) {
            cards.push("bomb");
        }
        for (let i = 0; i < 2; i++) {
            cards.push("promotion");
        }
        for (let i = 0; i < 1; i++) {
            cards.push("change-deck");
        }
        for (let i = 0; i < 4; i++) {
            cards.push("special-pawn");
        }
    }

    $(".card").click(function() {
        if (!cooldown) {
            let colorI = 0;
            movementOptions = [];
            if ( color == "w" ) { colorI = 0; } else { colorI = 1; }
            selected_card = deck[colorI][$(this).attr('id').split("card")[1]];
            selected_card_number = $(this).attr('id').split("card")[1];
            selected_card_id = "#" + $(this).attr('id');
            if (selected_card == "block" && xPos != -1) {
                move = false;
                setOptions();
                setBoard(false);
                setCards();
                blockOptions();
            } else if (selected_card == "undo" && undo) {
                // find_Chesck();
                // Currently broken may have to stop from undoing once youre in check, however thatd be dumb bc thats the main use for it.
                useCopy();
                newCard();
                movementOptions = [];
                selected_card, selected_card_id = "";
                selected_card_number = -1;
                if (color == "w") { color = "b"; } else { color = "w"; }
                setBoard(false);
                setCards();
                undo = false;
            } else if (selected_card == "undo" && (!undo)) {
                $(this).children("img").attr("src", "images/cards/undo-block.png");
            } else if (selected_card == "bomb") {
                cooldown = true;
                let taken = "w";
                if (color == "w") { taken = "b"; } else { taken = "w"; }
                take_Random_Piece(taken);
                setTimeout(function() {
                    delete taken;
                    flipBoard();
                    setBoard(false);
                    cooldown = false;
                }, 800);
            } else if (selected_card == "promotion" && xPos != -1) {
                
                move = false;
                setOptions();
                setBoard(false);
                setCards();
                promotionOptions();

            }else if (selected_card == "king" && angry_king && selected_card != "wild") {
                setCards();
                $(this).children("img").attr("src", "images/cards/angry-king.png");
                setOptions();
                setBoard(false);
            } else if (selected_card == "change-deck") {
                newCard();
                deck.reverse();
                flipBoard();
                setBoard(false);
            }else {
                move = true;
                setCards();
                setOptions();
                setBoard(false);
            }
        }
        debug();
    });

    
    $(".square,.button").not(".wheel-square, #check-info").on({
        mouseenter: function() {
            $(this).css("filter", "brightness(80%)");
        },
        mouseleave: function() {
            $(this).css("filter", "brightness(100%)");
        }
    })

    function newSkip() {
        if (turns % 8 == 0) {
            for (let i = 0; i < skips.length; i++) {
                if (skips[i] < 4) {
                    skips[i] = skips[i] + 1;
                }
            }
        }
    }

    $("#skip-button").click(function() {
        let colorI = 0;
        if ( color == "w" ) { colorI = 0; } else { colorI = 1; }
        if (skips[colorI] >= 1) {
            skips[colorI] = skips[colorI] - 1;
            undo = false;
            selected_card_number = Math.floor(Math.random() * deck[colorI].length);
            flipBoard();
            setBoard(false);
        }
    });

    $("#skip-piece-button").click(function() {
        undo = false;
        let colorI = 0;
        if ( color == "w" ) { colorI = 0; } else { colorI = 1; }
        take_Random_Piece(color);
        draw_New_Deck(colorI);
        flipBoard();
        setBoard(false);
    });


    function draw_New_Deck(deck_num) {
        for (let i = 0; i < DECK_SIZE; i++) {
            deck[deck_num][i] = cards[Math.floor(Math.random() * cards.length)];
        }
    }

    function take_Random_Piece(taken_color) {
        let death_List = [];
        for (let i = 0; i < pieces.length; i++) {
            for (let j = 0; j < pieces[i].length; j++) {
                if (pieces[i][j][0] == taken_color && pieces[i][j][1] != "K") {
                    death_List.push([i, j]);
                }
            }
        }
        let done = Math.floor(Math.random() * death_List.length);
        let animate = "#" + death_List[done][0] + death_List[done][1];
        $(animate).children("img").attr("src", "images/icons/explosion.gif");
        pieces[death_List[done][0]][death_List[done][1]] = "eE";
    }
    



    function winBorder() {
        if (border >= BORDER_COLORS.length) { border = 0; }
        let border_info = "5px solid " + BORDER_COLORS[border];
        $("#gameWrapper").css("border", border_info);
        border++;
    }

    $(".square").click(function() {
        if (!cooldown) {
        xPos = parseInt($(this).attr('id')[1]);
        yPos = parseInt($(this).attr('id')[0]);

        debug();


        $(".square").css("filter", "brightness(100%) saturate(100%)");
        $("#" + yPos + xPos).css("filter", "brightness(60%) saturate(200%)");

        if (movementOptions.includes("#" + yPos + xPos)) {
            copyBoard();
            if (move) {
                if (pieces[yPos][xPos][0] != color && pieces[yPos][xPos][1] == "K") {
                    $("#cards").slideUp(550);
                    $("#gameWrapper").slideUp(500).slideDown(500);
                    setTimeout(function() {
                        $("#gameWrapper").html("<img class='end-game' src='images/wins/" + color + ".png'><img class='end-game' src='images/wins/wins.png'>");
                        setInterval(winBorder, 500);
                    }, 490)
                    cooldown = true;
                } else {
                    pieces[yPos][xPos] = pieces[selectedY][selectedX].substring(0, 2);
                    pieces[selectedY][selectedX] = "eE";
                    selectedX = selectedY = -1;
                    $("#" + yPos + xPos).css("filter", "brightness(100%) saturate(100%)");
                    undo = true;
                    turns += 1;
                    newSkip();
                    flipBoard();
                }
            } else {
                if (selected_card == "block") {
                    pieces[yPos][xPos] = color + "b";
                    undo = true;
                    turns += 1;
                    newSkip();
                    flipBoard();
                } else if (selected_card == "promotion") {
                    $("#promotionWheel").toggle(300);
                    promotionWheel();
                }
            }
        }
        setBoard(false);


        if (pieces[yPos][xPos][0] == color) {
            movementOptions = [];
            selectedY = yPos;
            selectedX = xPos;
            move = true;
            if (pieces[yPos][xPos][1] == "P" && (selected_card == "special-pawn")) {

                pawnOptions();
                specialPawnOptions();

            } else if (pieces[yPos][xPos][1] == "P" && (selected_card == "pawn" || selected_card == "wild")) {
                
                pawnOptions();

            } else if (pieces[yPos][xPos][1] == "R" && (selected_card == "rook" || selected_card == "wild")) {
                
                rookOptions();

            } else if (pieces[yPos][xPos][1] == "N" && (selected_card == "knight" || selected_card == "wild")) {
                
                knightOptions();

            } else if (pieces[yPos][xPos][1] == "B" && (selected_card == "bishop" || selected_card == "wild")) {
                
                bishopOptions();

            } else if(pieces[yPos][xPos][1] == "K" && (selected_card == "king") && angry_king) {

                rookOptions();
                bishopOptions();

            } else if(pieces[yPos][xPos][1] == "K" && (selected_card == "king" || selected_card == "wild")) {
                
                kingOptions();

            } else if(pieces[yPos][xPos][1] == "Q" && (selected_card == "queen" || selected_card == "wild")) {
                
                rookOptions();
                bishopOptions();

            }
        } else {
            movementOptions = [];
        }
        setOptions();
    }
    });

    var wheel_count = 0;
    var velocity = 25;
    var end_time = 0;
    var wheel_loop;
    function promotionWheel() {
        cooldown = true;
        wheel_count = end_time = 0;
        velocity = 25;
        do {
            end_time = Math.floor(Math.random() * 15000);
        } while (end_time < 5000);
        wheel_loop = setInterval(scrollWheel, velocity);
        setTimeout(function() {
            clearInterval(wheel_loop);
            let piece = $(".wheel-square:nth-child(3)").children("img").attr("src").split("/")[3].split(".")[0];
            switch (piece) {
                case "block":
                    piece = color + "b";
                    break;
                case "bishop":
                    piece = color + "B";
                    break;
                case "queen":
                    piece = color + "Q";
                    break;
                case "rook":
                    piece = color + "R";
                    break;
                case "knight":
                    piece = color + "N";
                    break;
            }
            $("#promotionWheel").toggle(300);
            pieces[yPos][xPos] = piece;
            cooldown = false;
            undo = true;
            turns += 1;
            newSkip();
            flipBoard();
        }, end_time);
        
    }

    function scrollWheel() {
        let insert = 0;
        let light_up = 0;
        if (wheel_count == 0) { insert = PIECES_LIST.length - 1; } else { insert = wheel_count - 1; }
        $("#wheel" + wheel_count).remove().insertAfter($("#wheel" + insert));
        $(".wheel-square").css("filter", "brightness(100%) contrast(100%)").css("background-color", "#eee5e5");
        $(".wheel-square:nth-child(3)").css("filter", "brightness(150%)").css("background-color", "#F0EC57");
        if (wheel_count < PIECES_LIST.length-1) { wheel_count++; } else { wheel_count = 0; }
        velocity += 50000/end_time;
        clearInterval(wheel_loop);
        wheel_loop = setInterval(scrollWheel, velocity);
    }


    function setOptions() {
        for (let i = 0; i < movementOptions.length; i++) {
            $(movementOptions[i]).html("<h2 class='circle'>&nbsp;</h2>" + $(movementOptions[i]).html());
        }
    }
    // Sets the board and clears movement option's visual
    function setBoard(start) {
        for (let i = 0; i < pieces.length; i++) {
            for (let j = 0; j < pieces[i].length; j++) {
                let replace = "#" + i + j;
                if (pieces[i][j][0] != "e") {
                    let color = "";
                    let piece = "";
                    if (pieces[i][j][0] == "w") { color = "white"; } else { color = "black"; }
                    switch (pieces[i][j][1]) {
                        case "R":
                            piece = "rook";
                            break;
                        case "N":
                            piece = "knight";
                            break;
                        case "B":
                            piece = "bishop";
                            break;
                        case "Q":
                            piece = "queen";
                            break;
                        case "K":
                            piece = "king";
                            break;
                        case "P":
                            piece = "pawn";
                            break;
                        case "b":
                            piece = "block";
                            break;
                    }
                    $(replace).html("<img class='piece' src='images/pieces/" + color + "/" + piece + ".png'>");
                } else if (!start) {
                    $(replace).html("");
                }
            }
        }
    }

    function createCards() {
        let pushed = "";
        for (let i = 0; i < DECK_SIZE; i++) {
            pushed += "<div class='card' id='card" + i + "'></div>";
        }
        $("#cards").html(pushed);
        delete pushed;
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < DECK_SIZE; j++) {
                deck[i].push(cards[Math.floor(Math.random() * cards.length)]);
            }
        } 
    }

    function setCards() {
        let colorI = 0;
        if (color == "w") { colorI = 0; } else { colorI = 1; }

        for (let i = 0; i < DECK_SIZE; i++) {
            $("#card" + i).html("<img class='cardImg' src='images/cards/" + deck[colorI][i] + ".png'>")
            $("#card" + i).css("filter", "brightness(100%) saturate(100%)");
        }
        $(selected_card_id).css("filter", "brightness(60%) saturate(200%)");
    }


    // Creates the board
    function createBoard() {
        let boardGen = "";
        for (let i = 0; i < pieces.length; i++) {
            for (let j = 0; j < pieces[i].length; j++) {
                if (color == "w") { boardGen += "<div class='square white' id='"+ i + j + "'></div>"; color = "b" } else { boardGen += "<div class='square black' id='"+ i + j + "'></div>"; color = "w" }
            }
            if (color == "w") { color = "b"; } else { color = "w"; }
        }
        let wheelGen = "";
        for (let i = 0; i < PIECES_LIST.length; i++) {
            let image = "<img class='piece' src='images/pieces/white/" + PIECES_LIST[i] + ".png'>";
            wheelGen += "<div class='square white wheel-square' id='wheel" + i + "'>" + image + "</div>";
        }
        $("#board").html(boardGen);
        $("#promotionWheel").html(wheelGen);
        $("#promotionWheel").toggle();
        delete boardGen;
    }

    function newCard() {
        let colorI = 0;
        if ( color == "w" ) { colorI = 0; } else { colorI = 1; }
        deck[colorI].splice(selected_card_number, 1);
        deck[colorI].push(cards[Math.floor(Math.random() * cards.length)]);
        
    }


    function copyBoard() {
        undo_Pieces = pieces.map(function(arr) {
            return arr.slice();
        });
        undo_Deck = deck.map(function(arr) {
            return arr.slice();
        });
        check_icon_undo = $("#check-info").attr("src");
    }

    function useCopy() {
        pieces = undo_Pieces.map(function(arr) {
            return arr.slice();
        });
        deck = undo_Deck.map(function(arr) {
            return arr.slice();
        });
        $("#check-info").attr("src", check_icon_undo);
    }

    // Changes turn and flips the board
    // Add check checker in here at some point
    function flipBoard() {
        find_Check();
        if (Math.floor(Math.random() * 101) >= 80) { angry_king = true; } else { angry_king = false; }
        newCard();
        movementOptions = [];
        selected_card = selected_card_id = "";
        selected_card_number = -1;
        for (x of pieces) {
            x.reverse();
        }
        pieces.reverse();
        if (color == "w") { color = "b"; } else { color = "w"; }
        setBoard(false);
        setCards();
        setStats();
    }

    function setStats() {
        let colorI = 0;
        if ( color == "w" ) { colorI = 0; } else { colorI = 1; }
        let pushed = "";
        for (let i = 0; i < skips[colorI]; i++) {
            pushed += "<img src='images/icons/skip-icon.png' class='stat'>";
        }
        $("#stats-info").html(pushed);
    }

    // Pawn movement options
    function pawnOptions() {
        if ((yPos - 1) >= 0 && (yPos - 1) < pieces.length) {
            if (pieces[yPos-1][xPos][0] != color) {
                if (pieces[yPos-1][xPos][0] == "e") { movementOptions.push("#" + (yPos - 1) + xPos); if (pieces[yPos][xPos][2] == "I" && pieces[yPos-2][xPos][0] == "e") { movementOptions.push("#" + (yPos - 2) + xPos); } }
            }
            for (let i = -1; i < 2; i+=2) {
                if ((yPos - 1) >= 0 && (yPos - 1) < pieces.length && (xPos + i) >= 0 && (xPos + i) < pieces.length) {
                    if (pieces[yPos-1][xPos+i][0] != "e" && pieces[yPos-1][xPos+i][0] != color) {
                        movementOptions.push("#" + (yPos - 1) + (xPos + i));
                    }
                }
            }
        }
    }

    function specialPawnOptions() {
        if ((yPos + 1) >= 0 && (yPos + 1) < pieces.length) {
            if (pieces[yPos-1][xPos][0] != color) {
                if (pieces[yPos+1][xPos][0] == "e") { 
                    movementOptions.push("#" + (yPos + 1) + xPos); 
                    if (pieces[yPos+2][xPos][0] == "e") { 
                        movementOptions.push("#" + (yPos + 2) + xPos); 
                    } 
                }
            }
            for (let i = -1; i < 2; i+=2) {
                if ((yPos + 1) >= 0 && (yPos + 1) < pieces.length && (xPos + i) >= 0 && (xPos + i) < pieces.length) {
                    if (pieces[yPos+1][xPos+i][0] != "e" && pieces[yPos+1][xPos+i][0] != color) {
                        movementOptions.push("#" + (yPos + 1) + (xPos + i));
                    }
                }
            }
        }
    }

    function blockOptions() {
        movementOptions = [];
        for (let i = 0; i < pieces.length; i++) {
            for (let j = 0; j < pieces[i].length; j++) {
                if (pieces[i][j][0] == "e") {
                    movementOptions.push("#" + i + j);
                }
            }
        }
        setOptions();
    }

    function promotionOptions() {
        movementOptions = [];
        for (let i = 0; i < pieces[0].length; i++) {
            if (pieces[0][i][1] == "P") {
                movementOptions.push("#" + 0 + i);
            }
        }
        setOptions();
    }

    // Rook movement options
    function rookOptions() {
        for (let i = yPos - 1; i >= 0; i--) {
            if (pieces[i][xPos][0] != "e" && pieces[i][xPos][0] == color) {
                break;
            } else {
                movementOptions.push("#" + i + xPos);
                if (pieces[i][xPos][0] != "e" && pieces[i][xPos][0] != color) {
                    break;
                }
            }
        }
        for (let i = yPos + 1; i < 8; i++) {
            if (pieces[i][xPos][0] != "e" && pieces[i][xPos][0] == color) {
                break;
            } else {
                movementOptions.push("#" + i + xPos);
                if (pieces[i][xPos][0] != "e" && pieces[i][xPos][0] != color) {
                    break;
                }
            }
        }

        for (let i = xPos - 1; i >= 0; i--) {
            if (pieces[yPos][i][0] != "e" && pieces[yPos][i][0] == color) {
                break;
            } else {
                movementOptions.push("#" + yPos + i);
                if (pieces[yPos][i][0] != "e" && pieces[yPos][i][0] != color) {
                    break;
                }
            }
        }
        for (let i = xPos + 1; i < 8; i++) {
            if (pieces[yPos][i][0] != "e" && pieces[yPos][i][0] == color) {
                break;
            } else {
                movementOptions.push("#" + yPos + i);
                if (pieces[yPos][i][0] != "e" && pieces[yPos][i][0] != color) {
                    break;
                }
            }
        }
    }


    // Knight movement options
    function knightOptions() {
        if (xPos - 2 >= 0) {
            if (yPos - 1 >= 0) {
                if (pieces[yPos-1][xPos-2][0] != color) {
                    movementOptions.push("#" + (yPos-1)+(xPos-2));
                }
            }
            if (yPos + 1 < pieces.length) {
                if (pieces[yPos+1][xPos-2][0] != color) {
                    movementOptions.push("#" + (yPos+1)+(xPos-2));
                }
            }
        }
        if (xPos + 2 < pieces.length) {
            if (yPos - 1 >= 0) {
                if (pieces[yPos-1][xPos+2][0] != color) {
                    movementOptions.push("#" + (yPos-1)+(xPos+2));
                }
            }
            if (yPos + 1 < pieces.length) {
                if (pieces[yPos+1][xPos+2][0] != color) {
                    movementOptions.push("#" + (yPos+1)+(xPos+2));
                }
            }
        }

        if (yPos - 2 >= 0) {
            if (xPos - 1 >= 0) {
                if (pieces[yPos-2][xPos-1][0] != color) {
                    movementOptions.push("#" + (yPos-2)+(xPos-1));
                }
            }
            if (xPos + 1 < pieces.length) {
                if (pieces[yPos-2][xPos+1][0] != color) {
                    movementOptions.push("#" + (yPos-2)+(xPos+1));
                }
            }
        }
        if (yPos + 2 < pieces.length) {
            if (xPos - 1 >= 0) {
                if (pieces[yPos+2][xPos-1][0] != color) {
                    movementOptions.push("#" + (yPos+2)+(xPos-1));
                }
            }
            if (xPos + 1 < pieces.length) {
                if (pieces[yPos+2][xPos+1][0] != color) {
                    movementOptions.push("#" + (yPos+2)+(xPos+1));
                }
            }
        }
    }

    // Bishop movement options
    function bishopOptions() {
        for (let i = 1; i < pieces.length; i++) {
            if ((yPos + i) >= pieces.length || (yPos + i) < 0 || (xPos + i) >= pieces.length || (xPos + i) < 0) { break; }
            if (pieces[yPos + i][xPos + i][0] == color) { break; }
            movementOptions.push("#" + (yPos + i) + (xPos + i))
            if (pieces[yPos + i][xPos + i][0] != "e") { break; }
        }
        for (let i = -1; Math.abs(i) < pieces.length; i--) {
            if ((yPos + i) >= pieces.length || (yPos + i) < 0 || (xPos + i) >= pieces.length || (xPos + i) < 0) { break; }
            if (pieces[yPos + i][xPos + i][0] == color) { break; }
            movementOptions.push("#" + (yPos + i) + (xPos + i))
            if (pieces[yPos + i][xPos + i][0] != "e") { break; }
        }
        for (let i = -1; Math.abs(i) < pieces.length; i--) {
            if ((yPos + Math.abs(i)) >= pieces.length || (yPos + Math.abs(i)) < 0 || (xPos + i) >= pieces.length || (xPos + i) < 0) { break; }
            if (pieces[yPos + Math.abs(i)][xPos + i][0] == color) { break; }
            movementOptions.push("#" + (yPos + Math.abs(i)) + (xPos + i))
            if (pieces[yPos + Math.abs(i)][xPos + i][0] != "e") { break; }
        }
        for (let i = -1; Math.abs(i) < pieces.length; i--) {
            if ((yPos + i) >= pieces.length || (yPos + i) < 0 || (xPos + Math.abs(i)) >= pieces.length || (xPos + Math.abs(i)) < 0) { break; }
            if (pieces[yPos + i][xPos + Math.abs(i)][0] == color) { break; }
            movementOptions.push("#" + (yPos + i) + (xPos + Math.abs(i)))
            if (pieces[yPos + i][xPos + Math.abs(i)][0] != "e") { break; }
        }
    }

    // King movement options
    function kingOptions() {
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (i == 0 && j == 0) { continue; }
                if ((yPos + i) >= 0 && (yPos + i) < pieces.length) {
                    if ((xPos + j) >= 0 && (xPos + j) < pieces[yPos + i].length) {
                        if (pieces[yPos + i][xPos + j][0] != color) {
                            movementOptions.push("#" + (yPos + i) + (xPos + j));
                        }
                    }
                }
            }
        }
    }



    function debug() {
        console.log("X:\t" + xPos + "\nY:\t" + yPos);
        if ((xPos >= 0) && (xPos < pieces.length) && (yPos >= 0) && (yPos < pieces.length)) { console.log("Selected piece:\t" + pieces[yPos][xPos]); }
        console.log(selected_card);
        console.log(movementOptions);
        console.log(deck);
    }
});