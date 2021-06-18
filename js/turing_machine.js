function TuringMachine(tapeBlockId, alphabetId, statesBlockId) {
    this.tapeBlock = document.getElementById(tapeBlockId)
    this.alphabetBox = document.getElementById(alphabetId)
    this.statesBlock = document.getElementById(statesBlockId)
    
    let machine = this
    window.addEventListener('resize', function(e) { machine.Resize() }, true);
    this.alphabetBox.onkeyup = function() {machine.InitStates() }

    this.tape = new Tape()
    this.InitTape()
    this.InitStates()
    this.position = Math.floor(this.tape.size / 2)
    this.tape.ToCells(this.position)
}

TuringMachine.prototype.MakeTapeCell = function() {
    let cell = document.createElement('div')
    cell.className = 'tape-cell'
    cell.style.height = CELL_SIZE + 'px'
    cell.style.width = CELL_SIZE + 'px'
    this.tapeBlock.appendChild(cell)
    return cell
}

TuringMachine.prototype.MakeStatesRow = function() {
    let row = document.createElement("div")
    row.className = "states-row"
    this.statesBlock.appendChild(row)
    return row
}

TuringMachine.prototype.MakeStateCell = function(row, text = "") {
    let cell = document.createElement("div")
    cell.className = "states-cell"
    cell.innerHTML = text

    row.appendChild(cell)
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
    input.onkeydown = function(e) { machine.TapeKeyDown(index, e) }

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
}

TuringMachine.prototype.GetAlphabet = function() {
    let alphabet = new Set(this.alphabetBox.value)
    let alphabetArray = Array.from(alphabet)

    this.alphabetBox.value = alphabetArray.join("")
    return alphabetArray.concat(LAMBDA)
}

TuringMachine.prototype.InitStates = function() {

    while (this.statesBlock.firstChild) {
        this.statesBlock.firstChild.remove()
    }

    let header = this.MakeStatesRow()
    let headerNames = ["Состояние"].concat(this.GetAlphabet())

    for (let i = 0; i < headerNames.length; i++) {
        let cell = this.MakeStateCell(header, headerNames[i])

        if (i == 0) {
            let addBtn = document.createElement("div")
            addBtn.className = 'states-btn'
            addBtn.innerHTML = "+"
            cell.appendChild(addBtn)
        }
    }
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
    this.tape.ToCells(this.position)
}

TuringMachine.prototype.TapeKeyDown = function(index, e) {
    if (e.key == "ArrowLeft") {
        index--
    }
    else if (e.key == "ArrowRight") {
        index++
    }
    else if (e.key == "Home") {
        index = 0
    }
    else if (e.key == "End") {
        index = this.tape.size - 1
    }
    else if (e.key.length == 1) {
        let alphabet = this.GetAlphabet()

        if (alphabet.indexOf(e.key) == -1) {
            e.preventDefault()
            return
        }
    }

    if (index > this.tape.size - 1) {
        index--
        this.tape.Right()
        this.tape.ToCells(this.position)
    }
    else if (index < 0) {
        index++
        this.tape.Left()
        this.tape.ToCells(this.position)
    }

    document.getElementById('tape-cell-' + index).focus()
}