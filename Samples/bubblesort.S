la s0, array
addi t0, s0, 40

loop1:
beq s0, t0, exit1
lb a0, 0(s0)
li a7, 1
scall
addi s0, s0, 4
jal x0, loop1

exit1:

la a0, array
li a1, 10
jal ra, bubblesort

la s0, array
addi t0, s0, 40

loop2:
beq s0, t0, exit2
lb a0, 0(s0)
li a7, 1
scall
addi s0, s0, 4
jal x0, loop2

exit2:
li a7, 10
scall

bubblesort:
blt a1, zero, return
beq a1, zero, return

li s0, 0

addi t2, a1, -1 #length - 1
bsloop:
beq s0, t2, bsexit

slli t1, s0, 2
add t0, a0, t1
lb s1, 0(t0)
addi t0, t0, 4
lb s2, 0(t0)

blt s1, s2, endif
beq s1, s2, endif
mv t1, s2
mv s2, s1
mv s1, t1

slli t1, s0, 2
add t0, a0, t1
sb s1, 0(t0)
addi t0, t0, 4
sb s2, 0(t0)
endif:

addi s0, s0, 1
jal x0, bsloop

bsexit:
addi sp, sp, -8
sw ra, 0(sp)
sw a1, 4(sp)
addi a1, a1, -1
jal ra, bubblesort
lw a1, 4(sp)
lw ra, 0(sp)
addi sp, sp, 8

return:
jalr x0, ra, 0

.data
array: .word 9, 5, 17, 6, 8, 2, 4, 39, 18, 3