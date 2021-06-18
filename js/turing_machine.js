function TuringMachine(tapeBlockId) {
    this.tapeBlock = document.getElementById(tapeBlockId)
    
    let machine = this
    window.addEventListener('resize', function(e) { machine.Resize() }, true);

    this.tape = new Tape()
    this.position = 0
    this.InitTape()
}

TuringMachine.prototype.MakeTapeCell = function() {
    let cell = document.createElement('div')
    cell.className = 'tape-cell'
    cell.style.height = CELL_SIZE + 'px'
    cell.style.width = CELL_SIZE + 'px'
    this.tapeBlock.appendChild(cell)
    return cell
}

TuringMachine.prototype.MakeInput = function(index) {
    let machine = this
    let input = document.createElement("input")
    input.type = "text"
    input.className = "tape-cell-input"
    input.id = 'tape-cell-' + index
    input.value = ""
    input.placeholder = LAMBDA
    input.style.width = CELL_SIZE + 'px'
    input.style.height = CELL_SIZE + 'px'
    input.maxLength = 1
    input.onkeyup = function() { machine.tape.Set(index, input.value) }
    input.onkeydown = function(e) { machine.MoveCursor(e, index) }

    let cell = this.MakeTapeCell()
    cell.appendChild(input)
}

TuringMachine.prototype.InitMoveTapeButton = function(btn, text, dir) {
    let machine = this

    btn.innerHTML = text
    btn.classList.add('tape-cell-btn')
    btn.onclick = function() { machine.MoveTape(dir) }
}

TuringMachine.prototype.InitTape = function() {
    let tapeSize = Math.floor(this.tapeBlock.offsetWidth / (CELL_SIZE + 1)) - 2
    this.tape.Resize(tapeSize)

    this.InitMoveTapeButton(this.MakeTapeCell(), '‹', -1)
    
    for (let i = 0; i < tapeSize; i++)
        this.MakeInput(i)

    this.InitMoveTapeButton(this.MakeTapeCell(), '›', 1)
    this.tape.ToCells(this.position)
}

TuringMachine.prototype.MoveTape = function(dir) {
    if (dir > 0) {
        this.tape.Left()
    }
    else {
        this.tape.Right()
    }

    this.tape.ToCells(this.position)
}

TuringMachine.prototype.Resize = function() {
    while (this.tapeBlock.firstChild) {
        this.tapeBlock.firstChild.remove()
    }

    this.InitTape()
}

TuringMachine.prototype.MoveCursor = function(e, index) {
    if (e.key == "ArrowLeft" && index > 0) {
        index--
    }
    else if (e.key == "ArrowRight" && index < this.tape.size - 1) {
        index++
    }
    else if (e.key == "Home") {
        index = 0
    }
    else if (e.key == "End") {
        index = this.tape.size - 1
    }

    document.getElementById('tape-cell-' + index).focus()
}