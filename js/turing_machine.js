function TuringMachine(tapeBlockId, alphabetId, inputWordId, initStateBoxId, statesBlockId, infoBlockId) {
    this.tapeBlock = document.getElementById(tapeBlockId)
    this.alphabetBox = document.getElementById(alphabetId)
    this.inputWordBox = document.getElementById(inputWordId)
    this.initStateBox = document.getElementById(initStateBoxId)
    this.statesBlock = document.getElementById(statesBlockId)
    this.infoBlock = document.getElementById(infoBlockId)
    
    let machine = this
    window.addEventListener('resize', function(e) { machine.Resize() }, true);

    this.tape = new Tape()
    this.states = {}

    this.InitTape()
    this.InitStates()
    this.Reset()

    this.position = Math.floor(this.tape.size / 2)
    this.tape.ToCells(this.position)
}

TuringMachine.prototype.UpdateInitStateBox = function() {
    let initState = this.initStateBox.value

    while (this.initStateBox.firstChild)
        this.initStateBox.firstChild.remove()

    let states = Object.keys(this.states)

    if (states.length == 0)
        states = ['q0']

    for (let state of states) {
        let option = document.createElement('option')
        option.value = state
        option.innerText = state
        this.initStateBox.appendChild(option)

        if (state == initState)
            option.setAttribute('selected', '')
    }
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
    input.onkeydown = function(e) { machine.StatesKeyDown(input, e) }

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

TuringMachine.prototype.SetAlphabet = function(alphabet) {
    this.alphabetBox.value = alphabet
    this.UpdateAlphabet()
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

TuringMachine.prototype.GetNextName = function() {
    let count = 0
    let state = `q${count}`

    while (state in this.states) {
        count++
        state = `q${count}`
    }

    return state
}

TuringMachine.prototype.AddState = function(state = null) {
    if (state == null)
        state = this.GetNextName()

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

    this.ValidateAllCells()
    this.UpdateInitStateBox()
}

TuringMachine.prototype.ValidateAllCells = function() {
    this.ClearStateSelection()

    let isValid = true

    for (let state of Object.keys(this.states))
        for (let char of Object.keys(this.states[state]))
            isValid &= this.ValidateStateCell(document.getElementById('states-cell-' + state + '-' + char))

    return isValid
}

TuringMachine.prototype.RemoveState = function(state) {
    delete this.states[state]
    this.statesBlock.removeChild(document.getElementById('row-' + state))
    this.ValidateAllCells()
    this.UpdateInitStateBox()
}

TuringMachine.prototype.RemoveAllStates = function() {
    for (let state of Object.keys(this.states)) {
        this.statesBlock.removeChild(document.getElementById('row-' + state))
    }

    this.states = {}
    this.UpdateInitStateBox()
}

TuringMachine.prototype.RenameState = function(prevState, newState) {
    let input = document.getElementById('states-cell-' + prevState)
    input.parentNode.classList.remove('states-error')
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
    this.UpdateInitStateBox()
}

TuringMachine.prototype.StateToString = function(state, char, nextChar, action, nextState) {
    if (state == nextState && char == nextChar)
        return action

    if (char == nextChar && action == NONE && nextState == STOP)
        return STOP

    return nextChar + ' ' + action + ' ' + nextState
}

TuringMachine.prototype.SetState = function(state, char, nextChar, action, nextState) {
    let cell = document.getElementById("states-cell-" + state + "-" + char)
    cell.value = this.StateToString(state, char, nextChar, action, nextState)
    this.ValidateStateCell(cell)
}

TuringMachine.prototype.ValidateStateName = function(input) {
    if (input.value in this.states) {
        input.parentNode.classList.add('states-error')
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
        input.parentNode.classList.remove('states-error')
        this.states[state][char] = this.ParseState(input.value, state, char)
        return true
    }

    input.parentNode.classList.add('states-error')
    input.focus()
    return false
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

TuringMachine.prototype.GetStateNames = function() {
    let states = []

    for (let i = 1; i < this.statesBlock.children.length; i++) {
        let id = this.statesBlock.children[i].id
        states.push(id.split('-')[1])
    }

    return states
}

TuringMachine.prototype.StatesKeyDown = function(input, e) {
    let args = input.id.split('-')

    let states = this.GetStateNames()
    let rowIndex = states.indexOf(args[2])
    let charIndex = this.alphabet.indexOf(args[3])

    if (e.key == 'ArrowUp') {
        rowIndex--
    }
    else if (e.key == 'ArrowDown') {
        rowIndex++
    }
    else if (e.key == 'ArrowLeft' && input.selectionStart == 0) {
        charIndex--
        e.preventDefault()
    }
    else if (e.key == 'ArrowRight' && input.selectionStart == input.value.length) {
        charIndex++
        e.preventDefault()
    }

    args[2] = states[(rowIndex + states.length) % states.length]
    args[3] = this.alphabet[(charIndex + this.alphabet.length) % this.alphabet.length]

    let cell = document.getElementById(args.join("-"))
    cell.focus()
}

TuringMachine.prototype.UpdatePosition = function(index) {
    this.position = index;
    this.tape.ToCells(this.position)
}

TuringMachine.prototype.Reset = function() {
    this.state = null
    this.iterations = 0
    this.infoBlock.innerHTML = ''
    this.ClearStateSelection()
}

TuringMachine.prototype.Run = function() {
    this.Reset()

    if (this.state == null)
        this.state = this.initStateBox.value

    if (!this.ValidateAllCells()) {
        alert("Обнаружены неверно заданные состояния. Пожалуйста, исправьте их")
        return
    }

    if (!(this.state in this.states)) {
        alert("Состояние " + this.state + " не обнаружено!")
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

TuringMachine.prototype.ClearStateSelection = function() {
    for (let state of Object.keys(this.states)) {
        for (let char of Object.keys(this.states[state])) {
            let cell = document.getElementById('states-cell-' + state + '-' + char)
            cell.parentNode.classList.remove("states-curr")
        }
    }
}

TuringMachine.prototype.SetCurrStateCell = function(state, char) {
    this.ClearStateSelection()
    let cell = document.getElementById("states-cell-" + state + "-" + char)
    cell.parentNode.classList.add("states-curr")
}

TuringMachine.prototype.Step = function(showLog = true) {
    if (this.state != STOP && this.state != null && !(this.state in this.states)) {
        alert("Состояние " + this.state + " не обнаружено!")
        return
    }

    if (showLog && (this.state == STOP || this.state == null || this.iterations == MAX_ITERATIONS)) {
        this.Reset()

        if (this.state == null)
            this.state = this.initStateBox.value
    }

    this.iterations++

    let state = this.state
    let char = this.tape.Get(this.position)
    let value = this.states[this.state][char]

    this.SetCurrStateCell(state, char)

    this.tape.Set(this.position, value[0])

    if (value[1] == LEFT) {
        this.position--
    }
    else if (value[1] == RIGHT) {
        this.position++
    }

    this.state = value[2]
    this.tape.ToCells(this.position)

    if (this.position < 0) {
        this.MoveTape(1)
    }
    else if (this.position >= this.tape.size) {
        this.MoveTape(-1)
    }

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

    let log = "Шаг " + this.iterations + ":" + prev + "→" + next

    if (this.state == STOP) {
        if (action != "")
            action += ", "

        log += "(" + action + "достигнуто терминальное состояние)<br>"
    }
    else {
        if (action != "")
            action = "(" + action + ")"

        log += action + "<br>"
    }

    this.infoBlock.innerHTML = log + this.infoBlock.innerHTML
}

TuringMachine.prototype.ClearTape = function() {
    this.tape.Clear()
    this.tape.ToCells(this.position)
}

TuringMachine.prototype.SetInputWord = function(word) {
    this.inputWordBox.value = word
    this.ClearTape()
    this.WordToTape()
}

TuringMachine.prototype.WordToTape = function() {
    let word = this.inputWordBox.value

    for (let i = 0; i < word.length; i++)
        if (this.alphabet.indexOf(word[i]) > -1)
            this.tape.Set(this.position + i, word[i])

    while (this.position > 0 && this.position + word.length > this.tape.size)
        this.MoveTape(-1)

    this.tape.ToCells(this.position)
}

TuringMachine.prototype.Save = function() {
    let machine = {}
    machine['alphabet'] = this.alphabet.filter((char) => char != LAMBDA)
    machine['states'] = {}
    machine['word'] = this.tape.GetWord(this.position)

    for (let state of Object.keys(this.states)) {
        machine['states'][state] = {}

        for (let char of Object.keys(this.states[state])) {
            let value = this.states[state][char]
            let nextChar = value[0]
            let action = value[1]
            let nextState = value[2]

            machine['states'][state][char] = this.StateToString(state, char, nextChar, action, nextState)
        }
    }

    let link = document.createElement("a")
    link.href = URL.createObjectURL(new Blob([JSON.stringify(machine, null, 4)], { type: 'json' }))
    link.download = 'machine.turing'
    link.click()
}

TuringMachine.prototype.Load = function() {
    let input = document.createElement('input')
    input.type = 'file'
    input.accept = '.turing,.txt'
    input.onchange = () => this.LoadFromFile(input.files[0])
    input.click()
}

TuringMachine.prototype.LoadFromFile = function(file) {
    if (file.name.endsWith('.turing')) {
        let fr = new FileReader()
        fr.onload = (e) => this.LoadJson(JSON.parse(e.target.result))
        fr.readAsText(file)
        return
    }

    if (file.name.endsWith('.txt')) {
        let fr = new FileReader()
        fr.onload = (e) => this.LoadTxt(e.target.result)
        fr.readAsText(file)
        return
    }

    alert("Необходимо выбрать .turing или .txt файл с машиной Тьюринга...")
}

TuringMachine.prototype.LoadJson = function(machine) {
    try {
        if (!('alphabet' in machine))
            throw "Некорректный входной файл: отсутствует алфавит"

        if (!('states' in machine))
            throw "Некорректный входной файл: отсутствуют состояния"

        let alphabet = machine['alphabet']
        let states = machine['states']

        this.RemoveAllStates()
        this.SetAlphabet(alphabet.join(''))

        for (let state of Object.keys(states)) {
            this.AddState(state)

            for (let char of Object.keys(states[state])) {
                let value = this.ParseState(states[state][char], state, char)
                this.SetState(state, char, value[0], value[1], value[2])
            }
        }

        if ('word' in machine) {
            this.ClearTape()
            this.SetInputWord(machine['word'])
        }

        this.Reset()
    }
    catch (error) {
        alert(error)
    }
}

TuringMachine.prototype.LoadTxt = function(txt) {
    let lines = txt.split(/\n+/gi)

    try {
        this.RemoveAllStates()

        let alphabet = lines.shift().replace(/^\s+/gi, '').split(/\s+/gi)

        this.SetAlphabet(alphabet.filter((char) => char != LAMBDA).join(''))

        for (let line of lines) {
            let args = line.split(/\s+/gi)
            let state = args.shift()

            this.AddState(state)

            for (let i = 0; i < args.length; i++) {
                let char = alphabet[i]
                let arg = args[i]

                if (arg.endsWith(','))
                    arg += state

                if (arg.startsWith(','))
                    arg = char + args[i]

                let value = this.ParseState(arg, state, char)
                this.SetState(state, char, value[0], value[1], value[2])
            }
        }

        this.Reset()
    }
    catch (error) {
        alert(error)
    }
}