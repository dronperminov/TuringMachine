function IncrementExample(machine, n) {
    let alphabet = "0123456789abcdef"

    machine.InitStates()
    machine.SetAlphabet(alphabet.substr(0, n))
    machine.SetInputWord("1011")
    machine.AddState("q0")
    machine.AddState("q1")
    machine.AddState("q2")

    for (let i = 0; i < n; i++) {
        machine.SetState("q0", alphabet[i], alphabet[i], RIGHT, "q0")
        machine.SetState("q2", alphabet[i], alphabet[i], LEFT, "q2")

        if (i < n - 1) {
            machine.SetState("q1", alphabet[i], alphabet[i + 1], NONE, "q2")
        }
        else {
            machine.SetState("q1", alphabet[i], "0", LEFT, "q1")
        }
    }

    machine.SetState("q0", LAMBDA, LAMBDA, LEFT, "q1")
    machine.SetState("q1", LAMBDA, "1", NONE, STOP)
    machine.SetState("q2", LAMBDA, LAMBDA, RIGHT, STOP)
}

function InverseExample(machine) {
    machine.InitStates()
    machine.SetAlphabet("ab")
    machine.SetInputWord("abaabbaaabbb")
    machine.AddState("q0")

    machine.SetState("q0", "a", "b", RIGHT, "q0")
    machine.SetState("q0", "b", "a", RIGHT, "q0")
    machine.SetState("q0", LAMBDA, LAMBDA, NONE, STOP)
}

function RemoveLetterExample(machine) {
    machine.InitStates()
    machine.SetAlphabet("abc#")
    machine.SetInputWord("abacabaab")

    machine.AddState("q0")
    machine.AddState("q1")
    machine.AddState("q2")
    machine.AddState("q3")
    machine.AddState("q4")

    machine.SetState("q0", "a", "a", RIGHT, "q0")
    machine.SetState("q0", "b", "b", RIGHT, "q0")
    machine.SetState("q0", "c", "c", RIGHT, "q0")
    machine.SetState("q0", LAMBDA, "#", LEFT, "q1")

    machine.SetState("q1", "a", "a", LEFT, "q1")
    machine.SetState("q1", "b", "b", LEFT, "q1")
    machine.SetState("q1", "c", "c", LEFT, "q1")
    machine.SetState("q1", "#", "#", LEFT, "q1")
    machine.SetState("q1", LAMBDA, LAMBDA, RIGHT, "q2")

    machine.SetState("q2", "a", LAMBDA, RIGHT, "q2")
    machine.SetState("q2", "b", LAMBDA, RIGHT, "q3")
    machine.SetState("q2", "c", LAMBDA, RIGHT, "q4")
    machine.SetState("q2", "#", LAMBDA, RIGHT, STOP)
    machine.SetState("q2", LAMBDA, LAMBDA, RIGHT, STOP)

    machine.SetState("q3", "a", "a", RIGHT, "q3")
    machine.SetState("q3", "b", "b", RIGHT, "q3")
    machine.SetState("q3", "c", "c", RIGHT, "q3")
    machine.SetState("q3", "#", "#", RIGHT, "q3")
    machine.SetState("q3", LAMBDA, "b", LEFT, "q1")

    machine.SetState("q4", "a", "a", RIGHT, "q4")
    machine.SetState("q4", "b", "b", RIGHT, "q4")
    machine.SetState("q4", "c", "c", RIGHT, "q4")
    machine.SetState("q4", "#", "#", RIGHT, "q4")
    machine.SetState("q4", LAMBDA, "c", LEFT, "q1")
}
