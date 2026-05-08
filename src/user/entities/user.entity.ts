import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
export class UserEntity {

    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    username: string;

    @ApiProperty()
    email: string;

    @Exclude()
    password: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty({ required: false, nullable: true })
    deletedAt: Date | null;

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }
}