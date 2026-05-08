import { ApiProperty } from "@nestjs/swagger";

export class AuthResponseDto {
    @ApiProperty()
    access_token: string;
}