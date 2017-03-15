interface RegisterFile
{
    read(registerNumber: number): number;

    write(registerNumber: number, value: number);

    getRegisterCount():number;

    getModifiedRegisters():boolean[];

    print()

    abiNames: string[];
}