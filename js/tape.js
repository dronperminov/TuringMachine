function Tape(size = 1) {
    this.size = size
    this.chars = {}
    this.start = 0
}

Tape.prototype.Set = function(index, char) {
    if (char == '')
        char = LAMBDA

    this.chars[this.start + index] = char
}

Tape.prototype.Get = function(index, defaultValue = LAMBDA) {
    let key = this.start + index

    return key in this.chars ? this.chars[key] : defaultValue
}

Tape.prototype.Init = function(word) {
    this.chars = {}

    for (let i = 0; i < word.length; i++) {
        this.chars[this.start + i] = word[i]
    }
}

Tape.prototype.Left = function() {
    this.start--
}

Tape.prototype.Right = function() {
    this.start++
}

Tape.prototype.Resize = function(size) {
    this.size = size
}

Tape.prototype.ToString = function() {
    let word = ""

    for (let i = 0; i < this.size; i++)
        word += this.Get(i)

    return word
}

Tape.prototype.Clear = function() {
    for (let key of Object.keys(this.chars))
        this.chars[key] = LAMBDA
}

Tape.prototype.GetWord = function(start) {
    let word = []

    for (let i = start; this.Get(i) != LAMBDA; i++)
        word.push(this.Get(i))

    return word.join('')
}

Tape.prototype.ToCells = function(position) {
    for (let i = 0; i < this.size; i++) {
        let cell = document.getElementById('tape-cell-' + i)
        cell.value = this.Get(i)

        if (cell.value == LAMBDA)
            cell.value = ''

        if (i == position) {
            cell.parentElement.classList.add('tape-cell-curr')
        }
        else {
            cell.parentElement.classList.remove('tape-cell-curr')
        }
    }
}