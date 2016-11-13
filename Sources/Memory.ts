interface RegisterFile
{
    read(registerNumber: number): number;

    write(registerNumber: number, value: number);

    getRegisterCount():number;

    print()

    abiNames: string[];
}