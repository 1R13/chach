let SVG = "http://www.w3.org/2000/svg"
let xlink = "http://www.w3.org/1999/xlink"

let abc = "ABCDEFGH"
let my_black = "#293133"

class Tile{
    constructor(field, row, col, color) {
        this.color = color
        this.row = row
        this.col = col
        this.id = abc[row] + (col+1).toString()
        this.field = field
        this.dim = this.field.dim/8

        this.occupant = false

        this.rect = document.createElementNS(SVG, 'rect')
        this.rect.setAttribute('x', (this.col*this.dim).toString())
        this.rect.setAttribute('y', (this.row*this.dim).toString())
        this.rect.setAttribute('width', this.dim)
        this.rect.setAttribute('height', this.dim)
        this.setColor()
        this.field.screen.appendChild(this.rect)
        this.rect.addEventListener('click', () => {

            console.log(this.id)

        })
    }
    setColor(){
        if (this.color){
            this.rect.setAttribute('fill', my_black)
        }
        else{
            this.rect.setAttribute('fill', 'white')
        }
    }
    // get center coordinates as vector
    center(){
        return {x: parseInt(this.rect.getAttribute('x'))+this.dim/2, y: parseInt(this.rect.getAttribute('y'))+this.dim/2}
    }
    getRelativ(offset){
        return this.field.tiles[this.field.tiles.indexOf(this)+offset]
    }
}


let move2tile = function (fig, tile){
    return function curried_function(e){
        fig.move(tile.id)
    }
}

class Field{
    constructor(screen) {
        this.screen = screen
        this.dim = screen.height.animVal.value
        this.tiles = []
        this.figures = []
        this._createTiles()
    }

    // create tiles for 8 rows and columns
    _createTiles(){
        let c = false
        for (let i = 0; i<8;i++){
            for (let j = 0; j<8; j++){
                this.tiles.push(new Tile(this, i, j, c))

                c = Boolean(c-1)
            }
            c = Boolean(c-1)
        }
    }


    // find the right tiles in the field
    getTileRC(row, col){
        return this.tiles[row*8+col]
    }

    getTileID(id){
        for (let t of this.tiles){
            if (t.id === id){
                return t
            }
        }
        return false
    }

}

function removeListener(t){
    t.rect.removeEventListener('click', () => {
        this.move(t.id)
        removeListener()
    })
}

class Figure{
    constructor(field, color) {
        this.field = field
        this.field.figures.push(this)
        this.pos = undefined
        this.color = color
        this.class = undefined
    }

    // returns potential movement targets depending on class and pos
    get_movables(){
        let pot_ts = []
        let fact = 0
        let cords = this.cord()
        let ind = this.field.tiles.indexOf(this.pos)

        // movable tiles for each class
        if (this.class == 'pawn_w' || this.class == 'pawn_b'){
            if (this.class == 'pawn_w'){
                fact = -1
            }
            else{
                fact = 1
            }
            if (cords[0]+fact>0&&cords[0]+fact<8){
                if (cords[1]-1>0){
                    if (this.pos.getRelativ(9*fact).occupant != false && this.pos.getRelativ(9*fact).occupant.color != this.color){
                        pot_ts.push(this.pos.getRelativ(9*fact))
                    }
                }
                if (cords[1]+1<8){
                    if (this.pos.getRelativ(7*fact).occupant != false && this.pos.getRelativ(7*fact).occupant.color != this.color){
                        pot_ts.push(this.pos.getRelativ(7*fact))
                    }
                }
                if (! this.pos.getRelativ(8*fact).occupant){
                    pot_ts.push(this.pos.getRelativ(8*fact))
                }
            }

        }

        else if (this.class == 'runner'){
            let offsets = [-9, 9, -7, 7]
            let distance = 0
            for (let o of offsets){

                let tile = this.pos.getRelativ(o)
                distance += 1

                if (! tile.occupant){
                    pot_ts.push(tile)
                }
                else {
                    if (tile.occupant.color != this.color){
                        pot_ts.push(tile)
                    }
                }

            }

        }



        for (let t of pot_ts){
            t.rect.addEventListener('click', move2tile(this, t))
            if (t.occupant){
                t.rect.setAttribute('fill', 'red')
            }
            else {
                t.rect.setAttribute('fill', 'green')
            }
        }



    }
    cord(){
        return [this.pos.row, this.pos.col]
    }

    move(tile_id){
        let tile = this.field.getTileID(tile_id)
        let pos = tile.center()

        if (this.pos){
            if (this.pos.occupant){
                this.pos.occupant = false
            }
        }

        this.svg.setAttribute('cx', pos.x.toString())
        this.svg.setAttribute('cy', pos.y.toString())
        this.pos = tile
        tile.occupant = this
    }


}

class Runner extends Figure{
    constructor(field, color) {
        super(field, color);

        this.class = 'runner'
        this.svg = document.createElementNS(SVG, 'ellipse')

        this.svg.addEventListener('click', () => {
            this.get_movables()
        })
        this.svg.setAttribute('rx', '15')
        this.svg.setAttribute('ry', '30')

        this.svg.setAttribute('cx', '400')
        this.svg.setAttribute('cy', '400')

        this.svg.setAttribute('stroke-width', '7')
        this.svg.setAttribute('stroke', 'black')
        if (this.color){
            this.svg.setAttribute('fill', 'white')
        }
        else {
            this.svg.setAttribute('fill', my_black)
        }

        this.field.screen.appendChild(this.svg)
    }
}

class Pawn extends Figure{
    constructor(field, color) {
        super(field, color);

        this.svg = document.createElementNS(SVG, 'circle')

        this.svg.addEventListener('click', () => {
            this.get_movables()
        })

        this.field.screen.appendChild(this.svg)

        this.svg.setAttribute('cx', '400')
        this.svg.setAttribute('cy', '400')
        this.svg.setAttribute('stroke', 'black')
        this.svg.setAttribute('stroke-width', '7')

        this.svg.setAttribute('r', '15')

        if (this.color){
            this.svg.setAttribute('fill', 'white')
            this.class = 'pawn_w'
        }
        else{
            this.svg.setAttribute('fill', my_black)
            this.class = 'pawn_b'
        }

    }

}
