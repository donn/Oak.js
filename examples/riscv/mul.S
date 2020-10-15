lui s0, 0xFFFFF
addi s0, x0, 0xFFF
li s1, 0x2
li a0, 1
mv a1, s0
scall

mul s2, s1, s0

li a0, 1
mv a1, s2
scall

li a0, 10
scall