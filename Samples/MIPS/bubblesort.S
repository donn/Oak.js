main:
addiu $s0, $zero, array
addiu $t0, $s0, 40

loop1:
beq $s0, $t0, exit1
lb $a0, 0($s0)
addiu $v0, $zero, 1
syscall
addiu $s0, $s0, 4
j loop1

exit1:
addiu $a0, $zero, array
addiu $a1, $zero, 10
jal bubblesort

addiu $s0, $zero, array
addiu $t0, $s0, 40

loop2:
beq $s0, $t0, exit2
lb $a0, 0($s0)
addiu $v0, $zero, 1
syscall
addiu $s0, $s0, 4
j loop2

exit2:
addiu $v0, $zero, 10
syscall

bubblesort:
slt $at, $zero, $a1
beq $at, $zero, return
addiu $v0, $zero, 11

addiu $s0, $zero, 0

addiu $t2, $a1, -1 #length - 1
bsloop:
beq $s0, $t2, bsexit

sll $t1, $s0, 2
addu $t0, $a0, $t1
lb $s1, 0($t0)
addiu $t0, $t0, 4
lb $s2, 0($t0)

slt $at, $s2, $s1
beq $at, $zero, endif
add $t1, $s2, $zero
add $s2, $s1, $zero
add $s1, $t1, $zero

sll $t1, $s0, 2
addu $t0, $a0, $t1
sb $s1, 0($t0)
addiu $t0, $t0, 4
sb $s2, 0($t0)
endif:

addiu $s0, $s0, 1
j bsloop

bsexit:
addiu $sp, $sp, -8
sw $ra, 0($sp)
sw $a1, 4($sp)
addiu $a1, $a1, -1
jal bubblesort
lw $a1, 4($sp)
lw $ra, 0($sp)
addiu $sp, $sp, 8

return:
jr $ra

.data
array: .word 9, 5, 17, 6, 8, 2, 4, 39, 18, 3