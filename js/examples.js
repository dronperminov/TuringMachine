function IncrementExample(machine, n) {
    let alphabet = "0123456789abcdef"

    machine.InitStates()
    machine.SetAlphabet(alphabet.substr(0, n))
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
    machine.AddState("q0")

    machine.SetState("q0", "a", "b", RIGHT, "q0")
    machine.SetState("q0", "b", "a", RIGHT, "q0")
    machine.SetState("q0", LAMBDA, LAMBDA, NONE, STOP)
    
}