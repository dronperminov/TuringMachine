function TuringMachine(tapeBlockId, alphabetId, statesBlockId, infoBlockId) {
    this.tapeBlock = document.getElementById(tapeBlockId)
    this.alphabetBox = document.getElementById(alphabetId)
    this.statesBlock = document.getElementById(statesBlockId)
    this.infoBlock = document.getElementById(infoBlockId)
    
    let machine = this
    window.addEventListener('resize', function(e) { machine.Resize() }, true);
    this.alphabetBox.onkeyup = function() { machine.UpdateAlphabet() }

    this.tape = new Tape()
    this.states = {}

    this.InitTape()
    this.InitStates()
    this.Reset()

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

TuringMachine.prototype.MakeStatesRow = function(id) {
    let row = document.createElement("div")
    row.className = "states-row"
    row.id = id
    this.statesBlock.appendChild(row)
    return row
}

TuringMachine.prototype.MakeStateCell = function(row, text = "", index = -1) {
    let cell = document.createElement("div")
    cell.className = "states-cell"
    cell.innerHTML = text

    if (index == -1) {
        row.appendChild(cell)
    }
    else {
        row.insertBefore(cell, row.children[index + 1])
    }

    return cell
}

TuringMachine.prototype.MakeTapeInput = function(index) {
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
    input.ondblclick = function(e) { machine.UpdatePosition(index) }

    let cell = this.MakeTapeCell()
    cell.appendChild(input)
}

TuringMachine.prototype.MakeStatesInput = function(cell, state, char) {
    let machine = this
    let input = document.createElement("input")
    input.type = "text"
    input.className = "states-cell-input"
    input.id = 'states-cell-' + state + '-' + char
    input.value = ""
    input.placeholder = 'N'
    input.onchange = function() { machine.ValidateStateCell(input) }

    cell.appendChild(input)
}

TuringMachine.prototype.MakeStatesNameInput = function(cell, state) {
    let machine = this
    let input = document.createElement("input")
    input.type = "text"
    input.className = "states-cell-input"
    input.classList.add("states-cell-name-input")
    input.id = 'states-cell-' + state
    input.value = state
    input.onchange = function() { machine.ValidateStateName(input) }

    cell.appendChild(input)
    return input
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
        this.MakeTapeInput(i)

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

    let machine = this
    let header = this.MakeStatesRow("row-header")
    let alphabet = this.GetAlphabet()
    let headerNames = ["Состояние"].concat(alphabet)

    for (let i = 0; i < headerNames.length; i++) {
        let cell = this.MakeStateCell(header, headerNames[i])

        if (i == 0) {
            let addBtn = document.createElement("div")
            addBtn.className = 'states-btn'
            addBtn.innerHTML = "+"
            addBtn.onclick = function() { machine.AddState() }
            cell.appendChild(addBtn)
        }
        else {
            cell.id = "states-header-" + headerNames[i]
        }
    }

    this.states = {}
    this.alphabet = alphabet
}

TuringMachine.prototype.RemoveCharFromStates = function(char) {
    for (let state of Object.keys(this.states)) {
        delete this.states[state][char]
        let row = document.getElementById("row-" + state)
        let cell = document.getElementById("states-cell-" + state + "-" + char).parentNode
        row.removeChild(cell)
    }

    let header = document.getElementById("row-header")
    let cell = document.getElementById("states-header-" + char)
    header.removeChild(cell)
}

TuringMachine.prototype.AddCharToStates = function(char, index) {
    for (let state of Object.keys(this.states)) {
        this.states[state][char] = [char, 'N', state]
        let row = document.getElementById("row-" + state)
        let cell = this.MakeStateCell(row, '', index)
        this.MakeStatesInput(cell, state, char)
    }

    let header = document.getElementById("row-header")
    let cell = this.MakeStateCell(header, char, index)
    cell.id = "states-header-" + char
}

TuringMachine.prototype.UpdateAlphabet = function() {
    let alphabet = this.GetAlphabet()

    for (let i = 0; i < this.alphabet.length; i++)
        if (alphabet.indexOf(this.alphabet[i]) == -1)
            this.RemoveCharFromStates(this.alphabet[i])

    for (let i = 0; i < alphabet.length; i++)
        if (this.alphabet.indexOf(alphabet[i]) == -1)
            this.AddCharToStates(alphabet[i], i)

    this.ValidateAllCells()
    this.alphabet = alphabet
}

TuringMachine.prototype.AddState = function(state = null) {
    if (state == null)
        state = "q" + Object.keys(this.states).length

    let alphabet = this.GetAlphabet()
    let row = this.MakeStatesRow("row-" + state)

    this.states[state] = {}
    let stateCell = this.MakeStateCell(row)
    let stateInput = this.MakeStatesNameInput(stateCell, state)

    let removeBtn = document.createElement("div")
    removeBtn.className = 'states-btn'
    removeBtn.innerHTML = "-"
    removeBtn.onclick = function() { machine.RemoveState(stateInput.value) }
    stateCell.appendChild(removeBtn)

    for (let i = 0; i < alphabet.length; i++) {
        this.states[state][alphabet[i]] = [alphabet[i], 'N', state]
        let cell = this.MakeStateCell(row)
        this.MakeStatesInput(cell, state, alphabet[i])
    }
}

TuringMachine.prototype.ValidateAllCells = function() {
    for (let state of Object.keys(this.states))
        for (let char of Object.keys(this.states[state]))
            this.ValidateStateCell(document.getElementById('states-cell-' + state + '-' + char))
}

TuringMachine.prototype.RemoveState = function(state) {
    delete this.states[state]
    this.statesBlock.removeChild(document.getElementById('row-' + state))
    this.ValidateAllCells()
}

TuringMachine.prototype.RenameState = function(prevState, newState) {
    let input = document.getElementById('states-cell-' + prevState)
    input.classList.remove('states-error')
    input.id = 'states-cell-' + newState
    input.value = newState

    let row = document.getElementById("row-" + prevState)
    row.id = "row-" + newState

    for (let char of Object.keys(this.states[prevState])) {
        let cell = document.getElementById('states-cell-' + prevState + '-' + char)
        cell.id = 'states-cell-' + newState + '-' + char
    }

    let states = this.states[prevState]
    delete this.states[prevState]
    this.states[newState] = states
    this.ValidateAllCells()
}

TuringMachine.prototype.SetState = function(state, char, nextChar, action, nextState) {
    let cell = document.getElementById("states-cell-" + state + "-" + char)
    cell.value = nextChar + ' ' + action + ' ' + nextState
    this.ValidateStateCell(cell)
}

TuringMachine.prototype.ValidateStateName = function(input) {
    if (input.value in this.states) {
        input.classList.add('states-error')
        input.focus()
        return
    }

    this.RenameState(input.id.substr(12), input.value)
}

TuringMachine.prototype.IsValidState = function(value) {
    if (['', LEFT, NONE, RIGHT, STOP].indexOf(value) > -1)
        return true

    let values = value.split(/[ ,]+/gi)

    if (values.length != 3)
        return false

    if (values[0] == "")
        values[0] = LAMBDA

    let alphabet = this.GetAlphabet()

    if (alphabet.indexOf(values[0]) == -1)
        return false

    if ([LEFT, NONE, RIGHT].indexOf(values[1]) == -1)
        return false

    if (Object.keys(this.states).indexOf(values[2]) == -1 && values[2] != STOP)
        return false

    return true
}

TuringMachine.prototype.ParseState = function(value, state, char) {
    if (value == '!')
        return [char, NONE, STOP]

    if (value == '')
        return [char, NONE, state]

    let values = value.split(/[ ,]+/gi)

    if (values.length == 1)
        return [char, value, state]

    if (values[0] == "")
        values[0] = LAMBDA

    return values
}

TuringMachine.prototype.ValidateStateCell = function(input) {
    let args = input.id.split('-')
    let state = args[2]
    let char = args[3]

    if (this.IsValidState(input.value)) {
        input.classList.remove('states-error')
        this.states[state][char] = this.ParseState(input.value, state, char)
        return
    }

    input.classList.add('states-error')
    input.focus()
}

TuringMachine.prototype.MoveTape = function(dir) {
    if (dir > 0) {
        this.tape.Left()
        this.position++
    }
    else {
        this.position--
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
        this.MoveTape(-1)
    }
    else if (index < 0) {
        index++
        this.MoveTape(1)
    }

    document.getElementById('tape-cell-' + index).focus()
}

TuringMachine.prototype.UpdatePosition = function(index) {
    this.position = index;
    this.tape.ToCells(this.position)
}

TuringMachine.prototype.Reset = function() {
    this.state = "q0"
    this.iterations = 0
}

TuringMachine.prototype.Run = function() {
    this.Reset()

    if (!(this.state in this.states)) { // TODO
        alert("Состояние q0 не обнаружено!")
        return
    }

    while (this.state != STOP && this.iterations < MAX_ITERATIONS) {
        this.Step(false)
    }

    if (this.iterations == MAX_ITERATIONS) {
        this.infoBlock.innerHTML = "Превышено максимальное число итераций (" + this.iterations + ")"
    }
    else {
        this.infoBlock.innerHTML = "Количество итераций: " + this.iterations
    }
}

TuringMachine.prototype.SetCurrStateCell = function(state, char) {
    for (let state of Object.keys(this.states)) {
        for (let char of Object.keys(this.states[state])) {
            let cell = document.getElementById('states-cell-' + state + '-' + char)
            cell.parentNode.classList.remove("states-curr")
        }
    }

    let cell = document.getElementById("states-cell-" + state + "-" + char)
    cell.parentNode.classList.add("states-curr")
}

TuringMachine.prototype.Step = function(showLog = true) {
    if (showLog && (this.state == STOP || this.iterations == MAX_ITERATIONS)) {
        this.Reset()
        this.infoBlock.innerHTML = ""
    }

    this.iterations++

    let state = this.state
    let char = this.tape.Get(this.position)
    let value = this.states[this.state][char]

    this.SetCurrStateCell(state, char, true)

    this.tape.Set(this.position, value[0])

    if (value[1] == LEFT) {
        this.position--
    }
    else if (value[1] == RIGHT) {
        this.position++
    }

    this.state = value[2]
    this.tape.ToCells(this.position)

    if (!showLog)
        return

    let prev = "〈" + char + ", " + state + "〉"
    let next = "〈" + value[0] + ", " + value[2] + "〉"
    let action = ""

    if (value[1] == LEFT) {
        action = "сдвиг влево"
    }
    else if (value[1] == RIGHT) {
        action = "сдвиг вправо"
    }

    this.infoBlock.innerHTML += "Шаг " + this.iterations + ":" + prev + "→" + next

    if (this.state == STOP) {
        if (action != "")
            action += ", "

        this.infoBlock.innerHTML += "(" + action + "достигнуто терминальное состояние)<br>"
    }
    else {
        if (action != "")
            action = "(" + action + ")"

        this.infoBlock.innerHTML += action + "<br>"
    }
}

TuringMachine.prototype.ClearTape = function() {
    this.tape.Clear()
    this.tape.ToCells(this.position)
}