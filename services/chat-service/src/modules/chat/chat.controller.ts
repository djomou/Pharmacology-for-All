import { Controller, Post, Get, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChatService }    from './chat.service';
import { ChatMessageDto } from './dto/chat.dto';

@ApiTags('MedocAssistant — IA')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Envoyer un message à MedocAssistant' })
  chat(@Body() dto: ChatMessageDto) {
    return this.chatService.chat(dto);
  }

  @Get('health')
  @ApiOperation({ summary: 'Vérifier la disponibilité de l\'IA' })
  health() { return this.chatService.checkOllamaHealth(); }

  @Get('history/:userId')
  @ApiOperation({ summary: 'Historique des conversations' })
  history(@Param('userId', ParseIntPipe) userId: number) {
    return this.chatService.getConversationHistory(userId);
  }

  @Delete('history/:userId')
  @ApiOperation({ summary: 'Effacer l\'historique' })
  clear(@Param('userId', ParseIntPipe) userId: number) {
    return this.chatService.clearHistory(userId);
  }
}
